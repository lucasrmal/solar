const Database = require('better-sqlite3');

const kDatabasePath = __dirname + '/../../database.db';

console.log(kDatabasePath);

const db = new Database(kDatabasePath, {'fileMustExist': true});
console.log('Connected to the solar database.');

module.exports = db