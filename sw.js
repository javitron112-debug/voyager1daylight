/* Service Worker · Voyager 1 · 1 día luz (Señal VGR)
   Estrategia:
   - Instalación: precarga de la app (index.html, manifest.json).
   - Navegación: caché primero + actualización en segundo plano (carga instantánea, incluso sin cobertura).
   - Resto de recursos del mismo origen: stale-while-revalidate.
   - Recursos de otros orígenes: se dejan pasar al navegador.
*/

const VERSION = 'v1.0.0';
const CACHE_PREFIX = 'voyager-vgr-';
const CACHE_NAME = CACHE_PREFIX + VERSION;
const CORE_ASSETS = ['./', './index.html', './manifest.json'];

const OFFLINE_HTML = '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width, initial-scale=1">' +
  '<title>Sin conexión</title></head>' +
  '<body style="margin:0;min-height:100vh;display:grid;place-content:center;background:#000;color:#d4af37;' +
  'font-family:system-ui,sans-serif;text-align:center;padding:24px">' +
  '<h1 style="font-weight:600">Sin conexión</h1>' +
  '<p style="color:#b9b9c2">Abre la app una vez con internet para que quede guardada y funcione sin conexión.</p>' +
  '</body></html>';

/* ---------- Instalación ---------- */
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(CORE_ASSETS.map(async (url) => {
      try {
        const res = await fetch(new Request(url, { cache: 'reload' }));
        if (res && res.ok && !res.redirected) await cache.put(url, res);
      } catch (err) {
        /* Si falla un recurso no abortamos la instalación */
      }
    }));
    await self.skipWaiting();
  })());
});

/* ---------- Activación: limpieza de cachés antiguas ---------- */
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

/* ---------- Mensajes desde la página ---------- */
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

/* ---------- Estrategias de red ---------- */
async function handleNavigation(event) {
  const cache = await caches.open(CACHE_NAME);
  const cached = (await cache.match('./index.html')) || (await cache.match('./'));

  const update = fetch(event.request)
    .then(async (res) => {
      if (res && res.ok && res.type === 'basic' && !res.redirected) {
        await cache.put('./index.html', res.clone());
        await cache.put('./', res.clone());
      }
      return res;
    })
    .catch(() => null);

  if (cached) {
    event.waitUntil(update);
    return cached;
  }
  const res = await update;
  return res || new Response(OFFLINE_HTML, {
    status: 503,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

async function staleWhileRevalidate(event) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(event.request);

  const update = fetch(event.request)
    .then(async (res) => {
      if (res && res.ok && res.type === 'basic') {
        await cache.put(event.request, res.clone());
      }
      return res;
    })
    .catch(() => null);

  if (cached) {
    event.waitUntil(update);
    return cached;
  }
  const res = await update;
  return res || Response.error();
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // no interceptamos otros orígenes

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(event));
    return;
  }
  event.respondWith(staleWhileRevalidate(event));
});
