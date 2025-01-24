const { exec } = require("child_process");
const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PostgreSQL connection setup
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "duolingo",
  password: "0490258",
  port: 5432,
});

app.get("/", async (req, res) => {
  res.render("main.ejs");
});

// Route to trigger the Python script
app.get("/populate", async (req, res) => {
  exec("python main.py", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error}`);
      return res.status(500).send("Error executing script");
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
    // res.sendStatus(201);
    res.redirect("/vocabulary");
  });
});

// Route to get data from PostgreSQL
app.get("/vocabulary", async (req, res) => {
  const words = await pool.query(`
    SELECT * 
    FROM information_schema.tables 
    WHERE table_name = 'vocabulary'
  `);
  if (words.rows.length > 0) {
    const vocab = await pool.query("SELECT * FROM vocabulary");
    if (vocab) {
      const word = vocab.rows;
      res.render("vocab.ejs", {
        words: word,
      });
    } else {
      res.render("vocab.ejs", {
        words: [],
      });
    }
  } else {
    res.render("vocab.ejs", {
      words: [],
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
