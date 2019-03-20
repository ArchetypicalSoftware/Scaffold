import { Route } from "./../../src/routing/route";
import { Request } from "./../service-worker.mocks";

describe("Route tests", () => {
    const base = "https://www.example.com";

    test("basic matching", () => {
        const route = new Route("/Area/SomeController/SomeAction", base);

        expect(route.isMatch(new Request(`${base}/Area/SomeController/SomeAction`))).toBe(true);
        expect(route.isMatch(new Request(`${base}/Area/SomeController/SomeAction2`))).toBe(false);
        expect(route.isMatch(new Request(`${base}/Area/SomeController/SomeAction.js`))).toBe(false);
    });

    test("variable matching", () => {
        const route = new Route("/Area/SomeController/SomeAction.js", base);

        expect(route.isMatch(new Request(`${base}/Area/SomeController/SomeAction.js`))).toBe(true);
        expect(route.isMatch(new Request(`${base}/Area/SomeController/SomeAction`))).toBe(false);
        expect(route.isMatch(new Request(`${base}/Area/SomeController/SomeAction.jsx`))).toBe(false);
        expect(route.isMatch(new Request(`${base}/Area/SomeAction.js`))).toBe(false);
    });

    test("path variables", () => {
        const route = new Route("/Area/{controller}/{action}", base);
        const url = `${base}/Area/SomeController/SomeAction`;

        expect(route.isMatch(new Request(url))).toBe(true);

        const variables = route.getVariables(url);
        expect(variables).toBeTruthy();
        expect(variables.path.size).toBe(2);
        expect(variables.path.get("controller")).toBe("SomeController");
        expect(variables.path.get("action")).toBe("SomeAction");
    });

    test("query variables", () => {
        const route = new Route("/Path?param1={param1Value}&param2=notavariable", base);
        expect(route.getVariables(`${base}/Path`).query.size).toBe(0);
        expect(route.getVariables(`${base}/Path?param2=value`).query.size).toBe(0);
        expect(route.getVariables(`${base}/Path?param1=value`).query.size).toBe(1);
        expect(route.getVariables(`${base}/Path?param1=value`).query.get("param1")).toBe("value");
    });

    test("query match", () => {
        const route = new Route("/Path?param1=value", base);

        expect(route.isMatch(new Request(`${base}/Path`))).toBe(true);
        expect(route.isMatch(new Request(`${base}/Path?param1=value`))).toBe(true);
        expect(route.isMatch(new Request(`${base}/Path?param1=notvalue`))).toBe(false);
        expect(route.isMatch(new Request(`${base}/Path?param2=value`))).toBe(false);
    });

    test("wildcard", () => {
        const route = new Route("/Path/*.js", base);

        expect(route.isMatch(new Request(`${base}/Path/file.js`))).toBe(true);
        expect(route.isMatch(new Request(`${base}/Path/another/file.js`))).toBe(false);
    });

    test("middle double wildcard", () => {
        const route = new Route("/**/file.js", base);

        expect(route.isMatch(new Request(`${base}/asdf/asdf/asdf/file.js`))).toBe(true);
        expect(route.isMatch(new Request(`${base}/asdf/asdf/asdf/notfile.js`))).toBe(false);
    });

    test("end double wildcard", () => {
        const route = new Route("/**", base);

        expect(route.isMatch(new Request(`${base}/asdf/asdf/asdf/file.js`))).toBe(true);
        expect(route.isMatch(new Request(`${base}/asdf/asdf/asdf`))).toBe(true);
    });

    test("wildcard double wildcard combo", () => {
        let route = new Route("/**/*.js", base);

        expect(route.isMatch(new Request(`${base}/asdf/asdf/asdf/asdf.js`))).toBe(true);
        expect(route.isMatch(new Request(`${base}/asdf/asdf/asdf/asdf.css`))).toBe(false);

        route = new Route("/**/*.*", base);

        expect(route.isMatch(new Request(`${base}/asdf/asdf/asdf/asdf.js`))).toBe(true);
        expect(route.isMatch(new Request(`${base}/asdf/asdf/asdf/asdf.css`))).toBe(true);
    });

    test("wildcard route and variables", () => {
        let route = new Route("/**/{param1}.js", base);
        const url = `${base}/asdf/asdf/asdf/asdf.js`;

        expect(route.isMatch(new Request(url))).toBe(true);

        expect(route.getVariables(url).path.size).toBe(1);
        expect(route.getVariables(url).path.get("param1")).toBe("asdf");
    });

    // TODO test the following
    /*
    Route: "/js/site.js?param=value"        Url: "/js/site.js"
    Route: "/js/site.js"                    Url: "/js/site.js?param=value"
    Route: "/js/site.js?param={paramValue}" Url: "/js/site.js"
    Route: "/js/site.js?param={paramValue}" Url: "/js/site.js?param2=value2"
    Route: "/js/site.js?param=value"        Url: "/js/site.js?param=value&param2=value2"

    Retest with optional [param]
    Retest with allowUnspecifiedParameters set to false
    */
});
