import { configuration as sworkConfiguration } from "swork";
import { IServiceCollection, IServiceWorkerBuilder, IServiceWorkerConfiguration, IStartup, StartupFactory } from "./abstractions";
import { ApplicationBuilder } from "./application-builder";
import { HostingEnvironment } from "./hosting-environment";
import { ServiceCollection } from "./service-collection";
import { ServiceProvider } from "./service-provider";

export class ServiceWorkerBuilder implements IServiceWorkerBuilder {
    private startupType: StartupFactory<IStartup> | null;
    private services: IServiceCollection;
    private singletonContainer: Map<string, object>;

    constructor(configuration: IServiceWorkerConfiguration) {
        this.startupType = null;
        this.singletonContainer = new Map<string, object>();
        this.services = new ServiceCollection();

        sworkConfiguration.version = configuration.version;

        if (configuration.environment) {
            sworkConfiguration.environment = configuration.environment;
        }

        if (configuration.origin) {
            sworkConfiguration.origin = configuration.origin;
        }
    }

    public useStartup<T extends IStartup>(startupType: StartupFactory<T>): IServiceWorkerBuilder {
        this.startupType = startupType;
        return this;
    }

    public build(): void {
        if (!this.startupType) {
            throw new Error("A startup type must be defined before build is called. See useStartup.");
        }

        const hostingEnvironment = new HostingEnvironment(sworkConfiguration);

        // tslint:disable-next-line:new-parens
        const startup = new (Function.prototype.bind.apply(this.startupType!, [null]) as any) as IStartup;

        if (startup.configureServices) {
            startup.configureServices(this.services, hostingEnvironment);
        }

        const serviceProvider = new ServiceProvider(this.services.serviceDescriptors, this.singletonContainer);

        const applicationBuilder = new ApplicationBuilder(serviceProvider, hostingEnvironment);

        startup.configure(applicationBuilder, hostingEnvironment);        

        const app = applicationBuilder.build();

        app.listen();
    }
}
