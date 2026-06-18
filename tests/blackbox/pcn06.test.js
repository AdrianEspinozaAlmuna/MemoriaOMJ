const request = require("supertest");
const app = require("../../Backend/prisma/src/index");
const {
  createAdmin, createUser, createRoom, createActivityType,
  createActivity, generateToken, cleanupDatabase, closePrisma,
} = require("../helpers/factories");

describe("PCN-06: Generacion de reportes por periodo", () => {
  let adminToken;

  beforeAll(async () => {
    const admin = await createAdmin();
    adminToken = generateToken(admin);

    const room = await createRoom();
    const type = await createActivityType();

    await createActivity({
      id_encargado: admin.id_usuario,
      id_sala: room.id_sala,
      id_tipo_actividad: type.id_tipo,
      fecha: new Date("2026-07-01"),
      aprobado: true,
      estado: "programada",
    });

    await createActivity({
      id_encargado: admin.id_usuario,
      id_sala: room.id_sala,
      id_tipo_actividad: type.id_tipo,
      fecha: new Date("2026-07-15"),
      aprobado: true,
      estado: "programada",
    });
  });

  afterAll(async () => {
    await cleanupDatabase();
    await closePrisma();
  });

  test("admin obtiene stats del dashboard", async () => {
    const res = await request(app)
      .get("/api/dashboard/stats")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("activeActivities");
    expect(typeof res.body.activeActivities).toBe("number");
  });
});
