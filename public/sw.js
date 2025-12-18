
self.addEventListener('install', (e) => {
    console.log('Service Worker: Installed');
});

self.addEventListener('fetch', (e) => {
    // Simple pass-through fetch
    // In a real PWA you would cache assets here
    // e.respondWith(fetch(e.request));
});
