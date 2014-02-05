var url = require('url');
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

module.exports.prototype.respond = function(res, origin, status, etag) {
  var errorMsg = {
    304: 'Not Modified',
    401: 'Unauthorized',
    404: 'Not Found',
    405: 'Method not allowed',
    412: 'Precondition failed'
  };
  if (!errorMsg[status]) {
    errorMsg[status] = 'Computer says no';
  }
  this.writeHead(res, status, origin, etag, 'text/plain', errorMsg[status].length+4);
  res.end(status.toString() + ' ' + errorMsg[status]);
};

module.exports.prototype.checkNoFolder = function(req, res, path, cb) {
  if (path.substr(-1) === '/') {
    this.respond(res, req.headers.origin, 400);
  } else {
    cb(null, true);
  }
};
module.exports.prototype.checkMayRead = function(req, res, path, cb) {
  this.scopesInstance.mayRead(req.headers.authorization, path, function(err, answer) {
    if (answer) {
      cb(err, answer);
    } else {
      this.respond(res, req.headers.origin, 401);
    }
  }.bind(this));
};
module.exports.prototype.checkMayWrite = function(req, res, path, cb) {
  this.scopesInstance.mayWrite(req.headers.authorization, path, function(err, answer) {
    if (answer) {
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
module.exports.prototype.checkCondMet = function(req, res, path, statusCode, cb) {
  var cond = {
    ifNoneMatch: this.stripQuotes(req.headers['if-none-match']),
    ifMatch: this.stripQuotes(req.headers['if-match'])
  };
  this.mainInstance.condMet(cond, path, function(err, answer) {
    if (answer) {
      cb(err, answer);
    } else {
      this.mainInstance.getRevision(path, function(err, revision) {
        this.respond(res, req.headers.origin, statusCode, revision);
      }.bind(this));
    }
  }.bind(this));
};
module.exports.prototype.checkFound = function(req, res, path, cb) {
  this.mainInstance.exists(path, function(err, answer) {
    if (answer) {
      cb(err, answer);
    } else {
      this.respond(res, req.headers.origin, 404);
    }
  }.bind(this));
};
module.exports.prototype.doHead = function(req, res, path, folderContentType) {
  if (path.substr(-1) === '/') {
    this.mainInstance.getRevision(path, function(err, revision) {
      this.writeRaw(res, folderContentType, undefined, req.headers.origin, revision);
    }.bind(this));
  } else {
    var contentType, revision;
    this.mainInstance.getContentType(path, function(err, setContentType) {
        contentType = setContentType;
        this.mainInstance.getRevision(path, function(err, setRevision) {
        revision = setRevision;
        this.mainInstance.getContent(path, function(err, content) {
          this.writeRaw(res, contentType, undefined, req.headers.origin, revision, content.length);
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }
};
module.exports.prototype.doGet = function(req, res, path, folderFormat, folderContentType) {
  if (path.substr(-1) === '/') {
    var revision;
    this.mainInstance.getRevision(path, function(err, setRevision) {
      revision = setRevision;
      this.mainInstance.getFolderDescription(path, folderFormat, function(err, desc) {
        var content = new Buffer(JSON.stringify(desc), 'utf-8');
        this.writeRaw(res, folderContentType, content, req.headers.origin, revision);
      }.bind(this));
    }.bind(this));
  } else {
    var contentType, revision;
    this.mainInstance.getContentType(path, function(err, setContentType) {
      contentType = setContentType;
      this.mainInstance.getRevision(path, function(err, setRevision) {
        revision = setRevision;
        this.mainInstance.getContent(path, function(err, content) {
          this.writeRaw(res, contentType, content, req.headers.origin, revision);
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }
};
module.exports.prototype.doPut = function(req, res, path) {
  var dataStr = '';
  req.on('data', function(chunk) {
    dataStr += chunk;
  });
  req.on('end', function() {
    var revision = new Date().getTime().toString();
    this.mainInstance.set(path, dataStr, req.headers['content-type'], revision, function(err) {
      this.writeRaw(res, undefined, undefined, req.headers.origin, revision);
    }.bind(this));
  }.bind(this));
};
module.exports.prototype.doDelete = function(req, res, path) {
  this.mainInstance.set(path, undefined, undefined, undefined, function(err) {
    this.writeRaw(res, undefined, undefined, req.headers.origin);
  }.bind(this));
};
module.exports.prototype.handleRequest = function(req, res, folderFormat, folderContentType) {
  var urlObj = url.parse(req.url, true);
  var path = urlObj.pathname.substring(this.pathPrefix.length);
  switch (req.method) {
  case 'OPTIONS':
    this.writeRaw(res, undefined, undefined, req.headers.origin);
    break;
  case 'HEAD':
    this.checkMayRead(req, res, path, function() {
      this.checkFound(req, res, path, function() {
        this.checkCondMet(req, res, path, 304, function() {
          this.doHead(req, res, path, folderContentType);
        }.bind(this));
      }.bind(this));
    }.bind(this));
    break;
  case 'GET':
    this.checkMayRead(req, res, path, function() {
      this.checkFound(req, res, path, function() {
        this.checkCondMet(req, res, path, 304, function() {
          this.doGet(req, res, path, folderFormat, folderContentType);
        }.bind(this));
      }.bind(this));
    }.bind(this));
    break;
  case 'PUT':
    this.checkNoFolder(req, res, path, function() {
      this.checkMayWrite(req, res, path, function() {
        this.checkCondMet(req, res, path, 412, function() {
          this.doPut(req, res, path);
        }.bind(this));
      }.bind(this));
    }.bind(this));
    break;
  case 'DELETE':
    this.checkNoFolder(req, res, path, function() {
      this.checkMayWrite(req, res, path, function() {
        this.checkCondMet(req, res, path, 412, function() {
          this.checkFound(req, res, path, function() {
            this.doDelete(req, res, path);
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }.bind(this));
    break;
  default:
    this.respond(res, req.headers.origin, 405);
  }
};
