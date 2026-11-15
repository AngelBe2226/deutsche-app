"""Incorpora tools/explain/block_XX.json ({id: explicación}) a los quizzes."""
import glob, json, os
HERE = os.path.dirname(os.path.abspath(__file__))
CONTENT = os.path.join(HERE, "..", "backend", "app", "content")
total = done = 0
for f in sorted(glob.glob(os.path.join(HERE, "explain", "block_*.json"))):
    exp = json.load(open(f, encoding="utf-8"))
    path = os.path.join(CONTENT, os.path.basename(f))
    b = json.load(open(path, encoding="utf-8"))
    for s in b["sections"]:
        for q in s.get("quiz") or []:
            if q["id"] in exp:
                q["explain"] = exp[q["id"]]
                done += 1
    with open(path, "w", encoding="utf-8") as out:
        json.dump(b, out, ensure_ascii=False, indent=2)
        out.write("\n")
for f in glob.glob(os.path.join(CONTENT, "block_*.json")):
    for s in json.load(open(f, encoding="utf-8"))["sections"]:
        total += len(s.get("quiz") or [])
print(f"explicaciones aplicadas: {done}; quizzes totales: {total}")
