
import { EventType, FetchContext, Middleware, Swork } from "swork";
import { IFetchLogger } from "swork-logger";

/**
 * Collection of services to be used by the IServiceProvider. This interface is intended 
 * to be extended to accommodate additional functionality or implementations. Refer to 
 * extension implementations found in the documentation for examples.
 *
 * @export
 * @interface IServiceCollection
 */
export interface IServiceCollection {
    /**
     * List of service descriptors. Describes the service and their lifetimes.
     *
     * @type {Map<string, IServiceDescriptor>}
     * @memberof IServiceCollection
     */
    serviceDescriptors: Map<string, IServiceDescriptor>;

    /**
     * Defines a service that will be instantiated new every call.
     *
     * @template T Type of service
     * @param {string} key Name of the service
     * @param {() => T} factory Factory of the service
     * @memberof IServiceCollection
     */
    addTransient<T extends object>(key: string, factory: () => T): void;

    /**
     * Defines a service that will be instantiated once per fetch request
     * and reused thereafter.
     *
     * @template T Type of service
     * @param {string} key Name of the service
     * @param {() => T} factory Factory of the service
     * @memberof IServiceCollection
     */
    addScoped<T extends object>(key: string, factory: () => T): void;

    /**
     * Defines a service that will be instantiated once and reused thereafter.
     *
     * @template T Type of service
     * @param {string} key Name of the service
     * @param {() => T} factory Factory of the service
     * @memberof IServiceCollection
     */
    addSingleton<T extends object>(key: string, factory: () => T): void;

    /**
     * Defines a configuration object available to middleware.
     *
     * @template T Configuration object type
     * @param {string} optionsName Name of configuration object type
     * @param {T} options Instance of configuration object
     * @memberof IServiceCollection
     */
    configure<T extends object>(optionsName: string, options: T): void;
}

/**
 * Defines the hosting environment
 *
 * @export
 * @interface IHostingEnvironment
 */
export interface IHostingEnvironment {
    /**
     * The version of the service worker
     *
     * @type {string}
     * @memberof IHostingEnvironment
     */
    version: string;

    /**
     * The origin of the service worker
     *
     * @type {string}
     * @memberof IHostingEnvironment
     */
    origin: string;

    /**
     * Returns true if the environment is "development"
     *
     * @returns {boolean}
     * @memberof IHostingEnvironment
     */
    isDevelopment(): boolean;

    /**
     * Returns true if the environment is "production"
     *
     * @returns {boolean}
     * @memberof IHostingEnvironment
     */
    isProduction(): boolean;    
}

/**
 * Defines the lifetime of a service
 *
 * @export
 * @enum {number}
 */
export enum ServiceLifetime {
    /**
     * New instance every call
     */
    Transient,

    /**
     * One instance per fetch request pipeline
     */
    Scoped,

    /**
     * One instance per service worker
     */
    Singleton,
}

/**
 * Describes a service definition
 *
 * @export
 * @interface IServiceDescriptor
 */
export interface IServiceDescriptor {
    /**
     * How long the service should live
     *
     * @type {ServiceLifetime}
     * @memberof IServiceDescriptor
     */
    lifetime: ServiceLifetime;

    /**
     * Factory method
     *
     * @memberof IServiceDescriptor
     */
    factory: () => object;
    
    /**
     * Unique key used to reference the type
     *
     * @type {string}
     * @memberof IServiceDescriptor
     */
    key: string;
}

/**
 * Provides instances of services initially defined in the IServiceCollection
 *
 * @export
 * @interface IServiceProvider
 */
export interface IServiceProvider {

    /**
     * Returns an instance of type T associated with the private key.
     *
     * @template T Type of service
     * @param {string} key Name of the service
     * @returns {T}
     * @memberof IServiceProvider
     */
    getInstance<T extends object>(key: string): T;
}

/**
 * Interface to define the Startup class structure. The extended class is intended to
 * define the services and fetch pipeline for the given service worker. Once the class
 * is defined, it should be provided to the useStartup method of the IServiceWorkerBuilder
 * implementation.
 *
 * @export
 * @interface IStartup
 */
export interface IStartup {
    
    /**
     * Configures the fetch request pipeline. Remember that order is important when 
     * building upon the provided IApplicationBuilder instance. The pipeline is created
     * in the exact order as defined in code.
     *
     * @param {IApplicationBuilder} applicationBuilder
     * @param {IHostingEnvironment} env
     * @memberof IStartup
     */
    configure(applicationBuilder: IApplicationBuilder, env: IHostingEnvironment): void;

    /**
     * Configures any service providers and their lifetimes
     *
     * @param {IServiceCollection} services
     * @param {IHostingEnvironment} env
     * @memberof IStartup
     */
    configureServices?(services: IServiceCollection, env: IHostingEnvironment): void;
}

/**
 * Defines a class of type IStartup that has a parameterless constructor
 *
 * @export
 * @type MiddlewareFactory
 */
export type StartupFactory<T extends IStartup> = { new(): T };

