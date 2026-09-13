// Content fields (intro, rule, examples, quiz questions) are trusted HTML
// authored by us — the colored role spans are pedagogical, not decoration —
// so we render them directly.
export default function RichText({ html, as: Tag = "span", className }) {
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html || "" }} />;
}
