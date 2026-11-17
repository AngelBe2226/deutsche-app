// Pronunciación figurada «a la española»: reescribe una palabra alemana con
// letras y tildes del castellano para leerla en voz alta sin saber fonética.
//   Zimmer → tsíma · Buch → buj · gehen → guéen · ich → ish · Straße → shtrá:se
// Convenciones: tilde = sílaba tónica; «:» = vocal larga; «eo» ≈ ö, «iu» ≈ ü
// (dos vocales a la vez, labios redondeados); «sh» como en inglés; «j» como
// la jota española suave; «h» se aspira suave. Es una aproximación, no IPA.

const VOWELS = "aeiouäöüy";
const isV = (c) => !!c && VOWELS.includes(c);

// Prefijos átonos (el acento va a la sílaba siguiente)
const UNSTRESSED = ["miss", "zer", "ver", "ent", "emp", "be", "ge", "er"];
// Palabras que empiezan como esos prefijos pero no lo son
const NOT_PREFIX = new Set(["gehen", "geben", "gelb", "gestern", "gern", "gerne", "geld", "gegen", "gegend", "gelten",
  "erde", "ernst", "erst", "erste", "ersten", "erster", "ende", "ente", "bett", "berg", "bein", "beere", "besen",
  "beten", "beste", "besten", "bester", "best", "verb", "vers", "verse", "emma", "geh", "gebe", "geht", "gibt"]);
// Terminaciones que llevan el acento
const STRESSED_END = [
  ["ieren", 0], ["ierung", 0], ["erei", 2], ["ei", 0], ["tät", 1], ["ion", 1], ["ur", 0],
  ["ik", 0], ["ist", 0], ["ant", 0], ["ent", 0], ["ie", 0], ["ität", 2], ["ismus", 0], ["al", 0], ["ell", 0], ["eur", 1],
];

// Separa en «núcleos vocálicos» para saber cuál es la sílaba tónica.
function vowelGroups(w) {
  const groups = [];
  let i = 0;
  while (i < w.length) {
    if (isV(w[i]) && !(w[i] === "u" && w[i - 1] === "q")) {
      const start = i;
      const pair = w.slice(i, i + 2);
      if (["ei", "ey", "ai", "ay", "eu", "äu", "au", "ie", "aa", "ee", "oo"].includes(pair)) i += 2;
      else i += 1;
      groups.push([start, i]);
    } else i++;
  }
  return groups;
}

function stressedGroup(w, groups) {
  if (groups.length < 2) return -1;
  for (const [end, fromEnd] of STRESSED_END) {
    if (w.endsWith(end) && w.length > end.length + 2) {
      // grupo que contiene la vocal tónica de la terminación
      const pos = w.length - end.length;
      const inEnd = groups.map((g, i) => [g, i]).filter(([g]) => g[0] >= pos);
      if (inEnd.length) return inEnd[Math.min(fromEnd, inEnd.length - 1)][1];
    }
  }
  for (const p of UNSTRESSED) {
    if (NOT_PREFIX.has(w)) break;
    if (w.startsWith(p) && w.length > p.length + 2 && groups.length > 1) {
      const idx = groups.findIndex((g) => g[0] >= p.length);
      if (idx > 0) return idx;
    }
  }
  return 0;
}

const ACUTE = { a: "á", e: "é", i: "í", o: "ó", u: "ú" };

