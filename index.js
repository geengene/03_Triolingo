import { exec } from "child_process";
import express from "express";
import { Pool } from "pg";

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

// Route to trigger the Python script
app.get("/populate", (req, res) => {
  exec("python main.py", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error}`);
      return res.status(500).send("Error executing script");
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
    res.send("Database populated");
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
