import api from "./api";

const isDemoAuthEnabled = import.meta.env.VITE_DEMO_AUTH === "true";

function base64UrlEncode(value) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function buildDemoToken(user) {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 8)
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  return `${encodedHeader}.${encodedPayload}.demo-signature`;
}

function resolveDemoUser(email) {
  if (email.includes("admin")) {
    return {
      id_usuario: 1,
      nombre: "Admin",
      apellido: "Demo",
      mail: email,
      rol: "admin"
    };
  }

  return {
    id_usuario: 2,
    nombre: "Participante",
    apellido: "Demo",
    mail: email,
    rol: "participante"
  };
}

export async function getTest() {
  if (isDemoAuthEnabled) {
    return { ok: true, mode: "demo", message: "Modo demo activo en frontend." };
  }

  const res = await api.get("/users/test");
  return res.data;
}

export async function login(email, password) {
  if (isDemoAuthEnabled) {
    const user = resolveDemoUser(email);
    const token = buildDemoToken(user);
    localStorage.setItem("token", token);
    return { token, user };
  }

  const res = await api.post("/users/login", { email, password });
  if (res.data.token) localStorage.setItem("token", res.data.token);
  return res.data;
}

export async function createUser(payload) {
  if (isDemoAuthEnabled) {
    return {
      ok: true,
      mode: "demo",
      user: {
        ...payload,
        id_usuario: Date.now(),
        rol: "participante"
      }
    };
  }

  const res = await api.post("/users", payload);
  return res.data;
}

export async function getAllUsers() {
  if (isDemoAuthEnabled) {
    return {
      users: [
        { id_usuario: 1, nombre: "Camila", apellido: "Torres", rut: "12345678-9", mail: "camila@email.cl", telefono: "987654321", estado: true, rol: "participante", fecha_registro: "2025-04-10" },
        { id_usuario: 2, nombre: "Diego", apellido: "Perez", rut: "23456789-0", mail: "diego@email.cl", telefono: "912345678", estado: true, rol: "participante", fecha_registro: "2025-02-18" },
        { id_usuario: 3, nombre: "Valentina", apellido: "Rojas", rut: "34567890-1", mail: "vale@email.cl", telefono: "923456789", estado: false, rol: "participante", fecha_registro: "2024-10-22" },
        { id_usuario: 4, nombre: "Matias", apellido: "Silva", rut: "45678901-2", mail: "matias@email.cl", telefono: "934567890", estado: true, rol: "participante", fecha_registro: "2025-01-12" },
        { id_usuario: 5, nombre: "Sofia", apellido: "Munoz", rut: "56789012-3", mail: "sofia@email.cl", telefono: "945678901", estado: true, rol: "admin", fecha_registro: "2024-12-03" },
        { id_usuario: 6, nombre: "Lucas", apellido: "Ramirez", rut: "67890123-4", mail: "lucas@email.cl", telefono: "956789012", estado: false, rol: "participante", fecha_registro: "2025-03-05" }
      ]
    };
  }

  try {
    const res = await api.get("/users");
    return res.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function getDashboardStats() {
  if (isDemoAuthEnabled) {
    return {
      totalUsers: 247,
      activeActivities: 18,
      recentApprovals: 5,
      averageAttendance: "82%"
    };
  }

  try {
    const res = await api.get("/dashboard/stats");
    return res.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}