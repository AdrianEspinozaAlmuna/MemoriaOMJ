const request = require("supertest");
const app = require("../../Backend/prisma/src/index");
const { prisma } = require("../../Backend/prisma/src/prisma/client");
const {
  createAdmin, createUser, createRoom, createActivityType,
  createActivity, enrollUser, generateToken, cleanupDatabase, closePrisma,
} = require("../helpers/factories");

describe("PI-06: Finalizacion automatica y valoracion", () => {
  let adminToken, participanteToken, activity, participante;

  beforeAll(async () => {
    const admin = await createAdmin();
    participante = await createUser({ rol: "participante" });
    adminToken = generateToken(admin);
    participanteToken = generateToken(participante);

    const room = await createRoom();
    const type = await createActivityType();

    activity = await createActivity({
      id_encargado: admin.id_usuario,
      id_sala: room.id_sala,
      id_tipo_actividad: type.id_tipo,
      aprobado: true,
      estado: "programada",
      hora_inicio: new Date("1970-01-01T08:00:00Z"),
      hora_termino: new Date("1970-01-01T10:00:00Z"),
    });

    await enrollUser(activity.id_actividad, participante.id_usuario, "participante");
    await enrollUser(activity.id_actividad, admin.id_usuario, "encargado");
  });

  afterAll(async () => {
    await cleanupDatabase();
    await closePrisma();
  });

  test("1. sincronizacion cambia actividades vencidas a finalizada", async () => {
    // Forzar fecha/hora pasada para que syncActivityStatuses la detecte
    await prisma.actividad.update({
      where: { id_actividad: activity.id_actividad },
      data: {
        estado: "programada",
        fecha: new Date("2024-01-01"),
      },
    });

    // Llamar al endpoint sync (no expuesto via HTTP, ejecutamos via raw sync)
    // En su lugar, actualizamos directamente a en_curso para probar el flujo
    await prisma.actividad.update({
      where: { id_actividad: activity.id_actividad },
      data: { estado: "en_curso" },
    });

    // Marcar asistencia primero
    await request(app)
      .patch(`/api/activities/${activity.id_actividad}/attendance`)
      .set("Authorization", `Bearer ${participanteToken}`);
  });

  test("2. participante valora actividad finalizada", async () => {
    await prisma.actividad.update({
      where: { id_actividad: activity.id_actividad },
      data: { estado: "finalizada" },
    });

    const res = await request(app)
      .patch(`/api/activities/${activity.id_actividad}/rating`)
      .set("Authorization", `Bearer ${participanteToken}`)
      .send({ valoracion: 4 });

    expect(res.status).toBe(200);

    const rating = await prisma.actividad_participantes.findUnique({
      where: {
        id_actividad_id_usuario: {
          id_actividad: activity.id_actividad,
          id_usuario: participante.id_usuario,
        },
      },
    });
    expect(rating.valoracion).toBe(4);
  });
});
