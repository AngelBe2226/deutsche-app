// Reúne todo lo que la app puede leer en voz alta, con las MISMAS funciones
// que usa al reproducir (audio/texts.js, verbs.js, data/builder.js), así cada
// texto llega a la misma clave de audio. Ordenado por prioridad:
//   1 lecciones  · ejemplos, diálogos, lecturas, Rollenspiel, filas de tablas,
//                  frases de los quizzes, Syntax, vocabulario, Redewendungen,
//                  fábrica de frases
//   2 palabras   · cada palabra del diccionario de los tooltips (formas y lemas)
//   3 verbos     · infinitivo, formas principales y ejemplos del Indikativ
//   4 verbos+    · ejemplos de Konjunktiv I/II e imperativo
//   5 tablas     · cada fila de cada tabla («ich gehe», «Geh!»)
// Los verbos van ordenados por frecuencia; --verbs N limita a los N primeros.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SRC = path.join(ROOT, "frontend/src");
const PUB = path.join(ROOT, "frontend/public");
const CONTENT = path.join(ROOT, "backend/app/content");

const { normText, audioKey } = await import(path.join(SRC, "audio/key.js"));
const T = await import(path.join(SRC, "audio/texts.js"));
const V = await import(path.join(SRC, "verbs.js"));
const { allSentences } = await import(path.join(SRC, "data/builder.js"));
const { IDIOMS } = await import(path.join(SRC, "data/idioms.js"));

// Archivos de los que sale el audio: si no cambian, no hay nada nuevo.
export function inputFiles() {
  const list = fs.readdirSync(CONTENT).filter((f) => f.endsWith(".json")).map((f) => path.join(CONTENT, f));
  list.push(path.join(PUB, "lex.json"), path.join(PUB, "verbs/index.json"));
  for (const f of ["audio/key.js", "audio/texts.js", "verbs.js", "data/builder.js", "data/idioms.js"]) list.push(path.join(SRC, f));
  return list.sort();
}

export function collect({ maxVerbs = Infinity } = {}) {
  const items = new Map(); // key → { key, text, phase }
  const add = (raw, phase) => {
    const text = normText(raw);
    if (!text || !/[A-Za-zÄÖÜäöüß]/.test(text)) return;
    const key = audioKey(text);
    const prev = items.get(key);
    if (!prev || prev.phase > phase) items.set(key, { key, text, phase });
  };

  // ---- 1 · lecciones ----
  for (const f of fs.readdirSync(CONTENT).filter((f) => /^block_\d+\.json$/.test(f)).sort()) {
    const b = JSON.parse(fs.readFileSync(path.join(CONTENT, f), "utf8"));
    for (const s of b.sections || []) {
      for (const ex of s.examples || []) add(T.plainText(ex.en), 1);
      for (const l of s.dialog?.lines || []) add(T.plainText(l.de), 1);
      if (s.reading) add(T.readingSpeech(s.reading), 1);
      for (const st of s.roleplay?.steps || []) add(T.plainText(st.partner), 1), add(T.plainText(st.model), 1);
      for (const t of s.tables || []) for (const row of t.rows || []) add(T.tableRowSpeech(t.headers, row), 1);
      for (const q of s.quiz || []) add(T.quizSentence(q.question, q.options[q.correctIndex]), 1);
      for (const x of [...(s.syntax?.sentences || []), ...(s.syntax?.exercises || [])]) add(x.de, 1);
      for (const it of s.vocab?.items || []) add(it.de, 1);
    }
  }
  for (const [, idiom] of IDIOMS) add(idiom, 1);
  for (const sent of allSentences()) add(sent, 1);

  // ---- 2 · palabras (tooltips) ----
  const lex = JSON.parse(fs.readFileSync(path.join(PUB, "lex.json"), "utf8"));
  for (const form of Object.keys(lex.forms)) add(form, 2);
  for (const e of Object.values(lex.lemmas)) if (!/…/.test(e.w)) add(e.w, 2);

  // ---- 3, 4, 5 · verbos ----
  const index = JSON.parse(fs.readFileSync(path.join(PUB, "verbs/index.json"), "utf8"));
  index.sort((a, b) => b[5] - a[5]);
  const buckets = new Map();
  const bucket = (n) => {
    if (!buckets.has(n)) buckets.set(n, JSON.parse(fs.readFileSync(path.join(PUB, `verbs/b/${n}.json`), "utf8")));
    return buckets.get(n);
  };
  let count = 0;
  for (const row of index) {
    if (count++ >= maxVerbs) break;
    const data = bucket(row[4])[row[0]];
    if (!data) continue;
    const verb = { lemma: row[0], row, ...data };
    const ex = verb.ex || {};
    add(verb.lemma, 3);
    add(V.partsSpeech(verb), 3);
    if (ex.p2) add(ex.p2[0], 3);
    for (const mood of V.MOODS) {
      const phase = mood.key === "ind" ? 3 : 4;
      for (const tn of mood.tenses) {
        (verb.t[tn.key] || []).forEach((form, i) => {
          if (!form) return;
          const real = ex[tn.key]?.[i];
          add(real ? real[0] : V.modelSentence(form, i, tn), phase);
          add(V.rowSpeech(V.PERSONS[i], form), 5);
        });
      }
    }
    const sieImp = (verb.t.ind_pres?.[5] || "").split(" / ")[0];
    for (const [who, form, e] of [["du", verb.imp?.du, ex.imp_du], ["ihr", verb.imp?.ihr, ex.imp_ihr], ["Sie", sieImp, null]]) {
      if (!form) continue;
      add(e ? e[0] : V.imperativeSentence(form, who), 4);
      add(V.rowSpeech(who === "Sie" ? "Sie (usted)" : who, who === "Sie" ? form.replace(/^(\S+)/, "$1 Sie") : form, true), 5);
    }
  }
  return [...items.values()].sort((a, b) => a.phase - b.phase);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const all = collect();
  const by = {};
  for (const it of all) (by[it.phase] ||= { audios: 0, caracteres: 0 }), by[it.phase].audios++, (by[it.phase].caracteres += it.text.length);
  console.log(by, "total", all.length);
}
