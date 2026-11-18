// Datos y lógica de la «Fábrica de frases» (sin React): los usa el
// componente SentenceBuilder y el generador de audios (scripts/audio).
//
// Persona: 0 ich · 1 du · 2 er/sie/es · 3 wir · 4 ihr · 5 sie/Sie
export const SUBJECTS = [
  { de: "ich", es: "yo", p: 0 },
  { de: "du", es: "tú", p: 1 },
  { de: "er", es: "él", p: 2 },
  { de: "sie", es: "ella", p: 2 },
  { de: "wir", es: "nosotros", p: 3 },
  { de: "ihr", es: "vosotros", p: 4 },
  { de: "sie", es: "ellos", p: 5, plural: true },
  { de: "Sie", es: "usted", p: 5, usted: true },
];

export const MODALS = [
  { key: "", label: "sin modal" },
  { key: "wollen", de: ["will", "willst", "will", "wollen", "wollt", "wollen"], es: ["quiero", "quieres", "quiere", "queremos", "queréis", "quieren"], label: "wollen · querer" },
  { key: "können", de: ["kann", "kannst", "kann", "können", "könnt", "können"], es: ["puedo", "puedes", "puede", "podemos", "podéis", "pueden"], label: "können · poder" },
  { key: "müssen", de: ["muss", "musst", "muss", "müssen", "müsst", "müssen"], es: ["tengo que", "tienes que", "tiene que", "tenemos que", "tenéis que", "tienen que"], label: "müssen · tener que" },
  { key: "möchten", de: ["möchte", "möchtest", "möchte", "möchten", "möchtet", "möchten"], es: ["quisiera", "quisieras", "quisiera", "quisiéramos", "quisierais", "quisieran"], label: "möchten · querría" },
  { key: "dürfen", de: ["darf", "darfst", "darf", "dürfen", "dürft", "dürfen"], es: ["puedo (tengo permiso)", "puedes", "puede", "podemos", "podéis", "pueden"], label: "dürfen · tener permiso" },
  { key: "sollen", de: ["soll", "sollst", "soll", "sollen", "sollt", "sollen"], es: ["debo", "debes", "debe", "debemos", "debéis", "deben"], label: "sollen · deber" },
];

