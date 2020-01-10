var db = require("../models/database.js")

function _query(num_datapoints, aggregation, year, month, day, hour) {
  if (num_datapoints < 1 || num_datapoints > 1000) {
    throw "Invalid number of data points.";
  }

  var permitted = [false, false, false]; // M, D, H; year is always permitted.

  if (aggregation = 'hour') {
    permitted = [true, true, true, true];
  } else if (aggregation = 'day') {
    permitted = [true, true, true, false];
  } else if (aggregation = 'month') {
    permitted = [true, true, false, false];
  } else if (aggregation = 'year') {
    permitted = [true, false, false, false];
  } else {
    throw "Invalid aggregation.";
  }

  if (!permitted[0] && month != -1) {
    throw "Month can't be specified with this aggregation."
  }
  if (!permitted[1] && day != -1) {
    throw "Day can't be specified with this aggregation."
  }
  if (!permitted[2] && hour != -1) {
    throw "Hour can't be specified with this aggregation."
  }

  if (month != -1 && (month < 1 || month > 12)) {
    throw "Invalid month.";
  }
  if (day != -1 && (day < 1 || day > 31)) {
    throw "Invalid day.";
  }
  if (hour != -1 && (hour < 0 || hour > 23)) {
    throw "Invalid hour.";
  }

  var now = new Date("December 30, 2017 21:25:10");
  if (year == -1) {
    year = now.getUTCFullYear();
  }
  if (month == -1) {
    month = now.getUTCMonth() + 1;
  }
  if (day == -1) {
    day = now.getUTCDate();
  }
  if (hour == -1) {
    hour = now.getUTCHours();
  }

  var full_query = "SELECT SUM(watt_hour), ";

  switch (aggregation) {
    
  }





}


exports.query = function(req, res) {
  try {
    query_data = _query();
    res.json({ "status": "OK", "data": query_data });
  } catch (err) {
    res.json({"status": "MALFORMED_QUERY", "description" : err});
  }


  var query_data = [];
  db.all(`SELECT watt_hour as watt_hour
           FROM Production`, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.json({"status": "INTERNAL_SERVER_ERROR"});
      return;
    }

    rows.forEach((row) => {
      query_data.push(row.watt_hour / 1000.0);
    });
    res.json({ "status": "OK", "data": query_data });
  });
}
