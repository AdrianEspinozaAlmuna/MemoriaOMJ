const CACHE_NAME = "memoria-cache-v3";
const ASSETS = ["/", "/index.html"];

// FCM en background usando el mismo service worker de la app.
try {
  importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
  importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

  const firebaseConfig = {
    apiKey: "AIzaSyCdkF2YTAAGC-QQPbpA_1NO2U04WCG4dLU",
    authDomain: "db-omj.firebaseapp.com",
    projectId: "db-omj",
    storageBucket: "db-omj.firebasestorage.app",
    messagingSenderId: "610370458234",
    appId: "1:610370458234:web:662e0f429915ee96b8e1c3",
    measurementId: "G-DH68ZHC0FJ"
  };

  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage(payload => {
    const title = payload.notification?.title || payload?.data?.title || "Notificacion";
    const options = {
      body: payload.notification?.body || payload?.data?.body || "",
      icon: payload.notification?.icon || "/icons/icon-192.png",
      data: payload.data || {}
    };

    self.registration.showNotification(title, options);
  });
} catch (_error) {
  // Si Firebase no esta disponible, el SW sigue funcionando para cache.
}

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // Evita que una URL faltante rompa toda la instalación del SW.
      await Promise.allSettled(ASSETS.map(asset => cache.add(asset)));
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Evita errores con requests de extensiones del navegador u otros esquemas.
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // Evita error conocido de SW con only-if-cached fuera de same-origin.
  if (req.cache === "only-if-cached" && req.mode !== "same-origin") return;

  // Nunca cachear el propio SW para no bloquear nuevas versiones.
  if (url.pathname === "/sw.js") return;

  // Para recursos de terceros: pasar directo por red sin cache local.
  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(req));
    return;
  }

  event.respondWith(
    fetch(req)
      .then(res => {
        return caches.open(CACHE_NAME).then(cache => {
          // Cachea solo respuestas validas para evitar rechazos innecesarios.
          if (res && res.ok) {
            cache.put(req, res.clone()).catch(() => {});
          }
          return res;
        });
      })
      .catch(async () => {
        const cached = await caches.match(req);
        if (cached) return cached;

        if (req.mode === "navigate") {
          const appShell = await caches.match("/index.html");
          if (appShell) return appShell;
        }

        return new Response("Offline", {
          status: 503,
          statusText: "Service Unavailable",
          headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      })
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = event.notification?.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(url);
      }

      return null;
    })
  );
});
