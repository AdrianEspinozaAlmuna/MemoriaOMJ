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
    const whereClause = unreadOnly ? `WHERE n.id_usuario = ${idUsuario} AND n.leida = false` : `WHERE n.id_usuario = ${idUsuario}`;

    const rows = await prisma.$queryRawUnsafe(`
      SELECT n.*,
        u.id_usuario, u.nombre, u.apellido, u.mail, u.rol,
        a.id_actividad AS actividad_id, a.titulo AS actividad_titulo, a.fecha AS actividad_fecha
      FROM notificaciones n
      LEFT JOIN usuario u ON u.id_usuario = n.id_usuario
      LEFT JOIN actividad a ON a.id_actividad = n.id_actividad
      ${whereClause}
      ORDER BY n.fecha_envio DESC, n.id_notificacion DESC
    `);

    const mapped = rows.map(r => ({
      id_notificacion: r.id_notificacion,
      id_usuario: r.id_usuario,
      id_actividad: r.id_actividad,
      tipo: r.tipo,
      titulo: r.titulo,
      descripcion: r.descripcion,
      leida: r.leida,
      fecha_lectura: r.fecha_lectura,
      fecha_envio: r.fecha_envio,
      usuario: r.id_usuario ? { id_usuario: r.id_usuario, nombre: r.nombre, apellido: r.apellido, mail: r.mail, rol: r.rol } : null,
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

  if (!idUsuario) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  try {
    const where = {};
    if (unreadOnly) {
      where.leida = false;
    }
    if (tipo && ["sistema", "actividad"].includes(tipo)) {
      where.tipo = tipo;
    }
    if (Number.isInteger(idActividad)) {
      where.id_actividad = idActividad;
    }

    const notifications = await prisma.notificaciones.findMany({
      where,
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
      },
      orderBy: [{ fecha_envio: "desc" }, { id_notificacion: "desc" }]
    });

    return res.json({ notifications: notifications.map(serializeNotification) });
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
    const unreadCount = await prisma.notificaciones.count({
      where: {
        id_usuario: idUsuario,
        leida: false
      }
    });

    return res.json({ unreadCount });
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
    // Verify ownership
    const found = await prisma.notificaciones.findUnique({
      where: { id_notificacion: idNotificacion }
    });

    if (!found) {
      return res.status(404).json({ message: "Notificacion no encontrada" });
    }

    if (found.id_usuario !== idUsuario) {
      return res.status(403).json({ message: "No tienes permiso para ver esta notificacion" });
    }

    // Mark as read
    const updated = await prisma.notificaciones.update({
      where: { id_notificacion: idNotificacion },
      data: {
        leida: true,
        fecha_lectura: new Date()
      },
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

    return res.json({ ok: true, notification: serializeNotification(updated) });
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
    const result = await prisma.notificaciones.updateMany({
      where: {
        id_usuario: idUsuario,
        leida: false
      },
      data: {
        leida: true,
        fecha_lectura: new Date()
      }
    });

    return res.json({ ok: true, updatedCount: result.count });
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