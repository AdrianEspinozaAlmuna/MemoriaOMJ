const request = require("supertest");
const app = require("../../Backend/prisma/src/index");
const {
  createAdmin, createRoom, createActivityType,
  createActivity, generateToken, cleanupDatabase, closePrisma,
} = require("../helpers/factories");

describe("PCN-07: Modificacion historica", () => {
  let adminToken, room, activityType, activity;

  beforeAll(async () => {
    const admin = await createAdmin();
    adminToken = generateToken(admin);

    room = await createRoom();
    activityType = await createActivityType();

    activity = await createActivity({
      id_encargado: admin.id_usuario,
      id_sala: room.id_sala,
      id_tipo_actividad: activityType.id_tipo,
      aprobado: true,
      estado: "finalizada",
    });
  });

  afterAll(async () => {
    await cleanupDatabase();
    await closePrisma();
  });

  test("editar actividad finalizada devuelve 400", async () => {
    const res = await request(app)
      .patch(`/api/activities/${activity.id_actividad}/request-edit`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        titulo: "Intento de edicion",
        fecha: "2026-08-15",
        hora_inicio: "10:00",
        hora_termino: "12:00",
        id_sala: room.id_sala,
        id_tipo_actividad: activityType.id_tipo,
        max_participantes: 15,
      });

    expect(res.status).toBe(400);
  });
});
