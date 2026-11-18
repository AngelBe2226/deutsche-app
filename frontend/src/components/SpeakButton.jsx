import { speakSequence, useTTS } from "../tts";

// Botón «escuchar»: lee `text` en alemán con la voz real (MP3) si existe y,
// si no, con la del sistema. Vuelve a pulsarlo para parar. `alt` usa la
// segunda voz del sistema (el otro personaje de un diálogo).
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
      <SpeakerIcon playing={on} />
    </button>
  );
}

// Altavoz con ondas; mientras suena, las ondas laten y aparece el «stop».
export function SpeakerIcon({ playing }) {
  return (
    <svg className="speak-ico" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path className="speak-wave w1" d="M15.2 9.2a4 4 0 0 1 0 5.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path className="speak-wave w2" d="M17.8 6.8a7.4 7.4 0 0 1 0 10.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {playing && <rect className="speak-stop" x="6.5" y="6.5" width="11" height="11" rx="2.2" fill="currentColor" />}
    </svg>
  );
}
