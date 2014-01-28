var requests = require('../lib/requests'),
  nodeunit = require('nodeunit');
  
function setUp() {
  this.scopesMock = {
    _mayReadCalled: 0,
    _mayWriteCalled: 0,
    mayRead: function(authHeader, path) {
      this._mayReadCalled++;
      return ((authHeader === 'asdfqwer-read' && path === 'qwer/asdf/read')
          || (authHeader === 'Bearer SECRET' && path === 'me/existing'));
    },
    mayWrite: function(authHeader, path) {
      this._mayWriteCalled++;
      return (authHeader === 'asdfqwer-write' && path === 'qwer/asdf/write');
    }
  };
  this.mainMock = {
    _condMetCalled: 0,
    _existsCalled: 0,
    _getRevisionCalled: 0,
    _getContentCalled: 0,
    _getContentTypeCalled: 0,
    condMet: function(cond, path) {
      this._condMetCalled++;
      return (cond.ifNoneMatch === '*' && path === 'qwer/asdf/cond')
          || (cond.ifNoneMatch === undefined && cond.ifMatch === undefined && path === 'me/existing');
    },
    exists: function(path) {
      this._existsCalled++;
      return (path === 'me/existing');
    },
    getContent: function(path) {
      this._getContentCalled++;
      return 'yes, very content!';
    },
    getContentType: function(path) {
      this._getContentTypeCalled++;
      return 'very!';
    },
    getRevision: function(path) {
      this._getRevisionCalled++;
      return 'koe';
    }
  };
  this.res = {
    _status: undefined,
    _headers: undefined,
    _body: '',
    _ended: false,
    writeHead: function(status, headers) {
      this._status = status;
      this._headers = headers;
    },
    write: function(buf) {
      this._body += buf.toString();
    },
    end: function(buf) {
      if (buf) {
        this._body += buf.toString();
      }
      this._ended = true;
      if (this._cb) {
        this._cb();
      }
    },
    onEnd: function(cb) {
      this._cb = cb;
    }
  };
  this.req = {
    headers: {
      origin: 'http://local.host'
    }
  };
  this.requestsInstance = requests.createInstance('/path/to/storage/', this.scopesMock, this.mainMock);
}