// verb: forma conjugada (6 personas; separable con la partícula aparte: [verbo, partícula])
// obj: complemento alemán; neg: dónde va nicht ("end" tras el objeto, "pre" antes)
// es: infinitivo con complemento y presente de las 6 personas
export const VERBS = [
  { inf: "arbeiten", de: ["arbeite", "arbeitest", "arbeitet", "arbeiten", "arbeitet", "arbeiten"], obj: "heute", neg: "end", esInf: "trabajar hoy", es: ["trabajo hoy", "trabajas hoy", "trabaja hoy", "trabajamos hoy", "trabajáis hoy", "trabajan hoy"] },
  { inf: "Deutsch lernen", v: "lernen", de: ["lerne", "lernst", "lernt", "lernen", "lernt", "lernen"], obj: "Deutsch", neg: "pre", negObj: "kein Deutsch", esInf: "aprender alemán", es: ["aprendo alemán", "aprendes alemán", "aprende alemán", "aprendemos alemán", "aprendéis alemán", "aprenden alemán"] },
  { inf: "den Film sehen", v: "sehen", de: ["sehe", "siehst", "sieht", "sehen", "seht", "sehen"], obj: "den Film", neg: "end", esInf: "ver la película", es: ["veo la película", "ves la película", "ve la película", "vemos la película", "veis la película", "ven la película"] },
  { inf: "das Buch lesen", v: "lesen", de: ["lese", "liest", "liest", "lesen", "lest", "lesen"], obj: "das Buch", neg: "end", esInf: "leer el libro", es: ["leo el libro", "lees el libro", "lee el libro", "leemos el libro", "leéis el libro", "leen el libro"] },
  { inf: "Brot kaufen", v: "kaufen", de: ["kaufe", "kaufst", "kauft", "kaufen", "kauft", "kaufen"], obj: "das Brot", neg: "end", esInf: "comprar el pan", es: ["compro el pan", "compras el pan", "compra el pan", "compramos el pan", "compráis el pan", "compran el pan"] },
  { inf: "die Wohnung mieten", v: "mieten", de: ["miete", "mietest", "mietet", "mieten", "mietet", "mieten"], obj: "die Wohnung", neg: "end", esInf: "alquilar el piso", es: ["alquilo el piso", "alquilas el piso", "alquila el piso", "alquilamos el piso", "alquiláis el piso", "alquilan el piso"] },
  { inf: "nach Hause gehen", v: "gehen", de: ["gehe", "gehst", "geht", "gehen", "geht", "gehen"], obj: "nach Hause", neg: "pre", esInf: "ir a casa", es: ["voy a casa", "vas a casa", "va a casa", "vamos a casa", "vais a casa", "van a casa"] },
  { inf: "nach Zürich fahren", v: "fahren", de: ["fahre", "fährst", "fährt", "fahren", "fahrt", "fahren"], obj: "nach Zürich", neg: "pre", esInf: "ir a Zúrich (en tren, coche…)", es: ["voy a Zúrich", "vas a Zúrich", "va a Zúrich", "vamos a Zúrich", "vais a Zúrich", "van a Zúrich"] },
  { inf: "morgen kommen", v: "kommen", de: ["komme", "kommst", "kommt", "kommen", "kommt", "kommen"], obj: "morgen", neg: "end", esInf: "venir mañana", es: ["vengo mañana", "vienes mañana", "viene mañana", "venimos mañana", "venís mañana", "vienen mañana"] },
  { inf: "einen Kaffee trinken", v: "trinken", de: ["trinke", "trinkst", "trinkt", "trinken", "trinkt", "trinken"], obj: "den Kaffee", neg: "end", esInf: "tomar el café", es: ["tomo el café", "tomas el café", "toma el café", "tomamos el café", "tomáis el café", "toman el café"] },
  { inf: "Pizza essen", v: "essen", de: ["esse", "isst", "isst", "essen", "esst", "essen"], obj: "die Pizza", neg: "end", esInf: "comer la pizza", es: ["como la pizza", "comes la pizza", "come la pizza", "comemos la pizza", "coméis la pizza", "comen la pizza"] },
  { inf: "mit dem Chef sprechen", v: "sprechen", de: ["spreche", "sprichst", "spricht", "sprechen", "sprecht", "sprechen"], obj: "mit dem Chef", neg: "pre", esInf: "hablar con el jefe", es: ["hablo con el jefe", "hablas con el jefe", "habla con el jefe", "hablamos con el jefe", "habláis con el jefe", "hablan con el jefe"] },
  { inf: "die Rechnung bezahlen", v: "bezahlen", de: ["bezahle", "bezahlst", "bezahlt", "bezahlen", "bezahlt", "bezahlen"], obj: "die Rechnung", neg: "end", esInf: "pagar la cuenta", es: ["pago la cuenta", "pagas la cuenta", "paga la cuenta", "pagamos la cuenta", "pagáis la cuenta", "pagan la cuenta"] },
  { inf: "im Supermarkt einkaufen", v: "einkaufen", de: [["kaufe", "ein"], ["kaufst", "ein"], ["kauft", "ein"], ["kaufen", "ein"], ["kauft", "ein"], ["kaufen", "ein"]], obj: "im Supermarkt", neg: "pre", esInf: "hacer la compra en el súper", es: ["hago la compra en el súper", "haces la compra en el súper", "hace la compra en el súper", "hacemos la compra en el súper", "hacéis la compra en el súper", "hacen la compra en el súper"] },
  { inf: "früh aufstehen", v: "aufstehen", de: [["stehe", "auf"], ["stehst", "auf"], ["steht", "auf"], ["stehen", "auf"], ["steht", "auf"], ["stehen", "auf"]], obj: "früh", neg: "pre", esInf: "levantarse temprano", esBase: "levantar", esRest: "temprano", es: ["me levanto temprano", "te levantas temprano", "se levanta temprano", "nos levantamos temprano", "os levantáis temprano", "se levantan temprano"], reflexEs: true },
  { inf: "die Mutter anrufen", v: "anrufen", de: [["rufe", "an"], ["rufst", "an"], ["ruft", "an"], ["rufen", "an"], ["ruft", "an"], ["rufen", "an"]], obj: "die Mutter", neg: "end", esInf: "llamar a la madre", es: ["llamo a la madre", "llamas a la madre", "llama a la madre", "llamamos a la madre", "llamáis a la madre", "llaman a la madre"] },
  { inf: "hier parken", v: "parken", de: ["parke", "parkst", "parkt", "parken", "parkt", "parken"], obj: "hier", neg: "pre", esInf: "aparcar aquí", es: ["aparco aquí", "aparcas aquí", "aparca aquí", "aparcamos aquí", "aparcáis aquí", "aparcan aquí"] },
  { inf: "das Fenster öffnen", v: "öffnen", de: ["öffne", "öffnest", "öffnet", "öffnen", "öffnet", "öffnen"], obj: "das Fenster", neg: "end", esInf: "abrir la ventana", es: ["abro la ventana", "abres la ventana", "abre la ventana", "abrimos la ventana", "abrís la ventana", "abren la ventana"] },
  { inf: "Tennis spielen", v: "spielen", de: ["spiele", "spielst", "spielt", "spielen", "spielt", "spielen"], obj: "Tennis", neg: "pre", esInf: "jugar al tenis", es: ["juego al tenis", "juegas al tenis", "juega al tenis", "jugamos al tenis", "jugáis al tenis", "juegan al tenis"] },
  { inf: "zu Hause bleiben", v: "bleiben", de: ["bleibe", "bleibst", "bleibt", "bleiben", "bleibt", "bleiben"], obj: "zu Hause", neg: "pre", esInf: "quedarse en casa", esBase: "quedar", esRest: "en casa", es: ["me quedo en casa", "te quedas en casa", "se queda en casa", "nos quedamos en casa", "os quedáis en casa", "se quedan en casa"], reflexEs: true },
];

