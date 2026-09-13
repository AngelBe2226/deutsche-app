import { useProgress } from "../progress";

// Toggle button used on rules, notes and examples to mark them as a
// "Destacado" (highlight). Persisted under the "hl:" key namespace so it
// never collides with quiz answers (b##-s#q#) or idiom flashcard state.
export default function HighlightButton({ id, label = "destacado" }) {
  const { getVal, setVal, delVal } = useProgress();
  const active = getVal(id) != null;

  function toggle(e) {
    e.stopPropagation();
    if (active) delVal(id);
    else setVal(id, "1");
  }

  return (
    <button
      type="button"
      className={"hl-btn" + (active ? " on" : "")}
      onClick={toggle}
      aria-pressed={active}
      title={active ? `Quitar de Destacados` : `Marcar como ${label}`}
    >
      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
        <path
          d="M12 2.5l2.9 6.2 6.8.7-5.1 4.6 1.5 6.7L12 17.6l-6.1 3.1 1.5-6.7-5.1-4.6 6.8-.7z"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
