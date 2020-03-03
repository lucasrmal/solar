var db = require("../models/database.js");
var moment = require('moment');
var common = require("../common.js");

const kMaxWatts = 20000;  // Capped at 20 kW.

function _checkApiKey(api_key, ok_callback, unauthorized_callback) {
  db.get("SELECT api_key from ApiKey WHERE api_key=?", [api_key], (err, row) => {
    if (err) {
      throw err.message;
    }
    if (row) {
      ok_callback();
    } else {
      unauthorized_callback();
    }
  });
}

function _doUpdate(watts, res) {
  var sql = "INSERT OR IGNORE INTO RawProduction(year, month, day, hour, minute, watts) VALUES(?, ?, ?, ?, ?, ?)";
  var now = moment().utc();
  var values = [now.format("YYYY"), now.format("M"), now.format("D"), now.format("H"), now.format("m"), watts];

  db.run(sql, values, (err) => {
    if (err) {
      return common.internalError(err.message, res);
    }
    res.json({"status": "OK"});  
  });
}

exports.update = function(req, res) {
  try {
    _checkApiKey(common.getStringParam("key", req),
                 () => {  // ok_callback
                   var watts = common.getIntParam("watts", req);

                   if (watts < 0 || watts > kMaxWatts) {
                     return common.malformedQuery("watts must be a valid number.", res);
                   }

                   _doUpdate(watts, res);
                 },
                 () => {  // unauthorized_callback
                   res.status(403).end();
                 });
  } catch (err) {
    common.internalError(err, res);
  }
}