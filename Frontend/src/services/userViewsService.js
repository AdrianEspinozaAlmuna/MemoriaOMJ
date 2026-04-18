import api from "./api";

const WAIT_TIME = 420;

const dashboardPayload = {
  metrics: [
    { key: "enrolled", label: "Actividades inscritas", value: 12 },
    { key: "monthAttendance", label: "Asistencias este mes", value: 5 },
    { key: "attendanceRate", label: "Tasa de asistencia", value: "83%" }
  ],
  upcomingActivities: [
    {
      id: "act-01",
      title: "Ciclo de fotografia urbana",
      date: "2026-03-28",
      place: "Casa de la Cultura"
    },
    {
      id: "act-02",
      title: "Workshop de empleo joven",
      date: "2026-03-30",
      place: "Espacio OMJ"
    },
    {
      id: "act-03",
      title: "Laboratorio de contenido digital",
      date: "2026-04-02",
      place: "Centro Juvenil"
    }
  ]
};

const calendarActivities = [
  {
    id: "cal-01",
    title: "Taller de liderazgo",
    date: "2026-03-27",
    time: "21:00",
    category: "Formacion",
    status: "inscrito",
    description: "Sesion practica para mejorar habilidades de liderazgo en equipos juveniles.",
    place: "Biblioteca Municipal",
    manager: "Camila Rojas",
    enrolledCount: 24
  },
  {
    id: "cal-06",
    title: "Laboratorio de podcast",
    date: "2026-03-27",
    time: "21:00",
    category: "Comunicacion",
    status: "disponible",
    description: "Taller practico para grabacion, guion y edicion de podcast juvenil.",
    place: "Sala Multimedia",
    manager: "Sofia Munoz",
    enrolledCount: 18
  },
  {
    id: "cal-07",
    title: "Entrenamiento funcional",
    date: "2026-03-27",
    time: "21:00",
    category: "Deporte",
    status: "disponible",
    description: "Rutina guiada para mejorar resistencia y movilidad.",
    place: "Gimnasio Municipal",
    manager: "Javier Araya",
    enrolledCount: 26
  },
  {
    id: "cal-08",
    title: "Club de lectura joven",
    date: "2026-03-27",
    time: "21:00",
    category: "Cultural",
    status: "inscrito",
    description: "Encuentro participativo para comentar lecturas juveniles.",
    place: "Sala de Reuniones B",
    manager: "Paulina Reyes",
    enrolledCount: 15
  },
  {
    id: "cal-09",
    title: "Taller de marca personal",
    date: "2026-03-27",
    time: "18:30",
    category: "Empleabilidad",
    status: "inscrito",
    description: "Sesion para potenciar perfil profesional y empleabilidad juvenil.",
    place: "Aula OMJ Norte",
    manager: "Javiera Pino",
    enrolledCount: 22
  },
  {
    id: "cal-10",
    title: "Laboratorio de danza urbana",
    date: "2026-03-27",
    time: "18:30",
    category: "Arte",
    status: "disponible",
    description: "Practica de coreografias urbanas para nivel intermedio.",
    place: "Sala Espejos",
    manager: "Francisco Soto",
    enrolledCount: 20
  },
  {
    id: "cal-11",
    title: "Clinica de oratoria express",
    date: "2026-03-27",
    time: "19:45",
    category: "Formacion",
    status: "disponible",
    description: "Entrenamiento breve para hablar en publico con seguridad.",
    place: "Biblioteca Municipal",
    manager: "Camila Rojas",
    enrolledCount: 17
  },
  {
    id: "cal-02",
    title: "Feria de emprendimiento",
    date: "2026-03-29",
    time: "18:30",
    category: "Emprendimiento",
    status: "disponible",
    description: "Encuentro con mentores y stands para impulsar ideas de negocio joven.",
    place: "Plaza de Armas",
    manager: "Matias Leiva",
    enrolledCount: 40
  },
  {
    id: "cal-03",
    title: "Taller de oratoria",
    date: "2026-03-31",
    time: "17:00",
    category: "Formacion",
    status: "inscrito",
    description: "Entrenamiento de comunicacion y manejo escenico para presentaciones efectivas.",
    place: "Centro Cultural",
    manager: "Ignacia Mella",
    enrolledCount: 19
  },
  {
    id: "cal-04",
    title: "Clase abierta de danza",
    date: "2026-04-03",
    time: "19:00",
    category: "Arte",
    status: "disponible",
    description: "Actividad para explorar distintos ritmos y expresion corporal.",
    place: "Gimnasio Municipal",
    manager: "Francisco Soto",
    enrolledCount: 31
  },
  {
    id: "cal-05",
    title: "Hackaton civica",
    date: "2026-04-06",
    time: "10:00",
    category: "Tecnologia",
    status: "inscrito",
    description: "Desarrollo colaborativo de ideas para mejorar servicios locales.",
    place: "Cowork Municipal",
    manager: "Carolina Diaz",
    enrolledCount: 27
  }
];

const myActivitiesSummary = {
  cards: [
    { key: "totalEnrolled", label: "Participando", value: 6 },
    { key: "totalCreated", label: "Creadas por mi", value: 3 },
    { key: "rate", label: "Tasa de asistencia", value: "75%" }
  ]
};

