export class ResponseHeaders {
    public append(name: string, value: string): void {}
    public delete(name: string): void {}
    public get(name: string): string | null { throw new Error(); }
    public has(name: string): boolean { throw new Error(); }
    public set(name: string, value: string): void { throw new Error(); }
    public forEach(callbackfn: (value: string, key: string, parent: Headers) => void, thisArg?: any): void { throw new Error(); }
    public keys(): IterableIterator<string> { throw new Error(); }
    public entries(): IterableIterator<[string, string]> { throw new Error(); }
    public values(): IterableIterator<string> { throw new Error(); }
    public [Symbol.iterator]: () => IterableIterator<[string, string]> = () => this.entries();
}

export class RequestHeaders {
    public append(name: string, value: string): void {}
    public delete(name: string): void {}
    public get(name: string): string | null { throw new Error(); }
    public has(name: string): boolean { throw new Error(); }
    public set(name: string, value: string): void { throw new Error(); }
    public forEach(callbackfn: (value: string, key: string, parent: Headers) => void, thisArg?: any): void { throw new Error(); }
}

export class EventTarget {
    public addEventListener(type: string, listener: EventListenerOrEventListenerObject | null,
                            options?: boolean | AddEventListenerOptions): void { throw new Error(); }
    public dispatchEvent(event: Event): boolean { throw new Error(); }
    public removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null,
                               options?: EventListenerOptions | boolean): void { throw new Error(); }
}

export class Body {
    public body: ReadableStream<Uint8Array> | null = null;
    public bodyUsed: boolean = false;
    public arrayBuffer(): Promise<ArrayBuffer> { throw Error(); }
    public blob(): Promise<Blob> { throw Error(); }
    public formData(): Promise<FormData> { throw Error(); }
    public json(): Promise<any> { throw Error(); }
    public text(): Promise<string> { throw Error(); }
}

export class AbortSignal extends EventTarget {
    /**
     * Returns true if this AbortSignal's AbortController has signaled to abort, and false
     * otherwise.
     */
    public aborted: boolean = false;
    public onabort: ((this: AbortSignal, ev: ProgressEvent) => any) | null = null;
    public addEventListener<K extends keyof AbortSignalEventMap>(type: K, listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => any,
                                                                 options?: boolean | AddEventListenerOptions): void;
    public addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    public addEventListener() { throw new Error(); }
    public removeEventListener<K extends keyof AbortSignalEventMap>(type: K, listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => any, 
                                                                    options?: boolean | EventListenerOptions): void;
    public removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    public removeEventListener() { throw new Error(); }
}

export class Request extends Body {

    public url: string = "";
    public cache: RequestCache = "default";
    public credentials: RequestCredentials = "omit";
    public destination: RequestDestination = "audio";
    public headers: Headers = new RequestHeaders();
    public integrity: string = "";
    public isHistoryNavigation: boolean = false;
    public isReloadNavigation: boolean = false;
    public keepalive: boolean = false;
    public method: string = "GET";
    public mode: RequestMode = "navigate";
    public redirect: RequestRedirect = "follow";
    public referrer: string = "";
    public referrerPolicy: ReferrerPolicy = "origin-only";
    public signal: AbortSignal = new AbortSignal();
    constructor(url: string) {
        super();
        this.url = url;
    }
    public clone(): Request { return this; }
}

export class Response extends Body {
    public headers: Headers = new ResponseHeaders();
    public ok: boolean = false;
    public redirected: boolean = false;
    public status: number = 0;
    public statusText: string = "";
    public trailer: Promise<Headers> = Promise.resolve(new ResponseHeaders());
    public type: ResponseType = "basic";
    public url: string = "";
    public clone(): Response { throw Error(); }
    // public error(): Response  { throw Error(); }
    // public redirect(url: string, status?: number): Response  { throw Error(); }
}

export class Event {
    public bubbles: boolean = true;
    public cancelBubble: boolean = true;
    public cancelable: boolean = false;
    public composed: boolean = true;
    public currentTarget: EventTarget | null = null;
    public defaultPrevented: boolean = false;
    public eventPhase: number = 0;
    public isTrusted: boolean = true;
    public returnValue: boolean = true;
    public target: EventTarget | null = null;
    public timeStamp: number = 0;
    public type: string = "";
    public AT_TARGET: number = 0;
    public BUBBLING_PHASE: number = 0;
    public CAPTURING_PHASE: number = 0;
    public NONE: number = 0;
    public composedPath(): EventTarget[] { return [] }
    public initEvent(type: string, bubbles?: boolean, cancelable?: boolean): void {}
    public preventDefault(): void {}
    public stopImmediatePropagation(): void {}
    public stopPropagation(): void {}
}

export class ExtendableEvent extends Event {
    constructor() {
        super();
    }

    public waitUntil(f: Promise<any>): void {}
}

export class FetchEvent extends ExtendableEvent {

    public clientId: string = "";
    public preloadResponse: Promise<any> = Promise.resolve();
    public request: Request;
    public resultingClientId: string = "";
    public targetClientId: string = "";
    constructor(request: Request) {
        super();
        this.request = request;
    }
    // tslint:disable-next-line:no-empty
    public respondWith(r: Promise<Response>): void {}
}
