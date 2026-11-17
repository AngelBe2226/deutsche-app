import { useEffect, useState } from "react";
import { importMacProgress, macLocalProgress } from "../api";
import { AUTH_ENABLED, useAuth } from "../auth";

// En los Macs, el progreso de antes de unificar estaba en una base local
// (SQLite). Al entrar con una cuenta se ofrece subirlo una vez. Se recuerda
// en este navegador para no volver a preguntar.
const FLAG = "mac-progress-import";

function readFlag() {
  try {
    return localStorage.getItem(FLAG);
  } catch {
    return "done";
  }
}
function writeFlag(v) {
  try {
    localStorage.setItem(FLAG, v);
  } catch {
    /* sin almacenamiento */
  }
}

export default function MacImportBanner() {
  const { session } = useAuth();
  const [items, setItems] = useState(null);
  const [state, setState] = useState("idle"); // idle | working | done | error
  const [added, setAdded] = useState(0);

  useEffect(() => {
    if (!AUTH_ENABLED || !session || readFlag()) return;
    macLocalProgress().then(setItems);
  }, [session]);

  if (!items || readFlag() === "dismissed") return null;
  const answers = Object.keys(items).filter((k) => /^b\d+-s\d+q\d+$/.test(k)).length;

  async function upload() {
    setState("working");
    try {
      const n = await importMacProgress(items);
      writeFlag("done");
      setAdded(n);
      setState("done");
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      setState("error");
    }
  }

  function dismiss() {
    writeFlag("dismissed");
    setItems(null);
  }

  return (
    <div className="mac-import" role="status">
      {state === "done" ? (
        <p>
          Listo: {added} datos subidos a tu cuenta. Recargando…
        </p>
      ) : (
        <>
          <p>
            Este Mac tiene progreso guardado de antes de las cuentas
            {answers ? ` (${answers} respuestas de quizzes)` : ""}. ¿Lo subo a la cuenta de{" "}
            <b>{session.user.email}</b>? Lo que ya tengas en la cuenta no se toca.
          </p>
          {state === "error" && <p className="mac-import-err">No se pudo subir. Revisa la conexión y vuelve a intentarlo.</p>}
          <div className="mac-import-actions">
            <button className="primary-btn" onClick={upload} disabled={state === "working"}>
              {state === "working" ? "Subiendo…" : "Subir a mi cuenta"}
            </button>
            <button className="ghost-btn" onClick={dismiss} disabled={state === "working"}>
              No es mío
            </button>
          </div>
        </>
      )}
    </div>
  );
}
