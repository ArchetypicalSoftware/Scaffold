import { IApplicationBuilder, IFetchContext, IMiddleware, MiddlewareFactory, RequestDelegate } from "../abstractions";
import { ApplicationBuilder } from "./application-builder";

declare module "./../abstractions" {
    interface IApplicationBuilder {
        /**
         * Build a middleware utilizing a type implementing IMiddleware
         *
         * @template T Type implementing IMiddleware
         * @param middlewareType Constructor of type T
         * @param params Additional parameters to be provided during T's construction
         */
        useMiddleware<T extends IMiddleware>(middlewareType: MiddlewareFactory<T>, ...params: any[]): IApplicationBuilder;
    }
}

declare module "./application-builder" {
    // tslint:disable-next-line:interface-name
    interface ApplicationBuilder {
        useMiddleware<T extends IMiddleware>(middlewareType: MiddlewareFactory<T>, ...params: any[]): IApplicationBuilder;
    }
}

ApplicationBuilder.prototype.useMiddleware = function<T extends IMiddleware>(middlewareType: MiddlewareFactory<T>,
                                                                             ...params: any[]): IApplicationBuilder {
    this.use((requestDelegate: RequestDelegate) => {
        params.splice(0, 0, null, requestDelegate);

        // tslint:disable-next-line:new-parens
        const instance: IMiddleware = new (Function.prototype.bind.apply(middlewareType, params as [any, ...any[]]) as any) as IMiddleware;

        return async (fetchContext: IFetchContext) => {
            return await instance.invokeAsync(fetchContext);
        };
    });

    return this;
};
