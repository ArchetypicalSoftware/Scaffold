
# Scaffold

## IServiceWorkerBuilder

Defines an service worker initialization utility.

### Methods

```ts
// Configures the ILogger instance (optional)
configureLogging(configuration: (builder: ILoggingBuilder) => void): IServiceWorkerBuilder;

// Indicates which Startup class will build the services and fetch pipeline. This
// method must be called.
useStartup<T extends IStartup>(startupType: StartupFactory<T>): IServiceWorkerBuilder;

// Builds the service worker. This is intended to be the last step of the build process.
build(): void;
```

### Examples

```ts
Scaffold
    .createDefaultBuilder("1.0.0")
    .configureLogging((options) => options.logLevel = LogLevel.Info)
    .useStartup(Startup)
    .build();
```