const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // set your MySQL password
  database: "groupdb",
  port: 3307
});

db.connect(err => {
  if (err) {
    console.log("❌ DB Error:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

// ➕ Add Group
app.post("/groups", (req, res) => {
  const { group_name } = req.body;

  if (!group_name || group_name.trim() === "") {
    return res.status(400).json({ message: "Group name required" });
  }

  const checkQuery = "SELECT * FROM groups WHERE group_name = ?";
  db.query(checkQuery, [group_name], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (result.length > 0) return res.status(400).json({ message: "Group Already Exists" });

    const insertQuery = "INSERT INTO groups (group_name) VALUES (?)";
    db.query(insertQuery, [group_name], (err) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json({ message: "Group added successfully" });
    });
  });
});

// 📋 Get Groups
app.get("/groups", (req, res) => {
  const query = "SELECT * FROM groups";
  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(result);
  });
});

// ✏️ Update Group
app.put("/groups/:id", (req, res) => {
  const { id } = req.params;
  const { group_name } = req.body;

  if (!group_name || group_name.trim() === "") {
    return res.status(400).json({ message: "Group name cannot be empty" });
  }

  const query = "UPDATE groups SET group_name=? WHERE group_id=?";
  db.query(query, [group_name, id], (err) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json({ message: "Group updated successfully" });
  });
});

// 🔄 Soft Delete (Deactivate)
// 🔄 Toggle Active (Soft Delete)
app.patch("/groups/:id/toggle", (req, res) => {
  const { id } = req.params;
  const query = "UPDATE groups SET is_active = NOT is_active WHERE group_id = ?";

  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });

    // Return the updated row
    db.query("SELECT * FROM groups WHERE group_id = ?", [id], (err2, rows) => {
      if (err2) return res.status(500).json({ message: "DB error" });
      res.json(rows[0]); // <-- This includes is_active
    });
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));