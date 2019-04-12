
import { IApplicationBuilder, IFetchContext, RequestDelegate } from "../abstractions";
import { ApplicationBuilder } from "./application-builder";

declare module "./../abstractions" {
    interface IApplicationBuilder {
        /**
         * Creates a pass through middleware
         * 
         * @param middleware execution handler 
         */
        useNext(middleware: (fetchContext: IFetchContext, 
                             next: () => Promise<IFetchContext>) => Promise<IFetchContext>): IApplicationBuilder;
    }
}

declare module "./application-builder" {
    // tslint:disable-next-line:interface-name
    interface ApplicationBuilder {
        useNext(middleware: (fetchContext: IFetchContext, 
                             next: () => Promise<IFetchContext>) => Promise<IFetchContext>): IApplicationBuilder;
    }
}

ApplicationBuilder.prototype.useNext = function(middleware: (fetchContext: IFetchContext, 
                                                                next: () => Promise<IFetchContext>) => Promise<IFetchContext>): IApplicationBuilder {
    this.use((next: RequestDelegate) => {
        return (fetchContext: IFetchContext) => {
            const simpleNext = () => next(fetchContext);
            return middleware(fetchContext, simpleNext);
        };
    });
    return this;
};
