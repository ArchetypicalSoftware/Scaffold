
# Scaffold

## IServiceWorkerBuilder

Defines an service worker initialization utility.

### Methods

```ts

// Indicates which Startup class will build the services and fetch pipeline. This
// method must be called.
useStartup<T extends IStartup>(startupType: StartupFactory<T>): IServiceWorkerBuilder;

// Builds the service worker. This is intended to be the last step of the build process.
build(): void;
```

### Examples

```ts
Scaffold
    .createBuilder("1.0.0")
    .useStartup(Startup)
    .build();
```
