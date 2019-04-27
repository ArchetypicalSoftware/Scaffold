import { IApplicationBuilder, IFetchContext, IServiceProvider, IServiceWorkerConfiguration } from "../../src/abstractions";
import "../../src/application-builder/map-extensions";
import "../../src/application-builder/run-extensions";
import { FetchEvent, Request } from "../service-worker.mocks";
import { ApplicationBuilder } from "./../../src/application-builder/application-builder";
import { FetchContext } from "./../../src/fetch/fetch-context";

describe("Map tests", () => {
    let applicationBuilder: IApplicationBuilder;
    let fetchContext: IFetchContext;

    beforeEach(() => {
        applicationBuilder = new ApplicationBuilder({ origin: "http://www.example.com" } as IServiceWorkerConfiguration,
                                                    null as unknown as IServiceProvider);
        applicationBuilder.defaultRequestDelegate = (f: IFetchContext) => Promise.resolve(f);
        fetchContext = new FetchContext(new FetchEvent(new Request("http://www.example.com/testpath")));
    });

    test("basic", async (done) => {
        const result: string[] = [];

        applicationBuilder.map("/testpath", (app) => {
            app.run((f: IFetchContext) => {
                result.push("match");
                return Promise.resolve(f);
            });
        });

        applicationBuilder.map("/testpath2", (app) => {
            app.run((f: IFetchContext) => {
                result.push("nomatch");
                return Promise.resolve(f);
            });
        });

        applicationBuilder.map("/testpat", (app) => {
            app.run((f: IFetchContext) => {
                result.push("nomatch");
                return Promise.resolve(f);
            });
        });

        const requestDelegate = applicationBuilder.build();

        await requestDelegate(fetchContext);

        expect(result.length).toBe(1);
        expect(result[0]).toBe("match");

        done();
    });
});