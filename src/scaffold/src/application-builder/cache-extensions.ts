import { CacheStrategy, IApplicationBuilder, IFetchContext, IRouteConfiguration, LogLevel } from "./../abstractions";
import { RouteVariables } from "./../routing/route-variables";
import { ApplicationBuilder } from "./application-builder";

export interface ICacheSettings extends IRouteConfiguration {
    cacheKey?: string;
}

declare module "./../abstractions" {
    interface IApplicationBuilder {
        cache(path: string | string[], cacheStrategy: CacheStrategy, settings?: ICacheSettings): IApplicationBuilder;
        cacheWhen(path: string | string[], predicate: (fetchContext: IFetchContext, routeVariables: RouteVariables) => boolean, 
                  cacheStrategy: CacheStrategy, settings?: ICacheSettings): IApplicationBuilder;
    }
}

declare module "./application-builder" {
    // tslint:disable-next-line:interface-name
    interface ApplicationBuilder {
        cache(path: string | string[], cacheStrategy: CacheStrategy, settings?: ICacheSettings): IApplicationBuilder;
        cacheWhen(path: string | string[], predicate: (fetchContext: IFetchContext, routeVariables: RouteVariables) => boolean, 
                  cacheStrategy: CacheStrategy, settings?: ICacheSettings): IApplicationBuilder;
    }
}

ApplicationBuilder.prototype.cache = function(path: string | string[], cacheStrategy: CacheStrategy, settings?: ICacheSettings): IApplicationBuilder {
    return this.cacheWhen(path, null as unknown as (fetchContext: IFetchContext, routeVariables: RouteVariables) => boolean, cacheStrategy, settings);
};

ApplicationBuilder.prototype.cacheWhen = function(path: string | string[], 
                                                  predicate: (fetchContext: IFetchContext, routeVariables: RouteVariables) => boolean, 
                                                  cacheStrategy: CacheStrategy, settings?: ICacheSettings): IApplicationBuilder {
    settings = Object.assign({}, {
        cacheKey: this.config.version,
    } as ICacheSettings, settings) as ICacheSettings;

    const strategy = cacheStrategy(settings.cacheKey);

    this.mapWhen(path, predicate, (builder) => {
        builder.run((fetchContext: IFetchContext) => {
            fetchContext.log(LogLevel.Debug, `Cache extension handler matched on path ${path}`);
            fetchContext.response = strategy(fetchContext);
            fetchContext.event.respondWith(fetchContext.response);
            return Promise.resolve(fetchContext);
        });
    }, settings);

    return this;
};
