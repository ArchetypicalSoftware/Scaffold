import { IServiceDescriptor, ServiceLifetime } from "./abstractions";

export class ServiceDescriptor implements IServiceDescriptor {
    public key: string;
    public lifetime: ServiceLifetime;
    public factory: () => object;

    constructor(key: string, lifetime: ServiceLifetime, factory: () => object) {
        this.key = key;
        this.lifetime = lifetime;
        this.factory = factory;
    }
}
