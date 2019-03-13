import { IServiceWorkerBuilder, IStartup, StartupFactory, RequestDelegate, IServiceCollection, IServiceWorkerConfiguration, IApplicationLifetime, EventTokenSource, EventToken } from "./abstractions";
import { ServiceCollection } from "./service-collection/service-collection";
import { ServiceProvider } from "./service-collection/service-provider";
import { ApplicationBuilder } from "./application-builder/application-builder";

class ApplicationLifetime implements IApplicationLifetime {
    public activateEventSource: EventTokenSource;
    public installEventSource: EventTokenSource;

    public activating: EventToken;
    public installing: EventToken;

    constructor() {
        this.activateEventSource = new EventTokenSource();
        this.installEventSource = new EventTokenSource();

        this.activating = this.activateEventSource.token;
        this.installing = this.installEventSource.token;
    }
}

export class ServiceWorkerBuilder implements IServiceWorkerBuilder {
    private startupType: StartupFactory<IStartup> | null;
    private services: IServiceCollection;
    private config: IServiceWorkerConfiguration;
    private applicationLifetime: ApplicationLifetime;
    
    constructor(config: IServiceWorkerConfiguration) {
        this.config = Object.assign({}, {
            origin: location.origin,
            environment: "production"
        } as IServiceWorkerConfiguration, config);
        
        this.startupType = null;
        this.services = new ServiceCollection();
        this.applicationLifetime = new ApplicationLifetime();
        this.services.addSingleton('IApplicationLifetime', () => this.applicationLifetime);
    }

    useStartup<T extends IStartup>(startupType: StartupFactory<T>): IServiceWorkerBuilder {
        this.startupType = startupType;
        return this;
    }

    build(): void {
        if(!this.startupType) {
            throw new Error('A startup type must be defined before Build is called. See UseStartup.')
        }

        const startup = new (Function.prototype.bind.apply(this.startupType!, [null]) as any) as IStartup;

        if(startup.configureServices) {
            startup.configureServices(this.services);
        }

        const serviceProvider = new ServiceProvider(this.services.serviceDescriptors);

        const applicationBuilder = new ApplicationBuilder(this.config, serviceProvider);

        startup.configure(applicationBuilder);
        
        let requestDelegate: RequestDelegate | null = null;

        self.addEventListener('install', event => {
            (event as ExtendableEvent).waitUntil(this.applicationLifetime.installEventSource.fire());
        });

        self.addEventListener('activate', event => {
            (event as ExtendableEvent).waitUntil(this.applicationLifetime.activateEventSource.fire().then(() => {
                requestDelegate = applicationBuilder.build();
            }));
        });

        self.addEventListener('fetch', event => {
            try {
                (event as ExtendableEvent).waitUntil(requestDelegate!(event as FetchEvent));
            } catch(err) {
                console.log(err); // TODO ILogging
            }
        });
    }
}