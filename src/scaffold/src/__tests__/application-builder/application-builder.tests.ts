import { ApplicationBuilder }  from './../../application-builder/application-builder'
import { RequestDelegate, IApplicationBuilder, IServiceProvider, IServiceWorkerConfiguration } from "../../abstractions"
import { FetchEvent, Request, Response } from '../service-worker.mocks'

describe('Application Builder tests', () => {
    let applicationBuilder: IApplicationBuilder;
    let fetchEvent: FetchEvent;

    beforeEach(() => {
        applicationBuilder = new ApplicationBuilder(null as unknown as IServiceWorkerConfiguration, null as unknown as IServiceProvider);
        applicationBuilder.defaultRequestDelegate = (f: FetchEvent) => Promise.resolve(new Response);
        fetchEvent = new FetchEvent(new Request('/testpath'));
    });

    test('use', async done => {
        let result = '';

        applicationBuilder.use((requestDelegate: RequestDelegate) => {
            return async (f: FetchEvent) => {
                result = f.request.url;
                return requestDelegate(f);
            };
        });

        const r = applicationBuilder.build();
        await r(fetchEvent);
        expect(result).toBe(fetchEvent.request.url);

        done();
    });

    test('run', async done => {
        let result = '';

        applicationBuilder.run((f: FetchEvent) => {
            result = f.request.url;
            return Promise.resolve(new Response());
        });

        const r = applicationBuilder.build();
        await r(fetchEvent);
        expect(result).toBe(fetchEvent.request.url);

        done();
    });

    test('useFunc', async done => {
        let result = '';

        applicationBuilder.useNext((f: FetchEvent, next: () => Promise<Response>) => {
            result = f.request.url;
            return next();
        });

        const r = applicationBuilder.build();
        await r(fetchEvent);
        expect(result).toBe(fetchEvent.request.url);

        done();
    });

    test('getProperty/setProperty', () => {
        const date = new Date();
        applicationBuilder.setProperty('key', date);
        const result = applicationBuilder.getProperty('key');
        expect(result).toEqual(date);
    });

    test('nested use', async done => {
        const results: string[] = [];

        applicationBuilder.use((requestDelegate: RequestDelegate) => {
            return async (fetchEvent: FetchEvent) => {
                results.push('result1');
                return await requestDelegate(fetchEvent);
            };
        });

        applicationBuilder.useNext(async (fetchEvent: FetchEvent, next: () => Promise<Response>) => {
            results.push('result2');
            return await next();
        });

        applicationBuilder.run(async (fetchEvent: FetchEvent) => {
            results.push('result3');
            return Promise.resolve(new Response());
        });

        const requestDelegate = applicationBuilder.build();
        await requestDelegate(fetchEvent);

        expect(results.length).toBe(3);
        expect(results[0]).toBe('result1');
        expect(results[1]).toBe('result2');
        expect(results[2]).toBe('result3');

        done();
    });
});
