import { IApplicationBuilder, IApplicationLifetime, ICacheClearOptions, ILogger } from "../abstractions";
import { ApplicationBuilder } from "./application-builder";

declare module "./../abstractions" {
    interface IApplicationBuilder {
        /**
         * Clears any entries not on the whitelist
         *
         * @param {ICacheClearOptions} options
         * @returns {IApplicationBuilder}
         * @memberof IApplicationBuilder
         */
        useClearCacheOnUpdate(options: ICacheClearOptions): IApplicationBuilder;
    }
}

declare module "./application-builder" {
    // tslint:disable-next-line:interface-name
    interface ApplicationBuilder {
        useClearCacheOnUpdate(options: ICacheClearOptions): IApplicationBuilder;
    }
}

ApplicationBuilder.prototype.useClearCacheOnUpdate = function(options: ICacheClearOptions): IApplicationBuilder {
    options = Object.assign({}, {
        whitelist: [this.config.version],
    }, options);

    const lifetime = this.services.getInstance<IApplicationLifetime>("IApplicationLifetime");
    const logger = this.services.getInstance<ILogger>("ILogger");

    lifetime.activating.register(async () => {
        logger.debug("Attempting to clear unused cache entries");
        
        const keys = await caches.keys();

        await Promise.all(keys.map(async (key: string) => {
            if (options.whitelist.indexOf(key) === -1) {
                logger.debug(`Clearing cache with key ${key}`);
                await caches.delete(key);
            }
        }));
    });

    return this;
};
