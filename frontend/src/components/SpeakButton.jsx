import { speakSequence, useTTS } from "../tts";
import { IconSpeaker } from "./Icons";

// Botón «escuchar»: lee `text` en alemán. Vuelve a pulsarlo para parar.
// `alt` usa la segunda voz (el otro personaje de un diálogo).
export default function SpeakButton({ id, text, alt = false, label = "Escuchar", className = "" }) {
  const { playing, supported } = useTTS();
  if (!supported || !text) return null;
  const on = playing === id;
  return (
    <button
      type="button"
      className={"speak-btn" + (on ? " on" : "") + (className ? " " + className : "")}
      onClick={(e) => {
        e.stopPropagation();
        speakSequence(id, [{ text, alt }]);
      }}
      aria-pressed={on}
      aria-label={on ? "Detener audio" : label}
      title={on ? "Detener" : label}
    >
      <IconSpeaker size={15} />
    </button>
  );
}
