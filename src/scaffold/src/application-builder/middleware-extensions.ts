import { RequestDelegate, IMiddleware, MiddlewareFactory, IApplicationBuilder } from "../abstractions";
import { ApplicationBuilder } from "./application-builder";

declare module "./../abstractions" {
    interface IApplicationBuilder {
        useMiddleware<T extends IMiddleware>(middlewareType: MiddlewareFactory<T>, ...params: any[]): IApplicationBuilder;
    }
}

declare module "./application-builder" {
    interface ApplicationBuilder {
        useMiddleware<T extends IMiddleware>(middlewareType: MiddlewareFactory<T>, ...params: any[]): IApplicationBuilder;
    }
}

ApplicationBuilder.prototype.useMiddleware = function<T extends IMiddleware>(middlewareType: MiddlewareFactory<T>, ...params: any[]): IApplicationBuilder {
    this.use((requestDelegate: RequestDelegate) => {
        params.splice(0, 0, null, requestDelegate);

        const instance: IMiddleware = new (Function.prototype.bind.apply(middlewareType, params as [any, ...any[]]) as any) as IMiddleware;

        return async (fetchEvent: FetchEvent) => {            
            return await instance.invokeAsync(fetchEvent);
        }
    });

    return this;
}