const myActivitiesPayload = {
  participating: [
    {
      id: "my-01",
      title: "Laboratorio audiovisual",
      date: "2026-03-30",
      place: "Estudio Comunitario",
      status: "inscrito"
    },
    {
      id: "my-02",
      title: "Taller de programacion creativa",
      date: "2026-04-05",
      place: "Hub Digital",
      status: "inscrito"
    },
    {
      id: "my-06",
      title: "Mentoria de proyecto social",
      date: "2026-04-10",
      place: "Centro Juvenil",
      status: "inscrito"
    }
  ],
  created: [
    {
      id: "my-c-01",
      title: "Taller de fotografia movil",
      date: "2026-04-08",
      place: "Sala Multimedia",
      participants: 14,
      capacity: 20,
      status: "publicada"
    },
    {
      id: "my-c-02",
      title: "Jornada de voluntariado barrial",
      date: "2026-04-12",
      place: "Plaza Civica",
      participants: 22,
      capacity: 30,
      status: "publicada"
    },
    {
      id: "my-c-03",
      title: "Clinica de CV para primer empleo",
      date: "2026-04-19",
      place: "Espacio OMJ",
      participants: 9,
      capacity: 25,
      status: "publicada"
    }
  ],
  upcoming: [
    {
      id: "my-01",
      title: "Laboratorio audiovisual",
      date: "2026-03-30",
      place: "Estudio Comunitario",
      status: "inscrito"
    },
    {
      id: "my-02",
      title: "Taller de programacion creativa",
      date: "2026-04-05",
      place: "Hub Digital",
      status: "inscrito"
    },
    {
      id: "my-06",
      title: "Mentoria de proyecto social",
      date: "2026-04-10",
      place: "Centro Juvenil",
      status: "inscrito"
    }
  ],
  completed: [
    {
      id: "my-03",
      title: "Voluntariado ambiental",
      date: "2026-03-03",
      place: "Parque Cerro Condell",
      attended: true
    },
    {
      id: "my-04",
      title: "Charla de salud mental",
      date: "2026-02-20",
      place: "Espacio OMJ",
      attended: false
    },
    {
      id: "my-05",
      title: "Workshop CV y entrevista",
      date: "2026-02-09",
      place: "Oficina OMJ",
      attended: true
    }
  ]
};

const attendancePayload = {
  stats: {
    rate: "75%",
    total: "6 de 8",
    month: "3 (+2 vs mes anterior)",
    streak: "4 actividades seguidas"
  },
  monthly: [
    { month: "Julio", data: "3/4 (75%)" },
    { month: "Agosto", data: "5/6 (83%)" },
    { month: "Septiembre", data: "4/5 (80%)" },
    { month: "Octubre", data: "6/8 (75%)" }
  ],
  history: [
    {
      id: "hist-01",
      name: "Clinica de fotografia",
      type: "Taller",
      date: "2026-03-06",
      time: "17:30",
      place: "Sala Multimedia OMJ",
      status: "Asistido"
    },
    {
      id: "hist-02",
      name: "Foro joven comunal",
      type: "Charla",
      date: "2026-02-25",
      time: "18:00",
      place: "Auditorio OMJ",
      status: "No Asistido"
    },
    {
      id: "hist-03",
      name: "Bootcamp de empleabilidad",
      type: "Bootcamp",
      date: "2026-02-12",
      time: "16:00",
      place: "Centro Juvenil",
      status: "Asistido"
    },
    {
      id: "hist-04",
      name: "Encuentro de voluntariado",
      type: "Encuentro",
      date: "2026-01-31",
      time: "10:30",
      place: "Parque Cerro Condell",
      status: "Asistido"
    }
  ]
};

function mockResponse(payload) {
  return new Promise(resolve => {
    window.setTimeout(() => resolve(payload), WAIT_TIME);
  });
}

function toUiActivity(item = {}) {
  return {
    id: String(item.id ?? item.id_actividad ?? ""),
    title: item.title || item.titulo || "Actividad",
    date: item.date || item.fecha || null,
    time: item.time || item.hora_inicio || null,
    hora_inicio: item.hora_inicio || item.time || null,
    hora_termino: item.hora_termino || null,
    place: item.place || item.lugar || "Lugar por confirmar",
    description: item.description || item.descripcion || "",
    manager: item.manager || null,
    status: item.status || "disponible",
    state: item.estado || null,
    capacity: item.capacity ?? item.max_participantes ?? null,
    enrolled: item.enrolled ?? item.inscritos ?? 0,
    chat_bidireccional: item.chat_bidireccional ?? true,
    approved: item.approved ?? item.aprobado ?? false
  };
}

export async function getDashboardData() {
  try {
    const { data } = await api.get("/activities");
    const activities = Array.isArray(data) ? data.map(toUiActivity) : [];
    const upcomingActivities = activities
      .filter(item => item.status === "inscrito" || item.status === "disponible")
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
  } catch (_error) {
    return mockResponse(dashboardPayload);
  }
}

export async function getCalendarData() {
  try {
    const { data } = await api.get("/activities");
    const activities = Array.isArray(data) ? data.map(toUiActivity) : [];
    return activities;
  } catch (_error) {
    return mockResponse(calendarActivities);
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
  } catch (_error) {
    return mockResponse(myActivitiesSummary);
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
    const completed = participating.filter(item => item.state === "finalizada");
    const upcoming = participating.filter(item => item.state !== "finalizada");

    return {
      participating,
      created,
      upcoming,
      completed
    };
  } catch (_error) {
    return mockResponse(myActivitiesPayload);
  }
}

export function getAttendanceData() {
  return mockResponse(attendancePayload);
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
  } catch (_error) {
    const fallback = Array.isArray(calendarActivities)
      ? calendarActivities.map(item => toUiActivity(item))
      : [];

    return fallback.filter(item => {
      if (typeof approved === "boolean" && item.approved !== approved) {
        return false;
      }
      if (estado && item.state !== estado) {
        return false;
      }
      return true;
    });
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
