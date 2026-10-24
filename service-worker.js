const CACHE = 'word-mayhem-wordlab-v7';
const ASSETS = ['./','./index.html','./app.js','./words.js','./mission-content.js','./mayhem.js','./scene-art.js','./lexicon-data.js','./word-studio.js','./friend-challenge.js','./styles.css','./v3.css','./v5.css','./grammar-model.js','./grammar-context.js','./dictionary-study-v7.js','./dictionary-study-v7.css','./grammar-core.js','./adult-v5.js','./kids-v5.js','./kids-polish-v6.js','./mission-expansion-v6.js','./scene-pack-v6.js','./lexicon-v6.js','./lexicon-v6.css','./assets/scenes/word-mayhem-scenes-v6.webp','./manifest.webmanifest','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png','./assets/scenes/renegade.webp','./assets/scenes/revival.webp','./assets/scenes/ephemeral.webp','./assets/scenes/world.webp','./assets/scenes/adult-lounge.webp','./assets/scenes/children-garden.webp','./assets/scenes/children-island.webp','./assets/scenes/children-space.webp','./assets/scenes/children-friends.webp','./assets/scenes/idiom-afloat.webp','./assets/scenes/kid-dog.webp','./assets/scenes/kids-quest.webp','./assets/scenes/kid-map.webp','./assets/scenes/city-light.webp','./assets/scenes/adult-mnemonic.webp'];
self.addEventListener('install', event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event=>{
  event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()]));
});
self.addEventListener('fetch', event=>{
  if(event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if((event.request.url.endsWith('/grammar-context.bin') || /\/dictionary(?:-lessons)?\/[a-z]\.json$/.test(new URL(event.request.url).pathname)) && response.ok) {
      const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{}));
    }
    return response;
  })));
});
