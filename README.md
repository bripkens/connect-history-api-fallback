<h1 align="center">connect-history-api-fallback</h1>
<p align="center">Middleware to proxy requests through a specified index page, useful for Single Page Applications that utilise the HTML5 History API.</p>

## Introduction

Single Page Applications (SPA) typically only utilise one index file that is
accessible by web browsers: usually `index.html`. Navigation in the application
is then commonly handled using JavaScript with the help of the
[HTML5 History API](http://www.w3.org/html/wg/drafts/html/master/single-page.html#the-history-interface).
This results in issues when the user hits the refresh button or is directly
accessing a page other than the landing page, e.g. `/help` or `/help/online`
as the web server bypasses the index file to locate the file at this location.
As your application is a SPA, the web server will fail trying to retrieve the file and return a *404 - Not Found*
message to the user.

This tiny middleware addresses some of the issues. Specifically, it will change
the requested location to the index you specify (default being `index.html`)
whenever there is a request which fulfils the following criteria:

 1. The request is a GET request
 2. which accepts `text/html`,
 3. is not a direct file request, i.e. the requested path does not contain a
    `.` (DOT) character and
 4. does not match a pattern provided in options.rewrites (see options below)

## Usage

The middleware is available through NPM and can easily be added.

```
npm install --save connect-history-api-fallback
```

Import the library

```javascript
var history = require('connect-history-api-fallback');
```

Now you only need to add the middleware to your application like so

```javascript
var connect = require('connect');
var middleware = history();

var app = connect()
  .use(middleware)
  .listen(3000);
```

Of course you can also use this piece of middleware with express:

```javascript
var express = require('express');
var middleware = history();

var app = express();
app.use(middleware);
```

## Options

You can optionally pass options to the library when obtaining the middleware

```javascript
var options = {};
var middleware = history({});
```

### index

Override the index (default `index.html`)

```javascript
var middleware = history({
  index: 'default.html'
});
```

### rewrites

Override the index when the request url matches a regex pattern

```javascript
var middleware = history({
  rewrites: [
    { pattern: '/soccer', target: '/soccer.html'},
    { pattern: '/tennis', target: '/tennis.html'},
});
```

### verbose

Output logging (default `false`)

```javascript
var middleware = history({
  verbose: true
});
```

Alternatively use your own logger

```javascript
var middleware = history();
history.setLogger(console.log.bind(console));
```
