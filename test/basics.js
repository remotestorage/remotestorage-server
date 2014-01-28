var remotestorageServer = require('../lib/remotestorage-server');

exports['createServer accepts version string "draft-dejong-remotestorage-00"'] = function(test) {
  var server = remotestorageServer.createServer('draft-dejong-remotestorage-00', {}, {});
  test.equal(!!server, true);
  test.done();
};
exports['createServer accepts version string "draft-dejong-remotestorage-01"'] = function(test) {
  var server = remotestorageServer.createServer('draft-dejong-remotestorage-01', {}, {});
  test.equal(!!server, true);
  test.done();
};
exports['createServer supports version string "draft-dejong-remotestorage-02"'] = function(test) {
  var server = remotestorageServer.createServer('draft-dejong-remotestorage-02', {}, {});
  test.equal(!!server, true);
  test.done();
};
exports['createServer supports version string "draft-dejong-remotestorage-03"'] = function(test) {
  var server = remotestorageServer.createServer('draft-dejong-remotestorage-03', {}, {});
  test.equal(!!server, true);
  test.done();
};
exports['createServer throws an error for unknown version strings'] = function(test) {
  test.throws(function() {remotestorageServer.createServer('draft-dejong-remotestorage-04', {}, {})});
  test.done();
};
