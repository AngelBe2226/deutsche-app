import { useEffect, useState } from "react";
import { api } from "../api";

function Chevron() {
  return (
    <svg className="chev" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M9 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Sidebar en cascada: cada capítulo (bloque) tiene un chevrón para desplegar
// sus epígrafes. Acordeón: al abrir uno se cierra el que estuviera abierto.
export default function Sidebar({ index, current, onSelectBlock, onGoToSection }) {
  const [expanded, setExpanded] = useState(current);
  const [secCache, setSecCache] = useState({});

  // El capítulo actual se abre solo al cambiar de bloque.
  useEffect(() => {
    setExpanded(current);
  }, [current]);

  // Carga perezosa de los epígrafes del capítulo abierto.
  useEffect(() => {
    if (expanded && expanded !== "highlights" && !secCache[expanded]) {
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

  return (
    <>
      <button
        className={"nav-pin" + (current === "highlights" ? " current" : "")}
        onClick={() => onSelectBlock("highlights")}
      >
        <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
          <path
            d="M12 2.5l2.9 6.2 6.8.7-5.1 4.6 1.5 6.7L12 17.6l-6.1 3.1 1.5-6.7-5.1-4.6 6.8-.7z"
            fill={current === "highlights" ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        Destacados
      </button>

      <nav className="toc">
      {index.map((b) => {
        const open = expanded === b.block;
        const sections = secCache[b.block];
        return (
          <div className={"nav-chapter" + (open ? " open" : "")} key={b.block}>
            <div className={"nav-row" + (b.block === current ? " current" : "")}>
              <button className="nav-item" onClick={() => onSelectBlock(b.block)}>
                <span className="nav-num">{b.block}</span>
                <span className="nav-title">{b.title}</span>
              </button>
              <button
                className="nav-chevron"
                aria-expanded={open}
                aria-label={open ? "Contraer capítulo" : "Expandir capítulo"}
                onClick={() => toggle(b.block)}
              >
                <Chevron />
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
    </>
  );
}
