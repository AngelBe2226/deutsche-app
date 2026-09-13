import { useEffect, useState } from "react";
import RichText from "./RichText";
import { useProgress } from "../progress";
import HighlightButton from "./HighlightButton";

// "Write your own sentence" box. Saves the textarea contents under its id.
export default function ProduceBox({ produce }) {
  const { getVal, setVal } = useProgress();
  const saved = getVal(produce.id) || "";
  const [text, setText] = useState(saved);
  const [note, setNote] = useState(saved ? "✓ guardado" : "");

  // Keep local text in sync when the saved value arrives after first render.
  useEffect(() => {
    setText(saved);
    setNote(saved ? "✓ guardado" : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produce.id]);

  function save() {
    setVal(produce.id, text);
    setNote("✓ guardado");
    setTimeout(() => setNote((n) => (n === "✓ guardado" ? "" : n)), 2500);
  }

  return (
    <div className="produce" data-pid={produce.id}>
      <HighlightButton id={`hl:${produce.id}`} label="frase destacada" />
      <RichText as="label" className="produce-label" html={produce.label} />
      <textarea
        value={text}
        placeholder={produce.placeholder}
        onChange={(e) => {
          setText(e.target.value);
          setNote("");
        }}
      />
      <div className="produce-actions">
        <button className="save" onClick={save}>
          Guardar
        </button>
        <span className="saved-note">{note}</span>
      </div>
    </div>
  );
}
