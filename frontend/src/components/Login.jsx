import { useState } from "react";
import { supabase } from "../supabase";

// Acceso con email + contraseña (sin correos: funciona igual en la app
// instalada del iPhone). «Crear cuenta» solo funciona para los emails de la
// lista autorizada (tabla allowed_emails en Supabase, ver supabase/schema.sql).
// «¿Olvidaste la contraseña?» envía un enlace para poner una nueva.

// Último email con el que se entró en este dispositivo: se rellena solo.
const LAST_EMAIL_KEY = "german-last-email";

function readLastEmail() {
  try {
    return localStorage.getItem(LAST_EMAIL_KEY) || "";
  } catch {
    return "";
  }
}

export function rememberEmail(addr) {
  try {
    localStorage.setItem(LAST_EMAIL_KEY, addr);
  } catch {
    /* sin almacenamiento local */
  }
}

const appUrl = () => window.location.origin + import.meta.env.BASE_URL;

function friendlyError(msg, mode) {
  if (/Database error saving new user|signup_not_allowed/i.test(msg))
    return "Este email no está autorizado para crear una cuenta.";
  if (/already registered|already exists/i.test(msg))
    return "Ya existe una cuenta con este email. Usa «Entrar» (o «¿Olvidaste la contraseña?» si no la tienes).";
  if (/Invalid login credentials/i.test(msg))
    return "Email o contraseña incorrectos. Si nunca pusiste contraseña, usa «¿Olvidaste la contraseña?».";
  if (/Email not confirmed/i.test(msg))
    return "Falta confirmar el email: abre el correo de Supabase y pulsa el botón. Luego entra aquí.";
  if (/at least|weak|short/i.test(msg)) return "La contraseña debe tener al menos 6 caracteres.";
  if (/rate|security purposes|seconds/i.test(msg)) return "Demasiados intentos. Espera un minuto y vuelve a probar.";
  if (/signup.*disabled|Signups not allowed/i.test(msg) && mode === "signup")
    return "El registro está desactivado en Supabase.";
  return "No se pudo completar. Revisa la conexión e inténtalo de nuevo.";
}

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "signup" | "reset"
  const [email, setEmail] = useState(readLastEmail);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  function switchMode(next) {
    setMode(next);
    setPassword("");
    setPassword2("");
    setError("");
    setInfo("");
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    const addr = email.trim().toLowerCase();
    if (!addr) return;

    if (mode === "signup" && password !== password2) {
      setError("Las dos contraseñas no coinciden.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({ email: addr, password });
        if (err) throw err;
        rememberEmail(addr); // AuthGate recibe la sesión y abre la app
      } else if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email: addr,
          password,
          options: { emailRedirectTo: appUrl() },
        });
        if (err) throw err;
        rememberEmail(addr);
        if (!data.session) {
          // «Confirm email» sigue activado en Supabase.
          setInfo("Cuenta creada. Abre el correo de Supabase, pulsa el botón para activarla y luego entra aquí.");
          setMode("login");
          setPassword("");
          setPassword2("");
        }
      } else {
        const { error: err } = await supabase.auth.resetPasswordForEmail(addr, { redirectTo: appUrl() });
        if (err) throw err;
        rememberEmail(addr);
        setInfo(
          `Te hemos enviado un correo a ${addr}. Pulsa el botón del correo: se abrirá la app para que pongas tu contraseña nueva.`
        );
      }
    } catch (err) {
      setError(friendlyError(err?.message || "", mode));
    } finally {
      setBusy(false);
    }
  }

  const title =
    mode === "signup"
      ? "Crea tu cuenta para guardar tu progreso"
      : mode === "reset"
        ? "Recupera el acceso a tu cuenta"
        : "Entra para guardar tu progreso";

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="login-brand">
          <span className="login-mark">DE</span>
          <div>
            <div className="login-title">Índice de Alemán</div>
            <div className="login-sub">{title}</div>
          </div>
        </div>

        {mode !== "reset" && (
          <div className="login-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              className={"login-tab" + (mode === "login" ? " on" : "")}
              onClick={() => switchMode("login")}
            >
              Entrar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              className={"login-tab" + (mode === "signup" ? " on" : "")}
              onClick={() => switchMode("signup")}
            >
              Crear cuenta
            </button>
          </div>
        )}

        <label className="login-label" htmlFor="login-email">
          Tu email
        </label>
        <input
          id="login-email"
          className="login-input"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoFocus={!email}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
        />

        {mode !== "reset" && (
          <>
            <label className="login-label" htmlFor="login-password">
              {mode === "signup" ? "Elige una contraseña (mínimo 6 caracteres)" : "Contraseña"}
            </label>
            <div className="login-pw">
              <input
                id="login-password"
                className="login-input"
                type={showPw ? "text" : "password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                autoFocus={!!email}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="login-pw-toggle"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPw ? "Ocultar" : "Ver"}
              </button>
            </div>
          </>
        )}

        {mode === "signup" && (
          <>
            <label className="login-label" htmlFor="login-password2">
              Repite la contraseña
            </label>
            <input
              id="login-password2"
              className="login-input"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={6}
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />
          </>
        )}

        <button className="login-btn" type="submit" disabled={busy}>
          {busy
            ? "Un momento…"
            : mode === "signup"
              ? "Crear cuenta"
              : mode === "reset"
                ? "Enviarme el enlace"
                : "Entrar"}
        </button>

        {mode === "login" && (
          <button type="button" className="login-link" onClick={() => switchMode("reset")}>
            ¿Olvidaste la contraseña?
          </button>
        )}
        {mode === "reset" && (
          <button type="button" className="login-link" onClick={() => switchMode("login")}>
            Volver a entrar
          </button>
        )}

        {info && <p className="login-info">{info}</p>}
        {error && <p className="login-error">{error}</p>}
      </form>
    </div>
  );
}

// Pantalla para poner la contraseña nueva tras pulsar el enlace del correo
// de recuperación (también sirve para ponerla por primera vez).
export function SetPassword({ onDone }) {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (password !== password2) {
      setError("Las dos contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    const { data, error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      setError(friendlyError(err.message || "", "reset"));
      return;
    }
    if (data?.user?.email) rememberEmail(data.user.email);
    onDone();
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="login-brand">
          <span className="login-mark">DE</span>
          <div>
            <div className="login-title">Índice de Alemán</div>
            <div className="login-sub">Pon tu contraseña nueva</div>
          </div>
        </div>
        <label className="login-label" htmlFor="new-password">
          Contraseña nueva (mínimo 6 caracteres)
        </label>
        <input
          id="new-password"
          className="login-input"
          type="password"
          autoComplete="new-password"
          autoFocus
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label className="login-label" htmlFor="new-password2">
          Repite la contraseña
        </label>
        <input
          id="new-password2"
          className="login-input"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
        />
        <button className="login-btn" type="submit" disabled={busy}>
          {busy ? "Guardando…" : "Guardar y entrar"}
        </button>
        {error && <p className="login-error">{error}</p>}
      </form>
    </div>
  );
}
