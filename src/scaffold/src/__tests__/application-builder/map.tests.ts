import { IApplicationBuilder, IServiceProvider, IServiceWorkerConfiguration, FetchContext } from "../../abstractions";
import "../../application-builder/map-extensions";
import { FetchEvent, Request, Response } from "../service-worker.mocks";
import { ApplicationBuilder } from "./../../application-builder/application-builder";

describe("Map tests", () => {
    let applicationBuilder: IApplicationBuilder;
    let fetchContext: FetchContext;

    beforeEach(() => {
        applicationBuilder = new ApplicationBuilder({ origin: "http://www.example.com" } as IServiceWorkerConfiguration,
                                                    null as unknown as IServiceProvider);
        applicationBuilder.defaultRequestDelegate = (fetchContext: FetchContext) => Promise.resolve(fetchContext);
        fetchContext = new FetchContext(new FetchEvent(new Request("http://www.example.com/testpath")));
    });

    test("basic", async (done) => {
        const result: string[] = [];

        applicationBuilder.map("/testpath", (app) => {
            app.run((fetchContext: FetchContext) => {
                result.push("match");
                return Promise.resolve(fetchContext);
            });
        });

        applicationBuilder.map("/testpath2", (app) => {
            app.run((fetchContext: FetchContext) => {
                result.push("nomatch");
                return Promise.resolve(fetchContext);
            });
        });

        applicationBuilder.map("/testpat", (app) => {
            app.run((fetchEvent: FetchContext) => {
                result.push("nomatch");
                return Promise.resolve(fetchEvent);
            });
        });

        const requestDelegate = applicationBuilder.build();

        await requestDelegate(fetchContext);

        expect(result.length).toBe(1);
        expect(result[0]).toBe("match");

        done();
    });
});