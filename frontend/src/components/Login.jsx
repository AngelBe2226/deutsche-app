import { useState } from "react";
import { supabase } from "../supabase";

// Acceso con código de un solo uso por email (no enlace mágico: en la PWA
// instalada en iPhone el enlace se abriría en Safari, fuera de la app).
// «Crear cuenta» solo funciona para los emails de la lista autorizada
// (tabla allowed_emails en Supabase, ver supabase/schema.sql).
export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [step, setStep] = useState("email"); // "email" | "code"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const isSignup = mode === "signup";

  function switchMode(next) {
    setMode(next);
    setStep("email");
    setCode("");
    setError("");
    setInfo("");
  }

  async function sendCode(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    const addr = email.trim().toLowerCase();
    if (!addr) return;
    setBusy(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: addr,
      options: { shouldCreateUser: isSignup },
    });
    setBusy(false);
    if (err) {
      const msg = err.message || "";
      if (/Database error saving new user|signup_not_allowed/i.test(msg)) {
        setError("Este email no está autorizado para crear una cuenta.");
      } else if (!isSignup && /signup|not allowed|not found|invalid/i.test(msg)) {
        setError("No hay ninguna cuenta con este email. Si es la primera vez, usa «Crear cuenta».");
      } else if (/disabled|not allowed/i.test(msg)) {
        setError("El registro está desactivado. Pide que te den de alta.");
      } else if (/rate|security purposes|seconds/i.test(msg)) {
        setError("Espera un minuto antes de pedir otro código.");
      } else {
        setError("No se pudo enviar el código. Revisa la conexión e inténtalo de nuevo.");
      }
      return;
    }
    setEmail(addr);
    setStep("code");
    setInfo(`Te hemos enviado un código a ${addr}.`);
  }

  async function verify(e) {
    e.preventDefault();
    setError("");
    const token = code.replace(/\s/g, "");
    if (!token) return;
    setBusy(true);
    const { error: err } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    setBusy(false);
    if (err) {
      setError(
        /expired/i.test(err.message)
          ? "El código ha caducado. Pide uno nuevo."
          : "Código incorrecto. Revisa el email e inténtalo otra vez."
      );
    }
    // Si va bien, AuthGate recibe la sesión y abre la app.
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={step === "email" ? sendCode : verify}>
        <div className="login-brand">
          <span className="login-mark">DE</span>
          <div>
            <div className="login-title">Índice de Alemán</div>
            <div className="login-sub">
              {isSignup ? "Crea tu cuenta para guardar tu progreso" : "Entra para guardar tu progreso"}
            </div>
          </div>
        </div>

        {step === "email" && (
          <div className="login-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={!isSignup}
              className={"login-tab" + (!isSignup ? " on" : "")}
              onClick={() => switchMode("login")}
            >
              Entrar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isSignup}
              className={"login-tab" + (isSignup ? " on" : "")}
              onClick={() => switchMode("signup")}
            >
              Crear cuenta
            </button>
          </div>
        )}

        {step === "email" ? (
          <>
            <label className="login-label" htmlFor="login-email">
              Tu email
            </label>
            <input
              id="login-email"
              className="login-input"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
            <button className="login-btn" type="submit" disabled={busy}>
              {busy ? "Enviando…" : isSignup ? "Crear cuenta y enviarme un código" : "Enviarme un código"}
            </button>
          </>
        ) : (
          <>
            {info && <p className="login-info">{info}</p>}
            <label className="login-label" htmlFor="login-code">
              Código del email
            </label>
            <input
              id="login-code"
              className="login-input login-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              required
              maxLength={10}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="123456"
            />
            <button className="login-btn" type="submit" disabled={busy}>
              {busy ? "Comprobando…" : "Entrar"}
            </button>
            <button type="button" className="login-link" onClick={() => switchMode(mode)}>
              Usar otro email o pedir otro código
            </button>
          </>
        )}

        {error && <p className="login-error">{error}</p>}
      </form>
    </div>
  );
}
