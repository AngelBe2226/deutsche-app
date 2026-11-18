import { useMemo, useState } from "react";
import SpeakButton from "./SpeakButton";
import { figurada } from "../figurada";
import { MODALS, SUBJECTS, TYPES, VERBS, build } from "../data/builder";

// «Fábrica de frases» (método de hablar desde el primer día): eliges sujeto,
// modal, verbo y tipo de frase, y ves la frase alemana correcta con su
// traducción. Modo reto: se tapa el alemán y lo dices tú antes de mirar.
//
// Persona: 0 ich · 1 du · 2 er/sie/es · 3 wir · 4 ihr · 5 sie/Sie
export default function SentenceBuilder() {
  const [s, setS] = useState(4);
  const [m, setM] = useState(1);
  const [v, setV] = useState(1);
  const [t, setT] = useState("afirm");
  const [challenge, setChallenge] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const out = useMemo(() => build(SUBJECTS[s], MODALS[m], VERBS[v], t), [s, m, v, t]);

  const random = () => {
    setS(Math.floor(Math.random() * SUBJECTS.length));
    setM(Math.floor(Math.random() * MODALS.length));
    setV(Math.floor(Math.random() * VERBS.length));
    setT(TYPES[Math.floor(Math.random() * TYPES.length)][0]);
    setRevealed(false);
  };
  const pick = (fn) => (e) => {
    fn(Number(e.target.value));
    setRevealed(false);
  };

  return (
    <div className="builder">
      <div className="builder-row">
        <label>
          Sujeto
          <select value={s} onChange={pick(setS)}>
            {SUBJECTS.map((x, i) => (
              <option key={i} value={i}>
                {x.de} · {x.es}
              </option>
            ))}
          </select>
        </label>
        <label>
          Modal
          <select value={m} onChange={pick(setM)}>
            {MODALS.map((x, i) => (
              <option key={i} value={i}>
                {x.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Verbo
          <select value={v} onChange={pick(setV)}>
            {VERBS.map((x, i) => (
              <option key={i} value={i}>
                {x.inf} · {x.esInf}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="builder-row builder-types">
        {TYPES.map(([k, label]) => (
          <button
            key={k}
            className={"chip-btn sm" + (t === k ? " on" : "")}
            onClick={() => {
              setT(k);
              setRevealed(false);
            }}
          >
            {label}
          </button>
        ))}
        <button className="chip-btn sm" onClick={random}>
          🎲 Al azar
        </button>
        <label className="builder-challenge">
          <input
            type="checkbox"
            checked={challenge}
            onChange={(e) => {
              setChallenge(e.target.checked);
              setRevealed(false);
            }}
          />
          Modo reto (tapa el alemán)
        </label>
      </div>

      <div className="builder-out">
        <div className="builder-es">{out.es}</div>
        {challenge && !revealed ? (
          <button className="ex-cover" onClick={() => setRevealed(true)}>
            Dilo en alemán en voz alta y toca para comprobar
          </button>
        ) : (
          <div className="builder-de">
            <span lang="de">{out.de}</span>
            <SpeakButton id="builder-say" text={out.de} label="Escuchar la frase" />
            <div className="fig">{figurada(out.de)}</div>
          </div>
        )}
        {out.tarzan && (
          <p className="builder-hint">
            Truco Tarzán: con <b>wir</b>, <b>sie</b> (ellos) y <b>Sie</b> (usted) el verbo es igual que el infinitivo.
          </p>
        )}
        {MODALS[m].key && (
          <p className="builder-hint">
            Con modal: el modal va conjugado en 2.ª posición y el otro verbo, en infinitivo, al final.
          </p>
        )}
      </div>
    </div>
  );
}
