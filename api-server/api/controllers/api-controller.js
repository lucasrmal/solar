var db = require("../models/database.js")
require('datejs')

function _query(num_datapoints, aggregation, year, month, day, hour, res) {
  if (num_datapoints < 1 || num_datapoints > 366) {
    throw "Invalid number of data points.";
  }

  switch (aggregation) {
    case "year":
      month = 1;
      // FALLTHROUGH_INTENDED
    case "month":
      day = 1;
      // FALLTHROUGH_INTENDED
    case "day":
      hour = 0;
      // FALLTHROUGH_INTENDED
    case "hour":
      break;
    default:
    throw "Invalid aggregation.";
  }

  if (year < 2000 || year > 3000) {
    throw "Invalid year.";
  }
  if (month < 1 || month > 12) {
    throw "Invalid month.";
  }
  if (day < 1 || day > 31) {
    throw "Invalid day.";
  }
  if (hour < 0 || hour > 23) {
    throw "Invalid hour.";
  }

  var start_date = new Date(Date.UTC(year, month-1, day, hour));
  var end_date = new Date(start_date);
  var aggregate_list;

  switch (aggregation) {
    case "year":
      end_date.add(num_datapoints).year();
      aggregate_list = "year";
      break;
    case "month":
      end_date.add(num_datapoints).month();
      aggregate_list = "year, month";
      break;
    case "day":
      end_date.add(num_datapoints).day();
      aggregate_list = "year, month, day";
      break;
    case "hour":
      end_date.add(num_datapoints).hour();
      aggregate_list = "year, month, day, hour";
      break;
  }

  end_date.add(-1).hour();

  var full_query = `
    WITH RECURSIVE dates(date) AS ( 
      SELECT ? 
          UNION ALL 
      SELECT DATETIME(date, '+1 HOUR') FROM dates WHERE date<=?
    )
    SELECT sum(watt_hour) AS watt_hour
    FROM (
      SELECT strftime('%H', date) AS hour,
             strftime('%d', date) AS day,
             strftime('%m', date) AS month,
             strftime('%Y', date) AS year,
             coalesce(watt_hour, 0) AS watt_hour
      FROM dates
        LEFT OUTER JOIN Production p ON p.hour = strftime('%H', date) AND 
                                        p.day = strftime('%d', date) AND 
                                        p.month = strftime('%m', date) AND 
                                        p.year = strftime('%Y', date)
    )
    GROUP BY ${aggregate_list}
    ORDER BY ${aggregate_list};`;

  db.all(full_query, [start_date.toISOString(), end_date.toISOString()], (err, rows) => {
    if (err) {
      console.error(err.message);
      throw "INTERNAL_SERVER_ERROR";
      return;
    }

    var query_data = [];
    rows.forEach((row) => {
      query_data.push(row.watt_hour / 1000.0);
    });
    res.json({ "status": "OK", "data": query_data });
  });
}

function _parseIntParam(param, req) {
  var integer = -1;
  if (req.query.hasOwnProperty(param)) {
    integer = parseInt(req.query[param], 10);
    if (integer == NaN) { integer = 0; }
  }
  return integer;
}

exports.query = function(req, res) {
  var num_datapoints = _parseIntParam("num", req);
  var aggregation = req.query.hasOwnProperty("agg") ? req.query.agg : "";
  var year = _parseIntParam("year", req);
  var month = _parseIntParam("month", req);
  var day = _parseIntParam("day", req);
  var hour = _parseIntParam("hour", req);

  try {
    _query(num_datapoints, aggregation, year, month, day, hour, res);
  } catch (err) {
    if (err == "INTERNAL_SERVER_ERROR") {
      res.json({"status": "INTERNAL_SERVER_ERROR"});
    } else {
      res.json({"status": "MALFORMED_QUERY", "description" : err});
    }
  }
}
