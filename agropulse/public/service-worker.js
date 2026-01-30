// Service Worker for AgroPulse
// Handles offline functionality, caching, and background sync

const CACHE_NAME = "agropulse-v1";
const OFFLINE_URL = "/offline";

// Files to cache on install
const STATIC_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
  "/styles/globals.css",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        console.log("Some assets failed to cache");
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
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
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // API requests - try network first, fallback to cache
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/trpc/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const cache = caches.open(CACHE_NAME);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          return caches
            .match(request)
            .then((cached) => cached || createOfflineResponse());
        })
    );
    return;
  }

  // Static assets - cache first, fallback to network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === "error") {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          if (request.destination === "document") {
            return caches.match(OFFLINE_URL) || createOfflineResponse();
          }
          return new Response("Offline - Resource not available", {
            status: 503,
          });
        });
    })
  );
});

// Message event - handle background sync and client messages
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "SYNC_QUEUE") {
    event.waitUntil(syncQueuedData());
  }
});

// Background sync event
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-messages" || event.tag === "sync-listings") {
    event.waitUntil(syncQueuedData());
  }
});

// Sync queued data when back online
async function syncQueuedData() {
  try {
    const db = await openDB();
    const queue = await getAllFromStore(db, "pending-queue");

    for (const item of queue) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body ? JSON.stringify(item.body) : undefined,
        });

        if (response.ok) {
          await deleteFromStore(db, "pending-queue", item.id);
          
          // Notify all clients that item was synced
          self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: "SYNC_COMPLETE",
                itemId: item.id,
              });
            });
          });
        }
      } catch (error) {
        console.error("Failed to sync item:", item.id, error);
      }
    }
  } catch (error) {
    console.error("Failed to sync queue:", error);
  }
}

// IndexedDB helpers
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("AgroPulseDB", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("pending-queue")) {
        db.createObjectStore("pending-queue", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("cached-data")) {
        db.createObjectStore("cached-data", { keyPath: "id" });
      }
    };
  });
}

function getAllFromStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deleteFromStore(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Create offline response
function createOfflineResponse() {
  return new Response(
    JSON.stringify({ offline: true, message: "You are offline" }),
    {
      status: 503,
      headers: { "Content-Type": "application/json" },
    }
  );
}
