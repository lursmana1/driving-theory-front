/**
 * prava.ge service worker (installable app + offline fallback).
 *
 * - Pages: network first, the last copy is used when offline. Signed-in
 *   pages (auth, exam, profile, createblog) are never cached.
 * - Build assets and images: cache first, size-capped.
 * - API (api.prava.ge), RSC requests and other origins: not touched.
 *
 * Bump VERSION when this file's caching rules change.
 */
const VERSION = "v1";
const SHELL = `shell-${VERSION}`;
const PAGES = `pages-${VERSION}`;
const STATIC = `static-${VERSION}`;
const IMAGES = `images-${VERSION}`;
const CURRENT = [SHELL, PAGES, STATIC, IMAGES];

// plain HTML, no Next.js scripts (src/app/offline.html/route.ts)
const OFFLINE_URL = "/offline.html";
const PRIVATE_PAGE = /^\/(?:(?:en|ru)\/)?(?:auth|exam|profile|createblog)(?:\/|$)/;
const LOGOUT_PAGE = /^\/(?:(?:en|ru)\/)?auth\/logout(?:\/|$)/;
const STATIC_ASSET = /^\/(?:_next\/static|fonts)\//;
const IMAGE_ASSET = /^\/(?:_next\/image|images|gif|svg|png|icons|ticket_media)(?:\/|$)/;

const LIMITS = { [PAGES]: 40, [STATIC]: 200, [IMAGES]: 400 };

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
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !CURRENT.includes(key)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(handlePage(request, url));
    return;
  }
  if (STATIC_ASSET.test(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC));
    return;
  }
  if (IMAGE_ASSET.test(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGES));
  }
});

async function handlePage(request, url) {
  // cached pages may show the signed-in header, so drop them on logout
  if (LOGOUT_PAGE.test(url.pathname)) await caches.delete(PAGES);

  if (PRIVATE_PAGE.test(url.pathname)) {
    try {
      return await fetch(request);
    } catch {
      return offlinePage();
    }
  }

  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      await putTrimmed(PAGES, request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request, { cacheName: PAGES });
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

async function cacheFirst(request, cacheName) {
  // any cache: the offline page icon lives in SHELL
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok && response.type === "basic") {
    await putTrimmed(cacheName, request, response.clone());
  }
  return response;
}

async function putTrimmed(cacheName, request, response) {
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
  const keys = await cache.keys();
  const extra = keys.length - LIMITS[cacheName];
  // keys come back oldest first
  for (let i = 0; i < extra; i += 1) await cache.delete(keys[i]);
}
