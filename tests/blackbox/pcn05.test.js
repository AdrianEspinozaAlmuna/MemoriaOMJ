const request = require("supertest");
const app = require("../../Backend/prisma/src/index");
const { prisma } = require("../../Backend/prisma/src/prisma/client");
const {
  createAdmin, createUser, createRoom, createActivityType,
  createActivity, enrollUser, generateToken, cleanupDatabase, closePrisma,
} = require("../helpers/factories");

describe("PCN-05: Chat unidireccional", () => {
  let participant, participantToken, activity;

  beforeAll(async () => {
    const admin = await createAdmin();
    participant = await createUser({ rol: "participante" });
    participantToken = generateToken(participant);

    const room = await createRoom();
    const type = await createActivityType();

    activity = await createActivity({
      id_encargado: admin.id_usuario,
      id_sala: room.id_sala,
      id_tipo_actividad: type.id_tipo,
      chat_bidireccional: false,
      aprobado: true,
      estado: "programada",
    });

    await enrollUser(activity.id_actividad, participant.id_usuario, "participante");
    await enrollUser(activity.id_actividad, admin.id_usuario, "encargado");
  });

  afterAll(async () => {
    await cleanupDatabase();
    await closePrisma();
  });

  test("participante recibe 403 al enviar mensaje en chat unilateral", async () => {
    const res = await request(app)
      .post(`/api/activities/${activity.id_actividad}/messages`)
      .set("Authorization", `Bearer ${participantToken}`)
      .send({ mensaje: "Hola" });

    expect(res.status).toBe(403);
  });

  test("el mensaje no se persiste en la base de datos", async () => {
    const msg = await prisma.actividad_mensaje.findFirst({
      where: { id_actividad: activity.id_actividad, id_usuario: participant.id_usuario },
    });
    expect(msg).toBeNull();
  });
});
