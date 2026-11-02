import { createContext, useContext, useEffect, useState } from "react";
import { supabase, openedFromRecoveryLink } from "./supabase";
import { migrateLocalProgress } from "./api";
import Login, { SetPassword } from "./components/Login";

// Solo hay login en el build estático (web/PWA) con Supabase configurado.
// En los Macs (modo backend) o sin configuración, la app abre directamente.
export const AUTH_ENABLED = import.meta.env.VITE_STATIC === "1" && !!supabase;

const AuthCtx = createContext({ session: null, signOut: async () => {} });

export function useAuth() {
  return useContext(AuthCtx);
}

// Renderiza children(session) cuando hay sesión (o cuando el login está
// desactivado). Mientras tanto muestra la pantalla de acceso.
export function AuthGate({ children }) {
  const [session, setSession] = useState(undefined); // undefined = comprobando
  const [ready, setReady] = useState(!AUTH_ENABLED);
  // Abierta desde el enlace de recuperación: pedir contraseña nueva primero.
  const [recovery, setRecovery] = useState(AUTH_ENABLED && openedFromRecoveryLink);

  useEffect(() => {
    if (!AUTH_ENABLED) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      setSession(s ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Al entrar con una cuenta, sube el progreso anónimo de este dispositivo
  // (si lo había y la cuenta estaba vacía) antes de cargar la app.
  useEffect(() => {
    if (!AUTH_ENABLED) return;
    if (!session) {
      setReady(false);
      return;
    }
    let alive = true;
    migrateLocalProgress()
      .catch(() => {})
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [session?.user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  if (AUTH_ENABLED) {
    if (session === undefined || (session && !ready)) {
      return <p className="muted center">Cargando…</p>;
    }
    if (!session) return <Login />;
    if (recovery) return <SetPassword onDone={() => setRecovery(false)} />;
  }

  return (
    <AuthCtx.Provider value={{ session: session ?? null, signOut }}>
      {children(session ?? null)}
    </AuthCtx.Provider>
  );
}
