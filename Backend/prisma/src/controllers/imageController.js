const { prisma } = require("../prisma/client");
const fs = require("fs");
const path = require("path");

const uploadsDir = path.resolve(__dirname, "../uploads/tipos-actividad");

function getPublicBaseUrl(req) {
  if (process.env.PUBLIC_BACKEND_URL) return process.env.PUBLIC_BACKEND_URL;
  const protocol = req.protocol || "http";
  const host = req.get("host") || "localhost:4000";
  return `${protocol}://${host}`;
}

async function ensureDefaultTypes(req) {
  const count = await prisma.tipo_actividad.count();
  if (count > 0) return;

  const base = getPublicBaseUrl(req);
  const defaults = [
    {
      nombre: "baile",
      descripcion: "Actividades de baile y expresion corporal.",
      imagen_url: `${base}/uploads/tipos-actividad/baile.svg`
    },
    {
      nombre: "charla",
      descripcion: "Charlas, conferencias y encuentros formativos.",
      imagen_url: `${base}/uploads/tipos-actividad/charla.svg`
    },
    {
      nombre: "deporte",
      descripcion: "Actividades deportivas y recreativas.",
      imagen_url: `${base}/uploads/tipos-actividad/deporte.svg`
    }
  ];

  for (const item of defaults) {
    await prisma.tipo_actividad.upsert({
      where: { nombre: item.nombre },
      update: {
        descripcion: item.descripcion,
        imagen_url: item.imagen_url
      },
      create: item
    });
  }
}

/**
 * Obtener todos los tipos de actividad
 * GET /api/imagenes
 */
async function getActivityImages(req, res) {
  try {
    await ensureDefaultTypes(req);
    const tipos = await prisma.tipo_actividad.findMany({
      orderBy: { nombre: "asc" }
    });

    return res.json({ tipos });
  } catch (error) {
    console.error("[imagenes] getActivityImages failed:", error);
    return res.status(500).json({ message: "Error obteniendo tipos de actividad", detail: error.message });
  }
}

/**
 * Obtener tipo de actividad por id o por nombre
 * GET /api/imagenes/:tipo
 */
async function getActivityImageByType(req, res) {
  const identifier = String(req.params.tipo || "").trim();

  if (!identifier) return res.status(400).json({ message: "Identificador requerido" });

  try {
    let tipo = null;
    const idNum = Number(identifier);
    if (Number.isInteger(idNum) && idNum > 0) {
      tipo = await prisma.tipo_actividad.findUnique({ where: { id_tipo: idNum } });
    } else {
      tipo = await prisma.tipo_actividad.findUnique({ where: { nombre: identifier } });
    }

    if (!tipo) return res.status(404).json({ message: "Tipo no encontrado" });

    return res.json({ tipo });
  } catch (error) {
    console.error("[imagenes] getActivityImageByType failed:", error);
    return res.status(500).json({ message: "Error obteniendo tipo", detail: error.message });
  }
}

/**
 * Crear o actualizar un tipo de actividad con su imagen (solo admin)
 * POST /api/imagenes
 * Body: { id_tipo?, nombre, imagen_url, descripcion? }
 */
async function uploadActivityImage(req, res) {
  const tipo_id = req.body?.id_tipo ? Number(req.body.id_tipo) : null;
  const tipo_nombre = String(req.body?.nombre || "").trim();
  const imagen_url = String(req.body?.imagen_url || "").trim();
  const descripcion = String(req.body?.descripcion || "").trim() || null;

  if (!imagen_url) return res.status(400).json({ message: "URL de imagen requerida" });
  if (!tipo_nombre && !tipo_id) return res.status(400).json({ message: "Nombre de tipo o id requerido" });

  try {
    let tipo;

    if (tipo_id && Number.isInteger(tipo_id) && tipo_id > 0) {
      tipo = await prisma.tipo_actividad.update({
        where: { id_tipo: tipo_id },
        data: {
          nombre: tipo_nombre || undefined,
          imagen_url,
          descripcion
        }
      });
    } else {
      tipo = await prisma.tipo_actividad.upsert({
        where: { nombre: tipo_nombre },
        update: { imagen_url, descripcion },
        create: { nombre: tipo_nombre, imagen_url, descripcion }
      });
    }

    return res.status(201).json({ ok: true, tipo });
  } catch (error) {
    console.error("[imagenes] uploadActivityImage failed:", error);
    return res.status(500).json({ message: "Error guardando tipo de actividad", detail: error.message });
  }
}

/**
 * Subir archivo de imagen desde el servidor (solo admin)
 * POST /api/imagenes/upload
 * FormData: file, nombre, descripcion, id_tipo?
 */
async function uploadActivityImageFile(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "Archivo de imagen requerido" });

    const nombre = String(req.body?.nombre || "").trim();
    const descripcion = String(req.body?.descripcion || "").trim() || null;
    const tipo_id = req.body?.id_tipo ? Number(req.body.id_tipo) : null;

    if (!nombre && !(tipo_id && Number.isInteger(tipo_id) && tipo_id > 0)) {
      return res.status(400).json({ message: "Nombre de tipo o id requerido" });
    }

    // Guardado local temporal en backend
    fs.mkdirSync(uploadsDir, { recursive: true });

    const extFromMime = req.file.mimetype === "image/png" ? ".png" : req.file.mimetype === "image/gif" ? ".gif" : ".jpg";
    const originalBase = (req.file.originalname || "tipo").replace(/\.[^/.]+$/, "").replace(/[^a-z0-9\-_]/gi, "_");
    const finalName = `${Date.now()}_${originalBase || "tipo"}${extFromMime}`;
    const absoluteFilePath = path.join(uploadsDir, finalName);
    fs.writeFileSync(absoluteFilePath, req.file.buffer);

    const publicUrl = `${getPublicBaseUrl(req)}/uploads/tipos-actividad/${finalName}`;

    let tipo;
    if (tipo_id && Number.isInteger(tipo_id) && tipo_id > 0) {
      tipo = await prisma.tipo_actividad.update({
        where: { id_tipo: tipo_id },
        data: { nombre: nombre || undefined, imagen_url: publicUrl, descripcion }
      });
    } else {
      tipo = await prisma.tipo_actividad.upsert({
        where: { nombre },
        update: { imagen_url: publicUrl, descripcion },
        create: { nombre, imagen_url: publicUrl, descripcion }
      });
    }

    return res.status(201).json({ ok: true, tipo, url: publicUrl });
  } catch (error) {
    console.error("[imagenes] uploadActivityImageFile failed:", error);
    return res.status(500).json({ message: "Error subiendo imagen", detail: error.message });
  }
}

/**
 * Eliminar tipo de actividad (solo admin)
 * DELETE /api/imagenes/:tipo
 */
async function deleteActivityImage(req, res) {
  const typeId = Number(req.params.tipo);
  if (!Number.isInteger(typeId) || typeId <= 0) return res.status(400).json({ message: "id de tipo inválido" });

  try {
    const tipo = await prisma.tipo_actividad.findUnique({ where: { id_tipo: typeId } });
    if (!tipo) return res.status(404).json({ message: "Tipo no encontrado" });

    await prisma.tipo_actividad.delete({ where: { id_tipo: typeId } });
    return res.json({ ok: true, message: "Tipo de actividad eliminado" });
  } catch (error) {
    console.error("[imagenes] deleteActivityImage failed:", error);
    return res.status(500).json({ message: "Error eliminando tipo de actividad", detail: error.message });
  }
}

module.exports = {
  getActivityImages,
  getActivityImageByType,
  uploadActivityImage,
  uploadActivityImageFile,
  deleteActivityImage
};
