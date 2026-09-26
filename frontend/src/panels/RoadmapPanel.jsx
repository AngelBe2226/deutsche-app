import { useMemo } from "react";
import { useProgress } from "../progress";
import { ROADMAP, ALL_IDS, groupIds } from "../data/roadmap";

const KEY = (id) => "roadmap:" + id;

function Check() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <polyline
        points="4 12 10 18 20 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Vista nativa de la hoja de ruta A1–C2. Adopta la estética del roadmap web
// (Fraunces + dorado + tarjetas) pero vive dentro de la app y guarda el
// progreso de los checks en el backend, como el resto de la app.
export default function RoadmapPanel() {
  const { progress, setVal, delVal, resetPrefix } = useProgress();

  const isDone = (id) => progress[KEY(id)] != null;
  const toggle = (id) => (isDone(id) ? delVal(KEY(id)) : setVal(KEY(id), "1"));

  const doneTotal = useMemo(
    () => ALL_IDS.filter((id) => progress[KEY(id)] != null).length,
    [progress]
  );

  const handleReset = () => {
    if (window.confirm("¿Desmarcar toda la ruta?")) resetPrefix("roadmap:");
  };

  const c = ROADMAP.current;
  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const max = Math.max(...levels.map((k) => c[k] || 0));

  return (
    <div className="roadmap">
      <div className="rm-top">
        <div>
          <div className="rm-stamp">Hoja de ruta · act. {ROADMAP.updated}</div>
          <h1 className="rm-h1">De índice de gramática a método completo</h1>
        </div>
        <div className="rm-prog">
          <span className="rm-count">
            <b>{doneTotal}</b> / {ALL_IDS.length} hechos
          </span>
          <div className="rm-bar">
            <i style={{ width: (ALL_IDS.length ? (doneTotal / ALL_IDS.length) * 100 : 0) + "%" }} />
          </div>
          <button className="rm-reset" onClick={handleReset}>
            Reiniciar
          </button>
        </div>
      </div>

      <p className="rm-lede">
        Hoy la app enseña gramática con frases sueltas, tests, glosario y flashcards, y cubre A1–B1
        con solidez. Esta ruta marca lo que falta para llegar a un método A1–C2 con las cuatro
        destrezas, vocabulario temático y niveles altos. Marca cada punto conforme lo construimos;
        el progreso se guarda con tu progreso de la app.
      </p>

      {/* Diagnóstico CEFR */}
      <div className="rm-diag">
        <h2 className="rm-diag-h">Estado actual · cobertura por nivel</h2>
        <p className="rm-diag-sub">
          Secciones de contenido existentes hoy. B2 apenas empieza; C1 y C2 no existen.
        </p>
        <div className="rm-cefr">
          {levels.map((k) => {
            const v = c[k] || 0;
            const h = v === 0 ? 4 : Math.max(Math.round((v / max) * 100), 6);
            return (
              <div className={"rm-col" + (v === 0 ? " zero" : "")} key={k}>
                <div className="rm-track">
                  <div className="rm-fill" style={{ height: h + "%" }} />
                </div>
                <div className="rm-lv">{k}</div>
                <div className="rm-num">{v}</div>
              </div>
            );
          })}
        </div>
        <div className="rm-legend">
          <span>
            <i className="rm-dot solid" /> secciones existentes
          </span>
          <span>
            <i className="rm-dot dashed" /> nivel sin contenido
          </span>
        </div>
      </div>

      {ROADMAP.groups.map((g) => {
        const ids = groupIds(g);
        const done = ids.filter((id) => isDone(id)).length;
        return (
          <section className="rm-grp" key={g.id}>
            <header className="rm-grp-head">
              <span className="rm-grp-n">{g.kind === "phases" ? "07 fases" : ids.length + " ítems"}</span>
              <h2>{g.title}</h2>
              <span className="rm-grp-count">
                {done}/{ids.length}
              </span>
            </header>
            {g.intro && <p className="rm-grp-intro">{g.intro}</p>}

            {g.kind === "phases" &&
              g.phases.map((p) => (
                <div className="rm-phase" key={p.n}>
                  <div className="rm-ph-head">
                    <div className="rm-badge">{p.n}</div>
                    <div className="rm-ph-title">
                      <b>{p.name}</b>
                      <div className="rm-goal">{p.goal}</div>
                      <div className="rm-tags">
                        <span className="rm-tag imp">{p.impact}</span>
                        <span className="rm-tag">{p.effort}</span>
                      </div>
                    </div>
                  </div>
                  <ul className="rm-items">
                    {p.items.map((it) => (
                      <Item key={it.id} it={it} done={isDone(it.id)} onToggle={toggle} />
                    ))}
                  </ul>
                </div>
              ))}

            {g.kind === "checklist" && (
              <div className="rm-card">
                <ul className="rm-items">
                  {g.items.map((it) => (
                    <Item key={it.id} it={it} done={isDone(it.id)} onToggle={toggle} />
                  ))}
                </ul>
              </div>
            )}

            {g.kind === "verticals" && (
              <div className="rm-vgrid">
                {g.items.map((it) => (
                  <VCard key={it.id} it={it} done={isDone(it.id)} onToggle={toggle} />
                ))}
              </div>
            )}
          </section>
        );
      })}

      <footer className="rm-foot">
        Plan de contenido A1–C2 · redactado por Claude; conviene validar C1/C2 y las verticales con
        un profe nativo antes de producir en masa.
      </footer>
    </div>
  );
}

function Item({ it, done, onToggle }) {
  return (
    <li
      className={"rm-item" + (done ? " done" : "")}
      role="button"
      tabIndex={0}
      aria-pressed={done}
      onClick={() => onToggle(it.id)}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onToggle(it.id);
        }
      }}
    >
      <span className="rm-box">
        <Check />
      </span>
      <div className="rm-txt">
        <div className="rm-t">{it.t}</div>
        {it.note && <div className="rm-note">{it.note}</div>}
      </div>
    </li>
  );
}

function VCard({ it, done, onToggle }) {
  return (
    <div
      className={"rm-vcard" + (done ? " done" : "")}
      role="button"
      tabIndex={0}
      aria-pressed={done}
      onClick={() => onToggle(it.id)}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onToggle(it.id);
        }
      }}
    >
      <span className="rm-box">
        <Check />
      </span>
      <div className="rm-txt">
        <div className="rm-t">{it.t}</div>
        {it.note && <div className="rm-note">{it.note}</div>}
      </div>
    </div>
  );
}
