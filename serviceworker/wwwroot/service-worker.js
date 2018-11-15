self.importScripts('/scripts/routes.js');
self.importScripts('/scripts/cache-strategy-factory.js');

var cacheStrategies = Routes.CacheStrategyFactory('my-website-v2');

Routes.add([
    { url: "Home/JsonData?id={id}", handler: cacheStrategies.backgroundFetch },
    { url: "Home/StaticJsonData", handler: cacheStrategies.fetchOnce },
    { url: "{controller}/{action}/{id}", handler: cacheStrategies.none },
    { url: "js/site.js", handler: cacheStrategies.none },
    { url: "**/*.*", handler: cacheStrategies.fetchOnce }
]);


self.addEventListener("fetch", (event) => {
    return Routes.exec(event) || event.respondWith(fetch(event.request));
});