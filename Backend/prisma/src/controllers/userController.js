const { prisma } = require("../prisma/client");
const jwt = require("jsonwebtoken");
const { getUserIdFromToken } = require("../middleware/auth");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// Nota: la BD actual no tiene columna de contraseña en `usuario`,
// así que los endpoints de autenticación se dejan como stub para evitar fallos.

async function getUsers(req, res) {
  try {
    const users = await prisma.usuario.findMany({
      select: {
        id_usuario: true,
        rut: true,
        nombre: true,
        apellido: true,
        mail: true,
        rol: true,
        estado: true,
        fecha_registro: true
      },
      orderBy: { id_usuario: "asc" }
    });
    return res.json(users);
  } catch (e) {
    return res.status(500).json({ message: "Error al obtener usuarios", detail: e.message });
  }
}

async function createUser(req, res) {
  const { rut, nombre, apellido, mail, telefono = null, rol = "participante" } = req.body;

  const normalizedRole = rol === "admin" ? "admin" : "participante";
  const canAssignAdmin = req.user?.rol === "admin";

  if (normalizedRole === "admin" && !canAssignAdmin) {
    return res.status(403).json({ message: "Solo un admin puede crear otro admin" });
  }

  try {
    const user = await prisma.usuario.create({
      data: { rut, nombre, apellido, mail, telefono, rol: normalizedRole }
    });
    return res.status(201).json({
      id_usuario: user.id_usuario,
      rut: user.rut,
      nombre: user.nombre,
      apellido: user.apellido,
      mail: user.mail,
      rol: user.rol
    });
  } catch (e) {
    if (e.code === "P2002") {
      return res.status(409).json({ message: "RUT o mail ya existen" });
    }
    return res.status(500).json({ message: "Error al crear usuario", detail: e.message });
  }
}

async function loginUser(req, res) {
  const mail = req.body?.email || req.body?.mail;
  if (!mail) {
    return res.status(400).json({ message: "Debes enviar email/mail" });
  }

  try {
    const user = await prisma.usuario.findUnique({
      where: { mail },
      select: {
        id_usuario: true,
        rut: true,
        nombre: true,
        apellido: true,
        mail: true,
        rol: true,
        estado: true
      }
    });

    if (!user || !user.estado) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        mail: user.mail,
        nombre: user.nombre,
        rol: user.rol
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      token,
      user: {
        id_usuario: user.id_usuario,
        rut: user.rut,
        nombre: user.nombre,
        apellido: user.apellido,
        mail: user.mail,
        rol: user.rol
      }
    });
  } catch (e) {
    return res.status(500).json({ message: "Error en login", detail: e.message });
  }
}

async function getMe(req, res) {
  const idUsuario = getUserIdFromToken(req.user);
  if (!idUsuario) {
    return res.status(403).json({ message: "Token sin id_usuario válido" });
  }

  try {
    const user = await prisma.usuario.findUnique({
      where: { id_usuario: idUsuario },
      select: {
        id_usuario: true,
        rut: true,
        nombre: true,
        apellido: true,
        mail: true,
        rol: true,
        estado: true,
        fecha_registro: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json(user);
  } catch (e) {
    return res.status(500).json({ message: "Error obteniendo perfil", detail: e.message });
  }
}

function getMyActivityRole(req, res) {
  if (!req.activityMembership) {
    return res.status(404).json({ message: "No se encontro membresia de actividad" });
  }

  return res.json({
    id_actividad: req.activityMembership.id_actividad,
    id_usuario: req.activityMembership.id_usuario,
    rol_en_actividad: req.activityMembership.rol,
    asistio: req.activityMembership.asistio
  });
}

// Endpoint de prueba que lee la BD y devuelve datos
async function testEndpoint(_req, res) {
  try {
    const sample = await prisma.usuario.findFirst({
      select: { id_usuario: true, nombre: true, apellido: true, mail: true, rol: true }
    });
    return res.json({ message: "OK desde PostgreSQL", sample });
  } catch (e) {
    return res.status(500).json({ message: "Error leyendo BD", detail: e.message });
  }
}

module.exports = { getUsers, createUser, loginUser, getMe, getMyActivityRole, testEndpoint };
// Referencias: [`userController.getUsers`](Backend/src/controllers/userController.js)