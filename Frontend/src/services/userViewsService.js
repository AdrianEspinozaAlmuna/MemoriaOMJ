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
    category: "Formacion",
    status: "inscrito",
    description: "Sesion practica para mejorar habilidades de liderazgo en equipos juveniles.",
    place: "Biblioteca Municipal",
    manager: "Camila Rojas",
    enrolledCount: 24
  },
  {
    id: "cal-02",
    title: "Feria de emprendimiento",
    date: "2026-03-29",
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
    { key: "totalEnrolled", label: "Total inscritas", value: 12 },
    { key: "completed", label: "Total completadas", value: 9 },
    { key: "rate", label: "Tasa de asistencia", value: "75%" }
  ]
};

const myActivitiesPayload = {
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

export function getDashboardData() {
  return mockResponse(dashboardPayload);
}

export function getCalendarData() {
  return mockResponse(calendarActivities);
}

export function getMyActivitiesSummary() {
  return mockResponse(myActivitiesSummary);
}

export function getMyActivitiesData() {
  return mockResponse(myActivitiesPayload);
}

export function getAttendanceData() {
  return mockResponse(attendancePayload);
}

export function submitActivityProposal(payload) {
  return mockResponse({
    ok: true,
    message: "Propuesta enviada correctamente.",
    proposal: {
      id: `prop-${Date.now()}`,
      ...payload
    }
  });
}
