import { FetchContext } from "swork";
import { Router } from "swork-router";
import { Configuration } from "swork/dist/configuration";
import { Middleware, RequestDelegate, Swork } from "swork/dist/swork";
import { HttpMethod, IApplicationBuilder, ICacheClearOptions, IServiceProvider } from "../src/abstractions";
import { ApplicationBuilder } from "../src/application-builder";
import { HostingEnvironment } from "../src/hosting-environment";
import { middlewares } from "../src/middlewares";
import { getFetchEvent } from "./mock-helper";

// tslint:disable-next-line:no-string-literal
const build = (app: IApplicationBuilder): RequestDelegate => app.build()["build"]();
// tslint:disable-next-line:no-empty
const noop = () => {};

describe("Application Builder tests", () => {
    let applicationBuilder: IApplicationBuilder;
    let fetchContext: FetchContext;

    beforeEach(() => {
        applicationBuilder = new ApplicationBuilder(null as unknown as IServiceProvider, new HostingEnvironment({
            environment: "development",
            origin: "http://localhost",
            version: "1",
        } as Configuration));

        fetchContext = new FetchContext(getFetchEvent("http://localhost/testpath"));
    });

    test("use", async (done) => {
        let called = false;

        applicationBuilder.use(() => {
            called = true;
        });

        const requestDelegate = build(applicationBuilder);
        await requestDelegate(fetchContext);

        expect(called).toBeTruthy();

        done();
    });

    test("useWhen", async (done) => {
        let called = false;
        let canPass = false;

        applicationBuilder.useWhen(() => canPass, () => {
            called = true;
        }).use(noop);

        const requestDelegate = build(applicationBuilder);
        
        await requestDelegate(fetchContext);
        expect(called).toBeFalsy();

        canPass = true;

        await requestDelegate(fetchContext);
        expect(called).toBeTruthy();

        done();
    });

    test("getProperty/setProperty", () => {
        const date = new Date();
        applicationBuilder.setProperty("key", date);
        const result = applicationBuilder.getProperty("key");
        expect(result).toEqual(date);
    });

    test("nested use", async (done) => {
        const results: string[] = [];

        applicationBuilder.use((context: FetchContext, next: () => Promise<void>) => {
            results.push("result1");
            next();
        });

        applicationBuilder.use((context: FetchContext, next: () => Promise<void>) =>  {
            results.push("result2");
            next();
        });

        applicationBuilder.use(() => {
            results.push("result3");
        });

        const requestDelegate = build(applicationBuilder);
        await requestDelegate(fetchContext);

        expect(results.length).toBe(3);
        expect(results[0]).toBe("result1");
        expect(results[1]).toBe("result2");
        expect(results[2]).toBe("result3");

        done();
    });

    test("map", async (done) => {
        let called = false;

        applicationBuilder.map("/testpath", () => {
            called = true;
        }).use(noop);

        const requestDelegate = build(applicationBuilder);

        await requestDelegate(new FetchContext(getFetchEvent("http://localhost/nottestpath")));
    
        expect(called).toBeFalsy();

        await requestDelegate(fetchContext);

        expect(called).toBeTruthy();

        done();
    });

    test("mapWhen", async (done) => {
        let called = false;
        let canPass = false;

        applicationBuilder.mapWhen("/testpath", () => canPass, () => {
            called = true;
        }).use(noop);

        const requestDelegate = build(applicationBuilder);

        await requestDelegate(fetchContext);
    
        expect(called).toBeFalsy();

        canPass = true;

        await requestDelegate(fetchContext);

        expect(called).toBeTruthy();

        done();
    });

    test("useInstallCache", async (done) => {
        const original = middlewares.installCache;

        // tslint:disable-next-line:no-empty
        const mock = jest.fn(() => {});
        middlewares.installCache = mock as unknown as (urlsToCache: string[], cacheKey: string) => () => Promise<void>;

        (applicationBuilder as ApplicationBuilder).env = new HostingEnvironment({
            environment: "production",
            origin: "http://localhost",
            version: "v1",
        });

        const urlsToCache = ["url"];
        applicationBuilder.useInstallCache(urlsToCache);

        expect(mock).toBeCalledTimes(1);
        expect(mock).toBeCalledWith(urlsToCache, "v1");

        middlewares.installCache = original;

        done();
    });

    test("useClearCacheOnUpdate", async (done) => {
        const original = middlewares.clearCacheOnUpdate;

        // tslint:disable-next-line:no-empty
        const mock = jest.fn(() => {});
        middlewares.clearCacheOnUpdate = mock as unknown as (options: ICacheClearOptions) => () => Promise<void>;

        const options = {
            whitelist: ["whitelist"],
        } as ICacheClearOptions;
        applicationBuilder.useClearCacheOnUpdate(options);

        expect(mock).toBeCalledTimes(1);
        expect(mock).toBeCalledWith(options);

        middlewares.clearCacheOnUpdate = original;

        done();
    });

    test("useClaimClients", async (done) => {
        const original = middlewares.claimClients;

        // tslint:disable-next-line:no-empty
        const mock = jest.fn(() => {});
        middlewares.claimClients = mock as unknown as () => Swork;

        applicationBuilder.useClaimClients();

        expect(mock).toBeCalledTimes(1);

        middlewares.claimClients = original;

        done();
    });

    test("buildRouter", () => {
        // tslint:disable-next-line:no-string-literal max-line-length
        const buildRouter = (method: HttpMethod): Router => {
            const a = new ApplicationBuilder(null as unknown as IServiceProvider, null as unknown as HostingEnvironment);
            
            // tslint:disable-next-line:no-string-literal
            return a["buildRouter"]("/path", noop, { methods: [method] });
        };

        const validateRouter = (router: Router, method: HttpMethod) => {
            // tslint:disable-next-line:no-string-literal
            const details = router["middlewareDetails"];

            expect(details.length).toBe(1);
            
            const detail = details[0] as any;

            // @ts-ignore
            // tslint:disable-next-line:no-string-literal
            expect(detail["methods"][0]).toBe(method);

            // @ts-ignore
            // tslint:disable-next-line:no-string-literal
            expect(detail["path"][0]).toBe("/path");

            // @ts-ignore
            // tslint:disable-next-line:no-string-literal
            expect(detail["middleware"]).toBe(noop);
        };

        ["HEAD", "OPTIONS", "GET", "PUT", "PATCH", "POST", "DELETE"].forEach((method) => {
            validateRouter(buildRouter(method as HttpMethod), method as HttpMethod);
        });
    });

    test("buildRouter all", () => {
        const a = new ApplicationBuilder(null as unknown as IServiceProvider, null as unknown as HostingEnvironment);
        // tslint:disable-next-line:no-string-literal
        const router = a["buildRouter"]("/path", noop, { methods: ["ALL"] });

        // tslint:disable-next-line:no-string-literal
        const detail = router["middlewareDetails"][0];

        // @ts-ignore
        // tslint:disable-next-line:no-string-literal
        expect(detail["methods"].length).toBe(7);
    });

    test("clone", () => {
        applicationBuilder.setProperty("hello", "world");
        const clone = applicationBuilder.clone();

        expect(clone.getProperty("hello")).toBe("world");
    });

    test("on", () => {
        applicationBuilder.on("activate", noop);
        
        // tslint:disable-next-line:no-string-literal
        const instance = (applicationBuilder as ApplicationBuilder)["instance"];

        // tslint:disable-next-line:no-string-literal
        const handlers = instance["eventHandlers"].get("activate");

        expect(handlers!.length).toBe(1);
        expect(handlers![0]).toBe(noop);
    });

    test("useLogging 1", () => {
        const original = middlewares.logger;

        // tslint:disable-next-line:no-empty
        const mock = jest.fn(() => {}) as unknown as () => Middleware;
        middlewares.logger = mock;

        middlewares.logger = mock;

        applicationBuilder.useLogging(true);

        expect(mock).toBeCalledTimes(1);

        middlewares.logger = original;
    });

    test("useLogging 2", () => {
        const original = middlewares.logger;

        // tslint:disable-next-line:no-empty
        const mock = jest.fn(() => {}) as unknown as () => Middleware;
        middlewares.logger = mock;

        middlewares.logger = mock;

        applicationBuilder.useLogging();

        expect(mock).toBeCalledTimes(1);

        middlewares.logger = original;
    });

    test("useLogging 2", () => {
        const original = middlewares.logger;

        applicationBuilder = new ApplicationBuilder(null as unknown as IServiceProvider, new HostingEnvironment({
            environment: "production",
            origin: "http://localhost",
            version: "v1",
        }));

        // tslint:disable-next-line:no-empty
        const mock = jest.fn(() => {}) as unknown as () => Middleware;
        middlewares.logger = mock;

        middlewares.logger = mock;

        applicationBuilder.useLogging();

        expect(mock).toBeCalledTimes(0);

        middlewares.logger = original;
    });
});
