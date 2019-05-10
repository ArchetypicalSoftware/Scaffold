// tslint:disable-next-line:max-line-length
import { CacheStrategy, IApplicationLifetime, ICacheClearOptions, ICacheConfiguration, IFetchContext, ILogger, 
    IMiddleware, IRouteConfiguration, IRouteVariables, IServiceProvider, IServiceWorkerConfiguration, 
    LogLevel, MiddlewareFactory, RequestDelegate } from "./abstractions";
import { Route } from "./routing/route";
import { RouteVariables } from "./routing/route-variables";

declare var clients: Clients;
declare var self: ServiceWorkerGlobalScope;

/**
 * Used to create the request pipeline. This interface is intended to be extended
 * to accommodate additional functionality or implementations. Refer to extension 
 * implementations found in the documentation for examples.
 *
 * @export
 * @interface IApplicationBuilder
 */
export interface IApplicationBuilder {

    /**
     * The final RequestDelegate to be called when no other RequestDelegates
     * terminate the request pipeline.
     *
     * @type {RequestDelegate}
     * @memberof IApplicationBuilder
     */
    defaultRequestDelegate: RequestDelegate;
    
    /**
     * Service worker configuration object
     *
     * @type {IServiceWorkerConfiguration}
     * @memberof IApplicationBuilder
     */
    config: IServiceWorkerConfiguration;

    /**
     * Service provider used by middleware to obtain service instances
     *
     * @type {IServiceProvider}
     * @memberof IApplicationBuilder
     */
    services: IServiceProvider;

    /**
     * Sets an object to be shared between middleware implementations
     *
     * @template T Type of property
     * @param {string} key Name of the property
     * @param {T} value Value of the property
     * @memberof IApplicationBuilder
     */
    setProperty<T extends object>(key: string, value: T): void;
    
    /**
     * Gets an object to be shared between middleware implementations
     *
     * @template T Type of the property
     * @param {string} key Name of the property
     * @returns {T}
     * @memberof IApplicationBuilder
     */
    getProperty<T extends object>(key: string): T;
    
    /**
     * Clones the current instance of an IApplicationBuilder
     *
     * @returns {IApplicationBuilder}
     * @memberof IApplicationBuilder
     */
    clone(): IApplicationBuilder;

    /**
     * Builds the request pipeline. This should be called during the Activate event 
     * and stored for later use during any subsequent Fetch event.
     *
     * @returns {RequestDelegate}
     * @memberof IApplicationBuilder
     */
    build(): RequestDelegate;

    /**
     * Adds a pass through a middleware
     *
     * @param {(requestDelegate: RequestDelegate) => RequestDelegate} middleware
     * @returns {IApplicationBuilder}
     * @memberof IApplicationBuilder
     */
    use(middleware: (requestDelegate: RequestDelegate) => RequestDelegate): IApplicationBuilder;

    /**************** Extensions *******************************/

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

    /**
     * Attempt to claim all available clients within scope.
     * See more at https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
     *
     * @returns {IApplicationBuilder}
     * @memberof IApplicationBuilder
     */
    useClaimClients(): IApplicationBuilder;

    /**
     * Clears any entries not on the whitelist
     *
     * @param {ICacheClearOptions} options
     * @returns {IApplicationBuilder}
     * @memberof IApplicationBuilder
     */
    useClearCacheOnUpdate(options: ICacheClearOptions): IApplicationBuilder;

    /**
     * Fetches and caches the provided assets
     *
     * @param {string[]} urlsToCache List of asset urls to cache
     * @param {string} [cacheKey] Key to cache under
     * @returns {IApplicationBuilder}
     * @memberof IApplicationBuilder
     */
    useInstallCache(urlsToCache: string[], cacheKey?: string): IApplicationBuilder;

    /**
     * A terminal handler execute when a provided route matches
     * 
     * @param path path route(s) to match
     * @param configuration execution path on match
     * @param settings configuration options
     */
    map(path: string | string[], 
        configuration: (applicationBuilder: IApplicationBuilder) => void, 
        settings?: IRouteConfiguration): IApplicationBuilder;
    
    /**
     * A terminal handler execute when a provided route and predicate matches
     * 
     * @param path path route(s) to match
     * @param predicate predicate to further evaluate request
     * @param configuration execution path on match
     * @param settings configuration options
     */
    mapWhen(path: string | string[], 
            predicate: (fetchContext: IFetchContext, routeVariables: RouteVariables) => boolean,
            configuration: (applicationBuilder: IApplicationBuilder) => void, 
            settings?: IRouteConfiguration): IApplicationBuilder;

