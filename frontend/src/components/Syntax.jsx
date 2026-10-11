import { useState } from "react";
import SpeakButton from "./SpeakButton";
import { useProgress } from "../progress";
import { IconCheck, IconRotate } from "./Icons";

// Análisis sintáctico. Esquema (campo `syntax` de la sección):
//   { id: "bXX-syn",
//     sentences: [ { de, es, parts: [ { t, f, r, k?, pre? } ] } ],
//     exercises: [ …mismo formato… ] }
// Cada parte (`t`) declara su campo `f` del modelo de campos (VF · LK · MF ·
// RK · NF) y su función `r` (Satzglied); `k` matiza los complementos
// circunstanciales (temporal, kausal…) y `pre` es la puntuación que la
// precede («, weil…»). Con una sola descripción se pintan las tres vistas.

export const FIELDS = [
  { k: "VF", de: "Vorfeld", es: "antecampo" },
  { k: "LK", de: "linke Klammer", es: "corchete izq." },
  { k: "MF", de: "Mittelfeld", es: "campo medio" },
  { k: "RK", de: "rechte Klammer", es: "corchete dcho." },
  { k: "NF", de: "Nachfeld", es: "campo final" },
];

export const ROLES = {
  subj: { es: "Sujeto", de: "Subjekt" },
  pred: { es: "Predicado", de: "Prädikat" },
  akk: { es: "Obj. directo", de: "Akkusativobjekt" },
  dat: { es: "Obj. indirecto", de: "Dativobjekt" },
  gen: { es: "Obj. genitivo", de: "Genitivobjekt" },
  prep: { es: "Obj. preposicional", de: "Präpositionalobjekt" },
  praed: { es: "Atributo", de: "Prädikativ" },
  adv: { es: "Compl. circunstancial", de: "Adverbial" },
  conj: { es: "Conector", de: "Konjunktion" },
};

const TABS = [
  { k: "fields", label: "Modelo de campos" },
  { k: "roles", label: "Satzglieder" },
  { k: "practice", label: "Analízalo tú" },
];

export default function Syntax({ syn }) {
  const [tab, setTab] = useState("fields");
  const used = [...new Set(syn.sentences.flatMap((s) => s.parts.map((p) => p.r)))];

  return (
    <div className="syntax">
      <div className="syn-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.k}
            role="tab"
            aria-selected={tab === t.k}
            className={"syn-tab" + (tab === t.k ? " on" : "")}
            onClick={() => setTab(t.k)}
          >
            {t.label}
            {t.k === "practice" && syn.exercises?.length ? (
              <span className="syn-tab-n">{syn.exercises.length}</span>
            ) : null}
          </button>
        ))}
      </div>

      {tab !== "practice" && <RoleLegend roles={used} />}
      {tab === "fields" && <FieldGrid syn={syn} />}
      {tab === "roles" && <RoleView syn={syn} />}
      {tab === "practice" && <Practice syn={syn} />}
    </div>
  );
}

function RoleLegend({ roles }) {
  return (
    <div className="syn-legend">
      {roles.map((r) => (
        <span key={r} className={"syn-key sr-" + r}>
          <i />
          {ROLES[r]?.es}
          <em>{ROLES[r]?.de}</em>
        </span>
      ))}
    </div>
  );
}

function Chip({ p }) {
  return (
    <span className={"syn-chip sr-" + p.r} title={`${ROLES[p.r]?.de}${p.k ? " · " + p.k : ""}`}>
      {p.t}
      {p.k && <small>{p.k}</small>}
    </span>
  );
}

