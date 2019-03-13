import { IServiceCollection, IServiceDescriptor, ServiceLifetime } from "../abstractions";

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
}