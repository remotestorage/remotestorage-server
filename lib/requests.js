var url = require('url'),
  sha1 = require('sha1'),
  async = require('async');

module.exports = function(pathPrefix, scopesInstance, mainInstance) {
  this.pathPrefix = pathPrefix;
  this.scopesInstance = scopesInstance;
  this.mainInstance = mainInstance;
  this._queue = async.queue(function(task, cb) { task(cb) }, 1);
};
/*
 * the way this works is if two http requests run in parallel,
 * it will handle the first one entirely before starting the
 * other one. Calling _lock puts a release function on the http
 * server response object (res)
 * object, and any function completing the current request by
 * calling res.end() will allow the next item to be popped from
 * the queue
 */
module.exports.prototype._lock = function(cb) {
  this._queue.push(cb);
}
module.exports.prototype.writeHead = function(res, status, origin, revision, contentType, contentLength) {
  var headers = {
    'Access-Control-Allow-Origin': (origin ? origin : '*'),
    'Access-Control-Allow-Headers': 'Authorization, Content-Length, Content-Type, If-Match, If-None-Match, Origin, X-Requested-With',
    'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
    'Cache-Control': 'no-cache, no-store',
    'Expires': '0'
  };
  if (status === 401) {
    headers['WWW-Authenticate'] = 'Bearer realm="remoteStorage" error="invalid_token"';
  }
  if (Buffer.isBuffer(revision)) {
    headers.etag = '"' + revision.toString('utf-8') + '"';
  }
  if (Buffer.isBuffer(contentType)) {
    headers['content-type'] = contentType.toString('utf-8');
  }
  if (typeof(contentLength) === 'number') {
    headers['content-length'] = contentLength.toString();
  }
  res.writeHead(status, headers);
};

module.exports.prototype.writeRaw = function(res, contentType, content, origin, revision, explicitLength) {
  this.writeHead(res, 200, origin, revision, contentType, (Buffer.isBuffer(content) ? content.length : explicitLength));
  if (Buffer.isBuffer(content)) {
    res.end(content);
  } else {
    res.end();
  }
};

module.exports.prototype.error = function(res, msg, origin) {
  //console.log('internal server error - '+msg);
  this.respond(res, origin, 500);
};

module.exports.prototype.respond = function(res, origin, status, etag) {
  var errorMsg = {
    304: false,
    401: 'Unauthorized',
    404: 'Not Found',
    405: 'Method not allowed',
    412: 'Precondition failed',
    500: 'Internal Server Error'
  };
  if (errorMsg[status] === undefined) {
    errorMsg[status] = 'Computer says no';
  }
  if (errorMsg[status]) {
    this.writeHead(res, status, origin, etag, new Buffer('text/plain', 'utf-8'), errorMsg[status].length+4);
    res.end(status.toString() + ' ' + errorMsg[status]);
  } else {
    //no Content-Length header in this case:
    this.writeHead(res, status, origin, etag, 'text/plain');
    res.end();
  }
};

