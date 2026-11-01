import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "/" en local/Railway (backend); "/deutsche-app/" en GitHub Pages
// (se pasa por env BASE_PATH en el workflow).
// VITE_STATIC=1 compila la versión 100% estática (contenido empaquetado +
// progreso en localStorage) para GitHub Pages; sin él, usa el backend.
export default defineConfig(() => ({
  base: process.env.BASE_PATH || "/",
  plugins: [react()],
  define: {
    "import.meta.env.VITE_STATIC": JSON.stringify(process.env.VITE_STATIC || ""),
    // Supabase (login + progreso por usuario en la web). Valores públicos:
    // la URL del proyecto y la clave anon/publishable, protegida por RLS.
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(process.env.VITE_SUPABASE_URL || ""),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || ""),
  },
  server: {
    port: 5174,
    proxy: {
      "/api": "http://localhost:8002",
    },
  },
}));
