const CACHE_NAME = "memoria-cache-v3";
const ASSETS = ["/", "/index.html"];

// FCM en background usando el mismo service worker de la app.
try {
  importScripts("/firebase-config.js");
  importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
  importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

  const firebaseConfig = self.__FIREBASE_CONFIG || null;
  if (firebaseConfig?.apiKey) {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage(payload => {
      const type = String(payload?.data?.type || "sistema").toLowerCase();
      const sourceTitle = String(payload.notification?.title || payload?.data?.title || "").trim();
      const sourceBody = String(payload.notification?.body || payload?.data?.body || "").trim();
      const title = type === "sistema" ? "Notificación de Sistema" : sourceTitle || "Notificación";
      const body = type === "sistema"
        ? [sourceTitle, sourceBody].filter(Boolean).join("\n")
        : sourceBody;
      const options = {
        body,
        icon: payload.notification?.icon || "/icons/icon-192.png",
        tag: String(payload?.data?.notificationId || payload?.data?.id_notificacion || payload?.data?.id || sourceTitle || "notification"),
        renotify: false,
        data: payload.data || {}
      };

      self.registration.showNotification(title, options);
    });
  }
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
