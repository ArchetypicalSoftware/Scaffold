import { IApplicationBuilder, IServiceProvider, IServiceWorkerConfiguration, RequestDelegate } from "../abstractions";

export class ApplicationBuilder implements IApplicationBuilder {
    public properties: Map<string, object>;
    public defaultRequestDelegate: RequestDelegate;
    public applicationServices: IServiceProvider;
    public config: IServiceWorkerConfiguration;

    private components: Array<(requestDelegate: RequestDelegate) => RequestDelegate> = [];

    constructor(config: IServiceWorkerConfiguration, applicationServices: IServiceProvider) {
        this.properties = new Map<string, object>();
        this.applicationServices = applicationServices;
        this.config = config;

        this.defaultRequestDelegate = async (fetchEvent: FetchEvent): Promise<Response> => {
            const response = fetch(fetchEvent.request);
            fetchEvent.respondWith(response);
            return await response;
        };
    }

    public clone(): IApplicationBuilder {
        const clone = new ApplicationBuilder(this.config, this.applicationServices);

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

    public useNext(middleware: (fetchEvent: FetchEvent, next: () => Promise<Response>) => Promise<Response>): IApplicationBuilder {
        this.use((next: RequestDelegate) => {
            return async (fetchEvent: FetchEvent) => {
                const simpleNext = () => next(fetchEvent);
                return middleware(fetchEvent, simpleNext);
            };
        });
        return this;
    }

    /**
     * Adds a terminal middleware delegate to the application's request pipeline
     *
     * @param {RequestDelegate} handler
     * @memberof ApplicationBuilder
     */
    public run(handler: RequestDelegate) {
        this.use(() => handler);
    }

    public build(): RequestDelegate {
        let app: RequestDelegate = this.defaultRequestDelegate;
        this.components.reverse().forEach((component) => app = component(app));
        return app;
    }
}
