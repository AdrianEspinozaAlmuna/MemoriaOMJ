import api from "./api";

const isDemoAuthEnabled = import.meta.env.VITE_DEMO_AUTH === "true";

export async function getApprovedActivities() {
  if (isDemoAuthEnabled) {
    return {
      actividades: [
        {
          id_actividad: 1,
          titulo: "Taller de Guitarra para Principiantes",
          descripcion: "Actividad ya aprobada y lista para realizarse esta semana.",
          usuario: { nombre: "Ana", apellido: "Martinez" },
          fecha: "2026-04-17",
          hora_inicio: "16:00",
          max_participantes: 18,
          estado: "programada",
          aprobado: true,
          image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80"
        },
        {
          id_actividad: 2,
          titulo: "Torneo de Ajedrez",
          descripcion: "Competencia confirmada con cupos ya publicados.",
          usuario: { nombre: "Pedro", apellido: "Soto" },
          fecha: "2026-04-21",
          hora_inicio: "18:30",
          max_participantes: 24,
          estado: "programada",
          aprobado: true,
          image: "https://images.unsplash.com/photo-1528819622765-d6bcf132b6f4?auto=format&fit=crop&w=1200&q=80"
        },
        {
          id_actividad: 3,
          titulo: "Cine Foro: Peliculas Latinoamericanas",
          descripcion: "Sesión aprobada y próxima a comenzar.",
          usuario: { nombre: "Laura", apellido: "Diaz" },
          fecha: "2026-04-24",
          hora_inicio: "19:00",
          max_participantes: 40,
          estado: "programada",
          aprobado: true,
          image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80"
        }
      ]
    };
  }

  try {
    const res = await api.get("/activities?aprobado=true&estado=programada");
    return { actividades: res.data };
  } catch (error) {
    console.error("Error fetching approved activities:", error);
    throw error;
  }
}

export async function getAllActivities() {
  if (isDemoAuthEnabled) {
    return {
      actividades: []
    };
  }

  try {
    const res = await api.get("/activities");
    return { actividades: res.data };
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
}

export async function getActivityById(id) {
  if (isDemoAuthEnabled) {
    return {
      actividad: {
        id_actividad: id,
        titulo: "Actividad Demo",
        descripcion: "Esta es una actividad en modo demo",
        estado: "programada"
      }
    };
  }

  try {
    const res = await api.get(`/activities/${id}`);
    return { actividad: res.data };
  } catch (error) {
    console.error("Error fetching activity:", error);
    throw error;
  }
}

export async function createActivity(payload) {
  if (isDemoAuthEnabled) {
    return {
      ok: true,
      actividad: {
        ...payload,
        id_actividad: Date.now(),
        aprobado: false,
        estado: "pendiente"
      }
    };
  }

  try {
    const res = await api.post("/activities", payload);
    return res.data;
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error;
  }
}

export async function updateActivity(id, payload) {
  if (isDemoAuthEnabled) {
    return {
      ok: true,
      actividad: { ...payload, id_actividad: id }
    };
  }

  try {
    const res = await api.patch(`/activities/${id}/review`, payload);
    return res.data;
  } catch (error) {
    console.error("Error updating activity:", error);
    throw error;
  }
}
