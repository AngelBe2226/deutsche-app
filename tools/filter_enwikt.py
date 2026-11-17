"""Filtra un JSONL de kaikki (Wiktionary inglés, alemán) por las formas de la app.
Uso: curl … | python3 filter_enwikt.py .cache/lex_forms.json > salida.jsonl"""
import json, sys

forms = set(json.load(open(sys.argv[1], encoding="utf-8")))
for line in sys.stdin:
    try:
        d = json.loads(line)
    except Exception:
        continue
    w = d.get("word", "")
    keep = w.lower() in forms
    if not keep:
        for fo in d.get("forms") or []:
            if (fo.get("form") or "").lower() in forms:
                keep = True
                break
    if not keep:
        continue
    senses = []
    for s in d.get("senses", [])[:6]:
        senses.append({k: s[k] for k in ("glosses", "form_of", "tags") if k in s})
    out = {
        "word": w,
        "pos": d.get("pos"),
        "senses": senses,
        "forms": [{"form": f.get("form"), "tags": f.get("tags", [])} for f in (d.get("forms") or [])[:80]],
        "head": [h.get("expansion") for h in d.get("head_templates", [])][:1],
    }
    print(json.dumps(out, ensure_ascii=False))
