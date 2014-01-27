var main = require('../lib/main'),
  nodeunit = require('nodeunit');
  
function setUp() {
  this.dataStore = {
    _data: {},
    get: function(key) { return this._data[key]; },
    set: function(key, value) { this._data[key] = value; }
  };
  this.mainInstance = main.createInstance(this.tokenStore);
}

exports['scopes'] = nodeunit.testCase({
  /*setUp: function() {
  },
  tearDown: function() {
  },*/
  'condMet': function (test) {
    setUp.bind(this)();
//    test.equal(this.mainInstance.condMet(
    test.done();
  },
  'revisionsToMap': function (test) {
    setUp.bind(this)();
    test.done();
  },
  'getFolderDescription': function (test) {
    setUp.bind(this)();
    test.done();
  },
  'exists': function (test) {
    setUp.bind(this)();
    test.done();
  },
  'getContent': function (test) {
    setUp.bind(this)();
    test.done();
  },
  'getContentType': function (test) {
    setUp.bind(this)();
    test.done();
  },
  'getVersion': function (test) {
    setUp.bind(this)();
    test.done();
  },
  'set': function (test) {
    setUp.bind(this)();
    test.done();
  }
});
