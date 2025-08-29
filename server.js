const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 8080;

const frontPath = path.join(__dirname, "../front");
console.log("Serving static files from:", frontPath);
app.use(express.static(frontPath));

app.get("/", (req, res) => {
  const indexPath = path.join(frontPath, "index.html");
  console.log("Index.html path:", indexPath);
  res.sendFile(indexPath);
});

const db = new sqlite3.Database(path.join(__dirname, "../moodgarden.db"));

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password_hash TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS moods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  mood INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
)`);

db.run(`CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);  







//register
app.post("/register", (req, res) => {
    const { email, password } = req.body;
    const password_hash = bcrypt.hashSync(password, 10);
  
    db.run(`INSERT INTO users (email, password_hash) VALUES (?, ?)`,
      [email, password_hash],
      function (err) {
        if (err) {
          return res.status(400).json({ error: "Email already exists" });
        }
        res.json({ success: true, userId: this.lastID, email });
      });
  });
  
  //login
  app.post("/login", (req, res) => {
    const { email, password } = req.body;
  
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
      if (err || !user) {
        return res.status(400).json({ error: "Invalid email or password" });
      }
  
      const validPass = bcrypt.compareSync(password, user.password_hash);
      if (!validPass) {
        return res.status(400).json({ error: "Invalid email or password" });
      }
  
      res.json({ message: "Login successful", userId: user.id });
    });
  });
    
  
  
  
  
  
  
  
  
  
  
  app.post("/moods", (req, res) => {
      const { userId, mood } = req.body;
      if (!userId || mood === undefined) {
        return res.status(400).json({ error: "Missing userId or mood" });
      }
    
      db.run(
        "INSERT INTO moods (user_id, mood) VALUES (?, ?)",
        [userId, mood],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true, id: this.lastID });
        }
      );
    });
    
    app.get("/moods/:userId", (req, res) => {
      const { userId } = req.params;
      db.all(
        "SELECT mood, created_at FROM moods WHERE user_id = ? ORDER BY created_at",
        [userId],
        (err, rows) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true, moods: rows });
        }
      );
    });
    
    





app.post("/journal", (req, res) => {
    const { userId, content } = req.body;
    if (!userId || !content) {
      return res.json({ success: false, error: "Missing userId or content" });
    }
  
    db.run(
      "INSERT INTO journal_entries (user_id, content) VALUES (?, ?)",
      [userId, content],
      function (err) {
        if (err) return res.json({ success: false, error: err.message });
        res.json({ success: true, id: this.lastID });
      }
    );
  });
  
  app.get("/journal/:userId", (req, res) => {
    db.all(
      "SELECT * FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC",
      [req.params.userId],
      (err, rows) => {
        if (err) return res.json({ success: false, error: err.message });
        res.json({ success: true, entries: rows });
      }
    );
  });

app.delete("/journal/:id", (req, res) => {
    const entryId = req.params.id;
  
    db.run("DELETE FROM journal_entries WHERE id = ?", [entryId], function (err) {
      if (err) return res.json({ success: false, error: err.message });
      res.json({ success: true, deleted: this.changes });
    });
  });
  








//journal
app.post("/api/journal", (req, res) => {
    const { userId, content } = req.body;
    if (!userId || !content) return res.json({ success: false, error: "Missing data" });
  
    db.run(
      `INSERT INTO journal_entries (user_id, content, created_at)
       VALUES (?, ?, datetime('now'))`,
      [userId, content],
      function (err) {
        if (err) return res.json({ success: false, error: err.message });
        res.json({ success: true, id: this.lastID });
      }
    );
  });
  
  app.get("/api/journal/:userId", (req, res) => {
    const { userId } = req.params;
    db.all(
      `SELECT * FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC`,
      [userId],
      (err, rows) => {
        if (err) return res.json({ success: false, error: err.message });
        res.json({ success: true, entries: rows });
      }
    );
  });
  
  app.get("/api/moods/daily/:userId", (req, res) => {
    const { userId } = req.params;
  
    db.all(
      `
      SELECT 
        DATE(created_at) as day,
        AVG(mood) as avg_mood
      FROM moods
      WHERE user_id = ?
      GROUP BY DATE(created_at)
      ORDER BY day ASC
      `,
      [userId],
      (err, rows) => {
        if (err) return res.json({ success: false, error: err.message });
        res.json({ success: true, moods: rows });
      }
    );
  });
  






app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});