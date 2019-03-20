import { HttpMethod, IRouteConfiguration, IRouteVariables } from "../abstractions";
import { RouteVariables } from "./route-variables";

enum RouteElementType {
    Static,
    Variable,
    Wildcard,
    DoubleWildcard,
}

class UrlEx extends URL {
    public fileExtension: string = "";
    public pathTokens: string[] = [];

    constructor(url: string, base?: string | URL | undefined) {
        super(url, base);

        this.pathTokens = this.pathname.split("/").filter((x) => x).map((x) => decodeURIComponent(x));

        if (this.pathTokens.length) {
            const lastElement = this.pathTokens[this.pathTokens.length - 1];

            if (lastElement.indexOf(".") !== -1) {
                const tokens = lastElement.split(".").map((x) => x.trim());

                this.pathTokens[this.pathTokens.length - 1] = tokens[0];
                this.fileExtension = tokens[1];
            }
        }
    }
}

const variableRegex: RegExp = new RegExp("^{([^}]+)}$");

class RouteElement {
    public value: string;
    public type: RouteElementType;

    constructor(value: string) {
        if (variableRegex.test(value)) {
            const matches = variableRegex.exec(value);
            this.value = matches![1];
            this.type = RouteElementType.Variable;
        } else {
            this.value = value;

            switch (this.value) {
                case "*":
                    this.type = RouteElementType.Wildcard;
                    break;

                case "**":
                    this.type = RouteElementType.DoubleWildcard;
                    break;

                default:
                    this.type = RouteElementType.Static;
                    break;
            }
        }
    }

    public isMatch(match: string | null): boolean {
        if (!match) {
            return false;
        }

        return this.type === RouteElementType.Static ? match.toLowerCase() === this.value.toLowerCase() : true;
    }
}

const isOptionalRegex: RegExp = RegExp("^\[.*\]$");

class QueryParameterDefinition {
    public name: string;
    public routeElement: RouteElement;
    public isOptional: boolean;

    constructor(name: string, value: string) {
        this.isOptional = false;
        this.routeElement = new RouteElement(value);

        if (isOptionalRegex.test(name)) {
            this.isOptional = true;
            name = name.slice(1, name.length - 1);
        }

        this.name = name;
    }
}

export class Route {
    public path: string;
    private elements: RouteElement[];
    private fileExtension: RouteElement | null;
    private query: Map<string, QueryParameterDefinition>;
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
        this.query = new Map<string, QueryParameterDefinition>();

        this.url.pathTokens.forEach((x) => this.elements.push(new RouteElement(x)));

        this.url.searchParams.forEach((value: string, key: string) => {
            this.query.set(key, new QueryParameterDefinition(key, value));
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

        if (!isEndDoubleWildcard) {
            if (routeIndex !== this.elements.length || tokenIndex !== url.pathTokens.length) {
                return false;
            }

            if ((this.fileExtension && !url.fileExtension)
                || (!this.fileExtension && url.fileExtension)
                || (this.fileExtension && url.fileExtension && !this.fileExtension.isMatch(url.fileExtension))) {
                return false;
            }
        }

        let queryMatch: boolean = true;
        this.query.forEach((queryParam: QueryParameterDefinition, key: string) => {
            const value = url.searchParams.get(key);

            if (value && !queryParam.routeElement.isMatch(value)) {
                queryMatch = false;
            }
        });

        return queryMatch;
    }

    public getVariables(url: string, base?: string | undefined): IRouteVariables {
        const urlEx = new UrlEx(url, base);
        const variables = new RouteVariables(new Map<string, string>(), new Map<string, string>(), urlEx);

        if (this.fileExtension && this.fileExtension.type === RouteElementType.Variable) {
            variables.path.set(this.fileExtension.value, urlEx.fileExtension);
        }

        urlEx.pathTokens.forEach((x, i) => {
            if (this.elements[i].type === RouteElementType.Variable) {
                variables.path.set(this.elements[i].value, x);
            }
        });

        this.query.forEach((queryParam: QueryParameterDefinition, key: string) => {
            if (queryParam.routeElement.type === RouteElementType.Variable) {
                const value = urlEx.searchParams.get(key);

                if (value) {
                    variables.query.set(key, urlEx.searchParams.get(key) as string);
                }
            }
        });

        return variables;
    }
}
