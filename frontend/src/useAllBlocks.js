import { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { useProgress } from "./progress";

// Contenido completo de todos los bloques, pedido una sola vez por sesión y
// compartido por la barra lateral (progreso por capítulo) y el buscador ⌘K.
let cache = null;

export function useAllBlocks(index) {
  const [blocks, setBlocks] = useState(null);

  useEffect(() => {
    if (!index.length) return;
    if (!cache) {
      cache = Promise.all(index.map((b) => api.getBlock(b.block))).catch(() => {
        cache = null;
        return [];
      });
    }
    let alive = true;
    cache.then((b) => alive && setBlocks(b));
    return () => {
      alive = false;
    };
  }, [index]);

  return blocks;
}

// Aciertos / total de quizzes por bloque: { "03": { correct, total }, ... }.
export function useBlockStats(blocks) {
  const { progress } = useProgress();
  return useMemo(() => {
    const out = {};
    for (const blk of blocks || []) {
      let total = 0,
        correct = 0;
      for (const s of blk.sections || []) {
        for (const q of s.quiz || []) {
          total++;
          const saved = progress[q.id];
          if (saved != null && parseInt(saved, 10) === q.correctIndex) correct++;
        }
      }
      out[blk.block] = { correct, total };
    }
    return out;
  }, [blocks, progress]);
}
