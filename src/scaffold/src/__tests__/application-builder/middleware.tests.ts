import { IApplicationBuilder, IMiddleware, IServiceProvider, IServiceWorkerConfiguration, RequestDelegate } from "../../abstractions";
import { FetchEvent, Request, Response } from "../service-worker.mocks";
import { ApplicationBuilder } from "./../../application-builder/application-builder";
import "./../../application-builder/middleware-extensions";

class MyMiddleware implements IMiddleware {
    public next: RequestDelegate;
    public testObject: { testValue: string };

    constructor(next: RequestDelegate, testObject: { testValue: string }) {
        this.next = next;
        this.testObject = testObject;
    }

    public invokeAsync(fetchEvent: FetchEvent): Promise<Response> {
        this.testObject.testValue = fetchEvent.request.url;
        return this.next(fetchEvent);
    }
}

describe("Middleware tests", () => {
    let applicationBuilder: IApplicationBuilder;
    let fetchEvent: FetchEvent;

    beforeEach(() => {
        applicationBuilder = new ApplicationBuilder(null as unknown as IServiceWorkerConfiguration, null as unknown as IServiceProvider);
        applicationBuilder.defaultRequestDelegate = (f: FetchEvent) => Promise.resolve(new Response());
        fetchEvent = new FetchEvent(new Request("/testpath"));
    });

    test("basic", async done => {
        const testObject = {
            testValue: "",
        };

        applicationBuilder.useMiddleware(MyMiddleware, testObject);

        const requestDelegate = applicationBuilder.build();

        await requestDelegate(fetchEvent);

        expect(testObject.testValue).toBe("/testpath");

        done();
    });
});