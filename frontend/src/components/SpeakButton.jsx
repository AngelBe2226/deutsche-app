import { speak, useTTS } from "../tts";
import { IconSpeaker } from "./Icons";

// Botón «escuchar»: lee `text` en alemán. Vuelve a pulsarlo para parar.
export default function SpeakButton({ id, text, label = "Escuchar", className = "" }) {
  const { playing, supported } = useTTS();
  if (!supported || !text) return null;
  const on = playing === id;
  return (
    <button
      type="button"
      className={"speak-btn" + (on ? " on" : "") + (className ? " " + className : "")}
      onClick={(e) => {
        e.stopPropagation();
        speak(id, text);
      }}
      aria-pressed={on}
      aria-label={on ? "Detener audio" : label}
      title={on ? "Detener" : label}
    >
      <IconSpeaker size={15} />
    </button>
  );
}
