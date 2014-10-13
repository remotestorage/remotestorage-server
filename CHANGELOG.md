# 0.5.11 (Oct 2014)
* add backdoor for initializing data like web-authoring apps

# 0.5.10 (Sep 2014)
* make draft-dejong-remotestorage-04 (rc3) the default behavior

# 0.5.9 (Jun 2014)
* fix two mistakes in the empty-folder implementation

# 0.5.8 (Jun 2014)
* add support for draft-dejong-remotestorage-03
* fix tests

# 0.5.7 (May 2014)
* fix cases where requests stayed pending without being serviced

# 0.5.6 (Apr 2014)
* fix folder revisions

# 0.5.5 (Feb 2014)
* fix bug with attaching > 1 listener to res.on('end')

# 0.5.4 (Feb 2014)
* fix bug in makeScopePaths function

# 0.5.3 (Feb 2014)
* fix contentTypes were still stored as strings instead of Buffers

# 0.5.2 (Feb 2014)
* fix revisions were still stored as strings instead of Buffers

# 0.5.1 (Feb 2014)
* store only Buffers in the dataStore

# 0.5.0 (Feb 2014)
* safely handle execution of concurrent http requests

# 0.4.1 (Feb 2014)
* fix bug in README code example

# 0.4.0 (Feb 2014)
* partition tokenStore and dataStore per user

# 0.3.2 (Feb 2014)
* more efficient document existence ,based on revision instead content
* fix webfinger for legacy spec versions

# 0.3.1 (Feb 2014)
* avoid duplicate storage of revisions in folder listings

# 0.3.0 (Feb 2014)
* receive PUT body as buffer
* use sha1 for generating ETags

# 0.2.4 (Feb 2014)
* error checking

# 0.2.3 (Feb 2014)
* no body and no Content-Length header in 304 responses

# 0.2.2 (Feb 2014)
* add WWW-Authenticate header

# 0.2.1 (Feb 2014)
* adapt headers to reStore specs

# 0.2.0 (Feb 2014)
* switch to constructors`

# 0.1.8 (Feb 2014)
* switch to node-style callbacks: `doSomething(a, function(err, data) { ... });`

# 0.1.7 (Jan 2014)
* add support for -00 and -01 webfinger formats

# 0.1.0-pre .. 0.1.6-pre
very early versions
