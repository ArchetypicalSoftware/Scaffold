# IApplication Builder Extensions

* [`cache`](#cache)
* [`cacheWhen`](#cacheWhen)
* [`map`](#map)
* [`mapWhen`](#mapWhen)
* [`run`](#run)
* [`useMiddleware`](#useMiddleware)
* [`useNext`](#useNext)
* [`useWhen`](#useWhen)
* [`useClaimClients`](#useClaimClients)
* [`useClearCacheOnUpdate`](#useClearCacheOnUpdate)
* [`useInstallCache`](#useInstallCache)

## `cache`

The `cache` extension defines a caching strategy to be used when a route is matched.

```ts
/**
 * Defines the cache strategy for requests that match the provided route(s).
 *
 * @param path route(s) to match
 * @param cacheStrategy cache strategy to be used
 * @param [settings] configuration options
 */
cache(path: string | string[],
      cacheStrategy: CacheStrategy,
      settings?: ICacheConfiguration): IApplicationBuilder;
```

Examples

```ts
builder.cache(["/css/site.css", "/**/*.js"], CacheStrategies.cacheFirst);

builder.cache("/Home/Data", CacheStrategies.backgroundFetch, {
    cacheKey: "1.0.0-data"
});
```

## `cacheWhen`

The `cacheWhen` extension defines a caching strategy to be used when a route is matched and the predicate returns true.

```ts
/**
 * Defines the cache strategy for requests that match the provided route(s) and predicate.
 *
 * @param path route(s) to match
 * @param predicate predicate to further evaluate request
 * @param cacheStrategy cache strategy to be used
 * @param [settings] configuration options
 */
cacheWhen(path: string | string[],
          predicate: (fetchContext: IFetchContext, routeVariables: IRouteVariables) => boolean,
          cacheStrategy: CacheStrategy,
          settings?: ICacheConfiguration): IApplicationBuilder;
```

Examples

```ts
builder.cacheWhen("/css/{fileName}.css",
    (fetchContext, routeVariables) => routeVariables.path.get("fileName").toLowerCase() === "site",
    CacheStrategies.cacheFirst);
```

## `map`

The `map` extension defines a terminal execution path for when a route matches.

```ts
/**
 * A terminal handler execute when a provided route matches
 * 
 * @param path path route(s) to match
 * @param configuration execution path on match
 * @param settings configuration options
 */
map(path: string | string[],
    configuration: (applicationBuilder: IApplicationBuilder) => void,
    settings?: IRouteConfiguration): IApplicationBuilder;
```

Examples

```ts
builder.map(["/css/site.css", "/**/*.js"], (applicationBuilder) => {
    applicationBuilder.run((fetchContext: FetchContext) => {
        // Do something awesome here.
    });
});

builder.map("/Home/Data",
    (applicationBuilder) => {
        applicationBuilder.run((fetchContext: FetchContext) => {
            // Do something awesome here.
        });
    }, {
        methods: ["POST"]
    });
```

## `mapWhen`

The `map` extension defines a terminal execution path for when a route and predicate matches.

```ts
/**
 * A terminal handler execute when a provided route and predicate matches
 * 
 * @param path path route(s) to match
 * @param predicate predicate to further evaluate request
 * @param configuration execution path on match
 * @param settings configuration options
 */
mapWhen(path: string | string[],
        predicate: (fetchContext: IFetchContext, routeVariables: RouteVariables) => boolean,
        configuration: (applicationBuilder: IApplicationBuilder) => void,
        settings?: IRouteConfiguration): IApplicationBuilder;
```

Examples

```ts
builder.mapWhen("/Home/{action}",
    (fetchContext, routeVariables) => routeVariables.path.get("action") !== "Index",
    (applicationBuilder) => {
        applicationBuilder.run((fetchContext: FetchContext) => {
            // Do something awesome here.
        });
    });
```

## `run`

The `run` extension builds a terminal execution path.

```ts
/**
 * Builds a terminal handler that always executes
 * 
 * @param handler configuration handler
 */
run(handler: RequestDelegate): IApplicationBuilder;
```

Examples

```ts
builder.run(async (fetchContext: FetchContext) => {
    fetchContext.response = new Promise((resolve) => {
        const response = new Response("", { status: 404 });
        response.url = fetchContext.request.url;
        resolve(response);
    });

    return Promise.resolve(fetchContext);
});
```

## `useMiddleware`

The `useMiddleware` extension creates a pass through middleware that utilizes an `IMiddleware` instance. Additional parameters can be provided to the middleware constructor if required.

```ts
/**
 * Build a middleware utilizing a type implementing IMiddleware
 *
 * @template T Type implementing IMiddleware
 * @param middlewareType Constructor of type T
 * @param params Additional parameters to be provided during T's construction
 */
useMiddleware<T extends IMiddleware>(middlewareType: MiddlewareFactory<T>, ...params: any[]): IApplicationBuilder;
```

Examples

```ts
// Middleware class definition
class MyMiddleware implements IMiddleware {
    public next: RequestDelegate;
    public helper: MyHelper;

    constructor(next: RequestDelegate, helper: MyHelper) {
        this.next = next;
        this.helper = helper;
    }
}

// In Startup.configure
builder.useMiddleware(MyMiddleware, new MyHelper());

```

## `useNext`

The `useNext` extension creates a pass through middleware. It is expected to call the provided `next` request delegate when you are done with your work.

```ts
/**
 * Creates a pass through middleware
 * 
 * @param middleware execution handler 
 */
useNext(middleware: (fetchContext: IFetchContext,
                     next: () => Promise<IFetchContext>) => Promise<IFetchContext>): ApplicationBuilder;
```

Examples

```ts
builder.useNext((fetchContext, next) => {
    let response: Response;

    try {
        response = await next();
    } catch (error) {
        api.logError(fetchContext, error);
        throw(error);
    }

    return response;
})
```

## `useWhen`

Defines a pass through middleware used when the predicate returns `true`

```ts
/**
 * Defines a pass through middleware used when the predicate returns true
 *
 * @param {(fetchContext: IFetchContext) => boolean} predicate
 * @param {(applicationBuilder: IApplicationBuilder) => void} configuration
 */
useWhen(predicate: (fetchContext: IFetchContext) => boolean,
        configuration: (applicationBuilder: IApplicationBuilder) => void): IApplicationBuilder;
```

Examples

```ts
builder.useWhen((fetchContext: IFetchContext) => fetchContext.url.pathname.indexOf("/api/v1") !== -1,
    (builder: IApplicationBuilder) => {
        builder.run((fetchContext: IFetchContext) => {
            fetchContext.response = new Promise((resolve) => {
                fetchContext.log(LogLevel.Warn, "'/api/v1' is obsolete. Please use '/api/v2'");
                const response = new Response("", { status: 404 });
                response.url = fetchContext.request.url;
                resolve(response);
            })
        });
    });
```

## `useClaimClients`

The `useClaimClients` extension attempts to automatically claim any available clients once the service worker is in scope. This is accomplished by calling `self.skipWaiting` during installation and `clients.claim` during activation.

```ts
/**
 * Attempt to claim all available clients within scope
 */
useClaimClients(): IApplicationBuilder;
```

Examples

```ts
builder.useClaimClients();
```

## `useClearCacheOnUpdate`

The `useClearCacheOnUpdate` extension clears any entries not indicated on the whitelist. By default, the whitelist includes the `version` of the service worker provided to the `Scaffold.createDefaultBuilder` method.

```ts
/**
 * Clears any entries not on the whitelist
 *
 * @param {ICacheClearOptions} options
 */
useClearCacheOnUpdate(options: ICacheClearOptions): IApplicationBuilder;
```

Examples

```ts
// Use the version of service worker as cache key whitelist
builder.useClearCacheOnUpdate();

// Overwrite the cache whitelist
builder.useClearCacheOnUpdated({
    whitelist: ["v1.0.0-data", "v1.0.0-static"]
});
```

## `useInstallCache`

The `useInstallCache` extension fetches and caches any provided assets during install event. The default `cacheKey` is the service worker version provided to `Scaffold.createDefaultBuilder` method but can be overridden if necessary.

```ts
/**
 * Fetches and caches the provided assets
 *
 * @param {string[]} urlsToCache List of asset urls to cache
 * @param {string} [cacheKey] Key to cache under
 */
useInstallCache(urlsToCache: string[], cacheKey?: string): IApplicationBuilder;
```

Examples

```ts
const startupAssets = [
    "/"
    "/js/app.js",
    "/css/app.css",
]

// Using the default cacheKey
builder.useInstallCache(startupAssets);

// Overriding the default cacheKey
builder.useInstallCache(startupAssets, "v1.0.0-startup-assets");
```

## See Also

* [Caching](../caching.md)
* [Routing](../routing.md)