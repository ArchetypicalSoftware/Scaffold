# Scaffold

## Custom Extensions

Scaffold is built from the ground up as an extensible library. In fact, most of the capabilities provided in the base library are implemented as extensions themselves. This section is intended to provide instructions on how to extend the base library for your customized logic.

## Extending an existing module

This strategy is largely based upon the details found [here](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) under the Module Augmentation section.

Let's take a look at an example:

```ts
// foo-extensions.ts

import { ILogger } from "@archetypical/scaffold/lib/index"
import { IApplicationBuilder, ApplicationBuilder } from "@archetypical/scaffold/lib/application-builder"

declare module "@archetypical/scaffold/lib/application-builder" {
    interface IApplicationBuilder {
        useFoo(): IApplicationBuilder;
    }

    interface ApplicationBuilder {
        useFoo(): IApplicationBuilder;
    }
}

ApplicationBuilder.prototype.useFoo = function (): IApplicationBuilder {
    const logger = this.services.getInstance<ILogger>("ILogger");
    logger.debug("Go go gadget foo!");
    return this;
}

// sw.ts

import { IApplicationBuilder } from "@archetypical/scaffold/lib/application-builder"
import "./foo-extensions"

class Startup {
    public configure(builder: IApplicationBuilder): void {
        builder.useFoo();
    }
}
```

Let's break this down a bit.

### Step 1: Import

```ts
// foo-extensions.ts

import { IApplicationBuilder, ApplicationBuilder } from "@archetypical/scaffold/lib/application-builder"
```

Import the type you want in extend. In this case we are extending `IApplicationBuilder` so we'll want to pull in both the interface and concrete type.

### Step 2: Declare

```ts
// foo-extensions.ts continued...

declare module "@archetypical/scaffold/lib/application-builder" {
    interface IApplicationBuilder {
        useFoo(): IApplicationBuilder;
    }

    interface ApplicationBuilder {
        useFoo(): IApplicationBuilder;
    }
}
```

Extend the interfaces with the new properties or methods under declared modules. Note that while `ApplicationBuilder` in this example is actually a concrete type, it is defined as an interface within the declared module.

### Step 3: Extend

```ts
// foo-extensions.ts continued...

ApplicationBuilder.prototype.useFoo = function (): IApplicationBuilder {
    const logger = this.services.getInstance<ILogger>("ILogger");
    logger.debug("Go go gadget foo!");
    return this;
}
```

Provide the actual implementation of your extension.

### Step 4: Import your extension

```ts
// sw.ts

import { IApplicationBuilder } from "@archetypical/scaffold/lib/application-builder"
import "./foo-extensions"
```

Import the extension file you created where you want to utilize it.

### Step 5: Profit!

```ts
// sw.ts

builder.useFoo();
```

You can now reference the extension you created as if it was a method on the originally declared object.

## See Also

* [ApplicationBuilder extensions](application-builder/extensions.md)