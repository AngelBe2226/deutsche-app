import { useMemo, useState } from "react";
import RichText from "./RichText";
import SpeakButton from "./SpeakButton";
import { plainText } from "../tts";
import { IconBook } from "./Icons";

// Texto de lectura con vocabulario glosado. Esquema (campo `reading`):
//   { id, title, kind, paragraphs: ["<html>", ...] }
// Las palabras glosadas se marcan en el propio texto:
//   <span class="gl" data-es="traducción">Wort</span>
// De ahí sale tanto la burbuja al pasar el ratón como la lista «Vocabulario»
// al margen (una sola fuente, sin duplicar datos). Las preguntas de
// comprensión son el `quiz` normal de la sección.
export default function Reading({ reading }) {
  const [active, setActive] = useState(null);

  const glossary = useMemo(() => {
    const seen = new Map();
    const doc = new DOMParser().parseFromString(reading.paragraphs.join(" "), "text/html");
    doc.querySelectorAll(".gl").forEach((el) => {
      const de = el.textContent.trim();
      if (!seen.has(de.toLowerCase())) seen.set(de.toLowerCase(), { de, es: el.dataset.es || "" });
    });
    return [...seen.values()];
  }, [reading]);

  const fullText = useMemo(
    () => [reading.title, ...reading.paragraphs].map(plainText).join(" \n "),
    [reading]
  );

  // Delegación: resaltar en la lista la glosa sobre la que está el cursor.
  const onOver = (e) => {
    const el = e.target.closest?.(".gl");
    setActive(el ? el.textContent.trim().toLowerCase() : null);
  };

  return (
    <div className="reading">
      <div className="reading-main">
        <div className="reading-head">
          {reading.kind && <span className="reading-kind">{reading.kind}</span>}
          <SpeakButton id={`rd-${reading.id}`} text={fullText} label="Escuchar el texto" />
        </div>
        {reading.title && <h4 className="reading-title">{reading.title}</h4>}
        <div className="reading-text" onMouseOver={onOver} onMouseLeave={() => setActive(null)}>
          {reading.paragraphs.map((p, i) => (
            <RichText key={i} as="p" html={p} />
          ))}
        </div>
      </div>

      {glossary.length > 0 && (
        <aside className="reading-gloss" aria-label="Vocabulario">
          <div className="gloss-title">
            <IconBook size={13} />
            Vocabulario
          </div>
          <dl>
            {glossary.map((g) => (
              <div
                key={g.de}
                className={"gloss-item" + (active === g.de.toLowerCase() ? " on" : "")}
              >
                <dt>{g.de}</dt>
                <dd>{g.es}</dd>
              </div>
            ))}
          </dl>
        </aside>
      )}
    </div>
  );
}
