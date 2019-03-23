import { ICacheStrategies, IFetchContext, LogLevel } from "../abstractions";

// tslint:disable-next-line:variable-name
export const CacheStrategies: ICacheStrategies = {
    backgroundFetch: (key?: string) => {
        return async (fetchContext: IFetchContext) => {
            fetchContext.log(LogLevel.Debug, "CacheStrategy: backgroundFetch");

            const cache = await caches.open(key!);
            const response = await cache.match(fetchContext.request);

            const fetchPromise = fetch(fetchContext.request).then(async (fetchResponse) => {
                await cache.put(fetchContext.request, fetchResponse.clone());
                return fetchResponse;
            });

            return response || fetchPromise;
        };
    },
    cacheFirst: (key?: string) => {
        return async (fetchContext: IFetchContext) => {
            fetchContext.log(LogLevel.Debug, "CacheStrategy: cacheFirst");
            
            const cache = await caches.open(key!);
            let response = await cache.match(fetchContext.request);
            if (!response) {
                response = await fetch(fetchContext.request);
                if (response.ok) {
                    await cache.put(fetchContext.request, response.clone());
                }
            }

            return response;
        };
    },
    cacheOnly: (key?: string) => {
        return async (fetchContext: IFetchContext) => {
            fetchContext.log(LogLevel.Debug, "CacheStrategy: cacheOnly");
            
            const cache = await caches.open(key!);
            return cache.match(fetchContext.request) as Promise<Response>;
        };
    },
    networkFirst: (key?: string) => {
        return async (fetchContext: IFetchContext) => {
            fetchContext.log(LogLevel.Debug, "CacheStrategy: networkFirst");
            
            let response = await fetch(fetchContext.request);

            if (!response.ok) {
                const cache = await caches.open(key!);
                response = await cache.match(fetchContext.request) as Response;
            }

            return response;
        };
    },
    networkOnly: (key?: string) => {
        return (fetchContext: IFetchContext) => {
            fetchContext.log(LogLevel.Debug, "CacheStrategy: networkOnly");
            
            return fetch(fetchContext.request);
        };
    },
};
