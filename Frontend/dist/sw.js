const CACHE_NAME = "memoria-cache-v3";
const ASSETS = ["/", "/index.html"];

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
      .catch(() => caches.match(req))
  );
});
