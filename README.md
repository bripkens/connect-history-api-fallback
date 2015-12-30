<h1 align="center">koa-history-api-fallback</h1>
<p align="center">Koa implementation of [connect-history-api-fallback](https://github.com/bripkens/connect-history-api-fallback)

[![NPM](https://nodei.co/npm/koa-history-api-fallback.png?downloads=true&downloadRank=true)](https://nodei.co/npm/koa-history-api-fallback/)

## Introduction

This is simple rewrite of [connect-history-api-fallback](https://github.com/bripkens/connect-history-api-fallback)

## Usage

The middleware is available through NPM and can easily be added.

```
npm install --save koa-history-api-fallback
```

Import the library

```javascript
var historyApiFallback = require('koa-history-api-fallback');

var app = koa();

app.use(historyApiFallback());
```

## Options
You can optionally pass options to the library when obtaining the middleware

```javascript
var middleware = historyApiFallback({});
```

### index
Override the index (default `/index.html`)

```javascript
historyApiFallback({
  index: '/default.html'
});
```

### rewrites
Override the index when the request url matches a regex pattern. You can either rewrite to a static string or use a function to transform the incoming request.

The following will rewrite a request that matches the `/\/soccer/` pattern to `/soccer.html`.
```javascript
historyApiFallback({
  rewrites: [
    { from: /\/soccer/, to: '/soccer.html'}
  ]
});
```

Alternatively functions can be used to have more control over the rewrite process. For instance, the following listing shows how requests to `/libs/jquery/jquery.1.12.0.min.js` and the like can be routed to `./bower_components/libs/jquery/jquery.1.12.0.min.js`. You can also make use of this if you have an API version in the URL path.
```javascript
historyApiFallback({
  rewrites: [
    {
      from: /^\/libs\/.*$/,
      to: function(context) {
        return '/bower_components' + context.parsedUrl.pathname;
      }
    }
  ]
});
```

The function will always be called with a context object that has the following properties:

 - **parsedUrl**: Information about the URL as provided by the [URL module's](https://nodejs.org/api/url.html#url_url_parse_urlstr_parsequerystring_slashesdenotehost) `url.parse`.
 - **match**: An Array of matched results as provided by `String.match(...)`.


### verbose
This middleware does not log any information by default. If you wish to activate logging, then you can do so via the `verbose` option or by specifying a logger function.

```javascript
historyApiFallback({
  verbose: true
});
```

Alternatively use your own logger

```javascript
historyApiFallback({
  logger: console.log.bind(console)
});
```
