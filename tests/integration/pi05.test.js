const request = require("supertest");
const app = require("../../Backend/prisma/src/index");
const { prisma } = require("../../Backend/prisma/src/prisma/client");
const {
  createAdmin, createUser, createRoom, createActivityType,
  createActivity, enrollUser, generateToken, cleanupDatabase, closePrisma,
} = require("../helpers/factories");

describe("PI-05: Aprobacion de edicion", () => {
  let encargadoToken, adminToken, activity, room, activityType;

  beforeAll(async () => {
    const encargado = await createUser({ rol: "participante" });
    const admin = await createAdmin();
    encargadoToken = generateToken(encargado);
    adminToken = generateToken(admin);

    room = await createRoom();
    activityType = await createActivityType();

    activity = await createActivity({
      id_encargado: encargado.id_usuario,
      id_sala: room.id_sala,
      id_tipo_actividad: activityType.id_tipo,
      titulo: "Original",
      aprobado: true,
      estado: "programada",
    });

    await enrollUser(activity.id_actividad, encargado.id_usuario, "encargado");
  });

  afterAll(async () => {
    await cleanupDatabase();
    await closePrisma();
  });

  test("1. encargado solicita cambios → titulo actualizado + snapshot", async () => {
    const res = await request(app)
      .patch(`/api/activities/${activity.id_actividad}/request-edit`)
      .set("Authorization", `Bearer ${encargadoToken}`)
      .send({
        titulo: "Version editada",
        fecha: "2026-07-20",
        hora_inicio: "10:00",
        hora_termino: "12:00",
        id_sala: room.id_sala,
        id_tipo_actividad: activityType.id_tipo,
        max_participantes: 20,
      });

    expect(res.status).toBe(200);

    const snap = await prisma.actividad.findUnique({
      where: { id_actividad: activity.id_actividad },
      select: { revision_original_data: true, titulo: true },
    });
    expect(snap.revision_original_data).not.toBeNull();
    expect(snap.titulo).toBe("Version editada");
  });

  test("2. admin aprueba cambios → snapshot eliminado, cambios persistidos", async () => {
    const res = await request(app)
      .patch(`/api/activities/${activity.id_actividad}/review`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ action: "approve" });

    expect(res.status).toBe(200);

    const approved = await prisma.actividad.findUnique({
      where: { id_actividad: activity.id_actividad },
    });
    expect(approved.titulo).toBe("Version editada");
    expect(approved.revision_original_data).toBeNull();
  });
});
