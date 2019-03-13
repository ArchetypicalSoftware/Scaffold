import { ApplicationBuilder } from './../../application-builder/application-builder'
import "../../application-builder/map-extensions"
import { IApplicationBuilder, RequestDelegate, IMiddleware, IServiceProvider, IServiceWorkerConfiguration } from "../../abstractions"
import { FetchEvent, Request, Response } from '../service-worker.mocks'

describe('Map tests', () => {
    let applicationBuilder: IApplicationBuilder;
    let fetchEvent: FetchEvent;

    beforeEach(() => {
        applicationBuilder = new ApplicationBuilder({ origin: 'http://www.example.com' } as IServiceWorkerConfiguration, null as unknown as IServiceProvider);
        applicationBuilder.defaultRequestDelegate = (f: FetchEvent) => Promise.resolve(new Response);
        fetchEvent = new FetchEvent(new Request('http://www.example.com/testpath'));
    });

    test('basic', async done => {
        const result: string[] = [];

        applicationBuilder.map('/testpath', app => {
            app.run((f: FetchEvent) => {
                result.push('match');
                return Promise.resolve(new Response());
            });
        });

        applicationBuilder.map('/testpath2', app => {
            app.run((f: FetchEvent) => {
                result.push('nomatch');
                return Promise.resolve(new Response());
            });
        });

        applicationBuilder.map('/testpat', app => {
            app.run((f: FetchEvent) => {
                result.push('nomatch');
                return Promise.resolve(new Response());
            });
        });

        const requestDelegate = applicationBuilder.build();

        await requestDelegate(fetchEvent);

        expect(result.length).toBe(1);
        expect(result[0]).toBe('match');

        done();
    });
});