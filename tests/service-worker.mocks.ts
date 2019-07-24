import { ICache, ICacheStorage, IFetchEvent, IRequest, IRequestInfo, IResponse } from "../src/abstractions";

// export class ResponseHeaders {
//     public append(name: string, value: string): void {}
//     public delete(name: string): void {}
//     public get(name: string): string | null { throw new Error(); }
//     public has(name: string): boolean { throw new Error(); }
//     public set(name: string, value: string): void { throw new Error(); }
//     public forEach(callbackfn: (value: string, key: string, parent: Headers) => void, thisArg?: any): void { throw new Error(); }
//     public keys(): IterableIterator<string> { throw new Error(); }
//     public entries(): IterableIterator<[string, string]> { throw new Error(); }
//     public values(): IterableIterator<string> { throw new Error(); }
//     public [Symbol.iterator]: () => IterableIterator<[string, string]> = () => this.entries();
// }

// export class RequestHeaders {
//     public append(name: string, value: string): void {}
//     public delete(name: string): void {}
//     public get(name: string): string | null { throw new Error(); }
//     public has(name: string): boolean { throw new Error(); }
//     public set(name: string, value: string): void { throw new Error(); }
//     public forEach(callbackfn: (value: string, key: string, parent: Headers) => void, thisArg?: any): void { throw new Error(); }
// }

// export class EventTarget {
//     public addEventListener(type: string, listener: EventListenerOrEventListenerObject | null,
//                             options?: boolean | AddEventListenerOptions): void { throw new Error(); }
//     public dispatchEvent(event: Event): boolean { throw new Error(); }
//     public removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null,
//                                options?: EventListenerOptions | boolean): void { throw new Error(); }
// }

// export class Body {
//     public body: ReadableStream<Uint8Array> | null = null;
//     public bodyUsed: boolean = false;
//     public arrayBuffer(): Promise<ArrayBuffer> { throw Error(); }
//     public blob(): Promise<Blob> { throw Error(); }
//     public formData(): Promise<FormData> { throw Error(); }
//     public json(): Promise<any> { throw Error(); }
//     public text(): Promise<string> { throw Error(); }
// }

// export class AbortSignal extends EventTarget {
//     /**
//      * Returns true if this AbortSignal's AbortController has signaled to abort, and false
//      * otherwise.
//      */
//     public aborted: boolean = false;
//     public onabort: ((this: AbortSignal, ev: Event) => any) | null = null;
//     public addEventListener<K extends keyof AbortSignalEventMap>(type: K, listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => any,
//                                                                  options?: boolean | AddEventListenerOptions): void;
//     public addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
//     public addEventListener() { throw new Error(); }
//     public removeEventListener<K extends keyof AbortSignalEventMap>(type: K, listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => any, 
//                                                                     options?: boolean | EventListenerOptions): void;
//     public removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
//     public removeEventListener() { throw new Error(); }
// }

// export class Request extends Body {

//     public url: string = "";
//     public cache: RequestCache = "default";
//     public credentials: RequestCredentials = "omit";
//     public destination: RequestDestination = "audio";
//     public headers: Headers = new ResponseHeaders();
//     public integrity: string = "";
//     public isHistoryNavigation: boolean = false;
//     public isReloadNavigation: boolean = false;
//     public keepalive: boolean = false;
//     public method: string = "GET";
//     public mode: RequestMode = "navigate";
//     public redirect: RequestRedirect = "follow";
//     public referrer: string = "";
//     public referrerPolicy: ReferrerPolicy = "no-referrer";
//     public signal: AbortSignal = new AbortSignal();
//     constructor(url: string) {
//         super();
//         this.url = url;
//     }
//     public clone(): Request { return this; }
// }

// export class Response extends Body {
//     public headers: Headers = new ResponseHeaders();
//     public ok: boolean = false;
//     public redirected: boolean = false;
//     public status: number = 0;
//     public statusText: string = "";
//     public trailer: Promise<Headers> = Promise.resolve(new ResponseHeaders());
//     public type: ResponseType = "basic";
//     public url: string = "";
//     public clone(): Response { throw Error(); }
//     // public error(): Response  { throw Error(); }
//     // public redirect(url: string, status?: number): Response  { throw Error(); }
// }

