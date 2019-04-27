# Scaffold

## IStartup

The `IStartup` interface represents a class that configures services and the app's fetch pipeline.

## Methods

```ts
// Configures the fetch request pipeline.
configure(applicationBuilder: IApplicationBuilder, logger?: ILogger): void;

// Configures any services
configureServices?(services: IServiceCollection, logger?: ILogger): void;
```

The `IStartup` implementation is used in the `UseStartup<T>` method of `IServiceWorkerBuilder`.

The `configureServices` is an optional method intended to define any services used during the fetch pipeline.

The `configure` method defines the fetch pipeline by using the `IApplicationBuilder` extension methods.

## Examples

```ts
const offlineAssets = [
    ...
];

class Startup implements IStartup {
    public configure(applicationBuilder: IApplicationBuilder, logger?: ILogger): void {
        applicationBuilder
            .useInstallCache(offlineAssets)
            .cache(offlineAssets, CacheStrategies.backgroundFetch);

    }
}

Scaffold
    .createDefaultBuilder("1.0.0")
    .useStartup(Startup)
    .build();
```