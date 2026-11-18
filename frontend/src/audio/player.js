import { AUDIO_BASE } from "./config";
import { audioPath, normText } from "./key";

// Reproductor de voz real: MP3 generado con Piper (voz alemana local) y
// guardado en R2. Si no hay audio para ese texto (o no hay conexión y no está
// en caché), devuelve false y quien llama usa la voz del sistema.
// Los MP3 se piden con fetch: el service worker los guarda (caché primero),
// así lo ya escuchado suena también sin conexión.
// Un único <audio> compartido: iOS solo deja reproducir sin gesto en un
// elemento que se «desbloqueó» dentro de un toque, así que se desbloquea en
// cada clic (unlockAudio) antes de cualquier espera.

// WAV mínimo en silencio (0,05 s) para desbloquear el audio en iOS.
function silentWav() {
  const n = 1200;
  const buf = new DataView(new ArrayBuffer(44 + n * 2));
  const w = (o, str) => [...str].forEach((c, i) => buf.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF");
  buf.setUint32(4, 36 + n * 2, true);
  w(8, "WAVEfmt ");
  buf.setUint32(16, 16, true);
  buf.setUint16(20, 1, true);
  buf.setUint16(22, 1, true);
  buf.setUint32(24, 24000, true);
  buf.setUint32(28, 48000, true);
  buf.setUint16(32, 2, true);
  buf.setUint16(34, 16, true);
  w(36, "data");
  buf.setUint32(40, n * 2, true);
  let bin = "";
  new Uint8Array(buf.buffer).forEach((b) => (bin += String.fromCharCode(b)));
  return "data:audio/wav;base64," + btoa(bin);
}

let el = null;
let blobUrl = null;

function audioEl() {
  if (!el && typeof Audio !== "undefined") {
    el = new Audio();
    el.preload = "auto";
  }
  return el;
}

// Llamar dentro del gesto del usuario (clic/toque).
export function unlockAudio() {
  const a = audioEl();
  if (!a || a.dataset.unlocked) return;
  a.src = silentWav();
  const p = a.play();
  if (p && p.catch) p.catch(() => {});
  a.dataset.unlocked = "1";
  // La voz del sistema también necesita un primer uso dentro del gesto.
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    window.speechSynthesis.speak(u);
  }
}

export function audioEnabled() {
  return Boolean(AUDIO_BASE);
}

export function stopClip() {
  const a = audioEl();
  if (a) {
    a.onended = null;
    a.onerror = null;
    a.pause();
  }
}

// Reproduce el MP3 de un texto. Resuelve true al terminar, false si no hay
// audio (para usar la voz del sistema). `isCurrent()` permite abortar si el
// usuario pulsó otra cosa mientras se descargaba.
export async function playClip(text, { rate = 1, isCurrent = () => true } = {}) {
  if (!AUDIO_BASE) return false;
  const t = normText(text);
  if (!t) return false;
  let blob;
  try {
    const res = await fetch(`${AUDIO_BASE}/${audioPath(t)}`, { mode: "cors" });
    if (!res.ok || /text\/html/.test(res.headers.get("content-type") || "")) return false;
    blob = await res.blob();
  } catch {
    return false;
  }
  if (!isCurrent()) return true;
  const a = audioEl();
  if (blobUrl) URL.revokeObjectURL(blobUrl);
  blobUrl = URL.createObjectURL(blob);
  a.src = blobUrl;
  a.playbackRate = rate;
  a.preservesPitch = true;
  return new Promise((resolve) => {
    a.onended = () => resolve(true);
    a.onerror = () => resolve(false);
    const p = a.play();
    if (p && p.catch) p.catch(() => resolve(false));
  });
}