    /**
     * Build a middleware utilizing a type implementing IMiddleware
     *
     * @template T Type implementing IMiddleware
     * @param middlewareType Constructor of type T
     * @param params Additional parameters to be provided during T's construction
     */
    useMiddleware<T extends IMiddleware>(middlewareType: MiddlewareFactory<T>, ...params: any[]): IApplicationBuilder;
    
    /**
     * Builds a terminal handler that always executes
     * 
     * @param handler configuration handler
     */
    run(handler: RequestDelegate): IApplicationBuilder;

    /**
     * Creates a pass through middleware
     * 
     * @param middleware execution handler 
     */
    useNext(middleware: (fetchContext: IFetchContext, 
                         next: () => Promise<IFetchContext>) => Promise<IFetchContext>): IApplicationBuilder;

    /**
     * Defines a pass through middleware used when the predicate returns true
     *
     * @param {(fetchContext: IFetchContext) => boolean} predicate
     * @param {(applicationBuilder: IApplicationBuilder) => void} configuration
     * @returns {IApplicationBuilder}
     * @memberof IApplicationBuilder
     */
    useWhen(predicate: (fetchContext: IFetchContext) => boolean,
            configuration: (applicationBuilder: IApplicationBuilder) => void): IApplicationBuilder;
}

class MapOptions {
    public branch: RequestDelegate;
    public routes: Route[];
    public predicate: ((fetchContext: IFetchContext, routeVariables: RouteVariables) => boolean) | null;

    constructor(branch: RequestDelegate, routes: Route[],
                predicate: ((fetchContext: IFetchContext, routeVariables: RouteVariables) => boolean) | null = null) {
        this.branch = branch;
        this.routes = routes;
        this.predicate = predicate;
    }
}

class MapMiddleware implements IMiddleware {
    public next: RequestDelegate;
    private options: MapOptions;

    constructor(next: RequestDelegate, options: MapOptions) {
        this.next = next;
        this.options = options;
    }

    public async invokeAsync(fetchContext: IFetchContext): Promise<IFetchContext> {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < this.options.routes.length; i++) {
            const route = this.options.routes[i];
            if (route.isMatch(fetchContext.request)) {
                if (this.options.predicate) {
                    const routeVariables = route.getVariables(fetchContext.request);

                    if (this.options.predicate(fetchContext, routeVariables)) {
                        return await this.options.branch(fetchContext);
                    }
                } else {
                    return await this.options.branch(fetchContext);
                }
            }
        }

        return await this.next(fetchContext);
    }
}

export class ApplicationBuilder implements IApplicationBuilder {
    public properties: Map<string, object>;
    public defaultRequestDelegate: RequestDelegate;
    public services: IServiceProvider;
    public config: IServiceWorkerConfiguration;

    private components: Array<(requestDelegate: RequestDelegate) => RequestDelegate> = [];

    constructor(config: IServiceWorkerConfiguration, applicationServices: IServiceProvider) {
        this.properties = new Map<string, object>();
        this.services = applicationServices;
        this.config = config;

        this.defaultRequestDelegate = (fetchContext: IFetchContext): Promise<IFetchContext> => {
            fetchContext.log(LogLevel.Debug, "Default handler: executing fetch");
            fetchContext.response = fetch(fetchContext.request);
            fetchContext.event.respondWith(fetchContext.response);
            return Promise.resolve(fetchContext);
        };
    }

    public clone(): IApplicationBuilder {
        const clone = new ApplicationBuilder(this.config, this.services);

        this.properties.forEach((value: object, key: string) => clone.setProperty(key, value));

        return clone;
    }

    public setProperty<T extends object>(key: string, value: T) {
        this.properties.set(key, value);
    }

    public getProperty<T extends object>(key: string) {
        return this.properties.get(key) as T;
    }

    public use(middleware: (requestDelegate: RequestDelegate) => RequestDelegate): IApplicationBuilder {
        this.components.push(middleware);
        return this;
    }

    public build(): RequestDelegate {
        let app: RequestDelegate = this.defaultRequestDelegate;
        this.components.reverse().forEach((component) => app = component(app));
        return app;
    }

