const request = require("supertest");
const app = require("../../Backend/prisma/src/index");
const { prisma } = require("../../Backend/prisma/src/prisma/client");
const {
  createAdmin, createUser, createRoom, createActivityType,
  createActivity, enrollUser, generateToken, cleanupDatabase, closePrisma,
} = require("../helpers/factories");

describe("PI-04: Cancelacion de actividad con participantes", () => {
  let adminToken, participanteToken, activity;

  beforeAll(async () => {
    const admin = await createAdmin();
    const participante = await createUser({ rol: "participante" });
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
    });

    await enrollUser(activity.id_actividad, admin.id_usuario, "encargado");
    await enrollUser(activity.id_actividad, participante.id_usuario, "participante");
  });

  afterAll(async () => {
    await cleanupDatabase();
    await closePrisma();
  });

  test("1. admin cancela actividad → estado cancelada", async () => {
    const res = await request(app)
      .patch(`/api/activities/${activity.id_actividad}/cancel`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    const updated = await prisma.actividad.findUnique({
      where: { id_actividad: activity.id_actividad },
    });
    expect(updated.estado).toBe("cancelada");
  });

  test("2. nuevas inscripciones bloqueadas en actividad cancelada", async () => {
    const nuevoUser = await createUser({ rol: "participante" });
    const nuevoToken = generateToken(nuevoUser);

    const res = await request(app)
      .post(`/api/activities/${activity.id_actividad}/enroll`)
      .set("Authorization", `Bearer ${nuevoToken}`);

    expect(res.status).toBe(400);
  });
});
