var url = require('url'),
  scopes = require('./scopes'),
  main = require('./main');

exports.createServer = function(specVersion, tokenStore, dataStore) {
  var folderFormat = 'map', rootName = '*', folderContentType = 'application/json',
    scopesInstance, mainInstance;

  if (specVersion === 'draft-dejong-remotestorage-00' || specVersion === 'draft-dejong-remotestorage-01') {
    folderFormat = 'etags-only';
    rootName = 'root';
  } else if (specVersion === 'draft-dejong-remotestorage-02') {
    //use defaults
  } else if (specVersion === 'draft-dejong-remotestorage-03') {
    folderContentType = 'application/ld+json';
  } else {
    throw new Error('unknown spec version '+JSON.stringify(specVersion));
  }
  scopesInstance = scopes.createInstance(tokenStore);
  mainInstance = main.createInstance(folderFormat, dataStore);

  function writeHead(res, status, origin, timestamp, contentType, contentLength) {
    var headers = {
      'Access-Control-Allow-Origin': (origin?origin:'*'),
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, If-Match, If-None-Match',
      'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
      'Expires': '0'
    };
    if(typeof(timestamp) != 'undefined') {
      headers['etag']= '"'+timestamp.toString()+'"';
    }
    if(contentType) {
      headers['content-type']= contentType;
    }
    if(contentLength) {
      headers['content-length']= contentLength;
    }
    res.writeHead(status, headers);
  }

  function writeRaw(res, contentType, content, origin, timestamp) {
    writeHead(res, 200, origin, timestamp, contentType, content.length);
    res.write(content);
    res.end();
  }

  function respond(res, origin, status, timestamp) {
    var errorMsg = {
      304: '304 Not Modified',
      401: '401 Unauthorized',
      404: '404 Not Found'
    };
    if(!errorMsg[status]) {
      errorMsg[status] = status + ' Computer says no';
    }
    writeHead(res, status, origin, timestamp, 'text/plain', errorMsg[status].length);
    res.end(errorMsg[status]);
  }

  function checkNoFolders(req, res, path) {
    if(path.substr(-1)=='/') {
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
      respond(res, req.headers.origin, 412, mainInstance.getVersion(path));
    }
  }
  function checkFound(req, res, path) {
    if (typeof(dataStore.get('content:'+path)) == 'undefined') {
      return true;
    } else {
      respond(res, req.headers.origin, 404);
    }
  }
  function doHead(req, res, path) {
    if(path.substr(-1)=='/') {
      writeRaw(res, folderContentType, undefined, req.headers.origin, mainInstance.getVersion(path));
    } else {
      writeRaw(res, mainInstance.getContentType(path), undefined, req.headers.origin, mainInstance.getVersion(path));
    }
  }
  function doGet(req, res, path) {
    if(path.substr(-1)=='/') {
      writeRaw(res, folderContentType, mainInstance.getFolderDescription(path), req.headers.origin, mainInstance.getVersion(path));
    } else {
      writeRaw(res, mainInstance.getContentType(path), mainInstance.getContent(path), req.headers.origin, mainInstance.getVersion(path));
    }
  }
  function doPut(req, res, path) {
    var dataStr = '';
    req.on('data', function(chunk) {
      dataStr+=chunk;
    });
    req.on('end', function() {
      var timestamp = new Date().getTime();
      mainInstance.set(path, dataStr, req.headers['content-type'], timestamp);
      writeRaw(res, undefined, undefined, req.headers.origin, timestamp);
    });
  }
  function doDelete(req, res, path) {
    mainInstance.set(path);
    writeRaw(res, undefined, undefined, req.headers.origin);
  }
  function storage(req, res) {
    var urlObj =  url.parse(req.url, true);
    var path=urlObj.pathname.substring('/storage/'.length);
    var capt = {
      method: req.method,
      path: path
    };
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
      if (checkNoFolders(req, res, path) && checkMayWrite(req, res, path) && checkCondMet(req, res, path)) {
        doPut(req, res, path);
      }
      break;
    case 'DELETE':
      if (checkNoFolders(req, res, path) && checkMayWrite(req, res, path) && checkCondMet(req, res, path) && checkFound(req, res, path)) {
        doDelete(req, res, path);
      }
      break;
    default:
      log('ILLEGAL '+req.method);
      respond(res, req.headers.origin, 405);
    }
  }
  return {
    storage: storage,
  };
};