import { IApplicationBuilder, IApplicationLifetime, ILogger } from "../abstractions";
import { ApplicationBuilder } from "./application-builder";

declare var clients: Clients;
declare var self: ServiceWorkerGlobalScope;

declare module "./../abstractions" {
    interface IApplicationBuilder {

        /**
         * Attempt to claim all available clients within scope.
         * See more at https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
         *
         * @returns {IApplicationBuilder}
         * @memberof IApplicationBuilder
         */
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
    const lifetime = this.services.getInstance<IApplicationLifetime>("IApplicationLifetime");
    const logger = this.services.getInstance<ILogger>("ILogger");

    lifetime.installing.register(async (event: ExtendableEvent) => {
        logger.debug("Skipping activation");
        self.skipWaiting();
    });

    lifetime.activating.register(async (event: ExtendableEvent) => {
        logger.debug("Claiming available clients");
        await clients.claim();
    });
    return this;
};
