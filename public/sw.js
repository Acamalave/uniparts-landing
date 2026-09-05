/* Service worker de la PWA de Uniparts.
 * - Páginas: red primero, con copia en caché y respaldo sin conexión.
 * - Estáticos de Next (/_next/static) e íconos: caché primero (son inmutables).
 * - Fotos de productos (/api/odoo-image): caché con revalidación en segundo plano.
 * - Nunca cachea /admin ni /api/admin ni /api/orders.
 */
const VERSION = "v1";
const SHELL = `uniparts-shell-${VERSION}`;
const RUNTIME = `uniparts-runtime-${VERSION}`;
const IMAGES = `uniparts-images-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const PRECACHE = ["/", "/catalogo", "/checkout", OFFLINE_URL, "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];
const MAX_IMAGES = 300;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL).then((c) => Promise.allSettled(PRECACHE.map((u) => c.add(u)))).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => ![SHELL, RUNTIME, IMAGES].includes(k)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length > max) await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)));
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const p = url.pathname;
  if (p.startsWith("/admin") || p.startsWith("/api/admin") || p.startsWith("/api/orders")) return;

  // Estáticos inmutables: caché primero.
  if (p.startsWith("/_next/static/") || p.startsWith("/icons/") || p === "/manifest.webmanifest") {
    event.respondWith(
      caches.open(RUNTIME).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      })
    );
    return;
  }

  // Fotos de productos: stale-while-revalidate.
  if (p.startsWith("/api/odoo-image/")) {
    event.respondWith(
      caches.open(IMAGES).then(async (cache) => {
        const hit = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res.ok) {
              cache.put(req, res.clone());
              trimCache(IMAGES, MAX_IMAGES);
            }
            return res;
          })
          .catch(() => hit);
        return hit || network;
      })
    );
    return;
  }

  // Navegaciones y demás: red primero, caché de respaldo, página sin conexión.
  if (req.mode === "navigate" || req.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) caches.open(SHELL).then((c) => c.put(req, res.clone()));
          return res;
        })
        .catch(async () => (await caches.match(req)) || (await caches.match(OFFLINE_URL)))
    );
  }
});
