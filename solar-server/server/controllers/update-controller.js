var db = require("../models/database.js");
var moment = require('moment');
var common = require("../common.js");

const kMaxWatts = 20000;  // Capped at 20 kW.

function _checkApiKey(api_key) {
  const statement = db.prepare('SELECT api_key from ApiKey WHERE api_key= ?');
  return statement.get(api_key) !== undefined;
}

function _doUpdate(watts) {
  const statement = db.prepare(`INSERT OR IGNORE INTO RawProduction(year, month, day, hour, minute, watts)
                                VALUES(?, ?, ?, ?, ?, ?)`);
  var now = moment();
  statement.run(now.format('YYYY'), now.format('M'), now.format('D'), now.format('H'), now.format('m'),
                watts);
}

exports.update = function(req, res) {
  try {
    if (!_checkApiKey(common.getStringParam('key', req))) {
      return common.unauthorized(res);
    }

    var watts = common.getIntParam('watts', req);
    if (watts < 0 || watts > kMaxWatts) {
      return common.malformedQuery('watts must be a valid number.', res);
    }

    _doUpdate(watts);
    res.json({"status": "OK"});
  } catch (err) {
    common.internalError(err, res);
  }
}