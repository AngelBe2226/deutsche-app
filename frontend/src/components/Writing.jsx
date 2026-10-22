import { useEffect, useState } from "react";
import RichText from "./RichText";
import { useProgress } from "../progress";
import { IconPen, IconCheck, IconEye, IconLightbulb } from "./Icons";

// Tarea de escritura (Schreiben). Esquema (campo `writing`):
//   {
//     id: "b35-wr",
//     task: "<html>",            // el encargo de redacción
//     hints: ["<html>", ...],    // (opcional) guía / Redemittel a usar
//     checklist: ["<html>", ...],// autocorrección: se marca cada punto
//     model: "<html>"            // texto modelo, oculto hasta pulsar «Ver modelo»
//   }
// Tu redacción se guarda en `id`; cada punto del checklist en `${id}-c${i}`.
export default function Writing({ w }) {
  const { getVal, setVal, delVal } = useProgress();

  const saved = getVal(w.id) || "";
  const [text, setText] = useState(saved);
  const [note, setNote] = useState(saved ? "✓ guardado" : "");
  const [showModel, setShowModel] = useState(false);

  useEffect(() => {
    setText(saved);
    setNote(saved ? "✓ guardado" : "");
    setShowModel(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w.id]);

  function save() {
    setVal(w.id, text);
    setNote("✓ guardado");
    setTimeout(() => setNote((n) => (n === "✓ guardado" ? "" : n)), 2500);
  }

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const checklist = w.checklist || [];
  const keys = checklist.map((_, i) => `${w.id}-c${i}`);
  const done = keys.filter((k) => getVal(k) != null).length;

  return (
    <div className="writing" data-wid={w.id}>
      <div className="wr-head">
        <span className="wr-tag">
          <IconPen size={13} />
          Escritura
        </span>
      </div>

      <RichText as="div" className="wr-task" html={w.task} />

      {w.hints?.length > 0 && (
        <div className="wr-hints">
          <span className="wr-hints-title">
            <IconLightbulb size={13} />
            Usa estas ideas
          </span>
          <ul>
            {w.hints.map((h, i) => (
              <li key={i}>
                <RichText html={h} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <textarea
        className="wr-textarea"
        value={text}
        placeholder={w.placeholder || "Schreib deinen Text hier…"}
        rows={8}
        onChange={(e) => {
          setText(e.target.value);
          setNote("");
        }}
      />
      <div className="wr-actions">
        <button className="wr-save" onClick={save}>
          Guardar
        </button>
        <span className="wr-words">{words} palabras</span>
        <span className="wr-saved">{note}</span>
      </div>

      {checklist.length > 0 && (
        <div className="wr-checklist">
          <div className="wr-checklist-head">
            <span className="wr-checklist-title">
              <IconCheck size={13} />
              Autocorrección
            </span>
            <span className="wr-checklist-count">
              {done}/{checklist.length}
            </span>
          </div>
          <ul>
            {checklist.map((c, i) => {
              const on = getVal(keys[i]) != null;
              return (
                <li key={i}>
                  <button
                    className={"wr-check" + (on ? " on" : "")}
                    onClick={() => (on ? delVal(keys[i]) : setVal(keys[i], "1"))}
                    aria-pressed={on}
                  >
                    <span className="wr-check-box">{on && <IconCheck size={12} />}</span>
                    <RichText html={c} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {w.model && (
        <div className="wr-model-wrap">
          <button
            className="wr-model-toggle"
            onClick={() => setShowModel((v) => !v)}
            aria-expanded={showModel}
          >
            <IconEye size={13} />
            {showModel ? "Ocultar modelo" : "Ver modelo"}
          </button>
          {showModel && (
            <div className="wr-model">
              <div className="wr-model-label">Texto modelo (una forma de resolverlo, no la única)</div>
              <RichText as="div" className="wr-model-body" html={w.model} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
