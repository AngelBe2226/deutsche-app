import { useEffect, useMemo, useRef, useState } from "react";
import SpeakButton from "../components/SpeakButton";
import { IconSearch } from "../components/Icons";
import {
  MOODS,
  PERSONS,
  imperativeSentence,
  loadVerb,
  loadVerbIndex,
  modelSentence,
  searchVerbs,
} from "../verbs";

// Lista inicial (sin búsqueda): los verbos más usados, revisada a mano.
const TOP = ("sein haben werden können müssen wollen sollen dürfen mögen gehen kommen machen sagen sehen " +
  "wissen geben nehmen finden sprechen essen trinken fahren lesen schreiben arbeiten wohnen leben lernen " +
  "spielen hören kaufen bezahlen brauchen fragen antworten denken glauben kennen verstehen helfen bleiben " +
  "stehen liegen sitzen schlafen laufen bringen tragen halten lassen beginnen anfangen aufstehen anrufen " +
  "einkaufen einladen ankommen fernsehen mitkommen vorstellen kennenlernen gefallen treffen besuchen " +
  "suchen warten zeigen öffnen schließen vergessen erzählen bekommen verlieren gewinnen reisen kochen tun").split(" ");

const KIND_ES = { strong: "fuerte", weak: "débil", irregular: "irregular", mixed: "mixto" };
const LAST_KEY = "conj-last-verb";

function readLast() {
  try {
    return localStorage.getItem(LAST_KEY) || "sein";
  } catch (e) {
    return "sein";
  }
}

