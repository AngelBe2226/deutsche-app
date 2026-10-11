import { useMemo, useState } from "react";
import RichText from "../components/RichText";
import SpeakButton from "../components/SpeakButton";
import { useProgress } from "../progress";
import { quizSentence } from "../tts";
import {
  buildQueue,
  next,
  srsKey,
  summarize,
  useReviewItems,
  weakSpots,
} from "../srs";
import { IconArrowRight, IconCheck, IconRotate, IconTarget, IconX } from "../components/Icons";

const DAYS = ["hoy", "mañana"];
const dayLabel = (d) =>
  DAYS[d] || new Date(Date.now() + d * 864e5).toLocaleDateString("es", { weekday: "short" });

// Panel «Repaso»: repaso espaciado de todo lo respondido, registro de fallos
// por tema y sesiones dirigidas a lo que más se falla.
export default function ReviewPanel({ blocks, onGoToSection }) {
  const items = useReviewItems(blocks);
  const sum = useMemo(() => summarize(items), [items]);
  const weak = useMemo(() => weakSpots(items).slice(0, 8), [items]);
  const worst = useMemo(
    () =>
      items
        .filter((it) => it.st?.lapses)
        .sort((a, b) => b.st.lapses - a.st.lapses || a.st.box - b.st.box)
        .slice(0, 6),
    [items]
  );
  const [session, setSession] = useState(null); // { queue, title }

  if (!blocks) return <p className="empty-state">Cargando repaso…</p>;

  if (session) {
    return (
      <ReviewSession
        session={session}
        onExit={() => setSession(null)}
        onGoToSection={onGoToSection}
      />
    );
  }

  const start = (idx = null, title = "Repaso de hoy") => {
    const queue = buildQueue(items, { idx });
    if (queue.length) setSession({ queue, title, startedWith: queue.length });
  };
  const maxF = Math.max(1, ...sum.forecast);

  return (
    <article className="block-page">
      <header className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="block-kicker">
          <span className="kicker-dot" />
          Repaso inteligente
        </div>
        <h1 className="block-title">Repaso</h1>
        <p className="block-intro">
          Cada pregunta que respondes en el temario entra aquí. Lo que fallas vuelve{" "}
          <b className="hl">hoy mismo</b>; lo que aciertas, cada vez más espaciado (1, 3, 7, 16, 35 y
          90 días), justo antes de que se te olvide.
        </p>

        <div className="stat-cards">
          <div className="stat-card stat-progress review-cta">
            <span className="stat-icon big">
              <IconRotate size={20} />
            </span>
            <div className="stat-body">
              <div className="stat-value">{sum.due}</div>
              <div className="stat-label">
                {sum.due === 1 ? "pregunta pendiente hoy" : "preguntas pendientes hoy"}
              </div>
            </div>
            <button className="primary-btn" disabled={!sum.due} onClick={() => start()}>
              {sum.due ? "Empezar repaso" : "Al día"}
            </button>
          </div>
          <div className="stat-card">
            <span className="stat-icon">
              <IconCheck size={18} />
            </span>
            <div className="stat-body">
              <div className="stat-value">
                {sum.learned}
                <span className="stat-of">/{sum.seen}</span>
              </div>
              <div className="stat-label">aprendidas</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon warn">
              <IconX size={18} />
            </span>
            <div className="stat-body">
              <div className="stat-value">{sum.lapses}</div>
              <div className="stat-label">fallos registrados</div>
            </div>
          </div>
        </div>

        <div className="forecast" aria-label="Previsión de repasos">
          <span className="legend-title">Próximos 7 días</span>
          <div className="fc-bars">
            {sum.forecast.map((n, d) => (
              <div className="fc-col" key={d} title={`${n} preguntas`}>
                <div className="fc-track">
                  <div className="fc-fill" style={{ height: (n / maxF) * 100 + "%" }} />
                </div>
                <span className="fc-n">{n}</span>
                <span className="fc-d">{dayLabel(d)}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {sum.seen === 0 ? (
        <div className="empty-state">
          Aún no hay nada que repasar. Responde quizzes en cualquier bloque: lo que falles aparecerá
          aquí hoy mismo y lo que aciertes volverá en unos días.
        </div>
      ) : (
        <div className="sections">
          <section className="section-card">
            <header className="section-head">
              <h3>
                <IconTarget size={18} className="h3-icon" />
                Tus puntos débiles
              </h3>
            </header>
            {weak.length === 0 ? (
              <p className="muted">Sin fallos registrados. ¡Bien!</p>
            ) : (
              <>
                <p className="review-sub">
                  Temas ordenados por número de fallos. «Repasar» lanza una sesión solo con sus
                  preguntas falladas.
                </p>
                <ul className="weak-list">
                  {weak.map((w) => (
                    <li key={w.idx} className="weak-row">
                      <button className="weak-src" onClick={() => onGoToSection(w.block, w.idx)}>
                        <span className="weak-idx">{w.idx}</span>
                        <span className="weak-title">
                          {w.secTitle}
                          <span className="weak-block">{w.blockTitle}</span>
                        </span>
                      </button>
                      <div className="weak-bar">
                        <div
                          className="weak-fill"
                          style={{ width: (w.lapses / weak[0].lapses) * 100 + "%" }}
                        />
                      </div>
                      <span className="weak-n">
                        {w.lapses} {w.lapses === 1 ? "fallo" : "fallos"}
                      </span>
                      <button
                        className="chip-btn sm"
                        onClick={() => start(w.idx, `Repaso dirigido · ${w.idx} ${w.secTitle}`)}
                      >
                        Repasar
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {worst.length > 0 && (
            <section className="section-card">
              <header className="section-head">
                <h3>Las preguntas que más fallas</h3>
              </header>
              <ul className="worst-list">
                {worst.map((it) => (
                  <li key={it.q.id}>
                    <RichText className="worst-q" html={it.q.question} />
                    <span className="worst-a">
                      → <b>{it.q.options[it.q.correctIndex]}</b>
                    </span>
                    <span className="worst-meta">
                      {it.st.lapses}× · {it.idx}
                      <span className={"box-pill b" + it.st.box}>caja {it.st.box}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </article>
  );
}

// Sesión: una pregunta cada vez. Fallar la manda al final de la cola (una
// vez) para volver a intentarla antes de terminar.
function ReviewSession({ session, onExit, onGoToSection }) {
  const { getVal, setVal } = useProgress();
  const [queue, setQueue] = useState(session.queue);
  const [pos, setPos] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [score, setScore] = useState({ right: 0, wrong: 0 });
  const [retried, setRetried] = useState(() => new Set());

  const it = queue[pos];
  const done = !it;

  function answer(i) {
    if (chosen !== null) return;
    setChosen(i);
    const right = i === it.q.correctIndex;
    const key = srsKey(it.q.id);
    let prev = null;
    try {
      prev = JSON.parse(getVal(key));
    } catch (e) {
      prev = it.st;
    }
    setVal(key, JSON.stringify(next(prev || it.st, right)));
    setScore((s) => ({ right: s.right + (right ? 1 : 0), wrong: s.wrong + (right ? 0 : 1) }));
    if (!right && !retried.has(it.q.id)) {
      setRetried((r) => new Set(r).add(it.q.id));
      setQueue((qu) => [...qu, it]);
    }
  }

  function advance() {
    setChosen(null);
    setPos((p) => p + 1);
  }

  if (done) {
    const total = score.right + score.wrong;
    return (
      <article className="block-page">
        <div className="review-done">
          <div className="review-done-ring">
            {total ? Math.round((score.right / total) * 100) : 0}%
          </div>
          <h2>¡Sesión terminada!</h2>
          <p>
            {score.right} {score.right === 1 ? "acierto" : "aciertos"} y {score.wrong}{" "}
            {score.wrong === 1 ? "fallo" : "fallos"} en {session.startedWith} preguntas. Lo que
            fallaste volverá pronto; lo que aciertas, cada vez más espaciado.
          </p>
          <button className="primary-btn" onClick={onExit}>
            Volver al repaso
          </button>
        </div>
      </article>
    );
  }

  const right = chosen === it.q.correctIndex;
  const say = chosen !== null ? quizSentence(it.q.question, it.q.options[it.q.correctIndex]) : "";

  return (
    <article className="block-page review-session">
      <div className="rs-top">
        <button className="ghost-btn" onClick={onExit}>
          ← Salir
        </button>
        <span className="rs-title">{session.title}</span>
        <span className="rp-count">
          {pos + 1}/{queue.length}
        </span>
      </div>
      <div className="track rs-track">
        <div className="fill" style={{ width: (pos / queue.length) * 100 + "%" }} />
      </div>

      <div className="rs-card" key={it.q.id + pos}>
        <div className="rs-src">
          <span className={`level-badge level-${(it.level || "").toLowerCase()}`}>{it.level}</span>
          <span>
            {it.idx} · {it.secTitle}
          </span>
          {it.st?.lapses > 0 && <span className="rs-lapses">{it.st.lapses}× fallada</span>}
        </div>
        <RichText as="p" className="q-question rs-q" html={it.q.question} />
        <div className="opts">
          {it.q.options.map((opt, i) => {
            let cls = "";
            if (chosen !== null && i === it.q.correctIndex) cls = "correct";
            else if (chosen === i) cls = "wrong";
            return (
              <button key={i} className={cls} disabled={chosen !== null} onClick={() => answer(i)}>
                <span className="opt-key">{String.fromCharCode(65 + i)}</span>
                <span className="opt-text">{opt}</span>
              </button>
            );
          })}
        </div>

        {chosen !== null && (
          <div className="rs-after">
            <div className={"fb show " + (right ? "ok" : "no")}>
              {right ? <IconCheck size={15} /> : <IconX size={15} />}
              {right ? "¡Correcto! Vuelve en unos días." : "Fallada: la repetirás al final de la sesión."}
              <SpeakButton id={`rs-${it.q.id}`} text={say} label="Escuchar la frase correcta" className="fb-speak" />
            </div>
            <div className="rs-actions">
              <button className="ghost-btn" onClick={() => onGoToSection(it.block, it.idx)}>
                Ver la regla
              </button>
              <button className="primary-btn" onClick={advance} autoFocus>
                Siguiente <IconArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

