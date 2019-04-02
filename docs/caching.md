# Scaffold

## Cache Strategies

Scaffold makes caching responses incredibly easy. Provided out of the box are five common cache strategies which are available on the `CacheStrategies` object.

### `backgroundFetch`

This strategy will immediately return a value from the cache if it exists. If a cache entry is found, a fetch for the latest version of the asset will occur in the background and update the cache. If a cache entry is not found, the request will respond with the fetch of the asset immediately after updating the cache.

```ts
const cache = await caches.open(key);
const response = await cache.match(fetchContext.request);

const fetchPromise = fetch(fetchContext.request).then(async (fetchResponse) => {
    await cache.put(fetchContext.request, fetchResponse.clone());
    return fetchResponse;
});

return response || fetchPromise;
```

### `cacheFirst`

This strategy will immediately return a value from the cache if it exists. If a cache entry is not found, the request will respond with the fetch of the asset immediately after updating the cache. Once an item is in the cache, there will be no subsequent requests to get the latest version.

```ts
 const cache = await caches.open(key);
let response = await cache.match(fetchContext.request);
if (!response) {
    response = await fetch(fetchContext.request);
    if (response.ok) {
        await cache.put(fetchContext.request, response.clone());
    }
}

return response;
```

### `cacheOnly`

This strategy will immediately return a value from the cache if it exists. No fetch requests will occur when this strategy is utilized.

```ts
const cache = await caches.open(key!);
return cache.match(fetchContext.request) as Promise<Response>;
```

### `networkFirst`

This strategy will attempt to fetch the asset from the source and will pass on the response if there is no error. In the case of an error, the strategy will attempt to find a match in the cache.

```ts
let response = await fetch(fetchContext.request);

if (!response.ok) {
    const cache = await caches.open(key!);
    response = await cache.match(fetchContext.request) as Response;
}

return response;
```

### `networkOnly`

This strategy only attempts to get the asset from the source. No caching of responses will occur when this strategy is utilized.

```ts
return fetch(fetchContext.request);
```

## Custom Cache Strategies

All of the pre-defined cache strategies implement the `CacheStrategy` type. To provide a custom caching strategy, just define a method matching the `CacheStrategy` signature.

```ts
/**
 * Defines a cache strategy delegate. 'key' defaults to service worker version.
 */
type CacheStrategy = (key?: string) => (fetchContext: IFetchContext) => Promise<Response>;
```

The `key` parameter is intended to specify a specific cache. While it defaults to the service worker `version`, any key can be provided utilizing the `ICacheConfiguration` object.

## See Also

* [IApplicationBuilder.cache](iapplication-builder.md)
* [IApplicationBuilder.cacheWhen](iapplication-builder.md)
* [Routing](routing.md)