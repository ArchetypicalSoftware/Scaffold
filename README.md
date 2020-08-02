# Scaffold

![Scaffold](docs/images/Scaffold.png)

Scaffold is an library designed to quickly build service workers modeled after the .NET core middleware pipeline.

Example implementation

```ts
// service-worker.ts

import { IApplicationBuilder, Scaffold } from "@archetypical/scaffold";
import { strategies } from "swork-cache";

const offlineAssets = ["/css/site.css", "/js/site.js", "/"];

class Startup {
    public configure(builder: IApplicationBuilder): void {
        builder
            .useInstallCache(offlineAssets)
            .map(offlineAssets, strategies.backgroundFetch());
    }
}

Scaffold
    .createBuilder("1.0.0")
    .useStartup(Startup)
    .build();
```

In the example above, we were able to quickly define a list of assets that should be cached up on install of the service worker. In addition, each new request for those assets will immediately return the cached response and update the cache with the latest version in a background process.

* [Overview](readme.md)
* [IApplicationBuilder](docs/iapplication-builder.md)
* [IServiceCollection](docs/iservice-collection.md)
* [IServiceProvider](docs/iservice-provider.md)
* [IServiceWorkerBuilder](docs/iservice-worker-builder.md)
* [IApplicationLifetime](docs/iapplication-lifetime.md)
* [Startup](docs/startup.md)
