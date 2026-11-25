/* Service worker voor de projector: de app werkt ook zonder internet.
 * Strategy:
 *  - App-shell (HTML) en assets: cache-first, opgevuld bij eerste bezoek.
 *  - Vingerafdruk-URL's (index-*.js/css, fonts) zijn onveranderlijk.
 *  - Andere verzoeken (Open-Meteo weer) gaan rechtstreeks het netwerk in;
 *    falen mag — de app vangt dat zelf af met de cache in localStorage.
 */

const CACHE = 'tech-projector-v1';
const SHELL = './';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([SHELL])).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Weer-API's direct laten passeren; falen is netjes afgehandeld in de app.
  if (url.origin !== self.location.origin) return;

  // Eerst cache, dan netwerk (cache-first). Asset-hits zijn altijd geldig:
  // de vingerafdruk-URL's veranderen bij elke build en bij een nieuwe build
  // hoort een nieuw index.html dat de nieuwe URL's noemt.
  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request)
          .then((response) => {
            if (response.ok && (request.mode === 'navigate' || url.origin === self.location.origin)) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => caches.match(SHELL)),
    ),
  );
});
