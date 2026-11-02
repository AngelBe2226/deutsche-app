import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase para la PWA (login + progreso por usuario).
// Solo existe si el build trae URL y clave pública; sin ellas la app sigue
// funcionando con el progreso en localStorage.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        // detectSessionInUrl: si alguien pulsa el botón del correo en vez de
        // escribir el código, la app recoge la sesión de la URL y entra.
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null;
