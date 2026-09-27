import { IconArrowRight, IconChevronLeft } from "./Icons";

// Navegación anterior / siguiente al final de cada bloque.
export default function Pager({ prev, next, onSelectBlock }) {
  if (!prev && !next) return null;
  return (
    <nav className="pager" aria-label="Capítulos">
      {prev ? (
        <button className="pager-card" onClick={() => onSelectBlock(prev.block)}>
          <span className="pager-dir">
            <IconChevronLeft size={14} /> Anterior
          </span>
          <span className="pager-title">
            <span className="pager-num">{prev.block}</span>
            {prev.title}
          </span>
        </button>
      ) : (
        <span />
      )}
      {next && (
        <button className="pager-card next" onClick={() => onSelectBlock(next.block)}>
          <span className="pager-dir">
            Siguiente <IconArrowRight size={14} />
          </span>
          <span className="pager-title">
            <span className="pager-num">{next.block}</span>
            {next.title}
          </span>
        </button>
      )}
    </nav>
  );
}
