import { IFetchContext, IServiceProvider, IServiceWorkerConfiguration, RequestDelegate } from "../../src/abstractions";
import { environment } from "../../src/environment";
import { FetchContext } from "../../src/fetch/fetch-context";
import { FetchEvent, MockCache, MockCacheStorage } from "../service-worker.mocks";
import { ApplicationBuilder, IApplicationBuilder } from "./../../src/application-builder";

describe("Application Builder tests", () => {
    let applicationBuilder: IApplicationBuilder;
    let fetchContext: IFetchContext;

    beforeEach(() => {
        applicationBuilder = new ApplicationBuilder(null as unknown as IServiceWorkerConfiguration, null as unknown as IServiceProvider);
        applicationBuilder.defaultRequestDelegate = (f: IFetchContext) => Promise.resolve(f);
        fetchContext = new FetchContext(new FetchEvent("/testpath"));
    });

    test("use", async (done) => {
        let result = "";

        applicationBuilder.use((requestDelegate: RequestDelegate) => {
            return async (f: IFetchContext) => {
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

        applicationBuilder.run((f: IFetchContext) => {
            result = f.request.url;
            return Promise.resolve(f);
        });

        const r = applicationBuilder.build();
        await r(fetchContext);
        expect(result).toBe(fetchContext.request.url);

        done();
    });

    test("useNext", async (done) => {
        let result = "";

        applicationBuilder.useNext((f: IFetchContext, next: () => Promise<IFetchContext>) => {
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
            return async (f: IFetchContext) => {
                results.push("result1");
                return await r(f);
            };
        });

        applicationBuilder.useNext(async (f: IFetchContext, next: () => Promise<IFetchContext>) => {
            results.push("result2");
            return await next();
        });

        applicationBuilder.run(async (f: IFetchContext) => {
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
