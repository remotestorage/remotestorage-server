var requests = require('../lib/requests'),
  nodeunit = require('nodeunit');
  
function setUp() {
  this.scopesMock = {
  };
  this.mainMock = {
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
    end: function() {
      this._ended = true;
    }
  };
  this.requestsInstance = requests.createInstance(this.scopesMock, this.mainMock);
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
  'writeRaw': function (test) {
    setUp.bind(this)();
    this.requestsInstance.respond(this.res, 'application/json', 'https://foo.bar', 408, '123');
    test.equal(this.res._status, 408);
    test.deepEqual(this.res._headers, {
      'Access-Control-Allow-Origin': 'https://foo.bar',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, If-Match, If-None-Match',
      'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
      Expires: '0',
      etag: '"123"'
    });
    test.equal(this.res._body, '');
    test.equal(this.res._ended, true);
    test.done();
  }
});
/*
  function respond(res, origin, status, etag) {
  function checkNoFolder(req, res, path) {
  function checkMayRead(req, res, path) {
  function checkMayWrite(req, res, path) {
  function checkCondMet(req, res, path) {
  function checkFound(req, res, path) {
  function doHead(req, res, path) {
  function doGet(req, res, path, folderFormat, folderContentType) {
  function doPut(req, res, path) {
    req.on('data', function(chunk) {
    req.on('end', function() {
  function doDelete(req, res, path) {
  function handleRequest(req, res) {
*/
