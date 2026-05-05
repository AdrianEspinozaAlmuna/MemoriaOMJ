const { prisma } = require("../prisma/client");

function normalizeNotificationText(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const text = value.trim();
  return text || fallback;
}

function uniqueIntegerIds(values = []) {
  return [...new Set(values.map(value => Number(value)).filter(value => Number.isInteger(value) && value > 0))];
}

function normalizeUserId(payload = {}) {
  const userId = Number(payload.id_usuario ?? payload.id_receptor ?? payload.receiverId ?? payload.userId);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

function sqlLiteral(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }

  if (value instanceof Date) {
    return `'${value.toISOString().replace(/'/g, "''")}'`;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  }

  return `'${String(value).replace(/'/g, "''")}'`;
}

async function createNotificationRecord(db = prisma, payload = {}) {
  // receptor (destinatario) — puede venir como id_usuario o id_receptor
  const idReceptor = payload.id_receptor == null ? normalizeUserId(payload) : Number(payload.id_receptor);
  const idReceptorValid = Number.isInteger(Number(idReceptor)) && idReceptor > 0 ? idReceptor : null;

  // emisor (quien envía) — debe venir en payload.id_emisor
  const idEmisor = payload.id_emisor == null ? null : Number(payload.id_emisor);
  const idEmisorValid = Number.isInteger(Number(idEmisor)) && idEmisor > 0 ? idEmisor : null;

  // receptor is required for per-user notifications; for system (broadcast) receptor can be null
  if (!idReceptorValid && !idEmisorValid) {
    return null;
  }

  const titulo = normalizeNotificationText(payload.titulo);
  if (!titulo) {
    return null;
  }

  const idReceptorRaw = idReceptorValid;
  const idActividadRaw = payload.id_actividad == null ? null : Number(payload.id_actividad);
  const idEmisorRaw = idEmisorValid;
  const tipo = payload.tipo === "actividad" ? "actividad" : "sistema";
  const descripcion = payload.descripcion == null ? null : String(payload.descripcion).trim() || null;

  // Evitar duplicados recientes: si ya existe una notificación con los mismos
  // campos clave en los últimos 2 minutos, no crearla de nuevo.
  try {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const dupSql = `
      SELECT 1 FROM notificaciones n
      WHERE n.titulo = ${sqlLiteral(titulo)}
        AND (n.descripcion IS NOT DISTINCT FROM ${sqlLiteral(descripcion)})
        AND (n.id_actividad IS NOT DISTINCT FROM ${sqlLiteral(Number.isInteger(idActividadRaw) ? idActividadRaw : null)})
        AND n.fecha_envio >= ${sqlLiteral(twoMinutesAgo)}
        AND (
          (${idReceptorRaw !== null ? `n.id_receptor = ${sqlLiteral(idReceptorRaw)}` : "n.id_receptor IS NULL"})
        )
      LIMIT 1
    `;
    const dupQuery = await db.$queryRawUnsafe(dupSql);

    if (Array.isArray(dupQuery) && dupQuery.length > 0) {
      return null;
    }
  } catch (_e) {
    // si falla la comprobación de duplicados, continuamos
  }

  // Inserción cruda usando las columnas reales: id_emisor, id_receptor
  try {
    const insertSql = `
      INSERT INTO notificaciones (id_emisor, id_receptor, id_actividad, tipo, titulo, descripcion)
      VALUES (
        ${sqlLiteral(idEmisorRaw)},
        ${sqlLiteral(idReceptorRaw)},
        ${sqlLiteral(Number.isInteger(idActividadRaw) ? idActividadRaw : null)},
        ${sqlLiteral(tipo)},
        ${sqlLiteral(titulo)},
        ${sqlLiteral(descripcion)}
      )
      RETURNING *
    `;
    const inserted = await db.$queryRawUnsafe(insertSql);

    const row = Array.isArray(inserted) ? inserted[0] : inserted;
    return row || null;
  } catch (err) {
    // fallback: intentar con Prisma ORM si la inserción cruda falla
    try {
      return await db.notificaciones.create({
        data: {
          id_usuario: idReceptorRaw || idEmisorRaw,
          id_actividad: Number.isInteger(idActividadRaw) ? idActividadRaw : null,
          tipo,
          titulo,
          descripcion
        }
      });
    } catch (err2) {
      throw err; // regresa el error original para logging upstream
    }
  }
}

async function createNotificationsForUsers(db = prisma, idEmisor, userIds = [], payload = {}) {
  const recipients = uniqueIntegerIds(userIds);
  if (!Number.isInteger(Number(idEmisor)) || recipients.length === 0) {
    return [];
  }

  const notifications = [];
  for (const id_usuario of recipients) {
    const created = await createNotificationRecord(db, { ...payload, id_receptor: id_usuario, id_emisor: idEmisor });
    if (created) {
      notifications.push(created);
    }
  }

  return notifications;
}

async function createSystemNotification(db = prisma, idEmisor, payload = {}) {
  return createNotificationRecord(db, { ...payload, id_emisor: idEmisor, id_receptor: null, tipo: "sistema" });
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