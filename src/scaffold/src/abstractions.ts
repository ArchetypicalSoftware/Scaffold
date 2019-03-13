export type RequestDelegate = (fetchEvent: FetchEvent) => Promise<Response>;

export interface IMiddleware {
    next: RequestDelegate;
    invokeAsync(fetchEvent: FetchEvent): Promise<Response>;
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
    useNext(middleware: (fetchEvent: FetchEvent, next: () => Promise<Response>) => Promise<Response>): IApplicationBuilder;
    run(handler: RequestDelegate): void;
}

export type MiddlewareFactory<T extends IMiddleware> = { new(next: RequestDelegate, ...args: any[]): T; };

export enum ServiceLifetime {
    Transient,
    Scoped,
    Singleton
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

export type StartupFactory<T extends IStartup> = { new(): T }

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
    private handlers: (() => Promise<void>)[];
    private hasFired: boolean;

    public token: EventToken;

    constructor() {
        this.handlers = [];
        this.hasFired = false;
        this.token = new EventToken(this.handlers);
    }

    public async fire() {        
        if(!this.hasFired) {
            this.hasFired = true;

            // for loop to actually await the response.
            // forEach kicks them all off without waiting
            for(var i = 0; i < this.handlers.length; i++) {
                try {
                    await this.handlers[i]();
                } catch {}
            }
        }
    }
}

export class EventToken {
    private handlers: (() => Promise<void>)[];

    constructor(handlers: (() => Promise<void>)[]) {
        this.handlers = handlers;
    }

    public register(handler: () => Promise<void>) {
        this.handlers.push(handler);
    }
}