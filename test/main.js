var Main = require('../lib/main'),
  nodeunit = require('nodeunit');
  
function setUp() {
  this.dataStore = {
    _data: {},
    get: function(username, key, cb) { cb(null, this._data[username+':'+key]); },
    set: function(username, key, value, cb) { this._data[username+':'+key] = value; cb(null); }
  };
  this.mainInstance = new Main(this.dataStore);
  this.dataStore._data = {
    'me:content:/': JSON.stringify({a: true, b: true, existing: true}),
    'me:content:/a': new Buffer('blĳ', 'utf-8'),
    'me:content:/b': new Buffer('Unhošť', 'utf-8'),
    'me:content:/existing': new Buffer('hi', 'utf-8'),
    'me:contentType:/a': new Buffer('a-ish', 'utf-8'),
    'me:contentType:/b': new Buffer('b-ish', 'utf-8'),
    'me:contentType:/existing': new Buffer('hi', 'utf-8'),
    'me:revision:/': new Buffer('123', 'utf-8'),
    'me:revision:/a': new Buffer('a', 'utf-8'),
    'me:revision:/b': new Buffer('b', 'utf-8'),
    'me:revision:/existing': new Buffer('hi', 'utf-8'),
  };
}

exports['main'] = nodeunit.testCase({
  /*setUp: function() {
  },
  tearDown: function() {
  },*/
  'condMet': function(test) {
    setUp.bind(this)();
    this.mainInstance.condMet({ ifNoneMatch: undefined, ifMatch: undefined }, 'me', '/existing', function(err, answer) {
      test.equal(err, null);
      test.equal(answer, true);
      this.mainInstance.condMet({ifNoneMatch: '*'}, 'me', '/existing', function(err, answer) {
        test.equal(err, null);
        test.equal(answer, false);
        this.mainInstance.condMet({ifNoneMatch: '*'}, 'me', '/non-existing', function(err, answer) {
          test.equal(err, null);
          test.equal(answer, true);
          this.mainInstance.condMet({ifNoneMatch: ['ho']}, 'me', '/existing', function(err, answer) {
            test.equal(err, null);
            test.equal(answer, true);
            this.mainInstance.condMet({ifNoneMatch: ['he', 'ho']}, 'me', '/existing', function(err, answer) {
              test.equal(err, null);
              test.equal(answer, true);
              this.mainInstance.condMet({ifNoneMatch: ['hi']}, 'me', '/existing', function(err, answer) {
                test.equal(err, null);
                test.equal(answer, false);
                this.mainInstance.condMet({ifNoneMatch: ['he', 'hi']}, 'me', '/existing', function(err, answer) {
                  test.equal(err, null);
                  test.equal(answer, false);
                  this.mainInstance.condMet({ifNoneMatch: ['ho']}, 'me', '/non-existing', function(err, answer) {
                    test.equal(err, null);
                    test.equal(answer, true);
                    this.mainInstance.condMet({ifMatch: ['hi']}, 'me', '/existing', function(err, answer) {
                      test.equal(err, null);
                      test.equal(answer, true);
                      this.mainInstance.condMet({ifMatch: ['ho']}, 'me', '/existing', function(err, answer) {
                        test.equal(err, null);
                        test.equal(answer, false);
                        this.mainInstance.condMet({ifMatch: ['hi']}, 'me', '/non-existing', function(err, answer) {
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
  },
  'revisionsToMap': function(test) {
    setUp.bind(this)();
    this.mainInstance.revisionsToMap({ a: 'a', b: 'b'}, 'me', '/', function(err, answer) {
      test.equal(err, null);
      test.deepEqual(JSON.stringify(answer), JSON.stringify({
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
      }));
    });
    test.done();
  },
  'getFolderDescription': function(test) {
    setUp.bind(this)();
    this.mainInstance.getFolderDescription('me', '/', 'etags-only', function(err, obj) {
      test.equal(err, null);
      test.deepEqual(obj, {
        a: 'a',
        b: 'b',
        existing: 'hi'
      });
      this.mainInstance.getFolderDescription('me', '/', 'map', function(err, obj) {
        test.equal(err, null);
        test.deepEqual(obj, {
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
      });
      test.done();
    }.bind(this));
  },
  'exists': function(test) {
    setUp.bind(this)();
    this.mainInstance.exists('me', '/', function(err, answer) {
      test.equal(err, null);
      test.equal(answer, true);
      this.mainInstance.exists('me', '/a', function(err, answer) {
        test.equal(err, null);
        test.equal(answer, true);
        this.mainInstance.exists('me', '/non-existing', function(err, answer) {
          test.equal(err, null);
          test.equal(answer, false);
          this.mainInstance.exists('me', '/non/existing', function(err, answer) {
            test.equal(err, null);
            test.equal(answer, false);
            this.mainInstance.exists('me', '/non-existing/', function(err, answer) {
              test.equal(err, null);
              test.equal(answer, false);
              this.mainInstance.exists('me', '/non/existing/', function(err, answer) {
                test.equal(err, null);
                test.equal(answer, false);
                this.mainInstance.exists('me', '/existing', function(err, answer) {
                  test.equal(err, null);
                  test.equal(answer, true);
                  test.done();
                }.bind(this));
              }.bind(this));
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }.bind(this));
  },
  'getContent': function(test) {
    setUp.bind(this)();
    this.mainInstance.getContent('me', '/a', function(err, answer) {
      test.equal(err, null);
      test.equal(answer, this.dataStore._data['me:content:/a']);
      this.mainInstance.getContent('me', '/non-existing', function(err, answer) {
        test.equal(err, null);
        test.equal(answer, undefined);
        test.done();
      });
    }.bind(this));
  },
  'getContentType': function(test) {
    setUp.bind(this)();
    this.mainInstance.getContentType('me', '/a', function(err, answer) {
      test.equal(err, null);
      test.equal(answer, this.dataStore._data['me:contentType:/a']);
      this.mainInstance.getContentType('me', '/non-existing', function(err, answer) {
        test.equal(err, null);
        test.equal(answer, undefined);
        test.done();
      });
    }.bind(this));
  },
  'getContentLength': function(test) {
    setUp.bind(this)();
    this.mainInstance.getContentLength('me', '/a', function(err, answer) {
      test.equal(err, null);
      test.equal(answer, 4);
      this.mainInstance.getContentLength('me', '/non-existing', function(err, answer) {
        test.equal(err, null);
        test.equal(answer, undefined);
        test.done();
      });
    }.bind(this));
  },
  'getRevision': function(test) {
    setUp.bind(this)();
    this.mainInstance.getRevision('me', '/a', function(err, answer) {
      test.equal(err, null);
      test.equal(answer, this.dataStore._data['me:revision:/a']);
      this.mainInstance.getRevision('me', '/non-existing', function(err, answer) {
        test.equal(err, null);
        test.equal(answer, undefined);
        test.done();
      });
    }.bind(this));
  },
  'set': function(test) {
    setUp.bind(this)();
    this.mainInstance.set('me', '/a', new Buffer('hi', 'utf-8'), new Buffer('hi', 'utf-8'), new Buffer('123', 'utf-8'), function(err) {
      test.equal(err, null);
      this.mainInstance.set('me', '/c', new Buffer('ho', 'utf-8'), new Buffer('ho', 'utf-8'), new Buffer('456', 'utf-8'), function(err) {
        test.equal(err, null);
        test.deepEqual(this.dataStore._data['me:content:/a'], new Buffer('hi', 'utf-8'));
        test.deepEqual(this.dataStore._data['me:contentType:/a'], new Buffer('hi', 'utf-8'));
        test.deepEqual(this.dataStore._data['me:revision:/a'], new Buffer('123', 'utf-8'));
        test.deepEqual(this.dataStore._data['me:content:/c'], new Buffer('ho', 'utf-8'));
        test.deepEqual(this.dataStore._data['me:contentType:/c'], new Buffer('ho', 'utf-8'));
        test.deepEqual(this.dataStore._data['me:revision:/c'], new Buffer('456', 'utf-8'));
        test.done();
      }.bind(this));
    }.bind(this));
  }
});
