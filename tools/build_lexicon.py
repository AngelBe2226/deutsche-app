"""Genera frontend/public/lex.json: el diccionario de las palabras de la app.

Para cada forma alemana que aparece en el contenido (ver lex_tokens.py):
  - lema, categoría, significado en español, género/plural/genitivo
    (sustantivos), comparativo/superlativo (adjetivos);
  - una descripción de la forma: «Präteritum · ich/er», «dativo plural»…

Fuentes (tools/.cache):
  en-<pos>.jsonl     Wiktionary inglés (kaikki), filtrado con filter_enwikt.py:
                     morfología, género, formas flexionadas.
  dewikt-<pos>.json  Wiktionary alemán: traducciones al español.
  es-aleman.jsonl    Wiktionary español.
  ../verbs_es.json, ../lex_es.json   significados revisados a mano (prioridad).
  ../../frontend/public/verbs        datos del Conjugador (formas verbales).
"""
import glob, json, os, re, sys, collections

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lex_tokens  # noqa: E402
from lex_core import BLOCK, CORE  # noqa: E402

CACHE = os.path.join(HERE, ".cache")
PUBLIC = os.path.join(HERE, "..", "frontend", "public")
POSES = ["noun", "adj", "adv", "prep", "pron", "det", "article", "conj", "num", "particle", "intj", "contraction", "name"]
# Prioridad al mostrar varias entradas para la misma forma
POS_RANK = {"article": 0, "det": 1, "pron": 2, "prep": 3, "contraction": 3, "conj": 4, "particle": 5,
            "adv": 6, "verb": 7, "noun": 7, "adj": 8, "num": 9, "intj": 10, "name": 11}

TENSE_DE = {
    "ind_pres": "Präsens", "ind_prat": "Präteritum", "k1_pres": "Konjunktiv I",
    "k2_prat": "Konjunktiv II",
}
PERS = ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"]

CASE_ES = {"nominative": "nominativo", "accusative": "acusativo", "dative": "dativo", "genitive": "genitivo"}
NUM_ES = {"singular": "singular", "plural": "plural"}
GEN_ES = {"masculine": "masc.", "feminine": "fem.", "neuter": "neutro"}
DECL_ES = {"strong": "fuerte", "weak": "débil", "mixed": "mixta"}


def tags_es(tags):
    tags = set(tags)
    out = []
    if "comparative" in tags:
        out.append("comparativo")
    if "superlative" in tags:
        out.append("superlativo")
    for k, v in DECL_ES.items():
        if k in tags and ("nominative" in tags or "accusative" in tags or "dative" in tags or "genitive" in tags):
            out.append("declinación " + v)
            break
    out += [v for k, v in CASE_ES.items() if k in tags]
    out += [v for k, v in GEN_ES.items() if k in tags]
    out += [v for k, v in NUM_ES.items() if k in tags]
    if "diminutive" in tags:
        out.append("diminutivo")
    return " ".join(out)


def read_jsonl(path):
    if not os.path.exists(path):
        return
    with open(path, encoding="utf-8") as f:
        for line in f:
            try:
                yield json.loads(line)
            except Exception:
                pass


def load_spanish():
    """{(lema, pos): [es...]} y {lema: [es...]} como respaldo sin categoría."""
    by_pos, by_word = {}, {}
    for p in glob.glob(os.path.join(CACHE, "dewikt-*.json")):
        pos = os.path.basename(p)[7:-5]
        try:
            d = json.load(open(p, encoding="utf-8"))
        except Exception:
            continue
        for w, e in d.items():
            es = [x for x in e.get("es", []) if len(x) < 40][:4]
            if es:
                by_pos.setdefault((w, pos), es)
                by_word.setdefault(w, es)
    for d in read_jsonl(os.path.join(CACHE, "es-aleman.jsonl")):
        gl = []
        for s in d.get("senses", []):
            for g in s.get("glosses", []) or []:
                g = g.strip().rstrip(".")
                if g and len(g) < 50:
                    gl.append(g[0].lower() + g[1:])
        if gl:
            by_pos.setdefault((d["word"], d.get("pos")), gl[:3])
            by_word.setdefault(d["word"], gl[:3])
    manual = {}
    for name in ("verbs_es.json", "lex_es.json"):
        p = os.path.join(HERE, name)
        if os.path.exists(p):
            for k, v in json.load(open(p, encoding="utf-8")).items():
                manual[k] = v if isinstance(v, list) else [v]
    return by_pos, by_word, manual


