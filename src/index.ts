// Application Builder

import { IApplicationBuilder, ICacheClearOptions, IFetchContext, IMiddleware, IRouteVariables, 
    LogLevel, MiddlewareFactory, RequestDelegate } from "./abstractions";
import { ApplicationBuilder } from "./application-builder/application-builder";
import "./application-builder/cache-extensions";
import "./application-builder/claim-clients-extensions";
import "./application-builder/clear-cache-on-update-extensions";
import "./application-builder/install-cache-extensions";
import "./application-builder/map-extensions";
import "./application-builder/middleware-extensions";
import "./application-builder/use-when-extensions";

export { IFetchContext, IApplicationBuilder, IMiddleware, MiddlewareFactory, RequestDelegate, ApplicationBuilder, 
    IRouteVariables, ICacheClearOptions, LogLevel };

// Service Collection

import { IServiceCollection, IServiceProvider } from "./abstractions";
import "./service-collection/configure-extension";
import { ServiceCollection } from "./service-collection/service-collection";

export { IServiceCollection, IServiceProvider, ServiceCollection };

// Hosting

import { IServiceWorkerBuilder, IStartup, StartupFactory } from "./abstractions";
import { ServiceWorker } from "./hosting/service-worker";

export { IServiceWorkerBuilder, IStartup, StartupFactory, ServiceWorker };

// Logging

import { ILogger, ILoggingBuilder } from "./abstractions";

export { ILogger, ILoggingBuilder };

// Cache Strategies

import { CacheStrategy } from "./abstractions";
import { CacheStrategies } from "./cache-strategies/cache-strategies";

export { CacheStrategy, CacheStrategies };
