import { IApplicationBuilder, IApplicationLifetime, ILogger } from "../abstractions";
import { ApplicationBuilder } from "./application-builder";

// declare module "./../abstractions" {
//     interface IApplicationBuilder {
//         useInstallCache(urlsToCache: string[], key?: string): IApplicationBuilder;
//     }
// }

declare module "./application-builder" {
    // tslint:disable-next-line:interface-name
    interface ApplicationBuilder {
        useInstallCache(urlsToCache: string[], key?: string): IApplicationBuilder;
    }
}

ApplicationBuilder.prototype.useInstallCache = function(urlsToCache: string[], key?: string): IApplicationBuilder {
    key = key || this.config.version;

    const lifetime = this.applicationServices.getInstance<IApplicationLifetime>("IApplicationLifetime");
    const logger = this.applicationServices.getInstance<ILogger>("ILogger");

    lifetime.installing.register(async () => {
        logger.debug(`Caching with key ${key!} the following files:\n\t\n${urlsToCache.join("\t\n")}`);
        const cache = await caches.open(key!);
        await cache.addAll(urlsToCache);
    });

    return this;
};
