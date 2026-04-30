const { prisma } = require("../prisma/client");
const { getUserIdFromToken } = require("../middleware/auth");
const { emitActivityMessage } = require("../realtime");

function parseActivityId(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function parseUserId(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

async function syncActivityStatuses(db = prisma) {
  // Usa hora de Chile para asegurar transiciones coherentes con la operación local.
  await db.$executeRaw`
    UPDATE actividad
    SET estado = 'finalizada'::estado_actividad
    WHERE aprobado = true
      AND estado IN ('pendiente'::estado_actividad, 'programada'::estado_actividad, 'en_curso'::estado_actividad)
      AND (fecha + COALESCE(hora_termino, hora_inicio)) <= (CURRENT_TIMESTAMP AT TIME ZONE 'America/Santiago')::timestamp
  `;

  await db.$executeRaw`
    UPDATE actividad
    SET estado = 'en_curso'::estado_actividad
    WHERE aprobado = true
      AND estado IN ('pendiente'::estado_actividad, 'programada'::estado_actividad)
      AND (fecha + hora_inicio) <= (CURRENT_TIMESTAMP AT TIME ZONE 'America/Santiago')::timestamp
      AND (fecha + COALESCE(hora_termino, hora_inicio)) > (CURRENT_TIMESTAMP AT TIME ZONE 'America/Santiago')::timestamp
  `;

  await db.$executeRaw`
    UPDATE actividad
    SET estado = 'programada'::estado_actividad
    WHERE aprobado = true
      AND estado = 'pendiente'::estado_actividad
      AND (fecha + hora_inicio) > (CURRENT_TIMESTAMP AT TIME ZONE 'America/Santiago')::timestamp
  `;

  return true;
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
    place: activity.sala?.nombre || activity.lugar || "Lugar por confirmar",
    lugar: activity.sala?.nombre || activity.lugar || "Lugar por confirmar",
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
    state: activity.estado,
    status: mapEstadoToUi(activity.estado, membership?.rol),
    estado: activity.estado,
    rol_en_actividad: membership?.rol || null,
    chat_bidireccional: activity.chat_bidireccional
  };
}

async function listActivities(req, res) {
  const includePending = req.query.includePending === "1";
  const onlyMine = req.query.onlyMine === "1";
  const estado = req.query.estado; // Nuevo: filtro por estado
  const aprobado = req.query.aprobado; // Nuevo: filtro por aprobado
  const currentUserId = getUserIdFromToken(req.user || {});

  const where = {
    ...(aprobado === "true" ? { aprobado: true } : {}),
    ...(aprobado === "false" ? { aprobado: false } : {}),
    ...(estado ? { estado } : {}),
    ...(includePending
      ? {}
      : aprobado === undefined && !estado
      ? {
          aprobado: true,
          estado: { in: ["programada", "en_curso", "finalizada"] }
        }
      : {}),
    ...(onlyMine && currentUserId ? { id_encargado: currentUserId } : {})
  };

  try {
    await syncActivityStatuses();

    const items = await prisma.actividad.findMany({
      where,
      orderBy: [{ fecha: "asc" }, { hora_inicio: "asc" }],
      include: {
        usuario: { select: { id_usuario: true, nombre: true, apellido: true } },
        sala: { select: { id_sala: true, nombre: true, capacidad: true } },
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
    await syncActivityStatuses();

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
    await syncActivityStatuses();

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
        asistio: item.asistio,
        valoracion: item.valoracion
      }));

    const ratingValues = participants
      .map(item => Number(item.valoracion))
      .filter(value => Number.isInteger(value) && value >= 1 && value <= 5);

    const ratingsDistribution = [5, 4, 3, 2, 1].map(stars => ({
      stars,
      count: ratingValues.filter(value => value === stars).length
    }));

    const ratingsTotal = ratingValues.length;
    const ratingsAverage =
      ratingsTotal > 0
        ? Number((ratingValues.reduce((sum, value) => sum + value, 0) / ratingsTotal).toFixed(1))
        : 0;

    const messages = activity.actividad_mensaje.map(item => ({
      id: item.id_mensaje,
      userId: item.id_usuario,
      author: `${item.usuario.nombre} ${item.usuario.apellido || ""}`.trim(),
      role: item.usuario.rol === "admin" ? "admin" : item.id_usuario === activity.id_encargado ? "encargado" : "participante",
      text: item.mensaje,
      date: item.fecha
    }));

    return res.json({
      ...base,
      participants,
      messages,
      ratings: {
        average: ratingsAverage,
        total: ratingsTotal,
        distribution: ratingsDistribution
      }
    });
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
  const id_sala = req.body?.id_sala ?? null;

  const activityTitle = (title || titulo || "").trim();
  const activityDescription = (description || descripcion || "").trim();
  const activityDate = new Date(date || fecha || "");
  const startTime = timeStringToDate(hora_inicio);
  const endTime = timeStringToDate(hora_termino);
  const maxParticipants = Number(max_participantes ?? capacity ?? 0);
  let activityPlace = (lugar || place || "").trim();
  let salaId = null;
  if (id_sala) {
    const sala = await prisma.salas.findUnique({ where: { id_sala: Number(id_sala) } });
    if (sala) {
      salaId = sala.id_sala;
      activityPlace = sala.nombre;
    }
  }

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
        ...(salaId ? { id_sala: salaId } : { lugar: { equals: activityPlace, mode: "insensitive" } }),
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
          id_sala: salaId,
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
    await syncActivityStatuses();

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
    await syncActivityStatuses();

    const activity = await prisma.actividad.findUnique({
      where: { id_actividad: idActividad },
      select: { id_actividad: true, estado: true, id_encargado: true }
    });

    if (!activity) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }

    if (activity.estado === "en_curso") {
      return res.status(400).json({ message: "No puedes cancelar la inscripción cuando la actividad está en curso" });
    }

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

async function markMyAttendance(req, res) {
  const idActividad = parseActivityId(req.params.id_actividad);
  const idUsuario = getUserIdFromToken(req.user);

  if (!idActividad) {
    return res.status(400).json({ message: "id_actividad invalido" });
  }

  if (!idUsuario) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  try {
    await syncActivityStatuses();

    const activity = await prisma.actividad.findUnique({
      where: { id_actividad: idActividad },
      select: { id_actividad: true, estado: true }
    });

    if (!activity) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }

    if (activity.estado !== "en_curso") {
      return res.status(400).json({ message: "Solo puedes marcar asistencia cuando la actividad está en curso" });
    }

    const membership = await prisma.actividad_participantes.findUnique({
      where: {
        id_actividad_id_usuario: {
          id_actividad: idActividad,
          id_usuario: idUsuario
        }
      },
      select: { rol: true, asistio: true }
    });

    if (!membership || membership.rol !== "participante") {
      return res.status(403).json({ message: "Solo participantes inscritos pueden marcar asistencia" });
    }

    if (membership.asistio) {
      return res.json({ ok: true, message: "Asistencia ya registrada" });
    }

    await prisma.actividad_participantes.update({
      where: {
        id_actividad_id_usuario: {
          id_actividad: idActividad,
          id_usuario: idUsuario
        }
      },
      data: {
        asistio: true
      }
    });

    return res.json({ ok: true, message: "Asistencia registrada correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error registrando asistencia", detail: error.message });
  }
}

async function markParticipantAttendance(req, res) {
  const idActividad = parseActivityId(req.params.id_actividad);
  const idUsuarioObjetivo = parseUserId(req.params.id_usuario);
  const idUsuario = getUserIdFromToken(req.user);

  if (!idActividad || !idUsuarioObjetivo) {
    return res.status(400).json({ message: "Parametros invalidos" });
  }

  if (!idUsuario) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  try {
    await syncActivityStatuses();

    const activity = await prisma.actividad.findUnique({
      where: { id_actividad: idActividad },
      select: { id_actividad: true, estado: true, id_encargado: true }
    });

    if (!activity) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }

    if (activity.estado !== "en_curso") {
      return res.status(400).json({ message: "Solo puedes marcar asistencia cuando la actividad está en curso" });
    }

    const isAdmin = req.user?.rol === "admin";
    const isOwner = Number(activity.id_encargado) === idUsuario;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "No tienes permisos para marcar asistencia en esta actividad" });
    }

    const membership = await prisma.actividad_participantes.findUnique({
      where: {
        id_actividad_id_usuario: {
          id_actividad: idActividad,
          id_usuario: idUsuarioObjetivo
        }
      },
      select: { rol: true, asistio: true }
    });

    if (!membership || membership.rol !== "participante") {
      return res.status(404).json({ message: "Participante no encontrado en esta actividad" });
    }

    if (membership.asistio) {
      return res.json({ ok: true, message: "Asistencia ya registrada" });
    }

    await prisma.actividad_participantes.update({
      where: {
        id_actividad_id_usuario: {
          id_actividad: idActividad,
          id_usuario: idUsuarioObjetivo
        }
      },
      data: {
        asistio: true
      }
    });

    return res.json({ ok: true, message: "Asistencia registrada correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error registrando asistencia de participante", detail: error.message });
  }
}

