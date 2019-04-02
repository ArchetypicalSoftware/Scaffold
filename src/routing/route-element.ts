const variableRegex: RegExp = new RegExp("^{([^}]+)}$");

export enum RouteElementType {
    Static,
    Variable,
    Wildcard,
    DoubleWildcard,
}

export class RouteElement {
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
