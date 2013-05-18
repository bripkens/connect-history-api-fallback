'use strict';

var url = require('url');

exports = module.exports = function historyApiFallback (req, res, next) {
  var headers = req.headers;
  if (req.method !== 'GET' || headers.accept.indexOf('text/html') === -1) {
    return next();
  }

  var parsedUrl = url.parse(req.url);
  if (parsedUrl.pathname.indexOf('.') !== -1) {
    return next();
  }

  req.url = '/index.html';
  next();
};
