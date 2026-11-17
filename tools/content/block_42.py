from common import *

B = {"block": "42", "title": "Teléfono, deletrear, mensajes y correos", "kicker": "Bloque 42 · Supervivencia · A2",
 "intro": "Hablar por teléfono asusta porque no ves gestos. La solución: <b class=\"hl\">fórmulas fijas</b> para contestar, preguntar por alguien, dejar recado y deletrear tu nombre (lo harás a diario). Y además, cómo se abre y se cierra un correo formal o informal, y lo básico de Correos.",
 "sections": [
  {"idx": "42.1", "title": "Redemittel: al teléfono", "level": "A2",
   "rule": "En Alemania y Suiza se contesta diciendo el <b>apellido</b> (o el nombre de la empresa): <i>«Huber.»</i> / <i>«Firma Meier, Sandra Keller, guten Tag.»</i> Quien llama también se presenta: <i>«Guten Tag, hier ist Ana López.»</i>",
   "tables": table(["Situación", "Redemittel"], [
     ["Presentarte", "Guten Tag, hier spricht / hier ist Ana López."],
     ["Preguntar por alguien", "Kann ich bitte mit Herrn Weber sprechen?"],
     ["Pasar la llamada", "Einen Moment, bitte. Ich verbinde (Sie)."],
     ["No está", "Herr Weber ist gerade nicht da / in einer Besprechung."],
     ["Tomar recado", "Kann ich ihm etwas ausrichten? · Soll er Sie zurückrufen?"],
     ["Dejar recado", "Könnten Sie ihm bitte sagen, dass ich angerufen habe?"],
     ["Problemas", "Die Verbindung ist schlecht. · Können Sie lauter sprechen?"],
     ["Equivocarse", "Entschuldigung, ich habe mich verwählt."],
     ["Despedirse", "Vielen Dank, auf Wiederhören!"]]),
   "notes": [note("tip", "Al dar números de teléfono se dice el <b>2</b> como <b>zwo</b> para no confundirlo con <i>drei</i>, y se agrupan de dos en dos: 079 45 21 → <i>null sieben neun, fünfundvierzig, einundzwanzig</i>.")],
   "quiz": [
     q("b42-s1q1", "1. Contestas el teléfono en casa (te apellidas López):", ["Hallo, wer ist da?", "López.", "Ja, bitte?"], 1, "Lo habitual es contestar con el <b>apellido</b>."),
     q("b42-s1q2", "2. «Le paso con él» →", ["Ich verbinde.", "Ich gebe ihn.", "Ich rufe ihn."], 0, "Pasar una llamada: <b>verbinden</b>."),
     q("b42-s1q3", "3. Te has equivocado de número:", ["Ich habe mich verwählt.", "Ich habe falsch gerufen.", "Ich bin falsch."], 0, "Marcar mal = <b>sich verwählen</b>."),
     q("b42-s1q4", "4. «¿Quiere dejarle algún recado?» →", ["Kann ich ihm etwas ausrichten?", "Kann ich ihm etwas schicken?", "Wollen Sie etwas sagen ihm?"], 0, "Tomar recado: <b>etwas ausrichten</b>.")]},
  {"idx": "42.2", "title": "Deletrear: el alfabeto y la tabla de letras", "level": "A1",
   "rule": "Te pedirán deletrear tu apellido constantemente: <b>Wie schreibt man das? Können Sie das buchstabieren?</b> Aprende cómo suenan las letras (la figurada entre corchetes) y, para evitar confusiones, usa nombres de ciudades: <i>L wie Leipzig, Ó wie Offenbach…</i> (la tabla oficial alemana de 2022 usa ciudades).",
   "tables": table(["Letras", "Suenan", "Ojo"], [
     ["A · B · C · D · E · F", "[a] [be] [tse] [de] [e] [ef]", "la C suena «tse»"],
     ["G · H · I · J · K · L", "[gue] [ha] [i] [yot] [ka] [el]", "G «gue», H «ha», J «yot»"],
     ["M · N · O · P · Q · R", "[em] [en] [o] [pe] [ku] [er]", "Q «ku»"],
     ["S · T · U · V · W · X", "[es] [te] [u] [fau] [ve] [iks]", "V «fau», W «ve»"],
     ["Y · Z · Ä · Ö · Ü · ß", "[ípsilon] [tset] [e] [eo] [iu] [es-tset]", "ß = «eszett»"],
     ["Ciudades (tabla 2022)", "A wie Aachen · B wie Berlin · D wie Düsseldorf · L wie Leipzig · M wie München · Z wie Zwickau", "también vale con nombres: «A wie Anton»"]]),
   "examples": examples([
     ("Wie ist Ihr Nachname? — López. L-O-P-E-Z.", "¿Su apellido? — López. L-O-P-E-Z."),
     ("Wie schreibt man das? — Mit «z» am Ende.", "¿Cómo se escribe? — Con «z» al final."),
     ("Z wie Zwickau, nicht S wie Salzwedel.", "Z de Zwickau, no S de Salzwedel."),
     ("Meine E-Mail-Adresse ist ana punkt lopez at gmx punkt ch.", "Mi correo es ana.lopez@gmx.ch («punkt» = punto, «at» = arroba).")]),
   "quiz": [
     q("b42-s2q1", "1. ¿Cómo suena la letra V?", ["[ve]", "[fau]", "[uve]"], 1, "La V se dice <b>«fau»</b>; la W es «ve»."),
     q("b42-s2q2", "2. ¿Y la J?", ["[yot]", "[jota]", "[ye]"], 0, "J = <b>«yot»</b>."),
     q("b42-s2q3", "3. La arroba (@) en una dirección de correo se dice…", ["at", "Klammeraffe siempre", "Punkt"], 0, "Se dice <b>«at»</b> (también existe el coloquial <i>Klammeraffe</i>). El punto es <i>Punkt</i>.")]},
  {"idx": "42.3", "title": "Dejar un mensaje en el buzón de voz", "level": "A2",
   "rule": "Estructura de un buen mensaje: <b>saludo + quién eres + motivo + qué quieres + cómo contactarte + despedida</b>. Habla despacio y repite el número de teléfono.",
   "examples": examples([
     ("<i>(Grabación)</i> Sie sind verbunden mit der Mailbox von Thomas Brunner. Bitte hinterlassen Sie eine Nachricht nach dem Signalton.", "Ha llamado al buzón de voz de Thomas Brunner. Deje un mensaje después de la señal."),
     ("Guten Tag, Herr Brunner, hier ist Ana López.", "Buenos días, señor Brunner, soy Ana López."),
     ("Ich rufe wegen der Wohnung in der Seestrasse an.", "Le llamo por el piso de la calle Seestrasse."),
     ("Ich hätte gern einen Besichtigungstermin.", "Querría una cita para verlo."),
     ("Sie erreichen mich unter 079 452 21 13, also null sieben neun, vier fünf zwo, zwo eins, eins drei.", "Puede localizarme en el 079 452 21 13…"),
     ("Vielen Dank und auf Wiederhören!", "Muchas gracias y hasta luego.")]),
   "quiz": [
     q("b42-s3q1", "1. «Dejar un mensaje» →", ["eine Nachricht hinterlassen", "eine Nachricht lassen hinter", "eine Nachricht machen"], 0, "<b>eine Nachricht hinterlassen</b> (inseparable)."),
     q("b42-s3q2", "2. «Le llamo por el piso…» →", ["Ich rufe für die Wohnung an.", "Ich rufe wegen der Wohnung an.", "Ich rufe von der Wohnung an."], 1, "Motivo de la llamada: <b>wegen</b> + genitivo (der Wohnung)."),
     q("b42-s3q3", "3. ¿Qué no debe faltar en el mensaje?", ["Tu número de teléfono, repetido despacio", "Tu edad", "La hora exacta de la llamada"], 0, "Sin número no pueden devolverte la llamada: dilo despacio y repítelo.")]},
  {"idx": "42.4", "title": "Correos y cartas: saludos, despedidas y Correos", "level": "A2",
   "rule": "El saludo y la despedida marcan el registro. Tras el saludo va <b>coma</b> y la primera palabra del texto empieza en <b>minúscula</b>. En formal se escribe <i>Sie, Ihnen, Ihr</i> con mayúscula.",
   "tables": table(["", "Formal", "Informal"], [
     ["Saludo (desconocido)", "Sehr geehrte Damen und Herren,", "—"],
     ["Saludo (con nombre)", "Sehr geehrte Frau Meier, / Sehr geehrter Herr Weber,", "Liebe Anna, / Lieber Jonas, / Hallo Tim,"],
     ["Asunto · adjunto", "Betreff: … · Im Anhang finden Sie …", "Ich schicke dir … im Anhang."],
     ["Despedida", "Mit freundlichen Grüßen (CH: Freundliche Grüsse)", "Viele Grüße · Liebe Grüße (LG) · Bis bald!"],
     ["Correos", "die Briefmarke · der Brief · das Paket · per Einschreiben (certificado)", "A-Post (urgente, CH) · B-Post (normal, CH)"]]),
   "notes": [note("emphasis", "En Suiza no se usa la ß: escriben <b>Grüsse</b>, <b>Strasse</b>. En Alemania y Austria: <i>Grüße</i>, <i>Straße</i>. Las dos son correctas en su país.")],
   "quiz": [
     q("b42-s4q1", "1. Escribes a una empresa sin saber el nombre:", ["Liebe Damen und Herren,", "Sehr geehrte Damen und Herren,", "Hallo zusammen,"], 1, "Fórmula estándar: <b>Sehr geehrte Damen und Herren,</b>"),
     q("b42-s4q2", "2. Despedida formal:", ["Liebe Grüße", "Mit freundlichen Grüßen", "Tschüss"], 1, "<b>Mit freundlichen Grüßen</b> (en Suiza: <i>Freundliche Grüsse</i>)."),
     q("b42-s4q3", "3. «Sehr geehrter Herr Weber, ___ habe Ihre E-Mail erhalten.»", ["Ich", "ich", "ICH"], 1, "Tras la coma del saludo, la primera palabra va en <b>minúscula</b> (salvo sustantivos y Sie)."),
     q("b42-s4q4", "4. En Suiza, una carta urgente se envía por…", ["A-Post", "B-Post", "Einschreiben siempre"], 0, "<b>A-Post</b> llega al día siguiente; la B-Post es más barata y lenta.")]},
  {"idx": "42.5", "title": "Rollenspiel: preguntar por alguien y dejar recado", "level": "A2",
   "rule": "Llamas a una empresa por una entrevista. La persona no está. Responde y compara con el modelo.",
   "roleplay": roleplay("b42-rp", "Empfang", "Recepción de la empresa", [
     ("Helvetia Consulting, Sandra Keller, guten Tag.", "Helvetia Consulting, Sandra Keller, buenos días.", "Preséntate y pregunta por la señora Fischer.", "Guten Tag, hier ist Ana López. Kann ich bitte mit Frau Fischer sprechen?"),
     ("Frau Fischer ist leider gerade in einer Besprechung. Kann ich etwas ausrichten?", "La señora Fischer está ahora en una reunión. ¿Quiere dejarle algún recado?", "Explica que llamas por la entrevista del lunes.", "Ja, gern. Es geht um mein Vorstellungsgespräch am Montag."),
     ("Soll sie Sie zurückrufen?", "¿Quiere que le devuelva la llamada?", "Di que sí y da tu número despacio.", "Ja, bitte. Meine Nummer ist null sieben neun, vier fünf zwo, zwo eins, eins drei."),
     ("Wie schreibt man Ihren Nachnamen?", "¿Cómo se escribe su apellido?", "Deletrea tu apellido.", "L-O-P-E-Z. López."),
     ("Danke, ich gebe es weiter. Auf Wiederhören!", "Gracias, se lo transmitiré. ¡Hasta luego!", "Da las gracias y despídete como por teléfono.", "Vielen Dank, auf Wiederhören!")])}
 ]}
write(B)
