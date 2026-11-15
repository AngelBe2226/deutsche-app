# Lee un JSONL del Wiktionary alemán (kaikki, dewiktionary) desde stdin y
# guarda solo lo necesario: palabra, categoría, traducciones al español,
# glosas en alemán (de respaldo) y, para sustantivos, género y plural.
import sys, json
out = {}
for line in sys.stdin:
    try:
        d = json.loads(line)
    except Exception:
        continue
    w = d.get("word")
    if not w:
        continue
    es = []
    for t in d.get("translations", []) or []:
        if t.get("lang_code") == "es" and t.get("word"):
            es.append(t["word"])
    for s in d.get("senses", []) or []:
        for t in s.get("translations", []) or []:
            if t.get("lang_code") == "es" and t.get("word"):
                es.append(t["word"])
    e = out.setdefault(w, {"pos": d.get("pos"), "es": [], "tags": set()})
    for x in es:
        if x not in e["es"]:
            e["es"].append(x)
    for t in d.get("tags", []) or []:
        e["tags"].add(t)
for e in out.values():
    e["tags"] = sorted(e["tags"])
json.dump(out, sys.stdout, ensure_ascii=False)
