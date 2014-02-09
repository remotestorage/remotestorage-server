module.exports = function(tokenStore) {
  this.tokenStore = tokenStore;
};
module.exports.prototype.makeScopePaths = function(scopes, rootScope) {
  var i, scopePaths=[];
  for (i=0; i<scopes.length; i++) {
    var thisScopeParts = scopes[i].split(':');
    if (thisScopeParts[0] === rootScope) {
      scopePaths.push('/:'+thisScopeParts[1]);
    } else {
      scopePaths.push('/'+thisScopeParts[0]+'/:'+thisScopeParts[1]);
      scopePaths.push('/public/'+thisScopeParts[0]+'/:'+thisScopeParts[1]);
    }
  }
  return scopePaths;
};

module.exports.prototype.may = function(authorizationHeader, username, path, write, cb) {
  var i, scopeParts, scopes, pathParts;
  if (write && path.substr(-1) === '/') {
    cb(null, false);
  } else if (path[0] !== '/' || username.length === 0) {
    cb(null, false);
  } else if (authorizationHeader) {
    this.tokenStore.get(username, authorizationHeader.substring('Bearer '.length), function(err, scopes) {
      if (err) {
        cb(err);
        return;
      }
      if (scopes) {
        for (i=0; i<scopes.length; i++) {
          scopeParts = scopes[i].split(':');
          if(scopeParts.length==2
              && path.substring(0, scopeParts[0].length)==scopeParts[0] 
              && (scopeParts[1]=='rw' || !write)) {
            cb(null, true);
            return;
          }
        }
      }
      if (write) {
        cb(null, false);
      } else {
        pathParts = path.split('/');//e.g. ['public', 'foo', 'bar', '']
        cb(null, (pathParts[1] === 'public') && (path.substr(-1) !== '/'));
      }
    });
    return;
  } else if (write) {
    cb(null, false);
  } else {
    pathParts = path.split('/');//e.g. ['public', 'foo', 'bar', '']
    cb(null, (pathParts[1] === 'public') && (path.substr(-1) !== '/'));
  }
};
module.exports.prototype.mayRead = function(authorizationHeader, username, path, cb) {
  return this.may(authorizationHeader, username, path, false, cb);
};
module.exports.prototype.mayWrite = function(authorizationHeader, username, path, cb) {
  return this.may(authorizationHeader, username, path, true, cb);
};
