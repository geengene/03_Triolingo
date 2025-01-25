import { exec } from "child_process";
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
  user: process.env.USER_NAME,
  host: process.env.HOST,
  database: process.env.DB_NAME,
  password: process.env.PASSWORD,
  port: process.env.PORT,
});
db.connect();

app.get("/", async (req, res) => {
  res.render("main.ejs");
});

app.get("/populate", async (req, res) => {
  exec(
    "source ./venv/bin/activate && python main.py",
    (error, stdout, stderr) => {
      //trigger python script
      if (error) {
        console.error(`Error executing script: ${error}`);
        return res.status(500).send("Error executing script");
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
      res.redirect("/database");
    }
  );
});

app.get("/database", async (req, res) => {
  const words = await db.query(`
    SELECT * 
    FROM information_schema.tables 
    WHERE table_name = 'vocabulary'
  `);
  if (words.rows.length > 0) {
    const vocab = await db.query("SELECT * FROM vocabulary");
    if (vocab) {
      const word = vocab.rows;
      res.render("database.ejs", {
        words: word,
      });
    } else {
      res.render("database.ejs", {
        words: [],
      });
    }
  } else {
    res.render("database.ejs", {
      words: [],
    });
  }
});
app.get("/add-to-database", async (req, res) => {
  res.render("add.ejs");
});

app.post("/add-to-database", async (req, res) => {
  const vocab = req.body;
  const result = await db.query("SELECT COUNT(*) FROM vocabulary");
  const id = parseInt(result.rows[0].count) + 1;
  await db.query(
    "INSERT INTO vocabulary (id, text, translation) VALUES($1, $2, $3)",
    [id, vocab.word, [vocab.translation]]
  );
  res.redirect("/database");
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
