const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'stadium.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Helper to run query as a promise
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

// Helper to get all records as a promise
const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Helper to get single record as a promise
const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const initDb = async () => {
  // Enable foreign keys
  await dbRun('PRAGMA foreign_keys = ON;');

  // Users
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      role TEXT CHECK (role IN ('fan', 'volunteer', 'staff')) NOT NULL,
      preferred_language TEXT DEFAULT 'en',
      accessibility_needs TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Stadiums
  await dbRun(`
    CREATE TABLE IF NOT EXISTS stadiums (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      metadata TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Stadium zones
  await dbRun(`
    CREATE TABLE IF NOT EXISTS zones (
      id TEXT PRIMARY KEY,
      stadium_id TEXT REFERENCES stadiums(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      zone_type TEXT,
      crowd_level INTEGER DEFAULT 0,
      accessibility_score INTEGER DEFAULT 0,
      metadata TEXT DEFAULT '{}'
    );
  `);

  // Points of interest
  await dbRun(`
    CREATE TABLE IF NOT EXISTS points_of_interest (
      id TEXT PRIMARY KEY,
      stadium_id TEXT REFERENCES stadiums(id) ON DELETE CASCADE,
      zone_id TEXT REFERENCES zones(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      poi_type TEXT NOT NULL,
      description TEXT,
      is_accessible INTEGER DEFAULT 0,
      metadata TEXT DEFAULT '{}'
    );
  `);

  // Routes
  await dbRun(`
    CREATE TABLE IF NOT EXISTS routes (
      id TEXT PRIMARY KEY,
      stadium_id TEXT REFERENCES stadiums(id) ON DELETE CASCADE,
      from_point TEXT NOT NULL,
      to_point TEXT NOT NULL,
      route_data TEXT NOT NULL,
      estimated_time_minutes INTEGER,
      accessibility_notes TEXT,
      crowd_risk_level TEXT
    );
  `);

  // AI chats
  await dbRun(`
    CREATE TABLE IF NOT EXISTS assistant_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      stadium_id TEXT REFERENCES stadiums(id) ON DELETE SET NULL,
      language TEXT DEFAULT 'en',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS assistant_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT REFERENCES assistant_sessions(id) ON DELETE CASCADE,
      sender TEXT CHECK (sender IN ('user', 'assistant')) NOT NULL,
      message TEXT NOT NULL,
      intent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Operational alerts
  await dbRun(`
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      stadium_id TEXT REFERENCES stadiums(id) ON DELETE CASCADE,
      zone_id TEXT REFERENCES zones(id) ON DELETE SET NULL,
      alert_type TEXT NOT NULL,
      severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT CHECK (status IN ('open', 'acknowledged', 'resolved')) DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Feedback
  await dbRun(`
    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      session_id TEXT REFERENCES assistant_sessions(id) ON DELETE CASCADE,
      rating INTEGER CHECK (rating BETWEEN 1 AND 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Database tables verified/created successfully.');
};

module.exports = {
  db,
  dbRun,
  dbAll,
  dbGet,
  initDb,
  generateUuid: () => crypto.randomUUID()
};