// Anexo de verbos: buscador sobre ~9.300 verbos alemanes con su conjugación
// completa (Indikativ, Konjunktiv I y II, Imperativ, formas nominales) y un
// ejemplo por forma: real (Tatoeba, con traducción) o frase modelo.
export default function VerbsPanel({ initialVerb }) {
  const [idx, setIdx] = useState(null);
  const [error, setError] = useState(false);
  const [q, setQ] = useState("");
  const [lemma, setLemma] = useState(initialVerb || readLast());
  const [verb, setVerb] = useState(null);
  const [mood, setMood] = useState("ind");
  const [showEx, setShowEx] = useState(() => {
    try {
      return localStorage.getItem("conj-show-ex") !== "0";
    } catch (e) {
      return true;
    }
  });
  const toggleEx = () =>
    setShowEx((v) => {
      try {
        localStorage.setItem("conj-show-ex", v ? "0" : "1");
      } catch (e) {
        /* sin almacenamiento */
      }
      return !v;
    });
  const tableRef = useRef(null);

  useEffect(() => {
    loadVerbIndex()
      .then(setIdx)
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    if (initialVerb) setLemma(initialVerb);
  }, [initialVerb]);

  useEffect(() => {
    if (!lemma) return;
    let alive = true;
    setVerb(null);
    loadVerb(lemma)
      .then((v) => alive && setVerb(v))
      .catch(() => alive && setError(true));
    try {
      localStorage.setItem(LAST_KEY, lemma);
    } catch (e) {
      /* sin almacenamiento */
    }
    return () => {
      alive = false;
    };
  }, [lemma]);

  const results = useMemo(() => {
    if (!idx) return [];
    if (!q.trim()) return TOP.map((l) => idx.byLemma.get(l)).filter(Boolean);
    return searchVerbs(idx, q, 60);
  }, [idx, q]);

  function pick(l) {
    setLemma(l);
    setQ("");
    requestAnimationFrame(() => tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function onKey(e) {
    if (e.key === "Enter" && results[0]) pick(results[0][0]);
  }

  return (
    <article className="block-page conj">
      <header className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="block-kicker">
          <span className="kicker-dot" />
          Anexo · {idx ? idx.rows.length.toLocaleString("es-ES") : "…"} verbos
        </div>
        <h1 className="block-title">Conjugador</h1>
        <p className="block-intro">
          Cualquier verbo alemán con todos sus tiempos y modos. Cada forma lleva un ejemplo: frases
          reales con traducción cuando existen, o una frase modelo para ver dónde va cada pieza.
        </p>
      </header>

      <div className="conj-search">
        <IconSearch size={16} />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKey}
          placeholder="Busca un verbo: gehen, aufstehen, mussen… o en español: «hablar»"
          aria-label="Buscar verbo"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>

      {error && <p className="empty-state">No se pudieron cargar los verbos. Revisa la conexión.</p>}

      {idx && (
        <div className="conj-results" role="list" aria-label={q ? "Resultados" : "Verbos frecuentes"}>
          {!q && <div className="conj-results-label">Más frecuentes</div>}
          {results.length === 0 && <p className="muted">Ningún verbo coincide con «{q}».</p>}
          {results.map((r) => (
            <button
              key={r[0]}
              role="listitem"
              className={"conj-chip" + (r[0] === lemma ? " on" : "")}
              onClick={() => pick(r[0])}
              title={r[1]}
            >
              <span className="conj-chip-de">{r[0]}</span>
              {q && r[1] && <span className="conj-chip-es">{r[1]}</span>}
            </button>
          ))}
        </div>
      )}

      <div ref={tableRef} className="conj-anchor" />
      {verb ? (
        <VerbView verb={verb} mood={mood} setMood={setMood} showEx={showEx} toggleEx={toggleEx} />
      ) : (
        lemma && !error && <p className="empty-state">Cargando «{lemma}»…</p>
      )}

      <p className="conj-credits">
        Conjugaciones: Wiktionary (CC BY-SA 4.0). Ejemplos reales: Tatoeba (CC BY 2.0 FR).
      </p>
    </article>
  );
}

function VerbView({ verb, mood, setMood, showEx, toggleEx }) {
  const t = verb.t;
  const ex = verb.ex || {};
  const sep = verb.sep;
  const meaning = verb.es.length ? verb.es.join(" · ") : verb.en.join(" · ");
  const p3 = t.ind_pres[2]?.split(" / ")[0];
  const prat = t.ind_prat[2]?.split(" / ")[0];
  const p2 = verb.p2[0];
  const aux = verb.aux;
  const sieImp = t.ind_pres[5]?.split(" / ")[0];

  return (
    <section className="section-card conj-verb">
      <header className="conj-head">
        <div>
          <h2 className="conj-lemma">
            {verb.lemma}
            <SpeakButton id={"conj-" + verb.lemma} text={verb.lemma} />
          </h2>
          <p className="conj-meaning">
            {meaning}
            {!verb.es.length && verb.en.length > 0 && <span className="conj-en"> (en inglés)</span>}
          </p>
        </div>
        <div className="conj-badges">
          {verb.kind && <span className="chip muted">{KIND_ES[verb.kind] || verb.kind}</span>}
          {sep && <span className="chip muted">separable</span>}
          <span className="chip muted">Perfekt con {aux.join(" / ")}</span>
        </div>
      </header>

      <dl className="conj-parts">
        <Part label="Infinitiv" value={verb.lemma} />
        <Part label="Präsens (er)" value={p3} />
        <Part label="Präteritum (er)" value={prat} />
        <Part label="Partizip II" value={p2 && `${aux[0] === "sein" ? "ist" : "hat"} ${p2}`} />
        {verb.zu[0] && <Part label="zu-Infinitiv" value={verb.zu[0]} />}
        {verb.p1[0] && <Part label="Partizip I" value={verb.p1[0]} />}
      </dl>
      {ex.p2 && <Example ex={ex.p2} id={"conj-p2-" + verb.lemma} />}

      <div className="conj-tabs" role="tablist" aria-label="Modo">
        {MOODS.map((m) => (
          <button
            key={m.key}
            role="tab"
            aria-selected={mood === m.key}
            className={"hl-filter" + (mood === m.key ? " on" : "")}
            onClick={() => setMood(m.key)}
          >
            {m.label}
          </button>
        ))}
        <button
          role="tab"
          aria-selected={mood === "imp"}
          className={"hl-filter" + (mood === "imp" ? " on" : "")}
          onClick={() => setMood("imp")}
        >
          Imperativ
        </button>
        <button className="conj-ex-toggle" onClick={toggleEx} aria-pressed={showEx}>
          {showEx ? "Ocultar ejemplos" : "Mostrar ejemplos"}
        </button>
      </div>

      {mood === "imp" ? (
        <div className="conj-grid">
          <div className="conj-tense">
            <h3 className="conj-tense-title">
              Imperativ <span>Imperativo</span>
            </h3>
            <p className="conj-hint">Órdenes, peticiones y consejos. Con «bitte» suena más amable.</p>
            <ul className="conj-rows">
              {[
                ["du", verb.imp.du, ex.imp_du],
                ["ihr", verb.imp.ihr, ex.imp_ihr],
                ["Sie", sieImp, null],
              ].map(([who, form, e]) =>
                form ? (
                  <Row
                    key={who}
                    id={`conj-imp-${who}-${verb.lemma}`}
                    person={who === "Sie" ? "Sie (usted)" : who}
                    form={who === "Sie" ? form.replace(/^(\S+)/, "$1 Sie") : form}
                    ex={e}
                    model={imperativeSentence(form, who)}
                    showEx={showEx}
                  />
                ) : null
              )}
            </ul>
          </div>
        </div>
      ) : (
        MOODS.filter((m) => m.key === mood).map((m) => (
          <div key={m.key}>
            {m.note && <p className="conj-mood-note">{m.note}</p>}
            <div className="conj-grid">
              {m.tenses.map((tn) => {
                const forms = t[tn.key] || [];
                if (!forms.some(Boolean)) return null;
                return (
                  <div className="conj-tense" key={tn.key}>
                    <h3 className="conj-tense-title">
                      {tn.de} <span>{tn.es}</span>
                    </h3>
                    <p className="conj-hint">{tn.hint}</p>
                    <ul className="conj-rows">
                      {forms.map((form, i) =>
                        form ? (
                          <Row
                            key={i}
                            id={`conj-${tn.key}-${i}-${verb.lemma}`}
                            person={PERSONS[i]}
                            form={form}
                            ex={ex[tn.key]?.[i]}
                            model={modelSentence(form, i, tn)}
                            showEx={showEx}
                          />
                        ) : null
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </section>
  );
}

function Part({ label, value }) {
  if (!value) return null;
  return (
    <div className="conj-part">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Row({ id, person, form, ex, model, showEx }) {
  const [toggled, setToggled] = useState(false);
  const open = showEx !== toggled;
  const setOpen = () => setToggled((x) => !x);
  const main = form.split(" / ")[0];
  return (
    <li className={"conj-row" + (open ? " open" : "")}>
      <button className="conj-row-main" onClick={setOpen} aria-expanded={open}>
        <span className="conj-person">{person}</span>
        <span className="conj-form">
          {main}
          {form.includes(" / ") && <span className="conj-alt"> / {form.split(" / ").slice(1).join(" / ")}</span>}
        </span>
        <span className="conj-ex-dot" title={ex ? "Ejemplo real" : "Frase modelo"} data-real={ex ? "1" : "0"} />
      </button>
      {open && (ex ? <Example ex={ex} id={id} /> : <Example model={model} id={id} />)}
    </li>
  );
}

function Example({ ex, model, id }) {
  const de = ex ? ex[0] : model;
  return (
    <div className="conj-example">
      <div className="conj-example-de">
        <span lang="de">{de}</span>
        <SpeakButton id={id} text={de} />
      </div>
      {ex ? (
        <div className="conj-example-es">{ex[1]}</div>
      ) : (
        <div className="conj-example-es muted">Frase modelo (sin traducción): fíjate en el orden de las palabras.</div>
      )}
    </div>
  );
}
