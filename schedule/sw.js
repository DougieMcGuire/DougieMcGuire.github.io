// sw.js

const CACHE_NAME = "schedule-manager-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",   // Replace with your main JS file path
  "/share.png",
  "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js",
  "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js",
];

// Install event - Cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching app assets");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate event - Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  console.log("Service Worker activated");
});

// Fetch event - Serve assets from cache, fall back to network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            // Cache fetched response for future use
            if (event.request.method === "GET") {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        })
      );
    }).catch(() => {
      // Optional: Serve fallback HTML or offline page
      if (event.request.mode === "navigate") {
        return caches.match("/index.html");
      }
    })
  );
});
