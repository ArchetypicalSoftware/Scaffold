import { IFetchContext, ILogger, ILoggingBuilder, IServiceCollection,
    IServiceWorkerBuilder, IServiceWorkerConfiguration, IStartup, LogLevel, RequestDelegate, StartupFactory } from "../abstractions";
import { ApplicationBuilder } from "../application-builder/application-builder";
import { FetchContext } from "../fetch/fetch-context";
import { DefaultLogger } from "../logging/default-logger";
import { LoggingBuilder } from "../logging/logging-builder";
import { ServiceCollection } from "../service-collection/service-collection";
import { ServiceProvider } from "../service-collection/service-provider";
import { ApplicationLifetime } from "./application-lifetime";

export class ServiceWorkerBuilder implements IServiceWorkerBuilder {
    private startupType: StartupFactory<IStartup> | null;
    private services: IServiceCollection;
    private config: IServiceWorkerConfiguration;
    private applicationLifetime: ApplicationLifetime;
    private logger: ILogger;
    private singletonContainer: Map<string, object>;

    constructor(config: IServiceWorkerConfiguration) {
        this.config = Object.assign({}, {
            environment: "production",
            origin: location.origin,
        } as IServiceWorkerConfiguration, config);

        this.startupType = null;
        this.services = new ServiceCollection();
        this.applicationLifetime = new ApplicationLifetime();
        this.services.addSingleton("IApplicationLifetime", () => this.applicationLifetime);

        this.logger = new DefaultLogger();
        this.logger.logLevel = this.config.environment! === "development" ? LogLevel.Debug : LogLevel.Info;
        this.services.addSingleton("ILogger", () => this.logger);

        this.singletonContainer = new Map<string, object>();
    }

    public configureLogging(configuration: (builder: ILoggingBuilder) => void): IServiceWorkerBuilder {
        const loggingBuilder = new LoggingBuilder();

        configuration(loggingBuilder);

        if (loggingBuilder.loggerFactory !== null) {
            this.logger = loggingBuilder.loggerFactory();
        }

        if (loggingBuilder.logLevel !== null) {
            this.logger.logLevel = loggingBuilder.logLevel;
        }

        return this;
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
            startup.configureServices(this.services, this.logger);
        }

        const serviceProvider = new ServiceProvider(this.services.serviceDescriptors, this.singletonContainer);

        const applicationBuilder = new ApplicationBuilder(this.config, serviceProvider);

        startup.configure(applicationBuilder, this.logger);        

        let requestDelegate: RequestDelegate | null = null;

        self.addEventListener("install", (event) => {
            (event as ExtendableEvent).waitUntil((async () => {
                this.logger.groupCollapsed("INSTALL", "", LogLevel.Info);
                
                try {
                    await this.applicationLifetime.installEventSource.fire();
                } catch (err) {
                    this.logger.error(`Error during activate: ${err}`);
                } finally {
                    this.logger.groupEnd();
                }                
            })());
        });

        self.addEventListener("activate", (event) => {
            (event as ExtendableEvent).waitUntil((async () => {
                this.logger.groupCollapsed("ACTIVATE", "", LogLevel.Info);
                
                try {
                    await this.applicationLifetime.activateEventSource.fire();
                    
                    requestDelegate = applicationBuilder.build();
                    if (!requestDelegate) {
                        throw new Error("RequestDelegate is invalid");
                    }
                } catch (err) {
                    this.logger.error(`Error during activate: ${err}`);
                } finally {
                    this.logger.groupEnd();
                }
            })());
        });

        self.addEventListener("fetch", (event) => {
            (event as ExtendableEvent).waitUntil((async () => {
                const fetchContext: IFetchContext = new FetchContext(event as FetchEvent, 
                    new ServiceProvider(this.services.serviceDescriptors, this.singletonContainer));
                const startTime = performance.now();
                let timeElapsed: string = "";

                try {
                    if (requestDelegate) {
                        await requestDelegate(fetchContext);
                    } else {
                        this.logger.error("Request delegate is invalid");
                    }
                } catch (err) {
                    fetchContext.log(LogLevel.Error, err);
                } finally {
                    timeElapsed = (performance.now() - startTime).toFixed(2);
                    fetchContext.log(LogLevel.Info, `Time elapsed: ${timeElapsed} ms`);
                }

                const logEntries = fetchContext.logEntries.filter((entry) => entry.logLevel >= this.logger.logLevel);

                if (logEntries.length) {
                    let highestEntryLevel = LogLevel.Info;
                    fetchContext.logEntries.forEach((entry) => {
                        if (entry.logLevel > highestEntryLevel) {
                            highestEntryLevel = entry.logLevel;
                        }
                    });

                    this.logger.groupCollapsed("FETCH", `${fetchContext.request.url} ${timeElapsed} ms`, highestEntryLevel);
                    logEntries.forEach((entry) => {
                        switch (entry.logLevel) {
                            case LogLevel.Debug:
                                this.logger.debug(entry.message);
                                break;
                            case LogLevel.Info:
                                this.logger.info(entry.message);
                                break;
                            case LogLevel.Warn:
                                this.logger.warn(entry.message);
                                break;
                            case LogLevel.Error:
                                this.logger.error(entry.message);
                                break;
                        }
                    });
                    this.logger.groupEnd();
                }
            })());
        });
    }
}
