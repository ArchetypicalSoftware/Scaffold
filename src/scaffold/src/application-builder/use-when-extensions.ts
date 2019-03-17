import { FetchContext, IApplicationBuilder, RequestDelegate } from "../abstractions";
import { ApplicationBuilder } from "./application-builder";

declare module "./../abstractions" {
    interface IApplicationBuilder {
        useWhen(predicate: (fetchContext: FetchContext) => boolean,
                configuration: (applicationBuilder: IApplicationBuilder) => void): IApplicationBuilder;
    }
}

declare module "./application-builder" {
    // tslint:disable-next-line:interface-name
    interface ApplicationBuilder {
        useWhen(predicate: (fetchContext: FetchContext) => boolean,
                configuration: (applicationBuilder: IApplicationBuilder) => void): IApplicationBuilder;
    }
}

ApplicationBuilder.prototype.useWhen = function(predicate: (fetchContext: FetchContext) => boolean,
                                                configuration: (applicationBuilder: IApplicationBuilder) => void): IApplicationBuilder {
    const branchBuilder = this.clone();
    configuration(branchBuilder);

    return this.use((main: RequestDelegate) => {
        branchBuilder.run(main);
        const branch = branchBuilder.build();

        return (fetchContext: FetchContext) => {
            if (predicate(fetchContext)) {
                return branch(fetchContext);
            } else {
                return main(fetchContext);
            }
        };
    });
};
