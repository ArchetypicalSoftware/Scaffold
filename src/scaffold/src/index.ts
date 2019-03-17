import { FetchContext, IApplicationBuilder, ICacheClearOptions, IMiddleware, LogLevel, MiddlewareFactory, RequestDelegate } from "./abstractions";
import { ApplicationBuilder } from "./application-builder/application-builder";
import "./application-builder/cache-extensions";
import "./application-builder/claim-clients-extensions";
import "./application-builder/clear-cache-on-update-extensions";
import "./application-builder/install-cache-extensions";
import "./application-builder/map-extensions";
import "./application-builder/middleware-extensions";
import { Route, RouteVariables } from "./application-builder/route";
import "./application-builder/use-when-extensions";

export { FetchContext, IApplicationBuilder, IMiddleware, MiddlewareFactory, RequestDelegate, ApplicationBuilder, 
    Route, RouteVariables, ICacheClearOptions, LogLevel };

import { IServiceCollection, IServiceProvider } from "./abstractions";
import "./service-collection/configure-extension";
import { ServiceCollection } from "./service-collection/service-collection";
import { ServiceProvider } from "./service-collection/service-provider";

export { IServiceCollection, IServiceProvider, ServiceCollection, ServiceProvider };

import { ILogger, ILoggingBuilder, IServiceWorkerBuilder, IStartup, StartupFactory } from "./abstractions";
import { ServiceWorker } from "./service-worker";
import { ServiceWorkerBuilder } from "./service-worker-builder";

export { ILogger, ILoggingBuilder, IServiceWorkerBuilder, IStartup, StartupFactory, ServiceWorkerBuilder, ServiceWorker };

import { CacheStrategies, CacheStrategy } from "./application-builder/cache-strategies";

export { CacheStrategy, CacheStrategies };

import { Logger } from "./logger"

export { Logger };
