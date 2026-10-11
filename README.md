# Índice de Alemán

App de estudio de alemán, hermana de **Índice de Inglés** (misma filosofía
pedagógica, contenido gramatical distinto): 18 bloques de gramática (reglas,
ejemplos con roles de color por caso, tablas, quizzes y cajas de "escribe tu
frase"), un Glosario de referencia (bloque 19) y un panel de práctica
(bloque 20) con progreso agregado, flashcards de 200 Redewendungen y un
simulador de speaking cronometrado.

- **Frontend:** React + Vite (`frontend/`)
- **Backend:** FastAPI + SQLite (`backend/`) — guarda tu progreso
- **Contenido:** archivos JSON editables en `backend/app/content/` (uno por bloque)

## Los roles de color (pedagógicos, no decorativos)

Los ejemplos colorean por **caso/función gramatical** con clases CSS:

| Clase    | Rol                                   |
| -------- | ------------------------------------- |
| `r-nom`  | sujeto (Nominativ)                    |
| `r-akk`  | objeto directo (Akkusativ)            |
| `r-dat`  | objeto indirecto (Dativ)              |
| `r-gen`  | posesión (Genitiv)                    |
| `r-verb` | verbo conjugado / 2ª posición         |
| `r-sep`  | prefijo separable / cierre verbal     |
| `r-sub`  | conector subordinante                 |
| `r-adj`  | terminación de adjetivo declinada     |

Cada bloque declara en su `legend` solo los roles que usa (con `"role": "nom"`
el punto de la leyenda toma el color real del rol).

## Estructura

```
backend/
  app/
    main.py            FastAPI: API + sirve el build de React en producción
    db.py              SQLite (tabla key/value de progreso)
    content.py         carga los JSON de contenido
    content/           block_01.json … block_20.json, _index.json  ← el contenido
    routers/
      content.py       GET /api/blocks, /api/blocks/{block}
      progress.py      GET/PUT/DELETE progreso, import y reset
  requirements.txt
  data/                progress.db (se crea solo; no se sube a git)
frontend/
  src/
    App.jsx            layout + sidebar + carga de bloques (bloque 20 = práctica)
    progress.jsx       estado global de progreso (carga 1 vez, escribe al backend)
    components/        BlockPage, SectionCard, Quiz, ProduceBox, Table, RichText
    panels/            PracticePage, ProgressPanel, IdiomFlashcards, ExamSimulator
    data/              idioms.js (200 Redewendungen), examPrompts.js (speaking)
    styles/            tokens.css (design tokens + roles de caso), app.css
```

## Cómo correrlo (desarrollo)

Necesitas **dos terminales**. Los puertos son distintos a los del Índice de
Inglés (backend **8002**, frontend **5174**) para poder tener las dos apps
corriendo a la vez.

**1. Backend (API + base de datos):**
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```

**2. Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Abre http://localhost:5174 — Vite reenvía las llamadas `/api` al backend.

## Producción (un solo servidor)

```bash
cd frontend && npm run build       # genera frontend/dist
cd ../backend && uvicorn app.main:app --port 8002
```
Ahora http://localhost:8002 sirve la app completa (FastAPI entrega el build de React).

## Agregar o editar contenido

Todo el contenido pedagógico vive en `backend/app/content/block_XX.json` y se
recarga solo al guardar. Esquema de cada sección: `idx`, `title`, `level`
(CEFR), `rule` (HTML), `notes` (tipo `exception`/`emphasis`/`tip`/`why`, con
`at: start|end`), `examples` (`en` = frase alemana con spans de rol, `es` =
traducción), `tables`, `quiz` (ids **estables**, nunca reordenar) y `produce`.

Las etiquetas del buscador ⌘K (nivel y destreza) se deducen solas de `level` y
de los campos de cada sección. Un bloque nuevo se registra en `_index.json` (el orden de esa lista es el de
la barra lateral; el panel de práctica `20` va siempre el último).

### Tipos de sección para destrezas y verticales

Campos opcionales que se combinan con los anteriores en la misma sección:

| Campo | Qué muestra | Esquema |
| --- | --- | --- |
| `dialog` | Diálogo en burbujas, audio por turno, «Escuchar todo» (2 voces) y modo «completa el turno» | `{ id, setting, roles: { R: { name, label }, G: {…} }, lines: [ { who, de, es } ] }` |
| `reading` | Texto con glosas al pasar el ratón + lista «Vocabulario» | `{ id, kind, title, paragraphs: ["…<span class=\"gl\" data-es=\"traducción\">Wort</span>…"] }` — las preguntas de comprensión van en `quiz` |
| `vocab` | Tarjetas con artículo coloreado, plural, audio y modo autotest | `{ id: "bXX-voc", items: [ { de: "die Rezeption", pl: "Rezeptionen", es: "la recepción" } ] }` |
| `roleplay` | Juego de rol guiado: el otro habla, tú escribes y comparas con el modelo | `{ id: "bXX-rp", you, partner: { name, label }, steps: [ { partner, es, task, model } ] }` |
| `scenario` | Situación real con objetivos marcables | `{ id: "bXX-sc", situation, goals: ["…"] }` |
| `order` | Ejercicio «ordenar» (hechos de una lectura, pasos…) | `{ id: "bXX-…", prompt, items: ["…"] }` con `items` en el orden correcto |

Los `id` de `roleplay`, `scenario` y `order` deben empezar por `bXX-` para que «Reiniciar
bloque» también los borre.

### Patrón de vertical temática

Cada vertical es un bloque de 5 secciones, siempre en este orden (ver
`block_22.json` como plantilla):

1. **Wortschatz** — `vocab` + `quiz` corto
2. **Redemittel** — tabla `Función | Redemittel` + nota con la frase clave
3. **Diálogo** — `dialog` + nota con la técnica + `quiz` de comprensión
4. **Rollenspiel** — `roleplay` de 5 pasos
5. **Szenario** — `scenario` + `produce`

## Progreso y destacados

- **Repaso espaciado (SRS):** cada respuesta de quiz guarda además `srs:<id de la
  pregunta>` = `{ box, due, lapses, reps, last }` (sistema Leitner: cajas
  0–6 con intervalos 0, 1, 3, 7, 16, 35 y 90 días). Fallar devuelve la
  pregunta a la caja 0 y suma un `lapse`: ese contador es el registro de
  fallos. El panel **Repaso** (`frontend/src/panels/ReviewPanel.jsx`, lógica
  en `frontend/src/srs.js`) muestra lo pendiente de hoy, la previsión de 7
  días, los temas más fallados y lanza sesiones generales o dirigidas a un
  tema. «Reiniciar bloque» no borra el historial `srs:` a propósito.

- Cada quiz se bloquea al responder y se guarda en SQLite por su id (`b02-s1q1`).
- "↺ Reiniciar este epígrafe" borra solo los ids exactos de esa sección;
  "Reiniciar bloque" borra por prefijo `bXX-`.
- La estrella ☆ de reglas, notas, ejemplos, quizzes y "tu turno" guarda claves
  `hl:` y todo aparece en el panel fijo "★ Destacados" con filtros por categoría.
- Flashcards de Redewendungen: claves `idiom:N` (`known`/`review`).
