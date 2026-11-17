import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ARTICLE, POS_ES, isSentenceInitial, lookup, useLexicon } from "../lexicon";
import { loadVerb, openVerb } from "../verbs";
import SpeakButton from "./SpeakButton";
import { figurada } from "../figurada";

// Ventanita con el significado de una palabra alemana subrayada (.w).
// Escritorio: aparece al pasar el cursor. Móvil/táctil: al tocar la palabra.
export default function WordTip() {
  useLexicon(); // carga el diccionario al arrancar
  const [tip, setTip] = useState(null); // { word, rect }
  const boxRef = useRef(null);
  const timers = useRef({});
  const anchorRef = useRef(null);

  const close = useCallback(() => {
    clearTimeout(timers.current.show);
    anchorRef.current?.classList.remove("w-on");
    anchorRef.current = null;
    setTip(null);
  }, []);

  const open = useCallback((el) => {
    anchorRef.current?.classList.remove("w-on");
    anchorRef.current = el;
    el.classList.add("w-on");
    setTip({ word: el.textContent, rect: el.getBoundingClientRect(), initial: isSentenceInitial(el) });
  }, []);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");

    function onOver(e) {
      if (!fine.matches) return;
      const el = e.target.closest?.(".w");
      if (el) {
        clearTimeout(timers.current.hide);
        if (el === anchorRef.current) return;
        clearTimeout(timers.current.show);
        timers.current.show = setTimeout(() => open(el), 180);
      } else if (!e.target.closest?.(".wtip")) {
        clearTimeout(timers.current.show);
        if (anchorRef.current) timers.current.hide = setTimeout(close, 250);
      }
    }

    function onClick(e) {
      const el = e.target.closest?.(".w");
      if (el && !e.target.closest("button, a")) {
        if (el === anchorRef.current && !fine.matches) close();
        else open(el);
        return;
      }
      if (!e.target.closest?.(".wtip")) close();
    }

    function onKey(e) {
      if (e.key === "Escape") close();
    }

    document.addEventListener("mouseover", onOver);
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    // Al desplazar, la palabra se mueve: cerramos.
    const onScroll = () => anchorRef.current && close();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", close);
    };
  }, [open, close]);

  // Posición: debajo de la palabra o, si no cabe, encima. Se recalcula si
  // la caja cambia de tamaño (p. ej. al cargar la conjugación).
  const [pos, setPos] = useState(null);
  useLayoutEffect(() => {
    if (!tip || !boxRef.current) return setPos(null);
    const place = () => {
      const box = boxRef.current;
      if (!box) return;
      const b = box.getBoundingClientRect();
      const r = tip.rect;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const left = Math.min(Math.max(8, r.left + r.width / 2 - b.width / 2), vw - b.width - 8);
      let top = r.bottom + 8;
      if (top + b.height > vh - 8 && r.top - b.height - 8 > 8) top = r.top - b.height - 8;
      setPos({ left, top });
    };
    place();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(place) : null;
    ro?.observe(boxRef.current);
    return () => ro?.disconnect();
  }, [tip]);

  if (!tip) return null;
  const entries = lookup(tip.word, tip.initial);

  return (
    <div
      ref={boxRef}
      className="wtip"
      role="tooltip"
      style={pos ? { left: pos.left, top: pos.top } : { left: -9999, top: 0 }}
      onMouseEnter={() => clearTimeout(timers.current.hide)}
      onMouseLeave={() => (timers.current.hide = setTimeout(close, 250))}
    >
      <div className="wtip-head">
        <span className="wtip-word" lang="de">
          {tip.word}
          <span className="fig" title="Pronunciación figurada (aprox.)">{figurada(tip.word)}</span>
        </span>
        <SpeakButton id={"wtip-" + tip.word} text={tip.word} label="Escuchar palabra" />
      </div>
      {entries.length === 0 && <p className="wtip-empty">Sin entrada en el diccionario.</p>}
      {entries.slice(0, 3).map((e) => (
        <Entry key={e.id} e={e} onClose={close} />
      ))}
    </div>
  );
}

function Entry({ e, onClose }) {
  const isVerb = e.pos === "verb";
  return (
    <div className="wtip-entry">
      <div className="wtip-lemma">
        {e.pos === "noun" && e.g && <span className={"art g-" + e.g}>{ARTICLE[e.g]} </span>}
        <b lang="de">{e.w}</b>
        <span className="wtip-pos">{POS_ES[e.pos] || e.pos}</span>
      </div>
      {e.es?.length > 0 && <div className="wtip-es">{e.es.slice(0, 4).join(" · ")}</div>}
      {!e.es?.length && e.en?.length > 0 && (
        <div className="wtip-es">
          {e.en.slice(0, 2).join(" · ")} <span className="wtip-muted">(en inglés)</span>
        </div>
      )}
      {e.desc && <div className="wtip-desc">{e.desc}</div>}
      {e.pos === "noun" && (e.pl || e.gen) && (
        <div className="wtip-grid" lang="de">
          {e.pl && (
            <span>
              <i>Plural</i> die {e.pl}
            </span>
          )}
          {e.gen && (
            <span>
              <i>Genitiv</i> {e.g === "f" ? "der" : "des"} {e.gen}
            </span>
          )}
        </div>
      )}
      {e.pos === "adj" && (e.cmp || e.sup) && (
        <div className="wtip-grid" lang="de">
          {e.cmp && (
            <span>
              <i>Komparativ</i> {e.cmp}
            </span>
          )}
          {e.sup && (
            <span>
              <i>Superlativ</i> am {e.sup}
            </span>
          )}
        </div>
      )}
      {isVerb && <VerbMini lemma={e.w} onClose={onClose} />}
    </div>
  );
}

function VerbMini({ lemma, onClose }) {
  const [v, setV] = useState(undefined);
  useEffect(() => {
    let alive = true;
    loadVerb(lemma)
      .then((d) => alive && setV(d))
      .catch(() => alive && setV(null));
    return () => {
      alive = false;
    };
  }, [lemma]);
  if (v === undefined) return <div className="wtip-muted">Cargando conjugación…</div>;
  if (!v) return null;
  const f = (k, i) => (v.t[k]?.[i] || "").split(" / ")[0];
  return (
    <>
      <table className="wtip-conj" lang="de">
        <tbody>
          <tr>
            <th>Präsens</th>
            <td>
              ich {f("ind_pres", 0)} · du {f("ind_pres", 1)} · er {f("ind_pres", 2)}
            </td>
          </tr>
          <tr>
            <th>Präteritum</th>
            <td>er {f("ind_prat", 2)}</td>
          </tr>
          <tr>
            <th>Perfekt</th>
            <td>er {f("ind_perf", 2)}</td>
          </tr>
        </tbody>
      </table>
      <button
        className="wtip-link"
        onClick={() => {
          onClose();
          openVerb(lemma);
        }}
      >
        Ver conjugación completa →
      </button>
    </>
  );
}
