# Scaffold

## IApplicationLifetime

Represents a type used to define event handlers for the `install` and `activate` events. The instance is available from `services` property on `IApplicationBuilder`. 

### Properties

```ts
// IEventToken for the Activate lifetime event
activating: IEventToken;

// IEventToken for the Install lifetime event
installing: IEventToken;
```

## IEventToken

Represents a type used to register an event.

### Methods

```ts
// Register a callback for this event.
register(handler: (event: ExtendableEvent) => Promise<void>): void;
```

## Examples

```ts
 const lifetime = this.services.getInstance<IApplicationLifetime>("IApplicationLifetime");

 lifetime.installing.register(async () => {
     console.log("I'm an install event!");
 });

 lifetime.activating.register(async () => {
     console.log("I'm an activate event!");
 });
```

## See Also

* [`IApplicationBuilder`](application-builder/iapplication-builder.md)