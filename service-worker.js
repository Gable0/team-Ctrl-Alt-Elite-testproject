// service-worker.js
// Service Worker for offline caching

const CACHE_NAME = 'retroga-v1';
const urlsToCache = [
  // Root files
  '/',
  '/index.html',
  '/homepage.html',
  '/game.html',
  '/difficulty.html',
  '/leaderboard.html',
  '/shop.html',
  '/skins.html',
  '/styles.css',

  // JavaScript modules - Core
  '/js/core/background.js',
  '/js/core/gameLoop.js',
  '/js/core/input.js',
  '/js/core/persistentAudio.js',

  // JavaScript modules - Entities
  '/js/entities/enemyManager.js',
  '/js/entities/player.js',

  // JavaScript modules - State
  '/js/state/gameState.js',

  // JavaScript modules - Systems
  '/js/systems/audioManager.js',
  '/js/systems/collision/entityCollisions.js',
  '/js/systems/collision/shotCollisions.js',
  '/js/systems/enemyAttack.js',
  '/js/systems/powerUps.js',
  '/js/systems/shootingSystem.js',

  // JavaScript modules - Skins
  '/js/skins/skinsManager.js',

  // JavaScript modules - UI
  '/js/ui/hud.js',
  '/js/ui/pauseMenu.js',
  '/js/ui/settingsComponent.js',
  '/js/ui/translations.js',

  // Audio files
  '/assets/sounds/reg game sounds/intro.wav',
  '/assets/sounds/reg game sounds/laser.wav',
  '/assets/sounds/reg game sounds/explosion.wav',
  '/assets/sounds/reg game sounds/powerup.wav',

  // Google Fonts (optional - fallback to system fonts)
  'https://fonts.googleapis.com/css2?family=Jersey+10&display=swap',
];

// Install event - cache all resources
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[ServiceWorker] Installed successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch(error => {
        console.error('[ServiceWorker] Install failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[ServiceWorker] Activated');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches
      .match(event.request)
      .then(response => {
        // Cache hit - return cached response
        if (response) {
          console.log('[ServiceWorker] Serving from cache:', event.request.url);
          return response;
        }

        // Not in cache - fetch from network
        console.log(
          '[ServiceWorker] Fetching from network:',
          event.request.url
        );
        return fetch(event.request).then(response => {
          // Don't cache invalid responses
          if (
            !response ||
            response.status !== 200 ||
            response.type === 'error'
          ) {
            return response;
          }

          // Clone the response (can only be consumed once)
          const responseToCache = response.clone();

          // Cache the fetched resource for future offline use
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
      .catch(error => {
        console.error('[ServiceWorker] Fetch failed:', error);

        // Optional: Return a custom offline page
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});
