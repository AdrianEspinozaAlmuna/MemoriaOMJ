const request = require("supertest");
const app = require("../../Backend/prisma/src/index");
const { prisma } = require("../../Backend/prisma/src/prisma/client");
const {
  createAdmin, createUser, createRoom, createActivityType,
  createActivity, enrollUser, generateToken, cleanupDatabase, closePrisma,
} = require("../helpers/factories");

describe("PI-02: Rechazo de edicion con restauracion", () => {
  let encargado, admin, encargadoToken, adminToken, activity, room, activityType;

  beforeAll(async () => {
    encargado = await createUser({ rol: "participante" });
    admin = await createAdmin();
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

  test("1. encargado solicita edicion → snapshot almacenado", async () => {
    const res = await request(app)
      .patch(`/api/activities/${activity.id_actividad}/request-edit`)
      .set("Authorization", `Bearer ${encargadoToken}`)
      .send({
        titulo: "Editado",
        fecha: "2026-07-20",
        hora_inicio: "10:00",
        hora_termino: "12:00",
        id_sala: room.id_sala,
        id_tipo_actividad: activityType.id_tipo,
        max_participantes: 20,
      });

    expect(res.status).toBe(200);

    const updated = await prisma.actividad.findUnique({
      where: { id_actividad: activity.id_actividad },
    });
    expect(updated.revision_original_data).not.toBeNull();
    expect(updated.titulo).toBe("Editado");
  });

  test("1b. se notifica a administradores de la edicion pendiente", async () => {
    const notif = await prisma.notificaciones.findFirst({
      where: { id_actividad: activity.id_actividad, tipo: "actividad" },
      orderBy: { fecha_envio: "desc" },
    });
    expect(notif).not.toBeNull();
    expect(notif.titulo).toMatch(/Edición de actividad pendiente/i);
  });

  test("2. admin rechaza edicion → actividad restaurada", async () => {
    const res = await request(app)
      .patch(`/api/activities/${activity.id_actividad}/review`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ action: "reject" });

    expect(res.status).toBe(200);

    const restored = await prisma.actividad.findUnique({
      where: { id_actividad: activity.id_actividad },
    });
    expect(restored.titulo).toBe("Original");
    expect(restored.revision_original_data).toBeNull();
  });

  test("2b. se notifica al encargado del rechazo", async () => {
    const notif = await prisma.notificaciones.findFirst({
      where: { id_actividad: activity.id_actividad, id_receptor: encargado.id_usuario },
      orderBy: { fecha_envio: "desc" },
    });
    expect(notif).not.toBeNull();
    expect(notif.titulo).toMatch(/rechazada/i);
  });
});
