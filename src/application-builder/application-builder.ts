import { IApplicationBuilder, IFetchContext, IServiceProvider, IServiceWorkerConfiguration, LogLevel, 
    RequestDelegate } from "../abstractions";

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
}