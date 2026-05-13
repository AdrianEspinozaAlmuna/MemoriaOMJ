const jwt = require("jsonwebtoken");
const { prisma } = require("../prisma/client");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

function extractBearerToken(req) {
  const header = req.headers?.authorization || req.headers?.Authorization;
  if (!header || typeof header !== "string") return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  return match[1].trim();
}

function getUserIdFromToken(payload = {}) {
  const raw = payload?.id_usuario ?? payload?.idUsuario ?? payload?.userId ?? payload?.sub;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function requireAuth(req, res, next) {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return res.status(401).json({ message: "Token de acceso requerido" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const idUsuario = getUserIdFromToken(decoded);
    if (!idUsuario) {
      return res.status(401).json({ message: "Token inválido" });
    }

    req.user = {
      ...decoded,
      id_usuario: idUsuario,
      rol: decoded?.rol || "participante"
    };

    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}

function requireRole(...allowedRoles) {
  const normalizedAllowed = allowedRoles.map(r => String(r).toLowerCase());

  return (req, res, next) => {
    const role = String(req.user?.rol || "").toLowerCase();
    if (!role) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    if (!normalizedAllowed.includes(role)) {
      return res.status(403).json({ message: "No autorizado para esta acción" });
    }

    return next();
  };
}

function requireActivityRole(...allowedRoles) {
  const normalizedAllowed = allowedRoles.map(r => String(r).toLowerCase());

  return async (req, res, next) => {
    try {
      const idUsuario = getUserIdFromToken(req.user || {});
      if (!idUsuario) return res.status(401).json({ message: "Usuario no autenticado" });

      if (String(req.user?.rol || "").toLowerCase() === "admin") {
        return next();
      }

      const idActividad = Number(req.params?.id_actividad ?? req.params?.activityId ?? req.body?.id_actividad);
      if (!Number.isInteger(idActividad) || idActividad <= 0) {
        return res.status(400).json({ message: "id_actividad inválido" });
      }

      const participant = await prisma.actividad_participantes.findUnique({
        where: {
          id_actividad_id_usuario: {
            id_actividad: idActividad,
            id_usuario: idUsuario
          }
        },
        select: { rol: true }
      });

      if (!participant) {
        return res.status(403).json({ message: "No perteneces a esta actividad" });
      }

      const roleInActivity = String(participant.rol || "").toLowerCase();
      if (!normalizedAllowed.includes(roleInActivity)) {
        return res.status(403).json({ message: "No tienes el rol requerido en esta actividad" });
      }

      req.activityRole = roleInActivity;
      return next();
    } catch (error) {
      return res.status(500).json({ message: "Error validando rol de actividad", detail: error.message });
    }
  };
}

module.exports = {
  getUserIdFromToken,
  requireAuth,
  requireRole,
  requireActivityRole
};
