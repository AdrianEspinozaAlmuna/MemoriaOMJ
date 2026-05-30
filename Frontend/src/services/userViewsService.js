import api from "./api";
import { resolveActivityImage } from "./activityImagesService";

function withError(payload, errorMessage) {
  return { ...payload, error: errorMessage };
}

function toUiActivity(item = {}) {
  return {
    id: String(item.id ?? item.id_actividad ?? ""),
    title: item.title || item.titulo || "",
    date: item.date || item.fecha || null,
    time: item.time || item.hora_inicio || null,
    hora_inicio: item.hora_inicio || item.time || null,
    hora_termino: item.hora_termino || null,
    place: item.place || item.lugar || "",
    description: item.description || item.descripcion || "",
    manager: item.manager || null,
    category: item.category || item.tipo_actividad?.nombre || item.type || "",
    type: item.type || item.tipo_actividad?.nombre || item.category || "",
    image: resolveActivityImage(item),
    status: item.status || "",
    state: item.estado || null,
    capacity: item.capacity ?? item.max_participantes ?? null,
    enrolled: item.enrolled ?? item.inscritos ?? 0,
    chat_bidireccional: item.chat_bidireccional ?? true,
    approved: item.approved ?? item.aprobado ?? false,
    revision_pendiente: Boolean(item.revision_pendiente)
  };
}

function isAttendedStatus(status = "") {
  const normalized = String(status).toLowerCase();
  return normalized.includes("asist") && !normalized.includes("inasist");
}

export async function getDashboardData() {
  try {
    const { data } = await api.get("/activities");
    const activities = Array.isArray(data) ? data.map(toUiActivity) : [];
    const upcomingActivities = activities
      .filter(item => ["programada", "en_curso"].includes(item.state))
      .slice(0, 6);

    const enrolledCount = activities.filter(item => item.status === "inscrito").length;

    return {
      metrics: [
        { key: "enrolled", label: "Actividades inscritas", value: enrolledCount },
        { key: "monthAttendance", label: "Asistencias este mes", value: 0 },
        { key: "attendanceRate", label: "Tasa de asistencia", value: "0%" }
      ],
      upcomingActivities
    };
  } catch (error) {
    return withError(
      {
        metrics: [],
        upcomingActivities: []
      },
      error?.response?.data?.message || error?.message || "No se pudieron cargar los datos del dashboard"
    );
  }
}

export async function getCalendarData() {
  try {
    const { data } = await api.get("/activities");
    const activities = Array.isArray(data) ? data.map(toUiActivity) : [];
    return activities;
  } catch (error) {
    const activities = [];
    activities.error = error?.response?.data?.message || error?.message || "No se pudo cargar el calendario";
    return activities;
  }
}

export async function getMyActivitiesSummary() {
  try {
    const data = await getMyActivitiesData();
    const participating = Array.isArray(data.participating) ? data.participating.length : 0;
    const created = Array.isArray(data.created) ? data.created.length : 0;

    return {
      cards: [
        { key: "totalEnrolled", label: "Participando", value: participating },
        { key: "totalCreated", label: "Creadas por mi", value: created },
        { key: "rate", label: "Tasa de asistencia", value: "0%" }
      ]
    };
  } catch (error) {
    return withError(
      {
        cards: []
      },
      error?.response?.data?.message || error?.message || "No se pudo cargar el resumen de actividades"
    );
  }
}

export async function getMyActivitiesData() {
  try {
    const [{ data: allActivities }, { data: createdActivities }] = await Promise.all([
      api.get("/activities"),
      api.get("/activities", { params: { onlyMine: "1", includePending: "1" } })
    ]);

    const all = Array.isArray(allActivities) ? allActivities.map(toUiActivity) : [];
    const created = Array.isArray(createdActivities) ? createdActivities.map(toUiActivity) : [];

    const participating = all.filter(item => item.status === "inscrito");
    const completed = created.filter(item => item.state === "finalizada");
    const upcoming = participating.filter(item => item.state !== "finalizada");

    return {
      participating,
      created,
      upcoming,
      completed
    };
  } catch (error) {
    return withError(
      {
        participating: [],
        created: [],
        upcoming: [],
        completed: []
      },
      error?.response?.data?.message || error?.message || "No se pudieron cargar tus actividades"
    );
  }
}

