// Servicio de integración con Firebase (Storage + Messaging)
import api from "./api";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

let appInstance = null;
let storageInstance = null;
let messagingInstance = null;

export function initFirebase(config) {
  if (!appInstance) {
    appInstance = initializeApp(config);
    storageInstance = getStorage(appInstance);
    try {
      messagingInstance = getMessaging(appInstance);
    } catch (err) {
      // messaging may not be available in some environments
      messagingInstance = null;
    }
  }
  return { app: appInstance, storage: storageInstance, messaging: messagingInstance };
}

export async function uploadImage(file, path = "uploads/") {
  if (!storageInstance) throw new Error("Firebase Storage no inicializado. Llama a initFirebase(config) primero.");
  const fileRef = ref(storageInstance, `${path}${Date.now()}_${file.name}`);
  const uploadTask = uploadBytesResumable(fileRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      () => {},
      (error) => reject(error),
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

export async function requestNotificationPermissionAndGetToken(vapidKey) {
  if (!messagingInstance) throw new Error("Firebase Messaging no inicializado. Llama a initFirebase(config) primero.");
  if (typeof Notification === "undefined") throw new Error("El navegador no soporta notificaciones.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Permiso de notificaciones denegado");
  }

  const currentToken = await getToken(messagingInstance, { vapidKey });
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
