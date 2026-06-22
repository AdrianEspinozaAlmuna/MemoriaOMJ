const request = require("supertest");
const app = require("../../Backend/prisma/src/index");
const { prisma } = require("../../Backend/prisma/src/prisma/client");
const {
  createAdmin, createUser, createRoom, createActivityType,
  createActivity, generateToken, cleanupDatabase, closePrisma,
} = require("../helpers/factories");

describe("PCN-12: Consulta de actividades segun estado", () => {
  let admin, participante;
  let adminToken, participanteToken;
  let room, activityType;

  beforeAll(async () => {
    admin = await createAdmin();
    participante = await createUser({ rol: "participante" });
    adminToken = generateToken(admin);
    participanteToken = generateToken(participante);

    room = await createRoom();
    activityType = await createActivityType();

    // Actividad pendiente (no aprobada)
    await createActivity({
      id_encargado: admin.id_usuario,
      id_sala: room.id_sala,
      id_tipo_actividad: activityType.id_tipo,
      titulo: "Actividad Pendiente",
      aprobado: false,
      estado: "pendiente",
    });

    // Actividad aprobada y programada
    await createActivity({
      id_encargado: admin.id_usuario,
      id_sala: room.id_sala,
      id_tipo_actividad: activityType.id_tipo,
      titulo: "Actividad Aprobada",
      aprobado: true,
      estado: "programada",
    });

    // Actividad finalizada
    await createActivity({
      id_encargado: admin.id_usuario,
      id_sala: room.id_sala,
      id_tipo_actividad: activityType.id_tipo,
      titulo: "Actividad Finalizada",
      aprobado: true,
      estado: "finalizada",
    });

    // Actividad cancelada
    await createActivity({
      id_encargado: admin.id_usuario,
      id_sala: room.id_sala,
      id_tipo_actividad: activityType.id_tipo,
      titulo: "Actividad Cancelada",
      aprobado: true,
      estado: "cancelada",
    });
  });

  afterAll(async () => {
    await cleanupDatabase();
    await closePrisma();
  });

  test("1. participante consulta actividades → solo aprobadas", async () => {
    const res = await request(app)
      .get("/api/activities")
      .set("Authorization", `Bearer ${participanteToken}`);

    expect(res.status).toBe(200);
    const titles = res.body.map(a => a.titulo || a.title);
    expect(titles).toContain("Actividad Aprobada");
    expect(titles).toContain("Actividad Finalizada");
    // Pendiente no aprobada no debe aparecer
    expect(titles).not.toContain("Actividad Pendiente");
  });

  test("2. admin consulta todas las actividades", async () => {
    const res = await request(app)
      .get("/api/activities/admin")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const titles = res.body.map(a => a.titulo || a.title);
    expect(titles).toContain("Actividad Pendiente");
    expect(titles).toContain("Actividad Aprobada");
  });

  test("3. actividad cancelada visible para admin", async () => {
    const res = await request(app)
      .get("/api/activities/admin")
      .set("Authorization", `Bearer ${adminToken}`);

    const titles = res.body.map(a => a.titulo || a.title);
    expect(titles).toContain("Actividad Cancelada");
  });

  test("4. actividad finalizada visible para participante", async () => {
    const res = await request(app)
      .get("/api/activities")
      .set("Authorization", `Bearer ${participanteToken}`);

    const titles = res.body.map(a => a.titulo || a.title);
    expect(titles).toContain("Actividad Finalizada");
  });
});