export async function getAttendanceData() {
  try {
    const { data } = await api.get("/users/me/attendance");
    const records = Array.isArray(data?.records) ? data.records : [];

    // Historial: incluir todas las inscripciones del usuario autenticado
    // (programadas/en curso/finalizadas/canceladas). El agregado mensual usa solo finalizadas.

    const seen = new Set();
    const history = records
      .map(item => ({
        id: String(item.id ?? item.id_actividad ?? ""),
        name: item.title || item.titulo || item.nombre || "Actividad",
        type: item.type || item.category || "Actividad",
        date: item.date || item.fecha || null,
        time: item.time || item.hora_inicio || null,
        hora_termino: item.hora_termino || null,
        place: item.place || item.lugar || item.sala || "",
        status: item.status || (item.asistio ? "Asistido" : "Inscrito"),
        state: String(item.estado || "").toLowerCase(),
        participants: item.enrolled ?? item.participants ?? item.asistentes ?? 0,
        capacity: item.capacity ?? item.max_participantes ?? null,
        rating: item.rating ?? item.valoracion ?? null
      }))
      .filter(h => {
        if (!h.id) return false;
        if (seen.has(h.id)) return false;
        seen.add(h.id);
        return true;
      });

    // Group monthly solo en actividades finalizadas
    const monthlyMap = {};
    history
      .filter(h => h.state === "finalizada")
      .forEach(h => {
      const d = new Date(h.date);
      if (isNaN(d)) return;
      const month = d.toLocaleString("es-CL", { month: "long" });
      const year = d.getFullYear();
      const key = `${month}-${year}`;
      if (!monthlyMap[key]) monthlyMap[key] = { month, year, order: year * 12 + d.getMonth(), done: 0, total: 0 };
      monthlyMap[key].total += 1;
      if (isAttendedStatus(h.status)) monthlyMap[key].done += 1;
    });

    const monthly = Object.values(monthlyMap)
      .sort((left, right) => left.order - right.order)
      .map(m => ({ month: m.month, data: `${m.done}/${m.total} (${m.total > 0 ? Math.round((m.done / m.total) * 100) : 0}%)`, year: m.year }));

    const total = history.length;
    const evaluable = history.filter(h => h.state === "finalizada").length;
    const attended = history.filter(h => isAttendedStatus(h.status)).length;
    const rate = evaluable > 0 ? `${Math.round((attended / evaluable) * 100)}%` : "0%";

    const stats = {
      rate,
      total: `${attended} de ${total}`,
      month: monthly.length > 0 ? monthly[monthly.length - 1].data : ""
    };

    return {
      stats,
      monthly,
      history,
      source: "api",
      error: null
    };
  } catch (_error) {
    console.error('Error loading attendance data:', _error);
    return {
      stats: { rate: "0%", total: "0 de 0", month: "" },
      monthly: [],
      history: [],
      source: "api-error",
      error: _error?.response?.data?.message || _error?.message || "No se pudieron cargar las asistencias"
    };
  }
}

export async function submitActivityProposal(payload) {
  try {
    const { data } = await api.post("/activities", payload);
    return {
      ok: true,
      status: 201,
      message: data?.message || "Propuesta enviada correctamente.",
      proposal: data?.activity || data
    };
  } catch (error) {
    const responseData = error?.response?.data || {};
    return {
      ok: false,
      status: error?.response?.status || null,
      message: responseData?.message || "No se pudo enviar la propuesta.",
      conflict: responseData?.conflict || null
    };
  }
}

export async function submitActivityEditRequest(activityId, payload) {
  try {
    const { data } = await api.patch(`/activities/${activityId}/request-edit`, payload);
    return {
      ok: true,
      status: 200,
      message: data?.message || "Edición enviada correctamente para revisión.",
      activity: data?.activity || null
    };
  } catch (error) {
    const responseData = error?.response?.data || {};
    return {
      ok: false,
      status: error?.response?.status || null,
      message: responseData?.message || "No se pudo enviar la edición para revisión.",
      conflict: responseData?.conflict || null
    };
  }
}

