// Service Worker pour LaZone PWA
const CACHE_NAME = 'lazone-v1.0.0';
const STATIC_CACHE = 'lazone-static-v1';
const DYNAMIC_CACHE = 'lazone-dynamic-v1';

// Ressources à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/assets/lazone-logo.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => 
            cacheName !== STATIC_CACHE && 
            cacheName !== DYNAMIC_CACHE
          )
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Stratégie de cache pour les requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return;
  
  // Stratégie Cache First pour les assets statiques
  if (request.url.includes('/assets/') || 
      request.url.includes('/icon-') ||
      request.url.includes('.png') ||
      request.url.includes('.jpg') ||
      request.url.includes('.jpeg') ||
      request.url.includes('.svg')) {
    
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) return response;
          
          return fetch(request)
            .then(fetchResponse => {
              const responseClone = fetchResponse.clone();
              caches.open(STATIC_CACHE)
                .then(cache => cache.put(request, responseClone));
              return fetchResponse;
            });
        })
    );
    return;
  }
  
  // Stratégie Network First pour les API et pages
  event.respondWith(
    fetch(request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE)
          .then(cache => cache.put(request, responseClone));
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});