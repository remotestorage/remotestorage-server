var requests = require('../lib/requests'),
  nodeunit = require('nodeunit');
  
function setUp() {
}

exports['main'] = nodeunit.testCase({
  /*setUp: function() {
  },
  tearDown: function() {
  },*/
  'handleRequest': function (test) {
    setUp.bind(this)();
    test.done();
  }
});
