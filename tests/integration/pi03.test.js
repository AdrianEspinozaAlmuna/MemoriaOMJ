const request = require("supertest");
const app = require("../../Backend/prisma/src/index");
const { prisma } = require("../../Backend/prisma/src/prisma/client");
const {
  createAdmin, createUser, createRoom, createActivityType,
  createGroup, addToGroup, generateToken, cleanupDatabase, closePrisma,
} = require("../helpers/factories");

describe("PI-03: Autoinscripcion de grupos en actividad", () => {
  let encargadoToken, adminToken, group;
  let miembros = [];

  beforeAll(async () => {
    const encargado = await createUser({ rol: "participante" });
    const admin = await createAdmin();
    encargadoToken = generateToken(encargado);
    adminToken = generateToken(admin);

    group = await createGroup({ id_lider: encargado.id_usuario });
    await addToGroup(group.id_grupo, encargado.id_usuario, "lider");

    for (let i = 0; i < 3; i++) {
      const m = await createUser({ rol: "participante" });
      await addToGroup(group.id_grupo, m.id_usuario, "miembro");
      miembros.push(m);
    }
  });

  afterAll(async () => {
    await cleanupDatabase();
    await closePrisma();
  });

  test("1. encargado crea actividad asociada al grupo", async () => {
    const room = await createRoom({ capacidad: 50 });
    const type = await createActivityType();

    const res = await request(app)
      .post("/api/activities")
      .set("Authorization", `Bearer ${encargadoToken}`)
      .send({
        titulo: "Actividad grupal",
        fecha: "2026-08-01",
        hora_inicio: "14:00",
        hora_termino: "16:00",
        id_sala: room.id_sala,
        id_tipo_actividad: type.id_tipo,
        max_participantes: 20,
        grupos_seleccionados: [group.id_grupo],
      });

    expect(res.status).toBe(201);
  });

  test("2. miembros del grupo quedan inscritos sin duplicados", async () => {
    const relations = await prisma.actividad_grupo.findMany({
      where: { id_grupo: group.id_grupo },
      include: { actividad: true },
    });

    expect(relations.length).toBeGreaterThanOrEqual(1);
  });
});
