import duolingo
import inspect
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()
source = inspect.getsource(duolingo)
new_source = source.replace("jwt=None", "jwt")
new_source = source.replace("self.jwt = None", " ")
exec(new_source, duolingo.__dict__)

username = os.getenv("DUOLINGO_USERNAME")
jwt = os.getenv("DUOLINGO_JWT")

lingo = duolingo.Duolingo(username, jwt=jwt)

vocab = lingo.get_vocabulary(language_abbr="ja")

# print(lingo.get_user_info())
# print(lingo.get_languages(abbreviations=True))
# print(lingo.get_known_topics("ja"))
# known_words = lingo.get_known_words('ja')


# Database connection setup
conn = psycopg2.connect(
    dbname=os.getenv("DB_NAME"),
    user=os.getenv("USER_NAME"),
    password=os.getenv("PASSWORD"),
    host=os.getenv("HOST"),
    port=os.getenv("PORT"),
)
cur = conn.cursor()

# Create table if not exists
cur.execute(
    """
CREATE TABLE IF NOT EXISTS vocabulary (
    id SERIAL PRIMARY KEY,
    text VARCHAR(255) UNIQUE,
    translation TEXT[],
    audioURL VARCHAR(255)
)
"""
)
conn.commit()

for number, word in enumerate(vocab):  # word is a dictionary containing key value pairs
    text = word["text"]
    translation = word["translations"]
    audioURL = word["audioURL"]
    print(f"|{text}|{translation}|{audioURL}|")
    cur.execute(
        "INSERT INTO vocabulary (text, translation, audioURL) VALUES (%s, %s, %s) ON CONFLICT (text) DO NOTHING",
        (text, translation, audioURL),
    )

conn.commit()
cur.close()
conn.close()
