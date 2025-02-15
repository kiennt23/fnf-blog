declare const SERVICE_WORKER_VERSION: string;

const CACHE_NAME = SERVICE_WORKER_VERSION;

// During the install phase, cache static resources
self.addEventListener("install", (event) => {
  const swEvent = event as ExtendableEvent;
  swEvent.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const manifest = await fetch("/manifest.json", {});
      const manifestJson = await manifest.json();

      const urlToCache = Object.keys(manifestJson)
        .filter((name) => name !== "web-worker/service-worker.ts")
        .map((name) => manifestJson[name].file);
      return cache.addAll(urlToCache);
    }),
  );
});

// During the activation phase, delete old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  const swEvent = event as ExtendableEvent;
  swEvent.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (!cacheWhitelist.includes(name)) {
            return caches.delete(name);
          }
        }),
      );
    }),
  );
});

// During fetch, serve cached resources if available
self.addEventListener("fetch", (event) => {
  const fetchEvent = event as FetchEvent;
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then((cachedResponse) => {
      // Return cached response if present, otherwise fetch from network
      return cachedResponse || fetch(fetchEvent.request);
    }),
  );
});

// KEY PART: Listen for messages from the client to skip waiting
self.addEventListener("message", (event) => {
  const messageEvent = event as MessageEvent;
  if (messageEvent.data && messageEvent.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
