var remotestorageServer = require('../lib/remotestorage-server'),
  nodeunit = require('nodeunit');
  
function setUp() {
  this.tokenStore = {
    _data: {},
    get: function(key) { return this._data[key]; },
    set: function(key, value) { this._data[key] = value; }
  };
  this.dataStore = {
    _data: {},
    get: function(key) { return this._data[key]; },
    set: function(key, value) { this._data[key] = value; }
  };
  this.server00 = remotestorageServer.createServer('draft-dejong-remotestorage-00', this.tokenStore, this.dataStore);
  this.server01 = remotestorageServer.createServer('draft-dejong-remotestorage-01', this.tokenStore, this.dataStore);
  this.server02 = remotestorageServer.createServer('draft-dejong-remotestorage-02', this.tokenStore, this.dataStore);
  this.server03 = remotestorageServer.createServer('draft-dejong-remotestorage-03', this.tokenStore, this.dataStore);
}

exports['scopes'] = nodeunit.testCase({
  /*setUp: function() {
  },
  tearDown: function() {
  },*/
  'makeScopePaths for modules': function (test) {
    setUp.bind(this)();
    test.expect(4);
    test.deepEqual(this.server00.makeScopePaths('me', ['foo:r', 'bar:rw']).sort(), ['me/foo/:r', 'me/public/foo/:r', 'me/bar/:rw', 'me/public/bar/:rw'].sort());
    test.deepEqual(this.server01.makeScopePaths('me', ['foo:r', 'bar:rw']).sort(), ['me/foo/:r', 'me/public/foo/:r', 'me/bar/:rw', 'me/public/bar/:rw'].sort());
    test.deepEqual(this.server02.makeScopePaths('me', ['foo:r', 'bar:rw']).sort(), ['me/foo/:r', 'me/public/foo/:r', 'me/bar/:rw', 'me/public/bar/:rw'].sort());
    test.deepEqual(this.server03.makeScopePaths('me', ['foo:r', 'bar:rw']).sort(), ['me/foo/:r', 'me/public/foo/:r', 'me/bar/:rw', 'me/public/bar/:rw'].sort());
    test.done();
  },
  'makeScopePaths for root': function (test) {
    setUp.bind(this)();
    test.expect(8);
    test.deepEqual(this.server00.makeScopePaths('me', [':r']), ['me/:r']);
    test.deepEqual(this.server00.makeScopePaths('me', [':rw']), ['me/:rw']);
    test.deepEqual(this.server01.makeScopePaths('me', [':r']), ['me/:r']);
    test.deepEqual(this.server01.makeScopePaths('me', [':rw']), ['me/:rw']);
    test.deepEqual(this.server02.makeScopePaths('me', [':r']), ['me/:r']);
    test.deepEqual(this.server02.makeScopePaths('me', [':rw']), ['me/:rw']);
    test.deepEqual(this.server03.makeScopePaths('me', [':r']), ['me/:r']);
    test.deepEqual(this.server03.makeScopePaths('me', [':rw']), ['me/:rw']);
    test.done();
  },
  'mayRead for foo:r': function(test) {
    setUp.bind(this)();
    test.expect(4*46);
    var i, server;
    for (i=0; i<4; i++) {
      server = [this.server00, this.server01, this.server02, this.server03][i];
      this.tokenStore._data = { 'SECRET': server.makeScopePaths('me', ['foo:r'])};
      //foo:
      test.equal(server.mayRead('Bearer SECRET', 'me/foo/'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/foo/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/foo/bar'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/foo/bar'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/foo/bar/'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/foo/bar/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/public/foo/'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/public/foo/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/public/foo/bar'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/public/foo/bar'), true);//public
      test.equal(server.mayRead('Bearer SECRET', 'me/public/foo/bar/'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/public/foo/bar/'), false);
      //bar:
      test.equal(server.mayRead('Bearer SECRET', 'me/bar/'), false);
      test.equal(server.mayRead('Bearer wrong', 'me/bar/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/bar/bar'), false);
      test.equal(server.mayRead('Bearer wrong', 'me/bar/bar'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/bar/bar/'), false);
      test.equal(server.mayRead('Bearer wrong', 'me/bar/bar/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/public/bar/'), false);
      test.equal(server.mayRead('Bearer wrong', 'me/public/bar/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/public/bar/bar'), true);//public
      test.equal(server.mayRead('Bearer wrong', 'me/public/bar/bar'), true);//public
      test.equal(server.mayRead('Bearer SECRET', 'me/public/bar/bar/'), false);
      test.equal(server.mayRead('Bearer wrong', 'me/public/bar/bar/'), false);
      //root:
      test.equal(server.mayRead('Bearer SECRET', 'me/'), false);
      test.equal(server.mayRead('Bearer wrong', 'me/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/foo'), false);
      test.equal(server.mayRead('Bearer wrong', 'me/bar'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/bar'), false);
      test.equal(server.mayRead('Bearer wrong', 'me/foo'), false);
      //outside:
      test.equal(server.mayRead('Bearer SECRET', ''), false);
      test.equal(server.mayRead('Bearer wrong', ''), false);
      test.equal(server.mayRead('Bearer SECRET', 'me'), false);
      test.equal(server.mayRead('Bearer wrong', 'me'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you'), false);
      test.equal(server.mayRead('Bearer wrong', 'you'), false);
      //other users:
      test.equal(server.mayRead('Bearer SECRET', 'you/'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you/foo'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/foo'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you/foo/'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/foo/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you/foo/bar'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/foo/bar'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you/foo/bar/'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/foo/bar/'), false);
    }
    test.done();
  },
  'mayRead for foo:rw': function(test) {
    setUp.bind(this)();
    test.expect(4*46);
    var i, server;
    for (i=0; i<4; i++) {
      server = [this.server00, this.server01, this.server02, this.server03][i];
      this.tokenStore._data = { 'SECRET': server.makeScopePaths('me', ['foo:rw'])};
      //foo:
      test.equal(server.mayRead('Bearer SECRET', 'me/foo/'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/foo/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/foo/bar'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/foo/bar'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/foo/bar/'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/foo/bar/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/public/foo/'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/public/foo/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/public/foo/bar'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/public/foo/bar'), true);//public
      test.equal(server.mayRead('Bearer SECRET', 'me/public/foo/bar/'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/public/foo/bar/'), false);
      //bar:
      test.equal(server.mayRead('Bearer SECRET', 'me/bar/'), false);
      test.equal(server.mayRead('Bearer wrong', 'me/bar/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/bar/bar'), false);
      test.equal(server.mayRead('Bearer wrong', 'me/bar/bar'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/bar/bar/'), false);
      test.equal(server.mayRead('Bearer wrong', 'me/bar/bar/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/public/bar/'), false);
      test.equal(server.mayRead('Bearer wrong', 'me/public/bar/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/public/bar/bar'), true);//public
      test.equal(server.mayRead('Bearer wrong', 'me/public/bar/bar'), true);//public
      test.equal(server.mayRead('Bearer SECRET', 'me/public/bar/bar/'), false);
      test.equal(server.mayRead('Bearer wrong', 'me/public/bar/bar/'), false);
      //root:
      test.equal(server.mayRead('Bearer SECRET', 'me/'), false);
      test.equal(server.mayRead('Bearer wrong', 'me/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/foo'), false);
      test.equal(server.mayRead('Bearer wrong', 'me/bar'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/bar'), false);
      test.equal(server.mayRead('Bearer wrong', 'me/foo'), false);
      //outside:
      test.equal(server.mayRead('Bearer SECRET', ''), false);
      test.equal(server.mayRead('Bearer wrong', ''), false);
      test.equal(server.mayRead('Bearer SECRET', 'me'), false);
      test.equal(server.mayRead('Bearer wrong', 'me'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you'), false);
      test.equal(server.mayRead('Bearer wrong', 'you'), false);
      //other users:
      test.equal(server.mayRead('Bearer SECRET', 'you/'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you/foo'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/foo'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you/foo/'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/foo/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you/foo/bar'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/foo/bar'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you/foo/bar/'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/foo/bar/'), false);
    }
    test.done();
  },
  'mayWrite for foo:r': function(test) {
    setUp.bind(this)();
    test.expect(4*46);
    var i, server;
    for (i=0; i<4; i++) {
      server = [this.server00, this.server01, this.server02, this.server03][i];
      this.tokenStore._data = { 'SECRET': server.makeScopePaths('me', ['foo:r'])};
      //foo:
      test.equal(server.mayWrite('Bearer SECRET', 'me/foo/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/foo/'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/foo/bar'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/foo/bar'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/foo/bar/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/foo/bar/'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/public/foo/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/public/foo/'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/public/foo/bar'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/public/foo/bar'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/public/foo/bar/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/public/foo/bar/'), false);
      //bar:
      test.equal(server.mayWrite('Bearer SECRET', 'me/bar/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/bar/'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/bar/bar'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/bar/bar'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/bar/bar/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/bar/bar/'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/public/bar/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/public/bar/'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/public/bar/bar'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/public/bar/bar'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/public/bar/bar/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/public/bar/bar/'), false);
      //root:
      test.equal(server.mayRead('Bearer SECRET', 'me/'), false);
      test.equal(server.mayRead('Bearer wrong', 'me/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/foo'), false);
      test.equal(server.mayRead('Bearer wrong', 'me/bar'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/bar'), false);
      test.equal(server.mayRead('Bearer wrong', 'me/foo'), false);
      //outside:
      test.equal(server.mayRead('Bearer SECRET', ''), false);
      test.equal(server.mayRead('Bearer wrong', ''), false);
      test.equal(server.mayRead('Bearer SECRET', 'me'), false);
      test.equal(server.mayRead('Bearer wrong', 'me'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you'), false);
      test.equal(server.mayRead('Bearer wrong', 'you'), false);
      //other users:
      test.equal(server.mayRead('Bearer SECRET', 'you/'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you/foo'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/foo'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you/foo/'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/foo/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you/foo/bar'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/foo/bar'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you/foo/bar/'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/foo/bar/'), false);
    }
    test.done();
  },
  'mayWrite for foo:rw': function(test) {
    setUp.bind(this)();
    test.expect(4*46);
    var i, server;
    for (i=0; i<4; i++) {
      server = [this.server00, this.server01, this.server02, this.server03][i];
      this.tokenStore._data = { 'SECRET': server.makeScopePaths('me', ['foo:rw'])};
      //foo:
      test.equal(server.mayWrite('Bearer SECRET', 'me/foo/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/foo/'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/foo/bar'), true);
      test.equal(server.mayWrite('Bearer wrong', 'me/foo/bar'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/foo/bar/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/foo/bar/'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/public/foo/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/public/foo/'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/public/foo/bar'), true);
      test.equal(server.mayWrite('Bearer wrong', 'me/public/foo/bar'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/public/foo/bar/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/public/foo/bar/'), false);
      //bar:
      test.equal(server.mayWrite('Bearer SECRET', 'me/bar/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/bar/'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/bar/bar'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/bar/bar'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/bar/bar/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/bar/bar/'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/public/bar/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/public/bar/'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/public/bar/bar'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/public/bar/bar'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/public/bar/bar/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/public/bar/bar/'), false);
      //root:
      test.equal(server.mayRead('Bearer SECRET', 'me/'), false);
      test.equal(server.mayRead('Bearer wrong', 'me/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/foo'), false);
      test.equal(server.mayRead('Bearer wrong', 'me/bar'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/bar'), false);
      test.equal(server.mayRead('Bearer wrong', 'me/foo'), false);
      //outside:
      test.equal(server.mayRead('Bearer SECRET', ''), false);
      test.equal(server.mayRead('Bearer wrong', ''), false);
      test.equal(server.mayRead('Bearer SECRET', 'me'), false);
      test.equal(server.mayRead('Bearer wrong', 'me'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you'), false);
      test.equal(server.mayRead('Bearer wrong', 'you'), false);
      //other users:
      test.equal(server.mayRead('Bearer SECRET', 'you/'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you/foo'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/foo'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you/foo/'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/foo/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you/foo/bar'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/foo/bar'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you/foo/bar/'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/foo/bar/'), false);
    }
    test.done();
  },
  'mayRead for :r': function(test) {
    setUp.bind(this)();
    test.expect(4*34);
    var i, server;
    for (i=0; i<4; i++) {
      server = [this.server00, this.server01, this.server02, this.server03][i];
      this.tokenStore._data = { 'SECRET': server.makeScopePaths('me', [':r'])};
      //foo:
      test.equal(server.mayRead('Bearer SECRET', 'me/foo/'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/foo/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/foo/bar'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/foo/bar'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/foo/bar/'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/foo/bar/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/public/foo/'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/public/foo/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/public/foo/bar'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/public/foo/bar'), true);//public
      test.equal(server.mayRead('Bearer SECRET', 'me/public/foo/bar/'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/public/foo/bar/'), false);
      //root:
      test.equal(server.mayRead('Bearer SECRET', 'me/'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/foo'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/bar'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/bar'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/foo'), false);
      //outside:
      test.equal(server.mayRead('Bearer SECRET', ''), false);
      test.equal(server.mayRead('Bearer wrong', ''), false);
      test.equal(server.mayRead('Bearer SECRET', 'me'), false);
      test.equal(server.mayRead('Bearer wrong', 'me'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you'), false);
      test.equal(server.mayRead('Bearer wrong', 'you'), false);
      //other users:
      test.equal(server.mayRead('Bearer SECRET', 'you/'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you/foo'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/foo'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you/foo/'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/foo/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you/foo/bar'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/foo/bar'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you/foo/bar/'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/foo/bar/'), false);
    }
    test.done();
  },
  'mayRead for :rw': function(test) {
    setUp.bind(this)();
    test.expect(4*34);
    var i, server;
    for (i=0; i<4; i++) {
      server = [this.server00, this.server01, this.server02, this.server03][i];
      this.tokenStore._data = { 'SECRET': server.makeScopePaths('me', [':rw'])};
      //foo:
      test.equal(server.mayRead('Bearer SECRET', 'me/foo/'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/foo/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/foo/bar'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/foo/bar'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/foo/bar/'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/foo/bar/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/public/foo/'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/public/foo/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/public/foo/bar'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/public/foo/bar'), true);//public
      test.equal(server.mayRead('Bearer SECRET', 'me/public/foo/bar/'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/public/foo/bar/'), false);
      //root:
      test.equal(server.mayRead('Bearer SECRET', 'me/'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/foo'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/bar'), false);
      test.equal(server.mayRead('Bearer SECRET', 'me/bar'), true);
      test.equal(server.mayRead('Bearer wrong', 'me/foo'), false);
      //outside:
      test.equal(server.mayRead('Bearer SECRET', ''), false);
      test.equal(server.mayRead('Bearer wrong', ''), false);
      test.equal(server.mayRead('Bearer SECRET', 'me'), false);
      test.equal(server.mayRead('Bearer wrong', 'me'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you'), false);
      test.equal(server.mayRead('Bearer wrong', 'you'), false);
      //other users:
      test.equal(server.mayRead('Bearer SECRET', 'you/'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you/foo'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/foo'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you/foo/'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/foo/'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you/foo/bar'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/foo/bar'), false);
      test.equal(server.mayRead('Bearer SECRET', 'you/foo/bar/'), false);
      test.equal(server.mayRead('Bearer wrong', 'you/foo/bar/'), false);
    }
    test.done();
  },
  'mayWrite for :r': function(test) {
    setUp.bind(this)();
    test.expect(4*34);
    var i, server;
    for (i=0; i<4; i++) {
      server = [this.server00, this.server01, this.server02, this.server03][i];
      this.tokenStore._data = { 'SECRET': server.makeScopePaths('me', [':r'])};
      //foo:
      test.equal(server.mayWrite('Bearer SECRET', 'me/foo/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/foo/'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/foo/bar'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/foo/bar'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/foo/bar/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/foo/bar/'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/public/foo/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/public/foo/'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/public/foo/bar'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/public/foo/bar'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/public/foo/bar/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/public/foo/bar/'), false);
      //root:
      test.equal(server.mayWrite('Bearer SECRET', 'me/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/foo'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/bar'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/bar'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/foo'), false);
      //outside:
      test.equal(server.mayWrite('Bearer SECRET', ''), false);
      test.equal(server.mayWrite('Bearer wrong', ''), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'you'), false);
      test.equal(server.mayWrite('Bearer wrong', 'you'), false);
      //other users:
      test.equal(server.mayWrite('Bearer SECRET', 'you/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'you/'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'you/foo'), false);
      test.equal(server.mayWrite('Bearer wrong', 'you/foo'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'you/foo/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'you/foo/'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'you/foo/bar'), false);
      test.equal(server.mayWrite('Bearer wrong', 'you/foo/bar'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'you/foo/bar/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'you/foo/bar/'), false);
    }
    test.done();
  },
  'mayWrite for :rw': function(test) {
    setUp.bind(this)();
    test.expect(4*34);
    var i, server;
    for (i=0; i<4; i++) {
      server = [this.server00, this.server01, this.server02, this.server03][i];
      this.tokenStore._data = { 'SECRET': server.makeScopePaths('me', [':rw'])};
      //foo:
      test.equal(server.mayWrite('Bearer SECRET', 'me/foo/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/foo/'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/foo/bar'), true);
      test.equal(server.mayWrite('Bearer wrong', 'me/foo/bar'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/foo/bar/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/foo/bar/'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/public/foo/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/public/foo/'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/public/foo/bar'), true);
      test.equal(server.mayWrite('Bearer wrong', 'me/public/foo/bar'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/public/foo/bar/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/public/foo/bar/'), false);
      //root:
      test.equal(server.mayWrite('Bearer SECRET', 'me/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me/'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/foo'), true);
      test.equal(server.mayWrite('Bearer wrong', 'me/bar'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me/bar'), true);
      test.equal(server.mayWrite('Bearer wrong', 'me/foo'), false);
      //outside:
      test.equal(server.mayWrite('Bearer SECRET', ''), false);
      test.equal(server.mayWrite('Bearer wrong', ''), false);
      test.equal(server.mayWrite('Bearer SECRET', 'me'), false);
      test.equal(server.mayWrite('Bearer wrong', 'me'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'you'), false);
      test.equal(server.mayWrite('Bearer wrong', 'you'), false);
      //other users:
      test.equal(server.mayWrite('Bearer SECRET', 'you/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'you/'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'you/foo'), false);
      test.equal(server.mayWrite('Bearer wrong', 'you/foo'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'you/foo/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'you/foo/'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'you/foo/bar'), false);
      test.equal(server.mayWrite('Bearer wrong', 'you/foo/bar'), false);
      test.equal(server.mayWrite('Bearer SECRET', 'you/foo/bar/'), false);
      test.equal(server.mayWrite('Bearer wrong', 'you/foo/bar/'), false);
    }
    test.done();
  }
});
