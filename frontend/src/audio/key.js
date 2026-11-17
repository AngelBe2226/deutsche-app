// Clave de audio de un texto: la misma en la app y en el generador
// (scripts/audio), para que cada frase o palabra encuentre su archivo.
// Sin DOM ni crypto.subtle: funciona en Node y en http://localhost.
import { decodeEntities } from "./texts.js";

// Texto tal como se oye: sin etiquetas ni entidades y con espacios normales.
// Una palabra suelta va en minúsculas para que «Haus» (inicio de frase o
// sustantivo) y «haus» compartan audio: se pronuncian igual.
export function normText(input) {
  let s = decodeEntities(String(input || "").replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
  if (/^[A-Za-zÄÖÜäöüß]+(-[A-Za-zÄÖÜäöüß]+)*$/.test(s)) s = s.toLowerCase();
  return s;
}

// cyrb53: hash de 53 bits, rápido y estable (colisiones despreciables para
// cientos de miles de textos). Devuelve 14 caracteres hexadecimales.
export function audioKey(text) {
  const str = normText(text);
  let h1 = 0xdeadbeef ^ 0x6a09e667;
  let h2 = 0x41c6ce57 ^ 0x6a09e667;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const n = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return n.toString(16).padStart(14, "0");
}

// Carpeta de la voz dentro del bucket (compartido con la app de inglés): si
// cambia la voz, se cambia aquí y se regenera todo en una carpeta nueva.
export const AUDIO_VOICE = "de-thorsten-v1";

export function audioPath(text) {
  const k = audioKey(text);
  return `${AUDIO_VOICE}/${k.slice(0, 2)}/${k}.mp3`;
}
