namespace Routes {
    const hostRegex = new RegExp("^(http[s]?|ftp):\/\/(?:([^\/]*)\/?)");
    const pathRegex = new RegExp("([^\?]*)\\??");
    const variableRegex = new RegExp("^{([^}]+)}$");

    const _routes: Route[] = [];
    const _staticRoutes: Route[] = [];

    class UrlElements {
        protocol: string;
        host: string;
        pathElements: string[];
        queryString: string;
        query: object;
        fileExtension: string;

        constructor() {
            this.protocol = "";
            this.host = "";
            this.pathElements = [];
            this.queryString = "";
            this.query = null;
            this.fileExtension = "";
        }
    }

    enum RouteElementType {
        Static,
        Variable,
        Wildcard,
        DoubleWildcard
    }

    class RouteElement {
        public value: string;
        public type: RouteElementType;

        private isWildcard: boolean;

        constructor(value: string) {
            if (variableRegex.test(value)) {
                const matches = variableRegex.exec(value);
                this.value = matches[1];
                this.type = RouteElementType.Variable;
            } else {
                this.value = value;

                switch (this.value) {
                    case '*':
                        this.type = RouteElementType.Wildcard;
                        break;

                    case '**':
                        this.type = RouteElementType.DoubleWildcard;
                        break;

                    default:
                        this.type = RouteElementType.Static;
                        break;
                }
                
            }
        }

        public isMatch(routeElement: string): boolean {
            return this.type === RouteElementType.Static ? routeElement.toLowerCase() == this.value.toLowerCase() : true;
        }
    }

    class Route {
        private elements: RouteElement[];
        private routeUrl: string;
        private fileExtension: RouteElement;
        private query: { [key: string]: RouteElement; }
        
        public handler: (event: Event, data: object) => void;

        constructor(route: string, handler: (event: Event, data: object) => void) {
            const urlElements = parseUrl(route);

            this.routeUrl = route;
            this.elements = [];
            this.fileExtension = urlElements.fileExtension ? new RouteElement(urlElements.fileExtension) : null;
            this.handler = handler;
            
            urlElements.pathElements.forEach(x => this.elements.push(new RouteElement(x)));

            if (urlElements.query) {
                this.query = {};

                for (let key in urlElements.query) {
                    const value = urlElements.query[key];
                    this.query[key] = new RouteElement(value);
                }
            }
        }

        public isMatch(url: string): boolean {
            const urlElements = parseUrl(url);

            if (this.fileExtension && !urlElements.fileExtension)
                return false;

            if (this.fileExtension) {
                if (!urlElements.fileExtension || !this.fileExtension.isMatch(urlElements.fileExtension))
                    return false;

                let index = 0;
                let urlIndex = 0;

                while (index < this.elements.length) {
                    const element = this.elements[index];

                    if (element.type == RouteElementType.DoubleWildcard) {
                        urlIndex = urlElements.pathElements.length - 1;
                    } else if (!element.isMatch(urlElements.pathElements[urlIndex])) {
                        return false;
                    } else {
                        urlIndex++;
                    }

                    index++;
                }
            } else {
                if (this.elements.length !== urlElements.pathElements.length)
                    return false;

                let index = 0;

                while (index < this.elements.length) {
                    if (!this.elements[index].isMatch(urlElements.pathElements[index]))
                        return false;

                    index++;
                }
            }

            if (this.query) {
                if (!urlElements.query)
                    return false;

                for (let key in urlElements.query) {
                    const element = this.query[key];

                    if (!element || !element.isMatch(urlElements[key]))
                        return false;
                }
            }

            return true;
        }

        public getRouteVariables(url: string): object {
            const urlElements = parseUrl(url);

            const routeData = {
                query: null,
                routeUrl: this.routeUrl
            };

            urlElements.pathElements.forEach((x, i) => {
                if (this.elements[i].type) {
                    routeData[this.elements[i].value] = x;
                }
            });

            if (urlElements.query && this.query) {
                routeData.query = {};

                for (let key in urlElements.query) {
                    if (this.query[key] && this.query[key].type) {
                        routeData.query[key] = urlElements.query[key];
                    }
                }
            }

            return routeData;
        }
    }

    function parseUrl(url: string): UrlElements {
        const result = new UrlElements();

        if (hostRegex.test(url)) {
            const matches = hostRegex.exec(url);
            
            result.protocol = matches[1];
            result.host = matches[2];
            
            url = url.substring(matches[0].length);
        }

        if (pathRegex.test(url)) {
            const matches = pathRegex.exec(url);

            result.pathElements = matches[1] ? matches[1].split('/').filter(x => x).map(x => decodeURIComponent(x)) : [];

            let lastElement = result.pathElements[result.pathElements.length - 1];

            if (lastElement.indexOf('.') != -1) {
                const tokens = lastElement.split('.').map(x => x.trim());
                
                result.pathElements[result.pathElements.length - 1] = tokens[0];
                result.fileExtension = tokens[1];
            }

            url = url.substring(matches[0].length);
        }

        if (url.length) {
            result.queryString = url;

            const queryObject = {};

            const pairs = result.queryString.split('&');
            pairs.forEach(p => {
                const tokens = p.split('=');
                queryObject[decodeURIComponent(tokens[0])] = decodeURIComponent(tokens[1]);
            });

            result.query = queryObject;
        }

        return result;
    }

    export function add(entry: string | { url: string, handler: (event: Event, data: object) => void } [], handler: (event: Event, data: object) => void) {
        if (typeof (entry) === "string") {
            entry = [{ url: entry, handler: handler }];            
        }

        entry.forEach(x => _routes.push(new Route(x.url, x.handler)));
    }

    export function exec(event: Event): boolean {
        const url = (<any>event).request.url;

        for (let i = 0; i < _routes.length; i++) {
            const route = _routes[i];

            if (route.isMatch(url)) {
                const routeData = route.getRouteVariables(url);
                route.handler(event, routeData);
                return true;
            }
        }

        return null;
    }
}

