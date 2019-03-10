# Ignore / Exclude Rules

This example extends the `static-files-and-index-rewrite` example in order to show how to explicitly
not apply the `connect-history-api-fallback`. If you haven't already inspected the
`static-files-and-index-rewrite` example, then do this first as it explains the basic setup of the
project / middleware.

The following excerpts highlight the demo app's important code locations.

## Running the demo app

```
npm install
npm start
```

## Configuring the middleware

In order to define our ignore rules, we define a custom connect middleware which wraps the
middleware created by `connect-history-api-fallback`. This allows us to do anything we want
in terms of ignore rule complexity.

```javascript
const historyMiddleware = history({
  disableDotRule: true,
  verbose: true
});
app.use((req, res, next) => {
  // This is the ignore rule. You can do whatever checks you feel are necessary, e.g.
  // check headers, req path, external vars…
  if (req.path === '/signOut') {
    next();
  } else {
    historyMiddleware(req, res, next);
  }
});
```
