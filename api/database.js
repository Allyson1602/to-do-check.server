const sqlite3 = require("sqlite3").verbose();
const dbName = "todocheck";

const db = new sqlite3.Database(dbName, (err) => {
  if (err) {
    console.error(err.message);
  }

  console.log(`Connected to the ${dbName} database.`);
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      iconName TEXT NOT NULL,
      isFavorite BOOLEAN NOT NULL DEFAULT 0 CHECK (isFavorite IN (0, 1)),
      title TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS to_do (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoryId INTEGER,
        description TEXT NOT NULL,
        title TEXT NOT NULL,
        isImportant BOOLEAN NOT NULL DEFAULT 0 CHECK (isImportant IN (0, 1)),
        isDone BOOLEAN NOT NULL DEFAULT 0 CHECK (isDone IN (0, 1)),
        FOREIGN KEY (categoryId) REFERENCES category(id) ON DELETE CASCADE
    )
  `);
});

module.exports = db;
