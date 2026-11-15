"""Vuelca los quizzes de un bloque en formato compacto para redactar explicaciones.
Uso: python3 tools/quiz_dump.py 05"""
import html, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
b = json.load(open(os.path.join(HERE, "..", "backend", "app", "content", f"block_{sys.argv[1]}.json"), encoding="utf-8"))
print("#", b["block"], b["title"])
for s in b["sections"]:
    if s.get("quiz"):
        print("##", s["idx"], s["title"])
    for q in s.get("quiz") or []:
        t = html.unescape(re.sub(r'<span class="blank">[^<]*</span>', "___", q["question"]))
        t = re.sub(r"<[^>]+>", "", t)
        opts = " | ".join(("*" if i == q["correctIndex"] else "") + o for i, o in enumerate(q["options"]))
        print(f'{q["id"]}: {t} → {opts}')
