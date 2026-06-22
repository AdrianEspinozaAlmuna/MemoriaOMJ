const request = require("supertest");
const app = require("../../Backend/prisma/src/index");
const { prisma } = require("../../Backend/prisma/src/prisma/client");
const { createAdmin, createUser, generateToken, cleanupDatabase, closePrisma } = require("../helpers/factories");

describe("PCN-11: Inicio de sesion con usuario deshabilitado", () => {
  let targetUser;

  beforeAll(async () => {
    const admin = await createAdmin();
    const adminToken = generateToken(admin);

    // Crear usuario con contraseña conocida via endpoint
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        rut: "22222222-2",
        nombre: "Deshabilitado",
        apellido: "Test",
        mail: "deshab@test.com",
        password: "Password123!",
        rol: "participante",
      });

    targetUser = res.body;

    // Desactivar usuario
    await request(app)
      .patch(`/api/users/${targetUser.id_usuario}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ estado: false });
  });

  afterAll(async () => {
    await cleanupDatabase();
    await closePrisma();
  });

  test("login con usuario deshabilitado devuelve 403", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "deshab@test.com", password: "Password123!" });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/deshabilitado/i);
  });
});
