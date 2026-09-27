import { useMemo } from "react";
import RichText from "./RichText";
import SectionCard from "./SectionCard";
import ProgressRing from "./ProgressRing";
import Pager from "./Pager";
import { IconLayers, IconRotate, IconTarget } from "./Icons";
import { useProgress } from "../progress";

// Cada entrada de la leyenda puede declarar su rol gramatical ("role": "nom",
// "akk", "dat"...) para que el punto de color coincida con el color real de
// ese rol en los ejemplos. Si no lo declara, se cicla por esta paleta.
const LEGEND_FALLBACK = [
  "var(--role-nom)",
  "var(--role-akk)",
  "var(--role-dat)",
  "var(--role-gen)",
  "var(--role-verb)",
];

const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function BlockPage({ block, onReset, prev, next, onSelectBlock }) {
  const { getVal } = useProgress();

  const { correct, answered, total } = useMemo(() => {
    let c = 0,
      a = 0,
      t = 0;
    for (const s of block.sections) {
      for (const q of s.quiz || []) {
        t++;
        const saved = getVal(q.id);
        if (saved !== null) a++;
        if (saved !== null && parseInt(saved, 10) === q.correctIndex) c++;
      }
    }
    return { correct: c, answered: a, total: t };
  }, [block, getVal]);

  const levels = useMemo(() => {
    const set = new Set(block.sections.map((s) => s.level).filter(Boolean));
    return LEVEL_ORDER.filter((l) => set.has(l));
  }, [block]);

  const pct = total ? Math.round((correct / total) * 100) : 0;

  return (
    <article className="block-page">
      <header className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="block-kicker">
          <span className="kicker-dot" />
          {block.kicker}
        </div>
        <h1 className="block-title">{block.title}</h1>
        <RichText as="p" className="block-intro" html={block.intro} />

        <div className="stat-cards">
          {total > 0 && (
            <div className="stat-card stat-progress">
              <ProgressRing pct={pct} size={44} stroke={4.5} />
              <div className="stat-body">
                <div className="stat-value">{pct}%</div>
                <div className="stat-label">
                  {correct}/{total} aciertos · {answered} respondidas
                </div>
              </div>
              <button className="ghost-btn danger" onClick={onReset} title="Reiniciar bloque">
                <IconRotate size={14} />
                <span>Reiniciar</span>
              </button>
            </div>
          )}
          <div className="stat-card">
            <span className="stat-icon">
              <IconLayers size={18} />
            </span>
            <div className="stat-body">
              <div className="stat-value">{block.sections.length}</div>
              <div className="stat-label">epígrafes</div>
            </div>
          </div>
          {levels.length > 0 && (
            <div className="stat-card">
              <span className="stat-icon">
                <IconTarget size={18} />
              </span>
              <div className="stat-body">
                <div className="stat-levels">
                  {levels.map((l) => (
                    <span key={l} className={`level-badge level-${l.toLowerCase()}`}>
                      {l}
                    </span>
                  ))}
                </div>
                <div className="stat-label">nivel CEFR</div>
              </div>
            </div>
          )}
        </div>

        {block.legend?.length > 0 && (
          <div className="legend">
            <span className="legend-title">Código de color</span>
            {block.legend.map((l, i) => (
              <span className="legend-item" key={i}>
                <span
                  className="legend-dot"
                  style={{
                    background: l.role
                      ? `var(--role-${l.role})`
                      : LEGEND_FALLBACK[i % LEGEND_FALLBACK.length],
                  }}
                />
                <b>{l.label}</b>
                <span className="legend-desc">{l.desc}</span>
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="sections">
        {block.sections.map((s) => (
          <SectionCard key={s.idx} section={s} />
        ))}
      </div>

      <Pager prev={prev} next={next} onSelectBlock={onSelectBlock} />
    </article>
  );
}
