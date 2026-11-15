import { useEffect, useState } from "react";

// Diccionario de la app (frontend/public/lex.json, generado con
// tools/build_lexicon.py): para cada forma alemana que aparece en el
// contenido, su lema, categoría, significado y datos gramaticales.
//
//   forms:  { "gehst": [[lemaId, "Präsens · du"], ...] }
//   lemmas: { lemaId: { w, pos, es: [...], g?: "m|f|n", pl?, gen?, verb? } }
const BASE = import.meta.env.BASE_URL || "/";

let lex = null;
let promise = null;
const subs = new Set();

export function loadLexicon() {
  if (!promise) {
    promise = fetch(`${BASE}lex.json`)
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((d) => {
        lex = d;
        subs.forEach((fn) => fn(d));
        return d;
      })
      .catch((e) => {
        promise = null;
        throw e;
      });
  }
  return promise;
}

export function useLexicon() {
  const [value, setValue] = useState(lex);
  useEffect(() => {
    if (lex) return;
    subs.add(setValue);
    loadLexicon().catch(() => {});
    return () => subs.delete(setValue);
  }, []);
  return value;
}

export function lookup(word) {
  if (!lex) return [];
  const rows = lex.forms[word.toLowerCase()] || [];
  const out = rows.map(([id, desc]) => ({ id, desc, ...lex.lemmas[id] })).filter((e) => e.w);
  // Los sustantivos van siempre con mayúscula: en minúscula no son sustantivo.
  const cap = word[0] !== word[0].toLowerCase();
  if (!cap) {
    const rest = out.filter((e) => e.pos !== "noun");
    if (rest.length) return rest;
  } else {
    out.sort((a, b) => (b.pos === "noun") - (a.pos === "noun"));
  }
  return out;
}

// ---------- Subrayado de palabras dentro de HTML ----------

const WORD = /[A-Za-zÄÖÜäöüß]+(?:-[A-Za-zÄÖÜäöüß]+)*/g;
const EMPH = new Set(["B", "I", "EM", "STRONG"]);
const SKIP = new Set(["BUTTON", "A", "SCRIPT", "STYLE", "TEXTAREA", "INPUT", "SELECT"]);
const cache = new Map();

function inGermanScope(node, root, mode) {
  for (let el = node.parentNode; el && el !== root; el = el.parentNode) {
    if (SKIP.has(el.tagName)) return false;
    if (el.classList?.contains("gl")) return false; // glosas de las lecturas: ya tienen su ayuda
    if (mode === "mixed" && (EMPH.has(el.tagName) || /\br-/.test(el.className || ""))) return true;
  }
  return mode === "de";
}

// mode "de": todo el texto es alemán. mode "mixed": texto en español con
// fragmentos alemanes en negrita/cursiva o con color de rol (r-*).
// Solo se subrayan las palabras que están en el diccionario.
export function wrapGermanHtml(html, mode, lexData = lex) {
  if (!html || !lexData || typeof document === "undefined") return html;
  const key = mode + "\u0000" + html;
  if (cache.has(key)) return cache.get(key);
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  const root = tpl.content;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  for (const t of texts) {
    if (!inGermanScope(t, root, mode)) continue;
    const s = t.nodeValue;
    WORD.lastIndex = 0;
    let m;
    let last = 0;
    let frag = null;
    while ((m = WORD.exec(s))) {
      if (!lexData.forms[m[0].toLowerCase()]) continue;
      frag = frag || document.createDocumentFragment();
      if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
      const span = document.createElement("span");
      span.className = "w";
      span.textContent = m[0];
      frag.appendChild(span);
      last = m.index + m[0].length;
    }
    if (frag) {
      if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
      t.parentNode.replaceChild(frag, t);
    }
  }
  const div = document.createElement("div");
  div.appendChild(root.cloneNode(true));
  const out = div.innerHTML;
  if (cache.size > 5000) cache.clear();
  cache.set(key, out);
  return out;
}

export function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export const POS_ES = {
  noun: "sustantivo",
  verb: "verbo",
  adj: "adjetivo",
  adv: "adverbio",
  prep: "preposición",
  pron: "pronombre",
  det: "determinante",
  article: "artículo",
  conj: "conjunción",
  num: "numeral",
  particle: "partícula",
  intj: "interjección",
  contraction: "contracción",
  name: "nombre propio",
};

export const ARTICLE = { m: "der", f: "die", n: "das" };
