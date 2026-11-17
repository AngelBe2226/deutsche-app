// Texto que se lee en voz alta, calculado sin DOM: lo usan la app (al pulsar
// 🔊) y el generador de audios (scripts/audio/collect.mjs), así ambos llegan
// exactamente a la misma frase y por tanto al mismo archivo de audio.

const ENTITIES = { amp: "&", nbsp: " ", quot: '"', apos: "'", lt: "<", gt: ">", rsquo: "’", lsquo: "‘", hellip: "…", mdash: "—", ndash: "–", laquo: "«", raquo: "»" };

export function decodeEntities(s) {
  return String(s).replace(/&(#\d+|#x[0-9a-f]+|\w+);/gi, (m, e) => {
    if (e[0] === "#") return String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

// textContent de un fragmento HTML (las etiquetas no separan palabras).
export function textContent(html) {
  return decodeEntities(String(html || "").replace(/<[^>]*>/g, ""));
}

// Texto plano a partir del HTML del contenido (spans de rol, <b>, <i>…).
export function plainText(html) {
  return textContent(html)
    .replace(/_{2,}|…{1,}|\.{3,}/g, " … ") // huecos de ejercicio
    .replace(/[→←↔]/g, ",")
    .replace(/\s+/g, " ")
    .trim();
}

// ---- Tablas: qué celdas están en alemán ----

// Columnas cuyo encabezado indica explicación en español.
const ES_HEADER =
  /significad|signific|función|situación|para qué|español|literal|uso|cuándo|matiz|pista|mecánica|efecto|ojo|cómo|origen|oculto|equivale|eso se dice|^persona$|^tipo$|^grupo$|^género$|^caso$|^poseedor$|^pregunta$|^registro$|^nivel$|n\.º|cifra|^letra$|imagen|suena|léelo|qué practica|^truco$|^nota$|lo que entienden|^número$|^servicio$|^fecha$|^fiesta$|qué se hace/i;
// Rasgos de texto en español (el alemán no usa tildes agudas ni ñ).
const ES_TEXT =
  /[áíóúñ¿¡]|(?<!\p{L})(el|la|los|las|de|del|que|con|para|por|una?|y|o|se|lo|cuando|sin|más|(in)?definido|masculino|femenino|neutro)(?!\p{L})/iu;

export function germanCells(headers, row) {
  const out = [];
  row.forEach((cell, i) => {
    const h = plainText(headers?.[i] || "");
    if (h && ES_HEADER.test(h)) return;
    // Las glosas en español suelen ir entre paréntesis o comillas latinas
    // ("Ich gebe dem Mann (le doy al hombre)"): se quitan antes de decidir.
    const t = plainText(cell)
      .replace(/\([^)]*\)|«[^»]*»|\[[^\]]*\]/g, " ")
      .replace(/[✅❌⚠🇨🇭🇩🇪]/gu, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^[-–—]+$/, "");
    if (!t || ES_TEXT.test(t)) return;
    out.push(t.replace(/^-/, "").replace(/\s*\/\s*/g, ", ").replace(/\s*[—–]\s*/g, " "));
  });
  return out;
}

// Texto que lee el botón 🔊 de una fila de tabla.
export function tableRowSpeech(headers, row) {
  return germanCells(headers, row).join(". ");
}

// ¿El texto está en alemán? (sin glosas en español entre paréntesis/comillas)
export function isGerman(text) {
  const t = (text || "").replace(/\([^)]*\)|«[^»]*»/g, " ").trim();
  return !!t && !ES_TEXT.test(t);
}

// Frase completa de un ejercicio con la respuesta correcta colocada en el
// hueco («Ich ___ müde» + «bin» → «Ich bin müde»). Si la pregunta no es una
// frase alemana con hueco, devuelve "" y no se ofrece audio.
export function quizSentence(questionHtml, answer) {
  let html = String(questionHtml || "");
  // Huecos escritos a mano («___») sin su span: se tratan igual.
  if (!/class="blank"/.test(html)) html = html.replace(/_{2,}/g, '<span class="blank">___</span>');
  const BLANK = /<span class="blank">[^<]*<\/span>/g;
  const nBlanks = (html.match(BLANK) || []).length;
  const parts = answer.includes("…")
    ? answer.split("…").map((x) => x.trim())
    : nBlanks > 1 && answer.split(/\s+/).length === nBlanks
    ? answer.split(/\s+/)
    : [answer];
  let i = 0;
  html = html.replace(BLANK, () => {
    const v = parts.length === nBlanks ? parts[i] : i === 0 ? answer : "";
    i++;
    return v;
  });

  let t = textContent(html)
    .replace(/^\s*\d+\.\s*/, "")
    .replace(/\([^)]*\)|«[^»]*»/g, " ");
  const segs = t.split(/→|:/).map((x) => x.trim());
  t = segs[segs.length - 1] || "";
  if (!t && nBlanks === 0) t = answer; // «Os invitamos.» → (respuesta = frase entera)
  t = t
    .replace(/^[\s,;…]+/, "")
    .replace(/\s+([,.?!])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  // Terminaciones marcadas con guion en los ejercicios: «nett-e» → «nette».
  t = t.replace(/(\p{Ll})-(e|en|er|es|em)(?!\p{L})/gu, "$1$2");
  if (!/\p{L}/u.test(t) || /…|\.\.\.|\+|=/.test(t) || /significa|obligatorio/i.test(t)) return "";
  // Si la frase que queda no contiene la respuesta, no es la frase del ejercicio.
  const ans = answer.replace(/^-/, "").split("…")[0].trim().toLowerCase();
  if (nBlanks && ans && !t.toLowerCase().includes(ans)) return "";
  return isGerman(t) ? t : "";
}

// Texto completo de una lectura (título + párrafos).
export function readingSpeech(reading) {
  return [reading.title, ...reading.paragraphs].map(plainText).join(" \n ");
}
