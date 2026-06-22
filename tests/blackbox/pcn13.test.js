const request = require("supertest");
const app = require("../../Backend/prisma/src/index");
const { prisma } = require("../../Backend/prisma/src/prisma/client");
const {
  createUser, addToGroup, generateToken, cleanupDatabase, closePrisma,
} = require("../helpers/factories");

describe("PCN-13: Gestion basica de grupos", () => {
  let lider, miembro1, miembro2;
  let liderToken, miembroToken;
  let group;

  beforeAll(async () => {
    lider = await createUser({ rol: "participante" });
    miembro1 = await createUser({ rol: "participante" });
    miembro2 = await createUser({ rol: "participante" });

    liderToken = generateToken(lider);
    miembroToken = generateToken(miembro1);
  });

  afterAll(async () => {
    await cleanupDatabase();
    await closePrisma();
  });

  test("1. crear grupo → 201", async () => {
    const res = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${liderToken}`)
      .send({
        nombre: `Grupo-Test-${Date.now()}`,
        descripcion: "Grupo de prueba",
      });

    expect(res.status).toBe(201);
    group = res.body.group || res.body;
  });

  test("2. lider agrega integrante → 201", async () => {
    const res = await request(app)
      .post(`/api/groups/${group.id_grupo}/members`)
      .set("Authorization", `Bearer ${liderToken}`)
      .send({ id_usuario: miembro1.id_usuario });

    expect(res.status).toBe(201);

    const membership = await prisma.participantes_grupo.findUnique({
      where: { id_grupo_id_usuario: { id_grupo: group.id_grupo, id_usuario: miembro1.id_usuario } },
    });
    expect(membership).not.toBeNull();
  });

  test("3. no lider intenta agregar miembro → 403", async () => {
    const res = await request(app)
      .post(`/api/groups/${group.id_grupo}/members`)
      .set("Authorization", `Bearer ${miembroToken}`)
      .send({ id_usuario: miembro2.id_usuario });

    expect(res.status).toBe(403);
  });

  test("4. lider elimina integrante → 200", async () => {
    const res = await request(app)
      .delete(`/api/groups/${group.id_grupo}/members`)
      .set("Authorization", `Bearer ${liderToken}`)
      .send({ id_usuario: miembro1.id_usuario });

    expect(res.status).toBe(200);

    const membership = await prisma.participantes_grupo.findUnique({
      where: { id_grupo_id_usuario: { id_grupo: group.id_grupo, id_usuario: miembro1.id_usuario } },
    });
    expect(membership).toBeNull();
  });

  test("5. no lider intenta eliminar integrante → 403", async () => {
    // Primero re-agregar a miembro2
    await request(app)
      .post(`/api/groups/${group.id_grupo}/members`)
      .set("Authorization", `Bearer ${liderToken}`)
      .send({ id_usuario: miembro2.id_usuario });

    const res = await request(app)
      .delete(`/api/groups/${group.id_grupo}/members`)
      .set("Authorization", `Bearer ${miembroToken}`)
      .send({ id_usuario: miembro2.id_usuario });

    expect(res.status).toBe(403);
  });
});
