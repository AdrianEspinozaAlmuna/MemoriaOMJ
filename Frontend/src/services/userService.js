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