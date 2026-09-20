// Minimal service worker — exists for installability only (a fetch handler is one of the
// PWA installability criteria). No offline caching: this prototype is meant to be tested
// live against the server, not used offline.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
