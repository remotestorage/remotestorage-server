var sha1 = require('sha1');

module.exports = function(dataStore) {
  this.dataStore = dataStore;
};

module.exports.prototype.condMet = function(cond, username, path, cb) {
  this.getRevision(username, path, function(err, revision) {
    var i, found;
    if (err) {
      cb(err);
      return;
    }
    if (cond.ifNoneMatch === '*') {//if-none-match is either '*'...
      if (typeof(revision) !== 'undefined') {
        cb(err, false);
        return;
      }
    } else if (cond.ifNoneMatch && typeof(revision) !== 'undefined') {//or a comma-separated list of etags
      for (i=0; i<cond.ifNoneMatch.length; i++) {
        if(cond.ifNoneMatch[i].toString('utf-8') === revision.toString('utf-8')) {
          cb(err, false);
          return;
        }
      }
    }
    if (cond.ifMatch) {
      if (Buffer.isBuffer(revision)) {
        for (i=0; i<cond.ifMatch.length; i++) {
          if (cond.ifMatch[i].toString('utf-8') === revision.toString('utf-8')) {
            found = true;
          }
        }
      }
      if (!found) {
        cb(err, false);
        return;
      }
    }
    cb(err, true);
  }.bind(this));
};
module.exports.prototype.revisionsToMap = function(revisions, username, path, cb) {
  var i, items = {}, todo = 1, error, errorSent;
  function doneOne() {
    if (error) {
      if (!errorSent) {
        cb(error);
        errorSent = true;
      }
      return;
    }
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
        this.getContentType(username, path + captureI, function(err, value) {
          if (err) {
            error = err;
            return;
          }
          items[captureI]['Content-Type'] = value.toString('utf-8');
          doneOne.bind(this)();
        });
      }.bind(this))(i);
      todo++;
      (function(captureI) {
        this.getContentLength(username, path + captureI, function(err, value) {
          if (err) {
            error = err;
            return;
          }
          items[captureI]['Content-Length'] = value;
          doneOne();
        });
      }.bind(this))(i);
    }
  }
  doneOne();
};
module.exports.prototype.getFolderDescription = function(username, path, folderFormat, cb) {
  this.getContent(username, path, function(err, content) {
    var i, itemNames = content, revisions = {}, todo = 1, error, errorSent;
    try {
      itemNames = JSON.parse(content);
    } catch(e) {
      cb(e);
      return;
    }
    function doneOne() {
      if (error) {
        if (!errorSent) {
          cb(error);
          errorSent = true;
        }
        return;
      }
      todo--;
      if (todo === 0) {
        if (folderFormat === 'map') {
          this.revisionsToMap(revisions, username, path, cb);
        } else {
          cb(err, revisions);
        }
      }
    }
    for (i in itemNames) {
      todo++;
      (function(captureI) {
        this.getRevision(username, path+captureI, function(err, revision) {
          if (err) {
            error = err;
            return;
          }
          revisions[captureI] = revision.toString('utf-8');
          doneOne.bind(this)();
        }.bind(this));
      }.bind(this))(i);
    }
    doneOne.bind(this)();
  }.bind(this));
};
module.exports.prototype.exists = function(username, path, cb) {
  this.dataStore.get(username, 'revision:' + path, function(err, content) {
    if (err) {
      cb(err);
      return;
    }
    cb(err, (typeof(content) !== 'undefined'));
  });
};
module.exports.prototype.getContent = function(username, path, cb) {
  this.dataStore.get(username, 'content:' + path, cb);
};
module.exports.prototype.getContentType = function(username, path, cb) {
  this.dataStore.get(username, 'contentType:' + path, cb);
};
module.exports.prototype.getContentLength = function(username, path, cb) {
  this.dataStore.get(username, 'content:' + path, function(err, buf) {
    if (err) {
      cb(err);
      return;
    }
    if (buf) {
      cb(err, buf.length);
    } else {
      cb(err);
    }
  });
};
module.exports.prototype.getRevision = function(username, path, cb) {
  this.dataStore.get(username, 'revision:' + path, function(err, revision) {
    if (err) {
      cb(err);
      return;
    }
    if (revision) {
      cb(err, revision);
    } else if (path.substr(-1) === '/') {
      cb(err, 'empty-dir');
    } else {
      cb(err);
    }
  });
};
module.exports.prototype.setParents = function(username, pathParts, fileItself, revision, cb) {
  if (pathParts.length <= 1) {
    cb();
  } else {
    var thisPart = pathParts.pop();
    if(fileItself) {
      fileItself = false;
    } else {
      thisPart += '/';
    }
    this.dataStore.get(username, 'content:' + pathParts.join('/') + '/', function(err1, buf) {
      var obj;
      if (err1) {
        cb(err1);
        return;
      }
      if(buf === undefined) {
        obj = {};
      } else {
        try {
          obj = JSON.parse(buf.toString('utf-8'));
        } catch(e) {
          cb(e);
          return;
        }
      }
      if (revision) {
        //add
        obj[thisPart] = revision;//we need to store the revision here so that it changes the parent revision
      } else {
        //remove
        delete obj[thisPart];
      }
      this.dataStore.set(username, 'content:' + pathParts.join('/') + '/', new Buffer(JSON.stringify(obj), 'utf-8'), function(err2) {
        if (err2) {
          cb(err2);
          return;
        }
        this.dataStore.set(username, 'revision:' + pathParts.join('/') + '/', new Buffer(sha1(JSON.stringify(obj)), 'utf-8'), function(err3) {
          if (err3) {
            cb(err3);
            return;
          }
          this.setParents(username, pathParts, false, revision, cb);
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }
};
module.exports.prototype.set = function(username, path, dataBuf, contentType, revision, cb) {
  this.dataStore.set(username, 'content:' + path, dataBuf, function(err1) {
    if (err1) {
      cb(err1);
      return;
    }
    this.dataStore.set(username, 'contentType:' + path, contentType, function(err2) {
      if (err2) {
        cb(err2);
        return;
      }
      this.dataStore.set(username, 'revision:' + path, revision, function(err3) {
        if (err3) {
          cb(err3);
          return;
        }
        var pathParts = path.split('/');
        var fileItself = true;
        this.setParents(username, pathParts, true, revision, cb);
      }.bind(this));
    }.bind(this));
  }.bind(this));
};
