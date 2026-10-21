// Cliente de datos con dos modos:
//   - backend (por defecto): habla con el FastAPI (API + progreso en SQLite).
//   - estático (VITE_STATIC=1, GitHub Pages): el contenido se sirve como
//     archivos JSON empaquetados en el build y el progreso vive en
//     localStorage (por dispositivo).
const STATIC = import.meta.env.VITE_STATIC === "1";
const BASE = import.meta.env.BASE_URL || "/";

async function json(res) {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// ---- modo estático: contenido empaquetado + progreso en localStorage ----
const LS_KEY = "german-progress-v1";

function lsLoad() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}") || {};
  } catch {
    return {};
  }
}
function lsSave(obj) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(obj));
  } catch {
    /* almacenamiento no disponible (modo privado, etc.) */
  }
}

const staticApi = {
  listBlocks: () => fetch(`${BASE}content/_index.json`).then(json),
  getBlock: (block) => fetch(`${BASE}content/block_${block}.json`).then(json),

  getProgress: async () => lsLoad(),
  setProgress: async (key, value) => {
    const o = lsLoad();
    o[key] = value;
    lsSave(o);
    return { ok: true };
  },
  deleteProgress: async (key) => {
    const o = lsLoad();
    delete o[key];
    lsSave(o);
    return { ok: true };
  },
  resetPrefix: async (prefix) => {
    const o = lsLoad();
    for (const k of Object.keys(o)) if (k.startsWith(prefix)) delete o[k];
    lsSave(o);
    return { ok: true };
  },
  importProgress: async (items) => {
    const o = lsLoad();
    Object.assign(o, items || {});
    lsSave(o);
    return { ok: true };
  },
};

// ---- modo backend: FastAPI, URLs same-origin relativas ----
const backendApi = {
  listBlocks: () => fetch("/api/blocks").then(json),
  getBlock: (block) => fetch(`/api/blocks/${block}`).then(json),

  getProgress: () => fetch("/api/progress").then(json),
  setProgress: (key, value) =>
    fetch(`/api/progress/${encodeURIComponent(key)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    }).then(json),
  deleteProgress: (key) =>
    fetch(`/api/progress/${encodeURIComponent(key)}`, { method: "DELETE" }).then(json),
  resetPrefix: (prefix) =>
    fetch(`/api/progress/reset?prefix=${encodeURIComponent(prefix)}`, {
      method: "POST",
    }).then(json),
  importProgress: (items) =>
    fetch("/api/progress/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    }).then(json),
};

export const api = STATIC ? staticApi : backendApi;
