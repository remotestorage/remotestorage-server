var Scopes = require('./scopes'),
  Main = require('./main'),
  Requests = require('./requests'),
  sha1 = require('sha1');

module.exports = function(specVersion, tokenStore, dataStore) {
  this.specVersion = specVersion;
  this.folderFormat = 'map';
  this.folderContentType = new Buffer('application/ld+json', 'utf-8');
  this.folder404s = false;
  this.rootScope = '*';
  this.scopesInstance = new Scopes(tokenStore);
  this.mainInstance = new Main(dataStore);
  this.requestsInstance = new Requests('/storage/', this.scopesInstance, this.mainInstance);

  if (specVersion === 'draft-dejong-remotestorage-00' || specVersion === 'draft-dejong-remotestorage-01') {
    this.folderFormat = 'etags-only';
    this.rootScope = 'root';
    this.folder404s = true;
  } else if (specVersion === 'draft-dejong-remotestorage-02') {
    this.folderContentType = new Buffer('application/json', 'utf-8');
  }
};
module.exports.prototype.storage = function(req, res) {
  this.requestsInstance.handleRequest(req, res, this.folderFormat, this.folderContentType, this.folder404s);
};
module.exports.prototype.makeScopePaths = function(scopes) {
  return this.scopesInstance.makeScopePaths(scopes, this.rootScope);
};
module.exports.prototype.getWebfingerLink = function(protocol, host, port, userName, authUrl, webAuthoring) {
  switch (this.specVersion) {
    case 'draft-dejong-remotestorage-00':
      return {
        href: protocol + '://' + host + ':' + port + '/storage/' + userName,
        rel: "remotestorage",
        type: this.specVersion,
        properties: {
          'auth-method': "http://tools.ietf.org/html/rfc6749#section-4.2",
          'auth-endpoint': authUrl
        }
      };
    case 'draft-dejong-remotestorage-01':
      return {
        href: protocol + '://' + host + ':' + port + '/storage/' + userName,
        rel: "remotestorage",
        type: this.specVersion,
        properties: {
          "http://tools.ietf.org/html/rfc6749#section-4.2": authUrl
        }
      };
    case 'draft-dejong-remotestorage-02':
    case 'draft-dejong-remotestorage-03':
      return {
        href: protocol + '://' + host + ':' + port + '/storage/' + userName,
        rel: "remotestorage",
        properties: {
          'http://remotestorage.io/spec/version': this.specVersion,
          'http://tools.ietf.org/html/rfc6749#section-4.2': authUrl,
          'http://tools.ietf.org/html/rfc6750#section-2.3': false,
          'http://tools.ietf.org/html/rfc2616#section-14.16': false
        }
      };
    default:
      return {
        href: protocol + '://' + host + ':' + port + '/storage/' + userName,
        rel: "remotestorage",
        properties: {
          'http://remotestorage.io/spec/version': this.specVersion,
          'http://tools.ietf.org/html/rfc6749#section-4.2': authUrl,
          'http://tools.ietf.org/html/rfc6750#section-2.3': false,
          'http://tools.ietf.org/html/rfc7233': false,
          'http://remotestorage.io/spec/web-authoring': (webAuthoring || false)
        }
      };
  }
};

module.exports.prototype.backdoorSet = function(username, path, body, contentType, cb) {
  var revision = new Buffer(sha1(body), 'utf-8');
  if (typeof contentType === 'string') {
    contentType = new Buffer(contentType, 'utf-8');
  }
  this.mainInstance.set(username, path, body, contentType, revision, function(err) {
    if (err) {
      cb('backdoorSet', username, path, body, contentType, err);
    } else {
      cb(null, revision);
    }
  });
};
