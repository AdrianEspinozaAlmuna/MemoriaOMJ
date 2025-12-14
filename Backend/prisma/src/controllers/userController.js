const { prisma } = require("../prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// Nota: la BD actual no tiene columna de contraseña en `usuario`,
// así que los endpoints de autenticación se dejan como stub para evitar fallos.

async function getUsers(req, res) {
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
    }
  });
  res.json(users);
}

async function createUser(req, res) {
  const { rut, nombre, apellido, mail, telefono = null, rol = "participante" } = req.body;

  try {
    const user = await prisma.usuario.create({
      data: { rut, nombre, apellido, mail, telefono, rol }
    });
    res.status(201).json({
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

async function loginUser(_req, res) {
  // Stub: sin columna contraseña en la tabla actual.
  return res.status(501).json({ message: "Login no implementado en el esquema actual" });
}

// Endpoint de prueba que lee la BD y devuelve datos
async function testEndpoint(_req, res) {
  const sample = await prisma.usuario.findFirst({
    select: { id_usuario: true, nombre: true, apellido: true, mail: true, rol: true }
  });
  res.json({ message: "OK desde PostgreSQL", sample });
}

module.exports = { getUsers, createUser, loginUser, testEndpoint };
// Referencias: [`userController.getUsers`](Backend/src/controllers/userController.js)