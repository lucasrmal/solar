var db = require("../models/database.js")

exports.list_all_tasks = function(req, res) {
  var query_data = [];
  db.each(`SELECT watt_hour as watt_hour
           FROM Production`, (err, row) => {
    if (err) {
      console.error(err.message);
    }
    query_data.push(row.watt_hour / 1000.0)
  });
  res.json({ "status": "OK", "data": query_data });
};