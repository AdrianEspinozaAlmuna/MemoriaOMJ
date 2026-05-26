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

  const loaded = await prisma.notificaciones.findUnique({
    where: { id_notificacion: notification.id_notificacion },
    include: {
      emisor: {
        select: {
          id_usuario: true,
          nombre: true,
          apellido: true,
          mail: true,
          rol: true
        }
      },
      receptor: {
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
  const sender = notification?.emisor || notification?.sender || null;
  const receiver = notification?.receptor || notification?.receiver || null;
  return {
    id: notification.id_notificacion,
    id_notificacion: notification.id_notificacion,
    id_emisor: notification.id_emisor ?? sender?.id_usuario ?? null,
    id_receptor: notification.id_receptor ?? receiver?.id_usuario ?? null,
    senderId: notification.id_emisor ?? sender?.id_usuario ?? null,
    receiverId: notification.id_receptor ?? receiver?.id_usuario ?? null,
    activityId: notification.id_actividad,
    id_actividad: notification.id_actividad,
    activityTitle: notification.actividad?.titulo ?? null,
    type: notification.tipo,
    tipo: notification.tipo,
    title: notification.titulo,
    titulo: notification.titulo,
    description: notification.descripcion,
    descripcion: notification.descripcion,
    read,
    leida: read,
    sentAt: notification.fecha_envio,
    fecha_envio: notification.fecha_envio,
    sender: sender
      ? {
          id: sender.id_usuario ?? sender.id ?? null,
          nombre: sender.nombre,
          apellido: sender.apellido,
          mail: sender.mail,
          rol: sender.rol
        }
      : null,
    receiver: receiver
      ? {
          id: receiver.id_usuario ?? receiver.id ?? null,
          nombre: receiver.nombre,
          apellido: receiver.apellido,
          mail: receiver.mail,
          rol: receiver.rol
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
    const notifications = await prisma.notificaciones.findMany({
      where: {
        ...(unreadOnly ? { leida: false } : {}),
        OR: [{ id_receptor: idUsuario }, { id_receptor: null }]
      },
      include: {
        emisor: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            mail: true,
            rol: true
          }
        },
        receptor: {
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
    if (tipo && ["sistema", "actividad", "revision"].includes(tipo)) {
      where.tipo = tipo;
    }
    if (Number.isInteger(idActividad)) {
      where.id_actividad = idActividad;
    }
    where.OR = [{ id_receptor: idUsuario }, { id_receptor: null }];

    const notifications = await prisma.notificaciones.findMany({
      where,
      include: {
        emisor: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            mail: true,
            rol: true
          }
        },
        receptor: {
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
        leida: false,
        OR: [{ id_receptor: idUsuario }, { id_receptor: null }]
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

    if (found.id_receptor !== null && found.id_receptor !== idUsuario) {
      return res.status(403).json({ message: "No tienes permiso para ver esta notificacion" });
    }

    // Mark as read
    const updated = await prisma.notificaciones.update({
      where: { id_notificacion: idNotificacion },
      data: {
        leida: true
      },
      include: {
        emisor: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            mail: true,
            rol: true
          }
        },
        receptor: {
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
        leida: false,
        OR: [{ id_receptor: idUsuario }, { id_receptor: null }]
      },
      data: {
        leida: true
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

    emitNotificationCreated(serializeNotification(created), { broadcast: true });

    return res.status(201).json({ ok: true, updatedCount: 1, notification: serializeNotification(created) });
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

    emitNotificationCreated(serializeNotification(created), { targetUserIds: [targetId] });

    return res.status(201).json({ ok: true, notification: serializeNotification(created) });
  } catch (error) {
    console.error("[notifications] createDirectNotification failed:", error);
    return res.status(500).json({ message: "Error creando notificacion", detail: error.message });
  }
}

// Registrar token FCM para el usuario autenticado
async function registerFcmToken(req, res) {
  const idUsuario = getUserIdFromToken(req.user || {});
  const token = String(req.body?.token || "").trim();
  const platform = String(req.body?.platform || "").slice(0, 255);

  if (!idUsuario) return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  if (!token) return res.status(400).json({ message: "Token FCM requerido" });

  try {
    // Upsert token (permite múltiples tokens por usuario)
    await prisma.fcm_token.upsert({
      where: { token },
      update: { id_usuario: idUsuario, platform, updatedAt: new Date() },
      create: { id_usuario: idUsuario, token, platform }
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error("[notifications] registerFcmToken failed:", error);
    return res.status(500).json({ message: "Error registrando token FCM", detail: error.message });
  }
}

// Endpoint admin: enviar push via Firebase Admin (acepta { tokens: [], title, body, data })
async function adminSendPush(req, res) {
  const isAdmin = req.user?.rol === "admin";
  if (!isAdmin) return res.status(403).json({ message: "No tienes permisos" });

  const tokens = Array.isArray(req.body?.tokens) ? req.body.tokens.filter(Boolean) : [];
  const titulo = String(req.body?.title ?? req.body?.titulo ?? "").trim();
  const body = String(req.body?.body ?? req.body?.descripcion ?? "").trim();
  const data = typeof req.body?.data === "object" ? req.body.data : {};

  if (!tokens.length) return res.status(400).json({ message: "Se requieren tokens para enviar" });

  try {
    const { sendToTokens } = require("../firebaseAdmin");
    const result = await sendToTokens(tokens, { title: titulo, body, data });
    return res.json({ ok: true, result });
  } catch (error) {
    console.error("[notifications] adminSendPush failed:", error);
    return res.status(500).json({ message: "Error enviando notificaciones push", detail: error.message });
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
  ,
  registerFcmToken,
  adminSendPush
};