import { IServiceDescriptor, ServiceLifetime } from "./abstractions";
import { ServiceDescriptor } from "./service-collection/service-descriptor";

/**
 * Collection of services to be used by the IServiceProvider. This interface is intended 
 * to be extended to accommodate additional functionality or implementations. Refer to 
 * extension implementations found in the documentation for examples.
 *
 * @export
 * @interface IServiceCollection
 */
export interface IServiceCollection {
    /**
     * List of service descriptors. Describes the service and their lifetimes.
     *
     * @type {Map<string, IServiceDescriptor>}
     * @memberof IServiceCollection
     */
    serviceDescriptors: Map<string, IServiceDescriptor>;

    /**
     * Defines a service that will be instantiated new every call.
     *
     * @template T Type of service
     * @param {string} key Name of the service
     * @param {() => T} factory Factory of the service
     * @memberof IServiceCollection
     */
    addTransient<T extends object>(key: string, factory: () => T): void;

    /**
     * Defines a service that will be instantiated once per fetch request
     * and reused thereafter.
     *
     * @template T Type of service
     * @param {string} key Name of the service
     * @param {() => T} factory Factory of the service
     * @memberof IServiceCollection
     */
    addScoped<T extends object>(key: string, factory: () => T): void;

    /**
     * Defines a service that will be instantiated once and reused thereafter.
     *
     * @template T Type of service
     * @param {string} key Name of the service
     * @param {() => T} factory Factory of the service
     * @memberof IServiceCollection
     */
    addSingleton<T extends object>(key: string, factory: () => T): void;

    /**
     * Defines a configuration object available to middleware.
     *
     * @template T Configuration object type
     * @param {string} optionsName Name of configuration object type
     * @param {T} options Instance of configuration object
     * @memberof IServiceCollection
     */
    configure<T extends object>(optionsName: string, options: T): void;
}

export class ServiceCollection  implements IServiceCollection {
    public serviceDescriptors: Map<string, IServiceDescriptor>;

    constructor() {
        this.serviceDescriptors = new Map<string, IServiceDescriptor>();
    }

    public addTransient<T extends object>(key: string, factory: () => T): void {
        this.serviceDescriptors.set(key, new ServiceDescriptor(key, ServiceLifetime.Transient, factory));
    }

    public addScoped<T extends object>(key: string, factory: () => T): void {
        this.serviceDescriptors.set(key, new ServiceDescriptor(key, ServiceLifetime.Scoped, factory));
    }

    public addSingleton<T extends object>(key: string, factory: () => T): void {
        this.serviceDescriptors.set(key, new ServiceDescriptor(key, ServiceLifetime.Singleton, factory));
    }

    public configure<T extends object>(optionsName: string, options: T) {
        this.addSingleton(optionsName, () => options);
    }
}
