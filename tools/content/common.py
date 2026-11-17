"""Ayudas para escribir bloques de contenido en Python (formato de la app)."""
import json, os

CONTENT = os.path.join(os.path.dirname(__file__), "..", "..", "backend", "app", "content")


def q(id, question, options, correct, explain):
    return {"id": id, "question": question, "options": options, "correctIndex": correct, "explain": explain}


def vocab(id, items):
    """items: lista de (de, es) o (de, es, plural)."""
    out = []
    for it in items:
        d = {"de": it[0], "es": it[1]}
        if len(it) > 2 and it[2]:
            d["pl"] = it[2]
        out.append(d)
    return {"id": id, "items": out}


VOCAB_RULE = ("Aprende cada sustantivo <b>con su artículo</b> (<span class=\"g-m\"><b>der</b></span> · "
              "<span class=\"g-f\"><b>die</b></span> · <span class=\"g-n\"><b>das</b></span>) y su plural. "
              "Usa el <b>modo eco</b> para repetir en voz alta y luego <b>Ocultar español</b> para ponerte a prueba.")


def table(headers, rows):
    return [{"headers": headers, "rows": rows}]


def dialog(id, setting, roles, lines):
    """roles: {"A": ("Nombre", "Etiqueta")}; lines: [(who, de, es)]"""
    return {"id": id, "setting": setting,
            "roles": {k: {"name": v[0], "label": v[1]} for k, v in roles.items()},
            "lines": [{"who": w, "de": de, "es": es} for w, de, es in lines]}


def roleplay(id, partner, label, steps):
    """steps: [(partner_de, partner_es, task, model)]"""
    return {"id": id, "you": "Tú", "partner": {"name": partner, "label": label},
            "steps": [{"partner": p, "es": e, "task": t, "model": m} for p, e, t, m in steps]}


def examples(pairs):
    return [{"en": de, "es": es} for de, es in pairs]


def note(type, text):
    return {"type": type, "at": "end", "text": text}


def write(block):
    path = os.path.join(CONTENT, f"block_{block['block']}.json")
    json.dump(block, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    n = sum(len(s.get("quiz") or []) for s in block["sections"])
    print(f"bloque {block['block']}: {len(block['sections'])} secciones, {n} quizzes")
