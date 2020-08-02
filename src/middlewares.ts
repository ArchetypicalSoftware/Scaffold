import { Middleware, Swork } from "swork";
import { claimClients } from "swork-claim-clients";
import { logger } from "swork-logger";
import { ICacheClearOptions } from "./abstractions";

export const middlewares = {
    claimClients: (): Swork => claimClients(),
    clearCacheOnUpdate: (options: ICacheClearOptions): () => Promise<void> => {
        return async () => { 
            const keys = await caches.keys();

            await Promise.all(keys.map(async (key: string) => {
                if (options.whitelist.indexOf(key) === -1) {
                    return caches.delete(key);
                }

                return Promise.resolve();
            }));
        };
    },
    installCache: (urlsToCache: string[], cacheKey: string): () => Promise<void> => {
        return async () => {
            const cache = await caches.open(cacheKey!);
            await cache.addAll(urlsToCache);
        };
    },
    logger: (): Middleware => logger(),
};
