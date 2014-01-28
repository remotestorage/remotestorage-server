exports.createInstance = function(dataStore) {
  function condMet(cond, path) {
    if (cond.ifNoneMatch === '*') {//if-none-match is either '*'...
      if (dataStore.get('content:' + path)) {
        return false;
      }
    } else if (cond.ifNoneMatch && getRevision(path)) {//or a comma-separated list of etags
      if (cond.ifNoneMatch.indexOf(getRevision(path)) !== -1) {
        return false;
      }
    }
    if (cond.ifMatch) {
      if (cond.ifMatch.indexOf(getRevision(path)) === -1) {
        return false;
      }
    }
    return true;
  }
  function revisionsToMap(revisions, path) {
    var i, items = {};
    for (i in revisions) {
      items[i] = { ETag: revisions[i] };
      items[i] = { ETag: revisions[i].toString() };
      if (i.substr(-1) !== '/') {
        items[i]['Content-Type'] = dataStore.get('contentType:' + path + i);
        items[i]['Content-Length'] = dataStore.get('content:' + path + i).length;
      }
    }
    return {
      '@context': 'http://remotestorage.io/spec/folder-description',
      items: items
    };
  }
  function getFolderDescription(path, folderFormat) {
    var i, itemNames = getContent(path), revisions = {};
    for(i in itemNames) {
      revisions[i] = getRevision(path+i);
    }
    if (folderFormat === 'map') {
      return revisionsToMap(revisions, path);
    } else {
      return revisions;
    }
  }
  function exists(path) {
    return (typeof(dataStore.get('content:' + path)) !== 'undefined');
  }
  function getContent(path) {
    return dataStore.get('content:' + path);
  }
  function getContentType(path) {
    return dataStore.get('contentType:' + path);
  }
  function getContentLength(path) {
    var buf = dataStore.get('content:' + path);
    if (buf) {
      return buf.length;
    }
  }
  function getRevision(path) {
    if (dataStore.get('revision:' + path)) {
      return dataStore.get('revision:' + path);
    }
    if (path.substr(-1) === '/') {
      return 'empty-dir';
    }
  }
  function set(path, dataBuf, contentType, revision) {
    dataStore.set('content:' + path, dataBuf);
    dataStore.set('contentType:' + path, contentType);
    dataStore.set('revision:' + path, revision);
    var pathParts = path.split('/');
    var fileItself = true;
    while(pathParts.length > 1) {
      var thisPart = pathParts.pop();
      if(fileItself) {
        fileItself = false;
      } else {
        thisPart += '/';
      }
      var obj = dataStore.get('content:' + pathParts.join('/') + '/');
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
      dataStore.set('content:' + pathParts.join('/') + '/', obj);
      dataStore.set('revision:' + pathParts.join('/') + '/', revision);
    }
  }
  return {
    getRevision: getRevision,
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
