var db = require("../models/database.js");
var moment = require('moment');
var cron = require('node-cron');

// Takes data from previous hours in the "Raw" table, aggregates it,
// commits it to the "clean" table, then gets rid of the raw entries.
function _mergeProduction() {
  var now = moment();
  var params = {
    "year": now.format('YYYY'), 
    "month": now.format('M'),
    "day": now.format('D'),
    "hour": now.format('H')
  };

  const insert_stmt = db.prepare(
    `INSERT OR IGNORE INTO Production(year, month, day, hour, watt_hour)
     SELECT year, month, day, hour, SUM(watts)/COUNT(*) AS watt_hour
     FROM RawProduction
     WHERE year < @year OR month < @month OR day < @day OR hour < @hour
     GROUP BY year, month, day, hour`);
  const delete_stmt = db.prepare(
    `DELETE FROM RawProduction
     WHERE year < @year OR month < @month OR day < @day OR hour < @hour`);

  var transaction = db.transaction(() => {
    console.log(insert_stmt.run(params).changes);
    console.log(delete_stmt.run(params).changes);
  });
  transaction();
}

exports.scheduleMergeProduction = function() {
  // cron.schedule('7 * * * *', () => {
    try {      
      _mergeProduction();
      console.log('Succesfully merged production data for past hours.');
    } catch (err) {
      console.error(err);
    }
  // });
}