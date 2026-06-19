const { prisma } = require("../prisma/client");
const { getUserIdFromToken } = require("../middleware/auth");
const { emitActivityMessage, emitNotificationCreated } = require("../realtime");
const {
  createNotificationRecord,
  notifyAdminUsers,
  notifyActivityOwner,
  notifyActivityParticipants,
  notifyUsersByIds
} = require("../services/notificationService");

function parseActivityId(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function parseUserId(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function emitNotificationBatch(notifications = [], batchOptions = {}) {
  if (batchOptions.broadcastAdmins && notifications.length > 0) {
    for (const notification of notifications) {
      emitNotificationCreated(notification, { broadcastAdmins: true });
    }
    return;
  }
  for (const notification of notifications) {
    const targetUserId = Number(notification?.id_receptor ?? notification?.id_usuario);
    const options = Number.isInteger(targetUserId) && targetUserId > 0 ? { targetUserIds: [targetUserId] } : { broadcast: true };
    emitNotificationCreated(notification, options);
  }
}

function quoteActivityTitle(activityTitle) {
  return `"${String(activityTitle || "").trim()}"`;
}

async function notifyActivityOwnerExplicit(db, idEmisor, activityId, payload = {}) {
  const activity = await db.actividad.findUnique({
    where: { id_actividad: Number(activityId) },
    select: { id_encargado: true, titulo: true }
  });

  if (!activity?.id_encargado) {
    return [];
  }

  const created = await createNotificationRecord(db, {
    ...payload,
    id_emisor: idEmisor,
    id_receptor: activity.id_encargado,
    id_actividad: activityId
  });

  if (!created) {
    console.error("[reviewActivity] owner notification was not created", {
      idEmisor,
      idReceptor: activity.id_encargado,
      idActividad: activityId,
      titulo: payload?.titulo
    });
  }

  return created ? [created] : [];
}

function buildActivityRevisionSnapshot(activity) {
  return {
    titulo: activity.titulo,
    descripcion: activity.descripcion || null,
    id_sala: activity.id_sala || null,
    id_tipo_actividad: activity.id_tipo_actividad || null,
    fecha: toDateLabel(activity.fecha),
    hora_inicio: toTimeLabel(activity.hora_inicio),
    hora_termino: toTimeLabel(activity.hora_termino),
    max_participantes: activity.max_participantes || null,
    chat_bidireccional: Boolean(activity.chat_bidireccional),
    aprobado: Boolean(activity.aprobado),
    estado: activity.estado
  };
}

function restoreActivityRevisionSnapshot(snapshot = {}, currentActivity = {}) {
  const restoredDate = snapshot.fecha ? new Date(snapshot.fecha) : currentActivity.fecha;
  const restoredStartTime = snapshot.hora_inicio ? timeStringToDate(snapshot.hora_inicio) : currentActivity.hora_inicio;
  const restoredEndTime = snapshot.hora_termino ? timeStringToDate(snapshot.hora_termino) : currentActivity.hora_termino;

  return {
    titulo: snapshot.titulo ?? currentActivity.titulo,
    descripcion: snapshot.descripcion ?? currentActivity.descripcion,
    id_sala: snapshot.id_sala ?? currentActivity.id_sala,
    id_tipo_actividad: snapshot.id_tipo_actividad ?? currentActivity.id_tipo_actividad,
    fecha: restoredDate,
    hora_inicio: restoredStartTime,
    hora_termino: restoredEndTime,
    max_participantes: snapshot.max_participantes ?? currentActivity.max_participantes,
    chat_bidireccional: typeof snapshot.chat_bidireccional === "boolean" ? snapshot.chat_bidireccional : currentActivity.chat_bidireccional,
    aprobado: typeof snapshot.aprobado === "boolean" ? snapshot.aprobado : currentActivity.aprobado,
    estado: snapshot.estado ?? currentActivity.estado,
    revision_original_data: null
  };
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

function parseLocalDateString(value) {
  if (!value) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parts = value.split("-").map(v => Number(v));
    if (parts.length === 3 && parts.every(n => Number.isInteger(n))) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
  }

  const parsed = new Date(value);
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

function formatDateForDisplay(value) {
  if (!value) return null;
  let year, month, day;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    year = parseInt(value.slice(0, 4), 10);
    month = parseInt(value.slice(5, 7), 10) - 1;
    day = parseInt(value.slice(8, 10), 10);
  } else {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    year = d.getUTCFullYear();
    month = d.getUTCMonth();
    day = d.getUTCDate();
  }
  const date = new Date(year, month, day, 12, 0, 0, 0);
  return date.toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
}

function formatDateTimeForDisplay(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function buildChangesList(snapshot, currentActivity) {
  const fieldLabels = {
    titulo: "Título",
    descripcion: "Descripción",
    fecha: "Fecha",
    hora_inicio: "Hora inicio",
    hora_termino: "Hora término",
    max_participantes: "Máx. participantes",
    chat_bidireccional: "Chat bidireccional"
  };

  const changes = [];

  for (const [field, displayName] of Object.entries(fieldLabels)) {
    let oldVal = snapshot[field];
    let newVal = currentActivity[field];

    if (field === "fecha") {
      oldVal = formatDateForDisplay(oldVal);
      newVal = formatDateForDisplay(newVal);
    } else if (field === "hora_inicio" || field === "hora_termino") {
      oldVal = formatDateTimeForDisplay(oldVal);
      newVal = formatDateTimeForDisplay(newVal);
    } else if (field === "chat_bidireccional") {
      oldVal = oldVal ? "Sí" : "No";
      newVal = newVal ? "Sí" : "No";
    }

    const oldStr = String(oldVal ?? "").trim();
    const newStr = String(newVal ?? "").trim();
    if (oldStr && newStr && oldStr !== newStr) {
      changes.push(`  • ${displayName}: ${oldStr} → ${newStr}`);
    }
  }

  return changes.length > 0 ? `\n\nCambios realizados:\n${changes.join("\n")}` : "";
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
  if (estado === "rechazada") return "rechazada";
  return "disponible";
}

/* --- Reglas de negocio extraídas como funciones puras --- */

function canEnroll(activity) {
  if (!activity) return false;
  if (!activity.aprobado || !["programada", "en_curso"].includes(activity.estado)) return false;
  const enrolledCount = activity._count?.actividad_participantes ?? 0;
  if (activity.max_participantes && enrolledCount >= activity.max_participantes) return false;
  return true;
}

function isInCourse(estado) {
  return estado === "en_curso";
}

function canCancel(estado) {
  return estado !== "finalizada" && estado !== "cancelada";
}

function validateCapacity(maxParticipants, roomCapacity) {
  if (!Number.isInteger(maxParticipants) || maxParticipants < 1) return false;
  if (roomCapacity > 0 && maxParticipants > roomCapacity) return false;
  return true;
}

function isValidMessage(text) {
  if (!text || typeof text !== "string") return false;
  const trimmed = text.trim();
  return trimmed.length > 0 && trimmed.length <= 2000;
}

function canMessageInActivity(estado) {
  return estado !== "cancelada";
}

function validateRating(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 5;
}

function serializeActivity(activity, currentUserId = null) {
  const membership = currentUserId
    ? activity.actividad_participantes?.find(item => item.id_usuario === currentUserId) || null
    : null;

  const enrolledCount =
    activity._count?.actividad_participantes ??
    activity.actividad_participantes?.length ??
    0;

  const tipoActividad = activity.tipo_actividad_rel || null;
  const tipoNombre = tipoActividad?.nombre || "Tipo no especificado";
  const tipoImagen = tipoActividad?.imagen_url || null;

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
    place: activity.sala?.nombre || "Lugar por confirmar",
    lugar: activity.sala?.nombre || "Lugar por confirmar",
    id_sala: activity.id_sala ?? null,
    manager: activity.usuario?.nombre
      ? `${activity.usuario.nombre} ${activity.usuario.apellido || ""}`.trim()
      : null,
    id_encargado: activity.id_encargado,
    id_tipo_actividad: activity.id_tipo_actividad ?? null,
    category: tipoNombre,
    tipo_actividad: tipoActividad
      ? {
          id_tipo: tipoActividad.id_tipo,
          nombre: tipoActividad.nombre,
          imagen_url: tipoActividad.imagen_url
        }
      : null,
    type: tipoNombre,
    image: tipoImagen,
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
    chat_bidireccional: activity.chat_bidireccional,
    revision_pendiente: Boolean(activity.revision_original_data)
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

    const include = {
      usuario: { select: { id_usuario: true, nombre: true, apellido: true } },
      sala: { select: { id_sala: true, nombre: true, capacidad: true } },
      tipo_actividad_rel: { select: { id_tipo: true, nombre: true, imagen_url: true } },
      _count: {
        select: {
          actividad_participantes: true
        }
      }
    };

    if (currentUserId) {
      include.actividad_participantes = {
        where: { id_usuario: currentUserId },
        select: { id_usuario: true, rol: true }
      };
    }

    const items = await prisma.actividad.findMany({
      where,
      orderBy: [{ fecha: "asc" }, { hora_inicio: "asc" }],
      include
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
        sala: { select: { id_sala: true, nombre: true, capacidad: true } },
        tipo_actividad_rel: { select: { id_tipo: true, nombre: true, imagen_url: true } },
        _count: {
          select: {
            actividad_participantes: true
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
        sala: { select: { id_sala: true, nombre: true, capacidad: true } },
        tipo_actividad_rel: { select: { id_tipo: true, nombre: true, imagen_url: true } },
        actividad_participantes: {
          include: {
            usuario: {
              select: { id_usuario: true, nombre: true, apellido: true }
            }
          }
        },
        actividad_grupos: {
          include: {
            grupo: {
              include: {
                usuario: { select: { id_usuario: true, nombre: true, apellido: true } },
                participantes_grupo: {
                  include: {
                    usuario: {
                      select: { id_usuario: true, nombre: true, apellido: true }
                    }
                  }
                }
              }
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
            actividad_participantes: true
          }
        }
      }
    });

    if (!activity) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }

    const base = serializeActivity(activity, currentUserId);
    const participantsById = new Map();

    activity.actividad_participantes.forEach(item => {
      if (item.rol === "encargado") {
        participantsById.set(item.usuario.id_usuario, {
          id: item.usuario.id_usuario,
          name: `${item.usuario.nombre} ${item.usuario.apellido || ""}`.trim(),
          role: "encargado",
          status: "Encargado",
          asistio: item.asistio,
          valoracion: item.valoracion
        });
        return;
      }

      if (item.rol === "participante") {
        participantsById.set(item.usuario.id_usuario, {
          id: item.usuario.id_usuario,
          name: `${item.usuario.nombre} ${item.usuario.apellido || ""}`.trim(),
          role: "participante",
          status: item.asistio ? "Asistencia registrada" : "Confirmado",
          asistio: item.asistio,
          valoracion: item.valoracion
        });
      }
    });

    activity.actividad_grupos.forEach(entry => {
      const grupo = entry.grupo;
      if (!grupo) return;

      const miembrosGrupo = [
        { usuario: grupo.usuario },
        ...grupo.participantes_grupo.map(item => ({ usuario: item.usuario }))
      ];

      for (const member of miembrosGrupo) {
        const usuario = member.usuario;
        if (!usuario || participantsById.has(usuario.id_usuario)) {
          continue;
        }

        participantsById.set(usuario.id_usuario, {
          id: usuario.id_usuario,
          name: `${usuario.nombre} ${usuario.apellido || ""}`.trim(),
          status: "Confirmado",
          asistio: false,
          valoracion: null
        });
      }
    });

    const participants = [...participantsById.values()];
    const enrolledCount = activity.actividad_participantes.length;
    base.enrolled = enrolledCount;
    base.inscritos = enrolledCount;

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

async function requestActivityEdit(req, res) {
  const idActividad = parseActivityId(req.params.id_actividad);
  const idUsuario = getUserIdFromToken(req.user);

  if (!idActividad) {
    return res.status(400).json({ message: "id_actividad invalido" });
  }

  if (!idUsuario) {
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
    chat_bidireccional = true
  } = req.body || {};
  const id_sala = req.body?.id_sala ?? null;
  const id_tipo_actividad_raw = req.body?.id_tipo_actividad;

  const activityTitle = (title || titulo || "").trim();
  const activityDescription = (description || descripcion || "").trim();
  const activityDate = parseLocalDateString(date || fecha || "");
  const startTime = timeStringToDate(hora_inicio);
  const endTime = timeStringToDate(hora_termino);
  const maxParticipants = Number(max_participantes ?? capacity ?? 0);
  const salaId = Number(id_sala);
  const idTipoActividad = Number(id_tipo_actividad_raw);

  if (!activityTitle || !activityDate || Number.isNaN(activityDate.getTime()) || !startTime) {
    return res.status(400).json({ message: "Faltan datos requeridos de actividad" });
  }

  if (endTime && endTime <= startTime) {
    return res.status(400).json({ message: "hora_termino debe ser mayor a hora_inicio" });
  }

  if (!Number.isInteger(maxParticipants) || maxParticipants < 1) {
    return res.status(400).json({ message: "max_participantes invalido" });
  }

  if (!Number.isInteger(salaId) || salaId < 1) {
    return res.status(400).json({ message: "id_sala invalido" });
  }

  if (!Number.isInteger(idTipoActividad) || idTipoActividad < 1) {
    return res.status(400).json({ message: "id_tipo_actividad invalido" });
  }

  try {
    await syncActivityStatuses();

    const existing = await prisma.actividad.findUnique({
      where: { id_actividad: idActividad },
      include: {
        usuario: { select: { id_usuario: true, nombre: true, apellido: true } },
        sala: { select: { id_sala: true, nombre: true, capacidad: true } },
        tipo_actividad_rel: { select: { id_tipo: true, nombre: true, imagen_url: true } },
        actividad_participantes: {
          select: { id_usuario: true, rol: true, asistio: true, valoracion: true }
        },
        _count: {
          select: {
            actividad_participantes: true
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
      return res.status(403).json({ message: "No tienes permisos para editar esta actividad" });
    }

    if (existing.estado === "finalizada") {
      return res.status(400).json({ message: "No puedes editar una actividad finalizada" });
    }

    if (existing.estado === "cancelada") {
      return res.status(400).json({ message: "No puedes editar una actividad cancelada" });
    }

    if (existing.revision_original_data) {
      return res.status(400).json({ message: "Ya existe una solicitud de edición pendiente para esta actividad" });
    }

    if (existing.estado === "en_curso") {
      return res.status(400).json({ message: "No puedes editar una actividad en curso" });
    }

    const room = await prisma.salas.findUnique({ where: { id_sala: salaId } });
    if (!room) {
      return res.status(400).json({ message: "La sala seleccionada no existe" });
    }

    const tipoActividad = await prisma.tipo_actividad.findUnique({ where: { id_tipo: idTipoActividad } });
    if (!tipoActividad) {
      return res.status(400).json({ message: "El tipo de actividad seleccionado no existe" });
    }

    const roomCapacity = Number(room.capacidad ?? room.capacity ?? 0);
    if (Number.isInteger(roomCapacity) && roomCapacity > 0 && maxParticipants > roomCapacity) {
      return res.status(400).json({
        message: "El cupo no puede superar la capacidad de la sala.",
        capacity: roomCapacity
      });
    }

    const enrolledCount = existing._count?.actividad_participantes ?? 0;
    if (maxParticipants < enrolledCount) {
      return res.status(400).json({
        message: "El nuevo cupo no puede ser menor que la cantidad actual de inscritos.",
        enrolled: enrolledCount
      });
    }

    const sameRoomActivities = await prisma.actividad.findMany({
      where: {
        fecha: activityDate,
        id_sala: salaId,
        id_actividad: { not: idActividad },
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

    const conflictingActivity = sameRoomActivities.find(candidate =>
      hasTimeOverlap({
        newStart: startTime,
        newEnd: endTime,
        existingStart: candidate.hora_inicio,
        existingEnd: candidate.hora_termino
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

    const updated = await prisma.actividad.update({
      where: { id_actividad: idActividad },
      data: isAdmin ? {
        titulo: activityTitle,
        descripcion: activityDescription || null,
        id_sala: salaId,
        id_tipo_actividad: idTipoActividad,
        fecha: activityDate,
        hora_inicio: startTime,
        hora_termino: endTime,
        max_participantes: maxParticipants,
        chat_bidireccional: Boolean(chat_bidireccional)
      } : {
        titulo: activityTitle,
        descripcion: activityDescription || null,
        id_sala: salaId,
        id_tipo_actividad: idTipoActividad,
        fecha: activityDate,
        hora_inicio: startTime,
        hora_termino: endTime,
        max_participantes: maxParticipants,
        chat_bidireccional: Boolean(chat_bidireccional),
        aprobado: false,
        estado: "pendiente",
        revision_original_data: buildActivityRevisionSnapshot(existing)
      },
      include: {
        usuario: { select: { id_usuario: true, nombre: true, apellido: true } },
        sala: { select: { id_sala: true, nombre: true, capacidad: true } },
        tipo_actividad_rel: { select: { id_tipo: true, nombre: true, imagen_url: true } },
        _count: {
          select: {
            actividad_participantes: true
          }
        }
      }
    });

    if (!isAdmin) {
      try {
        const adminNotifications = await notifyAdminUsers(prisma, idUsuario, {
          titulo: `Edición de actividad pendiente ${quoteActivityTitle(activityTitle)}`,
          descripcion: `Se solicitó la edición de la actividad ${quoteActivityTitle(activityTitle)} para revisión.`,
          tipo: "actividad",
          id_actividad: idActividad
        });

        emitNotificationBatch(adminNotifications, { broadcastAdmins: true });
      } catch (notificationError) {
        console.error("[activities] edit notification failed:", notificationError);
      }
    } else {
      const snapshot = buildActivityRevisionSnapshot(existing);
      const adminChanges = buildChangesList(snapshot, updated);
      try {
        const participantsNotifications = await notifyActivityParticipants(prisma, idUsuario, idActividad, {
          titulo: "Actividad actualizada",
          descripcion: `La actividad fue actualizada por administración.${adminChanges}`,
          tipo: "actividad",
          id_actividad: idActividad
        }, { includeOwner: true });
        emitNotificationBatch(participantsNotifications);

        const adminNotifications = await notifyAdminUsers(prisma, idUsuario, {
          titulo: `Actividad actualizada ${quoteActivityTitle(activityTitle)}`,
          descripcion: `La actividad ${quoteActivityTitle(activityTitle)} fue actualizada por administración.${adminChanges}`,
          tipo: "actividad",
          id_actividad: idActividad
        });
        emitNotificationBatch(adminNotifications, { broadcastAdmins: true });
      } catch (notificationError) {
        console.error("[activities] admin edit notification failed:", notificationError);
      }
    }

    return res.json({
      ok: true,
      message: isAdmin ? "Actividad actualizada correctamente" : "Edición enviada correctamente para revisión",
      activity: serializeActivity(updated, idUsuario)
    });
  } catch (error) {
    return res.status(500).json({ message: "Error editando actividad", detail: error.message });
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
    chat_bidireccional = true,
    grupos_seleccionados = []
  } = req.body || {};
  const id_sala = req.body?.id_sala ?? null;
  const id_tipo_actividad_raw = req.body?.id_tipo_actividad;

  const activityTitle = (title || titulo || "").trim();
  const activityDescription = (description || descripcion || "").trim();
  const activityDate = parseLocalDateString(date || fecha || "");
  const startTime = timeStringToDate(hora_inicio);
  const endTime = timeStringToDate(hora_termino);
  const maxParticipants = Number(max_participantes ?? capacity ?? 0);
  const selectedGroupIds = Array.isArray(grupos_seleccionados)
    ? [...new Set(grupos_seleccionados.map(value => Number(value)).filter(value => Number.isInteger(value) && value > 0))]
    : [];
  let salaId = null;
  const idTipoActividad = Number(id_tipo_actividad_raw);

  if (!id_sala) {
    return res.status(400).json({ message: "id_sala es requerido" });
  }

  if (!id_tipo_actividad_raw) {
    return res.status(400).json({ message: "id_tipo_actividad es requerido" });
  }

  salaId = Number(id_sala);
  if (!Number.isInteger(salaId) || salaId < 1) {
    return res.status(400).json({ message: "id_sala invalido" });
  }

  if (!Number.isInteger(idTipoActividad) || idTipoActividad < 1) {
    return res.status(400).json({ message: "id_tipo_actividad invalido" });
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

  try {
    const sala = await prisma.salas.findUnique({ where: { id_sala: salaId } });
    if (!sala) {
      return res.status(400).json({ message: "La sala seleccionada no existe" });
    }

    const tipoActividad = await prisma.tipo_actividad.findUnique({ where: { id_tipo: idTipoActividad } });
    if (!tipoActividad) {
      return res.status(400).json({ message: "El tipo de actividad seleccionado no existe" });
    }

    const roomCapacity = Number(sala.capacidad ?? sala.capacity ?? 0);
    if (!validateCapacity(maxParticipants, roomCapacity)) {
      return res.status(400).json({
        message: "El cupo no puede superar la capacidad de la sala.",
        capacity: roomCapacity
      });
    }

    const sameRoomActivities = await prisma.actividad.findMany({
      where: {
        fecha: activityDate,
        id_sala: salaId,
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

      const isAdmin = String(req.user?.rol || "").toLowerCase() === "admin";

      const created = await prisma.$transaction(async tx => {
      const newActivity = await tx.actividad.create({
        data: {
          id_encargado: idEncargado,
          id_sala: salaId,
          id_tipo_actividad: idTipoActividad,
          titulo: activityTitle,
          descripcion: activityDescription || null,
          fecha: activityDate,
          hora_inicio: startTime,
          hora_termino: endTime,
          max_participantes: maxParticipants,
            chat_bidireccional: Boolean(chat_bidireccional),
            aprobado: isAdmin ? true : false,
            estado: isAdmin ? "programada" : "pendiente"
        },
        include: {
          usuario: { select: { id_usuario: true, nombre: true, apellido: true } },
          tipo_actividad_rel: { select: { id_tipo: true, nombre: true, imagen_url: true } },
          _count: {
            select: {
              actividad_participantes: true
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

      // Procesar grupos seleccionados
      if (selectedGroupIds.length > 0) {
        // Validar que los grupos existen y pertenecen al usuario
        const gruposValidos = await tx.grupo.findMany({
          where: {
            id_grupo: { in: selectedGroupIds },
            OR: [
              { id_lider: idEncargado },
              { participantes_grupo: { some: { id_usuario: idEncargado } } }
            ]
          },
          include: {
            participantes_grupo: { select: { id_usuario: true } }
          }
        });

        // Crear relaciones actividad_grupo
        for (const grupo of gruposValidos) {
          await tx.actividad_grupo.create({
            data: {
              id_actividad: newActivity.id_actividad,
              id_grupo: grupo.id_grupo
            }
          });

          // Agregar miembros del grupo como participantes
          const miembrosGrupo = [grupo.id_lider, ...grupo.participantes_grupo.map(p => p.id_usuario)];
          for (const idMiembro of miembrosGrupo) {
            const yaEsta = await tx.actividad_participantes.findUnique({
              where: {
                id_actividad_id_usuario: {
                  id_actividad: newActivity.id_actividad,
                  id_usuario: idMiembro
                }
              }
            });

            if (!yaEsta && idMiembro !== idEncargado) {
              await tx.actividad_participantes.create({
                data: {
                  id_actividad: newActivity.id_actividad,
                  id_usuario: idMiembro,
                  rol: "participante"
                }
              });
            }
          }
        }
      }

      return { newActivity };
    });

    try {
      const notifTitulo = isAdmin
        ? `Actividad creada ${quoteActivityTitle(activityTitle)}`
        : `Nueva propuesta de actividad ${quoteActivityTitle(activityTitle)}`;
      const notifDesc = isAdmin
        ? `La actividad ${quoteActivityTitle(activityTitle)} fue creada.`
        : `Se creó la actividad ${quoteActivityTitle(activityTitle)} para revisión.`;

      const adminNotifications = await notifyAdminUsers(prisma, idEncargado, {
        titulo: notifTitulo,
        descripcion: notifDesc,
        tipo: "actividad",
        id_actividad: created.newActivity.id_actividad
      });

      emitNotificationBatch(adminNotifications, { broadcastAdmins: true });
    } catch (notificationError) {
      console.error("[activities] admin notification failed:", notificationError);
    }

    return res.status(201).json({ ok: true, activity: serializeActivity(created.newActivity, idEncargado) });
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
            actividad_participantes: true
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
      select: { id_actividad: true, estado: true, id_encargado: true }
    });

    if (!activity) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }

    if (!isInCourse(activity.estado)) {
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

    const isOwner = Number(activity?.id_encargado) === idUsuario;
    const canMarkAttendance = membership && (membership.rol === "participante" || (membership.rol === "encargado" && isOwner));

    if (!canMarkAttendance) {
      return res.status(403).json({ message: "Solo participantes o el encargado pueden marcar asistencia" });
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

    const selfNotifications = await notifyUsersByIds(prisma, idUsuario, [idUsuario], {
      titulo: "Asistencia registrada",
      descripcion: "Tu asistencia fue registrada correctamente.",
      tipo: "actividad",
      id_actividad: idActividad
    });

    emitNotificationBatch(selfNotifications);

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

    if (!isInCourse(activity.estado)) {
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

    const targetNotifications = await notifyUsersByIds(prisma, idUsuario, [idUsuarioObjetivo], {
      titulo: "Asistencia registrada por un encargado",
      descripcion: "Tu asistencia fue registrada en la actividad.",
      tipo: "actividad",
      id_actividad: idActividad
    });

    emitNotificationBatch(targetNotifications);

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

    const removedNotifications = await notifyUsersByIds(prisma, idUsuario, [idUsuarioObjetivo], {
      titulo: "Has sido removido de una actividad",
      descripcion: "Un administrador o encargado te eliminó de la actividad.",
      tipo: "actividad",
      id_actividad: idActividad
    });

    emitNotificationBatch(removedNotifications);

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
  const idUsuario = getUserIdFromToken(req.user);

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
            actividad_participantes: true
          }
        }
      }
    });

    if (!existing) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }

    const pendingRevision = existing.revision_original_data && typeof existing.revision_original_data === "object"
      ? existing.revision_original_data
      : null;

    let updated;
    try {
      updated = await prisma.actividad.update({
        where: { id_actividad: idActividad },
        data:
          action === "approve"
            ? {
                aprobado: true,
                estado: existing.estado === "pendiente" ? "programada" : existing.estado,
                revision_original_data: null
              }
            : pendingRevision
              ? restoreActivityRevisionSnapshot(pendingRevision, existing)
              : {
                  aprobado: false,
                  estado: "rechazada"
                },
        include: {
          usuario: { select: { id_usuario: true, nombre: true, apellido: true } },
          sala: { select: { id_sala: true, nombre: true, capacidad: true } },
          tipo_actividad_rel: { select: { id_tipo: true, nombre: true, imagen_url: true } },
          _count: {
            select: {
              actividad_participantes: true
            }
          }
        }
      });
    } catch (err) {
      // Si la base de datos no contiene el valor enum 'rechazada', degradamos a 'cancelada'
      const msg = String(err?.message || "");
      if (
        action === "reject" &&
        /invalid input value|unknown.*enum|enum.*estado_actividad|invalid.*enum/i.test(msg)
      ) {
        updated = await prisma.actividad.update({
          where: { id_actividad: idActividad },
          data: {
            aprobado: false,
            estado: "cancelada"
          },
          include: {
            usuario: { select: { id_usuario: true, nombre: true, apellido: true } },
            sala: { select: { id_sala: true, nombre: true, capacidad: true } },
            tipo_actividad_rel: { select: { id_tipo: true, nombre: true, imagen_url: true } },
            _count: {
              select: {
                actividad_participantes: true
              }
            }
          }
        });
      } else {
        throw err;
      }
    }

    const activityTitle = existing?.titulo || updated?.titulo || `#${idActividad}`;
    const reason = String(req.body?.descripcion ?? req.body?.reason ?? "").trim();

    const adminUser = await prisma.usuario.findUnique({
      where: { id_usuario: idUsuario },
      select: { nombre: true, apellido: true }
    });
    const adminName = adminUser ? `${adminUser.nombre} ${adminUser.apellido}`.trim() : "Administración";

    const changesList = pendingRevision && action === "approve"
      ? buildChangesList(pendingRevision, updated)
      : "";

    const ownerNotification = pendingRevision
      ? action === "approve"
        ? {
            titulo: `Edición de actividad aprobada ${quoteActivityTitle(activityTitle)}`,
            descripcion: `Los cambios solicitados de ${quoteActivityTitle(activityTitle)} fueron publicados por ${adminName}.${changesList}`,
            tipo: "actividad",
            id_actividad: idActividad
          }
        : {
            titulo: `Edición de actividad rechazada ${quoteActivityTitle(activityTitle)}`,
            descripcion: reason || `Los cambios solicitados de ${quoteActivityTitle(activityTitle)} fueron rechazados por ${adminName}.`,
            tipo: "actividad",
            id_actividad: idActividad
          }
      : action === "approve"
        ? {
            titulo: `Aprobación propuesta actividad ${quoteActivityTitle(activityTitle)}`,
            descripcion: `La actividad ${quoteActivityTitle(activityTitle)} fue aprobada por ${adminName}.`,
            tipo: "actividad",
            id_actividad: idActividad
          }
        : {
            titulo: `Rechazo propuesta actividad ${quoteActivityTitle(activityTitle)}`,
            descripcion: reason || `La actividad ${quoteActivityTitle(activityTitle)} fue rechazada por ${adminName}.`,
            tipo: "actividad",
            id_actividad: idActividad
          };

    try {
      const ownerNotifications = await notifyActivityOwnerExplicit(prisma, idUsuario, idActividad, ownerNotification);
      emitNotificationBatch(ownerNotifications);
    } catch (notifError) {
      console.error("[reviewActivity] ownerNotification failed:", notifError);
    }

    if (action === "approve" && pendingRevision) {
      try {
        const participantsNotifications = await notifyActivityParticipants(prisma, idUsuario, idActividad, {
          titulo: "Actividad actualizada",
          descripcion: `Los cambios aprobados ya están disponibles para los participantes inscritos.${changesList}`,
          tipo: "actividad",
          id_actividad: idActividad
        }, { includeOwner: false });
        emitNotificationBatch(participantsNotifications);
      } catch (notifError) {
        console.error("[reviewActivity] participantsNotification failed:", notifError);
      }
    }

    if (action === "approve") {
      try {
        const adminNotifications = await notifyAdminUsers(prisma, idUsuario, {
          titulo: pendingRevision
            ? `Edición aprobada ${quoteActivityTitle(activityTitle)}`
            : `Actividad aprobada ${quoteActivityTitle(activityTitle)}`,
          descripcion: pendingRevision
            ? `Los cambios de ${quoteActivityTitle(activityTitle)} fueron aprobados por ${adminName} y publicados.${changesList}`
            : `La actividad ${quoteActivityTitle(activityTitle)} fue aprobada por ${adminName}.`,
          tipo: "actividad",
          id_actividad: idActividad
        });
        emitNotificationBatch(adminNotifications, { broadcastAdmins: true });
      } catch (notifError) {
        console.error("[reviewActivity] adminNotification failed:", notifError);
      }
    }

    if (action === "approve") {
      try {
        await syncActivityStatuses();
      } catch (syncError) {
        console.error("[reviewActivity] syncActivityStatuses failed:", syncError);
      }
    }

    return res.json({
      ok: true,
      message: action === "approve" ? "Actividad aprobada correctamente" : "Actividad rechazada correctamente",
      activity: serializeActivity(updated)
    });
  } catch (error) {
    console.error("[reviewActivity] main error:", error);
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
            actividad_participantes: true
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

    if (!canCancel(existing.estado)) {
      const mensaje = existing.estado === "cancelada"
        ? "La actividad ya se encuentra cancelada"
        : "No puedes cancelar una actividad finalizada";
      return res.status(400).json({ message: mensaje });
    }

    const adminUser = await prisma.usuario.findUnique({
      where: { id_usuario: idUsuario },
      select: { nombre: true, apellido: true }
    });
    const adminName = adminUser ? `${adminUser.nombre} ${adminUser.apellido}`.trim() : "Administración";

    const updated = await prisma.actividad.update({
      where: { id_actividad: idActividad },
      data: {
        estado: "cancelada"
      },
      include: {
        usuario: { select: { id_usuario: true, nombre: true, apellido: true } },
        _count: {
          select: {
            actividad_participantes: true
          }
        }
      }
    });

    const cancelador = isAdmin ? adminName : "El encargado";
    await notifyActivityParticipants(prisma, idUsuario, idActividad, {
      titulo: "Actividad cancelada",
      descripcion: `La actividad fue cancelada por ${cancelador}.`,
      tipo: "actividad"
    }, { includeOwner: true });

    try {
      const adminNotifications = await notifyAdminUsers(prisma, idUsuario, {
        titulo: `Actividad cancelada ${quoteActivityTitle(existing.titulo)}`,
        descripcion: `La actividad ${quoteActivityTitle(existing.titulo)} fue cancelada por ${isAdmin ? adminName : "el encargado"}.`,
        tipo: "actividad",
        id_actividad: idActividad
      });
      emitNotificationBatch(adminNotifications, { broadcastAdmins: true });
    } catch (notifError) {
      console.error("[cancelActivity] adminNotification failed:", notifError);
    }

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

  if (!isValidMessage(text)) {
    return res.status(400).json({ message: "El mensaje no puede estar vacío o supera los 2000 caracteres" });
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

    if (!canMessageInActivity(activity.estado)) {
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
  requestActivityEdit,
  cancelActivity,
  createActivityMessage,

  __testables: {
    parseLocalDateString,
    toDateLabel,
    timeStringToDate,
    toTimeLabel,
    hasTimeOverlap,
    buildActivityRevisionSnapshot,
    restoreActivityRevisionSnapshot,
    buildChangesList,
    mapEstadoToUi,
    canEnroll,
    isInCourse,
    canCancel,
    validateCapacity,
    isValidMessage,
    canMessageInActivity,
    validateRating,
  }
};
