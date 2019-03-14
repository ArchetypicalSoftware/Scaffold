import { IApplicationBuilder, IServiceProvider, IServiceWorkerConfiguration } from "../../abstractions";
import { FetchEvent, Request, Response } from "../service-worker.mocks";
import { ApplicationBuilder } from "./../../application-builder/application-builder";
import "./../../application-builder/use-when-extensions";

describe("Use When tests", () => {
    let applicationBuilder: IApplicationBuilder;
    let fetchEvent: FetchEvent;

    beforeEach(() => {
        applicationBuilder = new ApplicationBuilder(null as unknown as IServiceWorkerConfiguration, null as unknown as IServiceProvider);
        applicationBuilder.defaultRequestDelegate = (f: FetchEvent) => Promise.resolve(new Response());
        fetchEvent = new FetchEvent(new Request("/testpath"));
    });

    test("useWhen hit", async (done) => {
        let result = "invalid value";

        applicationBuilder.useWhen((fetchEvent: FetchEvent) => {
            return fetchEvent.request.url.indexOf("testpath") >= 0;
        }, (builder: IApplicationBuilder) => {
            builder.run((fetchEvent: FetchEvent) => {
                result = fetchEvent.request.url;
                return Promise.resolve(new Response());
            });
        });

        const requestDelegate = applicationBuilder.build();

        await requestDelegate(fetchEvent);

        expect(result).toBe("/testpath");

        done();
    });

    test("useWhen miss", async (done) => {
        let result = "invalid value";

        applicationBuilder.useWhen((fetchEvent: FetchEvent) => {
            return fetchEvent.request.url.indexOf("notmypath") >= 0;
        }, (builder: IApplicationBuilder) => {
            builder.run((fetchEvent: FetchEvent) => {
                result = fetchEvent.request.url;
                return Promise.resolve(new Response());
            });
        });

        const requestDelegate = applicationBuilder.build();

        await requestDelegate(fetchEvent);

        expect(result).toBe("invalid value");

        done();
    });
});
