import { HttpMethod, IRouteConfiguration, IRouteVariables } from "../abstractions";
import { RouteElement, RouteElementType } from "./route-element";
import { RouteVariables } from "./route-variables";
import { UrlEx } from "./url-ex";

export class Route {
    public path: string;
    private elements: RouteElement[];
    private fileExtension: RouteElement | null;
    private query: Map<string, RouteElement>;
    private url: UrlEx;
    private configuration: IRouteConfiguration;

    constructor(path: string, base?: string | URL | undefined, configuration?: IRouteConfiguration) {
        this.configuration = Object.assign({}, {
            allowUnspecifiedParameters: true,
            methods: ["GET"],
        } as IRouteConfiguration, configuration);

        this.path = path;
        this.url = new UrlEx(path, base);

        this.configuration.methods = this.configuration!.methods!.map((x) => x.toUpperCase()) as HttpMethod[];

        this.elements = [];
        this.fileExtension = this.url.fileExtension ? new RouteElement(this.url.fileExtension) : null;
        this.query = new Map<string, RouteElement>();

        this.url.pathTokens.forEach((x) => this.elements.push(new RouteElement(x)));

        this.url.searchParams.forEach((value: string, key: string) => {
            this.query.set(key, new RouteElement(value));
        });
    }

    public isMatch(request: Request): boolean {
        if ((this.configuration.methods as string[]).indexOf(request.method.toUpperCase()) === -1) {
            return false;
        }

        const url = new UrlEx(request.url);

        if (this.url.origin.toLowerCase() !== url.origin.toLowerCase()) {
            return false;
        }

        let isEndDoubleWildcard = false;
        let routeIndex = 0;
        let tokenIndex = 0;

        while (routeIndex < this.elements.length && tokenIndex < url.pathTokens.length) {
            const element = this.elements[routeIndex];

            if (element.type === RouteElementType.DoubleWildcard) {
                if (routeIndex === this.elements.length - 1) {
                    // This is the last element so consider everything included
                    // e.g. /Path/To/Check/**
                    isEndDoubleWildcard = true;
                    break;
                } else {
                    // This is the second to last element
                    // e.g. /Path/To/Check/**/file.js or /Path/To/Check/**/*.js
                    routeIndex++;
                    tokenIndex = url.pathTokens.length - 1;
                }
            } else if (!element.isMatch(url.pathTokens[tokenIndex])) {
                return false;
            } else {
                routeIndex++;
                tokenIndex++;
            }
        }

        // Check for outstanding double wildcard
        if (!isEndDoubleWildcard 
            && routeIndex === this.elements.length - 1 
            && tokenIndex === url.pathTokens.length) {
            isEndDoubleWildcard = this.elements[routeIndex].type === RouteElementType.DoubleWildcard;
        }

        // If not a ending double wildcard, check route lengths, file extension and query parameters
        if (!isEndDoubleWildcard) {
            if (routeIndex !== this.elements.length || tokenIndex !== url.pathTokens.length) {
                return false;
            }

            if ((this.fileExtension && !url.fileExtension)
                || (!this.fileExtension && url.fileExtension)
                || (this.fileExtension && url.fileExtension && !this.fileExtension.isMatch(url.fileExtension))) {
                return false;
            }

            let queryMatch: boolean = true;
            this.query.forEach((routeElement: RouteElement, key: string) => {
                const value = url.searchParams.get(key);

                if (!value || !routeElement.isMatch(value)) {
                    queryMatch = false;
                }
            });

            return queryMatch;
        }

        return true;
    }

    public getVariables(request: Request, base?: string | undefined): IRouteVariables {
        const url = new UrlEx(request.url, base);
        const variables = new RouteVariables(new Map<string, string>(), new Map<string, string>(), url);

        let routeIndex = 0;
        let tokenIndex = 0;

        while (routeIndex < this.elements.length && tokenIndex < url.pathTokens.length) {
            const element = this.elements[routeIndex];

            if (element.type === RouteElementType.DoubleWildcard) {
                if (routeIndex === this.elements.length - 1) {
                    // This is the last element so we can return
                    // e.g. /Path/To/Check/**
                    return variables;
                } else {
                    // This is the second to last element
                    // e.g. /Path/To/Check/**/file.js or /Path/To/Check/**/*.js
                    routeIndex++;
                    tokenIndex = url.pathTokens.length - 1;
                    continue;
                }
            } 
            
            if (element.type === RouteElementType.Variable) {
                variables.path.set(element.value, url.pathTokens[tokenIndex]);
            } 

            routeIndex++;
            tokenIndex++;
        }

        // Check for outstanding double wildcard
        if (routeIndex === this.elements.length - 1 && tokenIndex === url.pathTokens.length) {
            return variables;
        }

        if (this.fileExtension && this.fileExtension.type === RouteElementType.Variable) {
            variables.path.set(this.fileExtension.value, url.fileExtension);
        }

        this.query.forEach((routeElement: RouteElement, key: string) => {
            if (routeElement.type === RouteElementType.Variable) {
                const value = url.searchParams.get(key);

                if (value) {
                    variables.query.set(key, url.searchParams.get(key) as string);
                }
            }
        });

        return variables;
    }
}
