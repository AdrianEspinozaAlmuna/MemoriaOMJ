const express = require("express");
const router = express.Router();
const { prisma } = require("../prisma/client");
const { requireAuth, requireRole } = require("../middleware/auth");

// Listar salas
router.get("/", async (req, res) => {
  try {
    const salas = await prisma.salas.findMany({ orderBy: { id_sala: "asc" } });
    return res.json(salas);
  } catch (e) {
    return res.status(500).json({ message: "Error obteniendo salas", detail: e.message });
  }
});

// Crear sala (admin)
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  const { nombre, capacidad = 30, estado = "habilitada" } = req.body;
  try {
    const sala = await prisma.salas.create({ data: { nombre, capacidad, estado } });
    return res.status(201).json(sala);
  } catch (e) {
    return res.status(500).json({ message: "Error creando sala", detail: e.message });
  }
});

// Actualizar sala (admin)
router.patch("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);
  const data = {};
  if (req.body.nombre !== undefined) data.nombre = req.body.nombre;
  if (req.body.capacidad !== undefined) data.capacidad = req.body.capacidad;
  if (req.body.estado !== undefined) data.estado = req.body.estado;
  try {
    const sala = await prisma.salas.update({ where: { id_sala: id }, data });
    return res.json(sala);
  } catch (e) {
    return res.status(500).json({ message: "Error actualizando sala", detail: e.message });
  }
});

// Eliminar sala (admin)
router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);
  try {
    const deleted = await prisma.salas.delete({ where: { id_sala: id } });
    return res.json({ ok: true, deleted });
  } catch (e) {
    return res.status(500).json({ message: "Error eliminando sala", detail: e.message });
  }
});

module.exports = router;
