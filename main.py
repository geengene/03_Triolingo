import duolingo
import inspect
import psycopg2

source = inspect.getsource(duolingo)
new_source = source.replace("jwt=None", "jwt")
new_source = source.replace("self.jwt = None", " ")
exec(new_source, duolingo.__dict__)

lingo = duolingo.Duolingo(
    "geengene",
    jwt="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjYzMDcyMDAwMDAsImlhdCI6MCwic3ViIjoxNDI1NjI3MDAzfQ.9BF614NVShsb12Qafe9rFmqKa_wvAlyOQO_Z9qmCi88",
)
# known_words = lingo.get_known_words('ja')
vocab = lingo.get_vocabulary(
    language_abbr="ja"
)  # vocab is a list of dictionaries for each word

# Database connection setup
conn = psycopg2.connect(
    dbname="duolingo",
    user="postgres",
    password="0490258",
    host="localhost",
    port="5432",
)
cur = conn.cursor()

# Create table if not exists
cur.execute(
    """
CREATE TABLE IF NOT EXISTS vocabulary (
    id SERIAL PRIMARY KEY,
    text VARCHAR(255) UNIQUE,
    translation TEXT,
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
