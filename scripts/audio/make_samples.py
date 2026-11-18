"""Genera muestras de varias voces para elegir (scripts/audio/.samples) y una
página HTML con todo incrustado para escucharlas."""
import base64, json, time
from pathlib import Path
from piper_tts import Voice

HERE = Path(__file__).resolve().parent
OUT = HERE / ".samples"
OUT.mkdir(exist_ok=True)

TEXTS = [
    ("Frase de lección", "Ich lerne Deutsch, weil ich in Zürich arbeiten möchte."),
    ("Frase de lección", "Könnten Sie das bitte noch einmal wiederholen?"),
    ("Pregunta", "Wo ist der Bahnhof? Ist es weit zu Fuß?"),
    ("Diálogo", "Grüezi! Was darf es sein? — Ein halbes Kilo Äpfel, bitte."),
    ("Diálogo", "Das tut mir sehr leid. Ich kümmere mich sofort darum."),
    ("Quiz completo", "Wir fahren am Wochenende in die Berge."),
    ("Palabra suelta", "Schlüssel"),
    ("Palabra suelta", "Frühstück"),
    ("Palabra suelta", "Entschuldigung"),
    ("Vocabulario con artículo", "die Umkleidekabine"),
    ("Vocabulario con artículo", "das Eichhörnchen"),
    ("Forma verbal", "aufgestanden"),
    ("Formas principales", "sprechen, sprach, gesprochen"),
    ("Fila de tabla", "ich bin gegangen"),
    ("Fila de tabla", "wir würden gekommen sein"),
    ("Fila de tabla", "du hättest gewusst"),
    ("Ejemplo de verbo", "Er hat gestern den ganzen Tag gearbeitet."),
    ("Konjunktiv I", "Man sagt, sie habe keine Zeit."),
    ("Números y hora", "Der Zug fährt um siebzehn Uhr zweiundzwanzig von Gleis zwölf."),
    ("Texto largo", "Ich heiße Lena, bin vierundzwanzig Jahre alt und komme aus Leipzig. Seit Montag arbeite ich als Rezeptionistin in einem kleinen Hotel am Hamburger Hafen. Ich war ziemlich aufgeregt, denn es war mein erster richtiger Job nach der Ausbildung. Am Abend war ich sehr müde, aber auch glücklich."),
]

VOICES = [
    ("A · Thorsten (alta calidad, masculina)", "de_DE-thorsten-high", None),
    ("B · MLS hablante 3885 (femenina)", "de_DE-mls-medium", "3885"),
    ("C · Thorsten emotional, neutral (masculina)", "de_DE-thorsten_emotional-medium", "neutral"),
]

stats = []
html = ["<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'>",
        "<title>Muestras de voz alemana</title><style>body{font-family:system-ui;max-width:900px;margin:24px auto;padding:0 16px;color:#222}"
        "table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:6px;vertical-align:top;font-size:14px}"
        "audio{width:180px;height:32px}small{color:#777}@media(prefers-color-scheme:dark){body{background:#111;color:#eee}td,th{border-color:#333}}</style>",
        "<h1>Muestras de voz alemana (Piper)</h1><p>Escucha y dime qué voz prefieres (A, B o C). Todas permiten uso comercial.</p>"]
heads = "".join(f"<th>{n}</th>" for n, _, _ in VOICES)
html.append(f"<table><tr><th>Texto</th>{heads}</tr>")
clips = {}
for label, model, spk in VOICES:
    v = Voice(model, spk)
    t0 = time.time(); secs = 0
    d = OUT / model.replace("de_DE-", "") / (spk or "default")
    d.mkdir(parents=True, exist_ok=True)
    for i, (_, text) in enumerate(TEXTS):
        audio = v.samples(text)
        secs += len(audio) / v.rate
        mp3 = v.encode(audio)
        (d / f"{i+1:02d}.mp3").write_bytes(mp3)
        clips[(label, i)] = base64.b64encode(mp3).decode()
    el = time.time() - t0
    stats.append({"voz": label, "audio_s": round(secs, 1), "generacion_s": round(el, 1), "x_tiempo_real": round(secs / el, 1)})
for i, (kind, text) in enumerate(TEXTS):
    cells = "".join(f"<td><audio controls preload=none src='data:audio/mpeg;base64,{clips[(l, i)]}'></audio></td>" for l, _, _ in VOICES)
    html.append(f"<tr><td><small>{kind}</small><br>{text}</td>{cells}</tr>")
html.append("</table>")
(OUT / "muestras.html").write_text("\n".join(html), encoding="utf-8")
print(json.dumps(stats, ensure_ascii=False, indent=1))
