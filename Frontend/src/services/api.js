import axios from "axios";

const FALLBACK_API_BASE_URL = import.meta.env.DEV ? "http://localhost:4000/api" : undefined;
export const API_BASE_URL = import.meta.env.VITE_API_URL || FALLBACK_API_BASE_URL;

if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  console.warn("VITE_API_URL no está definido. El frontend en Vercel no podrá llamar al backend hasta configurarlo.");
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.error("[API Interceptor] 401 Unauthorized for:", error.config?.url);
      // Token is invalid/expired, clear it and redirect to login
      localStorage.removeItem("token");
      // Reload page to trigger login redirect
      if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;