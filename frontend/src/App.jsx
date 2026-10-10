import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";
import { useProgress } from "./progress";
import { useAllBlocks, useBlockStats } from "./useAllBlocks";
import Sidebar from "./components/Sidebar";
import BlockPage from "./components/BlockPage";
import CommandPalette from "./components/CommandPalette";
import { GradientDefs } from "./components/ProgressRing";
import { IconMenu, IconMoon, IconSearch, IconSun, IconClose, IconSpeaker, IconTurtle } from "./components/Icons";
import { toggleSpeed, useTTS } from "./tts";
import PracticePage from "./panels/PracticePage";
import HighlightsPanel from "./panels/HighlightsPanel";

// Bloque que funciona como panel de práctica (widgets en vivo, no contenido).
const PRACTICE_BLOCK = "20";
// Vistas que no son bloques de contenido (no se piden al backend).
const PANELS = new Set(["highlights"]);

function scrollToSection(idx) {
  const el = document.getElementById("sec-" + idx.replace(/\./g, "-"));
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Tema: "light" | "dark" | null (= seguir al sistema). Se guarda por navegador.
function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || null);
  const systemDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = theme ? theme === "dark" : systemDark();

  const toggle = useCallback(() => {
    const next = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch (e) {
      /* sin almacenamiento: el tema dura hasta recargar */
    }
    setTheme(next);
  }, [isDark]);

  return { isDark, toggle };
}

function Skeleton() {
  return (
    <div className="skeleton" aria-busy="true" aria-label="Cargando">
      <div className="sk sk-pill" />
      <div className="sk sk-title" />
      <div className="sk sk-line" />
      <div className="sk sk-line short" />
      <div className="sk-grid">
        <div className="sk sk-card" />
        <div className="sk sk-card" />
        <div className="sk sk-card" />
      </div>
      <div className="sk sk-block" />
    </div>
  );
}

export default function App() {
  const { loaded, resetPrefix } = useProgress();
  const [index, setIndex] = useState([]);
  const [current, setCurrent] = useState("01");
  const [block, setBlock] = useState(null);
  const [loadingBlock, setLoadingBlock] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const pendingSection = useRef(null);
  const contentRef = useRef(null);
  const { isDark, toggle: toggleTheme } = useTheme();
  const tts = useTTS();

  const allBlocks = useAllBlocks(index);
  const stats = useBlockStats(allBlocks);

  const scrollContentTop = () => contentRef.current?.scrollTo({ top: 0 });

  useEffect(() => {
    api.listBlocks().then(setIndex).catch(() => setIndex([]));
  }, []);

  // ⌘K / Ctrl+K abre el buscador desde cualquier sitio.
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (PANELS.has(current)) {
      setBlock(null);
      setLoadingBlock(false);
      requestAnimationFrame(scrollContentTop);
      return;
    }
    setLoadingBlock(true);
    api
      .getBlock(current)
      .then((data) => {
        setBlock(data);
        // After the new block renders, jump to a requested section or the top.
        requestAnimationFrame(() => {
          if (pendingSection.current) {
            scrollToSection(pendingSection.current);
            pendingSection.current = null;
          } else {
            scrollContentTop();
          }
        });
      })
      .catch(() => setBlock(null))
      .finally(() => setLoadingBlock(false));
  }, [current]);

  function selectBlock(b) {
    setNavOpen(false);
    setCurrent(b);
  }

  function goToSection(targetBlock, idx) {
    setNavOpen(false);
    if (targetBlock === current) {
      scrollToSection(idx); // already loaded — scroll now
    } else {
      pendingSection.current = idx; // scroll once the new block has rendered
      setCurrent(targetBlock);
    }
  }

  async function handleReset() {
    if (!window.confirm("¿Borrar tu progreso y respuestas de este bloque?")) return;
    await resetPrefix("b" + current + "-");
    // Las flashcards de Redewendungen viven en el bloque 16 y en el panel de práctica.
    if (current === "16" || current === PRACTICE_BLOCK) await resetPrefix("idiom:");
  }

  const pos = index.findIndex((b) => b.block === current);
  const prev = pos > 0 ? index[pos - 1] : null;
  const next = pos >= 0 && pos < index.length - 1 ? index[pos + 1] : null;
  const crumb =
    current === "highlights" ? "Destacados" : index[pos] ? index[pos].title : "";

  return (
    <div className={"layout" + (navOpen ? " nav-open" : "")}>
      <GradientDefs />

      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">DE</span>
          <span className="brand-text">
            <span className="brand-name">Índice de Alemán</span>
            <span className="brand-sub">Gramática A1 → C1</span>
          </span>
          <button
            className="icon-btn only-mobile"
            onClick={() => setNavOpen(false)}
            aria-label="Cerrar menú"
          >
            <IconClose size={18} />
          </button>
        </div>
        <Sidebar
          index={index}
          current={current}
          stats={stats}
          onSelectBlock={selectBlock}
          onGoToSection={goToSection}
          onOpenSearch={() => setCmdOpen(true)}
        />
      </aside>
      <div className="scrim" onClick={() => setNavOpen(false)} />

      <main className="content" ref={contentRef}>
        <header className="topbar">
          <button
            className="icon-btn only-mobile"
            onClick={() => setNavOpen(true)}
            aria-label="Abrir menú"
          >
            <IconMenu size={18} />
          </button>
          <nav className="crumbs" aria-label="Ruta">
            <span className="crumb-root">Temario</span>
            <span className="crumb-sep">/</span>
            {current !== "highlights" && <span className="crumb-num">{current}</span>}
            <span className="crumb-cur">{crumb}</span>
          </nav>
          <div className="topbar-actions">
            <button className="search-mini" onClick={() => setCmdOpen(true)}>
              <IconSearch size={15} />
              <span>Buscar</span>
              <kbd>⌘K</kbd>
            </button>
            {tts.supported && (
              <button
                className={"speed-btn" + (tts.speed === "slow" ? " slow" : "")}
                onClick={toggleSpeed}
                title={
                  tts.speed === "slow"
                    ? "Audio lento — pulsa para velocidad normal"
                    : "Audio a velocidad normal — pulsa para lento"
                }
                aria-label="Velocidad del audio"
              >
                {tts.speed === "slow" ? <IconTurtle size={15} /> : <IconSpeaker size={15} />}
                <span>{tts.speed === "slow" ? "Lento" : "Normal"}</span>
              </button>
            )}
            <button
              className="icon-btn"
              onClick={toggleTheme}
              aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              title={isDark ? "Modo claro" : "Modo oscuro"}
            >
              {isDark ? <IconSun size={17} /> : <IconMoon size={17} />}
            </button>
          </div>
        </header>

        <div className="page">
          {!loaded || loadingBlock ? (
            <Skeleton />
          ) : current === "highlights" ? (
            <HighlightsPanel index={index} onGoToSection={goToSection} />
          ) : !block ? (
            <div className="empty-state">
              <p>No se pudo cargar el bloque {current}.</p>
            </div>
          ) : current === PRACTICE_BLOCK ? (
            <PracticePage block={block} index={index} prev={prev} onSelectBlock={selectBlock} />
          ) : (
            <BlockPage
              block={block}
              onReset={handleReset}
              prev={prev}
              next={next}
              onSelectBlock={selectBlock}
            />
          )}
        </div>
      </main>

      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        index={index}
        blocks={allBlocks}
        onSelectBlock={selectBlock}
        onGoToSection={goToSection}
      />
    </div>
  );
}
