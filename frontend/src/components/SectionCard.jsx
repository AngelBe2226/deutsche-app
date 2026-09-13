import RichText from "./RichText";
import Table from "./Table";
import Quiz from "./Quiz";
import ProduceBox from "./ProduceBox";
import HighlightButton from "./HighlightButton";
import { useProgress } from "../progress";

// Etiqueta que se muestra en cada tipo de nota (excepción / énfasis / truco).
const NOTE_LABEL = {
  exception: "excepción",
  emphasis: "ojo",
  tip: "truco",
  why: "por qué",
};

function Note({ note, hlId }) {
  const type = note.type || "emphasis";
  return (
    <div className={`note note-${type}`}>
      <span className="note-tag">{note.title || NOTE_LABEL[type] || type}</span>
      <HighlightButton id={hlId} label="destacado" />
      <RichText as="div" className="note-body" html={note.text} />
    </div>
  );
}

// A subtopic card: heading + level badge, the rule (in a highlighted box),
// optional reasoning, examples, reference tables, exception/emphasis notes,
// quizzes and the produce box. Rule, notes and examples each carry a
// HighlightButton so the user can flag them for the "Destacados" panel.
export default function SectionCard({ section }) {
  const { delMany } = useProgress();
  const level = (section.level || "").toLowerCase();
  // Notas al principio (before) y al final (after) del epígrafe. El índice
  // original se conserva para que el id de resaltado sea estable.
  const notes = (section.notes || []).map((n, i) => ({ ...n, _i: i }));
  const notesBefore = notes.filter((n) => n.at === "start");
  const notesAfter = notes.filter((n) => n.at !== "start");

  function resetSectionQuiz() {
    if (!section.quiz?.length) return;
    if (!window.confirm(`¿Reiniciar las respuestas del quiz de ${section.idx}?`)) return;
    delMany(section.quiz.map((q) => q.id));
  }

  return (
    <section className="section-card" id={`sec-${section.idx.replace(/\./g, "-")}`}>
      <header className="section-head">
        <h3>
          <span className="sec-idx">{section.idx}</span>
          {section.title}
        </h3>
        {section.level && <span className={`level-badge level-${level}`}>{section.level}</span>}
      </header>

      {section.rule && (
        <div className="rule-box">
          <span className="rule-tag">regla</span>
          <HighlightButton id={`hl:${section.idx}-rule`} label="destacado" />
          <RichText as="div" className="rule" html={section.rule} />
        </div>
      )}

      {section.reasoning && (
        <div className="note note-why">
          <span className="note-tag">por qué</span>
          <HighlightButton id={`hl:${section.idx}-reasoning`} label="destacado" />
          <RichText as="div" className="note-body" html={section.reasoning} />
        </div>
      )}

      {notesBefore.map((n) => (
        <Note key={`nb-${n._i}`} note={n} hlId={`hl:${section.idx}-note${n._i}`} />
      ))}

      {section.examples?.length > 0 && (
        <ul className="examples">
          {section.examples.map((ex, i) => (
            <li key={i}>
              <HighlightButton id={`hl:${section.idx}-ex${i}`} label="ejemplo destacado" />
              <RichText className="ex-en" html={ex.en} />
              {ex.es && <span className="ex-es">{ex.es}</span>}
            </li>
          ))}
        </ul>
      )}

      {section.tables?.map((t, i) => (
        <Table key={i} table={t} />
      ))}

      {notesAfter.map((n) => (
        <Note key={`na-${n._i}`} note={n} hlId={`hl:${section.idx}-note${n._i}`} />
      ))}

      {section.quiz?.length > 0 && (
        <div className="quizzes">
          <div className="quizzes-head">
            <button className="reset-section-btn" onClick={resetSectionQuiz}>
              ↺ Reiniciar este epígrafe
            </button>
          </div>
          {section.quiz.map((q) => (
            <Quiz key={q.id} q={q} />
          ))}
        </div>
      )}

      {section.produce && <ProduceBox produce={section.produce} />}
    </section>
  );
}
