import { useEffect, useMemo, useRef, useState } from "react";
import { IconHash, IconLayers, IconSearch, IconStar } from "./Icons";

// Quita acentos y pasa a minúsculas para buscar sin importar tildes/umlauts.
const norm = (s) =>
  (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

// Buscador ⌘K: capítulos y epígrafes de todo el temario.
export default function CommandPalette({ open, onClose, index, blocks, onSelectBlock, onGoToSection }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
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
        });
      }
    }
    const nq = norm(q.trim());
    if (!nq) return all.filter((it) => it.type !== "section").slice(0, 21);
    const terms = nq.split(/\s+/);
    return all
      .filter((it) => {
        const hay = norm(it.title + " " + it.sub);
        return terms.every((t) => hay.includes(t));
      })
      .slice(0, 40);
  }, [q, index, blocks]);

  useEffect(() => setActive(0), [q]);

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
            placeholder="Busca un tema: Dativ, Konjunktiv, adjetivos…"
          />
          <kbd>esc</kbd>
        </div>
        <div className="cmd-list" ref={listRef}>
          {items.length === 0 && <div className="cmd-empty">Sin resultados para «{q}».</div>}
          {items.map((it, i) => (
            <button
              key={it.key}
              className={"cmd-item" + (i === active ? " active" : "")}
              onMouseEnter={() => setActive(i)}
              onClick={() => run(it)}
            >
              <span className={"cmd-icon t-" + it.type}>
                {it.type === "panel" ? (
                  <IconStar size={15} />
                ) : it.type === "block" ? (
                  <IconLayers size={15} />
                ) : (
                  <IconHash size={15} />
                )}
              </span>
              <span className="cmd-text">
                <span className="cmd-title">{it.title}</span>
                <span className="cmd-sub">{it.sub}</span>
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
