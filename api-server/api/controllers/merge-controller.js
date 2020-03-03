var db = require("../models/database.js");
var moment = require('moment');
var cron = require('node-cron');

// Takes data from previous hours in the "Raw" table, aggregates it,
// commits it to the "clean" table, then gets rid of the raw entries.
// Calls `callback` with OK or ERROR depending on the result.
function _mergeProduction(callback) {
  var now = moment().utc();
  var params = [now.format("YYYY"), now.format("M"), now.format("D"), now.format("H")];

  db.beginTransaction((err, transaction) => {
    transaction.run(`INSERT OR IGNORE INTO Production(year, month, day, hour, watt_hour)
                     SELECT year, month, day, hour, SUM(watts)/COUNT(*) AS watt_hour
                     FROM RawProduction
                     WHERE year < ? OR month < ? OR day < ? OR hour < ?
                     GROUP BY year, month, day, hour`, params);
    transaction.run(`DELETE FROM RawProduction
                     WHERE year < ? OR month < ? OR day < ? OR hour < ?`, params);

    transaction.commit((err) => {
      if (err) {
        console.error(err);
        return callback('ERROR');
      }
      callback('OK');
    });
  });
}

exports.scheduleMergeProduction = function() {
  cron.schedule('5 * * * *', () => {
    _mergeProduction((status) => {
      if (status == 'OK') {
        console.log('Succesfully merged production data for past hours.');
      }
    });
  });
}