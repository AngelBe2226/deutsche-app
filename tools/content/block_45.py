from common import *

B = {"block": "45", "title": "Emergencias, accidentes y policía", "kicker": "Bloque 45 · Supervivencia · A2–B1",
 "intro": "Ojalá no lo necesites, pero conviene saberlo de memoria: <b class=\"hl\">los números de emergencia de Suiza</b>, cómo pedir ayuda, qué te preguntarán al llamar y cómo denunciar un robo o recuperar algo perdido.",
 "sections": [
  {"idx": "45.1", "title": "Wortschatz y números de emergencia", "level": "A2",
   "rule": "En Suiza cada servicio tiene su número, aunque el <b>112</b> (europeo) también funciona. Apréndelos y guárdalos en el móvil.",
   "tables": table(["Número", "Servicio", "Alemán"], [
     ["112", "Emergencias (europeo)", "der Notruf"],
     ["117", "Policía", "die Polizei"],
     ["118", "Bomberos", "die Feuerwehr"],
     ["144", "Ambulancia", "der Rettungsdienst / die Sanität (CH)"],
     ["145", "Intoxicaciones", "Tox Info Suisse"],
     ["1414", "Rescate en helicóptero (montaña)", "die Rega"]]),
   "vocab": vocab("b45-voc", [
     ("Hilfe!", "¡Socorro!"), ("der Notfall", "la emergencia", "Notfälle"), ("der Unfall", "el accidente", "Unfälle"),
     ("verletzt", "herido"), ("bewusstlos", "inconsciente"), ("bluten", "sangrar"),
     ("der Krankenwagen", "la ambulancia", "Krankenwagen"), ("die Notaufnahme", "urgencias (del hospital)", "Notaufnahmen"), ("das Feuer · Es brennt!", "el fuego · ¡Hay un incendio!", ""),
     ("der Dieb", "el ladrón", "Diebe"), ("stehlen · gestohlen", "robar · robado"), ("verlieren · verloren", "perder · perdido"),
     ("die Anzeige", "la denuncia", "Anzeigen"), ("das Fundbüro", "la oficina de objetos perdidos", "Fundbüros")]),
   "quiz": [
     q("b45-s1q1", "1. En Suiza, la ambulancia es el…", ["117", "144", "118"], 1, "<b>144</b> = ambulancia. 117 es la policía y 118, los bomberos."),
     q("b45-s1q2", "2. «¡Hay un incendio!» →", ["Es brennt!", "Es feuert!", "Es ist heiß!"], 0, "Incendio: <b>Es brennt!</b>"),
     q("b45-s1q3", "3. Pierdes el móvil en el tren. Vas al…", ["Fundbüro", "Notaufnahme", "Feuerwehr"], 0, "<b>das Fundbüro</b> = objetos perdidos.")]},
  {"idx": "45.2", "title": "Redemittel: llamar a emergencias", "level": "A2",
   "rule": "Al llamar te harán las <b>preguntas W</b>. Prepara las respuestas en este orden y habla despacio: <b>Wo?</b> (dónde) · <b>Was?</b> (qué ha pasado) · <b>Wie viele?</b> (cuántos heridos) · <b>Welche Verletzungen?</b> · <b>Wer?</b> (quién llama). No cuelgues hasta que te lo digan.",
   "tables": table(["Pregunta", "Respuesta modelo"], [
     ["Wo ist der Notfall?", "In Zürich, Seestrasse 45, vor dem Supermarkt."],
     ["Was ist passiert?", "Ein Velofahrer ist gestürzt. / Es gab einen Autounfall."],
     ["Wie viele Verletzte gibt es?", "Eine Person ist verletzt."],
     ["Welche Verletzungen?", "Er blutet am Kopf und ist bewusstlos."],
     ["Wer ruft an?", "Mein Name ist Ana López, meine Nummer ist …"],
     ["(Pedir ayuda a alguien)", "Hilfe! Rufen Sie bitte einen Krankenwagen!"],
     ["(Si no hablas bien)", "Ich spreche nicht gut Deutsch. Sprechen Sie Englisch / Spanisch?"]]),
   "quiz": [
     q("b45-s2q1", "1. ¿Qué es lo primero que debes decir al llamar?", ["Tu nombre completo", "Dónde está la emergencia", "Tu número de seguro"], 1, "La pregunta clave es <b>Wo?</b>: sin la ubicación no pueden enviar ayuda."),
     q("b45-s2q2", "2. «Un ciclista se ha caído» →", ["Ein Velofahrer ist gestürzt.", "Ein Velofahrer hat gestürzt.", "Ein Velofahrer stürzt gefallen."], 0, "<i>stürzen</i> (caerse) es movimiento: Perfekt con <b>sein</b>."),
     q("b45-s2q3", "3. «¡Llame a una ambulancia!» →", ["Rufen Sie einen Krankenwagen!", "Rufen Sie einen Krankenhaus!", "Anrufen Sie Krankenwagen!"], 0, "Imperativo formal: <b>Rufen Sie</b> + acusativo (der Krankenwagen → einen).")]},
  {"idx": "45.3", "title": "En la comisaría: denunciar un robo", "level": "B1",
   "rule": "Para contar lo que pasó usarás el <b>Perfekt</b>. Fórmula útil con dativo: <b>Mir ist … gestohlen worden</b> / coloquial <b>Man hat mir … gestohlen</b>. Para denunciar: <b>Ich möchte Anzeige erstatten</b>.",
   "examples": examples([
     ("Ich möchte einen Diebstahl melden / Anzeige erstatten.", "Quiero denunciar un robo."),
     ("Man hat mir im Tram das Portemonnaie gestohlen.", "Me han robado la cartera en el tranvía."),
     ("Es ist heute Morgen gegen neun Uhr passiert.", "Ha pasado esta mañana hacia las nueve."),
     ("Darin waren meine ID, zwei Kreditkarten und etwa 80 Franken.", "Dentro estaban mi documento de identidad, dos tarjetas y unos 80 francos."),
     ("Ich habe nichts gemerkt.", "No me di cuenta de nada."),
     ("Ich brauche eine Bestätigung für die Versicherung.", "Necesito un justificante para el seguro."),
     ("Meine Karten habe ich schon sperren lassen.", "Ya he bloqueado mis tarjetas (he hecho que las bloqueen).")]),
   "quiz": [
     q("b45-s3q1", "1. «Quiero poner una denuncia» →", ["Ich möchte Anzeige erstatten.", "Ich möchte eine Anzeige machen auf.", "Ich möchte denunzieren."], 0, "Fórmula oficial: <b>Anzeige erstatten</b>."),
     q("b45-s3q2", "2. «Me han robado el móvil» →", ["Man hat mir das Handy gestohlen.", "Man hat mich das Handy gestohlen.", "Ich habe das Handy gestohlen."], 0, "La persona afectada va en <b>dativo</b>: <i>mir</i>. «Ich habe … gestohlen» significaría que robaste tú."),
     q("b45-s3q3", "3. ¿Para qué pides una «Bestätigung»?", ["Para el seguro", "Para el tranvía", "Para el banco de alimentos"], 0, "La <b>Bestätigung</b> (justificante) se presenta al seguro.")]},
  {"idx": "45.4", "title": "Diálogo: llamada al 144", "level": "B1",
   "rule": "Un ciclista se cae delante de ti. Escucha cómo la operadora guía la llamada con preguntas W y cómo se responde con calma.",
   "dialog": dialog("b45-notruf", "Llamada al 144 · Zúrich, martes, 18:20", {"N": ("Notrufzentrale", "Central de emergencias"), "A": ("Ana", "Tú")}, [
     ("N", "Sanitätsnotruf 144. Wo ist der Notfall?", "Ambulancias 144. ¿Dónde es la emergencia?"),
     ("A", "In Zürich, an der Kreuzung Seestrasse und Bellerivestrasse.", "En Zúrich, en el cruce de la Seestrasse con la Bellerivestrasse."),
     ("N", "Was ist passiert?", "¿Qué ha pasado?"),
     ("A", "Ein Velofahrer ist gestürzt. Er liegt auf der Straße.", "Un ciclista se ha caído. Está tendido en la calle."),
     ("N", "Ist er bei Bewusstsein? Atmet er?", "¿Está consciente? ¿Respira?"),
     ("A", "Ja, er ist wach und atmet, aber er blutet am Kopf und kann nicht aufstehen.", "Sí, está despierto y respira, pero sangra por la cabeza y no puede levantarse."),
     ("N", "Gut. Bewegen Sie ihn nicht. Der Krankenwagen ist unterwegs. Wie ist Ihr Name?", "Bien. No lo mueva. La ambulancia está en camino. ¿Cómo se llama usted?"),
     ("A", "Ana López. Meine Nummer ist 079 452 21 13.", "Ana López. Mi número es el 079 452 21 13."),
     ("N", "Danke. Bleiben Sie bei ihm und legen Sie nicht auf, bis ich es Ihnen sage.", "Gracias. Quédese con él y no cuelgue hasta que yo se lo diga.")]),
   "quiz": [
     q("b45-s4q1", "1. ¿Qué le pasa al ciclista?", ["Está inconsciente", "Sangra por la cabeza y no puede levantarse", "Se ha roto la bici"], 1, "«er <b>blutet am Kopf</b> und kann nicht aufstehen»."),
     q("b45-s4q2", "2. ¿Qué le pide la operadora?", ["Que lo lleve al hospital", "Que no lo mueva y no cuelgue", "Que llame a la policía"], 1, "«<b>Bewegen Sie ihn nicht</b> … <b>legen Sie nicht auf</b>»."),
     q("b45-s4q3", "3. «auflegen» significa…", ["colgar el teléfono", "levantarse", "tumbar a alguien"], 0, "<b>auflegen</b> = colgar (el teléfono).")]},
  {"idx": "45.5", "title": "Szenario: en la oficina de objetos perdidos", "level": "B1",
   "rule": "Te dejaste la mochila en el tren. Ve al <b>Fundbüro</b> de la estación (o llama) y descríbela.",
   "scenario": {"id": "b45-sc", "situation": "Ayer por la tarde te dejaste una <b>mochila negra</b> en el tren de Berna a Zúrich (salida 17:02, vagón de segunda clase). Dentro había un portátil y una bufanda roja. Ve a la oficina de objetos perdidos.",
     "goals": ["Explicar qué has perdido (<i>Ich habe meinen Rucksack im Zug vergessen</i>)", "Decir cuándo y en qué tren", "Describir la mochila y su contenido", "Dejar tu contacto si todavía no ha aparecido", "Preguntar si hay que pagar algo para recuperarla"]},
   "produce": {"id": "b45-s5", "label": "<b>tu turno:</b> escribe la conversación (6–10 turnos).", "placeholder": "Grüezi, ich habe gestern meinen Rucksack im Zug von Bern nach Zürich vergessen …"}}
 ]}
write(B)
