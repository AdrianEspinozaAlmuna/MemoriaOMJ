const { initFirebaseAdmin, sendToTokens } = require("../firebaseAdmin");

const INVALID_TOKEN_CODES = new Set([
  "messaging/invalid-registration-token",
  "messaging/registration-token-not-registered"
]);

function toSerializableData(notification = {}) {
  const data = {
    notificationId: String(notification.id_notificacion || notification.id || ""),
    type: String(notification.tipo || "sistema")
  };

  if (notification.id_actividad != null) {
    data.activityId = String(notification.id_actividad);
  }

  if (notification.id_receptor != null) {
    data.receiverId = String(notification.id_receptor);
  }

  return data;
}

function chunkArray(items = [], size = 500) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function backupNotificationToFirestore(notification = {}) {
  try {
    const admin = initFirebaseAdmin();
    if (!admin.apps || admin.apps.length === 0) {
      return { ok: false, skipped: true, reason: "firebase-admin-not-initialized" };
    }

    let db = null;
    try {
      db = admin.firestore();
    } catch (err) {
      console.warn("[notifications] Firestore not available or not initialized:", err?.message);
      return { ok: false, skipped: true, reason: "firestore-unavailable", error: err?.message };
    }

    if (!db) {
      return { ok: false, skipped: true, reason: "firestore-null" };
    }

    const notificationId = String(notification.id_notificacion || notification.id || "").trim();
    if (!notificationId) {
      return { ok: false, skipped: true, reason: "missing-notification-id" };
    }

    await db
      .collection("notifications_backup")
      .doc(notificationId)
      .set(
        {
          id_notificacion: notification.id_notificacion,
          id_emisor: notification.id_emisor,
          id_receptor: notification.id_receptor ?? null,
          id_actividad: notification.id_actividad ?? null,
          tipo: notification.tipo,
          titulo: notification.titulo,
          descripcion: notification.descripcion ?? null,
          leida: Boolean(notification.leida),
          fecha_envio: notification.fecha_envio ? new Date(notification.fecha_envio) : new Date(),
          updatedAt: new Date(),
          source: "postgres"
        },
        { merge: true }
      );

    return { ok: true };
  } catch (error) {
    console.error("[notifications] Firestore backup failed - Code:", error?.code, "Message:", error?.message || error);
    return { ok: false, error: error.message || String(error) };
  }
}

function collectInvalidTokens(batchTokens = [], fcmResponse = {}) {
  const invalid = [];
  const results = Array.isArray(fcmResponse.results) ? fcmResponse.results : [];

  results.forEach((result, index) => {
    const code = result?.error?.code;
    if (code && INVALID_TOKEN_CODES.has(code)) {
      const token = batchTokens[index];
      if (token) {
        invalid.push(token);
      }
    }
  });

  return invalid;
}

async function sendPushForNotification(db, notification = {}) {
  const title = String(notification.titulo || "").trim();
  if (!title) {
    return { ok: false, skipped: true, reason: "empty-title" };
  }

  try {
    const where = notification.id_receptor
      ? { id_usuario: Number(notification.id_receptor) }
      : {};

    const tokenRows = await db.fcm_token.findMany({
      where,
      select: { token: true }
    });

    const tokens = [...new Set(tokenRows.map(row => row.token).filter(Boolean))];

    if (tokens.length === 0) {
      return { ok: true, skipped: true, reason: "no-tokens" };
    }

    let successCount = 0;
    let failureCount = 0;
    const invalidTokens = [];

    const chunks = chunkArray(tokens, 500);
    for (const tokenChunk of chunks) {
      const response = await sendToTokens(tokenChunk, {
        title,
        body: notification.descripcion || "",
        data: toSerializableData(notification)
      });

      successCount += Number(response?.successCount || 0);
      failureCount += Number(response?.failureCount || 0);
      invalidTokens.push(...collectInvalidTokens(tokenChunk, response));
    }

    if (invalidTokens.length > 0) {
      await db.fcm_token.deleteMany({
        where: {
          token: {
            in: [...new Set(invalidTokens)]
          }
        }
      });
    }

    return {
      ok: true,
      successCount,
      failureCount,
      cleanedInvalidTokens: invalidTokens.length
    };
  } catch (error) {
    console.error("[notifications] send push failed:", error.message || error);
    return { ok: false, error: error.message || String(error) };
  }
}

async function dispatchNotificationSideEffects(db, notification = {}) {
  const [backup, push] = await Promise.all([
    backupNotificationToFirestore(notification),
    sendPushForNotification(db, notification)
  ]);

  return { backup, push };
}

module.exports = {
  dispatchNotificationSideEffects,
  backupNotificationToFirestore,
  sendPushForNotification
};
