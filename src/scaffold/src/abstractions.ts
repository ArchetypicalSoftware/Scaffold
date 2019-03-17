export class LogEntry {
    public logLevel: LogLevel;
    public message: string;

    constructor(logLevel: LogLevel, message: string) {
        this.logLevel = logLevel;
        this.message = message;
    }
}

export class FetchContext {
    public request: Request;
    public response: Promise<Response>;
    public event: FetchEvent;
    public serviceProvider: IServiceProvider;
    public logEntries: LogEntry[];

    constructor(fetchEvent: FetchEvent, serviceProvider?: IServiceProvider) {
        this.request = fetchEvent.request;
        this.response = null as unknown as Promise<Response>;
        this.event = fetchEvent;
        this.serviceProvider = serviceProvider as IServiceProvider;
        this.logEntries = [];
    }

    public log(logLevel: LogLevel, message: string): void {
        this.logEntries.push(new LogEntry(logLevel, message));
    }
}

export type RequestDelegate = (fetchContext: FetchContext) => Promise<FetchContext>;

export interface IMiddleware {
    next: RequestDelegate;
    invokeAsync(fetchContext: FetchContext): Promise<FetchContext>;
}

export interface IApplicationBuilder {
    properties: Map<string, object>;
    defaultRequestDelegate: RequestDelegate;
    config: IServiceWorkerConfiguration;

    applicationServices: IServiceProvider;

    setProperty<T extends object>(key: string, value: T): void;
    getProperty<T extends object>(key: string): T;

    clone(): IApplicationBuilder;
    build(): RequestDelegate;
    use(middleware: (requestDelegate: RequestDelegate) => RequestDelegate): IApplicationBuilder;
    useNext(middleware: (fetchContext: FetchContext, next: () => Promise<FetchContext>) => Promise<FetchContext>): IApplicationBuilder;
    run(handler: RequestDelegate): void;
}

export type MiddlewareFactory<T extends IMiddleware> = { new(next: RequestDelegate, ...args: any[]): T; };

export enum ServiceLifetime {
    Transient,
    Scoped,
    Singleton,
}

export interface IServiceDescriptor {
    lifetime: ServiceLifetime;
    factory: () => object;
    key: string;
}

export interface IServiceCollection {
    serviceDescriptors: Map<string, IServiceDescriptor>;

    addTransient<T extends object>(key: string, factory: () => T): void;
    addScoped<T extends object>(key: string, factory: () => T): void;
    addSingleton<T extends object>(key: string, factory: () => T): void;
}

export interface IServiceProvider {
    getInstance<T extends object>(key: string): T;
    resetScope(): void;
}

export interface IStartup {
    configure(applicationBuilder: IApplicationBuilder): void;
    configureServices?(services: IServiceCollection): void;
}

export type StartupFactory<T extends IStartup> = { new(): T };

export interface IServiceWorkerBuilder {
    useStartup<T extends IStartup>(startupType: StartupFactory<T>): IServiceWorkerBuilder;
    build(): void;
}

export interface IServiceWorkerConfiguration {
    version: string;
    origin?: string;
    environment?: "production" | "development";
}

export interface ICacheClearOptions {
    whitelist: string[];
}

export interface IApplicationLifetime {
    activating: EventToken;
    installing: EventToken;
}

export class EventTokenSource {
    public token: EventToken;

    private handlers: Array<(() => Promise<void>)>;
    private hasFired: boolean;

    constructor() {
        this.handlers = [];
        this.hasFired = false;
        this.token = new EventToken(this.handlers);
    }

    public async fire(logger?: ILogger) {
        if (!this.hasFired) {
            this.hasFired = true;

            const promises: Array<Promise<void>> = [];

            this.handlers.forEach((handler) => {
                try {
                    promises.push(handler());
                } catch (err) {
                    if (logger) {
                        logger.error(err);
                    }
                }
            });

            // Wait for all the promises even if there are rejections
            await Promise.all(promises.map((promise) => {
                if (promise.catch) {
                    return promise.catch((e) => {
                        if (logger) {
                            logger.error(e);
                        }
                    });
                }
            }));
        }
    }
}

export class EventToken {
    private handlers: Array<(event: ExtendableEvent) => Promise<void>>;

    constructor(handlers: Array<(event: ExtendableEvent) => Promise<void>>) {
        this.handlers = handlers;
    }

    public register(handler: (event: ExtendableEvent) => Promise<void>) {
        this.handlers.push(handler);
    }
}

export interface ILogger {
    logLevel: LogLevel;

    isDebug: boolean;
    isInfo: boolean;
    isWarn: boolean;

    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;

    group(title: string, message?: string, logLevel?: LogLevel): void;
    groupCollapsed(title: string, message?: string, logLevel?: LogLevel): void;
    groupEnd(): void;
}

export enum LogLevel {
    None = 0,
    Debug = 1,
    Info = 2,
    Warn = 3,
    Error = 4,
}
