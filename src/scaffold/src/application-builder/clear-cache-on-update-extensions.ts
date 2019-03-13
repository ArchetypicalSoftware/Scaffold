import { ApplicationBuilder } from './application-builder';
import { ICacheClearOptions, IApplicationLifetime, IApplicationBuilder } from '../abstractions';

declare module "./../abstractions" {
    interface IApplicationBuilder {
        useClearCacheOnUpdate(configuration?: (options: ICacheClearOptions) => void): IApplicationBuilder; 
    }
}

declare module "./application-builder" {
    interface ApplicationBuilder {
        useClearCacheOnUpdate(configuration?: (options: ICacheClearOptions) => void): IApplicationBuilder;
    }
}

ApplicationBuilder.prototype.useClearCacheOnUpdate = function(configuration?: (options: ICacheClearOptions) => void): IApplicationBuilder {
    const options = {
        whitelist: [this.config.version]
    } as ICacheClearOptions;

    if(configuration) {
        configuration(options);
    }

    const lifetime = this.applicationServices.getInstance<IApplicationLifetime>('IApplicationLifetime');

    lifetime.activating.register(async () => {
        (await caches.keys()).forEach(async (key: string) => {
            if(options.whitelist.indexOf(key) === -1) {
                await caches.delete(key);
            }
        });
    });

    return this;
}