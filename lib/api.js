var request = require("request");
var qs = require('querystring');

var COUCHPOTATO_NOUSERNAME = "md5(username)";
var COUCHPOTATO_NOPASSWORD = "md5(password)";

module.exports = Couchpotato;

function Couchpotato(hostname, port, username, password) {
    this.hostname = hostname;
    this.port = port;
    this.serverUrl = "http://" + hostname + ":" + this.port;

    this.username = username || COUCHPOTATO_NOUSERNAME;
    this.password = password || COUCHPOTATO_NOPASSWORD;
    this.key = null;
}

/**
 * Retrieves key from couchpotato using config settings.
 * @param  {Function} callback Called with true on success or false on failure.
 */
Couchpotato.prototype.getKey = function(callback) {
    if (this.key)
        return this.key;

    if (typeof callback != "function") {
        console.log("WARN: Function expected key, we don't have it yet! Returning undefined.");
        return this.key;
    }

    var context = this;
    request({
        "uri": this.serverUrl + "/getkey/?p=" + this.password + "&u=" + this.username,
        "json": true
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            if (body.success) {
                context.key = body.api_key;
                /* Trigger loading of status labels */
                context.loadStatusList(callback);
            }
        } else {
            console.log("ERROR: " + error);
            callback(false);
        }
    });
};

/**
 * Force's a reload of status.list labels for translateStatus function.
 */
Couchpotato.prototype.loadStatusList = function(callback) {
    var context = this;
    this.query("status.list", function(success, response) {
        if (!success) {
            callback(false);
            return;
        }

        context.status_strings = [];
        for (var i in response.list) {
            context.status_strings[response.list[i].id] = response.list[i].label;
        }

        callback(true);
    });
};

/**
 * Translate a status_id field to a human readable string.
 * @param {int}        status A status id.
 * @return {String}   Label in status.list query.
 */
Couchpotato.prototype.translateStatus = function(status) {
    return this.status_strings[status];
};

/**
 * Query the Couchpotato API!
 * @param  {String}      method         A method as specified in couchpotato's /docs.
 * @param  {Object}      parameters   Any parameters in json format.
 * @param  {Function}   _callback      Callback to be triggered on result or failure.
 */
Couchpotato.prototype.query = function(method, parameters, _callback) {
    var url = this.serverUrl + "/api/" + this.getKey() + "/" + method + "/";
    var callback = _callback;

    if (typeof parameters == "function") {
        callback = parameters;
    } else {
        url += "?" + qs.stringify(parameters);
    }

    request({
        "uri": url,
        "json": true
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(true, body);
        } else if (response.statusCode == 404) {
            callback(false);
            console.log("ERROR: Invalid API key! Have you forgotten to run getKey first?");
        } else {
            console.log("ERROR ", response.statusCode, error);
            callback(false);
        }
    });
};