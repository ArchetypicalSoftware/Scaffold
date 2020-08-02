# Application Builder

Defines a class that provides the mechanisms to configure an application's request pipeline.

## Properties

```ts
// Hosting environment
env: IHostingEnvironment;

// Service provider used by middleware to obtain service instances
services: IServiceProvider;
```

## Methods

```ts
// Sets an object to be shared between middleware implementations
setProperty<T extends object>(key: string, value: T): void;

// Gets an object to be shared between middleware implementations
getProperty<T extends object>(key: string): T;

// Clones the current instance of an IApplicationBuilder
clone(): IApplicationBuilder;

// Builds the request pipeline
build(): Swork;

// Adds a middleware to the request pipeline
use(middleware: Middleware): IApplicationBuilder;

// Adds a middleware to the request pipeline that executes when the predicate returns true
useWhen(predicate: (fetchContext: FetchContext) => boolean | Promise<boolean>,
        middleware: Middleware): IApplicationBuilder;

// Claims all available clients
useClaimClients(): IApplicationBuilder;

// Clears cache entries of previous worker versions
useClearCacheOnUpdate(options: ICacheClearOptions): IApplicationBuilder;

// Caches the assets on install
useInstallCache(urlsToCache: string[], cacheKey?: string): IApplicationBuilder;

// Adds a middleware that executes on a matching request
map(path: string | string[],
    middleware: Middleware,
    settings?: IRouteConfiguration): IApplicationBuilder;

// Adds a middleware that executes on a matching request and predicate
mapWhen(path: string | string[],
        predicate: (fetchContext: FetchContext) => boolean | Promise<boolean>,
        middleware: Middleware,
        settings?: IRouteConfiguration): IApplicationBuilder;

// Adds a middleware to log every request to the console
useLogging(useInProduction?: boolean): IApplicationBuilder;
```
