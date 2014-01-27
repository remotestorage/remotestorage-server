exports.createInstance = function(scopesInstance, mainInstance) {
  function writeHead(res, status, origin, revision, contentType, contentLength) {
    var headers = {
      'Access-Control-Allow-Origin': (origin ? origin : '*'),
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, If-Match, If-None-Match',
      'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
      'Expires': '0'
    };
    if (typeof(revision) === 'string') {
      headers['etag'] = '"' + revision + '"';
    }
    if (typeof(contentType) === 'string') {
      headers['content-type'] = contentType;
    }
    if (typeof(contentLength) === 'number') {
      headers['content-length'] = contentLength.toString();
    }
    res.writeHead(status, headers);
  }

  function writeRaw(res, contentType, content, origin, revision) {
    writeHead(res, 200, origin, revision, contentType, content.length);
    res.write(content);
    res.end();
  }

  function respond(res, origin, status, etag) {
    var errorMsg = {
      304: '304 Not Modified',
      401: '401 Unauthorized',
      404: '404 Not Found'
    };
    if (!errorMsg[status]) {
      errorMsg[status] = status + ' Computer says no';
    }
    writeHead(res, status, origin, etag, 'text/plain', errorMsg[status].length);
    res.end(errorMsg[status]);
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
  function checkCondMet(req, res, path) {
    var cond = {
      ifNoneMatch: req.headers['if-none-match'],
      ifMatch: req.headers['if-match']
    };
    if (mainInstance.condMet(cond, path)) {
      return true;
    } else {
      respond(res, req.headers.origin, 412, mainInstance.getRevision(path));
    }
  }
  function checkFound(req, res, path) {
    if (dataStore.get('content:'+path) === undefined) {
      return true;
    } else {
      respond(res, req.headers.origin, 404);
    }
  }
  function doHead(req, res, path) {
    if (path.substr(-1) === '/') {
      writeRaw(res, folderContentType, undefined, req.headers.origin, mainInstance.getRevision(path));
    } else {
      writeRaw(res, mainInstance.getContentType(path), undefined, req.headers.origin, mainInstance.getRevision(path));
    }
  }
  function doGet(req, res, path, folderFormat, folderContentType) {
    if (path.substr(-1) === '/') {
      writeRaw(res, folderContentType, JSON.stringify(mainInstance.getFolderDescription(path, folderFormat)), req.headers.origin, mainInstance.getRevision(path));
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
  function handleRequest(req, res) {
    var urlObj = url.parse(req.url, true);
    var path = urlObj.pathname.substring('/storage/'.length);
    log(req.method);
    switch (req.method) {
    case 'OPTIONS':
      writeRaw(res, undefined, undefined, req.headers.origin);
      break;
    case 'HEAD':
      if (checkMayRead(req, res, path) && checkFound(req, res, path) && checkCondMet(req, res, path)) {
        doHead(req, res, path);
      }
      break;
    case 'GET':
      if (checkMayRead(req, res, path) && checkFound(req, res, path) && checkCondMet(req, res, path)) {
        doGet(req, res, path);
      }
      break;
    case 'PUT':
      if (checkNoFolder(req, res, path) && checkMayWrite(req, res, path) && checkCondMet(req, res, path)) {
        doPut(req, res, path);
      }
      break;
    case 'DELETE':
      if (checkNoFolder(req, res, path) && checkMayWrite(req, res, path) && checkCondMet(req, res, path) && checkFound(req, res, path)) {
        doDelete(req, res, path);
      }
      break;
    default:
      log('ILLEGAL ' + req.method);
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
    checkCondMet: checkCondMet,
    checkFound: checkFound,
    doHead: doHead,
    doGet: doGet,
    doPut: doPut,
    doDelete: doDelete,
    handleRequest: handleRequest
  };
};