exports['main'] = nodeunit.testCase({
  /*setUp: function() {
  },
  tearDown: function() {
  },*/
  'writeHead': function (test) {
    setUp.bind(this)();
    this.requestsInstance.writeHead(this.res, 207, 'https://foo.bar', '123', 'application/json', 456);
    test.equal(this.res._status, 207);
    test.deepEqual(this.res._headers, {
      'Access-Control-Allow-Origin': 'https://foo.bar',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, If-Match, If-None-Match',
      'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
      Expires: '0',
      etag: '"123"',
      'content-type': 'application/json',
      'content-length': '456'
    });
    test.equal(this.res._body, '');
    test.equal(this.res._ended, false);
    test.done();
  },
  'writeRaw': function (test) {
    setUp.bind(this)();
    this.requestsInstance.writeRaw(this.res, 'application/json', new Buffer('asdf', 'utf-8'), 'https://foo.bar', '123');
    test.equal(this.res._status, 200);
    test.deepEqual(this.res._headers, {
      'Access-Control-Allow-Origin': 'https://foo.bar',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, If-Match, If-None-Match',
      'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
      Expires: '0',
      etag: '"123"',
      'content-type': 'application/json',
      'content-length': '4'
    });
    test.equal(this.res._body, 'asdf');
    test.done();
  },
  'respond': function (test) {
    setUp.bind(this)();
    this.requestsInstance.respond(this.res, 'https://foo.bar', 408, '123');
    test.equal(this.res._status, 408);
    test.deepEqual(this.res._headers, {
      'Access-Control-Allow-Origin': 'https://foo.bar',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, If-Match, If-None-Match',
      'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
      Expires: '0',
      etag: '"123"',
      'content-type': 'text/plain',
      'content-length': '20'
    });
    test.equal(this.res._body, '408 Computer says no');
    test.equal(this.res._ended, true);
    test.done();
  },
  'checkNoFolder': function (test) {
    setUp.bind(this)();
    this.requestsInstance.checkNoFolder(this.req, this.res, 'me/foo');
    test.equal(this.res._headers, undefined);
    test.equal(this.res._body, '');
    test.equal(this.res._ended, false);
    test.equal(this.requestsInstance.checkNoFolder(this.req, this.res, 'me/foo/'), undefined);
    test.deepEqual(this.res._headers, {
      'Access-Control-Allow-Origin': 'http://local.host',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, If-Match, If-None-Match',
      'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
      Expires: '0',
      'content-type': 'text/plain',
      'content-length': '20'
    });
    test.equal(this.res._body, '400 Computer says no');
    test.equal(this.res._ended, true);
    test.done();
  },
  'checkMayRead': function (test) {
    setUp.bind(this)();
    this.req.headers.authorization = 'asdfqwer-read';
    test.equal(this.requestsInstance.checkMayRead(this.req, this.res, 'qwer/asdf/read'), true);
    test.equal(this.scopesMock._mayReadCalled, 1);
    test.equal(this.res._status, undefined);
    test.equal(this.res._headers, undefined);
    test.equal(this.res._body, '');
    test.equal(this.res._ended, false);
    this.req.headers.authorization = 'asdfqwer-wrong';
    test.equal(this.requestsInstance.checkMayRead(this.req, this.res, 'qwer/asdf/read'), undefined);
    test.equal(this.scopesMock._mayReadCalled, 2);
    test.equal(this.res._status, 401);
    test.deepEqual(this.res._headers, {
      "Access-Control-Allow-Origin":"http://local.host",
      "Access-Control-Allow-Headers":"Content-Type, Authorization, Origin, If-Match, If-None-Match",
      "Access-Control-Expose-Headers":"Content-Type, Content-Length, ETag",
      "Access-Control-Allow-Methods":"GET, PUT, DELETE",
      "Expires":"0",
      "content-type":"text/plain",
      "content-length":"16"});
    test.equal(this.res._body, '401 Unauthorized');
    test.equal(this.res._ended, true);
    test.done();
  },
  'checkMayWrite': function (test) {
    setUp.bind(this)();
    this.req.headers.authorization = 'asdfqwer-write';
    test.equal(this.requestsInstance.checkMayWrite(this.req, this.res, 'qwer/asdf/write'), true);
    test.equal(this.scopesMock._mayWriteCalled, 1);
    test.equal(this.res._status, undefined);
    test.equal(this.res._headers, undefined);
    test.equal(this.res._body, '');
    test.equal(this.res._ended, false);
    this.req.headers.authorization = 'asdfqwer-wrong';
    test.equal(this.requestsInstance.checkMayWrite(this.req, this.res, 'qwer/asdf/write'), undefined);
    test.equal(this.scopesMock._mayWriteCalled, 2);
    test.equal(this.res._status, 401);
    test.deepEqual(this.res._headers, {
      "Access-Control-Allow-Origin":"http://local.host",
      "Access-Control-Allow-Headers":"Content-Type, Authorization, Origin, If-Match, If-None-Match",
      "Access-Control-Expose-Headers":"Content-Type, Content-Length, ETag",
      "Access-Control-Allow-Methods":"GET, PUT, DELETE",
      "Expires":"0",
      "content-type":"text/plain",
      "content-length":"16"});
    test.equal(this.res._body, '401 Unauthorized');
    test.equal(this.res._ended, true);
    test.done();
  },
  'checkCondMet': function (test) {
    setUp.bind(this)();
    this.req.headers['if-none-match'] = '*';
    test.equal(this.requestsInstance.checkCondMet(this.req, this.res, 'qwer/asdf/cond'), true);
    test.equal(this.mainMock._condMetCalled, 1);
    test.equal(this.res._status, undefined);
    test.equal(this.res._headers, undefined);
    test.equal(this.res._body, '');
    test.equal(this.res._ended, false);
    this.req.headers = {};
    this.req.headers.authorization = 'asdfqwer-wrong';
    this.req.headers['if-match'] = 'aap';
    test.equal(this.requestsInstance.checkCondMet(this.req, this.res, 'qwer/asdf/cond'), undefined);
    test.equal(this.mainMock._condMetCalled, 2);
    test.equal(this.res._status, 412);
    test.deepEqual(this.res._headers, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, If-Match, If-None-Match',
      'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
      'Expires': '0',
      'etag': '"koe"',
      'content-type': 'text/plain',
      'content-length': '23'});
    test.equal(this.res._body, '412 Precondition failed');
    test.equal(this.res._ended, true);
    test.done();
  },
  'checkFound': function (test) {
    setUp.bind(this)();
    this.req.headers = {
      origin: 'http://local.host'
    };
    test.equal(this.requestsInstance.checkFound(this.req, this.res, 'me/existing'), true);
    test.equal(this.mainMock._existsCalled, 1);
    test.equal(this.res._status, undefined);
    test.equal(this.res._headers, undefined);
    test.equal(this.res._body, '');
    test.equal(this.res._ended, false);
    test.equal(this.requestsInstance.checkFound(this.req, this.res, 'me/non-existing'), undefined);
    test.equal(this.mainMock._existsCalled, 2);
    test.equal(this.res._status, 404);
    test.deepEqual(this.res._headers, {
      'Access-Control-Allow-Origin': 'http://local.host',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, If-Match, If-None-Match',
      'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
      'Expires': '0',
      'content-type': 'text/plain',
      'content-length': '13'});
    test.equal(this.res._body, '404 Not Found');
    test.equal(this.res._ended, true);
    test.done();
  },
  'illegal verb': function (test) {
    setUp.bind(this)();
    test.expect(6);
    this.res.onEnd(function() {
      test.equal(this.scopesMock._mayReadCalled, 0);
      test.equal(this.scopesMock._mayWriteCalled, 0);
      test.equal(this.res._status, 405);
      test.deepEqual(this.res._headers, {
        'Access-Control-Allow-Origin': 'http://local.host',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, If-Match, If-None-Match',
        'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
        'Expires': '0',
        'content-type': 'text/plain',
        'content-length': '22'
      });
      test.equal(this.res._body, '405 Method not allowed');
      test.equal(this.res._ended, true);
      test.done();
    }.bind(this));
    this.req = {
      method: 'PATCH',
      url: '/path/to/storage/me/existing',
      headers: {
        origin: 'http://local.host',
        authorization: 'Bearer SECRET'
      }
    };
    this.requestsInstance.handleRequest(this.req, this.res);
  },
  'OPTIONS verb': function (test) {
    setUp.bind(this)();
    test.expect(6);
    this.res.onEnd(function() {
      test.equal(this.scopesMock._mayReadCalled, 0);
      test.equal(this.scopesMock._mayWriteCalled, 0);
      test.equal(this.res._status, 200);
      test.deepEqual(this.res._headers, {
        'Access-Control-Allow-Origin': 'http://local.host',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, If-Match, If-None-Match',
        'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
        'Expires': '0'
      });
      test.equal(this.res._body, '');
      test.equal(this.res._ended, true);
      test.done();
    }.bind(this));
    this.req = {
      method: 'OPTIONS',
      url: '/path/to/storage/me/existing',
      headers: {
        origin: 'http://local.host',
        authorization: 'Bearer SECRET'
      }
    };
    this.requestsInstance.handleRequest(this.req, this.res);
  },
  'HEAD verb': function (test) {
    setUp.bind(this)();
    test.expect(6);
    this.res.onEnd(function() {
      test.equal(this.scopesMock._mayReadCalled, 1);
      test.equal(this.scopesMock._mayWriteCalled, 0);
      test.equal(this.res._status, 200);
      test.deepEqual(this.res._headers, {
        'Access-Control-Allow-Origin': 'http://local.host',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, If-Match, If-None-Match',
        'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
        'Expires': '0',
        'etag': '"koe"',
        'content-type': 'very!'
      });
      test.equal(this.res._body, '');
      test.equal(this.res._ended, true);
      test.done();
    }.bind(this));
    this.req = {
      method: 'HEAD',
      url: '/path/to/storage/me/existing',
      headers: {
        origin: 'http://local.host',
        authorization: 'Bearer SECRET'
      }
    };
    this.requestsInstance.handleRequest(this.req, this.res);
  }
});
/*
  function doHead(req, res, path) {
  function doGet(req, res, path, folderFormat, folderContentType) {
  function doPut(req, res, path) {
    req.on('data', function(chunk) {
    req.on('end', function() {
  function doDelete(req, res, path) {
  function handleRequest(req, res) {
*/
