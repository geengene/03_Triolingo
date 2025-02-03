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
  const settings = await db.query("SELECT * FROM settings");
  const vocabLimit = settings.rows[0].vocab_limit;
  res.render("main.ejs", { vocabLimit });
});

app.post("/settings", async (req, res) => {
  try {
    const { vocab_limit } = req.body;
    await db.query(
      "CREATE TABLE IF NOT EXISTS settings (id SERIAL PRIMARY KEY, vocab_limit INTEGER );"
    );
    await db.query(
      "INSERT INTO settings (id, vocab_limit) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET vocab_limit = EXCLUDED.vocab_limit;",
      [vocab_limit]
    );
    res.redirect("/");
  } catch (err) {
    res.send(err);
  }
});

app.get("/populate", async (req, res) => {
  exec(
    "source ./venv/bin/activate && ./venv/bin/python main.py",
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
  try {
    await db.query(
      "CREATE TABLE IF NOT EXISTS vocabulary (id SERIAL PRIMARY KEY, text VARCHAR(255) UNIQUE, translation TEXT[], audioURL VARCHAR(255), confidence REAL DEFAULT 0)"
    );
    const vocab = await db.query("SELECT * FROM vocabulary ORDER BY id ASC");
    const settings = await db.query("SELECT * FROM settings");
    const vocabLimit = settings.rows[0].vocab_limit;
    res.render("database.ejs", {
      words: vocab.rows,
      vocabLimit: vocabLimit,
    });
  } catch (err) {
    res.send("no words in database");
  }
});

app.get("/database/add-to-database", async (req, res) => {
  res.render("add.ejs");
});

app.post("/database/add-to-database", async (req, res) => {
  const vocab = req.body;
  try {
    await db.query(
      "INSERT INTO vocabulary (text, translation) VALUES($1, $2)",
      [vocab.word, [vocab.translation]]
    );
    res.redirect("/database");
  } catch (err) {
    res.send("word already in database");
  }
});

app.get("/database/edit/:id", async (req, res) => {
  const wordId = req.params.id;
  const vocab = await db.query("SELECT * FROM vocabulary WHERE id = $1", [
    wordId,
  ]);
  console.log(vocab.rows[0]);
  res.render("edit.ejs", { word: vocab.rows[0], wordId });
});

app.post("/database/edit/:id", async (req, res) => {
  console.log(req.body);
  const vocab = req.body;
  await db.query(
    "UPDATE vocabulary SET text = $1, translation = $2 WHERE id = $3",
    [vocab.text, [vocab.translation], req.params.id]
  );
  res.redirect("/database");
});

app.post("/database/delete", async (req, res) => {
  console.log(req.body);
  await db.query("DELETE FROM vocabulary WHERE id = $1", [
    req.body.deleteWordId,
  ]);
  res.redirect("/database");
});
// TODO: integrate yomi api. i want romanji and hiragan /katakana to be available
app.get("/vocabulary", async (req, res) => {
  try {
    const settings = await db.query("SELECT * FROM settings WHERE id = 1");
    const vocab = await db.query(
      "SELECT * FROM vocabulary ORDER BY confidence ASC, RANDOM() LIMIT $1",
      [settings.rows[0].vocab_limit]
    );
    const currentIndex = 0;
    res.render("practiceVocab.ejs", { words: vocab.rows, currentIndex });
  } catch (err) {
    res.send("no words in database");
  }
});

app.post("/vocabulary", async (req, res) => {
  try {
    console.log(req.body);
    const { wordId, confidence } = req.body;
    await db.query(
      "UPDATE vocabulary SET confidence = confidence + $1 WHERE id = $2",
      [confidence, wordId]
    );
    res.status(204).send();
  } catch (err) {}
});

app.post("/vocabulary/finish", async (req, res) => {
  try {
    if (req.body.modalButton === "exitModal") {
      res.redirect("/");
    } else if (req.body.modalButton === "anotherModal") {
      res.redirect("/vocabulary");
    }
  } catch (err) {}
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
