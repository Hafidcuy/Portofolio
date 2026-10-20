/* Service Worker — Portofolio
   Strategi: halaman & aset statis cache-first (dengan update di latar),
   API selalu network-first agar isi dari database tetap segar. */
var CACHE = "portofolio-v2";
var STATIC_ASSETS = [
    "./",
    "./index.html",
    "./tampilan.css",
    "./fungsi.js",
    "./fitur.js",
    "./manifest.webmanifest",
    "./logo/foxnime_outline_transparent.png",
    "./logo/foxnime_outline_white_transparent.png",
    "./logo/moon.png",
    "./logo/sun.png"
];

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE).then(function (cache) { return cache.addAll(STATIC_ASSETS); })
            .then(function () { return self.skipWaiting(); })
    );
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (k) {
                return k !== CACHE ? caches.delete(k) : Promise.resolve();
            }));
        }).then(function () { return self.clients.claim(); })
    );
});

self.addEventListener("fetch", function (event) {
    var url = new URL(event.request.url);

    /* API: selalu coba jaringan dulu, jangan pernah sajikan data basi */
    if (url.pathname.indexOf("/api/") !== -1) {
        event.respondWith(fetch(event.request));
        return;
    }

    if (event.request.method !== "GET") return;

    event.respondWith(
        caches.match(event.request).then(function (cached) {
            var network = fetch(event.request).then(function (res) {
                if (res && res.ok && url.origin === self.location.origin) {
                    var copy = res.clone();
                    caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
                }
                return res;
            }).catch(function () { return cached; });
            return cached || network;
        })
    );
});
