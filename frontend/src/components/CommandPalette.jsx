import { useEffect, useMemo, useRef, useState } from "react";
import { IconHash, IconLayers, IconRotate, IconSearch, IconStar } from "./Icons";

// Quita acentos y pasa a minúsculas para buscar sin importar tildes/umlauts.
const norm = (s) =>
  (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const SKILLS = ["Gramática", "Vocabulario", "Escuchar", "Leer", "Hablar", "Escribir"];

// Etiquetas de destreza de un epígrafe, deducidas de su contenido (no hay que
// etiquetar nada a mano al crear contenido nuevo).
function skillsOf(s) {
  const out = [];
  if (s.rule && !s.vocab && !s.dialog && !s.reading && !s.roleplay && !s.scenario) out.push("Gramática");
  if (s.vocab) out.push("Vocabulario");
  if (s.dialog) out.push("Escuchar");
  if (s.reading) out.push("Leer");
  if (s.roleplay || s.scenario) out.push("Hablar");
  if (s.produce || s.roleplay) out.push("Escribir");
  return out;
}

// Buscador ⌘K: capítulos y epígrafes de todo el temario, con filtros por
// nivel y destreza; el tema es el propio bloque (y «profesional» para las
// verticales).
export default function CommandPalette({ open, onClose, index, blocks, onSelectBlock, onGoToSection }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [lv, setLv] = useState(null);
  const [sk, setSk] = useState(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const items = useMemo(() => {
    const all = [
      { type: "panel", key: "highlights", title: "Destacados", sub: "Tu selección" },
      { type: "panel", key: "review", title: "Repaso", sub: "Repaso espaciado y puntos débiles" },
      ...index.map((b) => ({
        type: "block",
        key: "b" + b.block,
        block: b.block,
        title: b.title,
        sub: `Bloque ${b.block} · ${b.sectionCount} epígrafes`,
      })),
    ];
    for (const blk of blocks || []) {
      for (const s of blk.sections || []) {
        all.push({
          type: "section",
          key: "s" + s.idx,
          block: blk.block,
          idx: s.idx,
          title: s.title,
          sub: `${s.idx} · ${blk.title}`,
          level: s.level,
          skills: skillsOf(s),
          pro: /^Vertical/.test(blk.title),
        });
      }
    }
    const nq = norm(q.trim());
    const filtering = lv || sk;
    if (!nq && !filtering) return all.filter((it) => it.type !== "section");
    const terms = nq ? nq.split(/\s+/) : [];
    return all
      .filter((it) => {
        if (filtering && it.type !== "section") return false;
        if (lv && it.level !== lv) return false;
        if (sk && !it.skills?.includes(sk)) return false;
        const hay = norm(
          it.title + " " + it.sub + " " + (it.skills || []).join(" ") + (it.pro ? " profesional" : "")
        );
        return terms.every((t) => hay.includes(t));
      })
      .slice(0, 60);
  }, [q, lv, sk, index, blocks]);

  const levelsAvail = useMemo(() => {
    const set = new Set();
    for (const blk of blocks || []) for (const s of blk.sections || []) set.add(s.level);
    return LEVELS.filter((l) => set.has(l));
  }, [blocks]);

  useEffect(() => setActive(0), [q, lv, sk]);

  useEffect(() => {
    listRef.current?.querySelector(".cmd-item.active")?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  function run(it) {
    onClose();
    if (it.type === "panel") onSelectBlock(it.key);
    else if (it.type === "block") onSelectBlock(it.block);
    else onGoToSection(it.block, it.idx);
  }

  function onKey(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(items.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter" && items[active]) {
      e.preventDefault();
      run(items[active]);
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  return (
    <div className="cmd-backdrop" onMouseDown={onClose}>
      <div
        className="cmd"
        role="dialog"
        aria-label="Buscar en el temario"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="cmd-input">
          <IconSearch size={18} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Busca un tema: Dativ, Konjunktiv, recepción…"
          />
          <kbd>esc</kbd>
        </div>
        {blocks && (
          <div className="cmd-filters">
            <div className="cmd-frow">
              <span className="cmd-flabel">Nivel</span>
              {levelsAvail.map((l) => (
                <button
                  key={l}
                  className={`cmd-chip level-badge level-${l.toLowerCase()}` + (lv === l ? " on" : "")}
                  onClick={() => setLv((v) => (v === l ? null : l))}
                  aria-pressed={lv === l}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="cmd-frow">
              <span className="cmd-flabel">Destreza</span>
              {SKILLS.map((x) => (
                <button
                  key={x}
                  className={"cmd-chip" + (sk === x ? " on" : "")}
                  onClick={() => setSk((v) => (v === x ? null : x))}
                  aria-pressed={sk === x}
                >
                  {x}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="cmd-list" ref={listRef}>
          {items.length === 0 && (
            <div className="cmd-empty">
              Sin resultados{q ? ` para «${q}»` : ""}
              {lv || sk ? " con esos filtros" : ""}.
            </div>
          )}
          {items.map((it, i) => (
            <button
              key={it.key}
              className={"cmd-item" + (i === active ? " active" : "")}
              onMouseEnter={() => setActive(i)}
              onClick={() => run(it)}
            >
              <span className={"cmd-icon t-" + it.type}>
                {it.key === "review" ? (
                  <IconRotate size={15} />
                ) : it.type === "panel" ? (
                  <IconStar size={15} />
                ) : it.type === "block" ? (
                  <IconLayers size={15} />
                ) : (
                  <IconHash size={15} />
                )}
              </span>
              <span className="cmd-text">
                <span className="cmd-title">{it.title}</span>
                <span className="cmd-sub">
                  {it.sub}
                  {it.skills?.length > 0 && (
                    <span className="cmd-tags">
                      {it.pro && <i className="pro">profesional</i>}
                      {it.skills.map((x) => (
                        <i key={x}>{x}</i>
                      ))}
                    </span>
                  )}
                </span>
              </span>
              {it.level && (
                <span className={`level-badge level-${it.level.toLowerCase()}`}>{it.level}</span>
              )}
            </button>
          ))}
        </div>
        <div className="cmd-foot">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> navegar
          </span>
          <span>
            <kbd>↵</kbd> abrir
          </span>
          {!blocks && <span className="cmd-loading">Indexando epígrafes…</span>}
        </div>
      </div>
    </div>
  );
}