async function removeParticipant(req, res) {
  const idActividad = parseActivityId(req.params.id_actividad);
  const idUsuarioObjetivo = parseUserId(req.params.id_usuario);
  const idUsuario = getUserIdFromToken(req.user);

  if (!idActividad || !idUsuarioObjetivo) {
    return res.status(400).json({ message: "Parametros invalidos" });
  }

  if (!idUsuario) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  try {
    await syncActivityStatuses();

    const activity = await prisma.actividad.findUnique({
      where: { id_actividad: idActividad },
      select: { id_actividad: true, estado: true, id_encargado: true }
    });

    if (!activity) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }

    if (["finalizada", "cancelada"].includes(activity.estado)) {
      return res.status(400).json({ message: "No puedes expulsar participantes en una actividad finalizada o cancelada" });
    }

    const isAdmin = req.user?.rol === "admin";
    const isOwner = Number(activity.id_encargado) === idUsuario;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "No tienes permisos para expulsar participantes en esta actividad" });
    }

    const membership = await prisma.actividad_participantes.findUnique({
      where: {
        id_actividad_id_usuario: {
          id_actividad: idActividad,
          id_usuario: idUsuarioObjetivo
        }
      },
      select: { rol: true }
    });

    if (!membership || membership.rol !== "participante") {
      return res.status(404).json({ message: "Participante no encontrado en esta actividad" });
    }

    await prisma.actividad_participantes.delete({
      where: {
        id_actividad_id_usuario: {
          id_actividad: idActividad,
          id_usuario: idUsuarioObjetivo
        }
      }
    });

    return res.json({ ok: true, message: "Participante expulsado correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error expulsando participante", detail: error.message });
  }
}

