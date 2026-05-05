const { prisma } = require("../prisma/client");
const {
  createNotificationRecord,
  createNotificationsForUsers,
  createSystemNotification,
  notifyAdminUsers
} = require("../services/notificationService");
const { emitNotificationCreated } = require("../realtime");
const { getUserIdFromToken } = require("../middleware/auth");

function parseNotificationId(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function parseTargetUserIds(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map(item => Number(item)).filter(item => Number.isInteger(item) && item > 0))];
}

async function serializeNotificationWithRelations(notification) {
  if (!notification) return null;

  // Load relations if not already loaded
  const loaded = await prisma.notificaciones.findUnique({
    where: { id_notificacion: notification.id_notificacion },
    include: {
      usuario: {
        select: {
          id_usuario: true,
          nombre: true,
          apellido: true,
          mail: true,
          rol: true
        }
      },
      actividad: {
        select: {
          id_actividad: true,
          titulo: true,
          fecha: true
        }
      }
    }
  });

  return serializeNotification(loaded);
}

function serializeNotification(notification) {
  const read = Boolean(notification?.leida ?? notification?.read ?? false);
  return {
    id: notification.id_notificacion,
    id_notificacion: notification.id_notificacion,
    id_usuario: notification.id_usuario,
    receiverId: notification.id_usuario,
    activityId: notification.id_actividad,
    id_actividad: notification.id_actividad,
    type: notification.tipo,
    tipo: notification.tipo,
    title: notification.titulo,
    titulo: notification.titulo,
    description: notification.descripcion,
    descripcion: notification.descripcion,
    read,
    leida: read,
    readAt: notification.fecha_lectura ?? notification.readAt ?? null,
    fecha_lectura: notification.fecha_lectura ?? notification.readAt ?? null,
    sentAt: notification.fecha_envio,
    fecha_envio: notification.fecha_envio,
    sender: null,
    receiver: notification.usuario
      ? {
          id: notification.usuario.id_usuario,
          nombre: notification.usuario.nombre,
          apellido: notification.usuario.apellido,
          mail: notification.usuario.mail,
          rol: notification.usuario.rol
        }
      : null,
    activity: notification.actividad
      ? {
          id: notification.actividad.id_actividad,
          id_actividad: notification.actividad.id_actividad,
          title: notification.actividad.titulo,
          titulo: notification.actividad.titulo,
          date: notification.actividad.fecha
        }
      : null
  };
}

async function listMyNotifications(req, res) {
  const idUsuario = getUserIdFromToken(req.user || {});
  const unreadOnly = req.query.unreadOnly === "1" || req.query.unreadOnly === "true";

  if (!idUsuario) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  try {
    const whereClause = `WHERE (n.id_receptor = ${idUsuario} OR n.id_receptor IS NULL)`;

    const rows = await prisma.$queryRawUnsafe(`
      SELECT n.*,
        n.id_emisor AS id_usuario,
        su.id_usuario AS emisor_id, su.nombre AS emisor_nombre, su.apellido AS emisor_apellido, su.mail AS emisor_mail, su.rol AS emisor_rol,
        ru.id_usuario AS receptor_id, ru.nombre AS receptor_nombre, ru.apellido AS receptor_apellido, ru.mail AS receptor_mail, ru.rol AS receptor_rol,
        a.id_actividad AS actividad_id, a.titulo AS actividad_titulo, a.fecha AS actividad_fecha
      FROM notificaciones n
      LEFT JOIN usuario su ON su.id_usuario = n.id_emisor
      LEFT JOIN usuario ru ON ru.id_usuario = n.id_receptor
      LEFT JOIN actividad a ON a.id_actividad = n.id_actividad
      ${whereClause}
      ORDER BY n.fecha_envio DESC, n.id_notificacion DESC
    `);

    const mapped = rows.map(r => ({
      id_notificacion: r.id_notificacion,
      id_emisor: r.id_emisor,
      id_receptor: r.id_receptor,
      id_actividad: r.id_actividad,
      tipo: r.tipo,
      titulo: r.titulo,
      descripcion: r.descripcion,
      fecha_lectura: r.fecha_lectura,
      fecha_envio: r.fecha_envio,
      usuario: r.emisor_id ? { id_usuario: r.emisor_id, nombre: r.emisor_nombre, apellido: r.emisor_apellido, mail: r.emisor_mail, rol: r.emisor_rol } : null,
      receptor: r.receptor_id ? { id_usuario: r.receptor_id, nombre: r.receptor_nombre, apellido: r.receptor_apellido, mail: r.receptor_mail, rol: r.receptor_rol } : null,
      actividad: r.actividad_id ? { id_actividad: r.actividad_id, titulo: r.actividad_titulo, fecha: r.actividad_fecha } : null
    }));

    return res.json({ notifications: mapped.map(serializeNotification) });
  } catch (error) {
    console.error("[notifications] listMyNotifications failed:", error);
    return res.status(500).json({ message: "Error obteniendo notificaciones", detail: error.message });
  }
}

