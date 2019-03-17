import { IApplicationBuilder, IApplicationLifetime, ILogger } from "../abstractions";
import { ApplicationBuilder } from "./application-builder";

declare var clients: Clients;

declare module "./../abstractions" {
    interface IApplicationBuilder {
        useClaimClients(): IApplicationBuilder;
    }
}

declare module "./application-builder" {
    // tslint:disable-next-line:interface-name
    interface ApplicationBuilder {
        useClaimClients(): IApplicationBuilder;
    }
}

ApplicationBuilder.prototype.useClaimClients = function(): IApplicationBuilder {
    const lifetime = this.applicationServices.getInstance<IApplicationLifetime>("IApplicationLifetime");
    const logger = this.applicationServices.getInstance<ILogger>("ILogger");

    lifetime.activating.register(async (event: ExtendableEvent) => {
        logger.debug("Claiming available clients");
        await clients.claim();
    });
    return this;
};