module.exports.prototype.checkNoFolder = function(req, res, username, path, cb, release) {
  if (path.substr(-1) === '/') {
    this.respond(res, req.headers.origin, 400);
    //console.log('checkNoFolder:no calling release');
    release();
  } else {
    cb(null, true);
  }
};
module.exports.prototype.checkMayRead = function(req, res, username, path, cb, release) {
  this.scopesInstance.mayRead(req.headers.authorization, username, path, function(err, answer) {
    if (err) {
      this.error(res, err, req.headers.origin);
      //console.log('checkMayRead:err calling release');
      release();
    } else if (answer) {
      cb(err, answer);
    } else {
      this.respond(res, req.headers.origin, 401);
      //console.log('checkMayRead:no calling release');
      release();
    }
  }.bind(this));
};
module.exports.prototype.checkMayWrite = function(req, res, username, path, cb, release) {
  this.scopesInstance.mayWrite(req.headers.authorization, username, path, function(err, answer) {
    if (err) {
      this.error(res, err, req.headers.origin);
      //console.log('checkMayWrite:err calling release');
      release();
    } else if (answer) {
      cb(err, answer);
    } else {
      this.respond(res, req.headers.origin, 401);
      //console.log('checkMayWrite:no calling release');
      release();
    }
  }.bind(this));
};
module.exports.prototype.stripQuotes = function(str) {
  var i, parts, ret = [];
  if (typeof(str) !== 'string') {
    return undefined;
  }
  if (str === '*') {
    return str;
  }
  parts = str.split(',');
  for (i=0; i<parts.length; i++) {
    parts[i] = parts[i].trim();
    if (parts[i][0] === '"' && parts[i][parts[i].length-1] === '"') {
      ret.push(new Buffer(parts[i].substring(1, parts[i].length-1), 'utf-8'));
    } else {
      ret.push(new Buffer(parts[i], 'utf-8'));
    }
  }
  return ret;
};
module.exports.prototype.checkCondMet = function(req, res, username, path, statusCode, cb, release) {
  var cond = {
    ifNoneMatch: this.stripQuotes(req.headers['if-none-match']),
    ifMatch: this.stripQuotes(req.headers['if-match'])
  };
  this.mainInstance.condMet(cond, username, path, function(err, answer) {
    if (err) {
      this.error(res, err, req.headers.origin);
      //console.log('checkCondMet:err calling release');
      release();
    } else if (answer) {
      cb(err, answer);
    } else {
      this.mainInstance.getRevision(username, path, function(err, revision) {
        if (err) {
          this.error(res, err, req.headers.origin);
        } else {
          this.respond(res, req.headers.origin, statusCode, revision);
        }
        //console.log('checkCondMet:no calling release');
        release();
      }.bind(this));
    }
  }.bind(this));
};
module.exports.prototype.checkFound = function(req, res, username, path, folder404s, cb, release) {
  if (path.substr(-1) === '/' && !folder404s) {//folders always exist in new spec versions
    cb();
  } else {
    this.mainInstance.exists(username, path, function(err, answer) {
      if (err) {
        this.error(res, err, req.headers.origin);
        //console.log('checkFound:err calling release');
        release();
      } else if (answer) {
        cb(err, answer);
      } else {
        this.respond(res, req.headers.origin, 404);
        //console.log('checkFound:no calling release');
        release();
      }
    }.bind(this));
  }
};
module.exports.prototype.doHead = function(req, res, release, username, path, folderContentType) {
  if (path.substr(-1) === '/') {
    this.mainInstance.getRevision(username, path, function(err, revision) {
      if (err) {
        this.error(res, err, req.headers.origin);
        //console.log('doHead:folder:err calling release');
        release();
      } else {
        this.writeRaw(res, folderContentType, undefined, req.headers.origin, revision);
        //console.log('doHead:folder calling release');
        release();
      }
    }.bind(this));
  } else {
    this.mainInstance.getContentType(username, path, function(err, contentType) {
      if (err) {
        this.error(res, err, req.headers.origin);
        //console.log('doHead:doc:err calling release');
        release();
      } else {
        this.mainInstance.getRevision(username, path, function(err2, revision) {
          if (err) {
            this.error(res, err2, req.headers.origin);
            //console.log('doHead:doc:err2 calling release');
            release();
          } else {
            this.mainInstance.getContent(username, path, function(err3, content) {
              if (err) {
                this.error(res, err3, req.headers.origin);
              } else {
                this.writeRaw(res, contentType, undefined, req.headers.origin, revision, content.length);
              }
              //console.log('doHead:doc calling release');
              release();
            }.bind(this));
          }
        }.bind(this));
      }
    }.bind(this));
  }
};
module.exports.prototype.doGet = function(req, res, release, username, path, folderFormat, folderContentType) {
  if (path.substr(-1) === '/') {
    this.mainInstance.getRevision(username, path, function(err, revision) {
      if (err) {
        this.error(res, err, req.headers.origin);
        //console.log('doGet:folder:err calling release');
        release();
      } else {
        this.mainInstance.getFolderDescription(username, path, folderFormat, function(err, desc) {
          if (err) {
            this.error(res, err, req.headers.origin);
          } else {
            var content = new Buffer(JSON.stringify(desc), 'utf-8');
            this.writeRaw(res, folderContentType, content, req.headers.origin, revision);
          }
          //console.log('doGet:folder calling release');
          release();
        }.bind(this));
      }
    }.bind(this));
  } else {
    var contentType, revision;
    this.mainInstance.getContentType(username, path, function(err, contentType) {
      if (err) {
        this.error(res, err, req.headers.origin);
        //console.log('doGet:doc:err calling release');
        release();
      } else {
        this.mainInstance.getRevision(username, path, function(err2, revision) {
          if (err) {
            this.error(res, err2, req.headers.origin);
            //console.log('doGet:doc:err2 calling release');
            release();
          } else {
            this.mainInstance.getContent(username, path, function(err3, content) {
              if (err) {
                this.error(res, err, req.headers.origin);
              } else {
                this.writeRaw(res, contentType, content, req.headers.origin, revision);
              }
              //console.log('doGet:doc calling release');
              release();
            }.bind(this));
          }
        }.bind(this));
      }
    }.bind(this));
  }
};
module.exports.prototype.doPut = function(req, res, release, username, path) {
  var body = new Buffer(0);
  req.on('data', function(chunk) {
    var buffer = new Buffer(body.length + chunk.length);
    body.copy(buffer);
    chunk.copy(buffer, body.length);
    body = buffer;
  });

  req.on('end', function() {
    var revision = new Buffer(sha1(body), 'utf-8');
    var contentType;
    if(req.headers['content-type']) {
      contentType = new Buffer(req.headers['content-type'], 'utf-8');
    }
    this.mainInstance.set(username, path, body, contentType, revision, function(err) {
      if (err) {
        this.error(res, err, req.headers.origin);
      } else {
        this.writeRaw(res, undefined, undefined, req.headers.origin, revision);
      }
      //console.log('doPut calling release');
      release();
    }.bind(this));
  }.bind(this));
};
module.exports.prototype.doDelete = function(req, res, release, username, path) {
  this.mainInstance.set(username, path, undefined, undefined, undefined, function(err) {
    if (err) {
      this.error(res, err, req.headers.origin);
    } else {
      this.writeRaw(res, undefined, undefined, req.headers.origin);
    }
    //console.log('doDelete calling release');
    release();
  }.bind(this));
};
module.exports.prototype.handleRequest = function(req, res, folderFormat, folderContentType, folder404s) {
  var urlObj = url.parse(req.url, true);
  var path = urlObj.pathname.substring(this.pathPrefix.length);
  var pos = path.indexOf('/');
  var username = path.substring(0, pos);
  path = path.substring(pos);
//console.log('locking', req.method);
  this._lock(function(release) {
//console.log('switching', req.method);
    switch (req.method) {
    case 'OPTIONS':
      this.writeRaw(res, undefined, undefined, req.headers.origin);
      //console.log('OPTIONS case calling release');
      release();
      break;
    case 'HEAD':
      this.checkMayRead(req, res, username, path, function() {
        this.checkFound(req, res, username, path, folder404s, function() {
          this.checkCondMet(req, res, username, path, 304, function() {
            this.doHead(req, res, release, username, path, folderContentType);
          }.bind(this), release);
        }.bind(this), release);
      }.bind(this), release);
      break;
    case 'GET':
      this.checkMayRead(req, res, username, path, function() {
        this.checkFound(req, res, username, path, folder404s, function() {
          this.checkCondMet(req, res, username, path, 304, function() {
            this.doGet(req, res, release, username, path, folderFormat, folderContentType);
          }.bind(this), release);
        }.bind(this), release);
      }.bind(this), release);
      break;
    case 'PUT':
      this.checkNoFolder(req, res, username, path, function() {
        this.checkMayWrite(req, res, username, path, function() {
          this.checkCondMet(req, res, username, path, 412, function() {
            this.doPut(req, res, release, username, path);
          }.bind(this), release);
        }.bind(this), release);
      }.bind(this), release);
      break;
    case 'DELETE':
      this.checkNoFolder(req, res, username, path, function() {
        this.checkMayWrite(req, res, username, path, function() {
          this.checkCondMet(req, res, username, path, 412, function() {
            this.checkFound(req, res, username, path, function() {
              this.doDelete(req, res, release, username, path);
            }.bind(this), release);
          }.bind(this), release);
        }.bind(this), release);
      }.bind(this), release);
      break;
    default:
      this.respond(res, req.headers.origin, 405);
      release();
    }
  }.bind(this));
};
