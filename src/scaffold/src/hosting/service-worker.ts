import { IServiceWorkerBuilder, IServiceWorkerConfiguration } from "../abstractions";
import { ServiceWorkerBuilder } from "./service-worker-builder";

/**
 * Entry point to the service worker building process.
 *
 * @export
 * @class ServiceWorker
 */
export class ServiceWorker {

    /**
     * Creates a standard service worker builder instance.
     *
     * @static
     * @param {(IServiceWorkerConfiguration | string)} config IServiceWorkerConfiguration object or version string.
     * @returns {IServiceWorkerBuilder}
     * @memberof ServiceWorker
     */
    public static createDefaultBuilder(config: IServiceWorkerConfiguration | string): IServiceWorkerBuilder {
        if (typeof(config) === "string") {
            config = {
                version: config,
            } as IServiceWorkerConfiguration;
        }

        return new ServiceWorkerBuilder(config);
    }
}
