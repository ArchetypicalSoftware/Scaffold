import { configuration as sworkConfiguration } from "swork";
import { IApplicationBuilder, IHostingEnvironment, IServiceCollection, IServiceWorkerConfiguration, IStartup } from "../src/abstractions";
import { ServiceWorkerBuilder } from "../src/service-worker-builder";

let configureCalled: boolean = false;
let configureServicesCalled: boolean = false;

class TestStartup implements IStartup {
    public configure(applicationBuilder: IApplicationBuilder, env: IHostingEnvironment): void {
        configureCalled = true;
    }

    public configureServices?(services: IServiceCollection, env: IHostingEnvironment): void {
        configureServicesCalled = true;
    }
}

class TestStartup2 implements IStartup {
    public configure(applicationBuilder: IApplicationBuilder, env: IHostingEnvironment): void {
        configureCalled = true;
    }
}

describe("Service worker builder tests", () => {
    
    let originalEnvironment: "production" | "development";
    let originalOrigin: string;
    let originalVersion: string;

    beforeEach(() => {
        originalEnvironment = sworkConfiguration.environment;
        originalOrigin = sworkConfiguration.origin;
        originalVersion = sworkConfiguration.version;
    });

    afterEach(() => {
        sworkConfiguration.environment = originalEnvironment as "production" | "development";
        sworkConfiguration.origin = originalOrigin;
        sworkConfiguration.version = originalVersion;
    });

    test("constructor", () => {
        const builder = new ServiceWorkerBuilder({ version: "1.0.0" });

        expect(sworkConfiguration.environment).toBe("production");
        expect(sworkConfiguration.origin).toBe("http://localhost");
        expect(sworkConfiguration.version).toBe("1.0.0");
    });

    test("useStartup", () => {
        const builder = new ServiceWorkerBuilder({ version: "v1" });
        builder.useStartup(TestStartup);
        
        // tslint:disable-next-line:no-string-literal
        expect(builder["startupType"]).toBe(TestStartup);
    });

    test("build throws error", () => {
        const builder = new ServiceWorkerBuilder({ version: "v1" });
        expect(() => builder.build()).toThrowError();
    });

    test("build success", () => {
        configureCalled = configureServicesCalled = false;

        const builder = new ServiceWorkerBuilder({ version: "v1" });
        builder.useStartup(TestStartup);

        builder.build();

        expect(configureCalled).toBeTruthy();
        expect(configureServicesCalled).toBeTruthy();
    });

    test("build success 2", () => {
        configureCalled = configureServicesCalled = false;

        const builder = new ServiceWorkerBuilder({ version: "v1" });
        builder.useStartup(TestStartup2);

        builder.build();

        expect(configureCalled).toBeTruthy();
        expect(configureServicesCalled).toBeFalsy();
    });
});
