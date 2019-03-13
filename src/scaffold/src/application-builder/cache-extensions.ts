import { ApplicationBuilder } from "./application-builder";
import { CacheStrategy } from "./cache-strategies";
import { IMapSettings } from "./map-extensions";

export interface ICacheSettings extends IMapSettings {
    key?: string;
}

declare module "./../abstractions" {
    interface IApplicationBuilder {
        cache(path: string, cacheStrategy: CacheStrategy, settings?: ICacheSettings) : void;
    }
}

declare module "./application-builder" {
    interface ApplicationBuilder {
        cache(path: string, cacheStrategy: CacheStrategy, settings?: ICacheSettings) : void;
    }
}

ApplicationBuilder.prototype.cache = function(path: string, cacheStrategy: CacheStrategy, settings?: ICacheSettings) : void {
    settings = Object.assign({}, {
        key: this.config.version,
        methods: ['GET']
    } as ICacheSettings, settings) as ICacheSettings;

    const requestDelegate = cacheStrategy(settings.key);

    this.map(path, builder => {
        builder.run((fetchEvent: FetchEvent) => {
            const response = requestDelegate(fetchEvent);
            fetchEvent.respondWith(response);
            return response;
        });        
    }, settings);
}