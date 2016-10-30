# Serving static files and handling index redirects
This example shows how to handle static files without the dot rule and without any rewrites.

The following excerpts highlight the demo app's important code locations.

## Running the demo app

```
npm install
npm start
```

## Configuring the middleware
To handle rewrites without the dot rule, you should include the static middleware twice as shown below. The first usage of the static file middleware will catch the majority of the static file requests.

Next, we include the `connect-history-api-fallback` which will rewrite requests to `index.html` when necessary.

At last, we include the static file middleware again so that rewritten requests can be served.

```javascript
const staticFileMiddleware = express.static('assets');
app.use(staticFileMiddleware);
app.use(history({
  disableDotRule: true,
  verbose: true
}));
app.use(staticFileMiddleware);
```

## Using meaningful accept headers
The `connect-history-api-fallback` middleware relies on the existence of meaningful HTTP `Accept` headers to do its work. In order for requests to `/users/5` not be rewritten, we need so send an `Accept` header which clearly states our intent. In the case of this demo application, this means that we want to retrieve JSON and therefore add the HTTP header `Accept: application/json`.

```javascript
const xhr = new XMLHttpRequest();
xhr.open('GET', '/users/5');
xhr.responseType = 'json';
xhr.setRequestHeader('Accept', 'application/json');
xhr.onreadystatechange = function () {
  if (xhr.readyState === XMLHttpRequest.DONE) {
    document.getElementById('output').textContent = JSON.stringify(xhr.response, 0, 2);
  }
};
xhr.send();
```
