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

enum RouteElementType {
    Static,
    Variable,
    Wildcard,
    DoubleWildcard,
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

export class RouteVariables {
    public path: Map<string, string>;
    public query: Map<string, string>;
    public url: URL;

    constructor(path: Map<string, string>, query: Map<string, string>, url: URL) {
        this.path = path;
        this.query = query;
        this.url = url;
    }
}

export class Route {
    public path: string;
    private elements: RouteElement[];
    private fileExtension: RouteElement | null;
    private query: Map<string, RouteElement>;
    private url: UrlEx;
    private methods: Array<"GET" | "POST" | "PUT" | "DELETE" | "HEAD">;

    constructor(path: string, base?: string | URL | undefined, methods?: Array<"GET" | "POST" | "PUT" | "DELETE" | "HEAD">) {
        this.path = path;
        this.url = new UrlEx(path, base);

        this.methods = methods || ["GET"];

        this.elements = [];
        this.fileExtension = this.url.fileExtension ? new RouteElement(this.url.fileExtension) : null;
        this.query = new Map<string, RouteElement>();

        this.url.pathTokens.forEach((x) => this.elements.push(new RouteElement(x)));

        this.url.searchParams.forEach((value: string, key: string) => {
            this.query.set(key, new RouteElement(value));
        });
    }

    public isMatch(request: Request): boolean {
        if ((this.methods as string[]).indexOf(request.method.toUpperCase()) === -1) {
            return false;
        }

        const urlElements = new UrlEx(request.url);

        if (this.fileExtension && !urlElements.fileExtension) {
            return false;
        }

        if (this.fileExtension) {
            if (!urlElements.fileExtension || !this.fileExtension.isMatch(urlElements.fileExtension)) {
                return false;
            }

            let index = 0;
            let urlIndex = 0;

            while (index < this.elements.length) {
                const element = this.elements[index];

                if (element.type === RouteElementType.DoubleWildcard) {
                    urlIndex = urlElements.pathTokens.length - 1;
                } else if (!element.isMatch(urlElements.pathTokens[urlIndex])) {
                    return false;
                } else {
                    urlIndex++;
                }

                index++;
            }
        } else {
            if (this.elements.length !== urlElements.pathTokens.length) {
                return false;
            }

            let index = 0;

            while (index < this.elements.length) {
                if (!this.elements[index].isMatch(urlElements.pathTokens[index])) {
                    return false;
                }

                index++;
            }
        }

        let queryMatch: boolean = true;
        this.query.forEach((routeElement: RouteElement, key: string) => {
            const value = urlElements.searchParams.get(key);

            if (value && routeElement.isMatch(value)) {
                queryMatch = false;
            }
        });

        return queryMatch;
    }

    public getVariables(url: string, base?: string | undefined): RouteVariables {
        const urlEx = new UrlEx(url, base);
        const variables = new RouteVariables(new Map<string, string>(), new Map<string, string>(), urlEx);

        urlEx.pathTokens.forEach((x, i) => {
            if (this.elements[i].type === RouteElementType.Variable) {
                variables.path.set(this.elements[i].value, x);
            }
        });

        this.query.forEach((routeElement: RouteElement, key: string) => {
            if (routeElement.type === RouteElementType.Variable) {
                const value = urlEx.searchParams.get(key);

                if (value) {
                    variables.query.set(key, urlEx.searchParams.get(key) as string);
                }
            }
        });

        return variables;
    }
}
