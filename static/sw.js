"use strict";

/*chrome://flags/#unsafely-treat-insecure-origin-as-secure
Put Ip address with port en enable*/

const CACHE_NAME = "dikke-waggie-cache-v1"
const CACHED_URLS = [
    "http://192.168.1.44:8080/",
    "http://192.168.1.44:8080/static/css/styles.css",
    "http://192.168.1.44:8080/static/js/script.js",
    "http://192.168.1.44:8080/static/manifest/manifest.json",
    "http://192.168.1.44:8080/static/icons/icon-192x192.png",
];

self.addEventListener("install", e => {
    e.waitUntil(
        (
            async () => {
                try {
                    const cache = await caches.open(CACHE_NAME);
                    return await cache.addAll(CACHED_URLS)
                }catch{
                    console.log("fout");
                }
            }
        )()
    )
});

self.addEventListener("fetch", e => {
    e.respondWith(
        (
            async () => {
                try {
                    return await fetch(e.request);
                } catch {
                    const cache = await caches.open(CACHE_NAME);
                    const response = await cache.match(e.request);
                    if(response) {
                        return response;
                    }else {
                        return await cache.match("http://192.168.1.44:8080/")
                    }
                }
            }
        )()
    );
});