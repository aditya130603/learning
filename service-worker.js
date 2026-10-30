/* Versioned atomic app-shell cache. Do not pre-cache old adult/dictionary files. */
const CACHE = "little-learners-46-woodland-v5";
const SHELL = [
  "./", "./index.html", "./little-46.css", "./little-46-storybook.css", "./little-46-kit.css", "./little-46-data.js", "./little-46-spelling.js", "./little-46.js",
  "./manifest.webmanifest", "./assets/icon.svg", "./assets/icon-192.png",
  "./assets/icon-512.png", "./assets/kids46/pip.svg", "./assets/kids46/home-meadow.svg",
  "./assets/kids46/ant.svg", "./assets/kids46/winding-path.svg", "./assets/kits/nature/apple.svg", "./assets/kits/nature/tree-puffy.svg",
  "./assets/kits/nature/bush.svg", "./assets/kits/nature/bush-flowers.svg", "./assets/kits/nature/flower-coral.svg",
  "./assets/kits/nature/flower-pink.svg", "./assets/kits/nature/mushroom.svg", "./assets/kits/nature/fern.svg", "./assets/kids46/garden-path.svg", "./assets/scenes/little-garden.svg"
];
self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return cache.addAll(SHELL);
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (names) {
    return Promise.all(names.filter(function (key) { return key !== CACHE; }).map(function (key) { return caches.delete(key); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(function (cached) {
    return cached || fetch(event.request);
  }));
});
