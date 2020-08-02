
# Scaffold

## IServiceCollection

Specifies the contract for a collection of service descriptors.

### Properties

```ts
 // List of service descriptors describing the services and their lifetimes.
 serviceDescriptors: Map<string, IServiceDescriptor>
```

### Methods

```ts
// Defines a service that will be instantiated new every call
addTransient<T extends object>(key: string, factory: () => T): void

// Defines a service that will be instantiated once per fetch request
addScoped<T extends object>(key: string, factory: () => T): void

// Defines a service that will be instantiated once and used thereafter
addSingleton<T extends object>(key: string, factory: () => T): void

// Defines a configuration object available to middleware.
configure<T extends object>(optionsName: string, options: T): void
```

## Notes

`IServiceCollection` is available in the `configureServices` call of your `IStartup` implementation.