export async function getAdminActivities(options = {}) {
  const { approved, estado } = options;

  try {
    const params = {};
    if (typeof approved === "boolean") {
      params.aprobado = String(approved);
    }
    if (estado) {
      params.estado = estado;
    }

    const { data } = await api.get("/activities/admin", { params });
    return Array.isArray(data) ? data.map(toUiActivity) : [];
  } catch (error) {
    const activities = [];
    activities.error = error?.response?.data?.message || error?.message || "No se pudieron cargar las actividades";
    return activities;
  }
}

export async function reviewActivity(idActividad, payload = {}) {
  try {
    const { data } = await api.patch(`/activities/${idActividad}/review`, payload);
    return {
      ok: true,
      message: data?.message || "Actividad actualizada correctamente.",
      activity: data?.activity ? toUiActivity(data.activity) : null
    };
  } catch (error) {
    return {
      ok: false,
      message: error?.response?.data?.message || "No se pudo actualizar la actividad."
    };
  }
}

export async function getActivityDetail(activityId) {
  try {
    const { data } = await api.get(`/activities/${activityId}`);
    return {
      ok: true,
      activity: data
    };
  } catch (error) {
    return {
      ok: false,
      message: error?.response?.data?.message || "No se pudo cargar el detalle de la actividad."
    };
  }
}

export async function enrollInActivity(activityId) {
  try {
    const { data } = await api.post(`/activities/${activityId}/enroll`);
    return {
      ok: true,
      enrolled: Boolean(data?.enrolled),
      message: data?.message || "Inscripción realizada correctamente."
    };
  } catch (error) {
    return {
      ok: false,
      message: error?.response?.data?.message || "No se pudo completar la inscripción."
    };
  }
}

export async function cancelActivityEnrollment(activityId) {
  try {
    const { data } = await api.delete(`/activities/${activityId}/enroll`);
    return {
      ok: true,
      enrolled: Boolean(data?.enrolled),
      message: data?.message || "Inscripción cancelada correctamente."
    };
  } catch (error) {
    return {
      ok: false,
      message: error?.response?.data?.message || "No se pudo cancelar la inscripción."
    };
  }
}

export async function markMyAttendance(activityId) {
  try {
    const { data } = await api.patch(`/activities/${activityId}/attendance`);
    return {
      ok: true,
      message: data?.message || "Asistencia registrada correctamente."
    };
  } catch (error) {
    return {
      ok: false,
      message: error?.response?.data?.message || "No se pudo registrar la asistencia."
    };
  }
}

export async function markParticipantAttendance(activityId, participantId) {
  try {
    const { data } = await api.patch(`/activities/${activityId}/participants/${participantId}/attendance`);
    return {
      ok: true,
      message: data?.message || "Asistencia registrada correctamente."
    };
  } catch (error) {
    return {
      ok: false,
      message: error?.response?.data?.message || "No se pudo registrar la asistencia manual."
    };
  }
}

export async function removeParticipantFromActivity(activityId, participantId) {
  try {
    const { data } = await api.delete(`/activities/${activityId}/participants/${participantId}`);
    return {
      ok: true,
      message: data?.message || "Participante expulsado correctamente."
    };
  } catch (error) {
    return {
      ok: false,
      message: error?.response?.data?.message || "No se pudo expulsar al participante."
    };
  }
}

export async function rateActivity(activityId, rating) {
  try {
    const { data } = await api.patch(`/activities/${activityId}/rating`, { valoracion: rating });
    return {
      ok: true,
      message: data?.message || "Valoracion registrada correctamente."
    };
  } catch (error) {
    return {
      ok: false,
      message: error?.response?.data?.message || "No se pudo registrar la valoracion."
    };
  }
}

export async function cancelManagedActivity(activityId) {
  try {
    const { data } = await api.patch(`/activities/${activityId}/cancel`);
    return {
      ok: true,
      message: data?.message || "Actividad cancelada correctamente.",
      activity: data?.activity || null
    };
  } catch (error) {
    return {
      ok: false,
      message: error?.response?.data?.message || "No se pudo cancelar la actividad."
    };
  }
}

export async function sendActivityMessage(activityId, mensaje) {
  try {
    const { data } = await api.post(`/activities/${activityId}/messages`, { mensaje });
    return {
      ok: true,
      message: data?.message || "Mensaje enviado correctamente.",
      chatMessage: data?.chatMessage || null
    };
  } catch (error) {
    return {
      ok: false,
      message: error?.response?.data?.message || "No se pudo enviar el mensaje."
    };
  }
}
