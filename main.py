import random
import time
import duolingo
import inspect

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
# for number, word in enumerate(known_words):
#     print(f"{number}: {word}")

for number, word in enumerate(vocab):  # word is a dictionary containing key value pairs
    # print(f"{number}: {word["text"]} - {word["translations"][0]}")
    number = number
    text = word["text"]
    translation = word["translations"]
    print(number, text, translation)
