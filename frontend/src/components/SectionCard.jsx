import RichText from "./RichText";
import Table from "./Table";
import Quiz from "./Quiz";
import ProduceBox from "./ProduceBox";
import HighlightButton from "./HighlightButton";
import SpeakButton from "./SpeakButton";
import Dialog from "./Dialog";
import Reading from "./Reading";
import Vocab from "./Vocab";
import Roleplay from "./Roleplay";
import Scenario from "./Scenario";
import OrderExercise from "./OrderExercise";
import Syntax from "./Syntax";
import { plainText } from "../tts";
import { useProgress } from "../progress";
import { IconAlert, IconEye, IconHelp, IconLightbulb, IconRotate, IconScale } from "./Icons";

// Etiqueta que se muestra en cada tipo de nota (excepción / énfasis / truco).
const NOTE_LABEL = {
  exception: "excepción",
  emphasis: "ojo",
  tip: "truco",
  why: "por qué",
};

const NOTE_ICON = {
  exception: IconAlert,
  emphasis: IconEye,
  tip: IconLightbulb,
  why: IconHelp,
};

function NoteTag({ type, children }) {
  const Icon = NOTE_ICON[type] || IconEye;
  return (
    <span className="note-tag">
      <Icon size={13} />
      {children}
    </span>
  );
}

function Note({ note, hlId }) {
  const type = note.type || "emphasis";
  return (
    <div className={`note note-${type}`}>
      <NoteTag type={type}>{note.title || NOTE_LABEL[type] || type}</NoteTag>
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
          <span className="rule-tag">
            <IconScale size={13} />
            regla
          </span>
          <HighlightButton id={`hl:${section.idx}-rule`} label="destacado" />
          <RichText as="div" className="rule" html={section.rule} />
        </div>
      )}

      {section.reasoning && (
        <div className="note note-why">
          <NoteTag type="why">por qué</NoteTag>
          <HighlightButton id={`hl:${section.idx}-reasoning`} label="destacado" />
          <RichText as="div" className="note-body" html={section.reasoning} />
        </div>
      )}

      {notesBefore.map((n) => (
        <Note key={`nb-${n._i}`} note={n} hlId={`hl:${section.idx}-note${n._i}`} />
      ))}

      {section.vocab && <Vocab vocab={section.vocab} />}

      {section.scenario && <Scenario sc={section.scenario} />}

      {section.dialog && <Dialog dialog={section.dialog} />}

      {section.roleplay && <Roleplay rp={section.roleplay} />}

      {section.reading && <Reading reading={section.reading} />}

      {section.order && <OrderExercise ex={section.order} />}

      {section.syntax && <Syntax syn={section.syntax} />}

      {section.examples?.length > 0 && (
        <ul className="examples" aria-label="Ejemplos">
          {section.examples.map((ex, i) => (
            <li key={i}>
              <SpeakButton id={`${section.idx}-ex${i}`} text={plainText(ex.en)} label="Escuchar ejemplo" />
              <HighlightButton id={`hl:${section.idx}-ex${i}`} label="ejemplo destacado" />
              <RichText className="ex-en" html={ex.en} />
              {ex.es && <span className="ex-es">{ex.es}</span>}
            </li>
          ))}
        </ul>
      )}

      {section.tables?.map((t, i) => (
        <Table key={i} table={t} id={`${section.idx}-t${i}`} />
      ))}

      {notesAfter.map((n) => (
        <Note key={`na-${n._i}`} note={n} hlId={`hl:${section.idx}-note${n._i}`} />
      ))}

      {section.quiz?.length > 0 && (
        <div className="quizzes">
          <div className="quizzes-head">
            <span className="quizzes-title">
              {section.reading ? "Comprensión lectora" : "Comprueba lo aprendido"}
            </span>
            <button className="reset-section-btn" onClick={resetSectionQuiz}>
              <IconRotate size={12} />
              Reiniciar epígrafe
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
