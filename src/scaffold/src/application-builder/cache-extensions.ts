import { FetchContext, IApplicationBuilder, LogLevel } from "./../abstractions";
import { ApplicationBuilder } from "./application-builder";
import { CacheStrategy } from "./cache-strategies";
import { IMapSettings } from "./map-extensions";

export interface ICacheSettings extends IMapSettings {
    key?: string;
}

declare module "./../abstractions" {
    interface IApplicationBuilder {
        cache(path: string | string[], cacheStrategy: CacheStrategy, settings?: ICacheSettings): IApplicationBuilder;
    }
}

declare module "./application-builder" {
    // tslint:disable-next-line:interface-name
    interface ApplicationBuilder {
        cache(path: string | string[], cacheStrategy: CacheStrategy, settings?: ICacheSettings): IApplicationBuilder;
    }
}

ApplicationBuilder.prototype.cache = function(path: string | string[], cacheStrategy: CacheStrategy, settings?: ICacheSettings): IApplicationBuilder {
    settings = Object.assign({}, {
        key: this.config.version,
    } as ICacheSettings, settings) as ICacheSettings;

    const strategy = cacheStrategy(settings.key);

    this.map(path, (builder) => {
        builder.run((fetchContext: FetchContext) => {
            fetchContext.log(LogLevel.Debug, `Cache extension handler matched on path ${path}`);
            fetchContext.response = strategy(fetchContext);
            fetchContext.event.respondWith(fetchContext.response);
            return Promise.resolve(fetchContext);
        });
    }, settings);

    return this;
};
