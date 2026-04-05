// server.js
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",  // your MySQL password
  database: "groupdb",
  port: 3307     // MySQL port
});

db.connect(err => {
  if(err) console.log("DB Error:", err);
  else console.log("✅ DB Connected");
});

// ---------------- GROUP ----------------

// Add group
app.post("/groups", (req,res)=>{
  const { group_name } = req.body;
  if(!group_name) return res.status(400).json({ message:"Group required" });

  db.query("INSERT INTO groups(group_name,is_active) VALUES(?,true)", [group_name], (err,r)=>{
    if(err) return res.status(500).json({ message:err.message });
    res.json({ message:"Group added" });
  });
});

// Get groups
app.get("/groups", (req,res)=>{
  db.query("SELECT * FROM groups WHERE is_active=true", (err,r)=>{
    if(err) return res.status(500).json({ message:err.message });
    res.json(r);
  });
});

// ---------------- CHAINS ----------------

// Add chain
app.post("/chains", (req,res)=>{
  const { company_name, gstn_no, group_id } = req.body;
  db.query(
    "INSERT INTO chains(company_name,gstn_no,group_id,is_active,created_at,updated_at) VALUES(?,?,?,?,NOW(),NOW())",
    [company_name,gstn_no,group_id,true],
    (err,r)=>{
      if(err) return res.status(500).json({ message:err.message });
      res.json({ message:"Chain added" });
    }
  );
});

// Get chains (only active)
app.get("/chains", (req,res)=>{
  db.query(
    `SELECT c.*, g.group_name 
     FROM chains c 
     JOIN groups g ON c.group_id = g.group_id
     WHERE c.is_active = true`,
    (err,r)=>{
      if(err) return res.status(500).json({ message:err.message });
      res.json(r);
    }
  );
});

// Edit chain
app.put("/chains/:id",(req,res)=>{
  const { company_name, gstn_no, group_id } = req.body;
  db.query(
    "UPDATE chains SET company_name=?, gstn_no=?, group_id=?, updated_at=NOW() WHERE chain_id=?",
    [company_name,gstn_no,group_id,req.params.id],
    (err,r)=>{
      if(err) return res.status(500).json({ message:err.message });
      res.json({ message:"Chain updated" });
    }
  );
});

// Soft Delete chain
app.patch("/chains/:id/delete",(req,res)=>{
  db.query(
    "UPDATE chains SET is_active=false WHERE chain_id=?",
    [req.params.id],
    (err,r)=>{
      if(err) return res.status(500).json({ message:err.message });
      res.json({ message:"Chain deleted" });
    }
  );
});

app.listen(5000,()=>console.log("🚀 Backend running on http://localhost:5000"));