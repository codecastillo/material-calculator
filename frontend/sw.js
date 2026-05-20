const CACHE_NAME = 'esticount-v15';
const APP_SHELL = [
  '/index.html',
  '/css/styles.css',
  '/css/dashboard-v2.css',
  '/css/pricing-v2.css',
  '/css/orders-v2.css',
  '/css/jobs-v2.css',
  '/css/admin-v2.css',
  '/css/login-v2.css',
  '/css/account-v2.css',
  '/css/mobile-v2.css',
  '/js/handlers.js',
  '/js/ui-handlers.js',
  '/js/sw-register.js',
  '/js/app.js',
  '/js/api.js',
  '/assets/logo.png'
];

// Install: cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first for API, cache-first for static assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Network-first for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful GET responses
          if (event.request.method === 'GET' && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then(cached =>
            cached || new Response(JSON.stringify({ error: 'Offline' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            })
          )
        )
    );
    return;
  }

  // Network-first for HTML, CSS, and JS so style/script updates propagate immediately.
  // Cache-first for everything else (images, fonts, etc.).
  const isFreshFirst = /\.(css|js|html)$/.test(url.pathname) || event.request.mode === 'navigate';

  if (isFreshFirst) {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() =>
        caches.match(event.request).then(cached => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') return caches.match('/index.html');
          return new Response('Offline', { status: 503 });
        })
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => new Response('Offline', { status: 503 }));
    })
  );
});
