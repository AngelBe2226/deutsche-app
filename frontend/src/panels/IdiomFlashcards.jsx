import { useMemo, useState } from "react";
import { IDIOMS } from "../data/idioms";
import { useProgress } from "../progress";

// Flashcards for the 50 idioms. Click to flip; mark "known" or "review".
// "review" cards float to the top (a light spaced-repetition ordering).
export default function IdiomFlashcards() {
  const { getVal, setVal } = useProgress();

  const ordered = useMemo(() => {
    const rank = (s) => (s === "review" ? 0 : s == null ? 1 : 2);
    return [...IDIOMS].sort(
      (a, b) => rank(getVal("idiom:" + a[0])) - rank(getVal("idiom:" + b[0]))
    );
  }, [getVal]);

  let known = 0,
    review = 0;
  for (const [id] of IDIOMS) {
    const s = getVal("idiom:" + id);
    if (s === "known") known++;
    if (s === "review") review++;
  }

  return (
    <div className="idioms-panel">
      <div className="idiom-counts">
        <span className="chip ok">✓ Lo sé: {known}</span>
        <span className="chip no">↻ Repasar: {review}</span>
        <span className="chip muted">Sin marcar: {IDIOMS.length - known - review}</span>
      </div>
      <div className="flash-grid">
        {ordered.map(([id, idiom, meaning]) => {
          const status = getVal("idiom:" + id);
          return (
            <FlashCard
              key={id}
              id={id}
              idiom={idiom}
              meaning={meaning}
              status={status}
              onMark={(act) => setVal("idiom:" + id, act)}
            />
          );
        })}
      </div>
    </div>
  );
}

function FlashCard({ id, idiom, meaning, status, onMark }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className={
        "flash" +
        (status === "known" ? " known" : status === "review" ? " review" : "") +
        (flipped ? " flipped" : "")
      }
      onClick={() => setFlipped((f) => !f)}
    >
      <div className="fidiom">
        #{id} “{idiom}”
      </div>
      <div className="fmean">{meaning}</div>
      <div className="factions">
        <button
          className={status === "known" ? "on" : ""}
          onClick={(e) => {
            e.stopPropagation();
            onMark("known");
          }}
        >
          ✓ Lo sé
        </button>
        <button
          className={status === "review" ? "on" : ""}
          onClick={(e) => {
            e.stopPropagation();
            onMark("review");
          }}
        >
          ↻ Repasar
        </button>
      </div>
    </div>
  );
}
