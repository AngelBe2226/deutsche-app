import { useState } from "react";
import RichText from "./RichText";
import SpeakButton from "./SpeakButton";
import HighlightButton from "./HighlightButton";
import { plainText, speakEcho, useTTS } from "../tts";

// Lista de ejemplos con las herramientas del método:
//  - Kartonkarte: tapa el español (traduces del alemán) o el alemán (traduces
//    del español); toca la línea tapada para comprobar.
//  - Modo eco: escucha cada frase y repítela en voz alta en la pausa.
const MODES = [
  ["none", "Ver todo"],
  ["es", "Tapar español"],
  ["de", "Tapar alemán"],
];

export default function Examples({ idx, examples }) {
  const [mode, setMode] = useState("none");
  const [shown, setShown] = useState(() => new Set());
  const { playing, cursor, supported } = useTTS();
  const echoId = `${idx}-echo`;
  const echoOn = playing === echoId;
  const hasEs = examples.some((ex) => ex.es);

  const reveal = (i) =>
    setShown((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  return (
    <>
      <div className="ex-tools" role="toolbar" aria-label="Practicar ejemplos">
        {hasEs &&
          MODES.map(([m, label]) => (
            <button
              key={m}
              className={"chip-btn sm" + (mode === m ? " on" : "")}
              aria-pressed={mode === m}
              onClick={() => {
                setMode(m);
                setShown(new Set());
              }}
            >
              {label}
            </button>
          ))}
        {supported && (
          <button
            className={"chip-btn sm" + (echoOn ? " on" : "")}
            onClick={() => speakEcho(echoId, examples.map((ex) => plainText(ex.en)))}
            title="Escucha cada frase y repítela en voz alta durante la pausa"
          >
            {echoOn ? "■ Parar eco" : "▶ Modo eco"}
          </button>
        )}
      </div>
      <ul className="examples" aria-label="Ejemplos">
        {examples.map((ex, i) => {
          const hidden = !shown.has(i);
          const hideDe = mode === "de" && hidden;
          const hideEs = mode === "es" && hidden;
          return (
            <li key={i} className={echoOn && cursor === i ? "echo-now" : ""}>
              <SpeakButton id={`${idx}-ex${i}`} text={plainText(ex.en)} label="Escuchar ejemplo" />
              <HighlightButton id={`hl:${idx}-ex${i}`} label="ejemplo destacado" />
              {hideDe ? (
                <button className="ex-cover" onClick={() => reveal(i)}>
                  Di la frase en alemán y toca para comprobar
                </button>
              ) : (
                <RichText className="ex-en" html={ex.en} de="de" />
              )}
              {ex.es &&
                (hideEs ? (
                  <button className="ex-cover ex-cover-es" onClick={() => reveal(i)}>
                    ¿Qué significa? Toca para ver
                  </button>
                ) : (
                  <span className="ex-es">{ex.es}</span>
                ))}
            </li>
          );
        })}
      </ul>
    </>
  );
}