export const TYPES = [
  ["afirm", "Afirmativa"],
  ["neg", "Negativa"],
  ["frage", "Pregunta"],
];

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Infinitivo de un verbo separable/no separable para la posición final
const infOf = (verb) => verb.v || verb.inf;

export function build(subj, modal, verb, type) {
  const p = subj.p;
  const objDe = verb.obj;
  let finite;
  let tail; // lo que va al final de la frase
  if (modal.key) {
    finite = modal.de[p];
    tail = infOf(verb);
  } else {
    const f = verb.de[p];
    finite = Array.isArray(f) ? f[0] : f;
    tail = Array.isArray(f) ? f[1] : "";
  }
  // Orden: [V1] sujeto … objeto … (nicht) … final
  const middle = [];
  if (type === "neg" && verb.negObj) middle.push(verb.negObj); // sustantivo sin artículo → kein
  else if (type === "neg" && verb.neg === "pre") middle.push("nicht", objDe);
  else if (type === "neg") middle.push(objDe, "nicht");
  else middle.push(objDe);
  const subjDe = subj.de;
  const words =
    type === "frage" ? [cap(finite), subjDe, ...middle, tail] : [subj.p === 0 ? "Ich" : cap(subjDe), finite, ...middle, tail];
  if (type !== "frage" && subjDe === "Sie") words[0] = "Sie";
  const de = words.filter(Boolean).join(" ") + (type === "frage" ? "?" : ".");

  // Español
  const pIdx = subj.usted ? 2 : p;
  let core;
  if (modal.key) {
    const inf = verb.reflexEs ? `${verb.esBase}${reflex(pIdx, subj.usted)} ${verb.esRest}` : verb.esInf;
    core = `${modal.es[pIdx]} ${inf}`;
  } else {
    core = verb.es[pIdx];
  }
  const pron = subj.es;
  const needPron = [2, 5].includes(p); // él/ella/ellos/usted: el verbo no lo aclara
  let es;
  if (type === "neg") es = `${cap(pron)} no ${core}.`;
  else if (type === "frage") es = `¿${cap(core)}${needPron ? " " + pron : ""}?`;
  else es = `${cap(pron)} ${core}.`;
  return { de, es, tarzan: !modal.key && (p === 3 || p === 5) };
}

function reflex(p, usted) {
  if (usted) return "se";
  return ["me", "te", "se", "nos", "os", "se"][p];
}

// Todas las combinaciones posibles (para generar sus audios).
export function allSentences() {
  const out = [];
  for (const s of SUBJECTS) for (const m of MODALS) for (const v of VERBS) for (const [t] of TYPES) out.push(build(s, m, v, t).de);
  return out;
}
