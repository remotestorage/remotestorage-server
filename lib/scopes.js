exports.createInstance = function(tokenStore) {
  function makeScopePaths(userName, scopes, rootScope) {
    var i, scopePaths=[];
    for (i=0; i<scopes.length; i++) {
      var thisScopeParts = scopes[i].split(':');
      if (thisScopeParts[0] === rootScope) {
        scopePaths.push(userName+'/:'+thisScopeParts[1]);
      } else {
        scopePaths.push(userName+'/'+thisScopeParts[0]+'/:'+thisScopeParts[1]);
        scopePaths.push(userName+'/public/'+thisScopeParts[0]+'/:'+thisScopeParts[1]);
      }
    }
    return scopePaths;
  }

  function may(authorizationHeader, path, write, cb) {
    var i, scopeParts, scopes, pathParts;
    if (write && path.substr(-1) === '/') {
      cb(false);
    } else if (authorizationHeader) {
      tokenStore.get(authorizationHeader.substring('Bearer '.length), function(err, scopes) {
        if (scopes) {
          for (i=0; i<scopes.length; i++) {
            scopeParts = scopes[i].split(':');
            if(scopeParts.length==2
                && path.substring(0, scopeParts[0].length)==scopeParts[0] 
                && (scopeParts[1]=='rw' || !write)) {
              cb(true);
            }
          }
        }
      });
      return;
    } else if (write) {
      cb(false);
    } else {
      pathParts = path.split('/');//e.g. ['me', 'public', 'foo', 'bar', '']
      cb((pathParts[1] === 'public') && (path.substr(-1) !== '/'));
    }
  }
  return {
    makeScopePaths: makeScopePaths,
    mayRead: function(authorizationHeader, path, cb) {
      return may(authorizationHeader, path, false, cb);
    },
    mayWrite: function(authorizationHeader, path, cb) {
      return may(authorizationHeader, path, true, cb);
    }
  };
};
