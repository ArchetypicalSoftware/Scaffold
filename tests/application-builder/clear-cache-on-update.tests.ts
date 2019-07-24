import { IApplicationLifetime, IFetchContext, ILogger, IServiceProvider, IServiceWorkerConfiguration } from "../../src/abstractions";
import { ApplicationBuilder, IApplicationBuilder } from "../../src/application-builder";
import { environment } from "../../src/environment";
import { FetchContext } from "../../src/fetch/fetch-context";
import { ApplicationLifetime } from "../../src/hosting/application-lifetime";
import { DefaultLogger } from "../../src/logging/default-logger";
import { ServiceCollection } from "../../src/service-collection";
import { ServiceProvider } from "../../src/service-collection/service-provider";
import { FetchEvent, MockCacheStorage, Request } from "../service-worker.mocks";

describe("useInstallCache tests", () => {
    let applicationBuilder: IApplicationBuilder;
    let fetchContext: IFetchContext;

    beforeEach(() => {
        applicationBuilder = new ApplicationBuilder({ origin: "http://www.example.com" } as IServiceWorkerConfiguration,
                                                    null as unknown as IServiceProvider);
        applicationBuilder.defaultRequestDelegate = (f: IFetchContext) => Promise.resolve(f);
        fetchContext = new FetchContext(new FetchEvent("http://www.example.com/testpath"));
        const caches = new MockCacheStorage();
        environment.cacheFactory = () => caches;
    });

    test("basic", async (done) => {
        const applicationLifetime = new ApplicationLifetime();
        const serviceCollection = new ServiceCollection();
        serviceCollection.addSingleton<IApplicationLifetime>("IApplicationLifetime", () => applicationLifetime);
        serviceCollection.addSingleton<ILogger>("ILogger", () => new DefaultLogger());

        applicationBuilder.services = new ServiceProvider(serviceCollection.serviceDescriptors, new Map<string, object>());
        
        applicationBuilder.useInstallCache(["/asdf.js"]);
        await applicationLifetime.installEventSource.fire();
        done();
    });
});
