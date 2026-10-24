const CACHE = 'little-letters-v3';
const ASSETS = ['./','./index.html','./app.js','./words.js','./mission-content.js','./mayhem.js','./scene-art.js','./lexicon-data.js','./word-studio.js','./friend-challenge.js','./styles.css','./v3.css','./manifest.webmanifest','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png'];
self.addEventListener('install', event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event=>{
  event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()]));
});
self.addEventListener('fetch', event=>{
  if(event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached=>cached || fetch(event.request)));
});
