// Servicio de integración con Firebase (solo Messaging)
import api from "./api";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

let appInstance = null;
let messagingInstance = null;

export function initFirebase(config) {
  if (!appInstance) {
    appInstance = initializeApp(config);
    try {
      messagingInstance = getMessaging(appInstance);
    } catch (err) {
      // messaging may not be available in some environments
      messagingInstance = null;
    }
  }
  return { app: appInstance, messaging: messagingInstance };
}

export async function uploadImage(file, metadata = {}) {
  if (!file) throw new Error("Archivo de imagen requerido");

  const formData = new FormData();
  formData.append("file", file);

  const nombre = String(metadata.nombre || "").trim();
  const descripcion = String(metadata.descripcion || "").trim();
  const idTipo = metadata.id_tipo ?? metadata.idTipo ?? null;

  if (nombre) formData.append("nombre", nombre);
  if (descripcion) formData.append("descripcion", descripcion);
  if (idTipo) formData.append("id_tipo", String(idTipo));

  const response = await api.post("/imagenes/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  return response.data?.url || response.data?.tipo?.imagen_url || null;
}

export async function requestNotificationPermissionAndGetToken(vapidKey) {
  if (!messagingInstance) throw new Error("Firebase Messaging no inicializado. Llama a initFirebase(config) primero.");
  if (typeof Notification === "undefined") throw new Error("El navegador no soporta notificaciones.");
  if (!vapidKey) throw new Error("VAPID key no configurada");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Permiso de notificaciones denegado");
  }

  let serviceWorkerRegistration = null;
  if (typeof navigator !== "undefined" && navigator.serviceWorker) {
    try {
      serviceWorkerRegistration = await navigator.serviceWorker.ready;
    } catch (_error) {
      serviceWorkerRegistration = null;
    }
  }

  const currentToken = await getToken(messagingInstance, {
    vapidKey,
    ...(serviceWorkerRegistration ? { serviceWorkerRegistration } : {})
  });
  if (!currentToken) throw new Error("No se pudo obtener token de FCM");

  // Registrar token en backend
  try {
    await api.post("/notifications/tokens", { token: currentToken, platform: navigator.userAgent });
  } catch (err) {
    console.warn("No se pudo registrar token en backend:", err.message || err);
  }

  return currentToken;
}

export function onForegroundMessage(handler) {
  if (!messagingInstance) return () => {};
  return onMessage(messagingInstance, handler);
}

export default {
  initFirebase,
  uploadImage,
  requestNotificationPermissionAndGetToken,
  onForegroundMessage
};
