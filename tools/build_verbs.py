"""Genera los datos del Conjugador (frontend/public/verbs/).

Fuentes (en tools/.cache/, ver tools/README.md):
  - de-verbs.jsonl        Wiktionary inglés vía kaikki: tablas de conjugación
                          completas de los verbos alemanes (CC BY-SA 4.0).
  - dewikt-verb.json      Wiktionary alemán (extraído con extract_dewikt.py):
                          traducciones al español (CC BY-SA 4.0).
  - es-aleman.jsonl       Wiktionary español: significados en español.
  - verbs_es.json         Significados en español revisados a mano (prioridad).
  - deu/spa_sentences + deu-spa_links (Tatoeba, CC BY 2.0 FR): ejemplos reales.

Salida:
  verbs/index.json        [[lema, significado, aux, tipo, bucket, frecuencia, es?], ...]
  verbs/b/<n>.json        {lema: {...tabla, ejemplos}} repartidos en buckets.
"""
import bz2, json, os, re, sys, zlib, collections

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, ".cache")
OUT = os.path.join(HERE, "..", "frontend", "public", "verbs")
N_BUCKETS = 256

PERSONS = [("first-person", "singular"), ("second-person", "singular"), ("third-person", "singular"),
           ("first-person", "plural"), ("second-person", "plural"), ("third-person", "plural")]

# (clave, etiquetas obligatorias, etiquetas prohibidas)
TENSES = [
    ("ind_pres", {"indicative", "present"}, {"multiword-construction"}),
    ("ind_prat", {"indicative", "preterite"}, {"multiword-construction"}),
    ("ind_perf", {"indicative", "perfect"}, set()),
    ("ind_plusq", {"indicative", "pluperfect"}, set()),
    ("ind_fut1", {"indicative", "future-i"}, set()),
    ("ind_fut2", {"indicative", "future-ii"}, set()),
    ("k1_pres", {"subjunctive-i"}, {"future", "multiword-construction"}),
    ("k1_perf", {"subjunctive", "perfect"}, set()),
    ("k1_fut1", {"subjunctive-i", "future-i"}, set()),
    ("k1_fut2", {"subjunctive-i", "future-ii"}, set()),
    ("k2_prat", {"subjunctive-ii"}, {"future", "multiword-construction"}),
    ("k2_plusq", {"subjunctive", "pluperfect"}, set()),
    ("k2_fut1", {"subjunctive-ii", "future-i"}, set()),
    ("k2_fut2", {"subjunctive-ii", "future-ii"}, set()),
]

SIMPLE = {"ind_pres", "ind_prat", "k1_pres", "k2_prat"}
PRON = ["ich", "du", None, "wir", "ihr", None]


def person_index(tags):
    for i, (p, n) in enumerate(PERSONS):
        if p in tags and n in tags:
            return i
    return None


def tokens(s):
    return re.findall(r"[a-zäöüß]+", s.lower())


def load_tables():
    verbs = {}
    with open(os.path.join(CACHE, "de-verbs.jsonl"), encoding="utf-8") as f:
        for line in f:
            d = json.loads(line)
            forms = d.get("forms") or []
            if not forms or any("form_of" in s for s in d.get("senses", [])):
                continue
            w = d["word"]
            if " " in w or not re.fullmatch(r"[A-Za-zÄÖÜäöüß-]+", w):
                continue
            t = {k: [[] for _ in range(6)] for k, _, _ in TENSES}
            imp = {"du": [], "ihr": []}
            extra = {"aux": [], "part1": [], "part2": [], "zu": [], "kind": None}
            sep = False
            for fo in forms:
                form = (fo.get("form") or "").strip()
                tags = set(fo.get("tags") or [])
                if not form or form == "-":
                    continue
                if tags == {"auxiliary"}:
                    if form in ("haben", "sein") and form not in extra["aux"]:
                        extra["aux"].append(form)
                    continue
                if "table-tags" in tags:
                    if form in ("strong", "weak", "irregular", "mixed") and not extra["kind"]:
                        extra["kind"] = form
                    continue
                if "inflection-template" in tags or "class" in tags:
                    continue
                if tags == {"participle", "present"}:
                    extra["part1"].append(form); continue
                if tags == {"participle", "past"}:
                    extra["part2"].append(form); continue
                if "infinitive-zu" in tags or ("zu" in tags and "infinitive" in tags):
                    extra["zu"].append(form); continue
                if "imperative" in tags:
                    key = "du" if "singular" in tags else "ihr" if "plural" in tags else None
                    if key and form not in imp[key]:
                        imp[key].append(form)
                    continue
                if "subordinate-clause" in tags:
                    sep = True  # verbo separable: guardamos solo la forma de oración principal
                    continue
                pi = person_index(tags)
                if pi is None:
                    continue
                for key, req, forb in TENSES:
                    if req <= tags and not (forb & tags):
                        # «rare» al final (formas arcaicas/poco usadas)
                        cell = t[key][pi]
                        if form not in cell:
                            if "rare" in tags:
                                cell.append(form)
                            else:
                                cell.insert(len([x for x in cell if x]), form)
                        break
            filled = sum(1 for k in t for c in t[k] if c)
            if filled < 12:
                continue
            gl = []
            for s in d.get("senses", []):
                for g in s.get("glosses", []) or []:
                    if g not in gl:
                        gl.append(g)
            prev = verbs.get(w)
            if prev and prev["_filled"] >= filled:
                for g in gl:
                    if g not in prev["en"]:
                        prev["en"].append(g)
                continue
            dedup = lambda xs: list(dict.fromkeys(xs))
            verbs[w] = {
                "_filled": filled,
                "t": t,
                "imp": imp,
                "aux": extra["aux"] or ["haben"],
                "p1": dedup(extra["part1"]),
                "p2": dedup(extra["part2"]),
                "zu": dedup(extra["zu"]),
                "kind": extra["kind"],
                "sep": sep,
                "en": gl[:4],
            }
    return verbs


