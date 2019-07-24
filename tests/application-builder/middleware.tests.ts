import { IFetchContext, IMiddleware, IServiceProvider, IServiceWorkerConfiguration, 
    RequestDelegate } from "../../src/abstractions";
import { FetchEvent, Request } from "../service-worker.mocks";
import { ApplicationBuilder, IApplicationBuilder } from "./../../src/application-builder";
import { FetchContext } from "./../../src/fetch/fetch-context";


class MyMiddleware implements IMiddleware {
    public next: RequestDelegate;
    public testObject: { testValue: string };

    constructor(next: RequestDelegate, testObject: { testValue: string }) {
        this.next = next;
        this.testObject = testObject;
    }

    public invokeAsync(fetchContext: IFetchContext): Promise<IFetchContext> {
        this.testObject.testValue = fetchContext.request.url;
        return this.next(fetchContext);
    }
}

describe("Middleware tests", () => {
    let applicationBuilder: IApplicationBuilder;
    let fetchContext: IFetchContext;

    beforeEach(() => {
        applicationBuilder = new ApplicationBuilder(null as unknown as IServiceWorkerConfiguration, null as unknown as IServiceProvider);
        applicationBuilder.defaultRequestDelegate = (f: IFetchContext) => Promise.resolve(f);
        fetchContext = new FetchContext(new FetchEvent("/testpath"));
    });

    test("basic", async (done) => {
        const testObject = {
            testValue: "",
        };

        applicationBuilder.useMiddleware(MyMiddleware, testObject);

        const requestDelegate = applicationBuilder.build();

        await requestDelegate(fetchContext);

        expect(testObject.testValue).toBe("/testpath");

        done();
    });
});
