'use strict';

var url = require('url');
var logger;

exports = module.exports = function historyApiFallback (options) {
  options = options || {};

  logger = defaultLogger(options);

  return function(req, res, next) {
    var headers = req.headers;
    if (req.method !== 'GET') {
      logger(
        'Not rewriting',
        req.method,
        req.url,
        'because the method is not GET.'
      );
      return next();
    } else if (!headers || typeof headers.accept !== 'string') {
      logger(
        'Not rewriting',
        req.method,
        req.url,
        'because the client did not send an HTTP accept header.'
      );
      return next();
    } else if (headers.accept.indexOf('application/json') === 0) {
      logger(
        'Not rewriting',
        req.method,
        req.url,
        'because the client prefers JSON.'
      );
      return next();
    } else if (!acceptsHtml(headers.accept)) {
      logger(
        'Not rewriting',
        req.method,
        req.url,
        'because the client does not accept HTML.'
      );
      return next();
    }

    var parsedUrl = url.parse(req.url);
    if (parsedUrl.pathname.indexOf('.') !== -1) {
      logger(
        'Not rewriting',
        req.method,
        req.url,
        'because the path includes a dot (.) character.'
      );
      return next();
    }

    var rewriteTarget = options.index || '/index.html';
    options.rewrites = options.rewrites || [];
    for (var i in options.rewrites) {
      var rewrite = options.rewrites[i],
        pattern = new RegExp(rewrite.pattern);
      if (parsedUrl.pathname.match(pattern) !== null) {
        rewriteTarget = rewrite.target;
      }
    }

    logger('Rewriting', req.method, req.url, 'to', rewriteTarget);
    req.url = rewriteTarget;
    next();
  };
};

module.exports.setLogger = function (newLogger) {
  logger = newLogger || defaultLogger();
};

function acceptsHtml (header) {
  return header.indexOf('text/html') !== -1 || header.indexOf('*/*') !== -1;
}

function defaultLogger (options) {
  return function () {
    var verbose = options.verbose || false;
    if (verbose) {
      console.log(Array.prototype.join.call(arguments, ' '));
    }
  };
}