/**
 * Class intended to build the service worker 
 *
 * @export
 * @interface IServiceWorkerBuilder
 */
export interface IServiceWorkerBuilder {
    /**
     * Indicates which Startup class will build the services and fetch pipeline. This
     * method must be called.
     *
     * @template T Type implementing [[IStartup]]
     * @param {StartupFactory<T>} startupType Startup class type
     * @returns {IServiceWorkerBuilder}
     * @memberof IServiceWorkerBuilder
     */
    useStartup<T extends IStartup>(startupType: StartupFactory<T>): IServiceWorkerBuilder;

    /**
     * Builds the service worker. This is intended to be the last step of the build process.
     *
     * @memberof IServiceWorkerBuilder
     */
    build(): void;
}

/**
 * Configuration used for clearing older cache entries.
 *
 * @export
 * @interface ICacheClearOptions
 */
export interface ICacheClearOptions {
    
    /**
     * The list of keys to not clear.
     *
     * @type {string[]}
     * @memberof ICacheClearOptions
     */
    whitelist: string[];
}

/**
 * Defines a HttpMethod. 
 *
 * @export
 * @type MiddlewareFactory
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "OPTIONS" | "TRACE" | "PATCH" | "ALL";

/**
 * Configuration object for routes
 *
 * @export
 * @interface IRouteConfiguration
 */
export interface IRouteConfiguration {

    /**
     * List of HttpMethods to match on. Default value is ["GET"].
     *
     * @type {HttpMethod[]}
     * @memberof IRouteConfiguration
     */
    methods?: HttpMethod[];
}

/**
 * Used to create the request pipeline. This interface is intended to be extended
 * to accommodate additional functionality or implementations. Refer to extension 
 * implementations found in the documentation for examples.
 *
 * @export
 * @interface ApplicationBuilder
 */
export interface IApplicationBuilder {
    /**
     * Attempt to claim all available clients within scope.
     * See more at https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
     *
     * @returns {IApplicationBuilder}
     * @memberof ApplicationBuilder
     */
    useClaimClients(): IApplicationBuilder;

    /**
     * Clears any entries not on the whitelist
     *
     * @param {ICacheClearOptions} options
     * @returns {IApplicationBuilder}
     * @memberof ApplicationBuilder
     */
    useClearCacheOnUpdate(options: ICacheClearOptions): IApplicationBuilder;

    /**
     * Fetches and caches the provided assets
     *
     * @param {string[]} urlsToCache List of asset urls to cache
     * @param {string} [cacheKey] Key to cache under
     * @returns {IApplicationBuilder}
     * @memberof ApplicationBuilder
     */
    useInstallCache(urlsToCache: string[], cacheKey?: string): IApplicationBuilder;

    /**
     * A terminal handler execute when a provided route matches
     * 
     * @param path path route(s) to match
     * @param middleware execution path on match
     * @param settings configuration options
     */
    map(path: string | string[], 
        middleware: Middleware,
        settings?: IRouteConfiguration): IApplicationBuilder;
    
    /**
     * A terminal handler execute when a provided route and predicate matches
     * 
     * @param path path route(s) to match
     * @param predicate predicate to further evaluate request
     * @param middleware execution path on match
     * @param settings configuration options
     */
    mapWhen(path: string | string[], 
            predicate: (fetchContext: FetchContext) => boolean | Promise<boolean>,
            middleware: Middleware, 
            settings?: IRouteConfiguration): IApplicationBuilder;

    /**
     * Defines a pass through middleware used when the predicate returns true
     *
     * @param {(fetchContext: IFetchContext) => boolean | Promise<boolean>} predicate
     * @param {Middleware} middleware
     * @returns {IApplicationBuilder}
     * @memberof ApplicationBuilder
     */
    useWhen(predicate: (fetchContext: FetchContext) => boolean | Promise<boolean>,
            middleware: Middleware): IApplicationBuilder;

    useLogging(useInProduction?: boolean): IApplicationBuilder;

    on(eventType: EventType, ...handlers: Array<(event: any) => Promise<void> | void>): IApplicationBuilder;

    use(middleware: Middleware): IApplicationBuilder;

    build(): Swork;

    clone(): IApplicationBuilder;

    getProperty<T extends object | string | number>(key: string): T;

    setProperty<T extends object | string | number>(key: string, value: T): void;
}

/**
 * Configuration object for the service worker
 *
 * @export
 * @interface IServiceWorkerConfiguration
 */
export interface IServiceWorkerConfiguration {

    /**
     * Defines the version of the service worker.
     *
     * @type {string}
     * @memberof IServiceWorkerConfiguration
     */
    version: string;

    /**
     * Defines the origin of the service worker. If not provided,
     * the value will be pulled from the origin of the service
     * worker's location.
     *
     * @type {string}
     * @memberof IServiceWorkerConfiguration
     */
    origin?: string;

    /**
     * Defines the current build type of the service worker. Supported
     * values include "development" and "production". 
     *
     * @type {("production" | "development")}
     * @memberof IServiceWorkerConfiguration
     */
    environment?: "production" | "development";
}
