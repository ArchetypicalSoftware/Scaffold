import { EventType, Middleware, Swork } from "swork";
import { Router } from "swork-router";
import { when } from "swork-when";
import { IApplicationBuilder, ICacheClearOptions, IHostingEnvironment, IRouteConfiguration, IServiceProvider } from "./abstractions";
import { middlewares } from "./middlewares";

// @ts-ignore
declare var clients: Clients;
// @ts-ignore
declare var self: ServiceWorkerGlobalScope;

export class ApplicationBuilder implements IApplicationBuilder {
    public properties: Map<string, object | string | number>;
    public services: IServiceProvider;
    public env: IHostingEnvironment;

    private instance: Swork;

    constructor(services: IServiceProvider, env: IHostingEnvironment) {
        this.properties = new Map<string, object | string | number>();
        this.services = services;
        this.env = env;
        
        this.instance = new Swork();
    }

    /**
     * Creates a new instance of an ApplicationBuilder with the same properties
     *
     * @returns {ApplicationBuilder}
     * @memberof ApplicationBuilder
     */
    public clone(): IApplicationBuilder {
        const clone = new ApplicationBuilder(this.services, this.env);

        this.properties.forEach((value: object | string | number, key: string) => clone.properties.set(key, value));

        return clone;
    }

    /**
     * Gets a property
     *
     * @param {string} key
     * @returns {T}
     * @memberof ApplicationBuilder
     */
    public getProperty<T extends object | string | number>(key: string): T  {
        return this.properties.get(key) as T;
    }
    
    /**
     * Sets a property
     *
     * @param {string} key
     * @param {T} value
     * @memberof ApplicationBuilder
     */
    public setProperty<T extends object | string | number>(key: string, value: T): void {
        this.properties.set(key, value);
    }

    /**
     * Builds the request pipeline.
     *
     * @memberof ApplicationBuilder
     */
    public build(): Swork {        
        return this.instance;
    }

    /**
     * Adds a pass through a middleware
     *
     * @param {Middleware} middleware
     * @returns {ApplicationBuilder}
     * @memberof ApplicationBuilder
     */
    public use(middleware: Middleware): IApplicationBuilder {
        this.instance.use(middleware);
        return this;
    }

    public on(eventType: EventType, ...handlers: Array<(event: any) => Promise<void> | void>): IApplicationBuilder {
        this.instance.on(eventType, ...handlers);
        return this;
    }

    public useClaimClients(): IApplicationBuilder {
        this.instance.use(middlewares.claimClients());
        return this;
    }

    public useClearCacheOnUpdate(options: ICacheClearOptions): IApplicationBuilder {
        options = Object.assign({}, {
            whitelist: [this.env.version],
        }, options);

        this.instance.on("activate", middlewares.clearCacheOnUpdate(options));
        
        return this;
    }

    public useLogging(useInProduction?: boolean): IApplicationBuilder {
        useInProduction = useInProduction || false;

        if (useInProduction || this.env.isDevelopment()) {
            this.instance.use(middlewares.logger());
        }

        return this;
    }

    public useInstallCache(urlsToCache: string[], cacheKey?: string): IApplicationBuilder {
        cacheKey = cacheKey || this.env.version;

        this.instance.on("install", middlewares.installCache(urlsToCache, cacheKey));

        return this;
    }
    
    public map(path: string | string[], 
               middleware: Middleware, 
               settings?: IRouteConfiguration): IApplicationBuilder {
        const router = this.buildRouter(path, middleware, settings);

        this.instance.use(router.routes());

        return this;
    }

    public mapWhen(path: string | string[], 
                   predicate: (fetchContext: any) => boolean | Promise<boolean>, 
                   middleware: Middleware, 
                   settings?: IRouteConfiguration): IApplicationBuilder {
        const router = this.buildRouter(path, middleware, settings);

        this.instance.use(when(predicate, (new Swork()).use(router.routes())));

        return this;
    }

    public useWhen(predicate: (fetchContext: any) => boolean | Promise<boolean>, middleware: Middleware): IApplicationBuilder {
        this.use(when(predicate, (new Swork()).use(middleware)));
        return this;
    }

    private buildRouter(path: string | string[], middleware: Middleware, settings?: IRouteConfiguration): Router {
        const router = new Router();
        
        if (!settings || !settings.methods) {
            settings = {
                methods: [ "GET" ],
            } as IRouteConfiguration;
        }

        settings.methods!.forEach((method) => {
            switch (method) {
                case "GET":
                    router.get(path, middleware);
                    break;
                
                case "POST":
                    router.post(path, middleware);
                    break;

                case "PUT":
                    router.put(path, middleware);
                    break;

                case "DELETE":
                    router.delete(path, middleware);
                    break;

                case "OPTIONS":
                    router.options(path, middleware);
                    break;

                case "PATCH":
                    router.patch(path, middleware);
                    break;

                case "HEAD":
                    router.head(path, middleware);
                    break;

                case "ALL":
                    router.all(path, middleware);
                    break;
            }
        });

        return router;
    }
}
