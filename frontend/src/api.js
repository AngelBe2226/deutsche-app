// Cliente de datos con dos modos:
//   - backend (por defecto): habla con el FastAPI (API + progreso en SQLite).
//   - estático (VITE_STATIC=1, GitHub Pages): el contenido se sirve como
//     archivos JSON empaquetados en el build; el progreso va a Supabase si
//     hay sesión iniciada, y a localStorage si no.
import { supabase } from "./supabase";

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

const localProgress = {
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

// ---- progreso en Supabase (un registro por usuario y clave, con RLS) ----
// Se guarda además una copia local por usuario para leer sin conexión, y las
// escrituras que fallan (offline) van a una cola que se vacía al reconectar.
async function currentUserId() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

const cacheKey = (uid) => `german-progress-cloud-${uid}`;
const outboxKey = (uid) => `german-progress-outbox-${uid}`;
const readJSON = (k, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(k) || "null") ?? fallback;
  } catch {
    return fallback;
  }
};
const writeJSON = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* sin almacenamiento local */
  }
};

function updateCache(uid, mutate) {
  const c = readJSON(cacheKey(uid), {});
  mutate(c);
  writeJSON(cacheKey(uid), c);
}

async function runOp(uid, op) {
  const t = supabase.from("progress");
  let res;
  if (op.type === "set") {
    res = await t.upsert(
      { user_id: uid, key: op.key, value: String(op.value), updated_at: new Date().toISOString() },
      { onConflict: "user_id,key" }
    );
  } else if (op.type === "del") {
    res = await t.delete().eq("user_id", uid).eq("key", op.key);
  } else if (op.type === "prefix") {
    res = await t.delete().eq("user_id", uid).like("key", `${op.prefix.replace(/[%_]/g, "\\$&")}%`);
  } else if (op.type === "import") {
    const rows = Object.entries(op.items).map(([key, value]) => ({
      user_id: uid,
      key,
      value: String(value),
      updated_at: new Date().toISOString(),
    }));
    res = rows.length ? await t.upsert(rows, { onConflict: "user_id,key" }) : { error: null };
  }
  if (res?.error) throw res.error;
}

async function flushOutbox(uid) {
  const queue = readJSON(outboxKey(uid), []);
  while (queue.length) {
    await runOp(uid, queue[0]); // si falla, se corta y queda en cola
    queue.shift();
    writeJSON(outboxKey(uid), queue);
  }
}

async function cloudWrite(uid, op) {
  try {
    await flushOutbox(uid);
    await runOp(uid, op);
  } catch {
    const queue = readJSON(outboxKey(uid), []);
    queue.push(op);
    writeJSON(outboxKey(uid), queue);
  }
  return { ok: true };
}

const cloudProgress = {
  getProgress: async (uid) => {
    try {
      await flushOutbox(uid);
      const out = {};
      const pageSize = 1000;
      for (let from = 0; ; from += pageSize) {
        const { data, error } = await supabase
          .from("progress")
          .select("key,value")
          .eq("user_id", uid)
          .range(from, from + pageSize - 1);
        if (error) throw error;
        for (const r of data) out[r.key] = r.value;
        if (data.length < pageSize) break;
      }
      writeJSON(cacheKey(uid), out);
      return out;
    } catch {
      return readJSON(cacheKey(uid), {}); // sin conexión: última copia conocida
    }
  },
  setProgress: (uid, key, value) => {
    updateCache(uid, (c) => (c[key] = value));
    return cloudWrite(uid, { type: "set", key, value });
  },
  deleteProgress: (uid, key) => {
    updateCache(uid, (c) => delete c[key]);
    return cloudWrite(uid, { type: "del", key });
  },
  resetPrefix: (uid, prefix) => {
    updateCache(uid, (c) => {
      for (const k of Object.keys(c)) if (k.startsWith(prefix)) delete c[k];
    });
    return cloudWrite(uid, { type: "prefix", prefix });
  },
  importProgress: (uid, items) => {
    updateCache(uid, (c) => Object.assign(c, items || {}));
    return cloudWrite(uid, { type: "import", items: items || {} });
  },
};

// Primer inicio de sesión en un dispositivo: si había progreso guardado aquí
// sin cuenta y la cuenta aún está vacía, se sube a la cuenta y se borra la
// copia anónima (para que no la herede quien entre después en este equipo).
export async function migrateLocalProgress() {
  const uid = await currentUserId();
  if (!uid) return;
  const local = lsLoad();
  if (!Object.keys(local).length) return;
  const remote = await cloudProgress.getProgress(uid);
  if (Object.keys(remote).length === 0) {
    await cloudProgress.importProgress(uid, local);
  }
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    /* nada */
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("online", async () => {
    const uid = await currentUserId();
    if (uid) flushOutbox(uid).catch(() => {});
  });
}

// En modo estático: nube si hay sesión, si no localStorage.
async function withProgress(method, ...args) {
  const uid = await currentUserId();
  return uid ? cloudProgress[method](uid, ...args) : localProgress[method](...args);
}

const staticApi = {
  listBlocks: () => fetch(`${BASE}content/_index.json`, { cache: "no-cache" }).then(json),
  getBlock: (block) => fetch(`${BASE}content/block_${block}.json`, { cache: "no-cache" }).then(json),

  getProgress: () => withProgress("getProgress"),
  setProgress: (key, value) => withProgress("setProgress", key, value),
  deleteProgress: (key) => withProgress("deleteProgress", key),
  resetPrefix: (prefix) => withProgress("resetPrefix", prefix),
  importProgress: (items) => withProgress("importProgress", items),
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
