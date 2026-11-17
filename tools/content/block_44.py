from common import *

B = {"block": "44", "title": "Orientarse y moverse: indicaciones, transporte y coche", "kicker": "Bloque 44 · Supervivencia · A2",
 "intro": "Preguntar y entender el camino, moverte en tren, bus y tranvía, sobrevivir en el aeropuerto y conducir (con la <b class=\"hl\">vignette</b> obligatoria en las autopistas suizas). La clave gramatical: imperativo con <i>Sie</i> + preposiciones de lugar.",
 "sections": [
  {"idx": "44.1", "title": "Wortschatz: orientación y transporte", "level": "A2", "rule": VOCAB_RULE,
   "vocab": vocab("b44-voc", [
     ("links · rechts · geradeaus", "a la izquierda · a la derecha · recto"), ("die Kreuzung", "el cruce", "Kreuzungen"), ("die Ampel", "el semáforo", "Ampeln"),
     ("die Ecke", "la esquina", "Ecken"), ("gegenüber", "enfrente"), ("in der Nähe", "cerca"),
     ("der Norden · der Süden · der Osten · der Westen", "el norte · el sur · el este · el oeste"), ("die Haltestelle", "la parada", "Haltestellen"), ("das Tram (CH) / die Straßenbahn", "el tranvía", "Trams"),
     ("umsteigen · aussteigen · einsteigen", "hacer transbordo · bajarse · subirse"), ("der Flughafen", "el aeropuerto", "Flughäfen"), ("der Abflug · die Ankunft", "la salida · la llegada (vuelos)"),
     ("der Koffer", "la maleta", "Koffer"), ("der Mietwagen", "el coche de alquiler", "Mietwagen"), ("die Autobahn", "la autopista", "Autobahnen"),
     ("tanken", "echar gasolina"), ("parken", "aparcar"), ("das Halbtax (CH)", "el abono que reduce los billetes a la mitad", "")]),
   "notes": [note("tip", "En Suiza se dice <b>das Tram</b> y <b>das Velo</b>; en Alemania, <i>die Straßenbahn</i> y <i>das Fahrrad</i>. Con el <b>Halbtax</b> pagas la mitad en trenes, buses y barcos; el <b>GA</b> (Generalabonnement) es la tarifa plana anual.")],
   "quiz": [
     q("b44-s1q1", "1. «hacer transbordo» →", ["aussteigen", "umsteigen", "einsteigen"], 1, "<b>umsteigen</b> = cambiar de tren/bus. <i>aussteigen</i> = bajarse."),
     q("b44-s1q2", "2. «enfrente del banco» →", ["gegenüber der Bank", "vor der Bank hinter", "neben der Bank"], 0, "<b>gegenüber</b> + dativo = enfrente de."),
     q("b44-s1q3", "3. die Ampel es…", ["la lámpara", "el semáforo", "el cruce"], 1, "<b>die Ampel</b> = semáforo; el cruce es <i>die Kreuzung</i>.")]},
  {"idx": "44.2", "title": "Dar y entender indicaciones", "level": "A2",
   "rule": "Las indicaciones van en <b>imperativo formal</b> (verbo + Sie) o con <b>Sie müssen …</b>. Preposiciones clave: <b>über</b> + acusativo (cruzar), <b>an</b> + dativo (en el semáforo), <b>bis zu</b> + dativo (hasta), <b>durch</b> + acusativo (a través de), <b>um die Ecke</b> (a la vuelta de la esquina).",
   "tables": table(["Indicación", "Español"], [
     ["Gehen Sie geradeaus bis zur Kreuzung.", "Siga recto hasta el cruce."],
     ["Biegen Sie an der Ampel links ab.", "En el semáforo, gire a la izquierda."],
     ["Nehmen Sie die zweite Straße rechts.", "Tome la segunda calle a la derecha."],
     ["Gehen Sie über die Brücke.", "Cruce el puente."],
     ["Gehen Sie durch den Park.", "Atraviese el parque."],
     ["Die Post ist gleich um die Ecke.", "Correos está justo a la vuelta de la esquina."],
     ["Das ist ziemlich weit, nehmen Sie lieber das Tram.", "Está bastante lejos, mejor coja el tranvía."],
     ["Entschuldigung, wie komme ich zum Bahnhof?", "Perdone, ¿cómo llego a la estación?"]]),
   "notes": [note("tip", "<b>zum</b> / <b>zur</b> para el destino: <i>zum</i> Bahnhof (der), <i>zur</i> Post (die), <i>zum</i> Museum (das). Y si no entiendes: <i>Können Sie mir das auf der Karte zeigen?</i>")],
   "quiz": [
     q("b44-s2q1", "1. «Cruce el puente» →", ["Gehen Sie über die Brücke.", "Gehen Sie über der Brücke.", "Gehen Sie durch die Brücke."], 0, "Movimiento por encima: <b>über</b> + acusativo (die Brücke)."),
     q("b44-s2q2", "2. «¿Cómo llego a Correos?» (die Post) →", ["Wie komme ich zum Post?", "Wie komme ich zur Post?", "Wie komme ich nach der Post?"], 1, "die Post → zu + der = <b>zur</b> Post. <i>nach</i> es para ciudades y países."),
     q("b44-s2q3", "3. «Gire a la izquierda en el semáforo» →", ["Biegen Sie an der Ampel links ab.", "Biegen Sie auf die Ampel links ab.", "Abbiegen Sie links an der Ampel."], 0, "Lugar: <b>an der</b> Ampel (dativo); <i>abbiegen</i> es separable: biegen … ab."),
     q("b44-s2q4", "4. «Está a la vuelta de la esquina» →", ["um die Ecke", "an die Ecke", "über die Ecke"], 0, "Expresión fija: <b>um die Ecke</b>.")]},
  {"idx": "44.3", "title": "Transporte público y aeropuerto", "level": "A2",
   "rule": "Frases para el tren, el tranvía y el aeropuerto. En Suiza el transporte es puntualísimo: si pone 10:04, sale a las 10:04.",
   "examples": examples([
     ("Welcher Bus fährt zum Flughafen?", "¿Qué autobús va al aeropuerto?"),
     ("Ist das der Zug nach Bern?", "¿Es este el tren a Berna?"),
     ("Wo muss ich umsteigen?", "¿Dónde tengo que hacer transbordo?"),
     ("Wie viele Haltestellen sind es noch?", "¿Cuántas paradas faltan?"),
     ("Nächster Halt: Zürich HB.", "Próxima parada: Zúrich estación central (Hauptbahnhof)."),
     ("Wo ist der Check-in für den Flug nach Madrid?", "¿Dónde está el mostrador de facturación para el vuelo a Madrid?"),
     ("Ich habe nur Handgepäck.", "Solo llevo equipaje de mano."),
     ("Mein Koffer ist nicht angekommen.", "Mi maleta no ha llegado.")]),
   "quiz": [
     q("b44-s3q1", "1. «¿Es este el tren a Berna?» →", ["Ist das der Zug zu Bern?", "Ist das der Zug nach Bern?", "Ist das der Zug für Bern?"], 1, "Ciudades: <b>nach</b>."),
     q("b44-s3q2", "2. «HB» en los paneles suizos significa…", ["Hauptbahnhof (estación central)", "Halbtax-Billett", "Hafen-Bus"], 0, "<b>HB</b> = Hauptbahnhof."),
     q("b44-s3q3", "3. «Mi maleta no ha llegado» →", ["Mein Koffer ist nicht angekommen.", "Mein Koffer hat nicht angekommen.", "Meine Koffer ist nicht gekommen an."], 0, "<i>ankommen</i> (movimiento) va con <b>sein</b>; der Koffer → <b>mein</b>.")]},
  {"idx": "44.4", "title": "En coche: alquilar, aparcar y las señales", "level": "A2",
   "rule": "Para conducir en Suiza necesitas la <b>Autobahnvignette</b> (pegatina anual para autopistas) y respetar los límites (50 en ciudad, 80 en carretera, 120 en autopista). Estas son las señales y frases que más vas a ver y usar.",
   "examples": examples([
     ("Ich möchte ein Auto für drei Tage mieten.", "Quiero alquilar un coche para tres días."),
     ("Ist die Vignette schon dabei?", "¿Ya lleva la viñeta?"),
     ("Einbahnstraße", "Calle de sentido único."),
     ("Umleitung · Baustelle", "Desvío · Obras."),
     ("Parkverbot · Halteverbot", "Prohibido aparcar · Prohibido detenerse."),
     ("Vorfahrt achten!", "¡Ceda el paso!"),
     ("Wo kann ich hier parken? — Im Parkhaus gegenüber.", "¿Dónde puedo aparcar aquí? — En el aparcamiento de enfrente."),
     ("Volltanken, bitte. / Bleifrei 95.", "Lleno, por favor. / Sin plomo 95.")]),
   "quiz": [
     q("b44-s4q1", "1. «Umleitung» significa…", ["Desvío", "Obras", "Salida"], 0, "<b>die Umleitung</b> = desvío. Obras = <i>Baustelle</i>."),
     q("b44-s4q2", "2. ¿Qué necesitas para la autopista en Suiza?", ["die Vignette", "das Halbtax", "das Parkhaus"], 0, "La <b>Vignette</b> es obligatoria en las autopistas suizas."),
     q("b44-s4q3", "3. «Quiero alquilar un coche» →", ["Ich möchte ein Auto mieten.", "Ich möchte ein Auto vermieten.", "Ich möchte ein Auto leihen aus."], 0, "El cliente <b>mietet</b>; la empresa <i>vermietet</i>.")]},
  {"idx": "44.5", "title": "Rollenspiel: la maleta perdida", "level": "B1",
   "rule": "Llegas a Zúrich y tu maleta no aparece. Vas al mostrador de equipajes (Gepäckermittlung). Responde y compara.",
   "roleplay": roleplay("b44-rp", "Gepäckservice", "Mostrador de equipajes", [
     ("Grüezi, wie kann ich Ihnen helfen?", "Buenas, ¿en qué puedo ayudarla?", "Explica que tu maleta no ha llegado y de dónde vienes.", "Grüezi, mein Koffer ist nicht angekommen. Ich komme mit dem Flug aus Madrid."),
     ("Haben Sie Ihren Gepäckschein?", "¿Tiene el resguardo del equipaje?", "Di que sí y entrégalo.", "Ja, hier ist er."),
     ("Danke. Wie sieht der Koffer aus?", "Gracias. ¿Cómo es la maleta?", "Describe la maleta: grande, roja, con ruedas.", "Er ist groß und rot und hat vier Rollen."),
     ("Er ist wahrscheinlich noch in Madrid. Wir können ihn morgen zu Ihnen nach Hause bringen.", "Probablemente sigue en Madrid. Podemos llevársela mañana a casa.", "Acepta y da tu dirección.", "Das wäre super. Meine Adresse ist Seestrasse 12 in Zürich."),
     ("Notiert. Sie bekommen eine SMS, wenn er unterwegs ist.", "Apuntado. Recibirá un SMS cuando vaya de camino.", "Pregunta qué hacer si necesitas cosas urgentes hoy.", "Und was mache ich, wenn ich heute etwas Dringendes brauche?"),
     ("Kaufen Sie das Nötigste und bewahren Sie die Quittungen auf. Die Airline erstattet es.", "Compre lo imprescindible y guarde los tiques. La aerolínea se lo reembolsa.", "Agradece y despídete.", "Alles klar, vielen Dank für Ihre Hilfe!")])}
 ]}
write(B)
