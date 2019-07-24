import { IServiceCollection, ServiceCollection } from "../../src/service-collection";
import { ServiceProvider } from "./../../src/service-collection/service-provider";

class MyService {}

class MyConfigureObject {
    public mySetting: string;
    
    constructor(mySetting: string){
        this.mySetting = mySetting;
    }
} 

describe("Service Collection tests", () => {
    let serviceCollection: IServiceCollection;
    const serviceName: string = "MyService";
    const container = new Map<string, object>();

    beforeEach(() => {
        serviceCollection = new ServiceCollection();
        container.clear();
    });

    test("transient", () => {        
        serviceCollection.addTransient<MyService>(serviceName, () => new MyService());

        const provider = new ServiceProvider(serviceCollection.serviceDescriptors, container);

        const instance1 = provider.getInstance<MyService>(serviceName);
        const instance2 = provider.getInstance<MyService>(serviceName);

        expect(instance1).toBeTruthy();
        expect(instance2).toBeTruthy();
        expect(instance1).not.toBe(instance2);
    });

    test("scoped", () => {
        serviceCollection.addScoped<MyService>(serviceName, () => new MyService());

        let provider = new ServiceProvider(serviceCollection.serviceDescriptors, container);

        const instance1 = provider.getInstance<MyService>(serviceName);
        const instance2 = provider.getInstance<MyService>(serviceName);

        expect(instance1).toBeTruthy();
        expect(instance2).toBeTruthy();
        expect(instance1).toBe(instance2);

        provider = new ServiceProvider(serviceCollection.serviceDescriptors, container);

        const instance3 = provider.getInstance<MyService>(serviceName);
        const instance4 = provider.getInstance<MyService>(serviceName);

        expect(instance3).toBeTruthy();
        expect(instance4).toBeTruthy();
        expect(instance3).toBe(instance4);

        expect(instance1).not.toBe(instance3);
    });

    test("singleton", () => {
        serviceCollection.addSingleton<MyService>(serviceName, () => new MyService());

        let provider = new ServiceProvider(serviceCollection.serviceDescriptors, container);

        const instance1 = provider.getInstance<MyService>(serviceName);
        const instance2 = provider.getInstance<MyService>(serviceName);

        expect(instance1).toBeTruthy();
        expect(instance2).toBeTruthy();
        expect(instance1).toBe(instance2);

        provider = new ServiceProvider(serviceCollection.serviceDescriptors, container);

        const instance3 = provider.getInstance<MyService>(serviceName);
        const instance4 = provider.getInstance<MyService>(serviceName);

        expect(instance3).toBeTruthy();
        expect(instance4).toBeTruthy();
        expect(instance3).toBe(instance4);

        expect(instance1).toBe(instance3);
    });

    test("configure", () => {
        const configureObject = new MyConfigureObject("asdf");
        serviceCollection.configure<MyConfigureObject>("MyConfigureObject", configureObject);

        const provider = new ServiceProvider(serviceCollection.serviceDescriptors, container);
        const instance1 = provider.getInstance<MyConfigureObject>("MyConfigureObject");
        const instance2 = provider.getInstance<MyConfigureObject>("MyConfigureObject");

        expect(instance1).toBeTruthy();
        expect(instance2).toBeTruthy();
        expect(instance1).toBe(configureObject);
        expect(instance2).toBe(configureObject);
    });

    test("Service factory overridden with multiple inserts", () => {
        const factory1 = () => new MyService();
        const factory2 = () => new MyService();

        serviceCollection.addTransient<MyService>(serviceName, factory1);

        expect(serviceCollection.serviceDescriptors.get(serviceName)!.factory).toBe(factory1);

        serviceCollection.addTransient<MyService>(serviceName, factory2);

        expect(serviceCollection.serviceDescriptors.get(serviceName)!.factory).not.toBe(factory1);
        expect(serviceCollection.serviceDescriptors.get(serviceName)!.factory).toBe(factory2);
    });

    test("getInstance error - missing key", () => {
        const provider = new ServiceProvider(serviceCollection.serviceDescriptors, container);
        expect(() => provider.getInstance<MyService>("a"))
            .toThrowError("No service with a key 'a' was found in the configured service collection.");
    });

    test("getInstance error - null instance", () => {
        serviceCollection.addTransient<MyService>(serviceName, () => null as unknown as object);
        const provider = new ServiceProvider(serviceCollection.serviceDescriptors, container);
        expect(() => provider.getInstance<MyService>(serviceName))
            .toThrowError(`Service factory for key '${serviceName}' resulted in a null instance.`);
    });
});