// export class Event {
//     public bubbles: boolean = true;
//     public cancelBubble: boolean = true;
//     public cancelable: boolean = false;
//     public composed: boolean = true;
//     public currentTarget: EventTarget | null = null;
//     public defaultPrevented: boolean = false;
//     public eventPhase: number = 0;
//     public isTrusted: boolean = true;
//     public returnValue: boolean = true;
//     public target: EventTarget | null = null;
//     public timeStamp: number = 0;
//     public type: string = "";
//     public AT_TARGET: number = 0;
//     public BUBBLING_PHASE: number = 0;
//     public CAPTURING_PHASE: number = 0;
//     public NONE: number = 0;
//     public srcElement!: Element;
//     public composedPath(): EventTarget[] { return []; }
//     public initEvent(type: string, bubbles?: boolean, cancelable?: boolean): void {}
//     public preventDefault(): void {}
//     public stopImmediatePropagation(): void {}
//     public stopPropagation(): void {}
// }

// export class ExtendableEvent extends Event {
//     constructor() {
//         super();
//     }

//     public waitUntil(f: Promise<any>): void {}
// }

// export class FetchEvent extends ExtendableEvent {

//     public clientId: string = "";
//     public preloadResponse: Promise<any> = Promise.resolve();
//     public request: Request;
//     public resultingClientId: string = "";
//     public targetClientId: string = "";
//     public replacesClientId: string = "";
//     public srcElement!: Element;
//     constructor(request: Request) {
//         super();
//         this.request = request;
//     }
//     // tslint:disable-next-line:no-empty
//     public respondWith(r: Promise<Response>): void {}
// }

export class Response implements IResponse {

}

export class Request implements IRequest {
    public url: string = "";    
    public method: string = "";

    constructor(url: string) {
        this.url = url;
        this.method = "GET";
    }
}

export class FetchEvent implements IFetchEvent {
    public request: IRequest;        
    
    constructor(url: string) {
        this.request = new Request(url);
    }

    // tslint:disable-next-line:no-empty
    public respondWith(response: Promise<IResponse>): void { }
}

// @ts-ignore
export class MockCacheStorage implements ICacheStorage {
    public cacheMap = new Map<string, ICache>();
    public map = new Map<string, IResponse>();

    public delete(cacheName: string): Promise<boolean> {
        return Promise.resolve(true);
    }    

    public has(cacheName: string): Promise<boolean> {
        return Promise.resolve(this.map.has(cacheName));
    }
    
    public keys(): Promise<string[]> {
        return Promise.resolve([...this.map.keys()]);
    }

    // @ts-ignore
    public match(request: IRequestInfo, options?: CacheQueryOptions): Promise<IResponse> {
        // @ts-ignore
        return Promise.resolve(this.map.get(request as string));
    }
    
    public open(cacheName: string): Promise<ICache> {
        if (!this.cacheMap.has(cacheName)) {
            // @ts-ignore
            this.cacheMap.set(cacheName, new MockCache());
        }

        // @ts-ignore
        return Promise.resolve(this.cacheMap.get(cacheName));
    }
}

// @ts-ignore
export class MockCache implements ICache {
    public map: Map<IRequest, IResponse> = new Map<IRequest, IResponse>();

    public add(request: IRequestInfo): Promise<void> {
        return Promise.resolve();
    }    
    
    public addAll(requests: IRequestInfo[]): Promise<void> {
        return Promise.resolve();
    }

    public delete(request: IRequestInfo, options?: CacheQueryOptions): Promise<boolean> {
        return Promise.resolve(true);
    }

    public keys(request?: IRequestInfo, options?: CacheQueryOptions): Promise<readonly IRequest[]> {
        return Promise.resolve([...this.map.keys()]);
    }

    // @ts-ignore
    public match(request: IRequestInfo, options?: CacheQueryOptions): Promise<IResponse> {
        // @ts-ignore
        return Promise.resolve(this.map.get(request as IRequest));
    }

    public matchAll(request?: IRequestInfo, options?: CacheQueryOptions): Promise<readonly IResponse[]> {
        return Promise.resolve([]);
    }

    public put(request: IRequestInfo, response: IResponse): Promise<void> {
        return Promise.resolve();
    }
}
