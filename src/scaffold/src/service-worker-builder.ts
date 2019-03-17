import { EventToken, EventTokenSource, FetchContext, IApplicationLifetime, ILogger, IServiceCollection, IServiceWorkerBuilder,
    IServiceWorkerConfiguration, IStartup, LogLevel, RequestDelegate, StartupFactory } from "./abstractions";
import { ApplicationBuilder } from "./application-builder/application-builder";
import { Logger } from "./logger";
import { ServiceCollection } from "./service-collection/service-collection";
import { ServiceProvider } from "./service-collection/service-provider";

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
            environment: "production",
            origin: location.origin,
        } as IServiceWorkerConfiguration, config);

        this.startupType = null;
        this.services = new ServiceCollection();
        this.applicationLifetime = new ApplicationLifetime();
        this.services.addSingleton("IApplicationLifetime", () => this.applicationLifetime);
        this.services.addSingleton("ILogger", () => new Logger(this.config.environment === "development" ? LogLevel.Debug : LogLevel.Error));
    }

    public useStartup<T extends IStartup>(startupType: StartupFactory<T>): IServiceWorkerBuilder {
        this.startupType = startupType;
        return this;
    }

    public build(): void {
        if (!this.startupType) {
            throw new Error("A startup type must be defined before Build is called. See UseStartup.");
        }

        // tslint:disable-next-line:new-parens
        const startup = new (Function.prototype.bind.apply(this.startupType!, [null]) as any) as IStartup;

        if (startup.configureServices) {
            startup.configureServices(this.services);
        }

        const serviceProvider = new ServiceProvider(this.services.serviceDescriptors);

        const applicationBuilder = new ApplicationBuilder(this.config, serviceProvider);

        startup.configure(applicationBuilder);

        const logger = serviceProvider.getInstance<ILogger>("ILogger");

        let requestDelegate: RequestDelegate | null = null;

        self.addEventListener("install", (event) => {
            (event as ExtendableEvent).waitUntil((async () => {
                logger.groupCollapsed("INSTALL", "", LogLevel.Info);
                
                try {
                    await this.applicationLifetime.installEventSource.fire();
                } catch (err) {
                    logger.error(`Error during activate: ${err}`);
                } finally {
                    logger.groupEnd();
                }                
            })());
        });

        self.addEventListener("activate", (event) => {
            (event as ExtendableEvent).waitUntil((async () => {
                logger.groupCollapsed("ACTIVATE", "", LogLevel.Info);
                
                try {
                    await this.applicationLifetime.activateEventSource.fire();
                    
                    requestDelegate = applicationBuilder.build();
                    if (!requestDelegate) {
                        throw new Error("RequestDelegate is invalid");
                    }
                } catch (err) {
                    logger.error(`Error during activate: ${err}`);
                } finally {
                    logger.groupEnd();
                }
            })());
        });

        self.addEventListener("fetch", (event) => {
            (event as ExtendableEvent).waitUntil((async () => {
                const fetchContext: FetchContext = new FetchContext(event as FetchEvent, serviceProvider);
                const startTime = performance.now();
                let timeElapsed: string = "";

                try {
                    if (requestDelegate) {
                        await requestDelegate(fetchContext);
                    } else {
                        logger.error("Request delegate is invalid");
                    }
                } catch (err) {
                    fetchContext.log(LogLevel.Error, err);
                } finally {
                    timeElapsed = (performance.now() - startTime).toFixed(2);
                    fetchContext.log(LogLevel.Info, `Time elapsed: ${timeElapsed} ms`);
                }

                const logEntries = fetchContext.logEntries.filter((entry) => entry.logLevel >= logger.logLevel);

                if (logEntries.length) {
                    let highestEntryLevel = LogLevel.Info;
                    fetchContext.logEntries.forEach((entry) => {
                        if (entry.logLevel > highestEntryLevel) {
                            highestEntryLevel = entry.logLevel;
                        }
                    });

                    logger.groupCollapsed("FETCH", `${fetchContext.request.url} ${timeElapsed} ms`, highestEntryLevel);
                    logEntries.forEach((entry) => {
                        switch (entry.logLevel) {
                            case LogLevel.Debug:
                                logger.debug(entry.message);
                                break;
                            case LogLevel.Info:
                                logger.info(entry.message);
                                break;
                            case LogLevel.Warn:
                                logger.warn(entry.message);
                                break;
                            case LogLevel.Error:
                                logger.error(entry.message);
                                break;
                        }
                    });
                    logger.groupEnd();
                }
            })());
        });
    }
}
