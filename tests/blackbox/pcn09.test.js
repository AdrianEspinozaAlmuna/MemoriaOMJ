const request = require("supertest");
const app = require("../../Backend/prisma/src/index");
const { prisma } = require("../../Backend/prisma/src/prisma/client");
const {
  createUser, createRoom, createActivityType,
  createActivity, enrollUser, generateToken, cleanupDatabase, closePrisma,
} = require("../helpers/factories");

describe("PCN-09: Restriccion de reduccion de cupos bajo inscritos", () => {
  let encargado, encargadoToken, room, activityType, activity;

  beforeAll(async () => {
    encargado = await createUser({ rol: "participante" });
    encargadoToken = generateToken(encargado);

    room = await createRoom({ capacidad: 30 });
    activityType = await createActivityType();

    activity = await createActivity({
      id_encargado: encargado.id_usuario,
      id_sala: room.id_sala,
      id_tipo_actividad: activityType.id_tipo,
      max_participantes: 10,
      aprobado: true,
      estado: "programada",
    });

    await enrollUser(activity.id_actividad, encargado.id_usuario, "encargado");

    for (let i = 0; i < 10; i++) {
      const p = await createUser({ rol: "participante" });
      await enrollUser(activity.id_actividad, p.id_usuario, "participante");
    }
  });

  afterAll(async () => {
    await cleanupDatabase();
    await closePrisma();
  });

  test("reducir cupo a 5 con 10 inscritos devuelve 400", async () => {
    const res = await request(app)
      .patch(`/api/activities/${activity.id_actividad}/request-edit`)
      .set("Authorization", `Bearer ${encargadoToken}`)
      .send({
        titulo: "Intento reduccion cupo",
        fecha: "2026-07-20",
        hora_inicio: "10:00",
        hora_termino: "12:00",
        id_sala: room.id_sala,
        id_tipo_actividad: activityType.id_tipo,
        max_participantes: 5,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/cupo.*menor.*inscritos/i);
  });

  test("el cupo maximo no se modifica en la base de datos", async () => {
    const act = await prisma.actividad.findUnique({
      where: { id_actividad: activity.id_actividad },
      select: { max_participantes: true },
    });
    expect(act.max_participantes).toBe(10);
  });
});
