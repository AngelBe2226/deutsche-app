# Datos generados

El Conjugador (`frontend/public/verbs/`) y el diccionario de los tooltips
(`frontend/public/lex.json`) se generan con estos scripts. Las fuentes en
bruto van a `tools/.cache/` (ignorada por git; pesa varios GB).

## Fuentes

| Fichero en `.cache/` | Origen | Licencia |
| --- | --- | --- |
| `de-verbs.jsonl` | kaikki.org, Wiktionary inglés, verbos alemanes | CC BY-SA 4.0 |
| `en-<pos>.jsonl` | kaikki.org, Wiktionary inglés por categoría, filtrado con `filter_enwikt.py` | CC BY-SA 4.0 |
| `dewikt-<pos>.json` | kaikki.org, Wiktionary alemán, extraído con `extract_dewikt.py` (traducciones al español) | CC BY-SA 4.0 |
| `es-aleman.jsonl` | kaikki.org, Wiktionary español, sección «Alemán» | CC BY-SA 4.0 |
| `deu_sentences.tsv.bz2`, `spa_sentences.tsv.bz2`, `deu-spa_links.tsv.bz2` | tatoeba.org | CC BY 2.0 FR |

Descarga (desde `tools/.cache/`):

```bash
curl -L -o de-verbs.jsonl https://kaikki.org/dictionary/German/pos-verb/kaikki.org-dictionary-German-by-pos-verb.jsonl
for p in noun adj adv prep pron det article conj num particle intj contraction name; do curl -sL "https://kaikki.org/dictionary/German/pos-$p/kaikki.org-dictionary-German-by-pos-$p.jsonl" | python3 ../filter_enwikt.py lex_forms.json > en-$p.jsonl; done
for p in verb noun adj adv prep pron conj det num intj particle; do curl -sfL "https://kaikki.org/dewiktionary/Deutsch/pos-$p/kaikki.org-dictionary-Deutsch-by-pos-$p.jsonl" | python3 ../extract_dewikt.py > dewikt-$p.json; done
```

## Orden

1. `python3 tools/build_verbs.py`: tablas de ~9.300 verbos y ejemplos de Tatoeba.
   Los significados revisados a mano están en `verbs_es.json`.
2. `python3 tools/lex_tokens.py`: recoge las formas alemanas del contenido
   (`.cache/lex_forms.json`). Hay que repetirlo cuando cambie el contenido.
3. `python3 tools/build_lexicon.py`: genera `lex.json`. Las palabras
   gramaticales (pronombres, artículos, preposiciones…) salen de
   `lex_core.py`, revisado a mano. Otros significados manuales: `lex_es.json`.
   Los huecos se listan en `.cache/lex_gaps.json`.

## Explicaciones de los quizzes

Cada quiz lleva un campo `explain`. Están redactadas en
`tools/explain/block_XX.json` (`{id: explicación}`) y se aplican con
`python3 tools/merge_explain.py`. `python3 tools/quiz_dump.py 05` vuelca los
quizzes de un bloque para redactarlas. Cuando añadas quizzes nuevos, añade su
explicación ahí.
