
const CACHE_NAME = 'grade-genius-v' + Date.now(); // Use timestamp for unique cache
const STATIC_CACHE = 'static-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache resources and activate immediately
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  // Skip waiting to activate new service worker immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - network first strategy for development
self.addEventListener('fetch', (event) => {
  // Skip chrome extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // For HTML files, always fetch from network first
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone and cache the response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request) || caches.match('/');
        })
    );
    return;
  }

  // For other resources, try network first, then cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Don't cache if it's a hot reload or development request
        if (event.request.url.includes('/@vite/') || 
            event.request.url.includes('node_modules') ||
            event.request.url.includes('.js?v=') ||
            event.request.url.includes('.css?v=')) {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request);
      })
  );
});

// Activate event - clean up old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ])
  );
  
  // Force refresh all clients when new SW is activated
  self.clients.matchAll({ type: 'window' }).then(clients => {
    clients.forEach(client => {
      console.log('Notifying client of update');
      client.postMessage({
        type: 'SW_ACTIVATED',
        action: 'RELOAD'
      });
    });
  });
});

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'FORCE_UPDATE') {
    // Clear all caches and force update
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      self.skipWaiting();
    });
  }
});

// Periodic update check
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      self.registration.update()
    );
  }
});
