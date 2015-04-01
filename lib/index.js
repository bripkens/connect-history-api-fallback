'use strict';

var url = require('url'),
  fs = require('fs');

var logger = function () {};
var rewriteUrlsWithDots = false;
var appBaseDir = ''; // Application base directory
var rewriteTarget = '/index.html';

exports = module.exports = historyApiFallback;


module.exports.setLogger = function (newLogger) {
  logger = newLogger || function () {};
};

module.exports.fallbackToIndexForUrlsWithDots = function (rewrite, dir) {
  rewriteUrlsWithDots = !!rewrite;
  appBaseDir = dir;
  return historyApiFallback;
};

function acceptsHtml (header) {
  return header.indexOf('text/html') !== -1 || header.indexOf('*/*') !== -1;
}

function historyApiFallback (req, res, next) {
  var headers = req.headers;
  if (req.method !== 'GET') {
    logger('Not rewriting %s %s because the method is not GET.',
      req.method, req.url);
    return next();
  } else if (!headers || typeof headers.accept !== 'string') {
    logger('Not rewriting %s %s because the client did not send an HTTP ' +
      'accept header.', req.method, req.url);
    return next();
  } else if (headers.accept.indexOf('application/json') === 0) {
    logger('Not rewriting %s %s because the client prefers JSON.',
      req.method, req.url);
    return next();
  } else if (!acceptsHtml(headers.accept)) {
    logger('Not rewriting %s %s because the client does not accept HTML.',
      req.method, req.url);
    return next();
  }

  var parsedUrl = url.parse(req.url);
  if (parsedUrl.pathname.indexOf('.') !== -1) {
    if(!rewriteUrlsWithDots) {
      logger('Not rewriting %s %s because the path includes a dot (.) character.',
        req.method, req.url);
      return next();
    }
    else {
      var fileName = parsedUrl.href.split(parsedUrl.search).join("");
      var fileExists = fs.existsSync(appBaseDir + fileName);

      if (fileExists || fileName.indexOf("browser-sync-client") > 0) {
        logger('Not rewriting %s %s because the client requested an existing file.',
          req.method, req.url);
        return next();
      }
    }
  }

  logger('Rewriting %s %s to %s', req.method, req.url, rewriteTarget);
  req.url = rewriteTarget;
  next();
}