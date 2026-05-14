import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";
import { initFirebase } from "./services/firebase";

// Inicializar Firebase con credenciales del .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

try {
  initFirebase(firebaseConfig);
  console.log("✓ Firebase inicializado correctamente");
} catch (err) {
  console.error("✗ Error inicializando Firebase:", err.message);
}

// registrar service worker con actualizaciones
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none"
    }).then(registration => {
      let refreshing = false;

      // verificar actualizaciones cada 5 minutos
      setInterval(() => {
        registration.update();
      }, 5 * 60 * 1000);
      
      // recargar solo cuando el nuevo SW tome control real de la pagina
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });

      // notificar si hay actualización
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            console.log("Nueva version disponible. Actualizando aplicacion...");
          }
        });
      });
    }).catch(err => {
      console.error("Error registrando SW:", err);
    });
  });
}

const root = createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);