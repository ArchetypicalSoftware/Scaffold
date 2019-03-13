import { IApplicationBuilder, IMiddleware, MiddlewareFactory, RequestDelegate, ICacheClearOptions } from './abstractions'
import { ApplicationBuilder } from './application-builder/application-builder'
import './application-builder/cache-extensions'
import './application-builder/map-extensions'
import './application-builder/middleware-extensions'
import './application-builder/use-when-extensions'
import './application-builder//clear-cache-on-update-extensions'
import './application-builder/install-cache-extensions'
import { Route, RouteVariables } from './application-builder/route'

export { IApplicationBuilder, IMiddleware, MiddlewareFactory, RequestDelegate, ApplicationBuilder, Route, RouteVariables, ICacheClearOptions }

import { IServiceCollection, IServiceProvider } from './abstractions'
import { ServiceCollection } from './service-collection/service-collection'
import { ServiceProvider } from './service-collection/service-provider'
import './service-collection/configure-extension'

export { IServiceCollection, IServiceProvider, ServiceCollection, ServiceProvider } 

import { IServiceWorkerBuilder, IStartup, StartupFactory } from './abstractions'
import { ServiceWorkerBuilder } from './service-worker-builder'
import { ServiceWorker } from './service-worker'

export { IServiceWorkerBuilder, IStartup, StartupFactory, ServiceWorkerBuilder, ServiceWorker }

import { CacheStrategies, CacheStrategy } from './application-builder/cache-strategies'

export { CacheStrategy, CacheStrategies }