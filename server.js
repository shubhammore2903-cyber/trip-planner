const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'tripplanner.sqlite');
fs.mkdirSync(DATA_DIR, { recursive: true });

let db;
function saveDb() {
  const bytes = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(bytes));
}
function run(sql, params = []) {
  const stmt = db.prepare(sql);
  try {
    stmt.bind(params);
    stmt.step();
    const result = { changes: db.getRowsModified() };
    return result;
  } finally { stmt.free(); }
}
function all(sql, params = []) {
  const stmt = db.prepare(sql);
  const rows = [];
  try {
    stmt.bind(params);
    while (stmt.step()) rows.push(stmt.getAsObject());
    return rows;
  } finally { stmt.free(); }
}
function one(sql, params = []) { return all(sql, params)[0] || null; }
function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Please log in first.' });
  next();
}

(async () => {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(new Uint8Array(fileBuffer));
  } else {
    db = new SQL.Database();
  }
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    destination TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    travelers INTEGER NOT NULL DEFAULT 1,
    budget INTEGER NOT NULL DEFAULT 0,
    notes TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  saveDb();

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(session({
    secret: process.env.SESSION_SECRET || 'change-this-trip-planner-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 24 }
  }));
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/api/me', (req, res) => {
    res.json({ user: req.session.user || null });
  });

  app.post('/api/register', async (req, res) => {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (name.length < 2) return res.status(400).json({ error: 'Please enter your name (at least 2 characters).' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    if (one('SELECT id FROM users WHERE email = ?', [email])) return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    const passwordHash = await bcrypt.hash(password, 10);
    run('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, passwordHash]);
    saveDb();
    const user = one('SELECT id, name, email FROM users WHERE email = ?', [email]);
    req.session.user = user;
    res.status(201).json({ message: 'Account created successfully!', user });
  });

  app.post('/api/login', async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const record = one('SELECT * FROM users WHERE email = ?', [email]);
    if (!record || !(await bcrypt.compare(password, record.password_hash))) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }
    req.session.user = { id: record.id, name: record.name, email: record.email };
    res.json({ message: 'Logged in successfully!', user: req.session.user });
  });

  app.get('/api/trips'
    const startDate = String(req.body.startDate || '').trim();
    const endDate = String(req.body.endDate || '').trim();
    const travelers = Math.min(20, Math.max(1, Number.parseInt(req.body.travelers, 10) || 1));
    const budget = Math.max(0, Number.parseInt(req.body.budget, 10) || 0);
    const notes = String(req.body.notes || '').trim().slice(0, 1500);
    if (destination.length < 2) return res.status(400).json({ error: 'Please enter a destination.' });
    if (startDate && endDate && endDate < startDate) return res.status(400).json({ error: 'Return date cannot be before departure date.' });
    run('INSERT INTO trips (user_id, destination, start_date, end_date, travelers, budget, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.session.user.id, destination, startDate, endDate, travelers, budget, notes]);
    saveDb();
    res.status(201).json({ message: 'Trip saved!', trip: one('SELECT * FROM trips WHERE id = last_insert_rowid()') });
  });

  app.delete('/api/trips/:id', requireAuth, (req, res) => {
    const id = Number.parseInt(req.params.id, 10);
    const trip = one('SELECT id FROM trips WHERE id = ? AND user_id = ?', [id, req.session.user.id]);
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });
    run('DELETE FROM trips WHERE id = ? AND user_id = ?', [id, req.session.user.id]);
    saveDb();
    res.json({ message: 'Trip deleted.' });
  });

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: 'SQLite file connected' }));

  app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
  app.listen(PORT, () => console.log(`Trip Planner is running at http://localhost:${PORT}`));
})().catch(err => { console.error('Could not start Trip Planner:', err); process.exit(1); });
