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

  ['POST', 'PUT', 'DELETE', 'OPTIONS'].forEach(method => {
    it(`must ignore ${method} requests`, () => {
      req.method = method;
      middleware(req, null, next);

      expect(req.url).toEqual(requestedUrl);
      expect(next.called).toEqual(true);
    });
  });

  ['GET', 'HEAD'].forEach(method => {
    it(`[${method}] should ignore requests that do not accept html`, () => {
      req.method = method;
      req.headers.accept = 'application/json';

      middleware(req, null, next);

      expect(req.url).toEqual(requestedUrl);
      expect(next.called).toEqual(true);
    });


    it(`[${method}] should ignore file requests`, () => {
      req.method = method;

      var expected = req.url = 'js/app.js';

      middleware(req, null, next);

      expect(req.url).toEqual(expected);
      expect(next.called).toEqual(true);
    });


    it(`[${method}] should rewrite requests with .`, () => {
      req.method = method;
      req.url = 'js/foo.bar/jkdsah321jkh';

      middleware(req, null, next);

      expect(req.url).toEqual('/index.html');
      expect(next.called).toEqual(true);
    });


    it(`[${method}] should rewrite requests when the . rule is disabled`, () => {
      req.method = method;
      req.url = 'js/app.js';

      middleware = historyApiFallback({
        disableDotRule: true
      });

      middleware(req, null, next);

      expect(req.url).toEqual('/index.html');
      expect(next.called).toEqual(true);
    });


    it(`[${method}] should take JSON preference into account`, () => {
      req.method = method;
      req.headers.accept = 'application/json, text/plain, */*';

      middleware(req, null, next);

      expect(req.url).toEqual(requestedUrl);
      expect(next.called).toEqual(true);
    });


    it(`[${method}] should rewrite valid requests`, () => {
      req.method = method;

      middleware(req, null, next);

      expect(req.url).toEqual('/index.html');
      expect(next.called).toEqual(true);
    });

    it(`[${method}] should not fail for missing HTTP accept header`, () => {
      req.method = method;
      delete req.headers.accept;

      middleware(req, null, next);

      expect(req.url).toEqual(requestedUrl);
      expect(next.called).toEqual(true);
    });

    it(`[${method}] should not fail for missing headers object`, () => {
      req.method = method;
      delete req.headers;

      middleware(req, null, next);

      expect(req.url).toEqual(requestedUrl);
      expect(next.called).toEqual(true);
    });

    it(`[${method}] should work in verbose mode`, () => {
      req.method = method;

      var expected = req.url = 'js/app.js';

      middleware = historyApiFallback({
        verbose: true
      });

      middleware(req, null, next);

      expect(req.url).toEqual(expected);
      expect(next.called).toEqual(true);
    });

    it(`[${method}] should work with a custom logger`, () => {
      req.method = method;

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

    it(`[${method}] should rewrite requested path according to rules`, () => {
      req.method = method;
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

    it(`[${method}] should support functions as rewrite rule`, () => {
      req.method = method;

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

    it(`[${method}] should test rewrite rules`, () => {
      req.method = method;
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

    it(`[${method}] should support custom index file`, () => {
      req.method = method;
      req.url = '/socer';

      var index = 'default.html';

      middleware = historyApiFallback({
        index: index
      });

      middleware(req, null, next);

      expect(req.url).toEqual(index);
      expect(next.called).toEqual(true);
    });

    it(`[${method}] should accept html requests based on headers option`, () => {
      req.method = method;
      req.headers.accept = '*/*';

      middleware = historyApiFallback({
        htmlAcceptHeaders: ['text/html', 'application/xhtml+xml']
      });

      middleware(req, null, next);

      expect(req.url).toEqual(requestedUrl);
      expect(next.called).toEqual(true);
    });

    it(`[${method}] should support custom rewrite rules`, () => {
      req.method = method;
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

});
