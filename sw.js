/* Copyright (c) 2026 Push. */
const CACHE = 'hsn-data-2de2c38c2c16';
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add('./data.2de2c38c2c16.js')).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('hsn-data-') && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  const url = new URL(event.request.url);
  if (url.pathname.endsWith('/data.2de2c38c2c16.js')) {
    event.respondWith(caches.match(event.request).then((hit) => hit || fetch(event.request)));
  }
});
