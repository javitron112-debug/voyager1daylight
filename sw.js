/* Voyager 1: shell offline, tipografías y audio opcional. Sin archivos extra. */
'use strict';

const CACHE_NAME = 'voyager-lightday-v2';
const SHELL = ['./', './index.html', './manifest.json'];
const FONT_ORIGINS = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(SHELL.map(url => new Request(url, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('voyager-lightday-') && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type !== 'CACHE_RESOURCES' || !Array.isArray(event.data.urls)) return;
  const urls = event.data.urls.slice(0, 30).filter(value => {
    if (typeof value !== 'string') return false;
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && FONT_ORIGINS.includes(url.origin);
    } catch (_) { return false; }
  });
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(urls.map(url => cache.add(url)));
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  const fonts = FONT_ORIGINS.includes(url.origin);
  const audio = url.protocol === 'https:' && (url.hostname === 'archive.org' || url.hostname.endsWith('.archive.org'));
  if (!sameOrigin && !fonts && !audio) return;

  // Audio: se cachea el archivo completo, nunca un fragmento parcial.
  if (audio) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request, { ignoreVary: true });
      if (cached && (cached.status === 200 || cached.type === 'opaque')) {
        const buffer = await cached.arrayBuffer();
        const headers = new Headers();
        headers.set('Content-Type', cached.headers.get('Content-Type') || 'audio/mpeg');
        headers.set('Accept-Ranges', 'bytes');
        const range = request.headers.get('Range');
        if (range) {
          const match = /^bytes=(\d*)-(\d*)$/.exec(range);
          if (match) {
            const start = match[1] ? Number(match[1]) : 0;
            const end = match[1] && match[2] ? Math.min(Number(match[2]), buffer.byteLength - 1) : buffer.byteLength - 1;
            if (start <= end && start < buffer.byteLength) {
              headers.set('Content-Range', 'bytes ' + start + '-' + end + '/' + buffer.byteLength);
              headers.set('Content-Length', String(end - start + 1));
              return new Response(buffer.slice(start, end + 1), { status: 206, headers });
            }
            headers.set('Content-Range', 'bytes */' + buffer.byteLength);
            return new Response(null, { status: 416, headers });
          }
        }
        headers.set('Content-Length', String(buffer.byteLength));
        return new Response(buffer, { status: 200, headers });
      }
      const response = await fetch(request);
      if (response.status === 200 || response.type === 'opaque') {
        event.waitUntil(cache.put(request, response.clone()));
      }
      return response;
    })());
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        if (response.ok) {
          event.waitUntil(cache.put(request, response.clone()));
          return response;
        }
        return await cache.match(request, { ignoreSearch: true }) || await cache.match(new URL('./index.html', self.registration.scope)) || response;
      } catch (_) {
        return await cache.match(request, { ignoreSearch: true }) ||
          await cache.match(new URL('./index.html', self.registration.scope)) ||
          new Response('<!DOCTYPE html><html lang="es"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Voyager 1 — Sin conexión</title><body style="background:#080a0d;color:#ecd3a1;font-family:system-ui;padding:48px 24px"><h1>Voyager 1</h1><p>La app todavía no está guardada. Conéctate a Internet y abre esta página una primera vez para usarla sin conexión.</p></body></html>', { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
    })());
    return;
  }

  if (sameOrigin && (url.pathname.endsWith('/index.html') || url.pathname.endsWith('/manifest.json'))) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        if (response.ok) {
          event.waitUntil(cache.put(request, response.clone()));
          return response;
        }
        return await cache.match(request) || response;
      } catch (_) {
        return await cache.match(request) || new Response('', { status: 504 });
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok || response.type === 'opaque') event.waitUntil(cache.put(request, response.clone()));
      return response;
    } catch (_) {
      return new Response('', { status: 504 });
    }
  })());
});
