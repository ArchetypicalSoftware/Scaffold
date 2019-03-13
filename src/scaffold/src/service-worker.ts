import { IServiceWorkerBuilder, IServiceWorkerConfiguration } from "./abstractions";
import { ServiceWorkerBuilder } from "./service-worker-builder";

export class ServiceWorker {
    public static createDefaultBuilder(config: IServiceWorkerConfiguration | string): IServiceWorkerBuilder {
        if (typeof(config) === "string") {
            config = {
                version: config,
            } as IServiceWorkerConfiguration;
        }

        return new ServiceWorkerBuilder(config);
    }
}
