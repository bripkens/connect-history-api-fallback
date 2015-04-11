'use strict';

var historyApiFallback = require('../lib');
var middleware = historyApiFallback();

var tests = module.exports = {};

var req = null;
var nextCalled = false;
var requestedUrl = '/foo';
var next = function() {
  nextCalled = true;
};


tests.setUp = function(done) {
  req = {
    method: 'GET',
    url: requestedUrl,
    headers: {
      accept: 'text/html, */*'
    }
  };
  nextCalled = false;

  done();
};


['POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'].forEach(function(method) {
  tests['should ignore ' + method + ' requests'] = function(test) {
    req.method = method;

    middleware(req, null, next);

    test.equal(req.url, requestedUrl);
    test.ok(nextCalled);
    test.done();
  };
});


tests['should ignore requests that do not accept html'] = function(test) {
  req.headers.accept = 'application/json';

  middleware(req, null, next);

  test.equal(req.url, requestedUrl);
  test.ok(nextCalled);
  test.done();
};


tests['should ignore file requests'] = function(test) {
  var expected = req.url = 'js/app.js';

  middleware(req, null, next);

  test.equal(req.url, expected);
  test.ok(nextCalled);
  test.done();
};


tests['should take JSON preference into account'] = function(test) {
  req.headers.accept = 'application/json, text/plain, */*';

  middleware(req, null, next);

  test.equal(req.url, requestedUrl);
  test.ok(nextCalled);
  test.done();
};


tests['should rewrite valid requests'] = function(test) {
  middleware(req, null, next);

  test.equal(req.url, '/index.html');
  test.ok(nextCalled);
  test.done();
};

tests['should not fail for missing HTTP accept header'] = function(test) {
  delete req.headers.accept;

  middleware(req, null, next);

  test.equal(req.url, requestedUrl);
  test.ok(nextCalled);
  test.done();
};

tests['should not fail for missing headers object'] = function(test) {
  delete req.headers;

  middleware(req, null, next);

  test.equal(req.url, requestedUrl);
  test.ok(nextCalled);
  test.done();
};
