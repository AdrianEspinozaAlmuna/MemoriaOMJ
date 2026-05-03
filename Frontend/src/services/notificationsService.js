import api from "./api";

function toDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatRelativeTime(value) {
  const date = toDate(value);
  if (!date) return "Sin fecha";

  const diffMinutes = Math.round((date.getTime() - Date.now()) / 60000);
  const absMinutes = Math.abs(diffMinutes);

  if (absMinutes < 1) {
    return diffMinutes >= 0 ? "Ahora" : "Hace un momento";
  }

  if (absMinutes < 60) {
    return diffMinutes >= 0 ? `En ${absMinutes} min` : `Hace ${absMinutes} min`;
  }

  const absHours = Math.round(absMinutes / 60);
  if (absHours < 24) {
    return diffMinutes >= 0 ? `En ${absHours} h` : `Hace ${absHours} h`;
  }

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function deriveNotificationTheme(notification = {}) {
  const title = String(notification.titulo ?? notification.title ?? "").toLowerCase();
  const description = String(notification.descripcion ?? notification.description ?? "").toLowerCase();
  const text = `${title} ${description}`;

  if (text.includes("aprobad") || text.includes("rechaz")) {
    return { key: "review", label: "Aprobación / rechazo" };
  }

  if (text.includes("cambio") || text.includes("modific") || text.includes("actualiz") || text.includes("cancel") || text.includes("reprogram") || text.includes("inscrip") || text.includes("asist")) {
    return { key: "activity-change", label: "Cambios de actividad" };
  }

  if (String(notification.tipo ?? notification.type ?? "").toLowerCase() === "actividad") {
    return { key: "activity", label: "Actividad" };
  }

  return { key: "general", label: "Generales" };
}

function normalizeNotification(notification = {}) {
  const id = notification.id_notificacion ?? notification.id ?? notification.idNotification;
  const title = String(notification.titulo ?? notification.title ?? "").trim();
  const description = String(notification.descripcion ?? notification.description ?? "").trim();
  const sentAt = notification.fecha_envio ?? notification.sentAt ?? notification.createdAt ?? null;
  const read = Boolean(notification.leida ?? notification.read ?? false);
  const type = String(notification.tipo ?? notification.type ?? "sistema");
  const theme = deriveNotificationTheme(notification);
  const activity = notification.actividad || null;
  const sender = notification.emisor || notification.sender || null;
  const receiver = notification.receptor || notification.receiver || null;

  return {
    id,
    id_notificacion: id,
    id_emisor: notification.id_emisor ?? notification.senderId ?? sender?.id_usuario ?? null,
    id_receptor: notification.id_receptor ?? notification.receiverId ?? receiver?.id_usuario ?? null,
    senderId: notification.id_emisor ?? notification.senderId ?? sender?.id_usuario ?? null,
    receiverId: notification.id_receptor ?? notification.receiverId ?? receiver?.id_usuario ?? null,
    title,
    titulo: title,
    detail: description,
    descripcion: description,
    source: type === "actividad" ? "Actividad" : "Sistema",
    type,
    tipo: type,
    themeKey: theme.key,
    themeLabel: theme.label,
    read,
    leida: read,
    date: formatRelativeTime(sentAt),
    sentAt,
    fecha_envio: sentAt,
    readAt: notification.fecha_lectura ?? notification.readAt ?? null,
    fecha_lectura: notification.fecha_lectura ?? notification.readAt ?? null,
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
    activity: activity
      ? {
          id: activity.id_actividad,
          title: activity.titulo,
          date: activity.fecha
        }
      : null
  };
}

function normalizeList(payload) {
  const items = Array.isArray(payload) ? payload : Array.isArray(payload?.notifications) ? payload.notifications : [];
  return items.map(normalizeNotification);
}

export async function getMyNotifications(params = {}) {
  const { data } = await api.get("/notifications", { params });
  return normalizeList(data);
}

export async function getAdminNotifications(params = {}) {
  const { data } = await api.get("/notifications/admin", { params });
  return normalizeList(data);
}

export async function getUnreadNotificationCount() {
  const { data } = await api.get("/notifications/unread-count");
  return Number(data?.unreadCount ?? 0);
}

export async function markNotificationAsRead(idNotificacion) {
  const { data } = await api.patch(`/notifications/${idNotificacion}/read`);
  return data?.notification ? normalizeNotification(data.notification) : null;
}

export async function markAllNotificationsAsRead() {
  const { data } = await api.patch("/notifications/read-all");
  return Number(data?.updatedCount ?? 0);
}

export async function createBroadcastNotification(payload) {
  const { data } = await api.post("/notifications/broadcast", payload);
  return {
    notification: data?.notification ? normalizeNotification(data.notification) : null
  };
}

export { deriveNotificationTheme, formatRelativeTime, normalizeNotification };