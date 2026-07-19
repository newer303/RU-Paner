const CACHE_NAME = 'ru-planner-cache-v1';
const ASSETS_TO_CACHE = [
  '/manifest.json',
  '/favicon.ico',
  '/globe.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Check if it's an API call
  if (event.request.url.includes('/api/')) {
    if (event.request.method === 'GET') {
      event.respondWith(
        fetch(event.request, { redirect: 'manual' })
          .then((response) => {
            // If it's a redirect, we can't do much in SW with manual mode, 
            // but returning the response object itself often avoids the "network error"
            // that happens when the browser tries to follow a redirect automatically.
            return response;
          })
          .catch(() => {
            return caches.match(event.request);
          })
      );
    } else {
      event.respondWith(fetch(event.request, { redirect: 'manual' }));
    }
  } else {
    // Static assets
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request, { redirect: 'manual' });
      })
    );
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/next.svg',
      badge: '/next.svg',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
