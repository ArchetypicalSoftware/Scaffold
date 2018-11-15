var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Routes;
(function (Routes) {
    var hostRegex = new RegExp("^(http[s]?|ftp):\/\/(?:([^\/]*)\/?)");
    var pathRegex = new RegExp("([^\?]*)\\??");
    var UrlElements = /** @class */ (function () {
        function UrlElements() {
        }
        return UrlElements;
    }());
    var RouteElementType;
    (function (RouteElementType) {
        RouteElementType[RouteElementType["Variable"] = 0] = "Variable";
        RouteElementType[RouteElementType["Static"] = 1] = "Static";
        RouteElementType[RouteElementType["Host"] = 2] = "Host";
    })(RouteElementType || (RouteElementType = {}));
    var RouteElement = /** @class */ (function () {
        function RouteElement(elementType) {
            this.elementType = elementType;
        }
        return RouteElement;
    }());
    var VariableRouteElement = /** @class */ (function (_super) {
        __extends(VariableRouteElement, _super);
        function VariableRouteElement(variableName) {
            var _this = _super.call(this, RouteElementType.Variable) || this;
            _this.variableName = variableName;
            return _this;
        }
        VariableRouteElement.prototype.isMatch = function (routeElement) {
            return true;
        };
        return VariableRouteElement;
    }(RouteElement));
    var StaticRouteElement = /** @class */ (function (_super) {
        __extends(StaticRouteElement, _super);
        function StaticRouteElement(routeElement) {
            var _this = _super.call(this, RouteElementType.Static) || this;
            _this.routeElement = routeElement;
            return _this;
        }
        StaticRouteElement.prototype.isMatch = function (routeElement) {
            return routeElement.toLowerCase() == this.routeElement.toLowerCase();
        };
        return StaticRouteElement;
    }(RouteElement));
    var Route = /** @class */ (function () {
        function Route(route) {
            var url = parse(route);
        }
        return Route;
    }());
    function parse(path) {
        var result = new UrlElements();
        if (hostRegex.test(path)) {
            var match = hostRegex.exec(path);
            result.protocol = match[1];
            result.host = match[2];
            path = path.substring(match[0].length);
        }
        if (pathRegex.test(path)) {
            var match = pathRegex.exec(path);
            result.pathElements = match[1] ? match[1].split('/').filter(function (x) { return x; }).map(function (x) { return decodeURIComponent(x); }) : [];
            path = path.substring(match[0].length);
        }
        if (path.length) {
            result.queryString = path;
            var queryObject_1 = {};
            var pairs = result.queryString.split('&');
            pairs.forEach(function (p) {
                var tokens = p.split('=');
                queryObject_1[decodeURIComponent(tokens[0])] = decodeURIComponent(tokens[1]);
            });
            result.query = queryObject_1;
        }
        return result;
    }
    Routes.parse = parse;
})(Routes || (Routes = {}));
//# sourceMappingURL=routes.js.map