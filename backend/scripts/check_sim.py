from app.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
sql = "SELECT id, name, word_similarity('t-shirt', name) as sim FROM products WHERE word_similarity('t-shirt', name) > 0.3 ORDER BY sim DESC LIMIT 15"
res = db.execute(text(sql)).fetchall()
print("Matches > 0.3:")
for r in res:
    print(r)

sql2 = "SELECT id, name, word_similarity('t-shirt', name) as sim FROM products ORDER BY sim DESC LIMIT 15"
res2 = db.execute(text(sql2)).fetchall()
print("Top 15 sim:")
for r in res2:
    print(r)
