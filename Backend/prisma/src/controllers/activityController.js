const { prisma } = require("../prisma/client");
const { getUserIdFromToken } = require("../middleware/auth");

function parseActivityId(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function timeStringToDate(time) {
  if (!time || typeof time !== "string") return null;
  const normalized = /^\d{2}:\d{2}$/.test(time) ? `${time}:00` : time;
  const parsed = new Date(`1970-01-01T${normalized}Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toDateLabel(dateValue) {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function toTimeLabel(timeValue) {
  if (!timeValue) return null;
  const date = new Date(timeValue);
  if (Number.isNaN(date.getTime())) return null;
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function hasTimeOverlap({ newStart, newEnd, existingStart, existingEnd }) {
  const safeNewEnd = newEnd || newStart;
  const safeExistingEnd = existingEnd || existingStart;

  if (!newStart || !safeNewEnd || !existingStart || !safeExistingEnd) {
    return false;
  }

  if (newStart.getTime() === existingStart.getTime()) {
    return true;
  }

  return existingStart < safeNewEnd && safeExistingEnd > newStart;
}

function mapEstadoToUi(estado, membershipRole) {
  if (membershipRole === "participante") return "inscrito";
  if (estado === "pendiente") return "pendiente";
  if (estado === "cancelada") return "cancelada";
  return "disponible";
}

function serializeActivity(activity, currentUserId = null) {
  const membership = currentUserId
    ? activity.actividad_participantes?.find(item => item.id_usuario === currentUserId) || null
    : null;

  const enrolledCount =
    activity._count?.actividad_participantes ??
    activity.actividad_participantes?.filter(item => item.rol === "participante").length ??
    0;

  return {
    id: activity.id_actividad,
    id_actividad: activity.id_actividad,
    title: activity.titulo,
    titulo: activity.titulo,
    description: activity.descripcion || "",
    descripcion: activity.descripcion || "",
    date: toDateLabel(activity.fecha),
    fecha: toDateLabel(activity.fecha),
    time: toTimeLabel(activity.hora_inicio),
    hora_inicio: toTimeLabel(activity.hora_inicio),
    hora_termino: toTimeLabel(activity.hora_termino),
    place: activity.lugar || "",
    lugar: activity.lugar || "",
    manager: activity.usuario?.nombre
      ? `${activity.usuario.nombre} ${activity.usuario.apellido || ""}`.trim()
      : null,
    id_encargado: activity.id_encargado,
    capacity: activity.max_participantes,
    max_participantes: activity.max_participantes,
    enrolled: enrolledCount,
    inscritos: enrolledCount,
    approved: activity.aprobado,
    aprobado: activity.aprobado,
    status: mapEstadoToUi(activity.estado, membership?.rol),
    estado: activity.estado,
    rol_en_actividad: membership?.rol || null,
    chat_bidireccional: activity.chat_bidireccional
  };
}

async function listActivities(req, res) {
  const includePending = req.query.includePending === "1";
  const onlyMine = req.query.onlyMine === "1";
  const currentUserId = getUserIdFromToken(req.user || {});

  const where = {
    ...(includePending
      ? {}
      : {
          aprobado: true,
          estado: { in: ["programada", "en_curso", "finalizada"] }
        }),
    ...(onlyMine && currentUserId ? { id_encargado: currentUserId } : {})
  };

  try {
    const items = await prisma.actividad.findMany({
      where,
      orderBy: [{ fecha: "asc" }, { hora_inicio: "asc" }],
      include: {
        usuario: { select: { id_usuario: true, nombre: true, apellido: true } },
        actividad_participantes: currentUserId
          ? {
              where: { id_usuario: currentUserId },
              select: { id_usuario: true, rol: true }
            }
          : false,
        _count: {
          select: {
            actividad_participantes: {
              where: { rol: "participante" }
            }
          }
        }
      }
    });

    return res.json(items.map(item => serializeActivity(item, currentUserId)));
  } catch (error) {
    return res.status(500).json({ message: "Error obteniendo actividades", detail: error.message });
  }
}

async function listAdminActivities(req, res) {
  const aprobadoRaw = req.query.aprobado;
  const estado = req.query.estado;

  const where = {
    ...(aprobadoRaw === "true" ? { aprobado: true } : {}),
    ...(aprobadoRaw === "false" ? { aprobado: false } : {}),
    ...(estado ? { estado } : {})
  };

  try {
    const items = await prisma.actividad.findMany({
      where,
      orderBy: [{ fecha: "asc" }, { hora_inicio: "asc" }],
      include: {
        usuario: { select: { id_usuario: true, nombre: true, apellido: true } },
        _count: {
          select: {
            actividad_participantes: {
              where: { rol: "participante" }
            }
          }
        }
      }
    });

    return res.json(items.map(item => serializeActivity(item)));
  } catch (error) {
    return res.status(500).json({ message: "Error obteniendo actividades admin", detail: error.message });
  }
}

async function getActivityById(req, res) {
  const idActividad = parseActivityId(req.params.id_actividad);
  const currentUserId = getUserIdFromToken(req.user || {});

  if (!idActividad) {
    return res.status(400).json({ message: "id_actividad invalido" });
  }

  try {
    const activity = await prisma.actividad.findUnique({
      where: { id_actividad: idActividad },
      include: {
        usuario: { select: { id_usuario: true, nombre: true, apellido: true } },
        actividad_participantes: {
          include: {
            usuario: {
              select: { id_usuario: true, nombre: true, apellido: true }
            }
          }
        },
        actividad_mensaje: {
          orderBy: { id_mensaje: "asc" },
          include: {
            usuario: { select: { id_usuario: true, nombre: true, apellido: true, rol: true } }
          }
        },
        _count: {
          select: {
            actividad_participantes: {
              where: { rol: "participante" }
            }
          }
        }
      }
    });

    if (!activity) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }

    const base = serializeActivity(activity, currentUserId);
    const participants = activity.actividad_participantes
      .filter(item => item.rol === "participante")
      .map(item => ({
        id: item.usuario.id_usuario,
        name: `${item.usuario.nombre} ${item.usuario.apellido || ""}`.trim(),
        status: item.asistio ? "Asistencia registrada" : "Confirmado",
        asistio: item.asistio
      }));

    const messages = activity.actividad_mensaje.map(item => ({
      id: item.id_mensaje,
      author: `${item.usuario.nombre} ${item.usuario.apellido || ""}`.trim(),
      role: item.usuario.rol === "admin" ? "admin" : item.id_usuario === activity.id_encargado ? "encargado" : "participante",
      text: item.mensaje,
      date: item.fecha
    }));

    return res.json({ ...base, participants, messages });
  } catch (error) {
    return res.status(500).json({ message: "Error obteniendo actividad", detail: error.message });
  }
}

async function createActivity(req, res) {
  const idEncargado = getUserIdFromToken(req.user);
  if (!idEncargado) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  const {
    title,
    titulo,
    description,
    descripcion,
    date,
    fecha,
    hora_inicio,
    hora_termino,
    max_participantes,
    capacity,
    lugar,
    place,
    chat_bidireccional = true
  } = req.body || {};

  const activityTitle = (title || titulo || "").trim();
  const activityDescription = (description || descripcion || "").trim();
  const activityDate = new Date(date || fecha || "");
  const startTime = timeStringToDate(hora_inicio);
  const endTime = timeStringToDate(hora_termino);
  const maxParticipants = Number(max_participantes ?? capacity ?? 0);
  const activityPlace = (lugar || place || "").trim();

  if (!activityTitle || !activityDate || Number.isNaN(activityDate.getTime()) || !startTime) {
    return res.status(400).json({ message: "Faltan datos requeridos de actividad" });
  }

  if (endTime && endTime <= startTime) {
    return res.status(400).json({ message: "hora_termino debe ser mayor a hora_inicio" });
  }

  if (!Number.isInteger(maxParticipants) || maxParticipants < 1) {
    return res.status(400).json({ message: "max_participantes invalido" });
  }

  if (!activityPlace) {
    return res.status(400).json({ message: "lugar es requerido" });
  }

  try {
    const sameRoomActivities = await prisma.actividad.findMany({
      where: {
        fecha: activityDate,
        lugar: {
          equals: activityPlace,
          mode: "insensitive"
        },
        estado: {
          in: ["pendiente", "programada", "en_curso"]
        }
      },
      select: {
        id_actividad: true,
        titulo: true,
        hora_inicio: true,
        hora_termino: true
      }
    });

    const conflictingActivity = sameRoomActivities.find(existing =>
      hasTimeOverlap({
        newStart: startTime,
        newEnd: endTime,
        existingStart: existing.hora_inicio,
        existingEnd: existing.hora_termino
      })
    );

    if (conflictingActivity) {
      return res.status(409).json({
        message: "Ya existe una actividad en la misma sala y horario.",
        conflict: {
          id_actividad: conflictingActivity.id_actividad,
          titulo: conflictingActivity.titulo,
          hora_inicio: toTimeLabel(conflictingActivity.hora_inicio),
          hora_termino: toTimeLabel(conflictingActivity.hora_termino)
        }
      });
    }

    const created = await prisma.$transaction(async tx => {
      const newActivity = await tx.actividad.create({
        data: {
          id_encargado: idEncargado,
          titulo: activityTitle,
          descripcion: activityDescription || null,
          fecha: activityDate,
          hora_inicio: startTime,
          hora_termino: endTime,
          max_participantes: maxParticipants,
          lugar: activityPlace || null,
          chat_bidireccional: Boolean(chat_bidireccional),
          aprobado: false,
          estado: "pendiente"
        },
        include: {
          usuario: { select: { id_usuario: true, nombre: true, apellido: true } },
          _count: {
            select: {
              actividad_participantes: {
                where: { rol: "participante" }
              }
            }
          }
        }
      });

      await tx.actividad_participantes.create({
        data: {
          id_actividad: newActivity.id_actividad,
          id_usuario: idEncargado,
          rol: "encargado"
        }
      });

      return newActivity;
    });

    return res.status(201).json({ ok: true, activity: serializeActivity(created, idEncargado) });
  } catch (error) {
    return res.status(500).json({ message: "Error creando actividad", detail: error.message });
  }
}

async function enrollInActivity(req, res) {
  const idActividad = parseActivityId(req.params.id_actividad);
  const idUsuario = getUserIdFromToken(req.user);

  if (!idActividad) {
    return res.status(400).json({ message: "id_actividad invalido" });
  }

  if (!idUsuario) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  try {
    const activity = await prisma.actividad.findUnique({
      where: { id_actividad: idActividad },
      select: {
        id_actividad: true,
        aprobado: true,
        estado: true,
        max_participantes: true,
        _count: {
          select: {
            actividad_participantes: {
              where: { rol: "participante" }
            }
          }
        }
      }
    });

    if (!activity) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }

    if (!activity.aprobado || !["programada", "en_curso"].includes(activity.estado)) {
      return res.status(400).json({ message: "La actividad no admite inscripciones" });
    }

    const existing = await prisma.actividad_participantes.findUnique({
      where: {
        id_actividad_id_usuario: {
          id_actividad: idActividad,
          id_usuario: idUsuario
        }
      }
    });

    if (existing) {
      return res.json({ ok: true, enrolled: true });
    }

    const enrolledCount = activity._count.actividad_participantes;
    if (activity.max_participantes && enrolledCount >= activity.max_participantes) {
      return res.status(400).json({ message: "No hay cupos disponibles" });
    }

    await prisma.actividad_participantes.create({
      data: {
        id_actividad: idActividad,
        id_usuario: idUsuario,
        rol: "participante"
      }
    });

    return res.status(201).json({ ok: true, enrolled: true });
  } catch (error) {
    return res.status(500).json({ message: "Error inscribiendo en actividad", detail: error.message });
  }
}

async function cancelEnrollment(req, res) {
  const idActividad = parseActivityId(req.params.id_actividad);
  const idUsuario = getUserIdFromToken(req.user);

  if (!idActividad) {
    return res.status(400).json({ message: "id_actividad invalido" });
  }

  if (!idUsuario) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  try {
    const existing = await prisma.actividad_participantes.findUnique({
      where: {
        id_actividad_id_usuario: {
          id_actividad: idActividad,
          id_usuario: idUsuario
        }
      }
    });

    if (!existing || existing.rol !== "participante") {
      return res.status(404).json({ message: "No existe una inscripcion activa" });
    }

    await prisma.actividad_participantes.delete({
      where: {
        id_actividad_id_usuario: {
          id_actividad: idActividad,
          id_usuario: idUsuario
        }
      }
    });

    return res.json({ ok: true, enrolled: false });
  } catch (error) {
    return res.status(500).json({ message: "Error cancelando inscripcion", detail: error.message });
  }
}

async function reviewActivity(req, res) {
  const idActividad = parseActivityId(req.params.id_actividad);
  const { action } = req.body || {};

  if (!idActividad) {
    return res.status(400).json({ message: "id_actividad invalido" });
  }

  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json({ message: "Accion invalida. Usa 'approve' o 'reject'" });
  }

  try {
    const existing = await prisma.actividad.findUnique({
      where: { id_actividad: idActividad },
      include: {
        usuario: { select: { id_usuario: true, nombre: true, apellido: true } },
        _count: {
          select: {
            actividad_participantes: {
              where: { rol: "participante" }
            }
          }
        }
      }
    });

    if (!existing) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }

    const updated = await prisma.actividad.update({
      where: { id_actividad: idActividad },
      data:
        action === "approve"
          ? {
              aprobado: true,
              estado: existing.estado === "pendiente" ? "programada" : existing.estado
            }
          : {
              aprobado: false,
              estado: "cancelada"
            },
      include: {
        usuario: { select: { id_usuario: true, nombre: true, apellido: true } },
        _count: {
          select: {
            actividad_participantes: {
              where: { rol: "participante" }
            }
          }
        }
      }
    });

    return res.json({
      ok: true,
      message: action === "approve" ? "Actividad aprobada correctamente" : "Actividad rechazada correctamente",
      activity: serializeActivity(updated)
    });
  } catch (error) {
    return res.status(500).json({ message: "Error revisando actividad", detail: error.message });
  }
}

module.exports = {
  listActivities,
  listAdminActivities,
  getActivityById,
  createActivity,
  enrollInActivity,
  cancelEnrollment,
  reviewActivity
};