def load_meanings():
    es = {}
    # 1) Wiktionary alemán: traducciones al español
    p = os.path.join(CACHE, "dewikt-verb.json")
    if os.path.exists(p):
        for w, e in json.load(open(p, encoding="utf-8")).items():
            if e.get("es"):
                es[w] = [x for x in e["es"] if len(x) < 40][:4]
    # 2) Wiktionary español
    p = os.path.join(CACHE, "es-aleman.jsonl")
    if os.path.exists(p):
        with open(p, encoding="utf-8") as f:
            for line in f:
                d = json.loads(line)
                if d.get("pos") != "verb":
                    continue
                gl = []
                for s in d.get("senses", []):
                    for g in s.get("glosses", []) or []:
                        g = g.strip().rstrip(".")
                        if g and len(g) < 60:
                            gl.append(g[0].lower() + g[1:])
                if gl and d["word"] not in es:
                    es[d["word"]] = gl[:3]
    # 3) Revisados a mano (máxima prioridad)
    p = os.path.join(HERE, "verbs_es.json")
    if os.path.exists(p):
        for w, m in json.load(open(p, encoding="utf-8")).items():
            es[w] = m if isinstance(m, list) else [m]
    return es


def load_tatoeba():
    links = collections.defaultdict(list)
    with bz2.open(os.path.join(CACHE, "deu-spa_links.tsv.bz2"), "rt", encoding="utf-8") as f:
        for line in f:
            a, b = line.rstrip("\n").split("\t")[:2]
            links[a].append(b)
    spa = {}
    with bz2.open(os.path.join(CACHE, "spa_sentences.tsv.bz2"), "rt", encoding="utf-8") as f:
        for line in f:
            p = line.rstrip("\n").split("\t")
            if len(p) >= 3:
                spa[p[0]] = p[2]
    sents = []
    with bz2.open(os.path.join(CACHE, "deu_sentences.tsv.bz2"), "rt", encoding="utf-8") as f:
        for line in f:
            p = line.rstrip("\n").split("\t")
            if len(p) < 3 or p[0] not in links:
                continue
            es = next((spa[x] for x in links[p[0]] if x in spa), None)
            de = p[2].strip()
            if not es or len(de) > 90:
                continue
            sents.append((de, es, tokens(de)))
    sents.sort(key=lambda s: len(s[0]))  # preferir frases cortas
    index = collections.defaultdict(list)
    for i, (_, _, toks) in enumerate(sents):
        for tk in set(toks):
            index[tk].append(i)
    return sents, index


def find_example(form, sents, index, pron=None, used=None, imperative=False, particle=None):
    ftoks = tokens(form)
    part_re = re.compile(r"\b" + re.escape(particle) + r"\s*[.!?,;:]", re.I) if particle else None
    if not ftoks:
        return None
    lists = [index.get(tk, []) for tk in ftoks]
    if not all(lists):
        return None
    base = min(lists, key=len)
    for i in base:  # ordenado por longitud (frases cortas primero)
        de, es, toks = sents[i]
        if used is not None and i in used:
            continue
        if imperative != de.endswith("!"):
            continue  # imperativos solo para el imperativo (y viceversa)
        if pron and pron not in toks:
            continue
        # verbo separable: la partícula debe cerrar la oración («Ich stehe früh auf.»),
        # no ser una preposición («Ich stehe auf dich» = stehen auf)
        if part_re and not part_re.search(de):
            continue
        # todas las piezas de la forma, en orden (permite huecos: «stehe … auf»)
        pos = -1
        ok = True
        for tk in ftoks:
            try:
                pos = toks.index(tk, pos + 1)
            except ValueError:
                ok = False
                break
        if not ok:
            continue
        if used is not None:
            used.add(i)
        return [de, es]
    return None


AUX_FORMS = {"haben": {"habe", "hast", "hat", "haben", "habt", "hatte", "hatten"},
             "sein": {"bin", "bist", "ist", "sind", "seid", "war", "waren"}}


