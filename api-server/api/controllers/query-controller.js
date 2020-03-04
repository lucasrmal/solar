var db = require("../models/database.js");
var moment = require('moment');
var common = require("../common.js");

function _query(num_datapoints, aggregation, year, month, day, hour, res) {
  if (num_datapoints < 1 || num_datapoints > 366) {
    return common.malformedQuery("Invalid number of data points.", res);
  }

  if (year < 2000 || year > 3000) {
    return common.malformedQuery("Invalid year.", res);
  }
  if (month < 1 || month > 12) {
    return common.malformedQuery("Invalid month.", res);
  }
  if (day < 1 || day > 31) {
    return common.malformedQuery("Invalid day.", res);
  }
  if (hour < 0 || hour > 23) {
    return common.malformedQuery("Invalid hour.", res);
  }

  var start_date = moment([year, month-1, day, hour]);
  var end_date = start_date.clone();
  var aggregate_list;

  switch (aggregation) {
    case "year":
      end_date.add(num_datapoints, 'year');
      aggregate_list = "year";
      break;
    case "month":
      end_date.add(num_datapoints, 'month');
      aggregate_list = "year, month";
      break;
    case "day":
      end_date.add(num_datapoints, 'day');
      aggregate_list = "year, month, day";
      break;
    case "hour":
      end_date.add(num_datapoints, 'hour');
      aggregate_list = "year, month, day, hour";
      break;
    default:
      return common.malformedQuery("Invalid aggregation.", res);
  }

  end_date.subtract(1, 'hours');

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

  db.all(full_query, [start_date.format("YYYY-MM-DD HH:mm"), end_date.format("YYYY-MM-DD HH:mm")], (err, rows) => {
    if (err) {
      return common.internalError(err.message);
    }

    var query_data = [];
    rows.forEach((row) => {
      query_data.push(row.watt_hour / 1000.0);
    });
    res.json({ "status": "OK", "data": query_data });
  });
}

exports.query = function(req, res) {
  var num_datapoints = common.getIntParam("num", req);
  var aggregation = common.getStringParam("agg", req);
  var year = common.getIntParam("year", req);
  var month = common.getIntParam("month", req);
  var day = common.getIntParam("day", req);
  var hour = common.getIntParam("hour", req);

  _query(num_datapoints, aggregation, year, month, day, hour, res);
}
