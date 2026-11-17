"""Regenera backend/app/content/_index.json: 00 (Método) primero, luego los
bloques en orden numérico (incluido 20, Práctica)."""
import glob, json, os
C = os.path.join(os.path.dirname(__file__), "..", "..", "backend", "app", "content")
blocks = []
for f in glob.glob(os.path.join(C, "block_*.json")):
    b = json.load(open(f, encoding="utf-8"))
    blocks.append({"block": b["block"], "title": b["title"], "sectionCount": len(b["sections"])})
key = lambda b: int(b["block"])
blocks.sort(key=key)
json.dump(blocks, open(os.path.join(C, "_index.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print([b["block"] for b in blocks])
