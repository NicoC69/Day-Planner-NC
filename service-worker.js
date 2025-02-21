self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('todo-app-cache').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/css/style.css',
                '/js/script.js',
                '/img/icon-192.png',
                '/img/icon-512.png'
            ]);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});