// Rejilla: una fila por frase, una columna por campo.
function FieldGrid({ syn }) {
  return (
    <div className="syn-grid-wrap">
      <table className="syn-grid">
        <thead>
          <tr>
            {FIELDS.map((f) => (
              <th key={f.k} className={"fh-" + f.k}>
                <b>{f.de}</b>
                <span>{f.es}</span>
              </th>
            ))}
            <th className="speak-col" aria-label="Audio" />
          </tr>
        </thead>
        <tbody>
          {syn.sentences.map((s, i) => (
            <tr key={i}>
              {FIELDS.map((f) => {
                const parts = s.parts.filter((p) => p.f === f.k);
                return (
                  <td key={f.k} className={"fc-" + f.k + (parts.length ? "" : " empty")}>
                    {parts.map((p, j) => (
                      <Chip key={j} p={p} />
                    ))}
                  </td>
                );
              })}
              <td className="speak-col">
                <SpeakButton id={`${syn.id}-s${i}`} text={s.de} label="Escuchar frase" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="syn-note">
        El <b>verbo conjugado</b> va siempre en la <b>linke Klammer</b>; el resto del verbo
        (participio, infinitivo, prefijo separable) cierra en la <b>rechte Klammer</b>. En las
        subordinadas la linke Klammer la ocupa el conector y todo el verbo va a la derecha.
      </p>
    </div>
  );
}

// Vista lineal: la frase con cada Satzglied subrayado y etiquetado.
function RoleView({ syn }) {
  return (
    <ol className="syn-lines">
      {syn.sentences.map((s, i) => (
        <li key={i} className="syn-line">
          <div className="syn-flow" lang="de">
            {s.parts.map((p, j) => (
              <span key={j} className="syn-seg-wrap">
                {p.pre && <span className="syn-pre">{p.pre}</span>}
                <span className={"syn-seg sr-" + p.r}>
                  <span className="syn-seg-t">{p.t}</span>
                  <span className="syn-seg-l">
                    {ROLES[p.r]?.de}
                    {p.k ? ` · ${p.k}` : ""}
                  </span>
                </span>
              </span>
            ))}
            <span className="syn-pre">{endPunct(s.de)}</span>
          </div>
          <div className="syn-es">
            {s.es}
            <SpeakButton id={`${syn.id}-r${i}`} text={s.de} label="Escuchar frase" />
          </div>
        </li>
      ))}
    </ol>
  );
}

const endPunct = (de) => (/[.?!]$/.test(de) ? de.slice(-1) : "");

// Ejercicio: elige una función en la paleta y pinta con ella cada parte.
function Practice({ syn }) {
  const { getVal, setVal, delVal } = useProgress();
  const exs = syn.exercises || [];
  const [n, setN] = useState(() => {
    const first = exs.findIndex((_, i) => getVal(`${syn.id}-e${i}`) == null);
    return first < 0 ? 0 : first;
  });
  if (!exs.length) return <p className="muted">Sin ejercicios en esta sección.</p>;
  const solvedCount = exs.filter((_, i) => getVal(`${syn.id}-e${i}`) != null).length;

  return (
    <div className="syn-practice">
      <div className="syn-pnav">
        {exs.map((_, i) => {
          const ok = getVal(`${syn.id}-e${i}`) != null;
          return (
            <button
              key={i}
              className={"syn-dot" + (i === n ? " on" : "") + (ok ? " ok" : "")}
              onClick={() => setN(i)}
              aria-label={`Frase ${i + 1}${ok ? " (resuelta)" : ""}`}
            >
              {ok ? <IconCheck size={12} /> : i + 1}
            </button>
          );
        })}
        <span className="rp-count">
          {solvedCount}/{exs.length} resueltas
        </span>
      </div>
      <Exercise
        key={n + (getVal(`${syn.id}-e${n}`) != null ? "s" : "u")}
        ex={exs[n]}
        id={`${syn.id}-e${n}`}
        solved={getVal(`${syn.id}-e${n}`) != null}
        onSolved={() => setVal(`${syn.id}-e${n}`, "1")}
        onReset={() => delVal(`${syn.id}-e${n}`)}
        onNext={n < exs.length - 1 ? () => setN(n + 1) : null}
      />
    </div>
  );
}

function Exercise({ ex, id, solved, onSolved, onReset, onNext }) {
  const palette = [...new Set(ex.parts.map((p) => p.r))];
  // Paleta con distractores fijos para que no baste con descartar.
  const roles = Object.keys(ROLES).filter(
    (r) => palette.includes(r) || ["subj", "pred", "akk", "dat", "adv"].includes(r)
  );
  const [brush, setBrush] = useState(roles[0]);
  const [marks, setMarks] = useState(() => (solved ? ex.parts.map((p) => p.r) : ex.parts.map(() => null)));
  const [checked, setChecked] = useState(solved);

  const allMarked = marks.every(Boolean);
  const right = marks.filter((m, i) => m === ex.parts[i].r).length;
  const allRight = right === ex.parts.length;

  function paint(i) {
    if (solved) return;
    setMarks((m) => m.map((x, j) => (j === i ? (x === brush ? null : brush) : x)));
    setChecked(false);
  }

  function check() {
    setChecked(true);
    if (allRight) onSolved();
  }

  return (
    <div className="syn-ex">
      <div className="syn-ex-es">
        {ex.es}
        <SpeakButton id={`${id}-say`} text={ex.de} label="Escuchar frase" />
      </div>

      {!solved && (
        <div className="syn-palette" role="radiogroup" aria-label="Función a marcar">
          {roles.map((r) => (
            <button
              key={r}
              role="radio"
              aria-checked={brush === r}
              className={"syn-brush sr-" + r + (brush === r ? " on" : "")}
              onClick={() => setBrush(r)}
            >
              <i />
              {ROLES[r].es}
            </button>
          ))}
        </div>
      )}

      <div className="syn-flow practice" lang="de">
        {ex.parts.map((p, i) => {
          const m = marks[i];
          const state = checked ? (m === p.r ? " ok" : " no") : "";
          return (
            <span key={i} className="syn-seg-wrap">
              {p.pre && <span className="syn-pre">{p.pre}</span>}
              <button
                className={"syn-seg tok" + (m ? " sr-" + m : " blank") + state}
                onClick={() => paint(i)}
                disabled={solved}
              >
                <span className="syn-seg-t">{p.t}</span>
                <span className="syn-seg-l">{m ? ROLES[m].de : "¿…?"}</span>
              </button>
            </span>
          );
        })}
        <span className="syn-pre">{endPunct(ex.de)}</span>
      </div>

      <div className="order-actions">
        {solved ? (
          <>
            <span className="fb ok">
              <IconCheck size={15} /> ¡Análisis correcto!
            </span>
            {onNext && (
              <button className="primary-btn" onClick={onNext}>
                Siguiente frase
              </button>
            )}
            <button className="reset-section-btn" onClick={onReset}>
              <IconRotate size={12} /> Repetir
            </button>
          </>
        ) : (
          <>
            <button className="primary-btn" onClick={check} disabled={!allMarked}>
              Comprobar
            </button>
            {!allMarked && <span className="muted syn-hint">Marca todas las partes.</span>}
            {checked && !allRight && (
              <span className="fb no">
                {right} de {ex.parts.length} bien. Corrige las marcadas en rojo.
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
