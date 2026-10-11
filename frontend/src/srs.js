import { useMemo } from "react";
import { useProgress } from "./progress";

// Repaso espaciado (SRS) sobre el mismo almacén de progreso (SQLite).
// Cada pregunta de quiz tiene, además de su respuesta original (`b03-s1q1`),
// un estado de memoria en `srs:b03-s1q1` = JSON { box, due, lapses, reps, last }.
//
// Sistema Leitner: acertar sube una caja y aleja el próximo repaso; fallar la
// devuelve a la caja 0 (hoy mismo) y cuenta como fallo. Los fallos (`lapses`)
// son el registro de errores con el que se arma el repaso dirigido.

const DAY = 24 * 60 * 60 * 1000;
// Días hasta el siguiente repaso según la caja (0 = hoy).
export const INTERVALS = [0, 1, 3, 7, 16, 35, 90];
export const MAX_BOX = INTERVALS.length - 1;
// A partir de esta caja consideramos la pregunta «aprendida».
export const LEARNED_BOX = 4;

export const srsKey = (qid) => "srs:" + qid;

export function parse(val) {
  if (!val) return null;
  try {
    return JSON.parse(val);
  } catch (e) {
    return null;
  }
}

function startOfDay(t) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

// Próxima fecha: a las 4:00 del día que toque, para que «hoy» signifique
// lo mismo aunque repases de noche.
function dueFor(box, now) {
  if (!INTERVALS[box]) return now;
  return startOfDay(now) + INTERVALS[box] * DAY + 4 * 60 * 60 * 1000;
}

// Estado tras responder (en el contenido o en una sesión de repaso).
export function next(state, correct, now = Date.now()) {
  const s = state || { box: 0, lapses: 0, reps: 0 };
  const box = correct ? Math.min(MAX_BOX, (state ? s.box : 0) + 1) : 0;
  return {
    box,
    due: correct ? dueFor(box, now) : now,
    lapses: s.lapses + (correct ? 0 : 1),
    reps: s.reps + 1,
    last: now,
  };
}

export const isDue = (st, now = Date.now()) => !!st && st.due <= now;

// Todas las preguntas del temario con su estado de memoria. Las respondidas
// antes de existir el SRS se incorporan solas: un fallo antiguo cuenta como
// pendiente para hoy; un acierto, como caja 1.
export function useReviewItems(blocks) {
  const { progress } = useProgress();
  return useMemo(() => {
    const out = [];
    const now = Date.now();
    for (const blk of blocks || []) {
      for (const s of blk.sections || []) {
        for (const q of s.quiz || []) {
          let st = parse(progress[srsKey(q.id)]);
          const answer = progress[q.id];
          if (!st && answer != null) {
            const right = parseInt(answer, 10) === q.correctIndex;
            st = right
              ? { box: 1, due: now + DAY, lapses: 0, reps: 1, legacy: true }
              : { box: 0, due: now, lapses: 1, reps: 1, legacy: true };
          }
          out.push({
            q,
            block: blk.block,
            blockTitle: blk.title,
            idx: s.idx,
            secTitle: s.title,
            level: s.level,
            st,
          });
        }
      }
    }
    return out;
  }, [blocks, progress]);
}

// Resumen para la barra lateral y el panel.
export function summarize(items, now = Date.now()) {
  const seen = items.filter((it) => it.st);
  const due = seen.filter((it) => isDue(it.st, now));
  const learned = seen.filter((it) => it.st.box >= LEARNED_BOX);
  const lapses = seen.reduce((n, it) => n + (it.st.lapses || 0), 0);
  // Previsión: preguntas que vencen cada uno de los próximos 7 días.
  const today = startOfDay(now);
  const forecast = Array.from({ length: 7 }, (_, d) => {
    const from = today + d * DAY;
    const to = from + DAY;
    return seen.filter((it) => (d === 0 ? it.st.due < to : it.st.due >= from && it.st.due < to)).length;
  });
  return { seen: seen.length, due: due.length, learned: learned.length, lapses, forecast };
}

// Registro de fallos agrupado por epígrafe (tema), de más a menos fallado.
export function weakSpots(items) {
  const bySec = new Map();
  for (const it of items) {
    if (!it.st?.lapses) continue;
    const k = it.idx;
    const cur = bySec.get(k) || {
      idx: it.idx,
      block: it.block,
      blockTitle: it.blockTitle,
      secTitle: it.secTitle,
      lapses: 0,
      questions: 0,
    };
    cur.lapses += it.st.lapses;
    cur.questions += 1;
    bySec.set(k, cur);
  }
  return [...bySec.values()].sort((a, b) => b.lapses - a.lapses);
}

// Cola de una sesión: lo vencido primero (cajas bajas y más fallado delante).
// Con `idx` se arma una sesión dirigida a un tema: todas sus preguntas con
// algún fallo, estén vencidas o no.
export function buildQueue(items, { idx = null, limit = 20, now = Date.now() } = {}) {
  const pool = idx
    ? items.filter((it) => it.idx === idx && (it.st?.lapses || isDue(it.st, now)))
    : items.filter((it) => isDue(it.st, now));
  return pool
    .sort((a, b) => a.st.box - b.st.box || b.st.lapses - a.st.lapses || a.st.due - b.st.due)
    .slice(0, limit);
}
