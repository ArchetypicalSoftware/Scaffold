import { FetchContext, IApplicationBuilder, IMiddleware, RequestDelegate } from "../abstractions";
import { ApplicationBuilder } from "./application-builder";
import "./middleware-extensions";
import { Route, RouteVariables } from "./route";

export interface IMapSettings {
    methods: Array<"GET" | "POST" | "PUT" | "DELETE" | "HEAD">;
}

class MapOptions {
    public branch: RequestDelegate;
    public routes: Route[];
    public predicate: ((fetchContext: FetchContext, routeVariables: RouteVariables) => boolean) | null;

    constructor(branch: RequestDelegate, routes: Route[],
                predicate: ((fetchContext: FetchContext, routeVariables: RouteVariables) => boolean) | null = null) {
        this.branch = branch;
        this.routes = routes;
        this.predicate = predicate;
    }
}

class MapMiddleware implements IMiddleware {
    public next: RequestDelegate;
    private options: MapOptions;

    constructor(next: RequestDelegate, options: MapOptions) {
        this.next = next;
        this.options = options;
    }

    public async invokeAsync(fetchContext: FetchContext): Promise<FetchContext> {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < this.options.routes.length; i++) {
            const route = this.options.routes[i];
            if (route.isMatch(fetchContext.request)) {
                if (this.options.predicate) {
                    const routeVariables = route.getVariables(fetchContext.request.url);

                    if (this.options.predicate(fetchContext, routeVariables)) {
                        return await this.options.branch(fetchContext);
                    }
                } else {
                    return await this.options.branch(fetchContext);
                }
            }
        }

        return await this.next(fetchContext);
    }
}

declare module "./../abstractions" {
    interface IApplicationBuilder {
        map(path: string | string[], configuration: (applicationBuilder: IApplicationBuilder) => void, settings?: IMapSettings): IApplicationBuilder;
        mapWhen(path: string | string[], predicate: (fetchContext: FetchContext, routeVariables: RouteVariables) => boolean,
                configuration: (applicationBuilder: IApplicationBuilder) => void, settings?: IMapSettings): IApplicationBuilder;
    }
}

declare module "./application-builder" {
    // tslint:disable-next-line:interface-name
    interface ApplicationBuilder {
        map(path: string | string[], configuration: (applicationBuilder: IApplicationBuilder) => void, settings?: IMapSettings): IApplicationBuilder;
        mapWhen(path: string | string[], predicate: (fetchContext: FetchContext, routeVariables: RouteVariables) => boolean,
                configuration: (applicationBuilder: IApplicationBuilder) => void, settings?: IMapSettings): IApplicationBuilder;
    }
}

ApplicationBuilder.prototype.map = function(path: string | string[],
                                            configuration: (applicationBuilder: IApplicationBuilder) => void,
                                            settings?: IMapSettings): IApplicationBuilder {
    return this.mapWhen(path, null as unknown as (fetchContext: FetchContext, routeVariables: RouteVariables) => boolean, configuration, settings);
};

ApplicationBuilder.prototype.mapWhen = function(path: string | string[],
                                                predicate: (fetchContext: FetchContext, routeVariables: RouteVariables) => boolean,
                                                configuration: (applicationBuilder: IApplicationBuilder) => void,
                                                settings?: IMapSettings): IApplicationBuilder {
    settings = Object.assign({}, {
        methods: ["GET"],
    } as IMapSettings, settings);

    const branchBuilder = this.clone();
    configuration(branchBuilder);
    const branch = branchBuilder.build();

    if (typeof(path) === "string") {
        path = [path];
    }

    const routes = path.map((x) => new Route(x, this.config.origin!, settings!.methods));

    const options = new MapOptions(branch, routes, predicate);
    return this.useMiddleware(MapMiddleware, options);
};
