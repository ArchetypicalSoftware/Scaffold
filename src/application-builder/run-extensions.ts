
import { IApplicationBuilder, IFetchContext, RequestDelegate } from "../abstractions";
import { ApplicationBuilder } from "./application-builder";

declare module "./../abstractions" {
    interface IApplicationBuilder {
        /**
         * Builds a terminal handler that always executes
         * 
         * @param handler configuration handler
         */
        run(handler: RequestDelegate): IApplicationBuilder;
    }
}

declare module "./application-builder" {
    // tslint:disable-next-line:interface-name
    interface ApplicationBuilder {
        run(handler: RequestDelegate): IApplicationBuilder;
    }
}

ApplicationBuilder.prototype.run = function(handler: RequestDelegate): IApplicationBuilder {
    this.use(() => handler);

    return this;
};
