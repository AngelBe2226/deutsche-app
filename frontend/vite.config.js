import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";

// Dirección pública de los audios (bucket R2). En GitHub Pages llega por la
// variable VITE_AUDIO_BASE; en los Macs, de AUDIO_PUBLIC_BASE en el
// .env.local de la raíz del repo (que nunca se sube a git).
function audioBase() {
  if (process.env.VITE_AUDIO_BASE) return process.env.VITE_AUDIO_BASE;
  try {
    const txt = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf8");
    const m = txt.match(/^\s*AUDIO_PUBLIC_BASE\s*=\s*(\S+)/m);
    return m ? m[1].replace(/^["']|["']$/g, "") : "";
  } catch {
    return "";
  }
}

// base: "/" en local/Railway (backend); "/deutsche-app/" en GitHub Pages
// (se pasa por env BASE_PATH en el workflow).
// Todos los builds (WPA en GitHub Pages y los Macs) son estáticos: contenido
// empaquetado + login y progreso en Supabase, una sola base de datos para
// todos los dispositivos. VITE_STATIC=0 vuelve al modo backend (SQLite).
const SUPABASE_URL = "https://fvskktohsrizlyqxgikm.supabase.co";
const SUPABASE_KEY = "sb_publishable_FzoQtVT5cm3UUq8DsvYB6Q_yehYSmP4"; // pública, protegida por RLS
export default defineConfig(() => ({
  base: process.env.BASE_PATH || "/",
  plugins: [react()],
  define: {
    __AUDIO_BASE__: JSON.stringify(audioBase()),
    "import.meta.env.VITE_STATIC": JSON.stringify(process.env.VITE_STATIC === "0" ? "" : "1"),
    // Supabase (login + progreso por usuario en la web). Valores públicos:
    // la URL del proyecto y la clave anon/publishable, protegida por RLS.
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(process.env.VITE_SUPABASE_URL || SUPABASE_URL),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || SUPABASE_KEY),
  },
  server: {
    port: 5174,
    proxy: {
      "/api": "http://localhost:8002",
    },
  },
}));
