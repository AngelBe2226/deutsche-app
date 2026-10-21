import { useEffect, useState } from "react";
import { api } from "../api";
import ProgressRing from "./ProgressRing";
import { IconChevronRight, IconRotate, IconRoute, IconSearch, IconStar } from "./Icons";

// Sidebar en cascada: cada capítulo (bloque) tiene un chevrón para desplegar
// sus epígrafes. Acordeón: al abrir uno se cierra el que estuviera abierto.
export default function Sidebar({
  index,
  current,
  stats,
  dueCount = 0,
  onSelectBlock,
  onGoToSection,
  onOpenSearch,
}) {
  const [expanded, setExpanded] = useState(current);
  const [secCache, setSecCache] = useState({});

  // El capítulo actual se abre solo al cambiar de bloque, y la lista se
  // desplaza para que quede a la vista (útil al saltar desde ⌘K o el pager).
  useEffect(() => {
    setExpanded(current);
    requestAnimationFrame(() =>
      document.querySelector(".nav-row.current")?.scrollIntoView({ block: "nearest" })
    );
  }, [current]);

  // Carga perezosa de los epígrafes del capítulo abierto.
  useEffect(() => {
    if (expanded && /^\d+$/.test(expanded) && !secCache[expanded]) {
      api
        .getBlock(expanded)
        .then((d) =>
          setSecCache((c) => ({
            ...c,
            [expanded]: d.sections.map((s) => ({ idx: s.idx, title: s.title })),
          }))
        )
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  const toggle = (block) => setExpanded((prev) => (prev === block ? null : block));

  // Progreso global (todos los bloques con quizzes).
  let correct = 0,
    total = 0;
  for (const s of Object.values(stats)) {
    correct += s.correct;
    total += s.total;
  }
  const overall = total ? Math.round((correct / total) * 100) : 0;

  return (
    <>
      <div className="sidebar-top">
        <button className="search-trigger" onClick={onOpenSearch}>
          <IconSearch size={15} />
          <span>Buscar tema…</span>
          <kbd>⌘K</kbd>
        </button>

        <div className="nav-pins">
          <button
            className={"nav-pin" + (current === "highlights" ? " current" : "")}
            onClick={() => onSelectBlock("highlights")}
          >
            <IconStar size={16} filled={current === "highlights"} />
            Destacados
          </button>
          <button
            className={"nav-pin" + (current === "review" ? " current" : "")}
            onClick={() => onSelectBlock("review")}
          >
            <IconRotate size={16} />
            Repaso
            {dueCount > 0 && <span className="nav-badge">{dueCount}</span>}
          </button>
          <a className="nav-pin" href={import.meta.env.BASE_URL + "roadmap.html"} target="_blank" rel="noopener">
            <IconRoute size={16} />
            Ruta A1–C2
            <span className="nav-pin-ext">↗</span>
          </a>
        </div>
      </div>

      <div className="nav-label">Temario</div>
      <nav className="toc">
        {index.map((b) => {
          const open = expanded === b.block;
          const sections = secCache[b.block];
          const st = stats[b.block];
          const pct = st && st.total ? Math.round((st.correct / st.total) * 100) : null;
          return (
            <div className={"nav-chapter" + (open ? " open" : "")} key={b.block}>
              <div className={"nav-row" + (b.block === current ? " current" : "")}>
                <button className="nav-item" onClick={() => onSelectBlock(b.block)}>
                  <span className="nav-num">{b.block}</span>
                  <span className="nav-title">{b.title}</span>
                  {pct !== null && (
                    <span className="nav-ring" title={`${st.correct}/${st.total} aciertos`}>
                      <ProgressRing pct={pct} size={16} stroke={2.2} />
                    </span>
                  )}
                </button>
                <button
                  className="nav-chevron"
                  aria-expanded={open}
                  aria-label={open ? "Contraer capítulo" : "Expandir capítulo"}
                  onClick={() => toggle(b.block)}
                >
                  <IconChevronRight size={14} className="chev" />
                </button>
              </div>

              {open && (
                <div className="nav-sections">
                  {sections ? (
                    sections.map((s) => (
                      <button
                        key={s.idx}
                        className="nav-sub"
                        onClick={() => onGoToSection(b.block, s.idx)}
                      >
                        <span className="sub-idx">{s.idx}</span>
                        <span className="sub-title">{s.title}</span>
                      </button>
                    ))
                  ) : (
                    <div className="nav-sub muted">Cargando…</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-foot">
        <div className="foot-card">
          <ProgressRing pct={overall} size={40} stroke={4} />
          <div>
            <div className="foot-title">{overall}% dominado</div>
            <div className="foot-sub">
              {correct} de {total} ejercicios
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
