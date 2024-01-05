const Database = require("better-sqlite3");
const db = new Database("./database/database.db", { verbose: console.log });

db.pragma("journal_mode = WAL");

function createTables() {
  db.prepare(
    "CREATE TABLE IF NOT EXISTS profiles ('id' TEXT PRIMARY KEY,  'ticketsOpen' INT DEFAULT 0, 'totalTickets' INT DEFAULT 0)"
  ).run();

  db.prepare(
    "CREATE TABLE IF NOT EXISTS staff ('id' TEXT PRIMARY KEY,  'ticketsClosed' INT DEFAULT 0)"
  ).run();
}

createTables();

/**
 * @returns {Database}
 */
function getDatabase() {
  return db;
}

module.exports.getDatabase = getDatabase;
