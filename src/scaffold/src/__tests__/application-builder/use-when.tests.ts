import { FetchContext, IApplicationBuilder, IServiceProvider, IServiceWorkerConfiguration } from "../../abstractions";
import { FetchEvent, Request, Response } from "../service-worker.mocks";
import { ApplicationBuilder } from "./../../application-builder/application-builder";
import "./../../application-builder/use-when-extensions";

describe("Use When tests", () => {
    let applicationBuilder: IApplicationBuilder;
    let fetchContext: FetchContext;

    beforeEach(() => {
        applicationBuilder = new ApplicationBuilder(null as unknown as IServiceWorkerConfiguration, null as unknown as IServiceProvider);
        applicationBuilder.defaultRequestDelegate = (f: FetchContext) => Promise.resolve(f);
        fetchContext = new FetchContext(new FetchEvent(new Request("/testpath")));
    });

    test("useWhen hit", async (done) => {
        let result = "invalid value";

        applicationBuilder.useWhen((fetchContext: FetchContext) => {
            return fetchContext.request.url.indexOf("testpath") >= 0;
        }, (builder: IApplicationBuilder) => {
            builder.run((f: FetchContext) => {
                result = f.request.url;
                return Promise.resolve(f);
            });
        });

        const requestDelegate = applicationBuilder.build();

        await requestDelegate(fetchContext);

        expect(result).toBe("/testpath");

        done();
    });

    test("useWhen miss", async (done) => {
        let result = "invalid value";

        applicationBuilder.useWhen((fetchContext: FetchContext) => {
            return fetchContext.request.url.indexOf("notmypath") >= 0;
        }, (builder: IApplicationBuilder) => {
            builder.run((f: FetchContext) => {
                result = f.request.url;
                return Promise.resolve(f);
            });
        });

        const requestDelegate = applicationBuilder.build();

        await requestDelegate(fetchContext);

        expect(result).toBe("invalid value");

        done();
    });
});
