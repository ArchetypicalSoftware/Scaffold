/* istanbul ignore file */
import { ICacheStorage } from "./abstractions";

export const environment = {
    cacheFactory: () => caches as ICacheStorage,
};
