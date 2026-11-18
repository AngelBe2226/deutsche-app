// Service worker de la PWA (solo se registra en el build estático de Pages).
//  - Página y contenido (HTML, JSON, manifest): red primero → cada cambio
//    publicado se ve en la siguiente apertura; la caché solo se usa sin red.
//  - /assets/ (nombres con hash, inmutables): caché primero.
//  - Otros orígenes (Supabase, fuentes) no se tocan.
const CACHE = "german-index-v2";
// Audios de voz (MP3 en R2): su nombre es el hash del texto, así que nunca
// cambian. Caché primero y en una caché aparte que sobrevive a las versiones.
const VOICE_CACHE = "voice-audio";
const VOICE_RE = /\/[\w-]+\/[0-9a-f]{2}\/[0-9a-f]{14}\.mp3$/;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== VOICE_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req, { cache: "no-store" });
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const cached = await cache.match(req, { ignoreSearch: req.mode === "navigate" });
    if (cached) return cached;
    if (req.mode === "navigate") {
      const shell = await cache.match(self.registration.scope);
      if (shell) return shell;
    }
    return Response.error();
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res && res.ok) cache.put(req, res.clone());
  return res;
}

async function voiceFirst(req) {
  const cache = await caches.open(VOICE_CACHE);
  const cached = await cache.match(req.url);
  if (cached) return cached;
  const res = await fetch(req);
  if (res && res.ok) cache.put(req.url, res.clone());
  return res;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (VOICE_RE.test(url.pathname)) {
    event.respondWith(voiceFirst(req));
    return;
  }
  if (url.origin !== self.location.origin) return;

  event.respondWith(url.pathname.includes("/assets/") ? cacheFirst(req) : networkFirst(req));
});
