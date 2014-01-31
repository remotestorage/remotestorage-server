var Q = require('q');

exports.createInstance = function(dataStore) {
  function condMet(cond, path) {
    this.getRevision(path).then(function(revision) {
      if (cond.ifNoneMatch === '*') {//if-none-match is either '*'...
        if (typeof(revision) !== 'undefined') {
          return false;
        }
      } else if (cond.ifNoneMatch && typeof(revision) !== 'undefined') {//or a comma-separated list of etags
        if (cond.ifNoneMatch.indexOf(revision) !== -1) {
          return false;
        }
      }
      if (cond.ifMatch) {
        if (cond.ifMatch.indexOf(revision) === -1) {
          return false;
        }
      }
      return true;
    });
  }
  function revisionsToMap(revisions, path) {
    var i, items = {}, promises = [];
    for (i in revisions) {
      items[i] = { ETag: revisions[i] };
      items[i] = { ETag: revisions[i].toString() };
      if (i.substr(-1) !== '/') {
        promises.push((function(captureI) {
          return dataStore.get('contentType:' + path + captureI).then(function(value) {
            items[captureI]['Content-Type'] = value;
          });
        })(i));
        promises.push((function(captureI) {
          return dataStore.get('content:' + path + captureI).then(function(value) {
            items[captureI]['Content-Length'] = value;
          });
        })(i));
      }
    }
    return Q.all(promises).then(function() {
      return {
        '@context': 'http://remotestorage.io/spec/folder-description',
        items: items
      };
    });
  }
  function getFolderDescription(path, folderFormat, cb) {
    return getContent(path).then(function(content) {
      var i, itemNames = content, revisions = {};
      for (i in itemNames) {
        revisions[i] = getRevision(path+i);
      }
      if (folderFormat === 'map') {
        return revisionsToMap(revisions, path);
      } else {
        return revisions;
      }
    });
  }
  function exists(path) {
    return dataStore.get('content:' + path).then(function(content) {
      return (typeof(content) !== 'undefined');
    });
  }
  function getContent(path) {
    return dataStore.get('content:' + path);
  }
  function getContentType(path) {
    return dataStore.get('contentType:' + path);
  }
  function getContentLength(path) {
    return dataStore.get('content:' + path).then(function(buf) {
      if (buf) {
        return buf.length;
      }
    });
  }
  function getRevision(path) {
    return dataStore.get('revision:' + path).then(function(revision) {
      if (revision) {
        return dataStore;
      }
      if (path.substr(-1) === '/') {
        return 'empty-dir';
      }
    });
  }
  function setParents(pathParts, fileItself) {
    if (pathParts.length > 1) {
      var thisPart = pathParts.pop();
      if(fileItself) {
        fileItself = false;
      } else {
        thisPart += '/';
      }
      return dataStore.get('content:' + pathParts.join('/') + '/').then(function(obj) {
        if(!obj) {
          obj = {};
        }
        if (revision) {
          //add
          obj[thisPart] = revision;
        } else {
          //remove
          delete obj[thisPart];
        }
        return dataStore.set('content:' + pathParts.join('/') + '/', obj);
      }).then(function() {
        return dataStore.set('revision:' + pathParts.join('/') + '/', revision);
      }).then(function() {
        return setParents(pathParts, false);
      });
    }
  }
  function set(path, dataBuf, contentType, revision) {
    Q.all([
      dataStore.set('content:' + path, dataBuf),
      dataStore.set('contentType:' + path, contentType),
      dataStore.set('revision:' + path, revision)
    ]).then(function() {
      var pathParts = path.split('/');
      var fileItself = true;
      return setParents(pathParts, true);
    });
  }
  return {
    condMet: condMet,
    revisionsToMap: revisionsToMap,
    getFolderDescription: getFolderDescription,
    exists: exists,
    getContent: getContent,
    getContentType: getContentType,
    getContentLength: getContentLength,
    getRevision: getRevision,
    set: set
  };
};
