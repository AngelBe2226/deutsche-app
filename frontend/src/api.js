// Thin client over the FastAPI backend. All URLs are same-origin relative;
// in dev Vite proxies /api to localhost:8000.

async function json(res) {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
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