async function listAdminNotifications(req, res) {
  const idUsuario = getUserIdFromToken(req.user || {});
  const unreadOnly = req.query.unreadOnly === "1" || req.query.unreadOnly === "true";
  const tipo = req.query.tipo;
  const idActividad = req.query.id_actividad ? Number(req.query.id_actividad) : null;
  const idReceptorFiltro = req.query.id_receptor ? Number(req.query.id_receptor) : null;
  const idEmisorFiltro = req.query.id_emisor ? Number(req.query.id_emisor) : null;

  if (!idUsuario) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  try {
    // Consulta cruda para admin: filtra por tipo, actividad o receptor si se piden.
    const conditions = [];
    if (tipo && ["sistema", "actividad"].includes(tipo)) conditions.push(`n.tipo = '${tipo}'`);
    if (Number.isInteger(idActividad)) conditions.push(`n.id_actividad = ${idActividad}`);
    if (Number.isInteger(idReceptorFiltro)) conditions.push(`n.id_receptor = ${idReceptorFiltro}`);
    if (Number.isInteger(idEmisorFiltro)) conditions.push(`n.id_emisor = ${idEmisorFiltro}`);
    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const sql = `
      SELECT n.*, 
        n.id_emisor AS id_usuario,
        su.id_usuario AS emisor_id, su.nombre AS emisor_nombre, su.apellido AS emisor_apellido, su.mail AS emisor_mail, su.rol AS emisor_rol,
        ru.id_usuario AS receptor_id, ru.nombre AS receptor_nombre, ru.apellido AS receptor_apellido, ru.mail AS receptor_mail, ru.rol AS receptor_rol,
        a.id_actividad AS actividad_id, a.titulo AS actividad_titulo, a.fecha AS actividad_fecha
      FROM notificaciones n
      LEFT JOIN usuario su ON su.id_usuario = n.id_emisor
      LEFT JOIN usuario ru ON ru.id_usuario = n.id_receptor
      LEFT JOIN actividad a ON a.id_actividad = n.id_actividad
      ${whereSql}
      ORDER BY n.fecha_envio DESC, n.id_notificacion DESC
    `;

    const rows = await prisma.$queryRawUnsafe(sql);
    const mapped = rows.map(r => ({
      id_notificacion: r.id_notificacion,
      id_emisor: r.id_emisor,
      id_receptor: r.id_receptor,
      id_actividad: r.id_actividad,
      tipo: r.tipo,
      titulo: r.titulo,
      descripcion: r.descripcion,
      fecha_lectura: r.fecha_lectura,
      fecha_envio: r.fecha_envio,
      usuario: r.emisor_id ? { id_usuario: r.emisor_id, nombre: r.emisor_nombre, apellido: r.emisor_apellido, mail: r.emisor_mail, rol: r.emisor_rol } : null,
      receptor: r.receptor_id ? { id_usuario: r.receptor_id, nombre: r.receptor_nombre, apellido: r.receptor_apellido, mail: r.receptor_mail, rol: r.receptor_rol } : null,
      actividad: r.actividad_id ? { id_actividad: r.actividad_id, titulo: r.actividad_titulo, fecha: r.actividad_fecha } : null
    }));

    return res.json({ notifications: mapped.map(serializeNotification) });
  } catch (error) {
    console.error("[notifications] listAdminNotifications failed:", error);
    return res.status(500).json({ message: "Error obteniendo notificaciones admin", detail: error.message });
  }
}

async function countUnreadNotifications(req, res) {
  const idUsuario = getUserIdFromToken(req.user || {});

  if (!idUsuario) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  try {
    return res.json({ unreadCount: 0 });
  } catch (error) {
    console.error("[notifications] countUnreadNotifications failed:", error);
    return res.status(500).json({ message: "Error obteniendo contador de notificaciones", detail: error.message });
  }
}

