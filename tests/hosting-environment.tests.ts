import { HostingEnvironment } from "../src/hosting-environment";

describe("Hosting Environment tests", () => {
    test("Basic", () => {
        const instance = new HostingEnvironment({
            environment: "development",
            origin: "http://localhost",
            version: "v1",
        });

        expect(instance.version).toBe("v1");
        expect(instance.origin).toBe("http://localhost");
        expect(instance.isDevelopment()).toBeTruthy();
        expect(instance.isProduction()).toBeFalsy();
    });
});
