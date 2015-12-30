'use strict'

var url = require('url');

function evaluateRewriteRule(parsedUrl, match, rule) {
  if (typeof rule === 'string') {
    return rule;
  } else if (typeof rule !== 'function') {
    throw new Error('Rewrite rule can only be of type string of function.');
  }

  return rule({
    parsedUrl: parsedUrl,
    match: match
  });
}

function acceptsHtml(header) {
  return header.indexOf('text/html') !== -1 || header.indexOf('*/*') !== -1;
}

function getLogger(options) {
  if (options && options.logger) {
    return options.logger;
  } else if (options && options.verbose) {
    return console.log.bind(console);
  }
  return function(){};
}

module.exports = function koaFallbackApiMiddleware(options) {
  options = options || {};
  var logger = getLogger(options);

  return function * (next) {
    var headers = this.headers,
      reqUrl = this.url,
      method = this.method;

    if (this.method !== 'GET') {
      logger(
        'Not rewriting',
        method,
        reqUrl,
        'because the method is not GET.'
      );
      yield * next;
    } else if (!headers || typeof headers.accept !== 'string') {
      logger(
        'Not rewriting',
        method,
        reqUrl,
        'because the client did not send an HTTP accept header.'
      );
      yield * next;
    } else if (headers.accept.indexOf('application/json') === 0) {
      logger(
        'Not rewriting',
        method,
        reqUrl,
        'because the client prefers JSON.'
      );
      yield * next;
    } else if (!acceptsHtml(headers.accept)) {
      logger(
        'Not rewriting',
        method,
        reqUrl,
        'because the client does not accept HTML.'
      );
      yield * next;
    }

    var parsedUrl = url.parse(reqUrl);
    var rewriteTarget;

    options.rewrites = options.rewrites || [];

    for (var i = 0; i < options.rewrites.length; i++) {
      var rewrite = options.rewrites[i];
      var match = parsedUrl.pathname.match(rewrite.from);
      if (match !== null) {
        rewriteTarget = evaluateRewriteRule(parsedUrl, match, rewrite.to);
        logger('Rewriting', req.method, req.url, 'to', rewriteTarget);
        this.url = rewriteTarget;
        yield * next;
      }
    }

    if (parsedUrl.pathname.indexOf('.') !== -1) {
      logger(
        'Not rewriting',
        method,
        reqUrl,
        'because the path includes a dot (.) character.'
      );
      yield * next;
    }

    rewriteTarget = options.index || '/index.html';
    logger('Rewriting', method, reqUrl, 'to', rewriteTarget);
    this.url = rewriteTarget;

    yield * next;
  }
};
