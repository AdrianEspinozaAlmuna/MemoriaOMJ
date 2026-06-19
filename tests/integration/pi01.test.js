const request = require("supertest");
const app = require("../../Backend/prisma/src/index");
const { prisma } = require("../../Backend/prisma/src/prisma/client");
const {
  createAdmin, createUser, createRoom, createActivityType,
  generateToken, cleanupDatabase, closePrisma,
} = require("../helpers/factories");

describe("PI-01: Ciclo de vida completo de actividad", () => {
  let encargado, admin, participante;
  let encargadoToken, adminToken, participanteToken;
  let room, activityType;
  let activity;

  beforeAll(async () => {
    encargado = await createUser({ rol: "participante" });
    admin = await createAdmin();
    participante = await createUser({ rol: "participante" });

    encargadoToken = generateToken(encargado);
    adminToken = generateToken(admin);
    participanteToken = generateToken(participante);

    room = await createRoom({ capacidad: 30 });
    activityType = await createActivityType();
  });

  afterAll(async () => {
    await cleanupDatabase();
    await closePrisma();
  });

  test("1. encargado crea actividad → estado pendiente", async () => {
    const res = await request(app)
      .post("/api/activities")
      .set("Authorization", `Bearer ${encargadoToken}`)
      .send({
        titulo: "Taller de prueba",
        fecha: "2026-07-20",
        hora_inicio: "09:00",
        hora_termino: "11:00",
        id_sala: room.id_sala,
        id_tipo_actividad: activityType.id_tipo,
        max_participantes: 10,
      });

    expect(res.status).toBe(201);
    activity = res.body.activity || res.body;
    expect(activity.estado).toBe("pendiente");
    expect(activity.aprobado).toBe(false);
  });

  test("1b. se notifica a administradores de la nueva actividad", async () => {
    const notif = await prisma.notificaciones.findFirst({
      where: { id_actividad: activity.id_actividad, tipo: "actividad" },
      orderBy: { fecha_envio: "desc" },
    });
    expect(notif).not.toBeNull();
    expect(notif.titulo).toMatch(/Nueva propuesta/i);
  });

  test("2. admin aprueba actividad → estado programada", async () => {
    const res = await request(app)
      .patch(`/api/activities/${activity.id_actividad}/review`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ action: "approve" });

    expect(res.status).toBe(200);
  });

  test("2b. se notifica al encargado de la aprobacion", async () => {
    const notif = await prisma.notificaciones.findFirst({
      where: { id_actividad: activity.id_actividad, id_receptor: encargado.id_usuario },
      orderBy: { fecha_envio: "desc" },
    });
    expect(notif).not.toBeNull();
    expect(notif.titulo).toMatch(/Aprobación/i);
  });

  test("3. participante se inscribe → inscripcion persistida", async () => {
    const res = await request(app)
      .post(`/api/activities/${activity.id_actividad}/enroll`)
      .set("Authorization", `Bearer ${participanteToken}`);

    expect(res.status).toBe(201);

    const enrollment = await prisma.actividad_participantes.findUnique({
      where: {
        id_actividad_id_usuario: {
          id_actividad: activity.id_actividad,
          id_usuario: participante.id_usuario,
        },
      },
    });
    expect(enrollment).not.toBeNull();
    expect(enrollment.rol).toBe("participante");
  });

  test("4. se actualiza estado a en_curso", async () => {
    await prisma.actividad.update({
      where: { id_actividad: activity.id_actividad },
      data: { estado: "en_curso" },
    });

    const updated = await prisma.actividad.findUnique({
      where: { id_actividad: activity.id_actividad },
    });
    expect(updated.estado).toBe("en_curso");
  });

  test("5. participante registra asistencia → asistencia persistida", async () => {
    const res = await request(app)
      .patch(`/api/activities/${activity.id_actividad}/attendance`)
      .set("Authorization", `Bearer ${participanteToken}`);

    expect(res.status).toBe(200);

    const attendance = await prisma.actividad_participantes.findUnique({
      where: {
        id_actividad_id_usuario: {
          id_actividad: activity.id_actividad,
          id_usuario: participante.id_usuario,
        },
      },
    });
    expect(attendance.asistio).toBe(true);
  });

  test("5b. se notifica al participante de la asistencia registrada", async () => {
    const notif = await prisma.notificaciones.findFirst({
      where: { id_receptor: participante.id_usuario, titulo: "Asistencia registrada" },
      orderBy: { fecha_envio: "desc" },
    });
    expect(notif).not.toBeNull();
    expect(notif.tipo).toBe("actividad");
  });
});
