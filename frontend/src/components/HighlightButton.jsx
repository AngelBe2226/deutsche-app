import { useProgress } from "../progress";
import { IconStar } from "./Icons";

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
      <IconStar size={15} filled={active} />
    </button>
  );
}
