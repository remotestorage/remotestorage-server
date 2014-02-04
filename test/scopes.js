var Scopes = require('../lib/scopes'),
  nodeunit = require('nodeunit');
  
function setUp() {
  this.tokenStore = {
    _data: {},
    get: function(key, cb) { cb(null, this._data[key]); },
    set: function(key, value, cb) { this._data[key] = value; cb(null); }
  };
  this.scopesInstance = new Scopes(this.tokenStore);
}

exports['scopes'] = nodeunit.testCase({
  /*setUp: function() {
  },
  tearDown: function() {
  },*/
  'makeScopePaths for modules': function(test) {
    setUp.bind(this)();
    test.expect(1);
    test.deepEqual(this.scopesInstance.makeScopePaths('me', ['foo:r', 'bar:rw']).sort(), ['me/foo/:r', 'me/public/foo/:r', 'me/bar/:rw', 'me/public/bar/:rw'].sort());
    test.done();
  },
  'makeScopePaths for root': function(test) {
    setUp.bind(this)();
    test.expect(2);
    test.deepEqual(this.scopesInstance.makeScopePaths('me', ['*:r'], '*'), ['me/:r']);
    test.deepEqual(this.scopesInstance.makeScopePaths('me', ['root:rw'], 'root'), ['me/:rw']);
    test.done();
  },
/*  'mayRead for foo:r': function(test) {
    setUp.bind(this)();
    test.expect(46);
    this.tokenStore._data = { 'SECRET': this.scopesInstance.makeScopePaths('me', ['foo:r'])};
    //foo:
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/foo/'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/foo/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/foo/bar'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/foo/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/foo/bar/'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/foo/bar/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/public/foo/'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/public/foo/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/public/foo/bar'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/public/foo/bar'), true);//public
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/public/foo/bar/'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/public/foo/bar/'), false);
    //bar:
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/bar/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/bar/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/bar/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/bar/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/bar/bar/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/bar/bar/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/public/bar/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/public/bar/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/public/bar/bar'), true);//public
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/public/bar/bar'), true);//public
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/public/bar/bar/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/public/bar/bar/'), false);
    //root:
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/foo'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/foo'), false);
    //outside:
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', ''), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', ''), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you'), false);
    //other users:
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/foo'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/foo'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/foo/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/foo/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/foo/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/foo/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/foo/bar/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/foo/bar/'), false);
    test.done();
  },
  'mayRead for foo:rw': function(test) {
    setUp.bind(this)();
    test.expect(46);
    this.tokenStore._data = { 'SECRET': this.scopesInstance.makeScopePaths('me', ['foo:rw'])};
    //foo:
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/foo/'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/foo/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/foo/bar'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/foo/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/foo/bar/'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/foo/bar/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/public/foo/'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/public/foo/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/public/foo/bar'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/public/foo/bar'), true);//public
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/public/foo/bar/'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/public/foo/bar/'), false);
    //bar:
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/bar/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/bar/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/bar/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/bar/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/bar/bar/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/bar/bar/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/public/bar/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/public/bar/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/public/bar/bar'), true);//public
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/public/bar/bar'), true);//public
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/public/bar/bar/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/public/bar/bar/'), false);
    //root:
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/foo'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/foo'), false);
    //outside:
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', ''), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', ''), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you'), false);
    //other users:
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/foo'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/foo'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/foo/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/foo/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/foo/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/foo/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/foo/bar/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/foo/bar/'), false);
    test.done();
  },
  'mayWrite for foo:r': function(test) {
    setUp.bind(this)();
    test.expect(46);
    this.tokenStore._data = { 'SECRET': this.scopesInstance.makeScopePaths('me', ['foo:r'])};
    //foo:
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/foo/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/foo/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/foo/bar'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/foo/bar'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/foo/bar/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/foo/bar/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/public/foo/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/public/foo/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/public/foo/bar'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/public/foo/bar'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/public/foo/bar/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/public/foo/bar/'), false);
    //bar:
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/bar/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/bar/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/bar/bar'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/bar/bar'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/bar/bar/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/bar/bar/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/public/bar/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/public/bar/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/public/bar/bar'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/public/bar/bar'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/public/bar/bar/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/public/bar/bar/'), false);
    //root:
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/foo'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/foo'), false);
    //outside:
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', ''), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', ''), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you'), false);
    //other users:
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/foo'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/foo'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/foo/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/foo/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/foo/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/foo/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/foo/bar/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/foo/bar/'), false);
    test.done();
  },
  'mayWrite for foo:rw': function(test) {
    setUp.bind(this)();
    test.expect(46);
    this.tokenStore._data = { 'SECRET': this.scopesInstance.makeScopePaths('me', ['foo:rw'])};
    //foo:
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/foo/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/foo/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/foo/bar'), true);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/foo/bar'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/foo/bar/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/foo/bar/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/public/foo/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/public/foo/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/public/foo/bar'), true);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/public/foo/bar'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/public/foo/bar/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/public/foo/bar/'), false);
    //bar:
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/bar/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/bar/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/bar/bar'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/bar/bar'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/bar/bar/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/bar/bar/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/public/bar/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/public/bar/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/public/bar/bar'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/public/bar/bar'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/public/bar/bar/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/public/bar/bar/'), false);
    //root:
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/foo'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/foo'), false);
    //outside:
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', ''), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', ''), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you'), false);
    //other users:
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/foo'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/foo'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/foo/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/foo/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/foo/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/foo/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/foo/bar/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/foo/bar/'), false);
    test.done();
  },
  'mayRead for :r': function(test) {
    setUp.bind(this)();
    test.expect(34);
    this.tokenStore._data = { 'SECRET': this.scopesInstance.makeScopePaths('me', ['root:r'], 'root')};
    //foo:
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/foo/'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/foo/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/foo/bar'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/foo/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/foo/bar/'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/foo/bar/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/public/foo/'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/public/foo/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/public/foo/bar'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/public/foo/bar'), true);//public
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/public/foo/bar/'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/public/foo/bar/'), false);
    //root:
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/foo'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/bar'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/foo'), false);
    //outside:
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', ''), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', ''), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you'), false);
    //other users:
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/foo'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/foo'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/foo/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/foo/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/foo/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/foo/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/foo/bar/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/foo/bar/'), false);
    test.done();
  },
  'mayRead for :rw': function(test) {
    setUp.bind(this)();
    test.expect(34);
    this.tokenStore._data = { 'SECRET': this.scopesInstance.makeScopePaths('me', ['root:rw'], 'root')};
    //foo:
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/foo/'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/foo/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/foo/bar'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/foo/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/foo/bar/'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/foo/bar/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/public/foo/'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/public/foo/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/public/foo/bar'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/public/foo/bar'), true);//public
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/public/foo/bar/'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/public/foo/bar/'), false);
    //root:
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/foo'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me/bar'), true);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me/foo'), false);
    //outside:
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', ''), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', ''), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'me'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'me'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you'), false);
    //other users:
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/foo'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/foo'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/foo/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/foo/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/foo/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/foo/bar'), false);
    test.equal(this.scopesInstance.mayRead('Bearer SECRET', 'you/foo/bar/'), false);
    test.equal(this.scopesInstance.mayRead('Bearer wrong', 'you/foo/bar/'), false);
    test.done();
  },
  'mayWrite for :r': function(test) {
    setUp.bind(this)();
    test.expect(34);
    this.tokenStore._data = { 'SECRET': this.scopesInstance.makeScopePaths('me', ['*:r'], '*')};
    //foo:
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/foo/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/foo/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/foo/bar'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/foo/bar'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/foo/bar/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/foo/bar/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/public/foo/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/public/foo/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/public/foo/bar'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/public/foo/bar'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/public/foo/bar/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/public/foo/bar/'), false);
    //root:
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/foo'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/bar'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me/bar'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me/foo'), false);
    //outside:
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', ''), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', ''), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'me'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'me'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'you'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'you'), false);
    //other users:
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'you/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'you/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'you/foo'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'you/foo'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'you/foo/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'you/foo/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'you/foo/bar'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'you/foo/bar'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer SECRET', 'you/foo/bar/'), false);
    test.equal(this.scopesInstance.mayWrite('Bearer wrong', 'you/foo/bar/'), false);
    test.done();
  },*/
  'mayWrite for :rw - foo': function(test) {
    setUp.bind(this)();
    test.expect(24);
    this.tokenStore._data = { 'SECRET': this.scopesInstance.makeScopePaths('me', ['*:rw'], '*')};
    this.scopesInstance.mayWrite('Bearer SECRET', 'me/foo/', function(err, answer) {
      test.equal(err, null);
      test.equal(answer, false);
      this.scopesInstance.mayWrite('Bearer wrong', 'me/foo/', function(err, answer) {
        test.equal(err, null);
        test.equal(answer, false);
        this.scopesInstance.mayWrite('Bearer SECRET', 'me/foo/bar', function(err, answer) {
          test.equal(err, null);
          test.equal(answer, true);
          this.scopesInstance.mayWrite('Bearer wrong', 'me/foo/bar', function(err, answer) {
            test.equal(err, null);
            test.equal(answer, false);
            this.scopesInstance.mayWrite('Bearer SECRET', 'me/foo/bar/', function(err, answer) {
              test.equal(err, null);
              test.equal(answer, false);
              this.scopesInstance.mayWrite('Bearer wrong', 'me/foo/bar/', function(err, answer) {
                test.equal(err, null);
                test.equal(answer, false);
                this.scopesInstance.mayWrite('Bearer SECRET', 'me/public/foo/', function(err, answer) {
                  test.equal(err, null);
                  test.equal(answer, false);
                  this.scopesInstance.mayWrite('Bearer wrong', 'me/public/foo/', function(err, answer) {
                    test.equal(err, null);
                    test.equal(answer, false);
                    this.scopesInstance.mayWrite('Bearer SECRET', 'me/public/foo/bar', function(err, answer) {
                      test.equal(err, null);
                      test.equal(answer, true);
                      this.scopesInstance.mayWrite('Bearer wrong', 'me/public/foo/bar', function(err, answer) {
                        test.equal(err, null);
                        test.equal(answer, false);
                        this.scopesInstance.mayWrite('Bearer SECRET', 'me/public/foo/bar/', function(err, answer) {
                          test.equal(err, null);
                          test.equal(answer, false);
                          this.scopesInstance.mayWrite('Bearer wrong', 'me/public/foo/bar/', function(err, answer) {
                            test.equal(err, null);
                            test.equal(answer, false);
                            test.done();
                          }.bind(this));
                        }.bind(this));
                      }.bind(this));
                    }.bind(this));
                  }.bind(this));
                }.bind(this));
              }.bind(this));
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }.bind(this));
  },
  'mayWrite for :rw - root': function(test) {
    setUp.bind(this)();
    test.expect(12);
    this.tokenStore._data = { 'SECRET': this.scopesInstance.makeScopePaths('me', ['*:rw'], '*')};
    this.scopesInstance.mayWrite('Bearer SECRET', 'me/', function(err, answer) {
      test.equal(err, null);
      test.equal(answer, false);
      this.scopesInstance.mayWrite('Bearer wrong', 'me/', function(err, answer) {
        test.equal(err, null);
        test.equal(answer, false);
        this.scopesInstance.mayWrite('Bearer SECRET', 'me/foo', function(err, answer) {
          test.equal(err, null);
          test.equal(answer, true);
          this.scopesInstance.mayWrite('Bearer wrong', 'me/bar', function(err, answer) {
            test.equal(err, null);
            test.equal(answer, false);
            this.scopesInstance.mayWrite('Bearer SECRET', 'me/bar', function(err, answer) {
              test.equal(err, null);
              test.equal(answer, true);
              this.scopesInstance.mayWrite('Bearer wrong', 'me/foo', function(err, answer) {
                test.equal(err, null);
                test.equal(answer, false);
                test.done();
              }.bind(this));
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }.bind(this));
  },
  'mayWrite for :rw - outside': function(test) {
    setUp.bind(this)();
    test.expect(12);
    this.scopesInstance.mayWrite('Bearer SECRET', '', function(err, answer) {
      test.equal(err, null);
      test.equal(answer, false);
      this.scopesInstance.mayWrite('Bearer wrong', '', function(err, answer) {
        test.equal(err, null);
        test.equal(answer, false);
        this.scopesInstance.mayWrite('Bearer SECRET', 'me', function(err, answer) {
          test.equal(err, null);
          test.equal(answer, false);
          this.scopesInstance.mayWrite('Bearer wrong', 'me', function(err, answer) {
            test.equal(err, null);
            test.equal(answer, false);
            this.scopesInstance.mayWrite('Bearer SECRET', 'you', function(err, answer) {
              test.equal(err, null);
              test.equal(answer, false);
              this.scopesInstance.mayWrite('Bearer wrong', 'you', function(err, answer) {
                test.equal(err, null);
                test.equal(answer, false);
                test.done();
              }.bind(this));
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }.bind(this));
  },
  'mayWrite for :rw - other users': function(test) {
    setUp.bind(this)();
    test.expect(20);
    this.scopesInstance.mayWrite('Bearer SECRET', 'you/', function(err, answer) {
      test.equal(err, null);
      test.equal(answer, false);
      this.scopesInstance.mayWrite('Bearer wrong', 'you/', function(err, answer) {
        test.equal(err, null);
        test.equal(answer, false);
        this.scopesInstance.mayWrite('Bearer SECRET', 'you/foo', function(err, answer) {
          test.equal(err, null);
          test.equal(answer, false);
          this.scopesInstance.mayWrite('Bearer wrong', 'you/foo', function(err, answer) {
            test.equal(err, null);
            test.equal(answer, false);
            this.scopesInstance.mayWrite('Bearer SECRET', 'you/foo/', function(err, answer) {
              test.equal(err, null);
              test.equal(answer, false);
              this.scopesInstance.mayWrite('Bearer wrong', 'you/foo/', function(err, answer) {
                test.equal(err, null);
                test.equal(answer, false);
                this.scopesInstance.mayWrite('Bearer SECRET', 'you/foo/bar', function(err, answer) {
                  test.equal(err, null);
                  test.equal(answer, false);
                  this.scopesInstance.mayWrite('Bearer wrong', 'you/foo/bar', function(err, answer) {
                    test.equal(err, null);
                    test.equal(answer, false);
                    this.scopesInstance.mayWrite('Bearer SECRET', 'you/foo/bar/', function(err, answer) {
                      test.equal(err, null);
                      test.equal(answer, false);
                      this.scopesInstance.mayWrite('Bearer wrong', 'you/foo/bar/', function(err, answer) {
                        test.equal(err, null);
                        test.equal(answer, false);
                        test.done();
                      }.bind(this));
                    }.bind(this));
                  }.bind(this));
                }.bind(this));
              }.bind(this));
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }
});
