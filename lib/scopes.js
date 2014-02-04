module.exports = function(tokenStore) {
  this.tokenStore = tokenStore;
};
module.exports.prototype.makeScopePaths = function(userName, scopes, rootScope) {
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
};

module.exports.prototype.may = function(authorizationHeader, path, write, cb) {
  var i, scopeParts, scopes, pathParts;
  if (write && path.substr(-1) === '/') {
    cb(null, false);
  } else if (authorizationHeader) {
    this.tokenStore.get(authorizationHeader.substring('Bearer '.length), function(err, scopes) {
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
        pathParts = path.split('/');//e.g. ['me', 'public', 'foo', 'bar', '']
        cb(null, (pathParts[1] === 'public') && (path.substr(-1) !== '/'));
      }
    });
    return;
  } else if (write) {
    cb(null, false);
  } else {
    pathParts = path.split('/');//e.g. ['me', 'public', 'foo', 'bar', '']
    cb(null, (pathParts[1] === 'public') && (path.substr(-1) !== '/'));
  }
};
module.exports.prototype.mayRead = function(authorizationHeader, path, cb) {
  return this.may(authorizationHeader, path, false, cb);
};
module.exports.prototype.mayWrite = function(authorizationHeader, path, cb) {
  return this.may(authorizationHeader, path, true, cb);
};
