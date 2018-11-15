interface FetchEvent {
    respondWith(response: Promise<Response> | Response): Promise<Response>;
    request: Request;
}

namespace Routes {
    export function CacheStrategyFactory(cacheKey: string) {
        return {
            none: (event: FetchEvent) => {
                event.respondWith(fetch(event.request));
            },
            fetchOnce: (event: FetchEvent) => {
                let promise = caches.open(cacheKey).then(cache => {
                    return cache.match(event.request).then(response => response || fetch(event.request).then(response => {
                        cache.put(event.request, response.clone());
                        return response;
                    }));
                });

                event.respondWith(promise);
            },
            backgroundFetch: (event: FetchEvent) => {
                let promise = caches.open(cacheKey).then(cache => cache.match(event.request).then(response => {
                    var fetchPromise = fetch(event.request).then(networkResponse => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });

                    return response || fetchPromise;
                }));

                event.respondWith(promise);
            }
        };
    }
}