const request = require("supertest");
const app = require("../../Backend/prisma/src/index");
const { prisma } = require("../../Backend/prisma/src/prisma/client");
const { createAdmin, generateToken, cleanupDatabase, closePrisma } = require("../helpers/factories");

describe("PCN-10: Gestion de usuarios", () => {
  let adminToken;

  beforeAll(async () => {
    const admin = await createAdmin();
    adminToken = generateToken(admin);
  });

  afterAll(async () => {
    await cleanupDatabase();
    await closePrisma();
  });

  test("1. crear usuario como admin → 201", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        rut: "11111111-1",
        nombre: "Usuario",
        apellido: "Test",
        mail: "test@crear.com",
        password: "Password123!",
        rol: "participante",
      });

    expect(res.status).toBe(201);
    expect(res.body.id_usuario).toBeDefined();
    expect(res.body.rol).toBe("participante");
  });

  test("2. editar informacion del usuario → 200", async () => {
    const user = await prisma.usuario.findFirst({ where: { mail: "test@crear.com" } });
    expect(user).not.toBeNull();

    const res = await request(app)
      .patch(`/api/users/${user.id_usuario}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nombre: "Editado", apellido: "Correctamente" });

    expect(res.status).toBe(200);

    const updated = await prisma.usuario.findUnique({ where: { id_usuario: user.id_usuario } });
    expect(updated.nombre).toBe("Editado");
  });

  test("3. desactivar usuario → 200", async () => {
    const user = await prisma.usuario.findFirst({ where: { mail: "test@crear.com" } });
    expect(user).not.toBeNull();

    const res = await request(app)
      .patch(`/api/users/${user.id_usuario}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ estado: false });

    expect(res.status).toBe(200);

    const disabled = await prisma.usuario.findUnique({ where: { id_usuario: user.id_usuario } });
    expect(disabled.estado).toBe(false);
  });

  test("3b. persistencia: datos correctos en base de datos", async () => {
    const user = await prisma.usuario.findFirst({ where: { mail: "test@crear.com" } });
    expect(user).not.toBeNull();
    expect(user.nombre).toBe("Editado");
    expect(user.estado).toBe(false);
  });
});