async function markNotificationAsRead(req, res) {
  const idUsuario = getUserIdFromToken(req.user || {});
  const idNotificacion = parseNotificationId(req.params.id_notificacion);

  if (!idUsuario) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  if (!idNotificacion) {
    return res.status(400).json({ message: "id_notificacion invalido" });
  }

  try {
    const found = await prisma.$queryRawUnsafe(
      `SELECT n.*, su.id_usuario AS emisor_id, su.nombre AS emisor_nombre, su.apellido AS emisor_apellido, su.mail AS emisor_mail, su.rol AS emisor_rol,
             ru.id_usuario AS receptor_id, ru.nombre AS receptor_nombre, ru.apellido AS receptor_apellido, ru.mail AS receptor_mail, ru.rol AS receptor_rol,
             a.id_actividad AS actividad_id, a.titulo AS actividad_titulo, a.fecha AS actividad_fecha
      FROM notificaciones n
      LEFT JOIN usuario su ON su.id_usuario = n.id_emisor
      LEFT JOIN usuario ru ON ru.id_usuario = n.id_receptor
      LEFT JOIN actividad a ON a.id_actividad = n.id_actividad
      WHERE n.id_notificacion = ${idNotificacion} AND (n.id_receptor = ${idUsuario} OR n.id_receptor IS NULL)
      LIMIT 1`
    );
    const existing = Array.isArray(found) ? found[0] : found;
    if (!existing) {
      return res.status(404).json({ message: "Notificacion no encontrada" });
    }

    // La tabla ya no persiste estado de lectura; mantenemos la ruta compatible sin mutar datos.

    // read back the updated row
    const updatedRows = await prisma.$queryRawUnsafe(
      `SELECT n.*, su.id_usuario AS emisor_id, su.nombre AS emisor_nombre, su.apellido AS emisor_apellido, su.mail AS emisor_mail, su.rol AS emisor_rol,
             ru.id_usuario AS receptor_id, ru.nombre AS receptor_nombre, ru.apellido AS receptor_apellido, ru.mail AS receptor_mail, ru.rol AS receptor_rol,
             a.id_actividad AS actividad_id, a.titulo AS actividad_titulo, a.fecha AS actividad_fecha
      FROM notificaciones n
      LEFT JOIN usuario su ON su.id_usuario = n.id_emisor
      LEFT JOIN usuario ru ON ru.id_usuario = n.id_receptor
      LEFT JOIN actividad a ON a.id_actividad = n.id_actividad
      WHERE n.id_notificacion = ${idNotificacion}
      LIMIT 1`
    );
    const updated = Array.isArray(updatedRows) ? updatedRows[0] : updatedRows;
    const mapped = {
      id_notificacion: updated.id_notificacion,
      id_emisor: updated.id_emisor,
      id_receptor: updated.id_receptor,
      id_actividad: updated.id_actividad,
      tipo: updated.tipo,
      titulo: updated.titulo,
      descripcion: updated.descripcion,
      fecha_lectura: updated.fecha_lectura,
      fecha_envio: updated.fecha_envio,
      usuario: updated.emisor_id ? { id_usuario: updated.emisor_id, nombre: updated.emisor_nombre, apellido: updated.emisor_apellido, mail: updated.emisor_mail, rol: updated.emisor_rol } : null,
      receptor: updated.receptor_id ? { id_usuario: updated.receptor_id, nombre: updated.receptor_nombre, apellido: updated.receptor_apellido, mail: updated.receptor_mail, rol: updated.receptor_rol } : null,
      actividad: updated.actividad_id ? { id_actividad: updated.actividad_id, titulo: updated.actividad_titulo, fecha: updated.actividad_fecha } : null
    };

    return res.json({ ok: true, notification: serializeNotification(mapped) });
  } catch (error) {
    console.error("[notifications] markNotificationAsRead failed:", error);
    return res.status(500).json({ message: "Error marcando notificacion como leida", detail: error.message });
  }
}

async function markAllNotificationsAsRead(req, res) {
  const idUsuario = getUserIdFromToken(req.user || {});

  if (!idUsuario) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  try {
    return res.json({ ok: true, updatedCount: 0 });
  } catch (error) {
    console.error("[notifications] markAllNotificationsAsRead failed:", error);
    return res.status(500).json({ message: "Error marcando notificaciones como leidas", detail: error.message });
  }
}

