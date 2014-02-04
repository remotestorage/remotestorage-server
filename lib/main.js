module.exports = function(dataStore) {
  this.dataStore = dataStore;
};

module.exports.prototype.condMet = function(cond, path, cb) {
  this.getRevision(path, function(err, revision) {
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
  }.bind(this));
};
module.exports.prototype.revisionsToMap = function(revisions, path, cb) {
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
        this.getContentType(path + captureI, function(err, value) {
          items[captureI]['Content-Type'] = value;
          doneOne.bind(this)();
        });
      }.bind(this))(i);
      todo++;
      (function(captureI) {
        this.getContentLength(path + captureI, function(err, value) {
          items[captureI]['Content-Length'] = value;
          doneOne();
        });
      }.bind(this))(i);
    }
  }
  doneOne();
};
module.exports.prototype.getFolderDescription = function(path, folderFormat, cb) {
  this.getContent(path, function(err, content) {
    var i, itemNames = content, revisions = {}, todo = 1;
    function doneOne() {
      todo--;
      if (todo === 0) {
        if (folderFormat === 'map') {
          this.revisionsToMap(revisions, path, cb);
        } else {
          cb(err, revisions);
        }
      }
    }
    for (i in itemNames) {
      todo++;
      (function(captureI) {
        this.getRevision(path+captureI, function(err, revision) {
          revisions[captureI] = revision;
          doneOne.bind(this)();
        }.bind(this));
      }.bind(this))(i);
    }
    doneOne.bind(this)();
  }.bind(this));
};
module.exports.prototype.exists = function(path, cb) {
  this.dataStore.get('content:' + path, function(err, content) {
    cb(err, (typeof(content) !== 'undefined'));
  });
};
module.exports.prototype.getContent = function(path, cb) {
  this.dataStore.get('content:' + path, cb);
};
module.exports.prototype.getContentType = function(path, cb) {
  this.dataStore.get('contentType:' + path, cb);
};
module.exports.prototype.getContentLength = function(path, cb) {
  this.dataStore.get('content:' + path, function(err, buf) {
    if (buf) {
      cb(err, buf.length);
    } else {
      cb(err);
    }
  });
};
module.exports.prototype.getRevision = function(path, cb) {
  this.dataStore.get('revision:' + path, function(err, revision) {
    if (revision) {
      cb(err, revision);
    } else if (path.substr(-1) === '/') {
      cb(err, 'empty-dir');
    } else {
      cb(err);
    }
  });
};
module.exports.prototype.setParents = function(pathParts, fileItself, revision, cb) {
  if (pathParts.length <= 1) {
    cb();
  } else {
    var thisPart = pathParts.pop();
    if(fileItself) {
      fileItself = false;
    } else {
      thisPart += '/';
    }
    this.dataStore.get('content:' + pathParts.join('/') + '/', function(err1, obj) {
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
      this.dataStore.set('content:' + pathParts.join('/') + '/', obj, function(err2) {
        this.dataStore.set('revision:' + pathParts.join('/') + '/', revision, function(err3) {
          this.setParents(pathParts, false, revision, cb);
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }
};
module.exports.prototype.set = function(path, dataBuf, contentType, revision, cb) {
  this.dataStore.set('content:' + path, dataBuf, function(err1) {
    this.dataStore.set('contentType:' + path, contentType,function(err2) {
      this.dataStore.set('revision:' + path, revision, function(err3) {
        var pathParts = path.split('/');
        var fileItself = true;
        this.setParents(pathParts, true, revision, cb);
      }.bind(this));
    }.bind(this));
  }.bind(this));
};
