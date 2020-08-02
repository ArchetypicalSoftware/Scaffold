
# Scaffold

## IServiceProvider

Defines a mechanism for retrieving a service object; that is, an object that provides custom support to other objects.

### Methods

```ts
// Returns an instance of type T associated with the private key.
 getInstance<T extends object>(key: string): T;
```

## Notes

The `IServiceProvider` instance is available on the `services` property of  `IApplicationBuilder` and `IFetchContext`.