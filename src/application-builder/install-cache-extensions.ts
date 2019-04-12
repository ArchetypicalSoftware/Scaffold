import { IApplicationBuilder, IApplicationLifetime, ILogger } from "../abstractions";
import { ApplicationBuilder } from "./application-builder";

declare module "./../abstractions" {
    interface IApplicationBuilder {

        /**
         * Fetches and caches the provided assets
         *
         * @param {string[]} urlsToCache List of asset urls to cache
         * @param {string} [cacheKey] Key to cache under
         * @returns {IApplicationBuilder}
         * @memberof IApplicationBuilder
         */
        useInstallCache(urlsToCache: string[], cacheKey?: string): IApplicationBuilder;
    }
}

declare module "./application-builder" {
    // tslint:disable-next-line:interface-name
    interface ApplicationBuilder {
        useInstallCache(urlsToCache: string[], cacheKey?: string): IApplicationBuilder;
    }
}

ApplicationBuilder.prototype.useInstallCache = function(urlsToCache: string[], cacheKey?: string): IApplicationBuilder {
    cacheKey = cacheKey || this.config.version;

    const lifetime = this.services.getInstance<IApplicationLifetime>("IApplicationLifetime");
    const logger = this.services.getInstance<ILogger>("ILogger");

    lifetime.installing.register(async () => {
        logger.debug(`Caching with key ${cacheKey!} the following files:\n\t\n${urlsToCache.join("\t\n")}`);
        const cache = await caches.open(cacheKey!);
        await cache.addAll(urlsToCache);
    });

    return this;
};