    /************************* Extensions ***************************/

    public cache(path: string | string[], cacheStrategy: CacheStrategy, settings?: ICacheConfiguration): IApplicationBuilder {
        return this.cacheWhen(path, 
            null as unknown as (fetchContext: IFetchContext, routeVariables: IRouteVariables) => boolean, 
            cacheStrategy, 
            settings);
    }

    public cacheWhen(path: string | string[],
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
    }

    public useClaimClients(): IApplicationBuilder {
        const lifetime = this.services.getInstance<IApplicationLifetime>("IApplicationLifetime");
        const logger = this.services.getInstance<ILogger>("ILogger");
    
        lifetime.installing.register(async (event: ExtendableEvent) => {
            logger.debug("Skipping activation");
            self.skipWaiting();
        });
    
        lifetime.activating.register(async (event: ExtendableEvent) => {
            logger.debug("Claiming available clients");
            await clients.claim();
        });
        return this;
    }

    public useClearCacheOnUpdate(options: ICacheClearOptions): IApplicationBuilder {
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
    }

    public useInstallCache(urlsToCache: string[], cacheKey?: string): IApplicationBuilder {
        cacheKey = cacheKey || this.config.version;
    
        const lifetime = this.services.getInstance<IApplicationLifetime>("IApplicationLifetime");
        const logger = this.services.getInstance<ILogger>("ILogger");
    
        lifetime.installing.register(async () => {
            logger.debug(`Caching with key ${cacheKey!} the following files:\n\t\n${urlsToCache.join("\t\n")}`);
            const cache = await caches.open(cacheKey!);
            await cache.addAll(urlsToCache);
        });
    
        return this;
    }

    public map(path: string | string[],
               configuration: (applicationBuilder: IApplicationBuilder) => void,
               settings?: IRouteConfiguration): IApplicationBuilder {
        return this.mapWhen(path, 
                            null as unknown as (fetchContext: IFetchContext, routeVariables: RouteVariables) => boolean, 
                            configuration, 
                            settings);
    }

    public mapWhen(path: string | string[],
                   predicate: (fetchContext: IFetchContext, routeVariables: RouteVariables) => boolean,
                   configuration: (applicationBuilder: IApplicationBuilder) => void,
                   settings?: IRouteConfiguration): IApplicationBuilder {
        const branchBuilder = this.clone();
        configuration(branchBuilder);
        const branch = branchBuilder.build();

        if (typeof (path) === "string") {
            path = [path];
        }

        const routes = path.map((x) => new Route(x, this.config.origin!, settings));

        const options = new MapOptions(branch, routes, predicate);
        return this.useMiddleware(MapMiddleware, options);
    }

    public useMiddleware<T extends IMiddleware>(middlewareType: MiddlewareFactory<T>,
                                                ...params: any[]): IApplicationBuilder {
        this.use((requestDelegate: RequestDelegate) => {
            params.splice(0, 0, null, requestDelegate);

            // tslint:disable-next-line:new-parens
            const instance: IMiddleware = new (Function.prototype.bind.apply(middlewareType, params as [any, ...any[]]) as any) as IMiddleware;

            return async (fetchContext: IFetchContext) => {
                return await instance.invokeAsync(fetchContext);
            };
        });

        return this;
    }

    public run(handler: RequestDelegate): IApplicationBuilder {
        this.use(() => handler);
    
        return this;
    }

    public useNext(middleware: (fetchContext: IFetchContext, 
                                next: () => Promise<IFetchContext>) => Promise<IFetchContext>): IApplicationBuilder {
        this.use((next: RequestDelegate) => {
            return (fetchContext: IFetchContext) => {
                const simpleNext = () => next(fetchContext);
                return middleware(fetchContext, simpleNext);
            };
        });

        return this;
    }

    public useWhen(predicate: (fetchContext: IFetchContext) => boolean,
                   configuration: (applicationBuilder: IApplicationBuilder) => void): IApplicationBuilder {
        const branchBuilder = this.clone();
        configuration(branchBuilder);

        return this.use((main: RequestDelegate) => {
            branchBuilder.run(main);
            const branch = branchBuilder.build();

            return (fetchContext: IFetchContext) => {
                if (predicate(fetchContext)) {
                    return branch(fetchContext);
                } else {
                    return main(fetchContext);
                }
            };
        });
    }
}
