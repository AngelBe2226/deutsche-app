import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase para la PWA (login + progreso por usuario).
// Solo existe si el build trae URL y clave pública; sin ellas la app sigue
// funcionando con el progreso en localStorage.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ¿Se ha abierto la app desde el enlace de «¿Olvidaste la contraseña?»?
// Se lee antes de crear el cliente, que limpia la URL al recoger la sesión.
export const openedFromRecoveryLink =
  typeof window !== "undefined" &&
  /type=recovery/.test(window.location.hash + window.location.search);

export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        // detectSessionInUrl: si alguien pulsa el botón del correo en vez de
        // escribir el código, la app recoge la sesión de la URL y entra.
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null;
