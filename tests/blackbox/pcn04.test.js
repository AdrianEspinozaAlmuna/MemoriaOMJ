const request = require("supertest");
const app = require("../../Backend/prisma/src/index");
const {
  createAdmin, createUser, createRoom, createActivityType,
  createActivity, enrollUser, generateToken, cleanupDatabase, closePrisma,
} = require("../helpers/factories");

describe("PCN-04: Restriccion de asistencia fuera de tiempo", () => {
  let token, activity;

  beforeAll(async () => {
    const admin = await createAdmin();
    token = generateToken(admin);

    const room = await createRoom();
    const type = await createActivityType();

    activity = await createActivity({
      id_encargado: admin.id_usuario,
      id_sala: room.id_sala,
      id_tipo_actividad: type.id_tipo,
      aprobado: true,
      estado: "programada", // aun no inicia
    });

    await enrollUser(activity.id_actividad, admin.id_usuario, "encargado");
  });

  afterAll(async () => {
    await cleanupDatabase();
    await closePrisma();
  });

  test("marcar asistencia en actividad programada devuelve error 400", async () => {
    const res = await request(app)
      .patch(`/api/activities/${activity.id_actividad}/attendance`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});
