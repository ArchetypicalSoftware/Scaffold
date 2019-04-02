import { IRouteConfiguration } from "../../src/abstractions";
import { Route } from "./../../src/routing/route";
import { Request } from "./../service-worker.mocks";

describe("Route tests", () => {
    const base = "https://www.example.com";

    test("basic matching", () => {
        const route = new Route("/Area/SomeController/SomeAction", base);

        expect(route.isMatch(new Request(`${base}/Area/SomeController/SomeAction`))).toBe(true);
        expect(route.isMatch(new Request(`${base}/Area/SomeController/SomeAction2`))).toBe(false);
        expect(route.isMatch(new Request(`${base}/Area/SomeController/SomeAction.js`))).toBe(false);        
        expect(route.isMatch(new Request(`${base}/Area/SomeController`))).toBe(false);
        expect(route.isMatch(new Request(`${base}/Area`))).toBe(false);
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
        const request = new Request(`${base}/Area/SomeController/SomeAction`);

        expect(route.isMatch(request)).toBe(true);

        const variables = route.getVariables(request);
        expect(variables).toBeTruthy();
        expect(variables.path.size).toBe(2);
        expect(variables.path.get("controller")).toBe("SomeController");
        expect(variables.path.get("action")).toBe("SomeAction");
    });

    test("query variables", () => {
        const route = new Route("/Path?param1={param1Value}&param2=notavariable", base);
        const request = new Request(`${base}/Path?param1=value&param2=notavariable`);

        expect(route.getVariables(request).query.size).toBe(1);
        expect(route.getVariables(request).query.get("param1")).toBe("value");
    });

    test("query match", () => {
        const route = new Route("/Path?param1=value", base);

        expect(route.isMatch(new Request(`${base}/Path`))).toBe(false);
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
        expect(route.isMatch(new Request(`${base}/file.js`))).toBe(true);
        expect(route.isMatch(new Request(`${base}/asdf/asdf/asdf/notfile.js`))).toBe(false);
    });

    test("end double wildcard", () => {
        const route = new Route("/**", base);

        expect(route.isMatch(new Request(`${base}/asdf/asdf/asdf/file.js`))).toBe(true);
        expect(route.isMatch(new Request(`${base}/asdf/asdf/asdf`))).toBe(true);
        expect(route.isMatch(new Request(`${base}/asdf/asdf/asdf?param=value`))).toBe(true);
        expect(route.isMatch(new Request(`${base}/`))).toBe(true);
    });

    test("wildcard double wildcard combo", () => {
        let route = new Route("/**/*.js", base);

        expect(route.isMatch(new Request(`${base}/asdf/asdf/asdf/asdf.js`))).toBe(true);
        expect(route.isMatch(new Request(`${base}/asdf/asdf/asdf/asdf.css`))).toBe(false);

        route = new Route("/**/*.*", base);

        expect(route.isMatch(new Request(`${base}/asdf/asdf/asdf/asdf.js`))).toBe(true);
        expect(route.isMatch(new Request(`${base}/asdf/asdf/asdf/asdf.css`))).toBe(true);
        expect(route.isMatch(new Request(`${base}/`))).toBe(false);
    });

    test("wildcard route and variables", () => {
        const route = new Route("/**/{param1}.js", base);
        let request = new Request(`${base}/asdf/asdf/asdf/asdf.js`);        

        expect(route.isMatch(request)).toBe(true);

        expect(route.getVariables(request).path.size).toBe(1);
        expect(route.getVariables(request).path.get("param1")).toBe("asdf");

        request = new Request(`${base}/asdf.js`);

        expect(route.isMatch(request)).toBe(true);

        expect(route.getVariables(request).path.size).toBe(1);
        expect(route.getVariables(request).path.get("param1")).toBe("asdf");
    });

    test("file extension variable tests", () => {
        const route = new Route("/*.{fileExtension}", base);
        const request = new Request(`${base}/asdf.js`);
        
        expect(route.getVariables(request).path.size).toBe(1);
        expect(route.getVariables(request).path.get("fileExtension")).toBe("js");
    });

    test("http method tests", () => {
        const request = new Request(`${base}/asdf`);
        
        let route = new Route("/asdf", base, { methods: ["GET"] } as IRouteConfiguration);
        expect(route.isMatch(request)).toBe(true);        

        route = new Route("/asdf", base, { methods: ["POST"] } as IRouteConfiguration);
        expect(route.isMatch(request)).toBe(false);

        route = new Route("/asdf", base, { methods: ["POST", "GET"] } as IRouteConfiguration);
        expect(route.isMatch(request)).toBe(true);

        route = new Route("/asdf", base, { methods: ["get"] } as any);
        expect(route.isMatch(request)).toBe(true); 
    });
});
