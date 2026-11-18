// Datos del Conjugador: índice de lemas + tablas repartidas en 256 ficheros
// (frontend/public/verbs/, generados con tools/build_verbs.py).
const BASE = (import.meta.env && import.meta.env.BASE_URL) || "/";

let indexPromise = null;
const bucketCache = new Map();

// Fila del índice: [lema, significado, aux, tipo, bucket, frecuencia, tieneEs]
export function loadVerbIndex() {
  if (!indexPromise) {
    indexPromise = fetch(`${BASE}verbs/index.json`)
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((rows) => {
        const byLemma = new Map(rows.map((r) => [r[0], r]));
        const byFreq = [...rows].sort((a, b) => b[5] - a[5]);
        return { rows, byLemma, byFreq };
      })
      .catch((e) => {
        indexPromise = null;
        throw e;
      });
  }
  return indexPromise;
}

export async function loadVerb(lemma) {
  const idx = await loadVerbIndex();
  const row = idx.byLemma.get(lemma);
  if (!row) return null;
  const b = row[4];
  if (!bucketCache.has(b)) {
    bucketCache.set(
      b,
      fetch(`${BASE}verbs/b/${b}.json`)
        .then((r) => r.json())
        .catch((e) => {
          bucketCache.delete(b);
          throw e;
        })
    );
  }
  const data = await bucketCache.get(b);
  return data[lemma] ? { lemma, row, ...data[lemma] } : null;
}

