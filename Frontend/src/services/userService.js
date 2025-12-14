import api from "./api";

export async function getTest() {
  const res = await api.get("/users/test");
  return res.data;
}

export async function login(email, password) {
  const res = await api.post("/users/login", { email, password });
  if (res.data.token) localStorage.setItem("token", res.data.token);
  return res.data;
}

export async function createUser(payload) {
  const res = await api.post("/users", payload);
  return res.data;
}