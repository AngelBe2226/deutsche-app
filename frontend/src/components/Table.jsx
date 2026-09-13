import RichText from "./RichText";

// Reference table (used in verbs, vocab, idioms, pronunciation). Cells may
// contain trusted HTML. Scrolls horizontally on narrow screens.
export default function Table({ table }) {
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
            </tr>
          </thead>
        )}
        <tbody>
          {table.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c}>
                  <RichText html={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