// Quita acentos/diéresis para buscar sin teclado alemán: «mussen» → müssen.
export function fold(s) {
  return s
    .toLowerCase()
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function searchVerbs(idx, q, limit = 60) {
  const f = fold(q.trim());
  if (!f) return idx.byFreq.slice(0, limit);
  const starts = [];
  const contains = [];
  const meaning = [];
  for (const r of idx.byFreq) {
    const l = fold(r[0]);
    if (l.startsWith(f)) starts.push(r);
    else if (f.length >= 3 && l.includes(f)) contains.push(r);
    else if (f.length >= 3 && fold(r[1]).split(/[ ,()]+/).some((w) => w.startsWith(f))) meaning.push(r);
    if (starts.length >= limit) break;
  }
  return [...starts, ...contains, ...meaning].slice(0, limit);
}

// Bus mínimo para abrir un verbo desde cualquier parte (p. ej. desde el
// tooltip de una palabra): App escucha y cambia a la vista del Conjugador.
const listeners = new Set();
export function openVerb(lemma) {
  listeners.forEach((fn) => fn(lemma));
}
export function onOpenVerb(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ---------- Estructura de la tabla ----------

export const PERSONS = ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"];
const SUBJ = ["Ich", "Du", "Er", "Wir", "Ihr", "Sie"];

export const MOODS = [
  {
    key: "ind",
    label: "Indikativ",
    es: "Indicativo",
    tenses: [
      { key: "ind_pres", de: "Präsens", es: "Presente", hint: "Lo que pasa ahora o habitualmente; también futuro cercano.", adv: "heute" },
      { key: "ind_prat", de: "Präteritum", es: "Pretérito (simple)", hint: "Pasado narrativo, sobre todo por escrito. En la lengua hablada solo con sein, haben y modales.", adv: "gestern" },
      { key: "ind_perf", de: "Perfekt", es: "Pretérito perfecto", hint: "El pasado de la conversación: haben/sein + participio al final.", adv: "gestern" },
      { key: "ind_plusq", de: "Plusquamperfekt", es: "Pluscuamperfecto", hint: "Pasado anterior a otro pasado: hatte/war + participio.", adv: "vorher" },
      { key: "ind_fut1", de: "Futur I", es: "Futuro", hint: "Planes, predicciones o suposiciones: werden + infinitivo.", adv: "morgen" },
      { key: "ind_fut2", de: "Futur II", es: "Futuro perfecto", hint: "Algo que habrá terminado, o suposición sobre el pasado.", adv: "bis morgen" },
    ],
  },
  {
    key: "k1",
    label: "Konjunktiv I",
    es: "Subjuntivo I",
    note: "Sobre todo para el estilo indirecto (noticias, informes): «Er sagt, er sei krank».",
    tenses: [
      { key: "k1_pres", de: "Konjunktiv I Präsens", es: "Estilo indirecto · presente", hint: "Repetir lo que otro dice, en presente.", frame: "Man sagt, ", adv: "heute" },
      { key: "k1_perf", de: "Konjunktiv I Perfekt", es: "Estilo indirecto · pasado", hint: "Repetir lo que otro dice sobre el pasado.", frame: "Man sagt, ", adv: "gestern" },
      { key: "k1_fut1", de: "Konjunktiv I Futur I", es: "Estilo indirecto · futuro", hint: "Repetir lo que otro dice sobre el futuro.", frame: "Man sagt, ", adv: "morgen" },
      { key: "k1_fut2", de: "Konjunktiv I Futur II", es: "Estilo indirecto · futuro perfecto", hint: "Poco frecuente; registro formal.", frame: "Man sagt, ", adv: "bis morgen" },
    ],
  },
  {
    key: "k2",
    label: "Konjunktiv II",
    es: "Subjuntivo II",
    note: "Deseos, hipótesis y cortesía: «Ich hätte gern…», «Wenn ich Zeit hätte…».",
    tenses: [
      { key: "k2_prat", de: "Konjunktiv II Präteritum", es: "Condicional / irreal", hint: "Forma propia del verbo (ginge, hätte, wäre). Con verbos regulares se prefiere «würde + infinitivo».", adv: "gern" },
      { key: "k2_fut1", de: "würde + Infinitiv", es: "Condicional (habitual)", hint: "La forma más usada para el condicional: «haría».", adv: "gern" },
      { key: "k2_plusq", de: "Konjunktiv II Plusquamperfekt", es: "Condicional compuesto", hint: "Lo que habría pasado (pero no pasó): hätte/wäre + participio.", adv: "gern" },
      { key: "k2_fut2", de: "würde + Infinitiv Perfekt", es: "Condicional compuesto (würde)", hint: "Variante menos frecuente del anterior.", adv: "gern" },
    ],
  },
];

// Frase modelo para una forma sin ejemplo real: sujeto + forma con el
// adverbio tras el verbo conjugado (así el prefijo separable y el participio
// quedan al final, como en alemán: «Ich stehe heute auf», «Ich bin gestern
// gegangen»).
export function modelSentence(form, personIdx, tense) {
  const f = form.split(" / ")[0];
  const parts = f.split(" ");
  const adv = tense.adv;
  let subj = SUBJ[personIdx];
  if (tense.frame) subj = subj === "Ich" ? "ich" : subj.toLowerCase();
  const body = [parts[0], adv, ...parts.slice(1)].join(" ");
  return (tense.frame || "") + subj + " " + body + ".";
}

export function imperativeSentence(form, kind) {
  const f = form.split(" / ")[0];
  const parts = f.split(" ");
  const head = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  return [head, ...(kind === "Sie" ? ["Sie"] : []), "bitte", ...parts.slice(1)].join(" ") + "!";
}

// Lo que dice el botón 🔊 de una fila: pronombre + forma principal
// («er/sie/es» → «er geht»). En el imperativo, la forma ya va completa.
export function rowSpeech(person, form, imp = false) {
  const main = form.split(" / ")[0];
  if (imp) return main.charAt(0).toUpperCase() + main.slice(1) + "!";
  if (/usted|\(/.test(person) || /^[A-ZÄÖÜ]/.test(main)) return main;
  return `${person.split("/")[0]} ${main}`;
}

// Formas principales leídas seguidas: «sprechen, sprach, hat gesprochen»
export function partsSpeech(verb) {
  const prat = (verb.t.ind_prat?.[2] || "").split(" / ")[0];
  const p2 = verb.p2?.[0];
  const aux = verb.aux?.[0] === "sein" ? "ist" : "hat";
  return [verb.lemma, prat, p2 && `${aux} ${p2}`].filter(Boolean).join(", ");
}