def parse_head(head, word):
    """'Haus n (strong, genitive Hauses, plural Häuser)' → g, gen, pl."""
    g = gen = pl = None
    if not head:
        return g, gen, pl
    m = re.match(re.escape(word) + r"\s+(m|f|n)\b", head)
    if m:
        g = m.group(1)
    m = re.search(r"genitive ([^,()]+?)(?: or [^,()]+)?(?:,|\))", head)
    if m:
        gen = m.group(1).strip()
    m = re.search(r"plural ([^,()]+?)(?: or [^,()]+)?(?:,|\))", head)
    if m:
        pl = m.group(1).strip()
    if pl and ("no plural" in head or pl.startswith("only")):
        pl = None
    return g, gen, pl


def main():
    forms_set = set(json.load(open(os.path.join(CACHE, "lex_forms.json"), encoding="utf-8")))
    by_pos, by_word, manual = load_spanish()

    lemmas = {}  # id -> entry
    form_map = collections.defaultdict(dict)  # form -> {id: (rank, desc)}

    def es_for(word, pos):
        key = f"{word}|{pos}"
        if key in manual:
            return manual[key]
        if word in manual and pos != "verb":
            return manual[word]
        return by_pos.get((word, pos)) or by_word.get(word) or []

    def add(form, lid, rank, desc=""):
        f = form.lower()
        if f not in forms_set:
            return
        cur = form_map[f].get(lid)
        if cur is None or rank < cur[0]:
            form_map[f][lid] = (rank, desc)

    # ---------- Verbos (datos del Conjugador) ----------
    vidx = json.load(open(os.path.join(PUBLIC, "verbs", "index.json"), encoding="utf-8"))
    vrow = {r[0]: r for r in vidx}
    buckets = {}
    for lemma, row in vrow.items():
        if row[5] < 3 and lemma.lower() not in forms_set:
            continue  # verbos rarísimos: solo si el propio infinitivo aparece
        b = row[4]
        if b not in buckets:
            buckets[b] = json.load(open(os.path.join(PUBLIC, "verbs", "b", f"{b}.json"), encoding="utf-8"))
        v = buckets[b][lemma]
        lid = lemma + "|verb"
        # rango: los verbos frecuentes antes; los raros (p. ej. «einen» = unir) al final
        base = 2 if row[5] >= 50 else 5 if row[5] >= 5 else 9
        hits = collections.defaultdict(list)
        for key, label in ([] if v.get("sep") else TENSE_DE.items()):
            for i, cell in enumerate(v["t"].get(key, [])):
                for alt in cell.split(" / "):
                    parts = alt.split()
                    if parts:
                        hits[parts[0].lower()].append((label, PERS[i]))
        for k in ([] if v.get("sep") else ("du", "ihr")):
            for alt in v.get("imp", {}).get(k, "").split(" / "):
                if alt:
                    hits[alt.split()[0].lower()].append(("Imperativ", k))
        if lemma.lower() in forms_set:
            add(lemma, lid, base - 1, "infinitivo")
        for p2 in v.get("p2", []):
            add(p2, lid, base, "participio (Partizip II)")
        for p1 in v.get("p1", []):
            add(p1, lid, base + 1, "participio de presente")
        for z in v.get("zu", []):
            add(z, lid, base, "infinitivo con zu")
        if v.get("sep"):
            # verbo separable: en subordinada se escribe junto («…, dass er ankommt»)
            for key, label in TENSE_DE.items():
                for i, cell in enumerate(v["t"].get(key, [])):
                    for alt in cell.split(" / "):
                        parts = alt.split()
                        if len(parts) == 2:
                            hits[(parts[1] + parts[0]).lower()].append((label + " (subordinada)", PERS[i]))
            p2 = (v.get("p2") or [""])[0]
            m = re.match(r"(.+?)ge(.+)$", p2) if p2 else None
            if m and lemma.startswith(m.group(1)):
                add(m.group(1) + "zu" + lemma[len(m.group(1)):], lid, base, "infinitivo con zu")
        for f, hs in hits.items():
            if f not in forms_set:
                continue
            by_t = collections.OrderedDict()
            for t, p in hs:
                by_t.setdefault(t, [])
                if p not in by_t[t]:
                    by_t[t].append(p)
            desc = " · ".join(f"{t}: {'/'.join(ps)}" for t, ps in list(by_t.items())[:2])
            add(f, lid, base, desc)
        if any(lid in form_map[f] for f in form_map):
            pass
        lemmas[lid] = {"w": lemma, "pos": "verb", "es": es_for(lemma, "verb") or (row[1].split(", ") if row[1] else [])}

    # ---------- Resto de categorías (Wiktionary inglés) ----------
    for pos in POSES:
        for d in read_jsonl(os.path.join(CACHE, f"en-{pos}.jsonl")):
            w = d["word"]
            if " " in w:
                continue
            senses = d.get("senses", [])
            form_of = [fo.get("word") for s in senses for fo in s.get("form_of", []) if fo.get("word")]
            only_form = senses and all(s.get("form_of") for s in senses)
            if only_form:
                # «Häuser»: plural de Haus → apunta al lema
                for s in senses:
                    for fo in s.get("form_of", []):
                        target = fo.get("word")
                        if not target or " " in target:
                            continue
                        lid = f"{target}|{pos}"
                        lemmas.setdefault(lid, {"w": target, "pos": pos})
                        add(w, lid, POS_RANK.get(pos, 9) + 1, tags_es(s.get("tags", [])))
                continue
            lid = f"{w}|{pos}"
            e = lemmas.setdefault(lid, {"w": w, "pos": pos})
            gl = []
            for s in senses:
                for g in s.get("glosses", []) or []:
                    g = re.split(r"\s*[;(]", g)[0].strip()[:70]
                    if g and g not in gl:
                        gl.append(g)
            if not e.get("en"):
                e["en"] = gl[:3]
            if pos == "noun":
                g, gen, pl = parse_head((d.get("head") or [None])[0], w)
                stags = {t for s in senses for t in s.get("tags", [])}
                if not g:
                    g = "m" if "masculine" in stags else "f" if "feminine" in stags else "n" if "neuter" in stags else None
                for fo in d.get("forms", []):
                    t = set(fo.get("tags", []))
                    if not gen and t == {"genitive"}:
                        gen = fo["form"]
                    if not pl and (t == {"plural"} or t == {"nominative", "plural"}):
                        pl = fo["form"]
                if g:
                    e["g"] = g
                if gen:
                    e["gen"] = gen
                if pl:
                    e["pl"] = pl
            if pos == "adj":
                for fo in d.get("forms", []):
                    t = fo.get("tags", [])
                    if t == ["comparative"] and "cmp" not in e:
                        e["cmp"] = fo["form"]
                    if t == ["superlative"] and "sup" not in e:
                        e["sup"] = fo["form"].replace("am ", "")
            add(w, lid, POS_RANK.get(pos, 9))
            for fo in d.get("forms", []):
                f = fo.get("form") or ""
                if " " in f or f == w:
                    continue
                add(f, lid, POS_RANK.get(pos, 9) + 1, tags_es(fo.get("tags", [])))

    # Lemas bloqueados
    for f in list(form_map):
        for lid in list(form_map[f]):
            if lid in BLOCK or (lemmas.get(lid, {}).get("en") or [""])[0].startswith("nominalization of"):
                del form_map[f][lid]
        if not form_map[f]:
            del form_map[f]

    # Sustantivos basura: siglas y letras sueltas («AB», «A») que chocan con
    # palabras corrientes a principio de frase.
    for f in list(form_map):
        for lid in list(form_map[f]):
            e = lemmas.get(lid, {})
            w = e.get("w", "")
            if e.get("pos") in ("noun", "name") and (len(w) <= 2 or w.isupper()):
                del form_map[f][lid]
        if not form_map[f]:
            del form_map[f]

    # Significados en español
    for lid, e in lemmas.items():
        if e["pos"] != "verb":
            e["es"] = es_for(e["w"], e["pos"])
        e["es"] = list(dict.fromkeys(e.get("es") or []))
        if e.get("es"):
            e.pop("en", None)

    # Compuestos que no están en el diccionario: Abreise|tag, Arbeits|klima
    def noun_of(f):
        for lid in form_map.get(f, {}):
            if lemmas[lid]["pos"] == "noun" and lemmas[lid].get("es"):
                return lid
        return None

    def any_of(f):
        for lid in form_map.get(f, {}):
            if lemmas[lid].get("es"):
                return lid
        return None

    caps = json.load(open(os.path.join(CACHE, "lex_caps.json"), encoding="utf-8"))
    n_cmp = 0
    for f in sorted(forms_set - set(form_map)):
        if not caps.get(f) or len(f) < 7 or "-" in f:
            continue
        best = None
        for i in range(3, len(f) - 2):
            head = noun_of(f[i:])
            if not head:
                continue
            mod = f[:i]
            for cand in (mod, mod[:-1] if mod.endswith("s") else None, mod[:-1] if mod.endswith("n") else None,
                         mod[:-2] if mod.endswith("en") else None, mod + "en", mod + "e"):
                if cand and len(cand) >= 3 and any_of(cand):
                    best = (any_of(cand), head)
                    break
            if best:
                break
        if not best:
            continue
        mid, hid = best
        hm, mm = lemmas[hid], lemmas[mid]
        lid = f"{caps[f]}|noun"
        lemmas[lid] = {"w": caps[f], "pos": "noun", "g": hm.get("g"),
                       "es": [f"{hm['es'][0]} (de {mm['es'][0]})"],
                       "parts": [mm["w"], hm["w"]]}
        form_map[f][lid] = (7, f"compuesto: {mm['w']} + {hm['w']}")
        n_cmp += 1
    print(f"compuestos deducidos: {n_cmp}", file=sys.stderr)

    # Salida: solo lemas usados; máx. 3 entradas por forma
    out_forms = {}
    used = set()
    for f, cands in form_map.items():
        items = sorted(cands.items(), key=lambda kv: (kv[1][0], kv[0]))
        # sin significado ni datos útiles → al final
        items.sort(key=lambda kv: 0 if (lemmas[kv[0]].get("es") or lemmas[kv[0]].get("en")) else 1)
        items = [kv for kv in items if lemmas[kv[0]].get("es") or lemmas[kv[0]].get("en") or kv[1][1]]
        if not items:
            continue
        row = []
        for lid, (rank, desc) in items[:3]:
            row.append([lid, desc] if desc else [lid])
            used.add(lid)
        out_forms[f] = row
    out_lemmas = {lid: {k: v for k, v in lemmas[lid].items() if v} for lid in used}

    # Diccionario base revisado a mano: sustituye a lo automático
    core_ids = {}
    for f, entries in CORE.items():
        if f not in forms_set:
            continue
        row = []
        for lemma, pos, es, desc in entries:
            key = (lemma, pos, es)
            if key not in core_ids:
                core_ids[key] = f"{lemma}|{pos}|c{len(core_ids)}"
            lid = core_ids[key]
            out_lemmas[lid] = {"w": lemma, "pos": pos, "es": [es]}
            row.append([lid, desc] if desc else [lid])
        # conserva la entrada verbal automática si existe (p. ej. «sein» verbo)
        for r in out_forms.get(f, []):
            if out_lemmas.get(r[0], {}).get("pos") == "verb" and len(row) < 3:
                row.append(r)
        out_forms[f] = row
    used = {r[0] for rows in out_forms.values() for r in rows}
    out_lemmas = {k: v for k, v in out_lemmas.items() if k in used}

    missing_forms = sorted(forms_set - set(out_forms))
    no_meaning = sorted({l["w"] + "|" + l["pos"] for l in out_lemmas.values() if not l.get("es")})
    json.dump({"forms": out_forms, "lemmas": out_lemmas},
              open(os.path.join(PUBLIC, "lex.json"), "w", encoding="utf-8"),
              ensure_ascii=False, separators=(",", ":"))
    json.dump({"missing_forms": missing_forms, "no_spanish": no_meaning},
              open(os.path.join(CACHE, "lex_gaps.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(f"formas: {len(out_forms)}/{len(forms_set)} · lemas: {len(out_lemmas)} · "
          f"sin español: {len(no_meaning)} · sin entrada: {len(missing_forms)}", file=sys.stderr)


if __name__ == "__main__":
    main()
