var url = require('url'),
  sha1 = require('sha1');

module.exports = function(pathPrefix, scopesInstance, mainInstance) {
  this.pathPrefix = pathPrefix;
  this.scopesInstance = scopesInstance;
  this.mainInstance = mainInstance;
};
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
  if (typeof(revision) === 'string') {
    headers.etag = '"' + revision + '"';
  }
  if (typeof(contentType) === 'string') {
    headers['content-type'] = contentType;
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
    this.writeHead(res, status, origin, etag, 'text/plain', errorMsg[status].length+4);
    res.end(status.toString() + ' ' + errorMsg[status]);
  } else {
    //no Content-Length header in this case:
    this.writeHead(res, status, origin, etag, 'text/plain');
    res.end();
  }
};

module.exports.prototype.checkNoFolder = function(req, res, username, path, cb) {
  if (path.substr(-1) === '/') {
    this.respond(res, req.headers.origin, 400);
  } else {
    cb(null, true);
  }
};
module.exports.prototype.checkMayRead = function(req, res, username, path, cb) {
  this.scopesInstance.mayRead(req.headers.authorization, username, path, function(err, answer) {
    if (err) {
      this.error(res, err, req.headers.origin);
    } else if (answer) {
      cb(err, answer);
    } else {
      this.respond(res, req.headers.origin, 401);
    }
  }.bind(this));
};
module.exports.prototype.checkMayWrite = function(req, res, username, path, cb) {
  this.scopesInstance.mayWrite(req.headers.authorization, username, path, function(err, answer) {
    if (err) {
      this.error(res, err, req.headers.origin);
    } else if (answer) {
      cb(err, answer);
    } else {
      this.respond(res, req.headers.origin, 401);
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
      ret.push(parts[i].substring(1, parts[i].length-1));
    } else {
      ret.push(parts[i]);
    }
  }
  return ret;
};
module.exports.prototype.checkCondMet = function(req, res, username, path, statusCode, cb) {
  var cond = {
    ifNoneMatch: this.stripQuotes(req.headers['if-none-match']),
    ifMatch: this.stripQuotes(req.headers['if-match'])
  };
  this.mainInstance.condMet(cond, username, path, function(err, answer) {
    if (err) {
      this.error(res, err, req.headers.origin);
    } else if (answer) {
      cb(err, answer);
    } else {
      this.mainInstance.getRevision(username, path, function(err, revision) {
        if (err) {
          this.error(res, err, req.headers.origin);
        } else {
          this.respond(res, req.headers.origin, statusCode, revision);
        }
      }.bind(this));
    }
  }.bind(this));
};
module.exports.prototype.checkFound = function(req, res, username, path, cb) {
  this.mainInstance.exists(username, path, function(err, answer) {
    if (err) {
      this.error(res, err, req.headers.origin);
    } else if (answer) {
      cb(err, answer);
    } else {
      this.respond(res, req.headers.origin, 404);
    }
  }.bind(this));
};
module.exports.prototype.doHead = function(req, res, username, path, folderContentType) {
  if (path.substr(-1) === '/') {
    this.mainInstance.getRevision(username, path, function(err, revision) {
      if (err) {
        this.error(res, err, req.headers.origin);
      } else {
        this.writeRaw(res, folderContentType, undefined, req.headers.origin, revision);
      }
    }.bind(this));
  } else {
    this.mainInstance.getContentType(username, path, function(err, contentType) {
      if (err) {
        this.error(res, err, req.headers.origin);
      } else {
        this.mainInstance.getRevision(username, path, function(err, revision) {
          if (err) {
            this.error(res, err, req.headers.origin);
          } else {
            this.mainInstance.getContent(username, path, function(err, content) {
              if (err) {
                this.error(res, err, req.headers.origin);
              } else {
                this.writeRaw(res, contentType, undefined, req.headers.origin, revision, content.length);
              }
            }.bind(this));
          }
        }.bind(this));
      }
    }.bind(this));
  }
};
module.exports.prototype.doGet = function(req, res, username, path, folderFormat, folderContentType) {
  if (path.substr(-1) === '/') {
    this.mainInstance.getRevision(username, path, function(err, revision) {
      if (err) {
        this.error(res, err, req.headers.origin);
      } else {
        this.mainInstance.getFolderDescription(username, path, folderFormat, function(err, desc) {
          if (err) {
            this.error(res, err, req.headers.origin);
          } else {
            var content = new Buffer(JSON.stringify(desc), 'utf-8');
            this.writeRaw(res, folderContentType, content, req.headers.origin, revision);
          }
        }.bind(this));
      }
    }.bind(this));
  } else {
    var contentType, revision;
    this.mainInstance.getContentType(username, path, function(err, contentType) {
      if (err) {
        this.error(res, err, req.headers.origin);
      } else {
        this.mainInstance.getRevision(username, path, function(err, revision) {
          if (err) {
            this.error(res, err, req.headers.origin);
          } else {
            this.mainInstance.getContent(username, path, function(err, content) {
              if (err) {
                this.error(res, err, req.headers.origin);
              } else {
                this.writeRaw(res, contentType, content, req.headers.origin, revision);
              }
            }.bind(this));
          }
        }.bind(this));
      }
    }.bind(this));
  }
};
module.exports.prototype.doPut = function(req, res, username, path) {
  var body = new Buffer(0);
  req.on('data', function(chunk) {
    var buffer = new Buffer(body.length + chunk.length);
    body.copy(buffer);
    chunk.copy(buffer, body.length);
    body = buffer;
  });

  req.on('end', function() {
    var revision = sha1(body);
    this.mainInstance.set(username, path, body, req.headers['content-type'], revision, function(err) {
      if (err) {
        this.error(res, err, req.headers.origin);
      } else {
        this.writeRaw(res, undefined, undefined, req.headers.origin, revision);
      }
    }.bind(this));
  }.bind(this));
};
module.exports.prototype.doDelete = function(req, res, username, path) {
  this.mainInstance.set(username, path, undefined, undefined, undefined, function(err) {
    if (err) {
      this.error(res, err, req.headers.origin);
    } else {
      this.writeRaw(res, undefined, undefined, req.headers.origin);
    }
  }.bind(this));
};
module.exports.prototype.handleRequest = function(req, res, folderFormat, folderContentType) {
  var urlObj = url.parse(req.url, true);
  var path = urlObj.pathname.substring(this.pathPrefix.length);
  var pos = path.indexOf('/');
  var username = path.substring(0, pos);
  path = path.substring(pos);

  switch (req.method) {
  case 'OPTIONS':
    this.writeRaw(res, undefined, undefined, req.headers.origin);
    break;
  case 'HEAD':
    this.checkMayRead(req, res, username, path, function() {
      this.checkFound(req, res, username, path, function() {
        this.checkCondMet(req, res, username, path, 304, function() {
          this.doHead(req, res, username, path, folderContentType);
        }.bind(this));
      }.bind(this));
    }.bind(this));
    break;
  case 'GET':
    this.checkMayRead(req, res, username, path, function() {
      this.checkFound(req, res, username, path, function() {
        this.checkCondMet(req, res, username, path, 304, function() {
          this.doGet(req, res, username, path, folderFormat, folderContentType);
        }.bind(this));
      }.bind(this));
    }.bind(this));
    break;
  case 'PUT':
    this.checkNoFolder(req, res, username, path, function() {
      this.checkMayWrite(req, res, username, path, function() {
        this.checkCondMet(req, res, username, path, 412, function() {
          this.doPut(req, res, username, path);
        }.bind(this));
      }.bind(this));
    }.bind(this));
    break;
  case 'DELETE':
    this.checkNoFolder(req, res, username, path, function() {
      this.checkMayWrite(req, res, username, path, function() {
        this.checkCondMet(req, res, username, path, 412, function() {
          this.checkFound(req, res, username, path, function() {
            this.doDelete(req, res, username, path);
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }.bind(this));
    break;
  default:
    this.respond(res, req.headers.origin, 405);
  }
};
