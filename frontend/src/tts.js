import { useSyncExternalStore } from "react";

// Motor de voz (TTS) sobre la Web Speech API del navegador, con voz alemana.
// Un único "store" global: qué se está leyendo ahora y a qué velocidad, para
// que cada botón sepa si animarse y el selector de velocidad sea compartido.

export const RATES = { normal: 0.95, slow: 0.7 };
const supported = typeof window !== "undefined" && "speechSynthesis" in window;

let state = {
  playing: null, // id del botón que está sonando
  cursor: null, // en una secuencia, índice de la frase que suena
  speed: readSpeed(),
  hasVoice: false,
};
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());
const set = (patch) => {
  state = { ...state, ...patch };
  emit();
};

function readSpeed() {
  try {
    return localStorage.getItem("tts-speed") === "slow" ? "slow" : "normal";
  } catch (e) {
    return "normal";
  }
}

// Elige la mejor voz alemana disponible: las "premium/enhanced" de macOS y
// las de Google suenan mucho más naturales que las básicas. `voices[0]` es la
// voz principal; `altVoice` es una segunda voz (preferiblemente masculina)
// para dar un timbre distinto a cada personaje de un diálogo.
let voice = null;
let altVoice = null;
function pickVoice() {
  const voices = window.speechSynthesis.getVoices().filter((v) => /^de(-|_|$)/i.test(v.lang));
  if (!voices.length) return;
  const score = (v) =>
    (/premium|enhanced|natural|neural/i.test(v.name) ? 8 : 0) +
    (/google/i.test(v.name) ? 4 : 0) +
    (/anna|petra|helena|markus|yannick/i.test(v.name) ? 3 : 0) +
    (/de-DE/i.test(v.lang) ? 2 : 0) +
    (v.localService ? 1 : 0);
  const ranked = voices.sort((a, b) => score(b) - score(a));
  voice = ranked[0];
  altVoice =
    ranked.find((v) => v !== voice && /markus|yannick|viktor|martin|male|mann|reed|eddy/i.test(v.name)) ||
    ranked.find((v) => v !== voice && !/grandma|grandpa|rocko|shelley|sandy|flo/i.test(v.name)) ||
    null;
  set({ hasVoice: true });
}
if (supported) {
  pickVoice();
  window.speechSynthesis.addEventListener?.("voiceschanged", pickVoice);
}

function utterance(text, alt = false) {
  const u = new SpeechSynthesisUtterance(text);
  const v = alt ? altVoice || voice : voice;
  u.lang = v?.lang || "de-DE";
  if (v) u.voice = v;
  // Sin segunda voz, el otro personaje se distingue al menos por el tono.
  if (alt && !altVoice) u.pitch = 0.8;
  u.rate = RATES[state.speed];
  return u;
}

// Texto plano a partir del HTML del contenido (spans de rol, <b>, <i>…).
export function plainText(html) {
  const el = document.createElement("div");
  el.innerHTML = html || "";
  return (el.textContent || "")
    .replace(/_{2,}|…{1,}|\.{3,}/g, " … ") // huecos de ejercicio
    .replace(/[→←↔]/g, ",")
    .replace(/\s+/g, " ")
    .trim();
}

export function speak(id, text) {
  speakSequence(id, [{ text }]);
}

// Lee varias frases seguidas (p. ej. un diálogo). `alt: true` usa la segunda
// voz. `state.cursor` indica qué elemento está sonando, para resaltarlo.
export function speakSequence(id, items) {
  if (!supported || !items?.length) return;
  const synth = window.speechSynthesis;
  // Pulsar el mismo botón mientras suena lo detiene.
  if (state.playing === id) {
    stop();
    return;
  }
  synth.cancel();
  const list = items.filter((it) => it.text);
  if (!list.length) return;
  set({ playing: id, cursor: 0 });
  list.forEach((it, i) => {
    const u = utterance(it.text, it.alt);
    u.onstart = () => state.playing === id && set({ cursor: i });
    const done = () => state.playing === id && set({ playing: null, cursor: null });
    if (i === list.length - 1) u.onend = done;
    u.onerror = (e) => e.error !== "interrupted" && e.error !== "canceled" && done();
    synth.speak(u);
  });
}

export function stop() {
  if (!supported) return;
  window.speechSynthesis.cancel();
  set({ playing: null, cursor: null });
}

export function toggleSpeed() {
  const next = state.speed === "slow" ? "normal" : "slow";
  try {
    localStorage.setItem("tts-speed", next);
  } catch (e) {
    /* sin almacenamiento: dura hasta recargar */
  }
  set({ speed: next });
}

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export function useTTS() {
  return { ...useSyncExternalStore(subscribe, () => state), supported };
}

// ---- Tablas: qué celdas están en alemán ----

// Columnas cuyo encabezado indica explicación en español.
const ES_HEADER =
  /significad|signific|español|literal|uso|cuándo|matiz|pista|mecánica|efecto|ojo|cómo|origen|oculto|equivale|eso se dice|^persona$|^tipo$|^grupo$|^género$|^caso$|^poseedor$|^pregunta$|^frecuencia$|n\.º|cifra|^letra$/i;
// Rasgos de texto en español (el alemán no usa tildes agudas ni ñ).
const ES_TEXT = /[áéíóúñ¿¡]|\b(el|la|los|las|de|del|que|con|para|por|una?|y|o|se|lo|cuando|sin|más|(in)?definido|masculino|femenino|neutro)\b/i;

export function germanCells(headers, row) {
  const out = [];
  row.forEach((cell, i) => {
    const h = plainText(headers?.[i] || "");
    if (h && ES_HEADER.test(h)) return;
    // Las glosas en español suelen ir entre paréntesis o comillas latinas
    // ("Ich gebe dem Mann (le doy al hombre)"): se quitan antes de decidir.
    const t = plainText(cell)
      .replace(/\([^)]*\)|«[^»]*»/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^[-–—]+$/, "");
    if (!t || ES_TEXT.test(t)) return;
    out.push(t.replace(/^-/, "").replace(/\s*\/\s*/g, ", ").replace(/\s*[—–]\s*/g, " "));
  });
  return out;
}
