import { useMemo } from "react";
import { useLexicon, wrapGermanHtml } from "../lexicon";

// Content fields (intro, rule, examples, quiz questions) are trusted HTML
// authored by us — the colored role spans are pedagogical, not decoration —
// so we render them directly.
//
// `de`: "de" si todo el texto es alemán, "mixed" si es español con fragmentos
// alemanes (negrita/cursiva/roles). Las palabras alemanas que están en el
// diccionario se subrayan y muestran su significado al pasar el cursor o
// tocarlas (ver WordTip).
export default function RichText({ html, as: Tag = "span", className, de }) {
  const lex = useLexicon();
  const out = useMemo(
    () => (de && lex ? wrapGermanHtml(html || "", de, lex) : html || ""),
    [html, de, lex]
  );
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: out }} />;
}
