import { ICacheClearOptions } from "../src/abstractions";
import { middlewares } from "../src/middlewares";
import { mockInit } from "./mock-helper";

describe("middlewares tests", () => {
    let cache: Cache;
    let caches: CacheStorage;

    beforeEach(() => {
        mockInit();

        cache = {
            addAll: jest.fn(() => Promise.resolve()) as unknown as jest.Mock<(urls: string[]) => Promise<void>>,
        } as unknown as Cache;

        caches = {
            delete: jest.fn(() => Promise.resolve(true)) as unknown as jest.Mock<() => Promise<boolean>>,
            keys: jest.fn(() => Promise.resolve(["key1", "key2"])) as unknown as jest.Mock<() => Promise<string[]>>,
            open: jest.fn(() => Promise.resolve(cache)) as unknown as jest.Mock<(cacheName: string) => Promise<Cache>>,
        } as unknown as CacheStorage;

        Object.assign(global, {
            caches,
        });
    });

    test("cacheClearOnUpdate", async (done) => {
        const middleware = middlewares.clearCacheOnUpdate({
            whitelist: ["key1"],
        } as ICacheClearOptions);

        await middleware();

        expect(caches.keys).toBeCalledTimes(1);

        expect(caches.delete).toBeCalledTimes(1);
        expect(caches.delete).toBeCalledWith("key2");

        done();
    });

    test("installCache", async (done) => {
        const urlsToCache = ["urlToCache"];
        const middleware = middlewares.installCache(urlsToCache, "cacheKey");

        await middleware();

        expect(caches.open).toBeCalledTimes(1);
        expect(caches.open).toBeCalledWith("cacheKey");

        expect(cache.addAll).toBeCalledTimes(1);
        expect(cache.addAll).toBeCalledWith(urlsToCache);

        done();
    });

    test("claimClients", async (done) => {
        const middleware = middlewares.claimClients();

        expect(middleware).toBeTruthy();
        done();
    });

    test("logger", () => {
        const middleware = middlewares.logger();

        expect(middleware).toBeTruthy();
    });
});
