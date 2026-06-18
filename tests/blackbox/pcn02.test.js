const request = require("supertest");
const app = require("../../Backend/prisma/src/index");
const { createUser, createRoom, createActivityType, generateToken, cleanupDatabase, closePrisma } = require("../helpers/factories");

describe("PCN-02: Creacion de actividad desde calendario", () => {
  let token, room, activityType, user;

  beforeAll(async () => {
    user = await createUser({ rol: "participante" });
    token = generateToken(user);
    room = await createRoom();
    activityType = await createActivityType();
  });

  afterAll(async () => {
    await cleanupDatabase();
    await closePrisma();
  });

  test("fecha enviada se persiste sin alteracion", async () => {
    const fechaEsperada = "2026-08-15";

    const res = await request(app)
      .post("/api/activities")
      .set("Authorization", `Bearer ${token}`)
      .send({
        titulo: "Taller de prueba",
        fecha: fechaEsperada,
        hora_inicio: "10:00",
        hora_termino: "12:00",
        id_sala: room.id_sala,
        id_tipo_actividad: activityType.id_tipo,
        max_participantes: 15,
      });

    expect(res.status).toBe(201);
    expect(res.body.activity.fecha.slice(0, 10)).toBe(fechaEsperada);
  });
});
