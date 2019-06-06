/* eslint-env jest */

'use strict';

const sinon = require('sinon');
const historyApiFallback = require('../lib');

describe('connect-history-api-fallback', () => {
  let middleware;
  let req = null;
  let requestedUrl;
  let next;

  beforeEach(() => {
    middleware = historyApiFallback();
    requestedUrl = '/foo';
    req = {
      method: 'GET',
      url: requestedUrl,
      headers: {
        accept: 'text/html, */*'
      }
    };
    next = sinon.stub();
  });

  ['POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'].forEach(method => {
    it(`must ignore ${method} requests`, () => {
      req.method = method;

      middleware(req, null, next);

      expect(req.url).toEqual(requestedUrl);
      expect(next.called).toEqual(true);
    });
  });

  it('should ignore requests that do not accept html', () => {
    req.headers.accept = 'application/json';

    middleware(req, null, next);

    expect(req.url).toEqual(requestedUrl);
    expect(next.called).toEqual(true);
  });


  it('should ignore file requests', () => {
    var expected = req.url = 'js/app.js';

    middleware(req, null, next);

    expect(req.url).toEqual(expected);
    expect(next.called).toEqual(true);
  });


  it('should rewrite requests with .', () => {
    req.url = 'js/foo.bar/jkdsah321jkh';

    middleware(req, null, next);

    expect(req.url).toEqual('/index.html');
    expect(next.called).toEqual(true);
  });


  it('should rewrite requests when the . rule is disabled', () => {
    req.url = 'js/app.js';
    middleware = historyApiFallback({
      disableDotRule: true
    });
    middleware(req, null, next);

    expect(req.url).toEqual('/index.html');
    expect(next.called).toEqual(true);
  });


  it('should take JSON preference into account', () => {
    req.headers.accept = 'application/json, text/plain, */*';

    middleware(req, null, next);

    expect(req.url).toEqual(requestedUrl);
    expect(next.called).toEqual(true);
  });


  it('should rewrite valid requests', () => {
    middleware(req, null, next);

    expect(req.url).toEqual('/index.html');
    expect(next.called).toEqual(true);
  });

  it('should not fail for missing HTTP accept header', () => {
    delete req.headers.accept;

    middleware(req, null, next);

    expect(req.url).toEqual(requestedUrl);
    expect(next.called).toEqual(true);
  });

  it('should not fail for missing headers object', () => {
    delete req.headers;

    middleware(req, null, next);

    expect(req.url).toEqual(requestedUrl);
    expect(next.called).toEqual(true);
  });

  it('should work in verbose mode', () => {
    var expected = req.url = 'js/app.js';
    middleware = historyApiFallback({
      verbose: true
    });

    middleware(req, null, next);

    expect(req.url).toEqual(expected);
    expect(next.called).toEqual(true);
  });

  it('should work with a custom logger', () => {
    var expected = req.url = 'js/app.js';
    var logger = sinon.stub();
    middleware = historyApiFallback({
      logger: logger
    });

    middleware(req, null, next);

    expect(req.url).toEqual(expected);
    expect(next.called).toEqual(true);
    expect(logger.calledOnce).toEqual(true);
  });

  it('should rewrite requested path according to rules', () => {
    req.url = '/soccer';
    middleware = historyApiFallback({
      rewrites: [
        {from: /\/soccer/, to: '/soccer.html'}
      ]
    });

    middleware(req, null, next);

    expect(req.url).toEqual('/soccer.html');
    expect(next.called).toEqual(true);
  });

  it('should support functions as rewrite rule', () => {
    middleware = historyApiFallback({
      rewrites: [
        {
          from: /^\/libs\/(.*)$/,
          to: function(context) {
            return './bower_components' + context.parsedUrl.pathname;
          }
        }
      ]
    });

    req.url = '/libs/jquery/jquery.1.12.0.min.js';
    middleware(req, null, next);
    expect(req.url).toEqual('./bower_components/libs/jquery/jquery.1.12.0.min.js');
    expect(next.called).toEqual(true);

    next = sinon.stub();
    var expected = req.url = '/js/main.js';
    middleware(req, null, next);
    expect(req.url).toEqual(expected);
    expect(next.called).toEqual(true);

  });

  it('should test rewrite rules', () => {
    req.url = '/socer';
    middleware = historyApiFallback({
      rewrites: [
        {from: /\/soccer/, to: '/soccer.html'}
      ]
    });

    middleware(req, null, next);

    expect(req.url).toEqual('/index.html');
    expect(next.called).toEqual(true);
  });

  it('should support custom index file', () => {
    var index = 'default.html';
    req.url = '/socer';
    middleware = historyApiFallback({
      index: index
    });

    middleware(req, null, next);

    expect(req.url).toEqual(index);
    expect(next.called).toEqual(true);
  });

  it('should accept html requests based on headers option', () => {
    req.headers.accept = '*/*';
    middleware = historyApiFallback({
      htmlAcceptHeaders: ['text/html', 'application/xhtml+xml']
    });

    middleware(req, null, next);

    expect(req.url).toEqual(requestedUrl);
    expect(next.called).toEqual(true);
  });

  it('should support custom rewrite rules', () => {
    req.headers.accept = '*/*';
    var url = '/app/login/app.js';
    req.url = url;
    middleware = historyApiFallback({
      rewrites: [
        {
          from: /\/app\/login/,
          to: function onMatch(ctx) {
            if (ctx.parsedUrl.path.indexOf('.js')) {
              return ctx.parsedUrl.href;
            }
            return '/app/login/index.html';
          }
        }
      ]
    });

    middleware(req, null, next);

    expect(req.url).toEqual(url);
    expect(next.called).toEqual(true);
  });

});