def order_aux(v, sents, index):
    """Con dos auxiliares (haben/sein), pone primero el que más aparece en Tatoeba
    y reordena las formas compuestas en consecuencia."""
    if len(v["aux"]) < 2 or not v["p2"]:
        return
    p2 = v["p2"][0].lower()
    score = {"haben": 0, "sein": 0}
    for i in index.get(p2, [])[:400]:
        toks = set(sents[i][2])
        for a, fs in AUX_FORMS.items():
            if toks & fs:
                score[a] += 1
    first = "sein" if score["sein"] > score["haben"] else "haben"
    if score["sein"] == score["haben"]:
        return
    v["aux"] = [first] + [a for a in v["aux"] if a != first]
    sein_starts = ("bin ", "bist ", "ist ", "sind ", "seid ", "war ", "warst ", "waren ", "wart ",
                   "sei ", "seist ", "seiest ", "seien ", "seiet ", "wäre ", "wärst ", "wärest ",
                   "wären ", "wärt ", "wäret ")
    for rows in v["t"].values():
        for cell in rows:
            if len(cell) > 1:
                is_sein = lambda f: f.startswith(sein_starts) or f.endswith(" sein")
                cell.sort(key=lambda f: 0 if is_sein(f) == (first == "sein") else 1)


def main():
    print("Leyendo tablas de conjugación…", file=sys.stderr)
    verbs = load_tables()
    print(f"  {len(verbs)} verbos", file=sys.stderr)
    meanings = load_meanings()
    print(f"  significados en español: {sum(1 for w in verbs if w in meanings)}", file=sys.stderr)
    print("Indexando frases de Tatoeba…", file=sys.stderr)
    sents, index = load_tatoeba()
    print(f"  {len(sents)} pares alemán–español", file=sys.stderr)

    os.makedirs(os.path.join(OUT, "b"), exist_ok=True)
    buckets = collections.defaultdict(dict)
    idx_rows = []
    n_ex = 0
    for w in sorted(verbs, key=lambda x: x.lower()):
        v = verbs[w]
        order_aux(v, sents, index)
        used = set()
        ex = {}
        for key, _, _ in TENSES:
            row = []
            for pi, cell in enumerate(v["t"][key]):
                part = None
                if cell and v["sep"] and len(cell[0].split()) == 2 and key in SIMPLE:
                    part = cell[0].split()[1]
                e = find_example(cell[0], sents, index, PRON[pi], used, particle=part) if cell else None
                row.append(e)
            if any(row):
                ex[key] = row
                n_ex += sum(1 for e in row if e)
        for k in ("du", "ihr"):
            if v["imp"][k]:
                f0 = v["imp"][k][0]
                part = f0.split()[1] if v["sep"] and len(f0.split()) == 2 else None
                e = find_example(f0, sents, index, None, used, imperative=True, particle=part)
                if e:
                    ex["imp_" + k] = e
                    n_ex += 1
        if v["p2"]:
            e = find_example(v["p2"][0], sents, index, None, used)
            if e:
                ex["p2"] = e
                n_ex += 1
        b = zlib.crc32(w.encode("utf-8")) % N_BUCKETS
        es = meanings.get(w)
        if not es:  # grafías alternativas (suiza «ss», sin diéresis, arcaicas con «y»)
            for alt in (w.replace("ss", "ß"), w.replace("ue", "ü").replace("ae", "ä").replace("oe", "ö"),
                        w.replace("y", "i"), w.replace("th", "t")):
                if alt != w and meanings.get(alt):
                    es = meanings[alt]
                    break
        entry = {
            "t": {k: [" / ".join(c) if c else "" for c in rows] for k, rows in v["t"].items()},
            "imp": {k: " / ".join(x) for k, x in v["imp"].items() if x},
            "aux": v["aux"],
            "p1": v["p1"][:1],
            "p2": v["p2"][:2],
            "zu": v["zu"][:1],
            "kind": v["kind"],
            "sep": v["sep"],
            "es": es or [],
            "en": [] if es else v["en"],
        }
        if ex:
            entry["ex"] = ex
        buckets[b][w] = entry
        short = ", ".join((es or v["en"] or [])[:2])
        cnt = lambda form: len(index.get(tokens(form)[0], [])) if form and tokens(form) else 0
        first = lambda key: (v["t"][key][2][0] if v["t"][key][2] else "")
        if v["sep"]:
            freq = max(cnt(w), cnt(v["p2"][0] if v["p2"] else ""))
        else:
            # el infinitivo choca con sustantivos/adjetivos («einen», «weißen»): lo
            # acotamos con las formas conjugadas
            conj = max(cnt(first("ind_pres")), cnt(first("ind_prat")), cnt(v["p2"][0] if v["p2"] else ""))
            freq = min(cnt(w), conj)
        if w != w.lower() or any(x in w for x in ("ss", "ue", "y")) and not es:
            freq = freq // 4
        idx_rows.append([w, short, "/".join(v["aux"]), v["kind"] or "", b, freq, 1 if es else 0])

    for b, data in buckets.items():
        with open(os.path.join(OUT, "b", f"{b}.json"), "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    with open(os.path.join(OUT, "index.json"), "w", encoding="utf-8") as f:
        json.dump(idx_rows, f, ensure_ascii=False, separators=(",", ":"))
    print(f"OK: {len(idx_rows)} verbos · {n_ex} ejemplos · {len(buckets)} ficheros", file=sys.stderr)


if __name__ == "__main__":
    main()
