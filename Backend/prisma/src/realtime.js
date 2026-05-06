const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const { prisma } = require("./prisma/client");
const { getUserIdFromToken } = require("./middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

let ioInstance = null;

function getRoomName(activityId) {
  return `activity:${activityId}`;
}

function getUserRoomName(userId) {
  return `user:${userId}`;
}

function getAdminRoomName() {
  return "role:admin";
}

function extractToken(socket) {
  const authToken = socket.handshake?.auth?.token;
  if (authToken) return String(authToken).replace(/^Bearer\s+/i, "");

  const queryToken = socket.handshake?.query?.token;
  if (queryToken) return String(queryToken).replace(/^Bearer\s+/i, "");

  const headerToken = socket.handshake?.headers?.authorization;
  if (headerToken) return String(headerToken).replace(/^Bearer\s+/i, "");

  return null;
}

async function canJoinActivity(userPayload, activityId) {
  const idUsuario = getUserIdFromToken(userPayload);
  if (!idUsuario) return false;

  if (userPayload?.rol === "admin") {
    const activity = await prisma.actividad.findUnique({
      where: { id_actividad: activityId },
      select: { id_actividad: true }
    });
    return Boolean(activity);
  }

  const membership = await prisma.actividad_participantes.findUnique({
    where: {
      id_actividad_id_usuario: {
        id_actividad: activityId,
        id_usuario: idUsuario
      }
    },
    select: { id_actividad: true }
  });

  return Boolean(membership);
}

function initRealtimeServer(httpServer) {
  if (ioInstance) return ioInstance;

  const io = new Server(httpServer, {
    cors: {
      origin: "*"
    }
  });

  io.use((socket, next) => {
    try {
      const token = extractToken(socket);
      if (!token) {
        return next(new Error("No autorizado"));
      }

      const payload = jwt.verify(token, JWT_SECRET);
      socket.data.user = payload;
      return next();
    } catch (_error) {
      return next(new Error("Token invalido"));
    }
  });

  io.on("connection", socket => {
    const userId = getUserIdFromToken(socket.data.user);
    if (userId) {
      socket.join(getUserRoomName(userId));
    }

    if (socket.data.user?.rol === "admin") {
      socket.join(getAdminRoomName());
    }

    socket.on("activity:join", async (payload = {}, ack) => {
      try {
        const activityId = Number(payload?.activityId ?? payload?.id_actividad);
        if (!Number.isInteger(activityId)) {
          if (typeof ack === "function") ack({ ok: false, message: "activityId invalido" });
          return;
        }

        const allowed = await canJoinActivity(socket.data.user, activityId);
        if (!allowed) {
          if (typeof ack === "function") ack({ ok: false, message: "No tienes acceso a esta actividad" });
          return;
        }

        socket.join(getRoomName(activityId));
        if (typeof ack === "function") ack({ ok: true });
      } catch (_error) {
        if (typeof ack === "function") ack({ ok: false, message: "No se pudo unir a la sala" });
      }
    });
  });

  ioInstance = io;
  return io;
}

function emitActivityMessage(activityId, message) {
  if (!ioInstance) return;
  ioInstance.to(getRoomName(activityId)).emit("activity:message:new", message);
}

function emitNotificationCreated(notification, options = {}) {
  if (!ioInstance || !notification) return;

  const targetUserIds = Array.isArray(options.targetUserIds)
    ? options.targetUserIds.map(value => Number(value)).filter(value => Number.isInteger(value) && value > 0)
    : [];

  if (options.broadcastAdmins) {
    ioInstance.to(getAdminRoomName()).emit("notification:new", notification);
    return;
  }

  if (options.broadcast || targetUserIds.length === 0) {
    ioInstance.emit("notification:new", notification);
    return;
  }

  for (const targetUserId of targetUserIds) {
    ioInstance.to(getUserRoomName(targetUserId)).emit("notification:new", notification);
  }
}

module.exports = {
  initRealtimeServer,
  emitActivityMessage,
  emitNotificationCreated,
  getAdminRoomName
};
