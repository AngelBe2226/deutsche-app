import { useEffect, useRef, useState } from "react";
import { EXAM_PROMPTS } from "../data/examPrompts";

const DURATION = 60;

// Timed speaking drill: pick a random prompt, then a 60s countdown.
export default function ExamSimulator() {
  const [prompt, setPrompt] = useState("Pulsa «Nueva pregunta» para empezar.");
  const [seconds, setSeconds] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [hasPrompt, setHasPrompt] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  function newPrompt() {
    clearInterval(timerRef.current);
    setRunning(false);
    setSeconds(DURATION);
    setPrompt(EXAM_PROMPTS[Math.floor(Math.random() * EXAM_PROMPTS.length)]);
    setHasPrompt(true);
  }

  function start() {
    clearInterval(timerRef.current);
    setSeconds(DURATION);
    setRunning(true);
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  const danger = seconds <= 10;
  const done = seconds === 0;

  return (
    <div className="exam-sim">
      <p className="exam-prompt">{prompt}</p>
      <div className="exam-row">
        <div className={"exam-timer" + (danger ? " danger" : "")}>
          {done ? "¡Tiempo!" : seconds}
        </div>
        <div className="exam-buttons">
          <button onClick={newPrompt}>Nueva pregunta</button>
          <button onClick={start} disabled={!hasPrompt || running}>
            Empezar
          </button>
        </div>
      </div>
    </div>
  );
}
