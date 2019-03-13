import { IServiceDescriptor, IServiceProvider, ServiceLifetime } from "../abstractions";

class ServiceInstanceWrapper {
    public descriptor: IServiceDescriptor;
    public container: Map<string, object> | null;

    constructor(descriptor: IServiceDescriptor, container: Map<string, object> | null) {
        this.descriptor = descriptor;
        this.container = container;
    }

    public getInstance(): object | undefined {
        let instance: object | undefined;

        if (this.container) {
            instance = this.container.get(this.descriptor.key);

            if (!instance) {
                instance = this.descriptor.factory();
                this.container.set(this.descriptor.key, instance);
            }
        } else {
            instance = this.descriptor.factory() as object;
        }

        return instance;
    }
}

export class ServiceProvider implements IServiceProvider {
    private services: Map<string, ServiceInstanceWrapper>;

    private scopedContainer: Map<string, object>;
    private singletonContainer: Map<string, object>;

    constructor(descriptors: Map<string, IServiceDescriptor>) {
        this.services = new Map<string, ServiceInstanceWrapper>();
        this.scopedContainer = new Map<string, object>();
        this.singletonContainer = new Map<string, object>();

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

    public resetScope(): void {
        this.scopedContainer.clear();
    }
}
