var scopes = require('./scopes'),
  main = require('./main'),
  requests = require('./requests');

exports.createServer = function(specVersion, tokenStore, dataStore) {
  var folderFormat = 'map', folderContentType = 'application/json', rootScope = '*',
    scopesInstance = scopes.createInstance(tokenStore),
    mainInstance = main.createInstance(dataStore),
    requestsInstance = requests.createInstance('/storage/', scopesInstance, mainInstance);

  if (specVersion === 'draft-dejong-remotestorage-00' || specVersion === 'draft-dejong-remotestorage-01') {
    folderFormat = 'etags-only';
    rootScope = 'root';
  } else if (specVersion === 'draft-dejong-remotestorage-02') {
    //use defaults
  } else if (specVersion === 'draft-dejong-remotestorage-03') {
    folderContentType = 'application/ld+json';
  } else {
    throw new Error('unknown spec version ' + JSON.stringify(specVersion));
  }
  return {
    storage: function(req, res) {
      requestsInstance.handleRequest(req, res, folderFormat, folderContentType);
    },
    makeScopePaths: function(userName, scopes) {
      return scopesInstance.makeScopePaths(userName, scopes, rootScope);
    },
    getWebfingerLink: function(protocol, host, port, userName, authUrl) {
      if (specVersion === 'draft-dejong-remotestorage-00') {
        return {
          href: protocol + '://' + host + ':' + port + '/storage/' + userName,
          rel: "remotestorage",
          type: specVersion,
          properties: {
            'auth-method': "http://tools.ietf.org/html/rfc6749#section-4.2",
            'auth-endpoint': authUrl
          }
        };
      } else if (specVersion === 'draft-dejong-remotestorage-01') {
        return {
          href: protocol + '://' + host + ':' + port + '/storage/' + userName,
          rel: "remotestorage",
          type: specVersion,
          properties: {
            "http://tools.ietf.org/html/rfc6749#section-4.2": authUrl
          }
        };
      } else {
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
    }
  };
};
