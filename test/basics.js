var remotestorageServer = require('../lib/remotestorage-server');

exports['createServer creates a server'] = function (test) {
  var server = remotestorageServer.createServer({}, {});
  test.equal(!!server, true);
  test.done();
};
