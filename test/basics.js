var RemotestorageServer = require('../lib/remotestorage-server');

exports['RemotestorageServer constuctor accepts version string "draft-dejong-remotestorage-00"'] = function(test) {
  var server = new RemotestorageServer('draft-dejong-remotestorage-00', {}, {});
  test.equal(!!server, true);
  test.done();
};
exports['RemotestorageServer constuctor accepts version string "draft-dejong-remotestorage-01"'] = function(test) {
  var server = new RemotestorageServer('draft-dejong-remotestorage-01', {}, {});
  test.equal(!!server, true);
  test.done();
};
exports['RemotestorageServer constuctor supports version string "draft-dejong-remotestorage-02"'] = function(test) {
  var server = new RemotestorageServer('draft-dejong-remotestorage-02', {}, {});
  test.equal(!!server, true);
  test.done();
};
exports['RemotestorageServer constuctor supports version string "draft-dejong-remotestorage-03"'] = function(test) {
  var server = new RemotestorageServer('draft-dejong-remotestorage-03', {}, {});
  test.equal(!!server, true);
  test.done();
};
exports['RemotestorageServer constuctor supports version string "draft-dejong-remotestorage-04"'] = function(test) {
  var server = new RemotestorageServer('draft-dejong-remotestorage-03', {}, {});
  test.equal(!!server, true);
  test.done();
};
