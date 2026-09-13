import RichText from "../components/RichText";
import ProduceBox from "../components/ProduceBox";
import ProgressPanel from "./ProgressPanel";
import IdiomFlashcards from "./IdiomFlashcards";
import ExamSimulator from "./ExamSimulator";

// El bloque 20 es un panel funcional, no contenido estático. El texto fijo de
// cada sección viene de block_20.json; los widgets en vivo se conectan por idx.
const PANELS = {
  "20.1": (props) => <ProgressPanel index={props.index} />,
  "20.2": () => <IdiomFlashcards />,
  "20.3": () => <ExamSimulator />,
};

export default function PracticePage({ block, index }) {
  return (
    <article className="block-page">
      <div className="block-kicker">{block.kicker}</div>
      <h2 className="block-title">{block.title}</h2>
      <RichText as="p" className="block-intro" html={block.intro} />

      <div className="sections">
        {block.sections.map((s) => {
          const Panel = PANELS[s.idx];
          return (
            <section className="section-card" key={s.idx}>
              <header className="section-head">
                <h3>
                  <span className="sec-idx">{s.idx}</span>
                  {s.title}
                </h3>
                {s.level && <span className="level-badge level-goflu">{s.level}</span>}
              </header>
              {s.rule && <RichText as="div" className="rule" html={s.rule} />}
              {Panel && <Panel index={index} />}
              {s.produce && <ProduceBox produce={s.produce} />}
            </section>
          );
        })}
      </div>
    </article>
  );
}
