const Database = require('better-sqlite3');
var moment = require('moment');

function _generateData(start_date, num) {
  const month_factor = [0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.2, 1.1, 1.0, 0.9, 0.8, 0.7];
  const hour_factor = [0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 8, 7, 7, 5, 4, 3, 2, 1, 0, 0, 0];
  const base = 1500;
  var data = [];

  var day_factor = Math.min(Math.random() + 0.4, 1.0);
  for (var i = 0; i < num; ++i) {
    if (start_date.hour() == 0) {
      day_factor = Math.min(Math.random() + 0.4, 1.0);
    }
    var value = base * day_factor * month_factor[start_date.month()] * hour_factor[start_date.hour()];
    data.push({"year": start_date.format("YYYY"), 
               "month": start_date.format("M"),
               "day": start_date.format("D"),
               "hour": start_date.format("H"),
               "watt_hour": value
             });
    start_date.add(1, 'hour');
  }
  return data;
}

if (!process.argv[2]) {
  console.error('Must specify a path!'); 
  process.exit(0);
}

var database_path = process.argv[2];
console.log('Creating database: ' + database_path);
 
// open the database
const db = new Database(database_path);

db.exec(`CREATE TABLE Production (
          year INT NOT NULL,
          month INT NOT NULL,
          day INT NOT NULL,
          hour INT NOT NULL,
          watt_hour INT NOT NULL,

          PRIMARY KEY (year, month, day, hour)
        );`);

db.exec(`CREATE TABLE ApiKey (
          api_key VARCHAR(20) NOT NULL,
          PRIMARY KEY (api_key)
        );`);

db.exec(`CREATE TABLE RawProduction (
          year INT NOT NULL,
          month INT NOT NULL,
          day INT NOT NULL,
          hour INT NOT NULL,
          minute INT NOT NULL,
          watts INT NOT NULL,

          PRIMARY KEY (year, month, day, hour, minute)
        );`);

// `OR IGNORE` to quickly take care of daylight savings..
var insert = db.prepare(`INSERT OR IGNORE INTO Production(year, month, day, hour, watt_hour)
                         VALUES(@year, @month, @day, @hour, @watt_hour)`);

const insertMany = db.transaction((data) => {
  for (const dp of data) insert.run(dp);
});

insertMany(_generateData(moment([2018, 10, 1, 0]), 12000));

