# remotestorage-server

The remoteStorage core from https://github.com/remotestorage/starter-kit

[![Build Status](https://secure.travis-ci.org/remotestorage/remotestorage-server.png)](http://travis-ci.org/remotestorage/remotestorage-server)
[![devDependency Status](https://david-dm.org/remotestorage/remotestorage-server/dev-status.png)](https://david-dm.org/remotestorage/remotestorage-server#info=devDependencies)
[![Code Climate](https://codeclimate.com/github/remotestorage/remotestorage-server.png)](https://codeclimate.com/github/remotestorage/remotestorage-server)

# interface

````js
    //set up the remoteStorage server instance:
    var RemotestorageServer = require('remotestorage-server'),
      specVersion = 'draft-dejong-remotestorage-02',
      tokenStore = { _data: {}, get: function(username, token, cb) {
        cb(this._data[username+':'+token]);
      }, set: function(username, token, scopes, cb) {
        this._data[username+':'+token] = scopes; cb(); } },
      dataStore =  { _data: {}, get: function(username, key, cb) {
        cb(this._data[username+':'+key]);
      }, set: function(username, key, value, cb) {
        this._data[usernae+':'+key] = value; cb();
      }
    };

    var serverInstance = new RemotestorageServer(specVersion, tokenStore, dataStore);
    
    //set up a https server:
    var fs = require('fs'),
      https = require('https'),
      httpsConfig = {
        key: fs.readFileSync('./tls.key'),
        cert: fs.readFileSync('./tls.cert'),
        ca: fs.readFileSync('./ca.pem')
      };

    //add access tokens (you would typically do this from an ajax call in your OAuth dialog):
    tokenStore._data['me:SECRET'] = serverInstance.makeScopePaths(['tasks:rw', 'contacts:r']);
    tokenStore._data['me:GOD'] = serverInstance.makeScopePaths(['*:rw']);

    //serve storage:
    https.createServer(httpsConfig, serverInstance.storage).listen(8000);
    
    //get the link for including in your webfinger record:
    var link = remotestorageServer.getWebfingerLink('https', 'example.com', 8000, 'me', 'https://example.com/auth/me');
````

You will also need:

* a webfinger server, serving your webfinger record on path `/.well-known/webfinger` on port 443 (or on port 80 when testing on localhost).
* an html page which serves as an OAuth dialog

See https://github.com/remotestorage/starter-kit for an examples of both.
