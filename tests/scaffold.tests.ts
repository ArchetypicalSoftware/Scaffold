import { configuration } from "swork";
import { IServiceWorkerConfiguration } from "../src/abstractions";
import { Scaffold } from "../src/scaffold";

describe("Scaffold tests", () => {

    let originalEnvironment: "production" | "development";
    let originalOrigin: string;
    let originalVersion: string;

    beforeEach(() => {
        originalEnvironment = configuration.environment;
        originalOrigin = configuration.origin;
        originalVersion = configuration.version;
    });

    afterEach(() => {
        configuration.environment = originalEnvironment;
        configuration.origin = originalOrigin;
        configuration.version = originalVersion;
    });

    test("String config", () => {
        const builder = Scaffold.createDefaultBuilder("my-version");

        expect(builder).toBeTruthy();

        expect(configuration.version).toBe("my-version");
        expect(configuration.origin).toBe(originalOrigin);
        expect(configuration.environment).toBe(originalEnvironment);
        });

    test("Literal config", () => {
        const builder = Scaffold.createDefaultBuilder({
            environment: "production",
            origin: "http://www.example.com",
            version: "my-version",
        } as IServiceWorkerConfiguration);

        expect(builder).toBeTruthy();
        expect(configuration.environment).toBe("production");
        expect(configuration.origin).toBe("http://www.example.com");
        expect(configuration.version).toBe("my-version");
});
});