async function rateActivity(req, res) {
  const idActividad = parseActivityId(req.params.id_actividad);
  const idUsuario = getUserIdFromToken(req.user);
  const ratingValue = Number(req.body?.valoracion ?? req.body?.rating);

  if (!idActividad) {
    return res.status(400).json({ message: "id_actividad invalido" });
  }

  if (!idUsuario) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
    return res.status(400).json({ message: "La valoracion debe estar entre 1 y 5" });
  }

  try {
    await syncActivityStatuses();

    const activity = await prisma.actividad.findUnique({
      where: { id_actividad: idActividad },
      select: { id_actividad: true, estado: true }
    });

    if (!activity) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }

    if (activity.estado !== "finalizada") {
      return res.status(400).json({ message: "Solo puedes valorar una actividad finalizada" });
    }

    if (req.user?.rol === "admin") {
      return res.status(403).json({ message: "El admin no puede valorar actividades" });
    }

    if (Number(activity.id_encargado) === idUsuario) {
      return res.status(403).json({ message: "El encargado de la actividad no puede valorarla" });
    }

    const membership = await prisma.actividad_participantes.findUnique({
      where: {
        id_actividad_id_usuario: {
          id_actividad: idActividad,
          id_usuario: idUsuario
        }
      },
      select: { rol: true }
    });

    if (!membership || membership.rol !== "participante") {
      return res.status(403).json({ message: "Solo los participantes inscritos pueden valorar" });
    }

    await prisma.actividad_participantes.update({
      where: {
        id_actividad_id_usuario: {
          id_actividad: idActividad,
          id_usuario: idUsuario
        }
      },
      data: { valoracion: ratingValue }
    });

    return res.json({ ok: true, message: "Valoracion registrada correctamente", valoracion: ratingValue });
  } catch (error) {
    return res.status(500).json({ message: "Error registrando valoracion", detail: error.message });
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

    if (action === "approve") {
      await syncActivityStatuses();
    }

    return res.json({
      ok: true,
      message: action === "approve" ? "Actividad aprobada correctamente" : "Actividad rechazada correctamente",
      activity: serializeActivity(updated)
    });
  } catch (error) {
    return res.status(500).json({ message: "Error revisando actividad", detail: error.message });
  }
}

