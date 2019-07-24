import { CacheStrategy, IFetchContext, IServiceProvider, IServiceWorkerConfiguration } from "../../src/abstractions";
import { FetchEvent, Request, Response } from "../service-worker.mocks";
import { ApplicationBuilder, IApplicationBuilder } from "./../../src/application-builder";
import { FetchContext } from "./../../src/fetch/fetch-context";

describe("Cache tests", () => {
    let applicationBuilder: IApplicationBuilder;
    const results: string[] = [];
    const origin = "http://www.example.com";

    const noopCacheStrategy: CacheStrategy = (key?: string) => {
        return (fetchContext: IFetchContext) => {
            results.push(fetchContext.request.url);
            return Promise.resolve(new Response());
        };
    };

    const getFetchContext = (path: string) => new FetchContext(new FetchEvent(`${origin}${path}`));

    beforeEach(() => {
        applicationBuilder = new ApplicationBuilder({ origin } as IServiceWorkerConfiguration,
                                                    null as unknown as IServiceProvider);
        applicationBuilder.defaultRequestDelegate = (f: IFetchContext) =>  Promise.resolve(f);
    });

    test("basic", async (done) => {
        applicationBuilder.cache("/testpath", noopCacheStrategy);
        applicationBuilder.cache(["/**/*.js", "/css/*.css"], noopCacheStrategy);

        const requestDelegate = applicationBuilder.build();

        await requestDelegate(getFetchContext("/testpath"));
        await requestDelegate(getFetchContext("/js/site.js"));
        await requestDelegate(getFetchContext("/css/site.css"));

        expect(results.length).toBe(3);
        expect(results[0]).toBe(`${origin}/testpath`);
        expect(results[1]).toBe(`${origin}/js/site.js`);
        expect(results[2]).toBe(`${origin}/css/site.css`);

        done();
    });

    test("respondWith only called once", async (done) => {
        let callCount = 0;

        applicationBuilder.defaultRequestDelegate = (f: IFetchContext) =>  {
            f.event.respondWith(Promise.resolve(new Response()));
            return Promise.resolve(f);
        };

        FetchEvent.prototype.respondWith = jest.fn(() => {
            callCount++;
        });

        applicationBuilder.cache("/testpath", noopCacheStrategy);

        const requestDelegate = applicationBuilder.build();

        await requestDelegate(getFetchContext("/testpath"));

        expect(callCount).toBe(1);

        done();
    });
});
