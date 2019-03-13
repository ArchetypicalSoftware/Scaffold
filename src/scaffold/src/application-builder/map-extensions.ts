import { RequestDelegate, IMiddleware, IApplicationBuilder } from "../abstractions";
import { Route, RouteVariables } from "./route";
import { ApplicationBuilder } from "./application-builder";
import "./middleware-extensions"

export interface IMapSettings {
    methods: ("GET" | "POST" | "PUT" | "DELETE" | "HEAD")[]
}

class MapOptions {
    public branch: RequestDelegate;
    public route: Route;
    public predicate: ((fetchEvent: FetchEvent, routeVariables: RouteVariables) => boolean) | null;

    constructor(branch: RequestDelegate, route: Route,
        predicate: ((fetchEvent: FetchEvent, routeVariables: RouteVariables) => boolean) | null = null) {
        this.branch = branch;
        this.route = route;
        this.predicate = predicate;
    }
}

class MapMiddleware implements IMiddleware {
    private options: MapOptions;
    public next: RequestDelegate;

    constructor(next: RequestDelegate, options: MapOptions) {
        this.next = next;
        this.options = options;
    }

    public async invokeAsync(fetchEvent: FetchEvent): Promise<Response> {
        if (this.options.route.isMatch(fetchEvent.request)) {
            console.log(`isMatch: ${fetchEvent.request.url} = ${this.options.route.path}`)

            if (this.options.predicate) {
                const routeVariables = this.options.route.getVariables(fetchEvent.request.url);

                if (this.options.predicate(fetchEvent, routeVariables)) {
                    return await this.options.branch(fetchEvent);
                }
            } else {
                return await this.options.branch(fetchEvent);
            }
        }

        return await this.next(fetchEvent);
    }
}

declare module "./../abstractions" {
    interface IApplicationBuilder {
        map(path: string, configuration: (applicationBuilder: IApplicationBuilder) => void, settings?: IMapSettings): IApplicationBuilder;
        mapWhen(path: string, predicate: (fetchEvent: FetchEvent, routeVariables: RouteVariables) => boolean,
            configuration: (applicationBuilder: IApplicationBuilder) => void, settings?: IMapSettings): IApplicationBuilder;
    }
}

declare module "./application-builder" {
    interface ApplicationBuilder {
        map(path: string, configuration: (applicationBuilder: IApplicationBuilder) => void, settings?: IMapSettings): IApplicationBuilder;
        mapWhen(path: string, predicate: (fetchEvent: FetchEvent, routeVariables: RouteVariables) => boolean,
            configuration: (applicationBuilder: IApplicationBuilder) => void, settings?: IMapSettings): IApplicationBuilder;
    }
}

ApplicationBuilder.prototype.map = function (path: string, configuration: (applicationBuilder: IApplicationBuilder) => void, settings?: IMapSettings): IApplicationBuilder {
    return this.mapWhen(path, null as unknown as (fetchEvent: FetchEvent, routeVariables: RouteVariables) => boolean, configuration, settings);
}

ApplicationBuilder.prototype.mapWhen = function (path: string, predicate: (fetchEvent: FetchEvent, routeVariables: RouteVariables) => boolean,
    configuration: (applicationBuilder: IApplicationBuilder) => void, settings?: IMapSettings): IApplicationBuilder {
    settings = Object.assign({}, {
        methods: ['GET']
    } as IMapSettings, settings);

    const branchBuilder = this.clone();
    configuration(branchBuilder);
    const branch = branchBuilder.build();

    const route = new Route(path, this.config.origin!);

    const options = new MapOptions(branch, route, predicate);
    return this.useMiddleware(MapMiddleware, options);
}