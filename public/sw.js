/* Autonome — service worker.
   Chemins RELATIFS : l'app reste installable et hors-ligne qu'elle soit servie
   à la racine du domaine ou dans un sous-dossier. */
const CACHE = "autonome-v1";

/* Coquille minimale à pré-cacher (tout le reste est mis en cache à la volée). */
const CORE = ["./", "./manifest.webmanifest", "./icons/icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  /* On ne gère que les ressources du même site (les polices sont embarquées). */
  if (url.origin !== self.location.origin) return;

  /* Navigations : réseau d'abord, repli sur la coquille en cache (mode avion ok). */
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("./", copy));
          return res;
        })
        .catch(() => caches.match("./"))
    );
    return;
  }

  /* Assets : cache d'abord, mise à jour silencieuse en arrière-plan. */
  e.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
