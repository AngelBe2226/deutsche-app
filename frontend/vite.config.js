import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
