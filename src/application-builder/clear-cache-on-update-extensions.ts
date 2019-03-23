import { IApplicationBuilder, IApplicationLifetime, ICacheClearOptions, ILogger } from "../abstractions";
import { ApplicationBuilder } from "./application-builder";

// declare module "./../abstractions" {
//     interface IApplicationBuilder {
//         useClearCacheOnUpdate(configuration?: (options: ICacheClearOptions) => void): IApplicationBuilder;
//     }
// }

declare module "./application-builder" {
    // tslint:disable-next-line:interface-name
    interface ApplicationBuilder {
        useClearCacheOnUpdate(configuration?: (options: ICacheClearOptions) => void): IApplicationBuilder;
    }
}

ApplicationBuilder.prototype.useClearCacheOnUpdate = function(configuration?: (options: ICacheClearOptions) => void): IApplicationBuilder {
    const options = {
        keysToKeep: [this.config.version],
    } as ICacheClearOptions;

    if (configuration) {
        configuration(options);
    }

    const lifetime = this.applicationServices.getInstance<IApplicationLifetime>("IApplicationLifetime");
    const logger = this.applicationServices.getInstance<ILogger>("ILogger");

    lifetime.activating.register(async () => {
        logger.debug("Attempting to clear unused cache entries");
        const keys = await caches.keys();
        
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            if (options.keysToKeep.indexOf(key) === -1) {
                logger.debug(`Clearing cache with key ${key}`);
                await caches.delete(key);
            }
        }
    });

    return this;
};
