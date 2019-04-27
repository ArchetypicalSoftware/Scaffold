/**
 * Simple wrapper to contain log entries utilized in the 
 * request pipeline.
 * 
 * @export
 * @interface ILogEntry
 */
export interface ILogEntry {
    /**
     * The level of the log entry
     *
     * @type {LogLevel}
     * @memberof ILogEntry
     */
    logLevel: LogLevel;

    /**
     * The message to log
     *
     * @type {string}
     * @memberof ILogEntry
     */
    message: string;
}

/**
 * Context object passed through the fetch request pipeline. 
 * This object contains information relevant to the current request
 * including the request object, response object and FetchEvent instance.
 *
 * @export
 * @interface IFetchContext
 */
export interface IFetchContext {
    /**
     * The request generated by the fetch call 
     *
     * @type {Request}
     * @memberof IFetchContext
     */
    request: Request;

    /**
     * The resulting response promise
     *
     * @type {Promise<Response>}
     * @memberof IFetchContext
     */
    response: Promise<Response>;
    
    /**
     * The FetchEvent object generated by the fetch call
     *
     * @type {FetchEvent}
     * @memberof IFetchContext
     */
    event: FetchEvent;
    
    /**
     * The service provider used to get service instances
     *
     * @type {IServiceProvider}
     * @memberof IFetchContext
     */
    services: IServiceProvider;
    
    /**
     * Log entries to be grouped with others in the fetch call
     *
     * @type {ILogEntry[]}
     * @memberof IFetchContext
     */
    logEntries: ILogEntry[];

    /**
     * Store a new log entry
     *
     * @param {LogLevel} logLevel
     * @param {string} message
     * @memberof IFetchContext
     */
    log(logLevel: LogLevel, message: string): void;
}

/**
 * Defines the method to be used during the request pipeline
 *
 * @export
 * @type RequestDelegate
 */
export type RequestDelegate = (fetchContext: IFetchContext) => Promise<IFetchContext>;

/**
 * Type used to support middleware utilized in the request pipeline
 *
 * @export
 * @interface IMiddleware
 */
export interface IMiddleware {
    /**
     * Next RequestDelegate to be called after local work is completed
     *
     * @type {RequestDelegate}
     * @memberof IMiddleware
     */
    next: RequestDelegate;

    /**
     * The logic of the middleware. This is called during the request pipeline.
     *
     * @param {IFetchContext} fetchContext
     * @returns {Promise<IFetchContext>}
     * @memberof IMiddleware
     */
    invokeAsync(fetchContext: IFetchContext): Promise<IFetchContext>;
}

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
}

/**
 * Defines a class to have a constructor containing a request delegate as the first parameter
 * and resulting in an IMiddleware
 *
 * @export
 * @type MiddlewareFactory
 */
export type MiddlewareFactory<T extends IMiddleware> = { new(next: RequestDelegate, ...args: any[]): T; };

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
     * @param {ILogger} logger
     * @memberof IStartup
     */
    configure(applicationBuilder: IApplicationBuilder, logger?: ILogger): void;

    /**
     * Configures any service providers and their lifetimes
     *
     * @param {IServiceCollection} services
     * @param {ILogger} [logger]
     * @memberof IStartup
     */
    configureServices?(services: IServiceCollection, logger?: ILogger): void;
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
     * Configures the ILogger instance 
     *
     * @param {(builder: ILoggingBuilder) => void} configuration
     * @returns {IServiceWorkerBuilder}
     * @memberof IServiceWorkerBuilder
     */
    configureLogging(configuration: (builder: ILoggingBuilder) => void): IServiceWorkerBuilder;

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
 * Defines entry points into the service worker lifetime events
 *
 * @export
 * @interface IApplicationLifetime
 */
export interface IApplicationLifetime {
    
    /**
     * IEventToken for the Activate lifetime event
     *
     * @type {IEventToken}
     * @memberof IApplicationLifetime
     */
    activating: IEventToken;

    /**
     * IEventToken for the Install lifetime event
     *
     * @type {IEventToken}
     * @memberof IApplicationLifetime
     */
    installing: IEventToken;
}

/**
 * Enables callback registration for a given event.
 *
 * @export
 * @interface IEventToken
 */
export interface IEventToken {
    
    /**
     * Register a callback for this event.
     *
     * @param {(event: ExtendableEvent) => Promise<void>} handler
     * @memberof IEventToken
     */
    register(handler: (event: ExtendableEvent) => Promise<void>): void;
}

/**
 * Type used to build a logger instance
 *
 * @export
 * @interface ILoggingBuilder
 */
export interface ILoggingBuilder {

    /**
     * The resulting ILogger instance log level
     *
     * @type {(LogLevel | null)}
     * @memberof ILoggingBuilder
     */
    logLevel: LogLevel | null;

    /**
     * The factory to generate the ILogger instance
     *
     * @memberof ILoggingBuilder
     */
    loggerFactory: (() => ILogger) | null;
}

