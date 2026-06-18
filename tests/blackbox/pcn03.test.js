const request = require("supertest");
const app = require("../../Backend/prisma/src/index");
const {
  createAdmin, createUser, createRoom, createActivityType,
  createActivity, enrollUser, generateToken, cleanupDatabase, closePrisma,
} = require("../helpers/factories");

describe("PCN-03: Restriccion de cupos maximos", () => {
  let adminToken, participantToken, activity;
  let participant;

  beforeAll(async () => {
    const admin = await createAdmin();
    adminToken = generateToken(admin);

    participant = await createUser({ rol: "participante" });
    participantToken = generateToken(participant);

    const room = await createRoom({ capacidad: 30 });
    const type = await createActivityType();

    activity = await createActivity({
      id_encargado: admin.id_usuario,
      id_sala: room.id_sala,
      id_tipo_actividad: type.id_tipo,
      max_participantes: 1,
      aprobado: true,
      estado: "programada",
    });

    await enrollUser(activity.id_actividad, admin.id_usuario, "encargado");
  });

  afterAll(async () => {
    await cleanupDatabase();
    await closePrisma();
  });

  test("segundo participante recibe error al inscribirse en actividad con cupo completo", async () => {
    const res = await request(app)
      .post(`/api/activities/${activity.id_actividad}/enroll`)
      .set("Authorization", `Bearer ${participantToken}`);

    // 400 cuando no hay cupos
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/cupos/i);
  });
});
