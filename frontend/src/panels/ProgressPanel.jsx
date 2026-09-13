import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { useProgress } from "../progress";

// Progreso agregado en todos los bloques de contenido. Carga el contenido de
// cada bloque (para conocer la respuesta correcta de cada quiz) y lo compara
// con las respuestas guardadas. El propio bloque de práctica (20) se excluye.
export default function ProgressPanel({ index }) {
  const { progress } = useProgress();
  const [blocks, setBlocks] = useState(null);

  useEffect(() => {
    const nums = index.map((b) => b.block).filter((b) => b !== "20");
    Promise.all(nums.map((n) => api.getBlock(n)))
      .then(setBlocks)
      .catch(() => setBlocks([]));
  }, [index]);

  const stats = useMemo(() => {
    if (!blocks) return null;
    let overallTotal = 0,
      overallCorrect = 0;
    const perBlock = [];
    for (const blk of blocks) {
      let total = 0,
        correct = 0;
      for (const s of blk.sections) {
        for (const q of s.quiz || []) {
          total++;
          const saved = progress[q.id];
          if (saved != null && parseInt(saved, 10) === q.correctIndex) correct++;
        }
      }
      overallTotal += total;
      overallCorrect += correct;
      // El Glosario no tiene quizzes: no pinta una barra vacía.
      if (total > 0) perBlock.push({ block: blk.block, title: blk.title, total, correct });
    }
    return { overallTotal, overallCorrect, perBlock };
  }, [blocks, progress]);

  if (!stats) return <p className="muted">Calculando progreso…</p>;

  const pct = stats.overallTotal
    ? Math.round((stats.overallCorrect / stats.overallTotal) * 100)
    : 0;

  return (
    <div className="progress-panel">
      <div className="overall">
        <span className="overall-pct">{pct}%</span>
        <span className="overall-count">
          {stats.overallCorrect} / {stats.overallTotal} ejercicios correctos en total
        </span>
        <div className="track big">
          <div className="fill" style={{ width: pct + "%" }} />
        </div>
      </div>

      <div className="per-block">
        {stats.perBlock.map((b) => {
          const p = b.total ? Math.round((b.correct / b.total) * 100) : 0;
          return (
            <div className="stat-bar" key={b.block}>
              <span className="lbl">
                {b.block} · {b.title}
              </span>
              <div className="track">
                <div className="fill" style={{ width: p + "%" }} />
              </div>
              <span className="pct">
                {b.correct}/{b.total} · {p}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
