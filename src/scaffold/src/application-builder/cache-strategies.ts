import { RequestDelegate } from "../abstractions";

export type CacheStrategy = (key?: string) => RequestDelegate;

interface ICacheStrategies {
    networkOnly: CacheStrategy;
    cacheOnly: CacheStrategy;
    cacheFirst: CacheStrategy;
    networkFirst: CacheStrategy;
    backgroundFetch: CacheStrategy;
}

// tslint:disable-next-line:variable-name
export const CacheStrategies: ICacheStrategies = {
    backgroundFetch: (key?: string) => {
        return async (fetchEvent: FetchEvent) => {
            const cache = await caches.open(key!);
            const response = await cache.match(fetchEvent.request);

            const fetchPromise = fetch(fetchEvent.request).then(async (fetchResponse) => {
                await cache.put(fetchEvent.request, fetchResponse.clone());
                return fetchResponse;
            });

            return response || fetchPromise;
        };
    },
    cacheFirst: (key?: string) => {
        return async (fetchEvent: FetchEvent) => {
            const cache = await caches.open(key!);
            let response = await cache.match(fetchEvent.request);
            if (!response) {
                response = await fetch(fetchEvent.request);
                if (response.ok) {
                    await cache.put(fetchEvent.request, response.clone());
                }
            }
            return response;
        };
    },
    cacheOnly: (key?: string) => {
        return async (fetchEvent: FetchEvent) => {
            const cache = await caches.open(key!);
            return await cache.match(fetchEvent.request) as Response;
        };
    },
    networkFirst: (key?: string) => {
        return async (fetchEvent: FetchEvent) => {
            let response = await fetch(fetchEvent.request);

            if (!response.ok) {
                const cache = await caches.open(key!);
                response = await cache.match(fetchEvent.request) as Response;
            }

            return response;
        };
    },
    networkOnly: (key?: string) => {
        return (fetchEvent: FetchEvent) => fetch(fetchEvent.request);
    },
};
