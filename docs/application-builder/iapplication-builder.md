# Application Builder

Defines a class that provides the mechanisms to configure an application's request pipeline.

## Properties

```ts
// The final RequestDelegate to be called when no other RequestDelegates
// terminate the request pipeline
defaultRequestDelegate: RequestDelegate;

// Service worker configuration object
config: IServiceWorkerConfiguration;

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
build(): RequestDelegate;

// Adds a pass through a middleware
use(middleware: (requestDelegate: RequestDelegate) => RequestDelegate): IApplicationBuilder;
```

## Extensions

Many components of Scaffold were intended to be extended upon, including `IApplicationBuilder`. The following extension methods are built into the Scaffold library:

* [cache](extensions.md#cache)
* [cacheWhen](extensions.md#cacheWhen)
* [map](extensions.md#map)
* [mapWhen](extensions.md#mapWhen)
* [run](extensions.md#run)
* [useMiddleware](extensions.md#useMiddleware)
* [useNext](extensions.md#useNext)
* [useWhen](extensions.md#useWhen)
* [useClaimClients](extensions.md#useClaimClients)
* [useClearCacheOnUpdate](extensions.md#useClearCacheOnUpdate)
* [useInstallCache](extensions.md#useInstallCache)
