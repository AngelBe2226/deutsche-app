import { useState } from "react";
import RichText from "./RichText";
import SpeakButton from "./SpeakButton";
import { plainText, speakSequence, useTTS } from "../tts";
import { IconSpeaker } from "./Icons";

// Diálogo con turnos por rol. Esquema (en la sección, campo `dialog`):
//   { id, setting, roles: { R: { name, label } , G: {...} },
//     lines: [ { who: "R", de: "<html alemán>", es: "traducción" } ] }
// El primer rol declarado va a la izquierda y usa la voz principal; el
// segundo, a la derecha y con la segunda voz.
export default function Dialog({ dialog }) {
  const [showEs, setShowEs] = useState(false);
  const { playing, cursor, supported } = useTTS();
  const roleKeys = Object.keys(dialog.roles || {});
  const side = (who) => (roleKeys.indexOf(who) === 1 ? "right" : "left");
  const playId = `dlg-${dialog.id}`;
  const playingAll = playing === playId;

  function playAll() {
    speakSequence(
      playId,
      dialog.lines.map((l) => ({ text: plainText(l.de), alt: side(l.who) === "right" }))
    );
  }

  return (
    <div className="dialog">
      <div className="dialog-head">
        <div className="dialog-cast">
          {roleKeys.map((k) => {
            const r = dialog.roles[k];
            return (
              <span key={k} className={"cast " + side(k)}>
                <span className="avatar">{initials(r.name)}</span>
                <span className="cast-text">
                  <b>{r.name}</b>
                  <span>{r.label}</span>
                </span>
              </span>
            );
          })}
        </div>
        <div className="dialog-actions">
          {supported && (
            <button className={"chip-btn" + (playingAll ? " on" : "")} onClick={playAll}>
              <IconSpeaker size={14} />
              {playingAll ? "Detener" : "Escuchar todo"}
            </button>
          )}
          <button
            className={"chip-btn" + (showEs ? " on-soft" : "")}
            onClick={() => setShowEs((v) => !v)}
            aria-pressed={showEs}
          >
            {showEs ? "Ocultar traducción" : "Ver traducción"}
          </button>
        </div>
      </div>

      {dialog.setting && <div className="dialog-setting">{dialog.setting}</div>}

      <ol className="dialog-lines">
        {dialog.lines.map((l, i) => {
          const r = dialog.roles[l.who] || { name: l.who };
          const active = playingAll && cursor === i;
          return (
            <li key={i} className={"turn " + side(l.who) + (active ? " active" : "")}>
              <span className="avatar sm" title={r.name}>
                {initials(r.name)}
              </span>
              <div className="bubble">
                <RichText as="div" className="turn-de" html={l.de} />
                {showEs && l.es && <div className="turn-es">{l.es}</div>}
              </div>
              <SpeakButton
                id={`${playId}-l${i}`}
                text={plainText(l.de)}
                alt={side(l.who) === "right"}
                label="Escuchar turno"
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function initials(name = "") {
  const parts = name.replace(/^(Herr|Frau|Dr\.)\s+/i, "").split(/\s+/);
  return (parts[0]?.[0] || "?").toUpperCase() + (parts[1]?.[0] || "").toUpperCase();
}
