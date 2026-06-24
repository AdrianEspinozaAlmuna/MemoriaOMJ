const { prisma } = require("../../Backend/prisma/src/prisma/client");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const PASSWORD_HASH = "$2b$10$dummy_hash_for_testing_only_1234567890abcdef";

function generateToken(user) {
  return jwt.sign(
    { id_usuario: user.id_usuario, mail: user.mail, nombre: user.nombre, apellido: user.apellido, rol: user.rol },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
}

async function createUser(overrides = {}) {
  const data = {
    rut: `${String(10000000 + Math.floor(Math.random() * 90000000))}-${Math.floor(Math.random() * 9)}`,
    nombre: "Test",
    apellido: "User",
    mail: `test${Date.now()}${Math.floor(Math.random() * 1000)}@test.com`,
    password_hash: PASSWORD_HASH,
    estado: true,
    rol: "participante",
    ...overrides,
  };
  return prisma.usuario.create({ data });
}

async function createAdmin(overrides = {}) {
  return createUser({ ...overrides, rol: "admin" });
}

async function createRoom(overrides = {}) {
  const data = {
    nombre: `Sala-${Date.now()}`,
    capacidad: 30,
    ...overrides,
  };
  return prisma.salas.create({ data });
}

async function createActivityType(overrides = {}) {
  const data = {
    nombre: `Tipo-${Date.now()}`,
    imagen_url: "/uploads/default.jpg",
    descripcion: "Test type",
    ...overrides,
  };
  return prisma.tipo_actividad.create({ data });
}

async function createActivity(overrides = {}) {
  const encargado = overrides.id_encargado
    ? null
    : await createUser({ rol: "participante" });
  const sala = overrides.id_sala ? null : await createRoom();
  const tipo = overrides.id_tipo_actividad ? null : await createActivityType();

  const data = {
    id_encargado: overrides.id_encargado || encargado.id_usuario,
    id_sala: overrides.id_sala || sala.id_sala,
    titulo: "Actividad Test",
    descripcion: "Descripción test",
    id_tipo_actividad: overrides.id_tipo_actividad || tipo.id_tipo,
    fecha: new Date("2026-07-15"),
    hora_inicio: new Date("1970-01-01T10:00:00Z"),
    hora_termino: new Date("1970-01-01T12:00:00Z"),
    max_participantes: 20,
    chat_bidireccional: true,
    revision_original_data: null,
    aprobado: true,
    estado: "programada",
    ...overrides,
  };
  if (overrides.id_encargado || overrides.id_sala || overrides.id_tipo_actividad) {
    delete data.fecha;
    delete data.hora_inicio;
    delete data.hora_termino;
    Object.assign(data, {
      fecha: overrides.fecha || new Date("2026-07-15"),
      hora_inicio: overrides.hora_inicio || new Date("1970-01-01T10:00:00Z"),
      hora_termino: overrides.hora_termino || new Date("1970-01-01T12:00:00Z"),
    });
  }
  return prisma.actividad.create({ data });
}

async function createGroup(overrides = {}) {
  const lider = overrides.id_lider ? null : await createUser({ rol: "participante" });
  const data = {
    id_lider: overrides.id_lider || lider.id_usuario,
    nombre: `Grupo-${Date.now()}`,
    descripcion: "Grupo test",
    ...overrides,
  };
  return prisma.grupo.create({ data });
}

async function enrollUser(activityId, userId, rol = "participante") {
  return prisma.actividad_participantes.create({
    data: { id_actividad: activityId, id_usuario: userId, rol },
  });
}

async function addToGroup(groupId, userId, rol = "miembro") {
  return prisma.participantes_grupo.create({
    data: { id_grupo: groupId, id_usuario: userId, rol },
  });
}

async function createMessage(activityId, userId, text) {
  return prisma.actividad_mensaje.create({
    data: { id_actividad: activityId, id_usuario: userId, mensaje: text },
  });
}

async function cleanupDatabase() {
  try {
    await prisma.actividad_mensaje.deleteMany();
  } catch { /* ok */ }
  try {
    await prisma.actividad_participantes.deleteMany();
  } catch { /* ok */ }
  try {
    await prisma.actividad_grupo.deleteMany();
  } catch { /* ok */ }
  try {
    await prisma.participantes_grupo.deleteMany();
  } catch { /* ok */ }
  try {
    await prisma.notificaciones.deleteMany();
  } catch { /* ok */ }
  try {
    await prisma.fcm_token.deleteMany();
  } catch { /* ok */ }
  try {
    await prisma.actividad.deleteMany();
  } catch { /* ok */ }
  try {
    await prisma.grupo.deleteMany();
  } catch { /* ok */ }
  try {
    await prisma.usuario.deleteMany();
  } catch { /* ok */ }
  try {
    await prisma.salas.deleteMany();
  } catch { /* ok */ }
  try {
    await prisma.tipo_actividad.deleteMany();
  } catch { /* ok */ }
}

async function closePrisma() {
  await prisma.$disconnect();
}

module.exports = {
  createUser,
  createAdmin,
  createRoom,
  createActivityType,
  createActivity,
  createGroup,
  enrollUser,
  addToGroup,
  createMessage,
  cleanupDatabase,
  closePrisma,
  generateToken,
};
