var Couchpotato = require('../lib/api');
var couchpotato = new Couchpotato("192.168.1.20", 5050);
couchpotato.getKey(function(success) {
    if (success) {
        couchpotato.query("app.available", function(reqsuccess, result) {
            console.log("RESULT", reqsuccess ? "OK" : "FAILED");
            console.log(result);
        });
    }
});