import { IRouteVariables } from "../abstractions";

export class RouteVariables implements IRouteVariables {
    public path: Map<string, string>;
    public query: Map<string, string>;
    public url: URL;

    constructor(path: Map<string, string>, query: Map<string, string>, url: URL) {
        this.path = path;
        this.query = query;
        this.url = url;
    }
}
