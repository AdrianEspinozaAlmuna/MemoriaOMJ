import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// registrar service worker con actualizaciones
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).then(registration => {
      // verificar actualizaciones cada 5 minutos
      setInterval(() => {
        registration.update();
      }, 5 * 60 * 1000);
      
      // notificar si hay actualización
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "activated") {
            console.log("Nueva versión disponible");
            // forzar reload
            window.location.reload();
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