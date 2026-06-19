const request = require("supertest");
const app = require("../../Backend/prisma/src/index");
const { createUser, generateToken, cleanupDatabase, closePrisma } = require("../helpers/factories");

describe("PCN-01: Restriccion de acceso administrativo", () => {
  let participantToken;

  beforeAll(async () => {
    const user = await createUser({ rol: "participante" });
    participantToken = generateToken(user);
  });

  afterAll(async () => {
    await cleanupDatabase();
    await closePrisma();
  });

  test("participante obtiene 403 al acceder a /api/dashboard/stats", async () => {
    const res = await request(app)
      .get("/api/dashboard/stats")
      .set("Authorization", `Bearer ${participantToken}`);

    expect(res.status).toBe(403);
  });

  test("mensaje de error indica falta de autorizacion", async () => {
    const res = await request(app)
      .get("/api/dashboard/stats")
      .set("Authorization", `Bearer ${participantToken}`);

    expect(res.body.message).toMatch(/No autorizado/i);
  });
});
