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
  const words = await pool.query("SELECT * FROM vocabulary");
  const word = words.rows;
  res.render("main.ejs", {
    words: word,
  });
});

// Route to trigger the Python script
app.get("/populate", (req, res) => {
  exec("python main.py", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error}`);
      return res.status(500).send("Error executing script");
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
    // res.sendStatus(201);
    res.redirect("/");
  });
});

// Route to get data from PostgreSQL
app.get("/vocabulary", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM vocabulary");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving data");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
