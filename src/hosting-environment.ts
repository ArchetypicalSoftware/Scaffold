import { Configuration } from "swork/dist/configuration";
import { IHostingEnvironment } from "./abstractions";

export class HostingEnvironment implements IHostingEnvironment {
    private configuration: Configuration;

    constructor(configuration: Configuration) {
        this.configuration = configuration;
    }
    
    public get version(): string {
        return this.configuration.version;
    }

    public get origin(): string {
        return this.configuration.origin;
    }

    public isDevelopment(): boolean {
        return this.configuration.environment === "development";
    }

    public isProduction(): boolean {
        return this.configuration.environment === "production";
    }
}