async function createBroadcastNotification(req, res) {
  const idEmisor = getUserIdFromToken(req.user || {});
  const isAdmin = req.user?.rol === "admin";
  const titulo = String(req.body?.titulo ?? req.body?.title ?? "").trim();
  const descripcion = String(req.body?.descripcion ?? req.body?.detail ?? "").trim();
  const idActividad = req.body?.id_actividad == null ? null : Number(req.body.id_actividad);

  if (!idEmisor) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  if (!isAdmin) {
    return res.status(403).json({ message: "No tienes permisos para publicar notificaciones" });
  }

  if (!titulo) {
    return res.status(400).json({ message: "El titulo de la notificacion es requerido" });
  }

  try {
    const created = await createSystemNotification(prisma, idEmisor, {
      titulo,
      descripcion,
      tipo: "sistema",
      id_actividad: Number.isInteger(idActividad) ? idActividad : null
    });

    if (!created) {
      return res.status(500).json({ message: "Error creando notificacion" });
    }

    emitNotificationCreated(serializeNotification({
      id_notificacion: created.id_notificacion,
      id_emisor: created.id_emisor,
      id_receptor: created.id_receptor,
      id_actividad: created.id_actividad,
      tipo: created.tipo,
      titulo: created.titulo,
      descripcion: created.descripcion,
      fecha_lectura: created.fecha_lectura,
      fecha_envio: created.fecha_envio,
      id_usuario: created.id_emisor,
      usuario: created.id_emisor ? { id_usuario: created.id_emisor } : null,
      receptor: created.id_receptor ? { id_usuario: created.id_receptor } : null,
      actividad: created.id_actividad ? { id_actividad: created.id_actividad } : null
    }), { broadcast: true });

    const mapped = {
      id_notificacion: created.id_notificacion,
      id_emisor: created.id_emisor,
      id_receptor: created.id_receptor,
      id_actividad: created.id_actividad,
      tipo: created.tipo,
      titulo: created.titulo,
      descripcion: created.descripcion,
      fecha_lectura: created.fecha_lectura,
      fecha_envio: created.fecha_envio,
      id_usuario: created.id_emisor,
      usuario: created.id_emisor ? { id_usuario: created.id_emisor } : null,
      receptor: created.id_receptor ? { id_usuario: created.id_receptor } : null,
      actividad: created.id_actividad ? { id_actividad: created.id_actividad } : null
    };

    return res.status(201).json({ ok: true, updatedCount: 1, notification: serializeNotification(mapped) });
  } catch (error) {
    console.error("[notifications] createBroadcastNotification failed:", error);
    return res.status(500).json({ message: "Error creando notificacion", detail: error.message });
  }
}

async function createDirectNotification(req, res) {
  const idEmisor = getUserIdFromToken(req.user || {});
  const isAdmin = req.user?.rol === "admin";
  const targetId = Number(req.body?.id_receptor ?? req.body?.receiverId ?? req.body?.id_usuario ?? req.body?.userId);
  const titulo = String(req.body?.titulo ?? req.body?.title ?? "").trim();
  const descripcion = String(req.body?.descripcion ?? req.body?.detail ?? "").trim();

  if (!idEmisor) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  if (!Number.isInteger(targetId) || targetId <= 0) {
    return res.status(400).json({ message: "id_receptor invalido" });
  }

  if (!isAdmin && idEmisor !== targetId) {
    return res.status(403).json({ message: "No tienes permisos para crear esta notificacion" });
  }

  if (!titulo) {
    return res.status(400).json({ message: "El titulo de la notificacion es requerido" });
  }

  try {
    const created = await createNotificationRecord(prisma, {
      id_receptor: targetId,
      id_emisor: idEmisor,
      titulo,
      descripcion,
      tipo: req.body?.tipo === "actividad" ? "actividad" : "sistema",
      id_actividad: req.body?.id_actividad ?? null
    });

    if (!created) {
      return res.status(500).json({ message: "Error creando notificacion" });
    }

    emitNotificationCreated(serializeNotification({
      id_notificacion: created.id_notificacion,
      id_emisor: created.id_emisor,
      id_receptor: created.id_receptor,
      id_actividad: created.id_actividad,
      tipo: created.tipo,
      titulo: created.titulo,
      descripcion: created.descripcion,
      fecha_lectura: created.fecha_lectura,
      fecha_envio: created.fecha_envio,
      usuario: created.id_emisor ? { id_usuario: created.id_emisor } : null,
      receptor: created.id_receptor ? { id_usuario: created.id_receptor } : null,
      actividad: created.id_actividad ? { id_actividad: created.id_actividad } : null
    }), { targetUserIds: [targetId] });

    const mapped = {
      id_notificacion: created.id_notificacion,
      id_emisor: created.id_emisor,
      id_receptor: created.id_receptor,
      id_actividad: created.id_actividad,
      tipo: created.tipo,
      titulo: created.titulo,
      descripcion: created.descripcion,
      fecha_lectura: created.fecha_lectura,
      fecha_envio: created.fecha_envio,
      usuario: created.id_emisor ? { id_usuario: created.id_emisor } : null,
      receptor: created.id_receptor ? { id_usuario: created.id_receptor } : null,
      actividad: created.id_actividad ? { id_actividad: created.id_actividad } : null
    };

    return res.status(201).json({ ok: true, notification: serializeNotification(mapped) });
  } catch (error) {
    console.error("[notifications] createDirectNotification failed:", error);
    return res.status(500).json({ message: "Error creando notificacion", detail: error.message });
  }
}

module.exports = {
  listMyNotifications,
  listAdminNotifications,
  countUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createBroadcastNotification,
  createDirectNotification
};