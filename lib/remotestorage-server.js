var url = require('url'),
  scopes = require('./scopes'),
  main = require('./main'),
  requests = require('./requests');

exports.createServer = function(specVersion, tokenStore, dataStore) {
  var folderFormat = 'map', folderContentType = 'application/json',
    scopesInstance = scopes.createInstance(tokenStore),
    mainInstance = main.createInstance(dataStore),
    requestsInstance = requests.createInstance(scopesInstance, mainInstance);

  if (specVersion === 'draft-dejong-remotestorage-00' || specVersion === 'draft-dejong-remotestorage-01') {
    folderFormat = 'etags-only';
  } else if (specVersion === 'draft-dejong-remotestorage-02') {
    //use defaults
  } else if (specVersion === 'draft-dejong-remotestorage-03') {
    folderContentType = 'application/ld+json';
  } else {
    throw new Error('unknown spec version ' + JSON.stringify(specVersion));
  }
  return {
    storage: requestsInstance.handleRequest
  };
};
