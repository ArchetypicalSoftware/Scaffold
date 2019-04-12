
# Scaffold

## IMiddleware

Defines middleware that can be added to the application's request pipeline.

### Properties

```ts
// Next RequestDelegate to be called after local work is completed
next: RequestDelegate;
```

### Methods

```ts
// The logic of the middleware. This is called during the request pipeline.
invokeAsync(fetchContext: IFetchContext): Promise<IFetchContext>;
```

## MiddlewareFactory

Defines middleware constructor type

```ts
export type MiddlewareFactory<T extends IMiddleware> = { new(next: RequestDelegate, ...args: any[]): T; };
```

## Notes

`IMiddleware` and `MiddlewareFactory` are both used by the `useMiddleware` extension. You are able to provide any additional parameters to the constructor if they are required.

## See Also

* [`useMiddleware`](extensions.md)