function figWord(word) {
  const w = word.toLowerCase();
  if (!/[a-zäöüß]/.test(w)) return word;
  const groups = vowelGroups(w);
  const stressG = stressedGroup(w, groups);
  const groupOf = (i) => groups.findIndex((g) => i >= g[0] && i < g[1]);
  let out = "";
  let accented = false;
  const n = w.length;
  const prev = (i) => (i > 0 ? w[i - 1] : "");
  const after = (i, k = 1) => w.slice(i + 1, i + 1 + k);
  const atStart = (i) => i === 0 || !/[a-zäöüß]/.test(w[i - 1]);

  // Añade una vocal (con tilde si es la tónica)
  const putV = (s, i) => {
    const g = groupOf(i);
    if (!accented && g === stressG && stressG >= 0) {
      accented = true;
      // tilde en la primera vocal acentuable del trozo
      const j = [...s].findIndex((c) => ACUTE[c]);
      if (j >= 0) s = s.slice(0, j) + ACUTE[s[j]] + s.slice(j + 1);
    }
    out += s;
  };

  for (let i = 0; i < n; ) {
    const c = w[i];
    const two = w.slice(i, i + 2);
    const three = w.slice(i, i + 3);
    const four = w.slice(i, i + 4);
    const end = i + 1 >= n;

    // --- vocales y diptongos ---
    if (isV(c)) {
      if (["ei", "ey", "ai", "ay"].includes(two)) { putV("ai", i); i += 2; continue; }
      if (two === "eu" || two === "äu") { putV("oi", i); i += 2; continue; }
      if (two === "au") { putV("au", i); i += 2; continue; }
      if (two === "ie") { putV("i:", i); i += 2; continue; }
      if (["aa", "ee", "oo"].includes(two)) { putV(c + ":", i); i += 2; continue; }
      let v = { ä: "e", ö: "eo", ü: "iu", y: end ? "i" : "iu" }[c] || c;
      if (w[i + 1] === "ß") { putV(v + ":", i); i += 1; continue; }
      // vocal + h + consonante/fin → vocal larga
      if (w[i + 1] === "h" && (i + 2 >= n || !isV(w[i + 2]))) { putV(v + ":", i); i += 2; continue; }
      // -er final o -er + consonante final átono → «a»
      if (c === "e" && w[i + 1] === "r" && (i + 2 === n || (i + 3 === n && "sn".includes(w[i + 2]))) && groupOf(i) !== stressG && groups.length > 1) {
        out += "a"; i += 2; continue;
      }
      putV(v, i); i += 1; continue;
    }

    // --- consonantes ---
    if (four === "tsch") { out += "ch"; i += 4; continue; }
    if (three === "sch") { out += "sh"; i += 3; continue; }
    if (three === "chs") { out += "ks"; i += 3; continue; }
    if (two === "ch") {
      const p = prev(i);
      if (atStart(i)) out += "k"; // Chor, Charakter (aprox.)
      else out += "aou".includes(p) || (p === "u" && w[i - 2] === "a") ? "j" : "sh";
      i += 2; continue;
    }
    if ((two === "sp" || two === "st") && atStart(i)) { out += "sh" + two[1]; i += 2; continue; }
    if (two === "ck") { out += "k"; i += 2; continue; }
    if (two === "dt") { out += "t"; i += 2; continue; }
    if (two === "tz") { out += "ts"; i += 2; continue; }
    if (two === "ph") { out += "f"; i += 2; continue; }
    if (two === "th") { out += "t"; i += 2; continue; }
    if (two === "qu") { out += "kv"; i += 2; continue; }
    if (two === "ng") { out += "ng"; i += 2; continue; }
    if (c === "ß") { out += "s"; i += 1; continue; }
    if (c === "z") { out += "ts"; i += 1; continue; }
    if (c === "w") { out += "v"; i += 1; continue; }
    if (c === "v") { out += "f"; i += 1; continue; }
    if (c === "j") { out += "y"; i += 1; continue; }
    if (c === "x") { out += "ks"; i += 1; continue; }
    if (c === "c") { out += "ei".includes(w[i + 1] || "") ? "ts" : "k"; i += 1; continue; }
    if (c === "h") {
      // h entre vocales o al inicio: aspirada suave; tras vocal ya se trató
      // entre vocales es muda (sehen → séen); al inicio o tras consonante
      // (Flughafen, Bahnhof) se aspira
      if (!isV(prev(i)) && isV(w[i + 1] || "")) out += "h";
      i += 1; continue;
    }
    if (c === "g") {
      if (two === "ig" && false) { /* nunca */ }
      if (end) { out += prev(i) === "i" ? "sh" : "k"; i += 1; continue; } // fertig → fértish, Tag → tak
      if ("eiäöüy".includes(w[i + 1] || "")) { out += "gu"; i += 1; continue; }
      out += "g"; i += 1; continue;
    }
    if (end && c === "d") { out += "t"; i += 1; continue; }
    if (end && c === "b") { out += "p"; i += 1; continue; }
    if (c === "s") { out += "s"; i += w[i + 1] === "s" ? 2 : 1; continue; }
    // consonante doble → simple
    if (w[i + 1] === c) { out += c; i += 2; continue; }
    out += c; i += 1;
  }
  return out;
}

const cache = new Map();
export function figurada(text) {
  if (!text) return "";
  if (cache.has(text)) return cache.get(text);
  const out = text
    .replace(/<[^>]+>/g, "")
    .split(/(\s+|[-/,.;:!?¿¡()«»"])/)
    .map((t) => (/[A-Za-zÄÖÜäöüß]/.test(t) ? figWord(t) : t))
    .join("")
    .trim();
  if (cache.size > 3000) cache.clear();
  cache.set(text, out);
  return out;
}
