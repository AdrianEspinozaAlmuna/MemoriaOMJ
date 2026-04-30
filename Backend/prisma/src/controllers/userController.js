const { prisma } = require("../prisma/client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { getUserIdFromToken } = require("../middleware/auth");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const PASSWORD_MIN_LENGTH = 10;

function validateStrongPassword(password) {
  if (!password) return "Debes enviar una contrasena.";
  if (password.length < PASSWORD_MIN_LENGTH) return `La contrasena debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  if (/\s/.test(password)) return "La contrasena no debe contener espacios.";
  if (!/[A-ZÁÉÍÓÚÑ]/.test(password)) return "La contrasena debe incluir al menos una mayuscula.";
  if (!/[a-záéíóúñ]/.test(password)) return "La contrasena debe incluir al menos una minuscula.";
  if (!/\d/.test(password)) return "La contrasena debe incluir al menos un numero.";
  if (!/[^\w\s]/.test(password)) return "La contrasena debe incluir al menos un simbolo.";

  return "";
}

// La autenticación usa `password_hash` en `usuario` y bcrypt para comparar credenciales.

async function getUsers(req, res) {
  try {
    const users = await prisma.usuario.findMany({
      select: {
        id_usuario: true,
        rut: true,
        nombre: true,
        apellido: true,
        mail: true,
        telefono: true,
        rol: true,
        estado: true,
        fecha_registro: true
      },
      orderBy: { id_usuario: "asc" }
    });
    return res.json({ users });
  } catch (e) {
    return res.status(500).json({ message: "Error al obtener usuarios", detail: e.message });
  }
}

async function createUser(req, res) {
  const { rut, nombre, apellido, mail, telefono = null, rol = "participante", password } = req.body;

  const normalizedRole = rol === "admin" ? "admin" : "participante";
  const canAssignAdmin = req.user?.rol === "admin";
  const passwordError = validateStrongPassword(password);

  if (normalizedRole === "admin" && !canAssignAdmin) {
    return res.status(403).json({ message: "Solo un admin puede crear otro admin" });
  }

  if (passwordError) {
    return res.status(400).json({ message: passwordError });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.usuario.create({
      data: { rut, nombre, apellido, mail, telefono, rol: normalizedRole, password_hash: passwordHash }
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
  const password = req.body?.password;
  if (!mail) {
    return res.status(400).json({ message: "Debes enviar email/mail" });
  }

  if (!password) {
    return res.status(400).json({ message: "Debes enviar la contrasena" });
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
        estado: true,
        password_hash: true
      }
    });

    if (!user || !user.estado || !user.password_hash) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
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
// Actualizar usuario (solo campos permitidos)
async function updateUser(req, res) {
  const id = Number(req.params.id);
  const allowed = ["nombre", "apellido", "mail", "telefono", "estado", "rol"];
  const updates = {};
  for (const key of allowed) if (req.body[key] !== undefined) updates[key] = req.body[key];

  try {
    const user = await prisma.usuario.update({ where: { id_usuario: id }, data: updates });
    return res.json({ ok: true, user });
  } catch (e) {
    return res.status(500).json({ message: "Error actualizando usuario", detail: e.message });
  }
}

// Eliminar usuario (intenta delete, si falla marca como deshabilitado)
async function deleteUser(req, res) {
  const id = Number(req.params.id);
  try {
    const deleted = await prisma.usuario.delete({ where: { id_usuario: id } });
    return res.json({ ok: true, deleted });
  } catch (e) {
    try {
      const disabled = await prisma.usuario.update({ where: { id_usuario: id }, data: { estado: false } });
      return res.json({ ok: true, disabled, note: "deleted failed, set estado=false" });
    } catch (err) {
      return res.status(500).json({ message: "Error eliminando usuario", detail: err.message });
    }
  }
}

module.exports = { getUsers, createUser, loginUser, getMe, getMyActivityRole, testEndpoint, updateUser, deleteUser };
// Referencias: [`userController.getUsers`](Backend/src/controllers/userController.js)