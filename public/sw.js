/**
 * prava.ge service worker (installable app + offline fallback).
 *
 * - Pages: network first (with navigation preload), the last copy is used
 *   when offline. Signed-in pages (auth, exam, profile, createblog) are never
 *   cached. Public pages hold no personal data: the signed-in header comes
 *   from `GET /auth/me` on the client.
 * - Build assets (`/_next/static`, hashed names): cache first.
 * - Images and fonts (names can be reused): served from the cache, refreshed
 *   in the background once a copy is older than a day.
 * - API (api.prava.ge), RSC requests, audio and other origins: not touched.
 * - Cache writes never block a response, so pages keep streaming.
 *
 * Bump VERSION when this file's caching rules change.
 */
const VERSION = "v2";
const SHELL = `shell-${VERSION}`;
const PAGES = `pages-${VERSION}`;
const STATIC = `static-${VERSION}`;
const IMAGES = `images-${VERSION}`;
const CURRENT = [SHELL, PAGES, STATIC, IMAGES];

// plain HTML, no Next.js scripts (src/app/offline.html/route.ts)
const OFFLINE_URL = "/offline.html";
const PRIVATE_PAGE = /^\/(?:(?:en|ru)\/)?(?:auth|exam|profile|createblog)(?:\/|$)/;
const HASHED_ASSET = /^\/_next\/static\//;
const REUSED_ASSET = /^\/(?:_next\/image|images|gif|svg|png|icons|ticket_media|fonts)(?:\/|$)/;

const LIMITS = { [PAGES]: 40, [STATIC]: 200, [IMAGES]: 400 };
const REFRESH_AFTER_MS = 24 * 60 * 60 * 1000;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) =>
        cache.addAll([
          new Request(OFFLINE_URL, { cache: "reload" }),
          new Request("/icons/icon-192.png", { cache: "reload" }),
        ]),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches
        .keys()
        .then((keys) =>
          Promise.all(keys.filter((key) => !CURRENT.includes(key)).map((key) => caches.delete(key))),
        ),
      // starts the page request while the worker boots
      self.registration.navigationPreload?.enable(),
    ]).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(handlePage(event, url));
    return;
  }
  if (HASHED_ASSET.test(url.pathname)) {
    event.respondWith(cacheFirst(event, STATIC));
    return;
  }
  if (REUSED_ASSET.test(url.pathname)) {
    event.respondWith(cacheThenRefresh(event, IMAGES));
  }
});

async function fetchPage(event) {
  const preloaded = await event.preloadResponse;
  return preloaded ?? fetch(event.request);
}

async function handlePage(event, url) {
  if (PRIVATE_PAGE.test(url.pathname)) {
    try {
      return await fetchPage(event);
    } catch {
      return offlinePage();
    }
  }

  try {
    const response = await fetchPage(event);
    if (isCacheable(response)) {
      event.waitUntil(putTrimmed(PAGES, event.request, response.clone()));
    }
    return response;
  } catch {
    const cached = await caches.match(event.request, { cacheName: PAGES });
    return cached ?? offlinePage();
  }
}

async function offlinePage() {
  const cached = await caches.match(OFFLINE_URL, { cacheName: SHELL });
  return (
    cached ??
    new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } })
  );
}

async function cacheFirst(event, cacheName) {
  const cached = await caches.match(event.request, { cacheName });
  if (cached) return cached;
  return fetchAndStore(event, cacheName);
}

async function cacheThenRefresh(event, cacheName) {
  // any cache: the offline page icon lives in SHELL
  const cached = await caches.match(event.request);
  if (!cached) return fetchAndStore(event, cacheName);
  if (isStale(cached)) {
    event.waitUntil(fetchAndStore(event, cacheName).catch(() => undefined));
  }
  return cached;
}

async function fetchAndStore(event, cacheName) {
  const response = await fetch(event.request);
  if (isCacheable(response)) {
    event.waitUntil(putTrimmed(cacheName, event.request, response.clone()));
  }
  return response;
}

function isCacheable(response) {
  // `basic` = same-origin and readable; 206 (partial content) can't be cached
  return response.status === 200 && response.type === "basic";
}

function isStale(response) {
  const date = Date.parse(response.headers.get("date") ?? "");
  return Number.isNaN(date) || Date.now() - date > REFRESH_AFTER_MS;
}

async function putTrimmed(cacheName, request, response) {
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
  const keys = await cache.keys();
  const extra = keys.length - LIMITS[cacheName];
  // keys come back oldest first (a re-put moves an entry to the end)
  for (let i = 0; i < extra; i += 1) await cache.delete(keys[i]);
}