/**
 * Represents a type used to perform logging.
 *
 * @export
 * @interface ILogger
 */
export interface ILogger {

    /**
     * The current log level
     *
     * @type {LogLevel}
     * @memberof ILogger
     */
    logLevel: LogLevel;

    /**
     * If the logger currently supports debug logs
     *
     * @type {boolean}
     * @memberof ILogger
     */
    isDebug: boolean;

    /**
     * If the logger currently supports info logs
     *
     * @type {boolean}
     * @memberof ILogger
     */
    isInfo: boolean;

    /**
     * If the logger currently supports warn logs
     *
     * @type {boolean}
     * @memberof ILogger
     */
    isWarn: boolean;

    /**
     * Logs a debug level message
     *
     * @param {string} message
     * @memberof ILogger
     */
    debug(message: string): void;
    
    /**
     * Logs an info level message
     *
     * @param {string} message
     * @memberof ILogger
     */
    info(message: string): void;

    /**
     * Logs a warn level message
     *
     * @param {string} message
     * @memberof ILogger
     */
    warn(message: string): void;

    /**
     * Logs an error level message
     *
     * @param {string} message
     * @memberof ILogger
     */
    error(message: string): void;

    /**
     * Starts a group
     *
     * @param {string} title
     * @param {string} [message]
     * @param {LogLevel} [logLevel]
     * @memberof ILogger
     */
    group(title: string, message?: string, logLevel?: LogLevel): void;

    /**
     * Starts a collapsed group
     *
     * @param {string} title
     * @param {string} [message]
     * @param {LogLevel} [logLevel]
     * @memberof ILogger
     */
    groupCollapsed(title: string, message?: string, logLevel?: LogLevel): void;
    
    /**
     * Ends a (collapsed) group
     *
     * @memberof ILogger
     */
    groupEnd(): void;
}

/**
 * Log level
 *
 * @export
 * @enum {number}
 */
export enum LogLevel {

    /**
     * Any log level entries are written
     */
    Any = 0,

    /**
     * Debug and above log level entries are written
     */
    Debug = 1,

    /**
     * Info and above log level entries are written
     */
    Info = 2,

    /**
     * Warn and above log level entries are written
     */
    Warn = 3,

    /**
     * Error and above log level entries are written
     */
    Error = 4,

    /**
     * No log entries are written
     */
    None = 5,
}

/**
 * Defines a cache strategy delegate. 'key' defaults to service worker version.
 *
 * @export
 * @type MiddlewareFactory
 */
export type CacheStrategy = (key?: string) => (fetchContext: IFetchContext) => Promise<Response>;

/**
 * List of available cache strategies
 *
 * @export
 * @interface ICacheStrategies
 */
export interface ICacheStrategies {
    
    /**
     * Cache strategy to only fetch from the server
     *
     * @type {CacheStrategy}
     * @memberof ICacheStrategies
     */
    networkOnly: CacheStrategy;
    
    /**
     * Cache strategy to only fetch from local cache
     *
     * @type {CacheStrategy}
     * @memberof ICacheStrategies
     */
    cacheOnly: CacheStrategy;
    
    /**
     * Cache strategy to fetch from the cache if present
     * otherwise fetch from network and update cache 
     *
     * @type {CacheStrategy}
     * @memberof ICacheStrategies
     */
    cacheFirst: CacheStrategy;

    /**
     * Cache strategy to fetch from network then fallback
     * cache if available
     *
     * @type {CacheStrategy}
     * @memberof ICacheStrategies
     */
    networkFirst: CacheStrategy;

    /**
     * Pull from cache if available and update the cache in
     * background
     *
     * @type {CacheStrategy}
     * @memberof ICacheStrategies
     */
    backgroundFetch: CacheStrategy;
}

/**
 * Defines a HttpMethod. 
 *
 * @export
 * @type MiddlewareFactory
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH";

/**
 * Provides variables defined by a route when matched. Used in the
 * predicate utilized by the mapWhen and cacheWhen extensions.
 *
 * @export
 * @interface IRouteVariables
 */
export interface IRouteVariables {

    /**
     * path variables
     *
     * @type {Map<string, string>}
     * @memberof IRouteVariables
     */
    path: Map<string, string>;

    /**
     * query variables
     *
     * @type {Map<string, string>}
     * @memberof IRouteVariables
     */
    query: Map<string, string>;

    /**
     * request URL object
     *
     * @type {URL}
     * @memberof IRouteVariables
     */
    url: URL;
}

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
 * Configuration object for cache extension.
 *
 * @export
 * @interface ICacheConfiguration
 * @extends {IRouteConfiguration}
 */
export interface ICacheConfiguration extends IRouteConfiguration {

    /**
     * The cache key to be used. Default value is the Service Worker's version
     * found in {@link IServiceWorkerConfiguration}
     *
     * @type {string}
     * @memberof ICacheConfiguration
     */
    cacheKey?: string;
}