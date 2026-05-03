const { prisma } = require("../prisma/client");

function normalizeNotificationText(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const text = value.trim();
  return text || fallback;
}

function uniqueIntegerIds(values = []) {
  return [...new Set(values.map(value => Number(value)).filter(value => Number.isInteger(value) && value > 0))];
}

function normalizeSenderId(payload = {}) {
  const senderId = Number(payload.id_emisor ?? payload.senderId ?? payload.id_usuario);
  return Number.isInteger(senderId) && senderId > 0 ? senderId : null;
}

async function createNotificationRecord(db = prisma, payload = {}) {
  const idEmisor = normalizeSenderId(payload);
  if (!idEmisor) {
    return null;
  }

  const titulo = normalizeNotificationText(payload.titulo);
  if (!titulo) {
    return null;
  }

  const idReceptorRaw = payload.id_receptor == null ? null : Number(payload.id_receptor);
  const idActividadRaw = payload.id_actividad == null ? null : Number(payload.id_actividad);
  const tipo = payload.tipo === "actividad" ? "actividad" : "sistema";
  const descripcion = payload.descripcion == null ? null : String(payload.descripcion).trim() || null;

  return db.notificaciones.create({
    data: {
      id_emisor: idEmisor,
      id_receptor: Number.isInteger(idReceptorRaw) ? idReceptorRaw : null,
      id_actividad: Number.isInteger(idActividadRaw) ? idActividadRaw : null,
      tipo,
      titulo,
      descripcion,
      ...(payload.leida == null ? {} : { leida: Boolean(payload.leida) })
    }
  });
}

async function createNotificationsForUsers(db = prisma, idEmisor, userIds = [], payload = {}) {
  const recipients = uniqueIntegerIds(userIds);
  if (!Number.isInteger(Number(idEmisor)) || recipients.length === 0) {
    return [];
  }

  const notifications = [];
  for (const id_receptor of recipients) {
    const created = await createNotificationRecord(db, { ...payload, id_emisor: idEmisor, id_receptor });
    if (created) {
      notifications.push(created);
    }
  }

  return notifications;
}

async function createSystemNotification(db = prisma, idEmisor, payload = {}) {
  return createNotificationRecord(db, {
    ...payload,
    id_emisor: idEmisor,
    id_receptor: null,
    tipo: "sistema"
  });
}

async function notifyAdminUsers(db = prisma, idEmisor, payload = {}) {
  const admins = await db.usuario.findMany({
    where: {
      rol: "admin",
      estado: true
    },
    select: { id_usuario: true }
  });

  return createNotificationsForUsers(
    db,
    idEmisor,
    admins.map(user => user.id_usuario),
    { ...payload, tipo: payload.tipo || "actividad" }
  );
}

async function notifyUsersByIds(db = prisma, idEmisor, userIds = [], payload = {}) {
  return createNotificationsForUsers(db, idEmisor, userIds, payload);
}

async function notifyActivityOwner(db = prisma, idEmisor, activityId, payload = {}) {
  const activity = await db.actividad.findUnique({
    where: { id_actividad: Number(activityId) },
    select: { id_encargado: true }
  });

  if (!activity) {
    return [];
  }

  return createNotificationsForUsers(db, idEmisor, [activity.id_encargado], {
    ...payload,
    tipo: payload.tipo || "actividad",
    id_actividad: activityId
  });
}

async function notifyActivityParticipants(db = prisma, idEmisor, activityId, payload = {}, options = {}) {
  const activity = await db.actividad.findUnique({
    where: { id_actividad: Number(activityId) },
    select: {
      id_encargado: true,
      actividad_participantes: {
        where: { rol: "participante" },
        select: { id_usuario: true }
      }
    }
  });

  if (!activity) {
    return [];
  }

  const recipientIds = activity.actividad_participantes.map(item => item.id_usuario);
  if (options.includeOwner) {
    recipientIds.push(activity.id_encargado);
  }

  return createNotificationsForUsers(db, idEmisor, recipientIds, {
    ...payload,
    tipo: payload.tipo || "actividad",
    id_actividad: activityId
  });
}

module.exports = {
  createNotificationRecord,
  createNotificationsForUsers,
  createSystemNotification,
  notifyAdminUsers,
  notifyUsersByIds,
  notifyActivityOwner,
  notifyActivityParticipants
};