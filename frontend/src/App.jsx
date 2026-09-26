import { useEffect, useRef, useState } from "react";
import { api } from "./api";
import { useProgress } from "./progress";
import Sidebar from "./components/Sidebar";
import BlockPage from "./components/BlockPage";
import PracticePage from "./panels/PracticePage";
import HighlightsPanel from "./panels/HighlightsPanel";
import RoadmapPanel from "./panels/RoadmapPanel";

// Bloque que funciona como panel de práctica (widgets en vivo, no contenido).
const PRACTICE_BLOCK = "20";
// Vistas que no son bloques de contenido (no se piden al backend).
const PANELS = new Set(["highlights", "roadmap"]);

function scrollToSection(idx) {
  const el = document.getElementById("sec-" + idx.replace(/\./g, "-"));
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function App() {
  const { loaded, resetPrefix } = useProgress();
  const [index, setIndex] = useState([]);
  const [current, setCurrent] = useState("01");
  const [block, setBlock] = useState(null);
  const [loadingBlock, setLoadingBlock] = useState(true);
  const pendingSection = useRef(null);
  const contentRef = useRef(null);

  const scrollContentTop = () => contentRef.current?.scrollTo({ top: 0 });

  useEffect(() => {
    api.listBlocks().then(setIndex).catch(() => setIndex([]));
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

  function goToSection(targetBlock, idx) {
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

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">DE</span>
          <span className="brand-name">Índice de Alemán</span>
        </div>
        <Sidebar
          index={index}
          current={current}
          onSelectBlock={setCurrent}
          onGoToSection={goToSection}
        />
      </aside>

      <main className="content" ref={contentRef}>
        {!loaded || loadingBlock ? (
          <p className="muted center">Cargando…</p>
        ) : current === "roadmap" ? (
          <RoadmapPanel />
        ) : current === "highlights" ? (
          <HighlightsPanel index={index} onGoToSection={goToSection} />
        ) : !block ? (
          <p className="muted center">No se pudo cargar el bloque {current}.</p>
        ) : current === PRACTICE_BLOCK ? (
          <PracticePage block={block} index={index} />
        ) : (
          <BlockPage block={block} onReset={handleReset} />
        )}
      </main>
    </div>
  );
}
