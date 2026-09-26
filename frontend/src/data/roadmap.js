// Hoja de ruta A1–C2 del Índice de Alemán. Contenido plano y editable:
// diagnóstico de niveles + fases marcables + catálogos de contenido.
export const ROADMAP = {
  updated: "26 sep 2026",
  current: { A1: 19, A2: 37, B1: 33, B2: 9, C1: 0, C2: 0 },
  groups: [
    {
      id: "fases",
      kind: "phases",
      title: "Fases de construcción",
      intro:
        "El orden sugerido para pasar de índice de gramática a método completo. Cada fase está ordenada por impacto y esfuerzo; marca los hitos a medida que los construimos.",
      phases: [
        {
          n: 1,
          name: "Audio (TTS) en todo lo existente",
          goal: "El mayor salto de calidad percibida con el menor esfuerzo.",
          impact: "impacto alto",
          effort: "esfuerzo bajo",
          items: [
            { id: "p1a", t: "Motor TTS con voz alemana (Web Speech API o servicio)" },
            { id: "p1b", t: "Botón «escuchar» en cada ejemplo y fila de tabla" },
            { id: "p1c", t: "Audio en las 200 Redewendungen" },
            { id: "p1d", t: "Control de velocidad (normal / lento)" },
          ],
        },
        {
          n: 2,
          name: "Diálogos y textos de lectura",
          goal: "Abre las destrezas que hoy faltan: leer de verdad, no frases sueltas.",
          impact: "impacto alto",
          effort: "esfuerzo medio",
          items: [
            { id: "p2a", t: "Schema + componente «dialog» (turnos, roles, traducción plegable)" },
            { id: "p2b", t: "Schema + componente «reading» (texto + preguntas de comprensión)" },
            { id: "p2c", t: "Vocabulario glosado al margen del texto" },
            { id: "p2d", t: "Piloto: 1 diálogo de recepción + 1 texto con 5 preguntas" },
          ],
        },
        {
          n: 3,
          name: "Verticales temáticas",
          goal: "Contenido para usar el idioma en contexto profesional real.",
          impact: "impacto alto",
          effort: "esfuerzo medio",
          items: [
            { id: "p3a", t: "Patrón de vertical: Wortschatz + Redemittel + Dialoge + Rollenspiel + Szenario" },
            { id: "p3b", t: "3 verticales piloto: recepción, inmobiliaria, ventas", note: "Ver la sección «Verticales temáticas» abajo" },
          ],
        },
        {
          n: 4,
          name: "SRS y registro de errores",
          goal: "Convierte el progreso que ya guardas en aprendizaje dirigido.",
          impact: "impacto alto",
          effort: "esfuerzo medio",
          items: [
            { id: "p4a", t: "SRS (repaso espaciado) sobre el motor de progreso actual" },
            { id: "p4b", t: "Registro de fallos frecuentes por usuario" },
            { id: "p4c", t: "Sesión de repaso dirigida a lo que fallas" },
          ],
        },
        {
          n: 5,
          name: "Análisis sintáctico",
          goal: "Diferenciador visual que encaja con tu sistema de colores por caso.",
          impact: "impacto medio",
          effort: "esfuerzo medio",
          items: [
            { id: "p5a", t: "Schema + componente «syntax»" },
            { id: "p5b", t: "Satzglieder: marcar sujeto / predicado / objetos / complementos" },
            { id: "p5c", t: "Feldermodell coloreado (Vorfeld · Klammer · Mittelfeld · Nachfeld)" },
          ],
        },
        {
          n: 6,
          name: "B2 completo y C1 / C2",
          goal: "Hoy B2 tiene 9 secciones y C1/C2 cero: el salto cualitativo.",
          impact: "impacto alto",
          effort: "esfuerzo alto",
          items: [
            { id: "p6a", t: "Completar B2 (ampliar las 9 secciones actuales)" },
            { id: "p6b", t: "Bloques C1", note: "Ver objetivos concretos en «B2 → C1 → C2»" },
            { id: "p6c", t: "Bloques C2 (registro, matiz, textos auténticos)" },
          ],
        },
        {
          n: 7,
          name: "Escritura y simulacros de examen",
          goal: "Cierra la cuarta destreza y prepara certificaciones.",
          impact: "impacto medio",
          effort: "esfuerzo alto",
          items: [
            { id: "p7a", t: "Schema «writing» (tarea + modelo + checklist de autocorrección)" },
            { id: "p7b", t: "Corrección automática por IA de lo que escribe el alumno" },
            { id: "p7c", t: "Simulacros por examen: Goethe / telc / TestDaF / ÖSD / DSH" },
          ],
        },
      ],
    },
    {
      id: "tipos",
      kind: "checklist",
      title: "Tipos de contenido nuevos",
      intro:
        "Cada uno es un «type» de sección o un panel nuevo en el renderizador. Hoy solo existen regla, ejemplos, tablas, quiz y «escribe tu frase».",
      items: [
        { id: "t-dialog", t: "Diálogos", note: "turnos con rol, traducción plegable, audio por línea, modo «completa el turno»" },
        { id: "t-reading", t: "Textos de lectura + comprensión", note: "richtig/falsch, opción múltiple, ordenar; vocabulario glosado" },
        { id: "t-excerpt", t: "Fragmentos literarios y periodísticos", note: "con glosas, nivel y notas de estilo; ojo a derechos (dominio público / redactados al estilo)" },
        { id: "t-syntax", t: "Análisis sintáctico", note: "Satzglieder + Feldermodell en rejilla coloreada" },
        { id: "t-audio", t: "Listening", note: "audio + transcripción oculta + huecos + preguntas" },
        { id: "t-cloze", t: "Lückentext a nivel de texto", note: "rellenar huecos en un párrafo, no en una frase suelta" },
        { id: "t-writing", t: "Escritura con modelo", note: "tarea + checklist + texto modelo + errores típicos" },
        { id: "t-drill", t: "Entrenadores generativos", note: "conjugador y declinador que generan ejercicios infinitos con SRS" },
      ],
    },
    {
      id: "verticales",
      kind: "verticals",
      title: "Verticales temáticas",
      intro:
        "Cada vertical es un paquete de 5 piezas, no una lista de palabras: Wortschatz · Redemittel · Diálogos · Rollenspiel · un Szenario real. Las tres primeras son las que pediste como prioridad de negocio.",
      items: [
        { id: "v-recep", t: "Recepción / hostelería", note: "check-in/out, incidencias, teléfono · escenario: huésped con problema en la habitación" },
        { id: "v-inmo", t: "Inmobiliaria (ventas)", note: "inmueble, contrato, visita, financiación · escenario: presentar un piso y cerrar visita" },
        { id: "v-vgen", t: "Ventas en general", note: "pitch, objeciones, cierre, seguimiento · escenario: llamada en frío y negociar precio" },
        { id: "v-vtur", t: "Ventas turismo", note: "paquetes, upselling, objeciones · escenario: vender una excursión y rebatir «es caro»" },
        { id: "v-tur", t: "Turismo", note: "indicaciones, transporte, reservas · escenario: comprar billete y check-in de hotel" },
        { id: "v-gastro", t: "Gastronomía", note: "carta, alérgenos, pedir, quejarse, pagar · escenario: leer un menú alemán y pedir" },
        { id: "v-alltag", t: "Alltag (día a día)", note: "compras, citas, teléfono, small talk" },
        { id: "v-arbeit", t: "Trabajo / Bewerbung", note: "CV, carta de motivación, entrevista" },
        { id: "v-behoerden", t: "Trámites / Behörden", note: "Anmeldung, banco, seguros, correos" },
        { id: "v-salud", t: "Salud", note: "síntomas, médico, farmacia, cita" },
      ],
    },
    {
      id: "cefr",
      kind: "checklist",
      title: "B2 → C1 → C2",
      intro:
        "El salto a nivel alto no es «más frases»: es gramática y competencias nuevas. Esto es lo que hoy falta por completo.",
      items: [
        { id: "c-konj1", t: "Konjunktiv I (estilo indirecto)", note: "imprescindible para prensa e informes" },
        { id: "c-nom", t: "Verbalstil ↔ Nominalstil / Nominalisierung" },
        { id: "c-fvg", t: "Funktionsverbgefüge", note: "in Frage stellen, zur Verfügung stellen, Anwendung finden…" },
        { id: "c-partizip", t: "Partizipial- y erweiterte Attribute", note: "der gestern angekommene Gast" },
        { id: "c-konnekt", t: "Konnektoren avanzados y Präpositionaladverbien", note: "dessen ungeachtet, insofern, hierbei" },
        { id: "c-partikel", t: "Modalpartikeln", note: "doch, ja, mal, halt, eben, wohl — el matiz que separa B2 de nativo" },
        { id: "c-register", t: "Registro", note: "mismo mensaje en formal / informal / burocrático; ironía; eufemismos" },
        { id: "c-texttypen", t: "Tipos de texto productivos", note: "Erörterung, Zusammenfassung, formeller Brief, Grafikbeschreibung" },
        { id: "c-kollok", t: "Colocaciones y sinonimia fina", note: "a escala de lo que hoy insinúa el bloque 17" },
        { id: "c-auth", t: "Textos auténticos largos", note: "prensa, ensayo, literatura, con análisis de estilo" },
      ],
    },
    {
      id: "infra",
      kind: "checklist",
      title: "Infraestructura de método",
      intro: "Lo que convierte un índice en un método: progresión, memoria y evaluación.",
      items: [
        { id: "i-placement", t: "Test de nivel / colocación", note: "te dice por dónde empezar" },
        { id: "i-srs", t: "Repaso espaciado (SRS)", note: "reutilizando el progreso en SQLite" },
        { id: "i-ruta", t: "Ruta de aprendizaje con progresión y desbloqueo" },
        { id: "i-errores", t: "Registro de errores → repaso dirigido" },
        { id: "i-examenes", t: "Módulos de preparación de exámenes", note: "formatos reales, simulacros cronometrados" },
        { id: "i-audio", t: "Pipeline de audio (TTS) en todo el contenido" },
        { id: "i-buscador", t: "Buscador global + etiquetado por tema / nivel / destreza" },
      ],
    },
  ],
};

// Todos los ids marcables, en orden.
export const ALL_IDS = ROADMAP.groups.flatMap((g) =>
  g.kind === "phases" ? g.phases.flatMap((p) => p.items.map((i) => i.id)) : g.items.map((i) => i.id)
);

export function groupIds(g) {
  return g.kind === "phases" ? g.phases.flatMap((p) => p.items.map((i) => i.id)) : g.items.map((i) => i.id);
}
