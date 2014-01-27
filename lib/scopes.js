
exports.createInstance = function(tokenStore) {
  function makeScopePaths(userName, scopes) {
    var scopePaths=[];
    for(var i=0; i<scopes.length; i++) {
      var thisScopeParts = scopes[i].split(':');
      if(thisScopeParts[0]=='') {
        scopePaths.push(userName+'/:'+thisScopeParts[1]);
      } else {
        scopePaths.push(userName+'/'+thisScopeParts[0]+'/:'+thisScopeParts[1]);
        scopePaths.push(userName+'/public/'+thisScopeParts[0]+'/:'+thisScopeParts[1]);
      }
    }
    return scopePaths;
  }

  function mayRead(authorizationHeader, path) {
    if(authorizationHeader) {
      var scopes = tokenStore.get(authorizationHeader.substring('Bearer '.length));
      if(scopes) {
        for(var i=0; i<scopes.length; i++) {
          var scopeParts = scopes[i].split(':');
          if(path.substring(0, scopeParts[0].length)==scopeParts[0]) {
            return true;
          }
        }
      }
    }
    var pathParts = path.split('/');
    return (pathParts[0]=='me' && pathParts[1]=='public' && path.substr(-1) != '/');
  }
  function mayWrite(authorizationHeader, path) { 
    if(path.substr(-1)=='/') {
      return false;
    }
    if(authorizationHeader) {
      var scopes = tokenStore.get(authorizationHeader.substring('Bearer '.length));
      if(scopes) {
        for(var i=0; i<scopes.length; i++) {
          var scopeParts = scopes[i].split(':');
          if(scopeParts.length==2 && scopeParts[1]=='rw' && path.substring(0, scopeParts[0].length)==scopeParts[0]) {
            return true;
          }
        }
      }
    }
    return false;
  }
  return {
    makeScopePaths: makeScopePaths,
    mayRead: mayRead,
    mayWrite: mayWrite
  };
};
