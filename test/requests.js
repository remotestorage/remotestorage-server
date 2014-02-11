var Requests = require('../lib/requests'),
  nodeunit = require('nodeunit');
  
function setUp() {
  this.scopesMock = {
    _mayReadCalled: 0,
    _mayWriteCalled: 0,
    mayRead: function(authHeader, username, path, cb) {
      this._mayReadCalled++;
      cb(null, (authHeader === 'asdfqwer-read' && path === '/qwer/asdf/read')
          || (authHeader === 'Bearer SECRET' && path === '/existing')
          || (authHeader === 'Bearer SECRET' && path === '/folder/'));
    },
    mayWrite: function(authHeader, username, path, cb) {
      this._mayWriteCalled++;
      cb(null, (authHeader === 'asdfqwer-write' && path === '/qwer/asdf/write')
          || (authHeader === 'Bearer SECRET' && path === '/existing')
          || (authHeader === 'Bearer SECRET' && path === '/folder/'));
    }
  };
  this.mainMock = {
    _condMetCalled: 0,
    _existsCalled: 0,
    _getRevisionCalled: 0,
    _getContentCalled: 0,
    _getFolderDescriptionCalled: 0,
    _getContentTypeCalled: 0,
    _setCalled: 0,
    _data: {},
    condMet: function(cond, username, path, cb) {
      this._condMetCalled++;
      cb(null, (cond.ifNoneMatch === '*' && path === '/qwer/asdf/cond')
          || (cond.ifNoneMatch === undefined && cond.ifMatch === undefined && path === '/existing')
          || (cond.ifNoneMatch === undefined && cond.ifMatch === undefined && path === '/folder/')
          || (Array.isArray(cond.ifNoneMatch) && cond.ifNoneMatch[0].toString('utf-8') === '123' && path === '/existing'));
    },
    exists: function(username, path, cb) {
      this._existsCalled++;
      cb(null, path === '/existing' || path === '/folder/');
    },
    getContent: function(username, path, cb) {
      this._getContentCalled++;
      cb(null, new Buffer('yes, very content!', 'utf-8'));
    },
    getFolderDescription: function(username, path, format, cb) {
      this._getFolderDescriptionCalled++;
      cb(null, {a: 'b'});
    },
    getContentType: function(username, path, cb) {
      this._getContentTypeCalled++;
      cb(null, new Buffer('very!', 'utf-8'));
    },
    getRevision: function(username, path, cb) {
      this._getRevisionCalled++;
      cb(null, new Buffer('koe', 'utf-8'));
    },
    set: function(username, path, buf, contentType, revision, cb) {
      console.log('mainMock set');
      this._setCalled++;
      this._data[username+':'+path] = [buf, contentType, revision];
      console.log('stored', buf, contentType, revision);
      cb(null);
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
  this.requestsInstance = new Requests('/path/to/storage/', this.scopesMock, this.mainMock);
}

exports['requests'] = nodeunit.testCase({
  /*setUp: function() {
  },
  tearDown: function() {
  },*/
  'writeHead': function(test) {
    setUp.bind(this)();
    this.requestsInstance.writeHead(this.res, 207, 'https://foo.bar', new Buffer('123', 'utf-8'), new Buffer('application/json', 'utf-8'), 456);
    test.equal(this.res._status, 207);
    test.deepEqual(this.res._headers, {
      'Access-Control-Allow-Origin': 'https://foo.bar',
      'Access-Control-Allow-Headers': 'Authorization, Content-Length, Content-Type, If-Match, If-None-Match, Origin, X-Requested-With',
      'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
      'Cache-Control': 'no-cache, no-store',
      Expires: '0',
      etag: '"123"',
      'content-type': 'application/json',
      'content-length': '456'
    });
    test.equal(this.res._body, '');
    test.equal(this.res._ended, false);
    test.done();
  },
  'writeRaw': function(test) {
    setUp.bind(this)();
    this.requestsInstance.writeRaw(this.res, new Buffer('application/json', 'utf-8'), new Buffer('asdf', 'utf-8'), 'https://foo.bar', new Buffer('123', 'utf-8'));
    test.equal(this.res._status, 200);
    test.deepEqual(this.res._headers, {
      'Access-Control-Allow-Origin': 'https://foo.bar',
      'Access-Control-Allow-Headers': 'Authorization, Content-Length, Content-Type, If-Match, If-None-Match, Origin, X-Requested-With',
      'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
      'Cache-Control': 'no-cache, no-store',
      Expires: '0',
      etag: '"123"',
      'content-type': 'application/json',
      'content-length': '4'
    });
    test.equal(this.res._body, 'asdf');
    test.done();
  },
  'respond': function(test) {
    setUp.bind(this)();
    this.requestsInstance.respond(this.res, 'https://foo.bar', 408, new Buffer('123', 'utf-8'));
    test.equal(this.res._status, 408);
    test.deepEqual(this.res._headers, {
      'Access-Control-Allow-Origin': 'https://foo.bar',
      'Access-Control-Allow-Headers': 'Authorization, Content-Length, Content-Type, If-Match, If-None-Match, Origin, X-Requested-With',
      'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
      'Cache-Control': 'no-cache, no-store',
      Expires: '0',
      etag: '"123"',
      'content-type': 'text/plain',
      'content-length': '20'
    });
    test.equal(this.res._body, '408 Computer says no');
    test.equal(this.res._ended, true);
    test.done();
  },
  'checkNoFolder': function(test) {
    setUp.bind(this)();
    test.expect(8);
    this.requestsInstance.checkNoFolder(this.req, this.res, 'me', '/foo', function(err, answer) {
      test.equal(err, null);
      test.equal(answer, true);
      test.equal(this.res._headers, undefined);
      test.equal(this.res._body, '');
      test.equal(this.res._ended, false);
      this.requestsInstance.checkNoFolder(this.req, this.res, 'me', '/foo/', function(err, answer) {
        test.equal(true, false);
      }.bind(this));
      test.deepEqual(this.res._headers, {
        'Access-Control-Allow-Origin': 'http://local.host',
        'Access-Control-Allow-Headers': 'Authorization, Content-Length, Content-Type, If-Match, If-None-Match, Origin, X-Requested-With',
        'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
        'Cache-Control': 'no-cache, no-store',
        Expires: '0',
        'content-type': 'text/plain',
        'content-length': '20'
      });
      test.equal(this.res._body, '400 Computer says no');
      test.equal(this.res._ended, true);
      test.done();
    }.bind(this));
  },
  'checkMayRead': function(test) {
    setUp.bind(this)();
    test.expect(12);
    this.req.headers.authorization = 'asdfqwer-read';
    this.requestsInstance.checkMayRead(this.req, this.res, 'me', '/qwer/asdf/read', function(err, answer) {
      test.equal(err, null);
      test.equal(answer, true);
      test.equal(this.scopesMock._mayReadCalled, 1);
      test.equal(this.res._status, undefined);
      test.equal(this.res._headers, undefined);
      test.equal(this.res._body, '');
      test.equal(this.res._ended, false);
      this.req.headers.authorization = 'asdfqwer-wrong';
      this.requestsInstance.checkMayRead(this.req, this.res, 'me', '/qwer/asdf/read', function(err, answer) {
        test.equal(true, false);
      }.bind(this));
      test.equal(this.scopesMock._mayReadCalled, 2);
      test.equal(this.res._status, 401);
      test.deepEqual(this.res._headers, {
        "Access-Control-Allow-Origin":"http://local.host",
        'Access-Control-Allow-Headers': 'Authorization, Content-Length, Content-Type, If-Match, If-None-Match, Origin, X-Requested-With',
        "Access-Control-Expose-Headers":"Content-Type, Content-Length, ETag",
        "Access-Control-Allow-Methods":"GET, PUT, DELETE",
        'Cache-Control': 'no-cache, no-store',
        "Expires":"0",
        'WWW-Authenticate': 'Bearer realm="remoteStorage" error="invalid_token"',
        "content-type":"text/plain",
        "content-length":"16"});
      test.equal(this.res._body, '401 Unauthorized');
      test.equal(this.res._ended, true);
      test.done();
    }.bind(this));
  },
  'checkMayWrite': function(test) {
    setUp.bind(this)();
    this.req.headers.authorization = 'asdfqwer-write';
    this.requestsInstance.checkMayWrite(this.req, this.res, 'me', '/qwer/asdf/write', function(err, answer) {
      test.equal(err, null);
      test.equal(answer, true);
      test.equal(this.scopesMock._mayWriteCalled, 1);
      test.equal(this.res._status, undefined);
      test.equal(this.res._headers, undefined);
      test.equal(this.res._body, '');
      test.equal(this.res._ended, false);
      this.req.headers.authorization = 'asdfqwer-wrong';
      this.requestsInstance.checkMayWrite(this.req, this.res, 'me', '/qwer/asdf/write', function(err, answer) {
        test.equal(false, true);
      });
      test.equal(this.scopesMock._mayWriteCalled, 2);
      test.equal(this.res._status, 401);
      test.deepEqual(this.res._headers, {
        "Access-Control-Allow-Origin":"http://local.host",
        'Access-Control-Allow-Headers': 'Authorization, Content-Length, Content-Type, If-Match, If-None-Match, Origin, X-Requested-With',
        "Access-Control-Expose-Headers":"Content-Type, Content-Length, ETag",
        "Access-Control-Allow-Methods":"GET, PUT, DELETE",
        'Cache-Control': 'no-cache, no-store',
        "Expires":"0",
        'WWW-Authenticate': 'Bearer realm="remoteStorage" error="invalid_token"',
        "content-type":"text/plain",
        "content-length":"16"});
      test.equal(this.res._body, '401 Unauthorized');
      test.equal(this.res._ended, true);
      test.done();
    }.bind(this));
  },
  'stripQuotes': function(test) {
    setUp.bind(this)();
    test.deepEqual(this.requestsInstance.stripQuotes(''), [new Buffer('', 'utf-8')]);
    test.deepEqual(this.requestsInstance.stripQuotes('""'), [new Buffer('', 'utf-8')]);
    test.deepEqual(this.requestsInstance.stripQuotes('"a"'), [new Buffer('a', 'utf-8')]);
    test.deepEqual(this.requestsInstance.stripQuotes('"a","b"'), [new Buffer('a', 'utf-8'), new Buffer('b', 'utf-8')]);
    test.deepEqual(this.requestsInstance.stripQuotes('a,b'), [new Buffer('a', 'utf-8'), new Buffer('b', 'utf-8')]);
    test.deepEqual(this.requestsInstance.stripQuotes('"asdf","qw er"'), [new Buffer('asdf', 'utf-8'), new Buffer('qw er', 'utf-8')]);
    test.deepEqual(this.requestsInstance.stripQuotes('as df,qwer'), [new Buffer('as df', 'utf-8'), new Buffer('qwer', 'utf-8')]);
    test.deepEqual(this.requestsInstance.stripQuotes('"asdf", "qw er"'), [new Buffer('asdf', 'utf-8'), new Buffer('qw er', 'utf-8')]);
    test.deepEqual(this.requestsInstance.stripQuotes('as df , qwer'), [new Buffer('as df', 'utf-8'), new Buffer('qwer', 'utf-8')]);
    test.deepEqual(this.requestsInstance.stripQuotes(' "asdf"  ,    "qw er"   '), [new Buffer('asdf', 'utf-8'), new Buffer('qw er', 'utf-8')]);
    test.deepEqual(this.requestsInstance.stripQuotes('   as df    ,qwer    '), [new Buffer('as df', 'utf-8'), new Buffer('qwer', 'utf-8')]);
    test.done();
  },
  'checkCondMet': function(test) {
    setUp.bind(this)();
    this.req.headers['if-none-match'] = '*';
    this.requestsInstance.checkCondMet(this.req, this.res, 'me', '/qwer/asdf/cond', 412, function(err, answer) {
      test.equal(err, null);
      test.equal(answer, true);
      test.equal(this.mainMock._condMetCalled, 1);
      test.equal(this.res._status, undefined);
      test.equal(this.res._headers, undefined);
      test.equal(this.res._body, '');
      test.equal(this.res._ended, false);
      this.req.headers = {};
      this.req.headers.authorization = 'asdfqwer-wrong';
      this.req.headers['if-match'] = 'aap';
      this.requestsInstance.checkCondMet(this.req, this.res, 'me', '/qwer/asdf/cond', 409, function(err, answer) {
        test.equal(false, true);
      });
      test.equal(this.mainMock._condMetCalled, 2);
      test.equal(this.res._status, 409);
      test.deepEqual(this.res._headers, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization, Content-Length, Content-Type, If-Match, If-None-Match, Origin, X-Requested-With',
        'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
        'Cache-Control': 'no-cache, no-store',
        'Expires': '0',
        'etag': '"koe"',
        'content-type': 'text/plain',
        'content-length': '20'});
      test.equal(this.res._body, '409 Computer says no');
      test.equal(this.res._ended, true);
      test.done();
    }.bind(this));
  },
  'checkFound': function(test) {
    setUp.bind(this)();
    this.req.headers = {
      origin: 'http://local.host'
    };
    this.requestsInstance.checkFound(this.req, this.res, 'me', '/existing', function(err, answer) {
      test.equal(err, null);
      test.equal(answer, true);
      test.equal(this.mainMock._existsCalled, 1);
      test.equal(this.res._status, undefined);
      test.equal(this.res._headers, undefined);
      test.equal(this.res._body, '');
      test.equal(this.res._ended, false);
      this.requestsInstance.checkFound(this.req, this.res, 'me', '/non-existing', function(err, answer) {
        test.equal(false, true);
      });
      test.equal(this.mainMock._existsCalled, 2);
      test.equal(this.res._status, 404);
      test.deepEqual(this.res._headers, {
        'Access-Control-Allow-Origin': 'http://local.host',
        'Access-Control-Allow-Headers': 'Authorization, Content-Length, Content-Type, If-Match, If-None-Match, Origin, X-Requested-With',
        'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
        'Cache-Control': 'no-cache, no-store',
        'Expires': '0',
        'content-type': 'text/plain',
        'content-length': '13'});
      test.equal(this.res._body, '404 Not Found');
      test.equal(this.res._ended, true);
      test.done();
    }.bind(this));
  },
  'illegal verb': function(test) {
    setUp.bind(this)();
    test.expect(6);
    this.res.onEnd(function() {
      test.equal(this.scopesMock._mayReadCalled, 0);
      test.equal(this.scopesMock._mayWriteCalled, 0);
      test.equal(this.res._status, 405);
      test.deepEqual(this.res._headers, {
        'Access-Control-Allow-Origin': 'http://local.host',
        'Access-Control-Allow-Headers': 'Authorization, Content-Length, Content-Type, If-Match, If-None-Match, Origin, X-Requested-With',
        'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
        'Cache-Control': 'no-cache, no-store',
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
  'OPTIONS verb': function(test) {
    setUp.bind(this)();
    test.expect(6);
    this.res.onEnd(function() {
      test.equal(this.scopesMock._mayReadCalled, 0);
      test.equal(this.scopesMock._mayWriteCalled, 0);
      test.equal(this.res._status, 200);
      test.deepEqual(this.res._headers, {
        'Access-Control-Allow-Origin': 'http://local.host',
        'Access-Control-Allow-Headers': 'Authorization, Content-Length, Content-Type, If-Match, If-None-Match, Origin, X-Requested-With',
        'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
        'Cache-Control': 'no-cache, no-store',
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
  'HEAD verb document': function(test) {
    setUp.bind(this)();
    test.expect(6);
    this.res.onEnd(function() {
      test.equal(this.scopesMock._mayReadCalled, 1);
      test.equal(this.scopesMock._mayWriteCalled, 0);
      test.equal(this.res._status, 200);
      test.deepEqual(this.res._headers, {
        'Access-Control-Allow-Origin': 'http://local.host',
        'Access-Control-Allow-Headers': 'Authorization, Content-Length, Content-Type, If-Match, If-None-Match, Origin, X-Requested-With',
        'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
        'Cache-Control': 'no-cache, no-store',
        'Expires': '0',
        'etag': '"koe"',
        'content-length': '18',
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
    this.requestsInstance.handleRequest(this.req, this.res, 'etags-only', new Buffer('asdf', 'utf-8'));
  },
  'HEAD verb folder': function(test) {
    setUp.bind(this)();
    test.expect(6);
    this.res.onEnd(function() {
      test.equal(this.scopesMock._mayReadCalled, 1);
      test.equal(this.scopesMock._mayWriteCalled, 0);
      test.equal(this.res._status, 200);
      test.deepEqual(this.res._headers, {
        'Access-Control-Allow-Origin': 'http://local.host',
        'Access-Control-Allow-Headers': 'Authorization, Content-Length, Content-Type, If-Match, If-None-Match, Origin, X-Requested-With',
        'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
        'Cache-Control': 'no-cache, no-store',
        'Expires': '0',
        'etag': '"koe"',
        'content-type': 'asdf'
      });
      test.equal(this.res._body, '');
      test.equal(this.res._ended, true);
      test.done();
    }.bind(this));
    this.req = {
      method: 'HEAD',
      url: '/path/to/storage/me/folder/',
      headers: {
        origin: 'http://local.host',
        authorization: 'Bearer SECRET'
      }
    };
    this.requestsInstance.handleRequest(this.req, this.res, 'etags-only', new Buffer('asdf', 'utf-8'));
  },
  'GET verb document': function(test) {
    setUp.bind(this)();
    test.expect(7);
    this.res.onEnd(function() {
      test.equal(this.scopesMock._mayReadCalled, 1);
      test.equal(this.scopesMock._mayWriteCalled, 0);
      test.equal(this.mainMock._getContentCalled, 1);
      test.equal(this.res._status, 200);
      test.deepEqual(this.res._headers, {
        'Access-Control-Allow-Origin': 'http://local.host',
        'Access-Control-Allow-Headers': 'Authorization, Content-Length, Content-Type, If-Match, If-None-Match, Origin, X-Requested-With',
        'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
        'Cache-Control': 'no-cache, no-store',
        'Expires': '0',
        'etag': '"koe"',
        'content-length': '18',
        'content-type': 'very!'
      });
      test.equal(this.res._body, 'yes, very content!');
      test.equal(this.res._ended, true);
      test.done();
    }.bind(this));
    this.req = {
      method: 'GET',
      url: '/path/to/storage/me/existing',
      headers: {
        origin: 'http://local.host',
        authorization: 'Bearer SECRET'
      }
    };
    this.requestsInstance.handleRequest(this.req, this.res, 'etags-only', new Buffer('asdf', 'utf-8'));
  },
  'GET verb folder': function(test) {
    setUp.bind(this)();
    test.expect(7);
    this.res.onEnd(function() {
      test.equal(this.scopesMock._mayReadCalled, 1);
      test.equal(this.scopesMock._mayWriteCalled, 0);
      test.equal(this.mainMock._getFolderDescriptionCalled, 1);
      test.equal(this.res._status, 200);
      test.deepEqual(this.res._headers, {
        'Access-Control-Allow-Origin': 'http://local.host',
        'Access-Control-Allow-Headers': 'Authorization, Content-Length, Content-Type, If-Match, If-None-Match, Origin, X-Requested-With',
        'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
        'Cache-Control': 'no-cache, no-store',
        'Expires': '0',
        'etag': '"koe"',
        'content-length': '9',
        'content-type': 'asdf'
      });
      test.equal(this.res._body, JSON.stringify({a: 'b'}));
      test.equal(this.res._ended, true);
      test.done();
    }.bind(this));
    this.req = {
      method: 'GET',
      url: '/path/to/storage/me/folder/',
      headers: {
        origin: 'http://local.host',
        authorization: 'Bearer SECRET'
      }
    };
    this.requestsInstance.handleRequest(this.req, this.res, 'etags-only', new Buffer('asdf', 'utf-8'));
  },
  'PUT verb': function(test) {
    setUp.bind(this)();
    test.expect(10);
    this.res.onEnd(function() {
      test.equal(this.scopesMock._mayReadCalled, 0);
      test.equal(this.scopesMock._mayWriteCalled, 1);
      test.equal(this.mainMock._setCalled, 1);
      test.equal(this.mainMock._data['me:/existing'][0], 'i put you');
      test.equal(this.mainMock._data['me:/existing'][1], undefined);
      test.equal(Buffer.isBuffer(this.mainMock._data['me:/existing'][2]), true);
      test.equal(this.res._status, 200);
      test.deepEqual(this.res._headers, {
        'Access-Control-Allow-Origin': 'http://local.host',
        'Access-Control-Allow-Headers': 'Authorization, Content-Length, Content-Type, If-Match, If-None-Match, Origin, X-Requested-With',
        'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
        'Cache-Control': 'no-cache, no-store',
        'Expires': '0',
        'etag': '"' + this.mainMock._data['me:/existing'][2] + '"'
      });
      test.equal(this.res._body, '');
      test.equal(this.res._ended, true);
      test.done();
    }.bind(this));
    this.req = {
      _queuedData: false,
      _dataCb: function(buf) {
        this._queuedData = buf;
      },
      _queuedEnd: false,
      _endCb: function() {
        this._queuedEnd = true;
      },
      method: 'PUT',
      url: '/path/to/storage/me/existing',
      headers: {
        origin: 'http://local.host',
        authorization: 'Bearer SECRET',
        'if-none-match': '"123", "456"'
      },
      on: function(event, cb) {
        if (event === 'data') {
          if(this._queuedData) {
            cb(this._queuedData);
          };
          this._dataCb = cb;
        } else if (event === 'end') {
          if(this._queuedEnd) {
            cb();
          };
          this._endCb = cb;
        }
      }
    };
    this.requestsInstance.handleRequest(this.req, this.res);
    this.req._dataCb(new Buffer('i put you', 'utf-8'));
    this.req._endCb();
  },
  'DELETE verb': function(test) {
    setUp.bind(this)();
    test.expect(10);
    this.res.onEnd(function() {
      test.equal(this.scopesMock._mayReadCalled, 0);
      test.equal(this.scopesMock._mayWriteCalled, 1);
      test.equal(this.mainMock._setCalled, 1);
      test.equal(this.mainMock._data['me:/existing'][0], undefined);
      test.equal(this.mainMock._data['me:/existing'][1], undefined);
      test.equal(this.mainMock._data['me:/existing'][2], undefined);
      test.equal(this.res._status, 200);
      test.deepEqual(this.res._headers, {
        'Access-Control-Allow-Origin': 'http://local.host',
        'Access-Control-Allow-Headers': 'Authorization, Content-Length, Content-Type, If-Match, If-None-Match, Origin, X-Requested-With',
        'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
        'Cache-Control': 'no-cache, no-store',
        'Expires': '0'
      });
      test.equal(this.res._body, '');
      test.equal(this.res._ended, true);
      test.done();
    }.bind(this));
    this.req = {
      method: 'DELETE',
      url: '/path/to/storage/me/existing',
      headers: {
        origin: 'http://local.host',
        authorization: 'Bearer SECRET',
        'if-none-match': '"123", "456"'
      }
    };
    this.requestsInstance.handleRequest(this.req, this.res);
  }
});
