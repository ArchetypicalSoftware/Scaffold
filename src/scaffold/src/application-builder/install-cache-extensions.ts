import { ApplicationBuilder } from './application-builder';
import { IApplicationLifetime, IApplicationBuilder } from '../abstractions';

declare module "./../abstractions" {
    interface IApplicationBuilder {
        useInstallCache(...urlsToCache: string[]): IApplicationBuilder; 
    }
}

declare module "./application-builder" {
    interface ApplicationBuilder {
        useInstallCache(...urlsToCache: string[]): IApplicationBuilder;
    }
}

ApplicationBuilder.prototype.useInstallCache = function(...urlsToCache: string[]): IApplicationBuilder {
    const lifetime = this.applicationServices.getInstance<IApplicationLifetime>('IApplicationLifetime');

    lifetime.installing.register(async () => {
        const cache = await caches.open(this.config.version);
        await cache.addAll(urlsToCache);
    });

    return this;
}