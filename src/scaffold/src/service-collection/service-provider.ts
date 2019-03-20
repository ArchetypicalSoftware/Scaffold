import { IServiceDescriptor, IServiceProvider, ServiceLifetime } from "../abstractions";
import { ServiceInstanceWrapper } from "./service-instance-wrapper";

export class ServiceProvider implements IServiceProvider {
    private services: Map<string, ServiceInstanceWrapper>;

    private scopedContainer: Map<string, object>;
    private singletonContainer: Map<string, object>;

    constructor(descriptors: Map<string, IServiceDescriptor>, singletonContainer: Map<string, object>) {
        this.services = new Map<string, ServiceInstanceWrapper>();
        this.scopedContainer = new Map<string, object>();
        this.singletonContainer = singletonContainer;

        for (const descriptor of descriptors.values()) {
            let container: Map<string, object> | null = null;

            switch (descriptor.lifetime) {
                case ServiceLifetime.Scoped:
                    container = this.scopedContainer;
                    break;

                case ServiceLifetime.Singleton:
                    container = this.singletonContainer;
                    break;
            }

            this.services.set(descriptor.key, new ServiceInstanceWrapper(descriptor, container));
        }
    }

    public getInstance<T extends object>(key: string): T {
        const wrapper = this.services.get(key);

        if (!wrapper) {
            throw new Error(`No service with a key '${key}' was found in the configured service collection.`);
        }

        const instance = wrapper.getInstance() as object;

        if (!instance) {
            throw new Error(`Service factory for key '${key}' resulted in a null instance.`);
        }

        return instance as T;
    }
}
