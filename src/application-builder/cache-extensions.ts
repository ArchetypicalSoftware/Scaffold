import { CacheStrategy, IApplicationBuilder, ICacheConfiguration, IFetchContext, IRouteVariables, LogLevel } from "./../abstractions";
import { ApplicationBuilder } from "./application-builder";

declare module "./../abstractions" {
    interface IApplicationBuilder {

        /**
         * Defines the cache strategy for requests that match the provided route(s).
         *
         * @param {(string | string[])} path route(s) to match
         * @param {CacheStrategy} cacheStrategy cache strategy to be used
         * @param {ICacheConfiguration} [settings] configuration options
         * @returns {IApplicationBuilder}
         * @memberof IApplicationBuilder
         */
        cache(path: string | string[], 
              cacheStrategy: CacheStrategy, 
              settings?: ICacheConfiguration): IApplicationBuilder;

        /**
         * Defines the cache strategy for requests that match the provided route(s) and predicate.
         *
         * @param {(string | string[])} path route(s) to match
         * @param {(fetchContext: IFetchContext, routeVariables: IRouteVariables) => boolean} predicate predicate to further evaluate request
         * @param {CacheStrategy} cacheStrategy cache strategy to be used
         * @param {ICacheConfiguration} [settings] configuration options
         * @returns {IApplicationBuilder}
         * @memberof IApplicationBuilder
         */
        cacheWhen(path: string | string[], 
                  predicate: (fetchContext: IFetchContext, routeVariables: IRouteVariables) => boolean, 
                  cacheStrategy: CacheStrategy, 
                  settings?: ICacheConfiguration): IApplicationBuilder;
    }
}

declare module "./application-builder" {
    // tslint:disable-next-line:interface-name
    interface ApplicationBuilder {
        cache(path: string | string[], 
              cacheStrategy: CacheStrategy, 
              settings?: ICacheConfiguration): IApplicationBuilder;

        cacheWhen(path: string | string[], 
                  predicate: (fetchContext: IFetchContext, routeVariables: IRouteVariables) => boolean, 
                  cacheStrategy: CacheStrategy, 
                  settings?: ICacheConfiguration): IApplicationBuilder;
    }
}

ApplicationBuilder.prototype.cache = function(path: string | string[], 
                                              cacheStrategy: CacheStrategy, 
                                              settings?: ICacheConfiguration): IApplicationBuilder {
    return this.cacheWhen(path, 
        null as unknown as (fetchContext: IFetchContext, routeVariables: IRouteVariables) => boolean, 
        cacheStrategy, 
        settings);
};

ApplicationBuilder.prototype.cacheWhen = function(path: string | string[], 
                                                  predicate: (fetchContext: IFetchContext, routeVariables: IRouteVariables) => boolean, 
                                                  cacheStrategy: CacheStrategy, 
                                                  settings?: ICacheConfiguration): IApplicationBuilder {
    settings = Object.assign({}, {
        cacheKey: this.config.version,
    } as ICacheConfiguration, settings) as ICacheConfiguration;

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
