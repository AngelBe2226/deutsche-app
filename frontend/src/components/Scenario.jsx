import RichText from "./RichText";
import { useProgress } from "../progress";
import { IconCheck, IconTarget } from "./Icons";

// Escenario real (Szenario). Esquema (campo `scenario`):
//   { id: "b22-sc", situation: "<html>", goals: ["objetivo", ...] }
// Cada objetivo se marca al cumplirlo y se guarda como `${id}-g${i}`.
export default function Scenario({ sc }) {
  const { getVal, setVal, delVal } = useProgress();
  const keys = sc.goals.map((_, i) => `${sc.id}-g${i}`);
  const done = keys.filter((k) => getVal(k) != null).length;

  return (
    <div className="scenario">
      <div className="sc-head">
        <span className="sc-tag">
          <IconTarget size={13} />
          Escenario real
        </span>
        <span className="rp-count">
          {done}/{sc.goals.length} objetivos
        </span>
      </div>
      <RichText as="div" className="sc-situation" html={sc.situation} />
      <ul className="sc-goals">
        {sc.goals.map((g, i) => {
          const on = getVal(keys[i]) != null;
          return (
            <li key={i}>
              <button
                className={"sc-goal" + (on ? " on" : "")}
                onClick={() => (on ? delVal(keys[i]) : setVal(keys[i], "1"))}
                aria-pressed={on}
              >
                <span className="sc-box">{on && <IconCheck size={12} />}</span>
                <RichText html={g} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
