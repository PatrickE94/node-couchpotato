# node-couchpotato

Small node module used to query the
[CouchPotatoServer](https://couchpota.to) v2 API. For further
details on supported API calls, please check your CouchPotato
installation at `http://{url}:{port}/docs`

## Usage Examples


### Instantiate with login credentials

``` javascript
var CouchPotato= require('couchpotato');

var cp= new CouchPotato({url} // IP/url without http
  , {port}
  , {username}
  , {password});

```

### Instantiate without login credentials

``` javascript
var CouchPotato= require('couchpotato');

var cp= new CouchPotato({url} // IP/url without http
  , {port});
```

### Query API

To get the list of movies with status *done* execute like:

``` javascript
cp.getKey(function(res) {
  console.log('result', res);
  cp.query('movie.list', {
      status: 'done'
    , limit_offset: 10
  }, function(res, body) {
    console.log('result', res, 'body', body);
  });
});
```
