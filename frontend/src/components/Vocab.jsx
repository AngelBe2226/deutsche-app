import { useState } from "react";
import SpeakButton from "./SpeakButton";

// Vocabulario temático (Wortschatz). Esquema (campo `vocab`):
//   { id, items: [ { de: "die Rezeption", pl: "-en", es: "la recepción" } ] }
// El artículo se colorea por género (der · die · das) y «Ocultar español»
// convierte la rejilla en un autotest: pulsa una tarjeta para ver la
// traducción.
const GENDER = { der: "m", die: "f", das: "n" };

export default function Vocab({ vocab }) {
  const [hideEs, setHideEs] = useState(false);
  const [shown, setShown] = useState(() => new Set());

  const toggleCard = (i) =>
    setShown((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  return (
    <div className="vocab">
      <div className="vocab-bar">
        <span className="vocab-legend">
          <i className="g-m">der</i>
          <i className="g-f">die</i>
          <i className="g-n">das</i>
          <span>{vocab.items.length} palabras</span>
        </span>
        <button
          className={"chip-btn" + (hideEs ? " on-soft" : "")}
          onClick={() => {
            setHideEs((v) => !v);
            setShown(new Set());
          }}
          aria-pressed={hideEs}
        >
          {hideEs ? "Mostrar español" : "Ocultar español"}
        </button>
      </div>
      <div className="vocab-grid">
        {vocab.items.map((it, i) => {
          const [first, ...rest] = it.de.split(" ");
          const g = GENDER[first.toLowerCase()];
          const reveal = !hideEs || shown.has(i);
          return (
            <div
              key={i}
              className={"vcab" + (hideEs ? " testing" : "") + (reveal ? "" : " hidden-es")}
              onClick={() => hideEs && toggleCard(i)}
            >
              <div className="vcab-de">
                {g ? (
                  <>
                    <span className={"art g-" + g}>{first}</span> {rest.join(" ")}
                  </>
                ) : (
                  it.de
                )}
                {it.pl && <span className="vcab-pl">{it.pl}</span>}
              </div>
              <div className="vcab-es">{reveal ? it.es : "· · ·"}</div>
              <SpeakButton id={`${vocab.id}-${i}`} text={it.de} label="Escuchar palabra" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
