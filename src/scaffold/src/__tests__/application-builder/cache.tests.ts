import { FetchContext, IApplicationBuilder, IServiceProvider, IServiceWorkerConfiguration } from "../../abstractions";
import "../../application-builder/cache-extensions";
import { CacheStrategy } from "../../application-builder/cache-strategies";
import "../../application-builder/map-extensions";
import { FetchEvent, Request, Response } from "../service-worker.mocks";
import { ApplicationBuilder } from "./../../application-builder/application-builder";

describe("Cache tests", () => {
    let applicationBuilder: IApplicationBuilder;
    const results: string[] = [];
    const origin = "http://www.example.com";

    const noopCacheStrategy: CacheStrategy = (key?: string) => {
        return (fetchContext: FetchContext) => {
            results.push(fetchContext.request.url);
            return Promise.resolve(new Response());
        };
    };

    const getFetchContext = (path: string) => new FetchContext(new FetchEvent(new Request(`${origin}${path}`)));

    beforeEach(() => {
        applicationBuilder = new ApplicationBuilder({ origin } as IServiceWorkerConfiguration,
                                                    null as unknown as IServiceProvider);
        applicationBuilder.defaultRequestDelegate = (f: FetchContext) =>  Promise.resolve(f);
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

        applicationBuilder.defaultRequestDelegate = (f: FetchContext) =>  {
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