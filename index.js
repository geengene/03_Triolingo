import exec from "child_process";
import express from "express";
import pg from "pg";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new pg.Client({
  user: process.env(USER),
  host: process.env(HOST),
  database: process.env(DB_NAME),
  password: process.env(PASSWORD),
  port: process.env(PORT),
});
db.connect();

app.get("/", async (req, res) => {
  res.render("main.ejs");
});

app.get("/populate", async (req, res) => {
  exec("python main.py", (error, stdout, stderr) => {
    //trigger python script
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
