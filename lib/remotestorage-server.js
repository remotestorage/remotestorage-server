var Scopes = require('./scopes'),
  Main = require('./main'),
  Requests = require('./requests');

module.exports = function(specVersion, tokenStore, dataStore) {
  this.folderFormat = 'map';
  this.folderContentType = 'application/json';
  this.rootScope = '*';
  this.scopesInstance = new Scopes(tokenStore);
  this.mainInstance = new Main(dataStore);
  this.requestsInstance = new Requests('/storage/', this.scopesInstance, this.mainInstance);

  if (specVersion === 'draft-dejong-remotestorage-00' || specVersion === 'draft-dejong-remotestorage-01') {
    this.folderFormat = 'etags-only';
    this.rootScope = 'root';
  } else if (specVersion === 'draft-dejong-remotestorage-02') {
    //use defaults
  } else if (specVersion === 'draft-dejong-remotestorage-03') {
    this.folderContentType = 'application/ld+json';
  } else {
    throw new Error('unknown spec version ' + JSON.stringify(specVersion));
  }
};
module.exports.prototype.storage = function(req, res) {
  requestsInstance.handleRequest(req, res, this.folderFormat, this.folderContentType);
};
module.exports.prototype.makeScopePaths = function(userName, scopes) {
  return scopesInstance.makeScopePaths(userName, scopes, this.rootScope);
};
module.exports.prototype.getWebfingerLink = function(protocol, host, port, userName, authUrl) {
  switch (this.specVersion) {
    case 'draft-dejong-remotestorage-00':
      return {
        href: protocol + '://' + host + ':' + port + '/storage/' + userName,
        rel: "remotestorage",
        type: specVersion,
        properties: {
          'auth-method': "http://tools.ietf.org/html/rfc6749#section-4.2",
          'auth-endpoint': authUrl
        }
      };
    case 'draft-dejong-remotestorage-01':
      return {
        href: protocol + '://' + host + ':' + port + '/storage/' + userName,
        rel: "remotestorage",
        type: specVersion,
        properties: {
          "http://tools.ietf.org/html/rfc6749#section-4.2": authUrl
        }
      };
    default:
      return {
        href: protocol + '://' + host + ':' + port + '/storage/' + userName,
        rel: "remotestorage",
        properties: {
          'http://remotestorage.io/spec/version': 'draft-dejong-remotestorage-02',
          'http://tools.ietf.org/html/rfc6749#section-4.2': authUrl,
          'http://tools.ietf.org/html/rfc6750#section-2.3': false,
          'http://tools.ietf.org/html/rfc2616#section-14.16': false
        }
      };
  }
};
