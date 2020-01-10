const sqlite3 = require('sqlite3').verbose();
const kDatabasePath = "./database.db";
 
// open the database
let db = new sqlite3.Database(kDatabasePath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  }
  console.log('Connected to the solar database.');
});

module.exports = db