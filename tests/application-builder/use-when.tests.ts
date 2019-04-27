import { IApplicationBuilder, IFetchContext, IServiceProvider, IServiceWorkerConfiguration } from "../../src/abstractions";
import { FetchEvent, Request } from "../service-worker.mocks";
import { ApplicationBuilder } from "./../../src/application-builder/application-builder";
import "./../../src/application-builder/run-extensions";
import "./../../src/application-builder/use-when-extensions";
import { FetchContext } from "./../../src/fetch/fetch-context";

describe("Use When tests", () => {
    let applicationBuilder: IApplicationBuilder;
    let fetchContext: IFetchContext;

    beforeEach(() => {
        applicationBuilder = new ApplicationBuilder(null as unknown as IServiceWorkerConfiguration, null as unknown as IServiceProvider);
        applicationBuilder.defaultRequestDelegate = (f: IFetchContext) => Promise.resolve(f);
        fetchContext = new FetchContext(new FetchEvent(new Request("/testpath")));
    });

    test("useWhen hit", async (done) => {
        let result = "invalid value";

        applicationBuilder.useWhen((f: IFetchContext) => {
            return f.request.url.indexOf("testpath") >= 0;
        }, (builder: IApplicationBuilder) => {
            builder.run((f: IFetchContext) => {
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

        applicationBuilder.useWhen((f: IFetchContext) => {
            return f.request.url.indexOf("notmypath") >= 0;
        }, (builder: IApplicationBuilder) => {
            builder.run((f: IFetchContext) => {
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
