import { useMemo } from "react";
import RichText from "./RichText";
import SectionCard from "./SectionCard";
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

export default function BlockPage({ block, onReset }) {
  const { getVal } = useProgress();

  const { correct, total } = useMemo(() => {
    let c = 0,
      t = 0;
    for (const s of block.sections) {
      for (const q of s.quiz || []) {
        t++;
        const saved = getVal(q.id);
        if (saved !== null && parseInt(saved, 10) === q.correctIndex) c++;
      }
    }
    return { correct: c, total: t };
  }, [block, getVal]);

  const pct = total ? Math.round((correct / total) * 100) : 0;

  return (
    <article className="block-page">
      <div className="block-kicker">{block.kicker}</div>
      <h2 className="block-title">{block.title}</h2>
      <RichText as="p" className="block-intro" html={block.intro} />

      {block.legend?.length > 0 && (
        <div className="legend">
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
              <b>{l.label}</b> — {l.desc}
            </span>
          ))}
        </div>
      )}

      {total > 0 && (
        <div className="block-progress">
          <div className="track">
            <div className="fill" style={{ width: pct + "%" }} />
          </div>
          <span className="prog-text">
            {correct} / {total} aciertos · {pct}%
          </span>
          <button className="reset-btn" onClick={onReset}>
            Reiniciar bloque
          </button>
        </div>
      )}

      <div className="sections">
        {block.sections.map((s) => (
          <SectionCard key={s.idx} section={s} />
        ))}
      </div>
    </article>
  );
}
