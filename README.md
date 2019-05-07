# Scaffold

![Scaffold](docs/images/Scaffold.png)

Scaffold is an extensible library designed to quickly build service workers modeled after the .NET core middleware pipeline. Scaffold simplifies many of the common use cases to single function calls while allowing developers to expand and define functionality to suit their application's needs.

Example implementation

```ts
// service-worker.ts

import { IApplicationBuilder, IStartup, Scaffold, CacheStrategies } from "@archetypical/scaffold"

// List of assets necessary for offline capability
const offlineAssets = [
    "/css/site.css",
    "/js/site.js",
    "/"
];

class Startup implements IStartup {
    configure(applicationBuilder: IApplicationBuilder): void {
        applicationBuilder
            // Fetch assets on install
            .useInstallCache(offlineAssets)
            // Background update assets when requested
            .cache(offlineAssets, CacheStrategies.backgroundFetch);
    }
}

Scaffold
    .createDefaultBuilder("1.0.0")
    .useStartup(Startup)
    .build();
```

In the example above, we were able to quickly define a list of assets that should be cached up on install of the service worker. In addition, each new request for those assets will immediately return the cached response and update the cache with the latest version in a background process.
