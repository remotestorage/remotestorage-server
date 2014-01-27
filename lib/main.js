
exports.createInstance = function(dataStore) {
  function getVersion(path) {
    if(dataStore.get('version:'+path)) {
      return dataStore.get('version:'+path);
    }
    if(path.substr(-1)=='/') {
      return 'empty-dir';
    }
  }
  function condMet(cond, path) {
    if(cond.ifNoneMatch=='*') {//if-none-match is either '*'...
      if(dataStore.get('content:'+path)) {
        return false;
      }
    } else if(cond.ifNoneMatch && getVersion(path)) {//or a comma-separated list of etags
      if(cond.ifNoneMatch.split(',').indexOf(String('"'+getVersion(path)+'"'))!=-1) {
        return false;
      }
    }
    if(cond.ifMatch) {//if-match is always exactly 1 etag
      if(String('"'+dataStore.get('version:'+path)+'"') != cond.ifMatch) {
        return false;
      }
    }
    return true;
  }
  function revisionsToMap(revisions) {
    var items = {};
    for(var i in revisions) {
      items[i] = { ETag: revisions[i] };
      items[i] = { ETag: revisions[i].toString() };
      if (i.substr(-1) !== '/') {
        items[i]['Content-Type'] = dataStore.get('contentType:'+path);
        items[i]['Content-Length'] = dataStore.get('content:'+path).length;
      };
    }
    return {
      '@context': 'http://remotestorage.io/spec/folder-description',
      items: items
    };
  }
  function getFolderDescription(path, folderFormat) {
    if (folderFormat === 'map') {
      return revisionsToMap(getContent(path));
    } else {
      return getContent(path);
    }
  }
  function exists(path) {
    return (typeof(dataStore.get('content:'+path)) !== 'undefined');
  }
  function getContent(path) {
    return dataStore.get('content:'+path);
  }
  function getContentType(path) {
    return dataStore.get('contentType:'+path);
  }
  function getVersion(path) {
    return dataStore.get('version:'+path);
  }
  function set(path, dataStr, contentType, timestamp) {
    dataStore.set('content:'+path, dataStr);
    dataStore.set('contentType:'+path, contentType);
    log('stored '+path, dataStore.get('content:'+path), dataStore.get('contentType:'+path));
    dataStore.set('version:'+path, timestamp);
    var pathParts=path.split('/');
    var fileItself=true;
    while(pathParts.length > 1) {
      var thisPart = pathParts.pop();
      if(fileItself) {
        fileItself=false;
      } else {
        thisPart += '/';
      }
      var obj = dataStore.get('content:'+pathParts.join('/')+'/');
      if(!obj) {
        obj = {};
      }
      if (timestamp) {
        //add
        obj[thisPart] = timestamp;
      } else {
        //remove
        delete obj[thisPart];
      }
      dataStore.set('content:'+pathParts.join('/')+'/', obj);
      dataStore.set('version:'+pathParts.join('/')+'/', timestamp);
    }
  }
  return {
    getVersion: getVersion,
    condMet: condMet,
    revisionsToMap: revisionsToMap,
    getFolderDescription: getFolderDescription,
    exists: exists,
    getContent: getContent,
    getContentType: getContentType,
    getVersion: getVersion,
    set: set
  };
};
