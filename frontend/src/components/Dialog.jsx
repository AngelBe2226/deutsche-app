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
// Modo «completa el turno»: eliges un personaje y sus frases se ocultan; ves
// la traducción como pista, escribes tu versión y la comparas con el original.
export default function Dialog({ dialog }) {
  const [showEs, setShowEs] = useState(false);
  const [practice, setPractice] = useState(null); // rol que hace el alumno
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

      <div className="dialog-practice">
        <span>Completa el turno:</span>
        {roleKeys.map((k) => (
          <button
            key={k}
            className={"chip-btn sm" + (practice === k ? " on-soft" : "")}
            onClick={() => setPractice((p) => (p === k ? null : k))}
            aria-pressed={practice === k}
          >
            Hacer de {dialog.roles[k].name}
          </button>
        ))}
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
              {practice === l.who ? (
                <GapTurn key={practice} line={l} />
              ) : (
                <div className="bubble">
                  <RichText as="div" className="turn-de" html={l.de} />
                  {showEs && l.es && <div className="turn-es">{l.es}</div>}
                </div>
              )}
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

// Turno a completar: pista en español → tu frase → comparación con el original.
function GapTurn({ line }) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);
  const original = plainText(line.de);
  const score = checked ? overlap(text, original) : 0;

  return (
    <div className="bubble gap">
      <div className="gap-hint">{line.es || "Tu turno"}</div>
      {!checked ? (
        <form
          className="gap-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim()) setChecked(true);
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Dilo en alemán…"
            lang="de"
            spellCheck="false"
          />
          <button className="chip-btn sm" type="submit" disabled={!text.trim()}>
            Comprobar
          </button>
          <button className="chip-btn sm ghost" type="button" onClick={() => setChecked(true)}>
            Ver
          </button>
        </form>
      ) : (
        <div className="gap-result">
          {text.trim() && (
            <div className="gap-yours">
              <span className={"gap-score " + (score >= 0.8 ? "ok" : score >= 0.5 ? "mid" : "low")}>
                {Math.round(score * 100)} %
              </span>
              {text}
            </div>
          )}
          <RichText as="div" className="turn-de" html={line.de} />
          <button
            className="gap-retry"
            onClick={() => {
              setChecked(false);
              setText("");
            }}
          >
            Otra vez
          </button>
        </div>
      )}
    </div>
  );
}

// Parecido aproximado: % de palabras del original que aparecen en tu frase.
function overlap(a, b) {
  const norm = (s) =>
    s
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter(Boolean);
  const mine = norm(a);
  const ref = norm(b);
  if (!ref.length) return 0;
  const pool = [...mine];
  let hit = 0;
  for (const w of ref) {
    const j = pool.indexOf(w);
    if (j >= 0) {
      hit++;
      pool.splice(j, 1);
    }
  }
  return hit / Math.max(ref.length, mine.length);
}

function initials(name = "") {
  const parts = name.replace(/^(Herr|Frau|Dr\.)\s+/i, "").split(/\s+/);
  return (parts[0]?.[0] || "?").toUpperCase() + (parts[1]?.[0] || "").toUpperCase();
}
