exports.createInstance = function(dataStore) {
  function condMet(cond, path, cb) {
    getRevision(path, function(err, revision) {
      if (cond.ifNoneMatch === '*') {//if-none-match is either '*'...
        if (typeof(revision) !== 'undefined') {
          cb(err, false);
          return;
        }
      } else if (cond.ifNoneMatch && typeof(revision) !== 'undefined') {//or a comma-separated list of etags
        if (cond.ifNoneMatch.indexOf(revision) !== -1) {
          cb(err, false);
          return;
        }
      }
      if (cond.ifMatch) {
        if (cond.ifMatch.indexOf(revision) === -1) {
          cb(err, false);
          return;
        }
      }
      cb(err, true);
    });
  }
  function revisionsToMap(revisions, path, cb) {
    var i, items = {}, todo = 1;
    function doneOne() {
      todo--;
      if (todo === 0) {
        cb(null, {
          '@context': 'http://remotestorage.io/spec/folder-description',
          items: items
        });
      }
    }
    for (i in revisions) {
      items[i] = { ETag: revisions[i] };
      items[i] = { ETag: revisions[i].toString() };
      if (i.substr(-1) !== '/') {
        todo++;
        (function(captureI) {
          getContentType(path + captureI, function(err, value) {
            items[captureI]['Content-Type'] = value;
            doneOne();
          });
        })(i);
        todo++;
        (function(captureI) {
          getContentLength(path + captureI, function(err, value) {
            items[captureI]['Content-Length'] = value;
            doneOne();
          });
        })(i);
      }
    }
    doneOne();
  }
  function getFolderDescription(path, folderFormat, cb) {
    getContent(path, function(err, content) {
      var i, itemNames = content, revisions = {}, todo = 1;
      function doneOne() {
        todo--;
        if (todo === 0) {
          if (folderFormat === 'map') {
            revisionsToMap(revisions, path, cb);
          } else {
            cb(err, revisions);
          }
        }
      }
      for (i in itemNames) {
        todo++;
        (function(captureI) {
          getRevision(path+captureI, function(err, revision) {
            revisions[captureI] = revision;
            doneOne();
          });
        })(i);
      }
      doneOne();
    });
  }
  function exists(path, cb) {
    dataStore.get('content:' + path, function(err, content) {
      cb(err, (typeof(content) !== 'undefined'));
    });
  }
  function getContent(path, cb) {
    dataStore.get('content:' + path, cb);
  }
  function getContentType(path, cb) {
    dataStore.get('contentType:' + path, cb);
  }
  function getContentLength(path, cb) {
    dataStore.get('content:' + path, function(err, buf) {
      if (buf) {
        cb(err, buf.length);
      } else {
        cb(err);
      }
    });
  }
  function getRevision(path, cb) {
    dataStore.get('revision:' + path, function(err, revision) {
      if (revision) {
        cb(err, revision);
      } else if (path.substr(-1) === '/') {
        cb(err, 'empty-dir');
      } else {
        cb(err);
      }
    });
  }
  function setParents(pathParts, fileItself, revision, cb) {
    if (pathParts.length <= 1) {
      cb();
    } else {
      var thisPart = pathParts.pop();
      if(fileItself) {
        fileItself = false;
      } else {
        thisPart += '/';
      }
      dataStore.get('content:' + pathParts.join('/') + '/', function(err1, obj) {
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
        dataStore.set('content:' + pathParts.join('/') + '/', obj, function(err2) {
          dataStore.set('revision:' + pathParts.join('/') + '/', revision, function(err3) {
            setParents(pathParts, false, revision, cb);
          });
        });
      });
    }
  }
  function set(path, dataBuf, contentType, revision, cb) {
    dataStore.set('content:' + path, dataBuf, function(err1) {
      dataStore.set('contentType:' + path, contentType,function(err2) {
        dataStore.set('revision:' + path, revision, function(err3) {
          var pathParts = path.split('/');
          var fileItself = true;
          setParents(pathParts, true, revision, cb);
        });
      });
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
