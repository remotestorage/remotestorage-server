var main = require('../lib/main'),
  nodeunit = require('nodeunit');
  
function setUp() {
  this.dataStore = {
    _data: {},
    get: function(key) { return this._data[key]; },
    set: function(key, value) { this._data[key] = value; }
  };
  this.mainInstance = main.createInstance(this.dataStore);
  this.dataStore._data = {
    'content:/me/': {a: true, b: true, existing: true},
    'content:/me/a': new Buffer('blĳ', 'utf-8'),
    'content:/me/b': new Buffer('Unhošť', 'utf-8'),
    'content:/me/existing': 'hi',
    'contentType:/me/a': 'a-ish',
    'contentType:/me/b': 'b-ish',
    'contentType:/me/existing': 'hi',
    'revision:/me/': '123',
    'revision:/me/a': 'a',
    'revision:/me/b': 'b',
    'revision:/me/existing': 'hi',
  };
}

exports['scopes'] = nodeunit.testCase({
  /*setUp: function() {
  },
  tearDown: function() {
  },*/
  'condMet': function (test) {
    setUp.bind(this)();
    test.equal(this.mainInstance.condMet({ifNoneMatch: '*'}, '/me/existing'), false);
    test.equal(this.mainInstance.condMet({ifNoneMatch: '*'}, '/me/non-existing'), true);
    test.equal(this.mainInstance.condMet({ifNoneMatch: 'ho'}, '/me/existing'), true);
    test.equal(this.mainInstance.condMet({ifNoneMatch: 'he,ho'}, '/me/existing'), true);
    test.equal(this.mainInstance.condMet({ifNoneMatch: 'hi'}, '/me/existing'), false);
    test.equal(this.mainInstance.condMet({ifNoneMatch: 'he,hi'}, '/me/existing'), false);
    test.equal(this.mainInstance.condMet({ifNoneMatch: 'ho'}, '/me/non-existing'), true);
    test.equal(this.mainInstance.condMet({ifMatch: 'hi'}, '/me/existing'), true);
    test.equal(this.mainInstance.condMet({ifMatch: 'ho'}, '/me/existing'), false);
    test.equal(this.mainInstance.condMet({ifMatch: 'hi'}, '/me/non-existing'), false);
    test.done();
  },
  'revisionsToMap': function (test) {
    setUp.bind(this)();
    test.deepEqual(this.mainInstance.revisionsToMap({ a: 'a', b: 'b'}, '/me/'), {
      '@context': 'http://remotestorage.io/spec/folder-description',
      items: {
        a: {
          ETag: 'a',
          'Content-Type': 'a-ish',
          'Content-Length': 4
        },
        b: {
          ETag: 'b',
          'Content-Type': 'b-ish',
          'Content-Length': 8
        }
      }
    });
    test.done();
  },
  'getFolderDescription': function (test) {
    setUp.bind(this)();
    test.deepEqual(this.mainInstance.getFolderDescription('/me/', 'etags-only'), {
      a: 'a',
      b: 'b',
      existing: 'hi'
    });
    test.deepEqual(this.mainInstance.getFolderDescription('/me/', 'map'), {
      '@context': 'http://remotestorage.io/spec/folder-description',
      items: {
        a: {
          ETag: 'a',
          'Content-Type': 'a-ish',
          'Content-Length': 4
        },
        b: {
          ETag: 'b',
          'Content-Type': 'b-ish',
          'Content-Length': 8
        },
        existing: {
          ETag: 'hi',
          'Content-Type': 'hi',
          'Content-Length': 2
        }
      }
    });
    test.done();
  },
  'exists': function (test) {
    setUp.bind(this)();
    test.equal(this.mainInstance.exists('/me/'), true);
    test.equal(this.mainInstance.exists('/me/a'), true);
    test.equal(this.mainInstance.exists('/me/existing'), true);
    test.equal(this.mainInstance.exists('/me/non-existing'), false);
    test.equal(this.mainInstance.exists('/me/non/existing'), false);
    test.equal(this.mainInstance.exists('/me/non-existing/'), false);
    test.equal(this.mainInstance.exists('/me/non/existing/'), false);
    test.done();
  },
  'getContent': function (test) {
    setUp.bind(this)();
    test.equal(this.mainInstance.getContent('/me/a'), this.dataStore._data['content:/me/a']);
    test.equal(this.mainInstance.getContent('/me/non-existing'), undefined);
    test.done();
  },
  'getContentType': function (test) {
    setUp.bind(this)();
    test.equal(this.mainInstance.getContentType('/me/a'), this.dataStore._data['contentType:/me/a']);
    test.equal(this.mainInstance.getContentType('/me/non-existing'), undefined);
    test.done();
  },
  'getContentLength': function (test) {
    setUp.bind(this)();
    test.equal(this.mainInstance.getContentLength('/me/a'), 4);
    test.equal(this.mainInstance.getContentLength('/me/non-existing'), undefined);
    test.done();
  },
  'getRevision': function (test) {
    setUp.bind(this)();
    test.equal(this.mainInstance.getRevision('/me/a'), this.dataStore._data['revision:/me/a']);
    test.equal(this.mainInstance.getRevision('/me/non-existing'), undefined);
    test.done();
  },
  'set': function (test) {
    setUp.bind(this)();
    this.mainInstance.set('/me/a', new Buffer('hi', 'utf-8'), new Buffer('hi', 'utf-8'), new Buffer('123', 'utf-8'));
    this.mainInstance.set('/me/c', new Buffer('ho', 'utf-8'), new Buffer('ho', 'utf-8'), new Buffer('456', 'utf-8'));
    test.deepEqual(this.dataStore._data['content:/me/a'], new Buffer('hi', 'utf-8'));
    test.deepEqual(this.dataStore._data['contentType:/me/a'], new Buffer('hi', 'utf-8'));
    test.deepEqual(this.dataStore._data['revision:/me/a'], new Buffer('123', 'utf-8'));
    test.deepEqual(this.dataStore._data['content:/me/c'], new Buffer('ho', 'utf-8'));
    test.deepEqual(this.dataStore._data['contentType:/me/c'], new Buffer('ho', 'utf-8'));
    test.deepEqual(this.dataStore._data['revision:/me/c'], new Buffer('456', 'utf-8'));
    test.done();
  }
});
