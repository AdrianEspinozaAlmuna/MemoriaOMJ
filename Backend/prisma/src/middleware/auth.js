const jwt = require("jsonwebtoken");
const { prisma } = require("../prisma/client");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "No autorizado" });
  const [scheme, token] = auth.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Formato de token invalido" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Token inválido" });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user?.rol) {
      return res.status(403).json({ message: "Sin rol de usuario en token" });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ message: "No tienes permisos para este recurso" });
    }

    return next();
  };
}

function getUserIdFromToken(userPayload = {}) {
  const raw = userPayload.id_usuario ?? userPayload.id ?? userPayload.userId ?? userPayload.sub;
  const parsed = Number(raw);
  return Number.isInteger(parsed) ? parsed : null;
}

function resolveActivityId(req) {
  const rawActivityId =
    req.params?.id_actividad ??
    req.params?.idActividad ??
    req.body?.id_actividad ??
    req.body?.idActividad ??
    req.query?.id_actividad ??
    req.query?.idActividad;

  const parsed = Number(rawActivityId);
  return Number.isInteger(parsed) ? parsed : null;
}

function requireActivityRole(...allowedRoles) {
  return async (req, res, next) => {
    try {
      if (req.user?.rol === "admin") {
        return next();
      }

      const idActividad = resolveActivityId(req);
      if (!idActividad) {
        return res.status(400).json({ message: "Falta id_actividad para validar permisos" });
      }

      const idUsuario = getUserIdFromToken(req.user);
      if (!idUsuario) {
        return res.status(403).json({ message: "No se pudo identificar al usuario autenticado" });
      }

      const membership = await prisma.actividad_participantes.findUnique({
        where: {
          id_actividad_id_usuario: {
            id_actividad: idActividad,
            id_usuario: idUsuario
          }
        },
        select: {
          id_actividad: true,
          id_usuario: true,
          rol: true,
          asistio: true
        }
      });

      if (!membership) {
        return res.status(403).json({ message: "No participas en esta actividad" });
      }

      if (!allowedRoles.includes(membership.rol)) {
        return res.status(403).json({ message: "Tu rol en la actividad no tiene permisos" });
      }

      req.activityMembership = membership;
      return next();
    } catch (error) {
      return res.status(500).json({ message: "Error validando permisos de actividad", detail: error.message });
    }
  };
}

module.exports = { requireAuth, requireRole, requireActivityRole, getUserIdFromToken };