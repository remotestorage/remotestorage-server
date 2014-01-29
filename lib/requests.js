var url = require('url');
exports.createInstance = function(pathPrefix, scopesInstance, mainInstance) {
  function writeHead(res, status, origin, revision, contentType, contentLength) {
    var headers = {
      'Access-Control-Allow-Origin': (origin ? origin : '*'),
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, If-Match, If-None-Match',
      'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
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
  }

  function writeRaw(res, contentType, content, origin, revision, explicitLength) {
    writeHead(res, 200, origin, revision, contentType, (Buffer.isBuffer(content) ? content.length : explicitLength));
    if (Buffer.isBuffer(content)) {
      res.end(content);
    } else {
      res.end();
    }
  }

  function respond(res, origin, status, etag) {
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
    writeHead(res, status, origin, etag, 'text/plain', errorMsg[status].length+4);
    res.end(status.toString() + ' ' + errorMsg[status]);
  }

  function checkNoFolder(req, res, path) {
    if (path.substr(-1) === '/') {
      respond(res, req.headers.origin, 400);
    } else {
      return true;
    }
  }
  function checkMayRead(req, res, path) {
    if (scopesInstance.mayRead(req.headers.authorization, path)) {
      return true;
    } else {
      respond(res, req.headers.origin, 401);
    }
  }
  function checkMayWrite(req, res, path) {
    if (scopesInstance.mayWrite(req.headers.authorization, path)) {
      return true;
    } else {
      respond(res, req.headers.origin, 401);
    }
  }
  function stripQuotes(str) {
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
  }
  function checkCondMet(req, res, path, statusCode) {
    var cond = {
      ifNoneMatch: stripQuotes(req.headers['if-none-match']),
      ifMatch: stripQuotes(req.headers['if-match'])
    };
    if (mainInstance.condMet(cond, path)) {
      return true;
    } else {
      respond(res, req.headers.origin, statusCode, mainInstance.getRevision(path));
    }
  }
  function checkFound(req, res, path) {
    if (mainInstance.exists(path)) {
      return true;
    } else {
      respond(res, req.headers.origin, 404);
    }
  }
  function doHead(req, res, path, folderContentType) {
    if (path.substr(-1) === '/') {
      writeRaw(res, folderContentType, undefined, req.headers.origin, mainInstance.getRevision(path));
    } else {
      writeRaw(res, mainInstance.getContentType(path), undefined, req.headers.origin, mainInstance.getRevision(path), mainInstance.getContent(path).length);
    }
  }
  function doGet(req, res, path, folderFormat, folderContentType) {
    if (path.substr(-1) === '/') {
      writeRaw(res, folderContentType,
          new Buffer(JSON.stringify(mainInstance.getFolderDescription(path, folderFormat)), 'utf-8'),
          req.headers.origin, mainInstance.getRevision(path));
    } else {
      writeRaw(res, mainInstance.getContentType(path), mainInstance.getContent(path), req.headers.origin, mainInstance.getRevision(path));
    }
  }
  function doPut(req, res, path) {
    var dataStr = '';
    req.on('data', function(chunk) {
      dataStr += chunk;
    });
    req.on('end', function() {
      var revision = new Date().getTime().toString();
      mainInstance.set(path, dataStr, req.headers['content-type'], revision);
      writeRaw(res, undefined, undefined, req.headers.origin, revision);
    });
  }
  function doDelete(req, res, path) {
    mainInstance.set(path);
    writeRaw(res, undefined, undefined, req.headers.origin);
  }
  function handleRequest(req, res, folderFormat, folderContentType) {
    var urlObj = url.parse(req.url, true);
    var path = urlObj.pathname.substring(pathPrefix.length);
    switch (req.method) {
    case 'OPTIONS':
      writeRaw(res, undefined, undefined, req.headers.origin);
      break;
    case 'HEAD':
      if (checkMayRead(req, res, path) && checkFound(req, res, path) && checkCondMet(req, res, path, 304)) {
        doHead(req, res, path, folderContentType);
      }
      break;
    case 'GET':
      if (checkMayRead(req, res, path) && checkFound(req, res, path) && checkCondMet(req, res, path, 304)) {
        doGet(req, res, path, folderFormat, folderContentType);
      }
      break;
    case 'PUT':
      if (checkNoFolder(req, res, path) && checkMayWrite(req, res, path) && checkCondMet(req, res, path, 412)) {
        doPut(req, res, path);
      }
      break;
    case 'DELETE':
      if (checkNoFolder(req, res, path) && checkMayWrite(req, res, path) && checkCondMet(req, res, path, 412) && checkFound(req, res, path)) {
        doDelete(req, res, path);
      }
      break;
    default:
      respond(res, req.headers.origin, 405);
    }
  }
  return {
    writeHead: writeHead,
    writeRaw: writeRaw,
    respond: respond,
    checkNoFolder: checkNoFolder,
    checkMayRead: checkMayRead,
    checkMayWrite: checkMayWrite,
    stripQuotes: stripQuotes,
    checkCondMet: checkCondMet,
    checkFound: checkFound,
    doHead: doHead,
    doGet: doGet,
    doPut: doPut,
    doDelete: doDelete,
    handleRequest: handleRequest
  };
};
