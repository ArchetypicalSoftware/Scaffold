import { IServiceDescriptor } from "../abstractions";

export class ServiceInstanceWrapper {
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