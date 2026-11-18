import { useSyncExternalStore } from "react";
import { audioEnabled, playClip, stopClip, unlockAudio } from "./audio/player";

// Motor de voz (TTS) sobre la Web Speech API del navegador, con voz alemana.
// Un único "store" global: qué se está leyendo ahora y a qué velocidad, para
// que cada botón sepa si animarse y el selector de velocidad sea compartido.

export const RATES = { normal: 0.95, slow: 0.7 };
const hasSynth = typeof window !== "undefined" && "speechSynthesis" in window;
// Hay voz si hay audios generados (R2) o voz del sistema.
const supported = hasSynth || audioEnabled();

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
if (hasSynth) {
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

// Texto plano y frases de ejercicios: funciones puras compartidas con el
// generador de audios (audio/texts.js).
export { plainText, germanCells, isGerman, quizSentence } from "./audio/texts.js";

// ---- Reproducción: voz real (MP3 de Piper en R2) y, si falta, la del sistema ----
let runId = 0;
let echoTimer = null;

function speakSystem(text, alt, isCurrent) {
  return new Promise((resolve) => {
    if (!hasSynth || !isCurrent()) return resolve();
    const u = utterance(text, alt);
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

// Dice un texto: MP3 si existe; si no, la voz del sistema.
async function sayOne(text, alt, isCurrent) {
  const ok = await playClip(text, { rate: state.speed === "slow" ? 0.8 : 1, isCurrent });
  if (!ok && isCurrent()) await speakSystem(text, alt, isCurrent);
}

export function speak(id, text) {
  speakSequence(id, [{ text }]);
}

// Lee varias frases seguidas (p. ej. un diálogo). `alt: true` usa la segunda
// voz del sistema cuando no hay MP3. `state.cursor` indica qué elemento está
// sonando, para resaltarlo. Pulsar el mismo botón mientras suena lo detiene.
export function speakSequence(id, items, { pauseFactor = 0 } = {}) {
  if (!supported || !items?.length) return;
  if (state.playing === id) {
    stop();
    return;
  }
  unlockAudio(); // dentro del gesto: necesario en iOS
  stop();
  const list = items.filter((it) => it.text);
  if (!list.length) return;
  const my = ++runId;
  const isCurrent = () => my === runId;
  set({ playing: id, cursor: 0 });
  (async () => {
    for (let i = 0; i < list.length; i++) {
      if (!isCurrent()) return;
      set({ cursor: i });
      const t0 = Date.now();
      await sayOne(list[i].text, list[i].alt, isCurrent);
      // Modo eco: hueco proporcional a la frase para repetirla en voz alta
      if (pauseFactor && isCurrent() && i < list.length - 1) {
        const pause = Math.max(1500, (Date.now() - t0) * pauseFactor);
        await new Promise((r) => (echoTimer = setTimeout(r, pause)));
      }
    }
    if (isCurrent()) set({ playing: null, cursor: null });
  })();
}

// Modo eco (método de grabación con pausas): dice cada frase y deja un hueco
// para que la repitas en voz alta antes de pasar a la siguiente.
export function speakEcho(id, texts, pauseFactor = 1.3) {
  speakSequence(
    id,
    texts.filter(Boolean).map((text) => ({ text })),
    { pauseFactor }
  );
}

export function stop() {
  runId++;
  clearTimeout(echoTimer);
  stopClip();
  if (hasSynth) window.speechSynthesis.cancel();
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
