exports.createInstance = function(tokenStore) {
  function makeScopePaths(userName, scopes) {
    var i, scopePaths=[];
    for (i=0; i<scopes.length; i++) {
      var thisScopeParts = scopes[i].split(':');
      if (thisScopeParts[0]=='') {
        scopePaths.push(userName+'/:'+thisScopeParts[1]);
      } else {
        scopePaths.push(userName+'/'+thisScopeParts[0]+'/:'+thisScopeParts[1]);
        scopePaths.push(userName+'/public/'+thisScopeParts[0]+'/:'+thisScopeParts[1]);
      }
    }
    return scopePaths;
  }

  function may(authorizationHeader, path, write) {
    var i, scopeParts, scopes, pathParts;
    if (write && path.substr(-1) === '/') {
      return false;
    }
    if (authorizationHeader) {
      scopes = tokenStore.get(authorizationHeader.substring('Bearer '.length));
      if (scopes) {
        for (i=0; i<scopes.length; i++) {
          scopeParts = scopes[i].split(':');
          if(scopeParts.length==2
              && path.substring(0, scopeParts[0].length)==scopeParts[0] 
              && (scopeParts[1]=='rw' || !write)) {
            return true;
          }
        }
      }
    }
    if (write) {
      return false;
    } else {
      pathParts = path.split('/');
      return (pathParts[0] === 'me' && pathParts[1] === 'public' && path.substr(-1) !== '/');
    }
  }
  return {
    makeScopePaths: makeScopePaths,
    mayRead: function(authorizationHeader, path) {
      return may(authorizationHeader, path, false);
    },
    mayWrite: function(authorizationHeader, path) {
      return may(authorizationHeader, path, true);
    }
  };
};
