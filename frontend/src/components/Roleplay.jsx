import { useEffect, useState } from "react";
import RichText from "./RichText";
import SpeakButton from "./SpeakButton";
import { plainText } from "../tts";
import { useProgress } from "../progress";
import { IconCheck, IconRotate } from "./Icons";

// Juego de rol guiado (Rollenspiel). Esquema (campo `roleplay`):
//   { id: "b22-rp", you: "Recepcionista",
//     partner: { name: "Frau Brandt", label: "Huésped" },
//     steps: [ { partner: "<alemán>", es: "traducción",
//                task: "qué tienes que responder", model: "<respuesta modelo>" } ] }
// El otro personaje habla, tú escribes tu turno y luego lo comparas con el
// modelo. Cada respuesta se guarda como `${id}-${i}`; los pasos se van
// desbloqueando a medida que respondes.
export default function Roleplay({ rp }) {
  const { getVal, setVal, delMany } = useProgress();
  const keys = rp.steps.map((_, i) => `${rp.id}-${i}`);
  const answered = keys.filter((k) => getVal(k) != null).length;
  const visible = Math.min(rp.steps.length, answered + 1);
  const done = answered === rp.steps.length;

  function restart() {
    if (!window.confirm("¿Empezar el juego de rol desde cero?")) return;
    delMany(keys);
  }

  return (
    <div className="roleplay">
      <div className="rp-head">
        <div className="rp-roles">
          <span className="rp-role you">
            <b>Tú</b> {rp.you}
          </span>
          <span className="rp-vs">frente a</span>
          <span className="rp-role">
            <b>{rp.partner.name}</b> {rp.partner.label}
          </span>
        </div>
        <span className="rp-count">
          {answered}/{rp.steps.length}
        </span>
      </div>
      <div className="track rp-track">
        <div className="fill" style={{ width: (answered / rp.steps.length) * 100 + "%" }} />
      </div>

      <ol className="rp-steps">
        {rp.steps.slice(0, visible).map((st, i) => (
          <RoleplayStep
            key={i}
            i={i}
            st={st}
            id={keys[i]}
            saved={getVal(keys[i])}
            onSave={(v) => setVal(keys[i], v)}
            partner={rp.partner}
          />
        ))}
      </ol>

      {done && (
        <div className="rp-done">
          <IconCheck size={16} />
          ¡Juego de rol completado! Repítelo en voz alta con el audio de los modelos.
          <button className="chip-btn" onClick={restart}>
            <IconRotate size={13} /> Repetir
          </button>
        </div>
      )}
    </div>
  );
}

function RoleplayStep({ i, st, id, saved, onSave, partner }) {
  const [text, setText] = useState(saved || "");
  useEffect(() => setText(saved || ""), [saved]);
  const answered = saved != null;

  return (
    <li className={"rp-step" + (answered ? " answered" : " current")}>
      <div className="turn left">
        <span className="avatar sm">{partner.name.replace(/^(Herr|Frau)\s+/, "")[0]}</span>
        <div className="bubble">
          <RichText as="div" className="turn-de" html={st.partner} />
          {st.es && <div className="turn-es">{st.es}</div>}
        </div>
        <SpeakButton id={`${id}-p`} text={plainText(st.partner)} label="Escuchar" />
      </div>

      <div className="rp-task">
        <span className="rp-num">{i + 1}</span>
        <RichText html={st.task} />
      </div>

      {!answered ? (
        <div className="rp-answer">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe tu respuesta en alemán…"
            rows={2}
          />
          <button className="primary-btn" disabled={!text.trim()} onClick={() => onSave(text.trim())}>
            Responder y ver modelo
          </button>
        </div>
      ) : (
        <div className="rp-compare">
          <div className="rp-yours">
            <span className="rp-label">Tu respuesta</span>
            <p>{saved}</p>
          </div>
          <div className="rp-model">
            <span className="rp-label">
              Modelo
              <SpeakButton id={`${id}-m`} text={plainText(st.model)} alt label="Escuchar modelo" />
            </span>
            <RichText as="p" html={st.model} />
          </div>
        </div>
      )}
    </li>
  );
}
