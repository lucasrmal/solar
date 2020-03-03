const sqlite3 = require('sqlite3').verbose();
var TransactionDatabase = require("sqlite3-transactions").TransactionDatabase;

const kDatabasePath = "./database.db";
 
// open the database
let db = new TransactionDatabase(new sqlite3.Database(kDatabasePath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  }
  console.log('Connected to the solar database.');
}));

module.exports = db