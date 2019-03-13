import { IApplicationBuilder, RequestDelegate } from "../abstractions";
import { ApplicationBuilder } from "./application-builder";

declare module "./../abstractions" {
    interface IApplicationBuilder {
        useWhen(predicate: (fetchEvent: FetchEvent) => boolean,
                configuration: (applicationBuilder: IApplicationBuilder) => void): IApplicationBuilder;
    }
}

declare module "./application-builder" {
    // tslint:disable-next-line:interface-name
    interface ApplicationBuilder {
        useWhen(predicate: (fetchEvent: FetchEvent) => boolean,
                configuration: (applicationBuilder: IApplicationBuilder) => void): IApplicationBuilder;
    }
}

ApplicationBuilder.prototype.useWhen = function(predicate: (fetchEvent: FetchEvent) => boolean,
                                                configuration: (applicationBuilder: IApplicationBuilder) => void): IApplicationBuilder {
    const branchBuilder = this.clone();
    configuration(branchBuilder);

    return this.use((main: RequestDelegate) => {
        branchBuilder.run(main);
        const branch = branchBuilder.build();

        return (fetchEvent: FetchEvent) => {
            if (predicate(fetchEvent)) {
                return branch(fetchEvent);
            } else {
                return main(fetchEvent);
            }
        };
    });
};