async function cancelActivity(req, res) {
  const idActividad = parseActivityId(req.params.id_actividad);
  const idUsuario = getUserIdFromToken(req.user);

  if (!idActividad) {
    return res.status(400).json({ message: "id_actividad invalido" });
  }

  if (!idUsuario) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  try {
    await syncActivityStatuses();

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

    const isAdmin = req.user?.rol === "admin";
    const isOwner = Number(existing.id_encargado) === idUsuario;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "No tienes permisos para cancelar esta actividad" });
    }

    if (existing.estado === "cancelada") {
      return res.status(400).json({ message: "La actividad ya se encuentra cancelada" });
    }

    if (existing.estado === "finalizada") {
      return res.status(400).json({ message: "No puedes cancelar una actividad finalizada" });
    }

    const updated = await prisma.actividad.update({
      where: { id_actividad: idActividad },
      data: {
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
      message: "Actividad cancelada correctamente",
      activity: serializeActivity(updated, idUsuario)
    });
  } catch (error) {
    return res.status(500).json({ message: "Error cancelando actividad", detail: error.message });
  }
}

async function createActivityMessage(req, res) {
  const idActividad = parseActivityId(req.params.id_actividad);
  const idUsuario = getUserIdFromToken(req.user);
  const text = String(req.body?.mensaje ?? req.body?.message ?? "").trim();

  if (!idActividad) {
    return res.status(400).json({ message: "id_actividad invalido" });
  }

  if (!idUsuario) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  if (!text) {
    return res.status(400).json({ message: "El mensaje no puede estar vacío" });
  }

  if (text.length > 2000) {
    return res.status(400).json({ message: "El mensaje supera el largo máximo permitido (2000 caracteres)" });
  }

  try {
    const activity = await prisma.actividad.findUnique({
      where: { id_actividad: idActividad },
      select: {
        id_actividad: true,
        id_encargado: true,
        chat_bidireccional: true,
        estado: true
      }
    });

    if (!activity) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }

    if (activity.estado === "cancelada") {
      return res.status(400).json({ message: "No se pueden enviar mensajes en una actividad cancelada" });
    }

    const isAdmin = req.user?.rol === "admin";

    const membership = await prisma.actividad_participantes.findUnique({
      where: {
        id_actividad_id_usuario: {
          id_actividad: idActividad,
          id_usuario: idUsuario
        }
      },
      select: { rol: true }
    });

    if (!isAdmin && !membership) {
      return res.status(403).json({ message: "No participas en esta actividad" });
    }

    const isOwner = Number(activity.id_encargado) === idUsuario;
    const isManager = isAdmin || isOwner || membership?.rol === "encargado";

    if (!activity.chat_bidireccional && !isManager) {
      return res.status(403).json({ message: "Este chat permite mensajes solo de encargados y admin" });
    }

    const createdMessage = await prisma.actividad_mensaje.create({
      data: {
        id_actividad: idActividad,
        id_usuario: idUsuario,
        mensaje: text,
        fecha: new Date()
      },
      include: {
        usuario: { select: { id_usuario: true, nombre: true, apellido: true, rol: true } }
      }
    });

    const serializedMessage = {
      id: createdMessage.id_mensaje,
      userId: createdMessage.id_usuario,
      author: `${createdMessage.usuario.nombre} ${createdMessage.usuario.apellido || ""}`.trim(),
      role:
        createdMessage.usuario.rol === "admin"
          ? "admin"
          : createdMessage.id_usuario === activity.id_encargado
          ? "encargado"
          : "participante",
      text: createdMessage.mensaje,
      date: createdMessage.fecha
    };

    emitActivityMessage(idActividad, serializedMessage);

    return res.status(201).json({
      ok: true,
      message: "Mensaje enviado correctamente",
      chatMessage: serializedMessage
    });
  } catch (error) {
    return res.status(500).json({ message: "Error enviando mensaje", detail: error.message });
  }
}

module.exports = {
  listActivities,
  listAdminActivities,
  getActivityById,
  createActivity,
  enrollInActivity,
  cancelEnrollment,
  markMyAttendance,
  markParticipantAttendance,
  removeParticipant,
  rateActivity,
  reviewActivity,
  cancelActivity,
  createActivityMessage
};
