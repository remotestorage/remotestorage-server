var Scopes = require('../lib/scopes'),
  nodeunit = require('nodeunit');
  
function setUp() {
  this.tokenStore = {
    _data: {},
    get: function(username, token, cb) {
      cb(null, this._data[username+':'+token]); },
    set: function(username, token, scopes, cb) {
      this._data[username+':'+token] = scopes; cb(null); }
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
    test.deepEqual(this.scopesInstance.makeScopePaths(['foo:r', 'bar:rw']).sort(), ['/foo/:r', '/public/foo/:r', '/bar/:rw', '/public/bar/:rw'].sort());
    test.done();
  },
  'makeScopePaths for root': function(test) {
    setUp.bind(this)();
    test.expect(2);
    test.deepEqual(this.scopesInstance.makeScopePaths(['*:r'], '*'), ['/:r']);
    test.deepEqual(this.scopesInstance.makeScopePaths(['root:rw'], 'root'), ['/:rw']);
    test.done();
  },
  'mayRead for foo:r foo': function(test) {
    setUp.bind(this)();
    test.expect(24);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['foo:r'])};
    this.scopesInstance.mayRead('Bearer SECRET', 'me', '/foo/', function(err, answer) {
      test.equal(err, null);
      test.equal(answer, true);
      this.scopesInstance.mayRead('Bearer wrong', 'me', '/foo/', function(err, answer) {
        test.equal(err, null);
        test.equal(answer, false);
        this.scopesInstance.mayRead('Bearer SECRET', 'me', '/foo/bar', function(err, answer) {
          test.equal(err, null);
          test.equal(answer, true);
          this.scopesInstance.mayRead('Bearer wrong', 'me', '/foo/bar', function(err, answer) {
            test.equal(err, null);
            test.equal(answer, false);
            this.scopesInstance.mayRead('Bearer SECRET', 'me', '/foo/bar/', function(err, answer) {
              test.equal(err, null);
              test.equal(answer, true);
              this.scopesInstance.mayRead('Bearer wrong', 'me', '/foo/bar/', function(err, answer) {
                test.equal(err, null);
                test.equal(answer, false);
                this.scopesInstance.mayRead('Bearer SECRET', 'me', '/public/foo/', function(err, answer) {
                  test.equal(err, null);
                  test.equal(answer, true);
                  this.scopesInstance.mayRead('Bearer wrong', 'me', '/public/foo/', function(err, answer) {
                    test.equal(err, null);
                    test.equal(answer, false);
                    this.scopesInstance.mayRead('Bearer SECRET', 'me', '/public/foo/bar', function(err, answer) {
                      test.equal(err, null);
                      test.equal(answer, true);
                      this.scopesInstance.mayRead('Bearer wrong', 'me', '/public/foo/bar', function(err, answer) {//public
                        test.equal(err, null);
                        test.equal(answer, true);
                        this.scopesInstance.mayRead('Bearer SECRET', 'me', '/public/foo/bar/', function(err, answer) {
                          test.equal(err, null);
                          test.equal(answer, true);
                          this.scopesInstance.mayRead('Bearer wrong', 'me', '/public/foo/bar/', function(err, answer) {
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
  'mayRead for foo:r bar': function(test) {
    setUp.bind(this)();
    test.expect(24);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['foo:r'])};
    this.scopesInstance.mayRead('Bearer SECRET', 'me', '/bar/', function(err, answer) {
      test.equal(err, null);
      test.equal(answer, false);
      this.scopesInstance.mayRead('Bearer wrong', 'me', '/bar/', function(err, answer) {
        test.equal(err, null);
        test.equal(answer, false);
        this.scopesInstance.mayRead('Bearer SECRET', 'me', '/bar/bar', function(err, answer) {
          test.equal(err, null); 
          test.equal(answer, false);
          this.scopesInstance.mayRead('Bearer wrong', 'me', '/bar/bar', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayRead('Bearer SECRET', 'me', '/bar/bar/', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayRead('Bearer wrong', 'me', '/bar/bar/', function(err, answer) { 
                test.equal(err, null); 
                test.equal(answer, false);
                this.scopesInstance.mayRead('Bearer SECRET', 'me', '/public/bar/', function(err, answer) { 
                  test.equal(err, null); 
                  test.equal(answer, false);
                  this.scopesInstance.mayRead('Bearer wrong', 'me', '/public/bar/', function(err, answer) { 
                    test.equal(err, null); 
                    test.equal(answer, false);
                    this.scopesInstance.mayRead('Bearer SECRET', 'me', '/public/bar/bar', function(err, answer) {//public
                      test.equal(err, null);
                      test.equal(answer, true);
                      this.scopesInstance.mayRead('Bearer wrong', 'me', '/public/bar/bar', function(err, answer) {//public
                        test.equal(err, null);
                        test.equal(answer, true);
                        this.scopesInstance.mayRead('Bearer SECRET', 'me', '/public/bar/bar/', function(err, answer) { 
                          test.equal(err, null); 
                          test.equal(answer, false);
                          this.scopesInstance.mayRead('Bearer wrong', 'me', '/public/bar/bar/', function(err, answer) { 
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
  'mayRead for foo:r root': function(test) {
    setUp.bind(this)();
    test.expect(12);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['foo:r'])};
    this.scopesInstance.mayRead('Bearer SECRET', 'me', '/', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, false);
      this.scopesInstance.mayRead('Bearer wrong', 'me', '/', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayRead('Bearer SECRET', 'me', '/foo', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, false);
          this.scopesInstance.mayRead('Bearer wrong', 'me', '/bar', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayRead('Bearer SECRET', 'me', '/bar', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayRead('Bearer wrong', 'me', '/foo', function(err, answer) { 
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
  'mayRead for foo:r outside': function(test) {
    setUp.bind(this)();
    test.expect(12);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['foo:r'])};
    this.scopesInstance.mayRead('Bearer SECRET', '', '', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, false);
      this.scopesInstance.mayRead('Bearer wrong', '', '', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayRead('Bearer SECRET', 'me', '/', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, false);
          this.scopesInstance.mayRead('Bearer wrong', 'me', '/', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayRead('Bearer SECRET', 'you', '/', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayRead('Bearer wrong', 'you', '/', function(err, answer) { 
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
  'mayRead for foo:r other users': function(test) {
    setUp.bind(this)();
    test.expect(20);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['foo:r'])};
    this.scopesInstance.mayRead('Bearer SECRET', 'you', '/', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, false);
      this.scopesInstance.mayRead('Bearer wrong', 'you', '/', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayRead('Bearer SECRET', 'you', 'foo', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, false);
          this.scopesInstance.mayRead('Bearer wrong', 'you', 'foo', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayRead('Bearer SECRET', 'you', 'foo/', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayRead('Bearer wrong', 'you', 'foo/', function(err, answer) { 
                test.equal(err, null); 
                test.equal(answer, false);
                this.scopesInstance.mayRead('Bearer SECRET', 'you', 'foo/bar', function(err, answer) { 
                  test.equal(err, null); 
                  test.equal(answer, false);
                  this.scopesInstance.mayRead('Bearer wrong', 'you', 'foo/bar', function(err, answer) { 
                    test.equal(err, null); 
                    test.equal(answer, false);
                    this.scopesInstance.mayRead('Bearer SECRET', 'you', 'foo/bar/', function(err, answer) { 
                      test.equal(err, null); 
                      test.equal(answer, false);
                      this.scopesInstance.mayRead('Bearer wrong', 'you', 'foo/bar/', function(err, answer) { 
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
  },
  'mayRead for foo:rw - foo': function(test) {
    setUp.bind(this)();
    test.expect(24);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['foo:rw'])};
    this.scopesInstance.mayRead('Bearer SECRET', 'me', '/foo/', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, true);
      this.scopesInstance.mayRead('Bearer wrong', 'me', '/foo/', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayRead('Bearer SECRET', 'me', '/foo/bar', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, true);
          this.scopesInstance.mayRead('Bearer wrong', 'me', '/foo/bar', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayRead('Bearer SECRET', 'me', '/foo/bar/', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, true);
              this.scopesInstance.mayRead('Bearer wrong', 'me', '/foo/bar/', function(err, answer) { 
                test.equal(err, null); 
                test.equal(answer, false);
                this.scopesInstance.mayRead('Bearer SECRET', 'me', '/public/foo/', function(err, answer) { 
                  test.equal(err, null); 
                  test.equal(answer, true);
                  this.scopesInstance.mayRead('Bearer wrong', 'me', '/public/foo/', function(err, answer) { 
                    test.equal(err, null); 
                    test.equal(answer, false);
                    this.scopesInstance.mayRead('Bearer SECRET', 'me', '/public/foo/bar', function(err, answer) { 
                      test.equal(err, null); 
                      test.equal(answer, true);
                      this.scopesInstance.mayRead('Bearer wrong', 'me', '/public/foo/bar', function(err, answer) {//public
                        test.equal(err, null);
                        test.equal(answer, true);
                        this.scopesInstance.mayRead('Bearer SECRET', 'me', '/public/foo/bar/', function(err, answer) { 
                          test.equal(err, null); 
                          test.equal(answer, true);
                          this.scopesInstance.mayRead('Bearer wrong', 'me', '/public/foo/bar/', function(err, answer) { 
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
  'mayRead for foo:rw - bar': function(test) {
    setUp.bind(this)();
    test.expect(24);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['foo:rw'])};
    this.scopesInstance.mayRead('Bearer SECRET', 'me', '/bar/', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, false);
      this.scopesInstance.mayRead('Bearer wrong', 'me', '/bar/', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayRead('Bearer SECRET', 'me', '/bar/bar', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, false);
          this.scopesInstance.mayRead('Bearer wrong', 'me', '/bar/bar', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayRead('Bearer SECRET', 'me', '/bar/bar/', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayRead('Bearer wrong', 'me', '/bar/bar/', function(err, answer) { 
                test.equal(err, null); 
                test.equal(answer, false);
                this.scopesInstance.mayRead('Bearer SECRET', 'me', '/public/bar/', function(err, answer) { 
                  test.equal(err, null); 
                  test.equal(answer, false);
                  this.scopesInstance.mayRead('Bearer wrong', 'me', '/public/bar/', function(err, answer) { 
                    test.equal(err, null); 
                    test.equal(answer, false);
                    this.scopesInstance.mayRead('Bearer SECRET', 'me', '/public/bar/bar', function(err, answer) {//public
                      test.equal(err, null);
                      test.equal(answer, true);
                      this.scopesInstance.mayRead('Bearer wrong', 'me', '/public/bar/bar', function(err, answer) {//public
                        test.equal(err, null);
                        test.equal(answer, true);
                        this.scopesInstance.mayRead('Bearer SECRET', 'me', '/public/bar/bar/', function(err, answer) { 
                          test.equal(err, null); 
                          test.equal(answer, false);
                          this.scopesInstance.mayRead('Bearer wrong', 'me', '/public/bar/bar/', function(err, answer) { 
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
  'mayRead for foo:rw - root': function(test) {
    setUp.bind(this)();
    test.expect(12);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['foo:rw'])};
    this.scopesInstance.mayRead('Bearer SECRET', 'me', '/', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, false);
      this.scopesInstance.mayRead('Bearer wrong', 'me', '/', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayRead('Bearer SECRET', 'me', '/foo', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, false);
          this.scopesInstance.mayRead('Bearer wrong', 'me', '/bar', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayRead('Bearer SECRET', 'me', '/bar', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayRead('Bearer wrong', 'me', '/foo', function(err, answer) { 
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
  'mayRead for foo:rw - outside': function(test) {
    setUp.bind(this)();
    test.expect(12);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['foo:rw'])};
    this.scopesInstance.mayRead('Bearer SECRET', '', '', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, false);
      this.scopesInstance.mayRead('Bearer wrong', '', '', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayRead('Bearer SECRET', 'me', '/', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, false);
          this.scopesInstance.mayRead('Bearer wrong', 'me', '/', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayRead('Bearer SECRET', 'you', '/', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayRead('Bearer wrong', 'you', '/', function(err, answer) { 
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
  'mayRead for foo:rw - other users': function(test) {
    setUp.bind(this)();
    test.expect(20);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['foo:rw'])};
    this.scopesInstance.mayRead('Bearer SECRET', 'you', '/', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, false);
      this.scopesInstance.mayRead('Bearer wrong', 'you', '/', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayRead('Bearer SECRET', 'you', 'foo', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, false);
          this.scopesInstance.mayRead('Bearer wrong', 'you', 'foo', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayRead('Bearer SECRET', 'you', 'foo/', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayRead('Bearer wrong', 'you', 'foo/', function(err, answer) { 
                test.equal(err, null); 
                test.equal(answer, false);
                this.scopesInstance.mayRead('Bearer SECRET', 'you', 'foo/bar', function(err, answer) { 
                  test.equal(err, null); 
                  test.equal(answer, false);
                  this.scopesInstance.mayRead('Bearer wrong', 'you', 'foo/bar', function(err, answer) { 
                    test.equal(err, null); 
                    test.equal(answer, false);
                    this.scopesInstance.mayRead('Bearer SECRET', 'you', 'foo/bar/', function(err, answer) { 
                      test.equal(err, null); 
                      test.equal(answer, false);
                      this.scopesInstance.mayRead('Bearer wrong', 'you', 'foo/bar/', function(err, answer) { 
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
  },
  'mayWrite for foo:r - foo': function(test) {
    setUp.bind(this)();
    test.expect(24);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['foo:r'])};
    this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/foo/', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, false);
      this.scopesInstance.mayWrite('Bearer wrong', 'me', '/foo/', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/foo/bar', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, false);
          this.scopesInstance.mayWrite('Bearer wrong', 'me', '/foo/bar', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/foo/bar/', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayWrite('Bearer wrong', 'me', '/foo/bar/', function(err, answer) { 
                test.equal(err, null); 
                test.equal(answer, false);
                this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/public/foo/', function(err, answer) { 
                  test.equal(err, null); 
                  test.equal(answer, false);
                  this.scopesInstance.mayWrite('Bearer wrong', 'me', '/public/foo/', function(err, answer) { 
                    test.equal(err, null); 
                    test.equal(answer, false);
                    this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/public/foo/bar', function(err, answer) { 
                      test.equal(err, null); 
                      test.equal(answer, false);
                      this.scopesInstance.mayWrite('Bearer wrong', 'me', '/public/foo/bar', function(err, answer) { 
                        test.equal(err, null);
                        test.equal(answer, false);
                        this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/public/foo/bar/', function(err, answer) { 
                          test.equal(err, null); 
                          test.equal(answer, false);
                          this.scopesInstance.mayWrite('Bearer wrong', 'me', '/public/foo/bar/', function(err, answer) { 
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
  'mayWrite for foo:r - bar': function(test) {
    setUp.bind(this)();
    test.expect(24);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['foo:r'])};
    this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/bar/', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, false);
      this.scopesInstance.mayWrite('Bearer wrong', 'me', '/bar/', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/bar/bar', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, false);
          this.scopesInstance.mayWrite('Bearer wrong', 'me', '/bar/bar', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/bar/bar/', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayWrite('Bearer wrong', 'me', '/bar/bar/', function(err, answer) { 
                test.equal(err, null); 
                test.equal(answer, false);
                this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/public/bar/', function(err, answer) { 
                  test.equal(err, null); 
                  test.equal(answer, false);
                  this.scopesInstance.mayWrite('Bearer wrong', 'me', '/public/bar/', function(err, answer) { 
                    test.equal(err, null); 
                    test.equal(answer, false);
                    this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/public/bar/bar', function(err, answer) { 
                      test.equal(err, null); 
                      test.equal(answer, false);
                      this.scopesInstance.mayWrite('Bearer wrong', 'me', '/public/bar/bar', function(err, answer) { 
                        test.equal(err, null); 
                        test.equal(answer, false);
                        this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/public/bar/bar/', function(err, answer) { 
                          test.equal(err, null); 
                          test.equal(answer, false);
                          this.scopesInstance.mayWrite('Bearer wrong', 'me', '/public/bar/bar/', function(err, answer) { 
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
  'mayWrite for foo:r - root': function(test) {
    setUp.bind(this)();
    test.expect(12);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['foo:r'])};
    this.scopesInstance.mayRead('Bearer SECRET', 'me', '/', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, false);
      this.scopesInstance.mayRead('Bearer wrong', 'me', '/', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayRead('Bearer SECRET', 'me', '/foo', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, false);
          this.scopesInstance.mayRead('Bearer wrong', 'me', '/bar', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayRead('Bearer SECRET', 'me', '/bar', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayRead('Bearer wrong', 'me', '/foo', function(err, answer) { 
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
  'mayWrite for foo:r - outside': function(test) {
    setUp.bind(this)();
    test.expect(12);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['foo:r'])};
    this.scopesInstance.mayRead('Bearer SECRET', '', '', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, false);
      this.scopesInstance.mayRead('Bearer wrong', '', '', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayRead('Bearer SECRET', 'me', '/', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, false);
          this.scopesInstance.mayRead('Bearer wrong', 'me', '/', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayRead('Bearer SECRET', 'you', '/', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayRead('Bearer wrong', 'you', '/', function(err, answer) { 
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
  'mayWrite for foo:r - other users': function(test) {
    setUp.bind(this)();
    test.expect(20);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['foo:r'])};
    this.scopesInstance.mayRead('Bearer SECRET', 'you', '/', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, false);
      this.scopesInstance.mayRead('Bearer wrong', 'you', '/', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayRead('Bearer SECRET', 'you', 'foo', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, false);
          this.scopesInstance.mayRead('Bearer wrong', 'you', 'foo', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayRead('Bearer SECRET', 'you', 'foo/', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayRead('Bearer wrong', 'you', 'foo/', function(err, answer) { 
                test.equal(err, null); 
                test.equal(answer, false);
                this.scopesInstance.mayRead('Bearer SECRET', 'you', 'foo/bar', function(err, answer) { 
                  test.equal(err, null); 
                  test.equal(answer, false);
                  this.scopesInstance.mayRead('Bearer wrong', 'you', 'foo/bar', function(err, answer) { 
                    test.equal(err, null); 
                    test.equal(answer, false);
                    this.scopesInstance.mayRead('Bearer SECRET', 'you', 'foo/bar/', function(err, answer) { 
                      test.equal(err, null); 
                      test.equal(answer, false);
                      this.scopesInstance.mayRead('Bearer wrong', 'you', 'foo/bar/', function(err, answer) { 
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
  },
  'mayWrite for foo:rw - foo': function(test) {
    setUp.bind(this)();
    test.expect(24);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['foo:rw'])};
    this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/foo/', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, false);
      this.scopesInstance.mayWrite('Bearer wrong', 'me', '/foo/', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/foo/bar', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, true);
          this.scopesInstance.mayWrite('Bearer wrong', 'me', '/foo/bar', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/foo/bar/', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayWrite('Bearer wrong', 'me', '/foo/bar/', function(err, answer) { 
                test.equal(err, null); 
                test.equal(answer, false);
                this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/public/foo/', function(err, answer) { 
                  test.equal(err, null); 
                  test.equal(answer, false);
                  this.scopesInstance.mayWrite('Bearer wrong', 'me', '/public/foo/', function(err, answer) { 
                    test.equal(err, null); 
                    test.equal(answer, false);
                    this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/public/foo/bar', function(err, answer) { 
                      test.equal(err, null); 
                      test.equal(answer, true);
                      this.scopesInstance.mayWrite('Bearer wrong', 'me', '/public/foo/bar', function(err, answer) { 
                        test.equal(err, null); 
                        test.equal(answer, false);
                        this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/public/foo/bar/', function(err, answer) { 
                          test.equal(err, null); 
                          test.equal(answer, false);
                          this.scopesInstance.mayWrite('Bearer wrong', 'me', '/public/foo/bar/', function(err, answer) { 
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
  'mayWrite for foo:rw - bar': function(test) {
    setUp.bind(this)();
    test.expect(24);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['foo:rw'])};
    this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/bar/', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, false);
      this.scopesInstance.mayWrite('Bearer wrong', 'me', '/bar/', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/bar/bar', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, false);
          this.scopesInstance.mayWrite('Bearer wrong', 'me', '/bar/bar', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/bar/bar/', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayWrite('Bearer wrong', 'me', '/bar/bar/', function(err, answer) { 
                test.equal(err, null); 
                test.equal(answer, false);
                this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/public/bar/', function(err, answer) { 
                  test.equal(err, null); 
                  test.equal(answer, false);
                  this.scopesInstance.mayWrite('Bearer wrong', 'me', '/public/bar/', function(err, answer) { 
                    test.equal(err, null); 
                    test.equal(answer, false);
                    this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/public/bar/bar', function(err, answer) { 
                      test.equal(err, null); 
                      test.equal(answer, false);
                      this.scopesInstance.mayWrite('Bearer wrong', 'me', '/public/bar/bar', function(err, answer) { 
                        test.equal(err, null); 
                        test.equal(answer, false);
                        this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/public/bar/bar/', function(err, answer) { 
                          test.equal(err, null); 
                          test.equal(answer, false);
                          this.scopesInstance.mayWrite('Bearer wrong', 'me', '/public/bar/bar/', function(err, answer) { 
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
  'mayWrite for foo:rw - root': function(test) {
    setUp.bind(this)();
    test.expect(12);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['foo:rw'])};
    this.scopesInstance.mayRead('Bearer SECRET', 'me', '/', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, false);
      this.scopesInstance.mayRead('Bearer wrong', 'me', '/', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayRead('Bearer SECRET', 'me', '/foo', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, false);
          this.scopesInstance.mayRead('Bearer wrong', 'me', '/bar', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayRead('Bearer SECRET', 'me', '/bar', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayRead('Bearer wrong', 'me', '/foo', function(err, answer) { 
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
  'mayWrite for foo:rw - outside': function(test) {
    setUp.bind(this)();
    test.expect(12);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['foo:rw'])};
    this.scopesInstance.mayRead('Bearer SECRET', '', '', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, false);
      this.scopesInstance.mayRead('Bearer wrong', '', '', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayRead('Bearer SECRET', 'me', '/', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, false);
          this.scopesInstance.mayRead('Bearer wrong', 'me', '/', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayRead('Bearer SECRET', 'you', '/', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayRead('Bearer wrong', 'you', '/', function(err, answer) { 
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
  'mayWrite for foo:rw - other users': function(test) {
    setUp.bind(this)();
    test.expect(20);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['foo:rw'])};
    this.scopesInstance.mayRead('Bearer SECRET', 'you', '/', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, false);
      this.scopesInstance.mayRead('Bearer wrong', 'you', '/', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayRead('Bearer SECRET', 'you', 'foo', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, false);
          this.scopesInstance.mayRead('Bearer wrong', 'you', 'foo', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayRead('Bearer SECRET', 'you', 'foo/', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayRead('Bearer wrong', 'you', 'foo/', function(err, answer) { 
                test.equal(err, null); 
                test.equal(answer, false);
                this.scopesInstance.mayRead('Bearer SECRET', 'you', 'foo/bar', function(err, answer) { 
                  test.equal(err, null); 
                  test.equal(answer, false);
                  this.scopesInstance.mayRead('Bearer wrong', 'you', 'foo/bar', function(err, answer) { 
                    test.equal(err, null); 
                    test.equal(answer, false);
                    this.scopesInstance.mayRead('Bearer SECRET', 'you', 'foo/bar/', function(err, answer) { 
                      test.equal(err, null); 
                      test.equal(answer, false);
                      this.scopesInstance.mayRead('Bearer wrong', 'you', 'foo/bar/', function(err, answer) { 
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
  },
  'mayRead for :r - foo': function(test) {
    setUp.bind(this)();
    test.expect(24);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['root:r'], 'root')};
    this.scopesInstance.mayRead('Bearer SECRET', 'me', '/foo/', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, true);
      this.scopesInstance.mayRead('Bearer wrong', 'me', '/foo/', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayRead('Bearer SECRET', 'me', '/foo/bar', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, true);
          this.scopesInstance.mayRead('Bearer wrong', 'me', '/foo/bar', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayRead('Bearer SECRET', 'me', '/foo/bar/', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, true);
              this.scopesInstance.mayRead('Bearer wrong', 'me', '/foo/bar/', function(err, answer) { 
                test.equal(err, null); 
                test.equal(answer, false);
                this.scopesInstance.mayRead('Bearer SECRET', 'me', '/public/foo/', function(err, answer) { 
                  test.equal(err, null); 
                  test.equal(answer, true);
                  this.scopesInstance.mayRead('Bearer wrong', 'me', '/public/foo/', function(err, answer) { 
                    test.equal(err, null); 
                    test.equal(answer, false);
                    this.scopesInstance.mayRead('Bearer SECRET', 'me', '/public/foo/bar', function(err, answer) { 
                      test.equal(err, null); 
                      test.equal(answer, true);
                      this.scopesInstance.mayRead('Bearer wrong', 'me', '/public/foo/bar', function(err, answer) {//public
                        test.equal(err, null);
                        test.equal(answer, true);
                        this.scopesInstance.mayRead('Bearer SECRET', 'me', '/public/foo/bar/', function(err, answer) { 
                          test.equal(err, null); 
                          test.equal(answer, true);
                          this.scopesInstance.mayRead('Bearer wrong', 'me', '/public/foo/bar/', function(err, answer) { 
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
  'mayRead for :r - root': function(test) {
    setUp.bind(this)();
    test.expect(12);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['root:r'], 'root')};
    this.scopesInstance.mayRead('Bearer SECRET', 'me', '/', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, true);
      this.scopesInstance.mayRead('Bearer wrong', 'me', '/', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayRead('Bearer SECRET', 'me', '/foo', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, true);
          this.scopesInstance.mayRead('Bearer wrong', 'me', '/bar', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayRead('Bearer SECRET', 'me', '/bar', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, true);
              this.scopesInstance.mayRead('Bearer wrong', 'me', '/foo', function(err, answer) { 
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
  'mayRead for :r - outside': function(test) {
    setUp.bind(this)();
    test.expect(12);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['root:r'], 'root')};
    this.scopesInstance.mayRead('Bearer SECRET', '', '', function(err1, answer1) { 
      test.equal(err1, null); 
      test.equal(answer1, false);
      this.scopesInstance.mayRead('Bearer wrong', '', '', function(err2, answer2) { 
        test.equal(err2, null); 
        test.equal(answer2, false);
        this.scopesInstance.mayRead('Bearer SECRET', 'me', '', function(err3, answer3) { 
          test.equal(err3, null); 
          test.equal(answer3, false);
          this.scopesInstance.mayRead('Bearer wrong', 'me', '', function(err4, answer4) { 
            test.equal(err4, null); 
            test.equal(answer4, false);
            this.scopesInstance.mayRead('Bearer SECRET', 'you', '', function(err5, answer5) { 
              test.equal(err5, null); 
              test.equal(answer5, false);
              this.scopesInstance.mayRead('Bearer wrong', 'you', '', function(err6, answer6) { 
                test.equal(err6, null); 
                test.equal(answer6, false);
                test.done();
              }.bind(this));
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }.bind(this));
  },
  'mayRead for :r - other users': function(test) {
    setUp.bind(this)();
    test.expect(20);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['root:r'], 'root')};
    this.scopesInstance.mayRead('Bearer SECRET', 'you', '/', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, false);
      this.scopesInstance.mayRead('Bearer wrong', 'you', '/', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayRead('Bearer SECRET', 'you', 'foo', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, false);
          this.scopesInstance.mayRead('Bearer wrong', 'you', 'foo', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayRead('Bearer SECRET', 'you', 'foo/', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayRead('Bearer wrong', 'you', 'foo/', function(err, answer) { 
                test.equal(err, null); 
                test.equal(answer, false);
                this.scopesInstance.mayRead('Bearer SECRET', 'you', 'foo/bar', function(err, answer) { 
                  test.equal(err, null); 
                  test.equal(answer, false);
                  this.scopesInstance.mayRead('Bearer wrong', 'you', 'foo/bar', function(err, answer) { 
                    test.equal(err, null); 
                    test.equal(answer, false);
                    this.scopesInstance.mayRead('Bearer SECRET', 'you', 'foo/bar/', function(err, answer) { 
                      test.equal(err, null); 
                      test.equal(answer, false);
                      this.scopesInstance.mayRead('Bearer wrong', 'you', 'foo/bar/', function(err, answer) { 
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
  },
  'mayRead for :rw - foo': function(test) {
    setUp.bind(this)();
    test.expect(24);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['root:rw'], 'root')};
    this.scopesInstance.mayRead('Bearer SECRET', 'me', '/foo/', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, true);
      this.scopesInstance.mayRead('Bearer wrong', 'me', '/foo/', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayRead('Bearer SECRET', 'me', '/foo/bar', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, true);
          this.scopesInstance.mayRead('Bearer wrong', 'me', '/foo/bar', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayRead('Bearer SECRET', 'me', '/foo/bar/', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, true);
              this.scopesInstance.mayRead('Bearer wrong', 'me', '/foo/bar/', function(err, answer) { 
                test.equal(err, null); 
                test.equal(answer, false);
                this.scopesInstance.mayRead('Bearer SECRET', 'me', '/public/foo/', function(err, answer) { 
                  test.equal(err, null); 
                  test.equal(answer, true);
                  this.scopesInstance.mayRead('Bearer wrong', 'me', '/public/foo/', function(err, answer) { 
                    test.equal(err, null); 
                    test.equal(answer, false);
                    this.scopesInstance.mayRead('Bearer SECRET', 'me', '/public/foo/bar', function(err, answer) { 
                      test.equal(err, null); 
                      test.equal(answer, true);
                      this.scopesInstance.mayRead('Bearer wrong', 'me', '/public/foo/bar', function(err, answer) {//public
                          test.equal(err, null);
                          test.equal(answer, true);
                          this.scopesInstance.mayRead('Bearer SECRET', 'me', '/public/foo/bar/', function(err, answer) { 
                            test.equal(err, null); 
                            test.equal(answer, true);
                            this.scopesInstance.mayRead('Bearer wrong', 'me', '/public/foo/bar/', function(err, answer) { 
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
  'mayRead for :r - root': function(test) {
    setUp.bind(this)();
    test.expect(12);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['root:r'], 'root')};
    this.scopesInstance.mayRead('Bearer SECRET', 'me', '/', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, true);
      this.scopesInstance.mayRead('Bearer wrong', 'me', '/', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayRead('Bearer SECRET', 'me', '/foo', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, true);
          this.scopesInstance.mayRead('Bearer wrong', 'me', '/bar', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayRead('Bearer SECRET', 'me', '/bar', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, true);
              this.scopesInstance.mayRead('Bearer wrong', 'me', '/foo', function(err, answer) { 
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
  'mayRead for :r - outside': function(test) {
    setUp.bind(this)();
    test.expect(12);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['root:r'], 'root')};
    this.scopesInstance.mayRead('Bearer SECRET', '', '', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, false);
      this.scopesInstance.mayRead('Bearer wrong', '', '', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayRead('Bearer SECRET', 'me', '', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, false);
          this.scopesInstance.mayRead('Bearer wrong', 'me', '', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayRead('Bearer SECRET', 'you', '', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayRead('Bearer wrong', 'you', '/', function(err, answer) { 
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
  'mayRead for :r - other users': function(test) {
    setUp.bind(this)();
    test.expect(20);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['root:r'], 'root')};
    this.scopesInstance.mayRead('Bearer SECRET', 'you', '/', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, false);
      this.scopesInstance.mayRead('Bearer wrong', 'you', '/', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayRead('Bearer SECRET', 'you', 'foo', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, false);
          this.scopesInstance.mayRead('Bearer wrong', 'you', 'foo', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayRead('Bearer SECRET', 'you', 'foo/', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayRead('Bearer wrong', 'you', 'foo/', function(err, answer) { 
                test.equal(err, null); 
                test.equal(answer, false);
                this.scopesInstance.mayRead('Bearer SECRET', 'you', 'foo/bar', function(err, answer) { 
                  test.equal(err, null); 
                  test.equal(answer, false);
                  this.scopesInstance.mayRead('Bearer wrong', 'you', 'foo/bar', function(err, answer) { 
                    test.equal(err, null); 
                    test.equal(answer, false);
                    this.scopesInstance.mayRead('Bearer SECRET', 'you', 'foo/bar/', function(err, answer) { 
                      test.equal(err, null); 
                      test.equal(answer, false);
                      this.scopesInstance.mayRead('Bearer wrong', 'you', 'foo/bar/', function(err, answer) { 
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
  },
  'mayWrite for :r - foo': function(test) {
    setUp.bind(this)();
    test.expect(24);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['*:r'], '*')};
    this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/foo/', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, false);
      this.scopesInstance.mayWrite('Bearer wrong', 'me', '/foo/', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/foo/bar', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, false);
          this.scopesInstance.mayWrite('Bearer wrong', 'me', '/foo/bar', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/foo/bar/', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayWrite('Bearer wrong', 'me', '/foo/bar/', function(err, answer) { 
                test.equal(err, null); 
                test.equal(answer, false);
                this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/public/foo/', function(err, answer) { 
                  test.equal(err, null); 
                  test.equal(answer, false);
                  this.scopesInstance.mayWrite('Bearer wrong', 'me', '/public/foo/', function(err, answer) { 
                    test.equal(err, null); 
                    test.equal(answer, false);
                    this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/public/foo/bar', function(err, answer) { 
                      test.equal(err, null); 
                      test.equal(answer, false);
                      this.scopesInstance.mayWrite('Bearer wrong', 'me', '/public/foo/bar', function(err, answer) { 
                        test.equal(err, null); 
                        test.equal(answer, false);
                        this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/public/foo/bar/', function(err, answer) { 
                          test.equal(err, null); 
                          test.equal(answer, false);
                          this.scopesInstance.mayWrite('Bearer wrong', 'me', '/public/foo/bar/', function(err, answer) { 
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
  'mayWrite for :r - root': function(test) {
    setUp.bind(this)();
    test.expect(12);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['root:r'], 'root')};
    this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, false);
      this.scopesInstance.mayWrite('Bearer wrong', 'me', '/', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/foo', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, false);
          this.scopesInstance.mayWrite('Bearer wrong', 'me', '/bar', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/bar', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayWrite('Bearer wrong', 'me', '/foo', function(err, answer) { 
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
  'mayWrite for :r - outside': function(test) {
    setUp.bind(this)();
    test.expect(12);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['root:r'], 'root')};
    this.scopesInstance.mayWrite('Bearer SECRET', '', '', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, false);
      this.scopesInstance.mayWrite('Bearer wrong', '', '', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, false);
          this.scopesInstance.mayWrite('Bearer wrong', 'me', '/', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayWrite('Bearer SECRET', 'you', '/', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayWrite('Bearer wrong', 'you', '/', function(err, answer) { 
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
  'mayWrite for :r - other users': function(test) {
    setUp.bind(this)();
    test.expect(20);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['root:r'], 'root')};
    this.scopesInstance.mayWrite('Bearer SECRET', 'you', '/', function(err, answer) { 
      test.equal(err, null); 
      test.equal(answer, false);
      this.scopesInstance.mayWrite('Bearer wrong', 'you', '/', function(err, answer) { 
        test.equal(err, null); 
        test.equal(answer, false);
        this.scopesInstance.mayWrite('Bearer SECRET', 'you', 'foo', function(err, answer) { 
          test.equal(err, null); 
          test.equal(answer, false);
          this.scopesInstance.mayWrite('Bearer wrong', 'you', 'foo', function(err, answer) { 
            test.equal(err, null); 
            test.equal(answer, false);
            this.scopesInstance.mayWrite('Bearer SECRET', 'you', 'foo/', function(err, answer) { 
              test.equal(err, null); 
              test.equal(answer, false);
              this.scopesInstance.mayWrite('Bearer wrong', 'you', 'foo/', function(err, answer) { 
                test.equal(err, null); 
                test.equal(answer, false);
                this.scopesInstance.mayWrite('Bearer SECRET', 'you', 'foo/bar', function(err, answer) { 
                  test.equal(err, null); 
                  test.equal(answer, false);
                  this.scopesInstance.mayWrite('Bearer wrong', 'you', 'foo/bar', function(err, answer) { 
                    test.equal(err, null); 
                    test.equal(answer, false);
                    this.scopesInstance.mayWrite('Bearer SECRET', 'you', 'foo/bar/', function(err, answer) { 
                      test.equal(err, null); 
                      test.equal(answer, false);
                      this.scopesInstance.mayWrite('Bearer wrong', 'you', 'foo/bar/', function(err, answer) { 
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
  },
  'mayWrite for :rw - foo': function(test) {
    setUp.bind(this)();
    test.expect(24);
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['*:rw'], '*')};
    this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/foo/', function(err, answer) {
      test.equal(err, null);
      test.equal(answer, false);
      this.scopesInstance.mayWrite('Bearer wrong', 'me', '/foo/', function(err, answer) {
        test.equal(err, null);
        test.equal(answer, false);
        this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/foo/bar', function(err, answer) {
          test.equal(err, null);
          test.equal(answer, true);
          this.scopesInstance.mayWrite('Bearer wrong', 'me', '/foo/bar', function(err, answer) {
            test.equal(err, null);
            test.equal(answer, false);
            this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/foo/bar/', function(err, answer) {
              test.equal(err, null);
              test.equal(answer, false);
              this.scopesInstance.mayWrite('Bearer wrong', 'me', '/foo/bar/', function(err, answer) {
                test.equal(err, null);
                test.equal(answer, false);
                this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/public/foo/', function(err, answer) {
                  test.equal(err, null);
                  test.equal(answer, false);
                  this.scopesInstance.mayWrite('Bearer wrong', 'me', '/public/foo/', function(err, answer) {
                    test.equal(err, null);
                    test.equal(answer, false);
                    this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/public/foo/bar', function(err, answer) {
                      test.equal(err, null);
                      test.equal(answer, true);
                      this.scopesInstance.mayWrite('Bearer wrong', 'me', '/public/foo/bar', function(err, answer) {
                        test.equal(err, null);
                        test.equal(answer, false);
                        this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/public/foo/bar/', function(err, answer) {
                          test.equal(err, null);
                          test.equal(answer, false);
                          this.scopesInstance.mayWrite('Bearer wrong', 'me', '/public/foo/bar/', function(err, answer) {
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
    this.tokenStore._data = { 'me:SECRET': this.scopesInstance.makeScopePaths(['*:rw'], '*')};
    this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/', function(err, answer) {
      test.equal(err, null);
      test.equal(JSON.stringify(answer), JSON.stringify(false));
      this.scopesInstance.mayWrite('Bearer wrong', 'me', '/', function(err, answer) {
        test.equal(err, null);
        test.equal(answer, false);
        this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/foo', function(err, answer) {
          test.equal(err, null);
          test.equal(answer, true);
          this.scopesInstance.mayWrite('Bearer wrong', 'me', '/bar', function(err, answer) {
            test.equal(err, null);
            test.equal(answer, false);
            this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/bar', function(err, answer) {
              test.equal(err, null);
              test.equal(answer, true);
              this.scopesInstance.mayWrite('Bearer wrong', 'me', '/foo', function(err, answer) {
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
    this.scopesInstance.mayWrite('Bearer SECRET', '', '', function(err, answer) {
      test.equal(err, null);
      test.equal(answer, false);
      this.scopesInstance.mayWrite('Bearer wrong', '', '', function(err, answer) {
        test.equal(err, null);
        test.equal(answer, false);
        this.scopesInstance.mayWrite('Bearer SECRET', 'me', '/', function(err, answer) {
          test.equal(err, null);
          test.equal(answer, false);
          this.scopesInstance.mayWrite('Bearer wrong', 'me', '/', function(err, answer) {
            test.equal(err, null);
            test.equal(answer, false);
            this.scopesInstance.mayWrite('Bearer SECRET', 'you', '/', function(err, answer) {
              test.equal(err, null);
              test.equal(answer, false);
              this.scopesInstance.mayWrite('Bearer wrong', 'you', '/', function(err, answer) {
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
    this.scopesInstance.mayWrite('Bearer SECRET', 'you', '/', function(err, answer) {
      test.equal(err, null);
      test.equal(answer, false);
      this.scopesInstance.mayWrite('Bearer wrong', 'you', '/', function(err, answer) {
        test.equal(err, null);
        test.equal(answer, false);
        this.scopesInstance.mayWrite('Bearer SECRET', 'you', 'foo', function(err, answer) {
          test.equal(err, null);
          test.equal(answer, false);
          this.scopesInstance.mayWrite('Bearer wrong', 'you', 'foo', function(err, answer) {
            test.equal(err, null);
            test.equal(answer, false);
            this.scopesInstance.mayWrite('Bearer SECRET', 'you', 'foo/', function(err, answer) {
              test.equal(err, null);
              test.equal(answer, false);
              this.scopesInstance.mayWrite('Bearer wrong', 'you', 'foo/', function(err, answer) {
                test.equal(err, null);
                test.equal(answer, false);
                this.scopesInstance.mayWrite('Bearer SECRET', 'you', 'foo/bar', function(err, answer) {
                  test.equal(err, null);
                  test.equal(answer, false);
                  this.scopesInstance.mayWrite('Bearer wrong', 'you', 'foo/bar', function(err, answer) {
                    test.equal(err, null);
                    test.equal(answer, false);
                    this.scopesInstance.mayWrite('Bearer SECRET', 'you', 'foo/bar/', function(err, answer) {
                      test.equal(err, null);
                      test.equal(answer, false);
                      this.scopesInstance.mayWrite('Bearer wrong', 'you', 'foo/bar/', function(err, answer) {
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
