import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { useProgress } from "../progress";
import RichText from "../components/RichText";

const NOTE_LABEL = { exception: "excepción", emphasis: "ojo", tip: "truco", why: "por qué" };

const CATEGORIES = [
  { key: "todos", label: "Todos" },
  { key: "regla", label: "Reglas" },
  { key: "ejemplo", label: "Ejemplos" },
  { key: "nota", label: "Notas" },
  { key: "quiz", label: "Quiz" },
  { key: "oracion", label: "Oraciones" },
];

// Reúne todo lo marcado con el botón ★ (reglas, notas, ejemplos, preguntas
// de quiz y cajas "tu turno") en todos los bloques, con filtro por
// categoría para poder contrastarlas, y permite saltar de vuelta a su
// sección de origen.
export default function HighlightsPanel({ index, onGoToSection }) {
  const { progress } = useProgress();
  const [blocks, setBlocks] = useState(null);
  const [filter, setFilter] = useState("todos");

  useEffect(() => {
    Promise.all(index.map((b) => api.getBlock(b.block)))
      .then(setBlocks)
      .catch(() => setBlocks([]));
  }, [index]);

  const items = useMemo(() => {
    if (!blocks) return [];
    const out = [];
    for (const blk of blocks) {
      for (const s of blk.sections || []) {
        const base = { block: blk.block, blockTitle: blk.title, idx: s.idx, secTitle: s.title };

        if (s.rule && progress[`hl:${s.idx}-rule`] != null) {
          out.push({ ...base, key: `hl:${s.idx}-rule`, category: "regla", kind: "regla", html: s.rule });
        }
        if (s.reasoning && progress[`hl:${s.idx}-reasoning`] != null) {
          out.push({
            ...base,
            key: `hl:${s.idx}-reasoning`,
            category: "nota",
            noteType: "why",
            kind: "por qué",
            html: s.reasoning,
          });
        }
        (s.notes || []).forEach((n, i) => {
          const key = `hl:${s.idx}-note${i}`;
          if (progress[key] != null) {
            out.push({
              ...base,
              key,
              category: "nota",
              noteType: n.type || "emphasis",
              kind: NOTE_LABEL[n.type] || "nota",
              html: n.text,
            });
          }
        });
        (s.examples || []).forEach((ex, i) => {
          const key = `hl:${s.idx}-ex${i}`;
          if (progress[key] != null) {
            out.push({ ...base, key, category: "ejemplo", kind: "ejemplo", en: ex.en, es: ex.es });
          }
        });
        (s.quiz || []).forEach((q) => {
          const key = `hl:${q.id}`;
          if (progress[key] != null) {
            out.push({
              ...base,
              key,
              category: "quiz",
              kind: "quiz",
              question: q.question,
              options: q.options,
              correctIndex: q.correctIndex,
              savedAnswer: progress[q.id],
            });
          }
        });
        if (s.produce) {
          const key = `hl:${s.produce.id}`;
          if (progress[key] != null) {
            out.push({
              ...base,
              key,
              category: "oracion",
              kind: "oración",
              label: s.produce.label,
              placeholder: s.produce.placeholder,
              savedAnswer: progress[s.produce.id],
            });
          }
        }
      }
    }
    return out;
  }, [blocks, progress]);

  const counts = useMemo(() => {
    const c = { todos: items.length };
    for (const cat of ["regla", "ejemplo", "nota", "quiz", "oracion"]) {
      c[cat] = items.filter((it) => it.category === cat).length;
    }
    return c;
  }, [items]);

  const shown = filter === "todos" ? items : items.filter((it) => it.category === filter);

  if (!blocks) return <p className="muted center">Cargando destacados…</p>;

  return (
    <article className="block-page">
      <div className="block-kicker">Tu selección</div>
      <h2 className="block-title">Destacados</h2>
      <p className="block-intro">
        Todo lo que has marcado con <span className="hl-inline-star">★</span> en cualquier bloque:
        reglas, ejemplos, notas, preguntas de quiz y frases. Pulsa la estrella junto a cada uno
        para guardarlo aquí, y vuelve a pulsarla para quitarlo.
      </p>

      {items.length > 0 && (
        <div className="hl-filters">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              className={`hl-filter cat-${c.key}` + (filter === c.key ? " on" : "")}
              onClick={() => setFilter(c.key)}
              disabled={counts[c.key] === 0}
            >
              {c.label} <span className="hl-filter-count">{counts[c.key]}</span>
            </button>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <p className="muted center">
          Aún no has destacado nada. Explora un bloque y pulsa la ★ junto a una regla, nota,
          ejemplo, pregunta de quiz o frase.
        </p>
      ) : (
        <div className="hl-list">
          {shown.map((it) => (
            <HighlightCard key={it.key} it={it} onGoToSection={onGoToSection} />
          ))}
        </div>
      )}
    </article>
  );
}

function HighlightCard({ it, onGoToSection }) {
  const catClass =
    "hl-card cat-" +
    it.category +
    (it.category === "nota" && (it.noteType === "exception" || it.noteType === "tip")
      ? " note-" + it.noteType
      : "");

  return (
    <div className={catClass}>
      <div className="hl-card-meta">
        <span className="hl-card-tag">{it.kind}</span>
        <span className="hl-card-src">
          {it.block} · {it.idx} {it.secTitle}
        </span>
        <button className="hl-jump" onClick={() => onGoToSection(it.block, it.idx)}>
          Ir a la sección →
        </button>
      </div>

      {it.category === "ejemplo" && (
        <>
          <RichText className="ex-en" html={it.en} />
          {it.es && <span className="ex-es">{it.es}</span>}
        </>
      )}

      {(it.category === "regla" || it.category === "nota") && (
        <RichText as="div" className="hl-card-body" html={it.html} />
      )}

      {it.category === "quiz" && (
        <div className="hl-quiz">
          <RichText as="p" className="hl-quiz-q" html={it.question} />
          <div className="hl-quiz-opts">
            {it.options.map((opt, i) => {
              const isCorrect = i === it.correctIndex;
              const isChosen = it.savedAnswer != null && parseInt(it.savedAnswer, 10) === i;
              let cls = "";
              if (isCorrect) cls = "correct";
              else if (isChosen) cls = "wrong";
              return (
                <span key={i} className={"hl-quiz-opt " + cls}>
                  {opt}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {it.category === "oracion" && (
        <div className="hl-produce">
          <RichText as="div" className="hl-produce-label" html={it.label} />
          {it.savedAnswer ? (
            <p className="hl-produce-answer">“{it.savedAnswer}”</p>
          ) : (
            <p className="hl-produce-answer muted">Aún sin responder.</p>
          )}
        </div>
      )}
    </div>
  );
}
