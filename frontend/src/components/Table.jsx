import RichText from "./RichText";
import SpeakButton from "./SpeakButton";
import { germanCells } from "../tts";

// Reference table (used in verbs, vocab, idioms, pronunciation). Cells may
// contain trusted HTML. Scrolls horizontally on narrow screens. Cada fila
// lleva un botón «escuchar» que lee solo sus celdas en alemán.
export default function Table({ table, id = "t" }) {
  return (
    <div className="table-wrap">
      <table className="ref-table">
        {table.headers?.length > 0 && (
          <thead>
            <tr>
              {table.headers.map((h, i) => (
                <th key={i}>
                  <RichText html={h} />
                </th>
              ))}
              <th className="speak-col" aria-label="Audio" />
            </tr>
          </thead>
        )}
        <tbody>
          {table.rows.map((row, r) => {
            const de = germanCells(table.headers, row).join(". ");
            return (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c}>
                    <RichText html={cell} />
                  </td>
                ))}
                <td className="speak-col">
                  <SpeakButton id={`${id}-r${r}`} text={de} label="Escuchar fila" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
