// Dirección pública donde están los audios (bucket de Cloudflare R2). Es
// pública a propósito: solo contiene MP3. Vacía = se usa la voz del sistema.
// La inyecta vite.config.js (__AUDIO_BASE__); en Node no existe.
/* global __AUDIO_BASE__ */
export const AUDIO_BASE = (typeof __AUDIO_BASE__ !== "undefined" ? __AUDIO_BASE__ : "").replace(/\/$/, "");
