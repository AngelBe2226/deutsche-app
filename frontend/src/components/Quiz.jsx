import RichText from "./RichText";
import { useProgress } from "../progress";
import HighlightButton from "./HighlightButton";

// One multiple-choice question. Once answered it locks: the correct option
// turns green, a wrong pick turns red, and the choice is persisted by id.
export default function Quiz({ q }) {
  const { getVal, setVal } = useProgress();
  const saved = getVal(q.id);
  const chosen = saved === null ? null : parseInt(saved, 10);
  const answered = chosen !== null;

  function choose(i) {
    if (answered) return;
    setVal(q.id, String(i));
  }

  const wasRight = answered && chosen === q.correctIndex;

  return (
    <div className="quiz" data-qid={q.id}>
      <HighlightButton id={`hl:${q.id}`} label="quiz destacado" />
      <RichText as="p" className="q-question" html={q.question} />
      <div className="opts">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correctIndex;
          let cls = "";
          if (answered && isCorrect) cls = "correct";
          else if (answered && i === chosen) cls = "wrong";
          return (
            <button key={i} className={cls} disabled={answered} onClick={() => choose(i)}>
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={"fb show " + (wasRight ? "ok" : "no")}>
          {wasRight ? "✓ ¡Correcto!" : "✗ La respuesta correcta está marcada en verde."}
        </div>
      )}
    </div>
  );
}
