import { FetchContext, IApplicationBuilder, IServiceProvider, IServiceWorkerConfiguration, RequestDelegate } from "../../abstractions";
import { FetchEvent, Request, Response } from "../service-worker.mocks"
import { ApplicationBuilder } from "./../../application-builder/application-builder";

describe("Application Builder tests", () => {
    let applicationBuilder: IApplicationBuilder;
    let fetchContext: FetchContext;

    beforeEach(() => {
        applicationBuilder = new ApplicationBuilder(null as unknown as IServiceWorkerConfiguration, null as unknown as IServiceProvider);
        applicationBuilder.defaultRequestDelegate = (f: FetchContext) => Promise.resolve(f);
        fetchContext = new FetchContext(new FetchEvent(new Request("/testpath")));
    });

    test("use", async (done) => {
        let result = "";

        applicationBuilder.use((requestDelegate: RequestDelegate) => {
            return async (f: FetchContext) => {
                result = f.request.url;
                return requestDelegate(f);
            };
        });

        const r = applicationBuilder.build();
        await r(fetchContext);
        expect(result).toBe(fetchContext.request.url);

        done();
    });

    test("run", async (done) => {
        let result = "";

        applicationBuilder.run((f: FetchContext) => {
            result = f.request.url;
            return Promise.resolve(f);
        });

        const r = applicationBuilder.build();
        await r(fetchContext);
        expect(result).toBe(fetchContext.request.url);

        done();
    });

    test("useFunc", async (done) => {
        let result = "";

        applicationBuilder.useNext((f: FetchContext, next: () => Promise<FetchContext>) => {
            result = f.request.url;
            return next();
        });

        const r = applicationBuilder.build();
        await r(fetchContext);
        expect(result).toBe(fetchContext.request.url);

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

        applicationBuilder.use((r: RequestDelegate) => {
            return async (f: FetchContext) => {
                results.push("result1");
                return await r(f);
            };
        });

        applicationBuilder.useNext(async (f: FetchContext, next: () => Promise<FetchContext>) => {
            results.push("result2");
            return await next();
        });

        applicationBuilder.run(async (f: FetchContext) => {
            results.push("result3");
            return Promise.resolve(f);
        });

        const requestDelegate = applicationBuilder.build();
        await requestDelegate(fetchContext);

        expect(results.length).toBe(3);
        expect(results[0]).toBe("result1");
        expect(results[1]).toBe("result2");
        expect(results[2]).toBe("result3");

        done();
    });
});
