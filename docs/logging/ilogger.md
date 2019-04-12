# Scaffold

## ILogger

Represents a type used to perform logging.

## Properties

```ts
// The current log level
logLevel: LogLevel;

// If the logger currently supports debug logs
isDebug: boolean;

// If the logger currently supports info logs
isInfo: boolean;

// If the logger currently supports warn logs
isWarn: boolean;
```

## Methods

```ts
// Logs a debug level message
debug(message: string): void;

// Logs an info level message
info(message: string): void;

// Logs a warn level message
warn(message: string): void;

// Logs an error level message
error(message: string): void;

// Starts a group
group(title: string, message?: string, logLevel?: LogLevel): void;

// Starts a collapsed group
groupCollapsed(title: string, message?: string, logLevel?: LogLevel): void;

// Ends a (collapsed) group
groupEnd(): void;
```

## See Also

* [Logging](logging.md)
