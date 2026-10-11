import { useMemo, useState } from "react";
import RichText from "./RichText";
import { useProgress } from "../progress";
import { IconCheck, IconChevronLeft, IconRotate } from "./Icons";

// Ejercicio «ordenar» (p. ej. los hechos de una lectura). Esquema (campo
// `order` de la sección): { id: "bXX-…", prompt, items: ["…", …] } con
// `items` en el orden CORRECTO. Se muestran desordenados (siempre igual para
// el mismo id) y se reordenan con las flechas. Resuelto → se guarda `id`.
export default function OrderExercise({ ex }) {
  const { getVal, setVal, delVal } = useProgress();
  const solved = getVal(ex.id) != null;
  const start = useMemo(() => shuffled(ex.items.length, ex.id), [ex]);
  const [order, setOrder] = useState(start);
  const [checked, setChecked] = useState(false);

  const shown = solved ? ex.items.map((_, i) => i) : order;
  const allRight = order.every((v, i) => v === i);

  function move(pos, dir) {
    const to = pos + dir;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    [next[pos], next[to]] = [next[to], next[pos]];
    setOrder(next);
    setChecked(false);
  }

  function check() {
    setChecked(true);
    if (allRight) setVal(ex.id, "1");
  }

  function reset() {
    delVal(ex.id);
    setOrder(start);
    setChecked(false);
  }

  return (
    <div className={"order-ex" + (solved ? " solved" : "")}>
      <div className="order-head">
        <span className="order-tag">Ordena</span>
        <RichText html={ex.prompt} />
      </div>
      <ol className="order-list">
        {shown.map((itemIdx, pos) => {
          const state = solved || (checked && itemIdx === pos) ? " ok" : checked ? " no" : "";
          return (
            <li key={itemIdx} className={"order-item" + state}>
              <span className="order-pos">{pos + 1}</span>
              <RichText className="order-text" html={ex.items[itemIdx]} />
              {!solved && (
                <span className="order-moves">
                  <button
                    className="order-btn up"
                    onClick={() => move(pos, -1)}
                    disabled={pos === 0}
                    aria-label="Subir"
                  >
                    <IconChevronLeft size={14} />
                  </button>
                  <button
                    className="order-btn down"
                    onClick={() => move(pos, 1)}
                    disabled={pos === shown.length - 1}
                    aria-label="Bajar"
                  >
                    <IconChevronLeft size={14} />
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <div className="order-actions">
        {solved ? (
          <>
            <span className="fb ok">
              <IconCheck size={15} /> ¡Orden correcto!
            </span>
            <button className="reset-section-btn" onClick={reset}>
              <IconRotate size={12} /> Repetir
            </button>
          </>
        ) : (
          <>
            <button className="primary-btn" onClick={check}>
              Comprobar
            </button>
            {checked && !allRight && (
              <span className="fb no">
                {order.filter((v, i) => v === i).length} de {order.length} en su sitio. Sigue
                moviendo los marcados en rojo.
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Permutación pseudoaleatoria estable (semilla = id) que nunca es la solución.
function shuffled(n, seed) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const rnd = () => ((h = (h * 1103515245 + 12345) >>> 0) / 2 ** 32);
  const a = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (n > 1 && a.every((v, i) => v === i)) a.push(a.shift());
  return a;
}
