# Scaffold

## Routing

Routing enables you to conditionally run code based upon the incoming request and Scaffold's routing is no different. Scaffold routing will be very familiar to those familiar with ASP.NET.

## Route Elements

Scaffold routes consist of four major elements: origin, path, file extension and query.

```html
https://www.example.com/js/site.js?variable=12
```

In the above example the four elements are evaluated as

| Element | Value |
| ------- | ------|
| Origin | `https://www.example.com`|
| Path | `/js/site` |
| File Extension | `js` |
| Query | `variable=12` |

### Origin

The origin is an optional element and usually is not provided. Typically you will only match routes own by your application. As a result, when not provided, the origin will be evaluated as the same host where the service worker is hosted. If you provide a host, the incoming request will only match if origins match. This is primarily utilized when you want to cache an asset located on a host other than your own.

For example, if you wish to cache JQuery from CDN your route would be something similar to: `https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js`.

If you wanted to cache JQuery from your local host, your route would be something similar to: `/js/vendor/jquery.min.js`

### Path

Path is the only required route element. This describes the virtual route to a specific asset. Scaffold routing is modeled after the MVC routing implementation with a few enhancements described in later in the Route Element Types section.

### File Extension

The file extension element is utilized only when accessing static assets (e.g. `js`, `css`, or `html`).

### Query

Query strings are an easy way to provide variables to the server for conditional evaluation of the route. If a query is provided, a request must contain all elements of the route's query. Any additional query parameters are ignored during the evaluation.

## Route Element Types

While all routes can be defined by static strings, sometimes that can become a bit tedious. Similar to ASP.NET, Scaffold supports variables in route definitions. In addition to variables, Scaffold routes can also utilize wildcard and double wildcard characters.

### Static

All static elements of a route are case-insensitive including the origin, path elements and query parameters. Any static element provided within a route must exist in the request to match.

| Route | Request | Match |
| ----- | ------- | ------ |
| `/Home/Index` | <https://www.YourHost.com/Home/Index> | YES |
| `/Home/Index` | <https://www.YourHost.com/Home/Index?parameter=value> | YES |
| `/Home/Index` | <https://www.YourHost.com/home/InDEX"> | YES |
| `/Home/Index` | <https://www.YourHost.com/Home/Index.js> | NO |
| `/Home/Index` | <https://www.YourHost.com/Home/Index2> | NO |
| `/Home/Index` | <https://www.YourHost.com/Home> | NO |
| `/Home/Index` | <https://www.NotYourHost.com/Home/Index> | NO |

### Variables

Sometimes static strings aren't enough to make a decision or it becomes tedious to do so. This is where variables can come into play, providing additional information about the route to make a more educated decision.

Variables are denoted by curly braces wrapping the variable name you specify the value to go into. Variables can be used in paths, file extensions and in query strings.

| Route | Request | Match |
| ----- | ------- | ------ |
| `/Home/{action}` | <https://www.YourHost.com/Home/Index> | YES |
| `/Home/{action}` | <https://www.YourHost.com/Home/NotIndex> | YES |
| `/Home/{action}` | <https://www.YourHost.com/Home/Index.js> | NO |
| `/Home/{action}` | <https://www.YourHost.com/Home/Index/4> | NO |
| `/{area}/{action}` | <https://www.YourHost.com/Home/Index> | YES |
| `/Home/Index?param1={param1}` | <https://www.YourHost.com/Home/Index?param1=hello> | YES |

When using a route with variables, you'll typically be using the `mapWhen` or the `cacheWhen` methods. Part of those methods is a predicate with this signature:

```ts
(fetchContext: IFetchContext, routeVariables: IRouteVariables) => boolean
```

The second parameter provided to the predicate is an instance of an `IRouteVariables` implementation.

```ts
// Provides variables defined by a route when matched. Used in the
// predicate utilized by the mapWhen and cacheWhen extensions.
 interface IRouteVariables {

    // path variables
    path: Map<string, string>;

    // query variables
    query: Map<string, string>;

    // request URL object
    url: URL;
}
```

Any variables defined in the path or the file extension will be available in the `path` map. Any variables defined in the query string will be available in the `query` map. In addition, a `URL` object is provided to help you make the right decision.

### Single Wildcards

In addition to static strings and variables, wildcards can be used to accept any value for a given section.

| Route | Request | Match |
| ----- | ------- | ------ |
| `/Home/*` | <https://www.YourHost.com/Home/Index> | YES |
| `/Home/*` | <https://www.YourHost.com/Home/Index.js> | NO |
| `/Home/*.js` | <https://www.YourHost.com/Home/Index.js> | YES |
| `/Home/*.*` | <https://www.YourHost.com/Home/Index.js> | YES |
| `/Home/*` | <https://www.YourHost.com/Home/Index/4> | NO |
| `/*/*` | <https://www.YourHost.com/Home/Index> | YES |
| `/Home/Index?param1=*` | <https://www.YourHost.com/Home/Index?param1=hello> | YES |

### Double Wildcards

Finally, double wildcards may be of use if you wish to accept a wide array of inputs. Double wildcards will accept any path of any length (including 0). If any additional path exists after the wildcard, Scaffold will attempt to match it. If there is no end, it is automatically matched.

There are some limitations with double wildcards:

* There can only be one within a given path
* There must be either 0 or 1 additional path element after the double wildcard


| Route | Request | Match |
| ----- | ------- | ------ |
| `/Home/**` | <https://www.YourHost.com/Home/Index> | YES |
| `/Home/**` | <https://www.YourHost.com/Home/Index.js> | YES |
| `/Home/**/Index.js` | <https://www.YourHost.com/Home/Index.js> | YES |
| `/Home/**` | <https://www.YourHost.com/Home/Index/4> | YES |
| `/**` | <https://www.YourHost.com/Home/Index> | YES |

