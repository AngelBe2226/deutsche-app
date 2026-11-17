import { useProgress } from "../progress";
import { goTo } from "../navigate";
import RichText from "./RichText";

// Plan de estudio por días con casillas (se guardan en tu cuenta). Cada tarea
// puede enlazar a un bloque o sección de la app.
//   plan: { id, days: [ { title, minutes, tasks: [ { text, block?, idx? } ] } ] }
export default function StudyPlan({ plan }) {
  const { getVal, setVal, delVal } = useProgress();
  const key = (d, i) => `plan:${plan.id}:${d}-${i}`;
  let done = 0;
  let total = 0;
  plan.days.forEach((day, d) =>
    day.tasks.forEach((_, i) => {
      total++;
      if (getVal(key(d, i))) done++;
    })
  );

  return (
    <div className="plan">
      <div className="plan-progress">
        <div className="plan-bar">
          <span style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
        </div>
        <span>
          {done} de {total} tareas
        </span>
      </div>
      <ol className="plan-days">
        {plan.days.map((day, d) => {
          const dayDone = day.tasks.every((_, i) => getVal(key(d, i)));
          return (
            <li key={d} className={"plan-day" + (dayDone ? " done" : "")}>
              <div className="plan-day-head">
                <span className="plan-day-num">Día {d + 1}</span>
                <b>{day.title}</b>
                {day.minutes && <span className="plan-min">≈ {day.minutes} min</span>}
              </div>
              <ul>
                {day.tasks.map((t, i) => {
                  const k = key(d, i);
                  const on = !!getVal(k);
                  return (
                    <li key={i} className={on ? "on" : ""}>
                      <label>
                        <input type="checkbox" checked={on} onChange={() => (on ? delVal(k) : setVal(k, "1"))} />
                        <RichText html={t.text} de="mixed" />
                      </label>
                      {t.block && (
                        <button className="plan-go" onClick={() => goTo(t.block, t.idx)}>
                          Ir →
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
