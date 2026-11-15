"""Recoge las palabras alemanas que aparecen en el contenido de la app.

Campos 100 % alemanes: se toma todo el texto. Campos en español con
fragmentos alemanes (reglas, notas, preguntas…): solo lo que va en
<b>/<i>/<em>/<strong> o en spans de rol (r-*). Debe coincidir con lo que
hace frontend/src/lexicon.js al subrayar.
"""
import glob, html, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
CONTENT = os.path.join(HERE, "..", "backend", "app", "content")
WORD = re.compile(r"[A-Za-zÄÖÜäöüß]+(?:-[A-Za-zÄÖÜäöüß]+)*")
TAG = re.compile(r"<[^>]+>")
EMPH = re.compile(r"<(b|i|em|strong)\b[^>]*>(.*?)</\1>|<span class=\"r-[^\"]*\">(.*?)</span>", re.S)


def text(h):
    return html.unescape(TAG.sub(" ", h or ""))


def emph(h):
    out = []
    for m in EMPH.finditer(h or ""):
        out.append(text(m.group(2) or m.group(3) or ""))
    return " ".join(out)


def walk_sections():
    for f in sorted(glob.glob(os.path.join(CONTENT, "block_*.json"))):
        b = json.load(open(f, encoding="utf-8"))
        yield "mixed", b.get("intro", "")
        for s in b.get("sections", []):
            yield from section_texts(s)


def section_texts(s):
    for k in ("rule", "reasoning"):
        yield "mixed", s.get(k, "")
    for n in s.get("notes") or []:
        yield "mixed", n.get("text", "")
    for ex in s.get("examples") or []:
        yield "de", ex.get("en", "")
    for t in s.get("tables") or []:
        for row in [t.get("headers", [])] + t.get("rows", []):
            for c in row:
                yield "mixed", c
                yield "de", c if not re.search(r"[áéíóúñ¿¡]", text(c)) else ""
    for q in s.get("quiz") or []:
        yield "mixed", q.get("question", "")
    d = s.get("dialog")
    if d:
        for l in d.get("lines", []):
            yield "de", l.get("de", "")
    r = s.get("reading")
    if r:
        for p in r.get("paragraphs", []) or r.get("text", []) or []:
            yield "de", p
        for g in r.get("glossary", []) or []:
            yield "de", g.get("de", "")
    v = s.get("vocab")
    if v:
        for it in v.get("items", []):
            yield "de", it.get("de", "")
    rp = s.get("roleplay")
    if rp:
        for st in rp.get("steps", []):
            yield "de", st.get("partner", "")
            yield "de", st.get("model", "")
            yield "mixed", st.get("task", "")
    w = s.get("writing")
    if w:
        yield "de", w.get("model", "")
        yield "mixed", w.get("task", "")
    sc = s.get("scenario")
    if sc:
        yield "mixed", sc.get("situation", "")
        for g in sc.get("goals", []) or sc.get("phrases", []) or []:
            yield "mixed", g if isinstance(g, str) else ""
    sy = s.get("syntax")
    if sy:
        for x in sy.get("sentences", []) or []:
            yield "de", x.get("de", "")
    o = s.get("order")
    if o:
        for ex in o.get("exercises", []) or []:
            yield "mixed", ex.get("prompt", "")


def collect():
    forms = {}
    for kind, h in walk_sections():
        t = text(h) if kind == "de" else emph(h)
        for w in WORD.findall(t):
            forms.setdefault(w.lower(), set()).add(w)
    return forms


if __name__ == "__main__":
    f = collect()
    print(len(f))
