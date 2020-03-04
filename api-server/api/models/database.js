const Database = require('better-sqlite3');

const kDatabasePath = './database.db';

const db = new Database(kDatabasePath, {'fileMustExist': true});
console.log('Connected to the solar database.');

module.exports = db