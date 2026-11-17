from common import *

B = {"block": "41", "title": "Ocio: planes, deportes, fiestas y naturaleza", "kicker": "Bloque 41 · Supervivencia · A2",
 "intro": "El tiempo libre es donde se hacen amigos. Aquí aprendes a hablar de aficiones (con <b class=\"hl\">gern / lieber / am liebsten</b>), a saber qué verbo va con cada deporte, a proponer planes y a moverte en el cine, un concierto o una fiesta de cumpleaños. Y, por supuesto, la montaña: en Suiza, <i>wandern</i> es casi un deporte nacional.",
 "sections": [
  {"idx": "41.1", "title": "Wortschatz: aficiones, salidas y naturaleza", "level": "A1", "rule": VOCAB_RULE,
   "vocab": vocab("b41-voc", [
     ("wandern", "hacer senderismo"), ("Ski fahren", "esquiar"), ("Velo fahren (CH) / Rad fahren", "ir en bici"),
     ("schwimmen", "nadar"), ("die Freizeit", "el tiempo libre", ""), ("das Hobby", "la afición", "Hobbys"),
     ("das Kino", "el cine", "Kinos"), ("das Theater", "el teatro", "Theater"), ("die Ausstellung", "la exposición", "Ausstellungen"),
     ("die Eintrittskarte", "la entrada", "Eintrittskarten"), ("die Feier / die Party", "la fiesta", "Feiern / Partys"), ("der Geburtstag", "el cumpleaños", "Geburtstage"),
     ("der Berg", "la montaña", "Berge"), ("der See", "el lago", "Seen"), ("der Wald", "el bosque", "Wälder"),
     ("die Wiese", "el prado", "Wiesen"), ("die Aussicht", "las vistas", "Aussichten"), ("die Hütte", "el refugio / la cabaña", "Hütten")]),
   "notes": [note("exception", "<b>der See</b> = el lago, pero <b>die See</b> = el mar (igual que <i>das Meer</i>). En Suiza hay muchos <i>Seen</i> y ningún mar.")],
   "quiz": [
     q("b41-s1q1", "1. «el lago» →", ["die See", "der See", "das See"], 1, "<b>der See</b> = lago. <i>die See</i> = mar."),
     q("b41-s1q2", "2. «la entrada (de cine)» →", ["die Eintrittskarte", "der Eingang", "die Einladung"], 0, "<b>die Eintrittskarte</b> (o <i>das Ticket</i>). <i>der Eingang</i> es la puerta de entrada y <i>die Einladung</i>, la invitación."),
     q("b41-s1q3", "3. ¿Cómo se dice «bicicleta» en Suiza?", ["das Velo", "das Rad", "das Bike"], 0, "En Suiza se dice <b>das Velo</b>; en Alemania, <i>das Fahrrad / das Rad</i>.")]},
  {"idx": "41.2", "title": "Gern, lieber, am liebsten · ¿spielen, machen o fahren?", "level": "A2",
   "rule": "Para gustos con verbos, el alemán usa el adverbio <b>gern</b>: <i>Ich wandere <b>gern</b></i> (me gusta hacer senderismo). Preferencia: <b>lieber</b>; lo que más: <b>am liebsten</b>. Y cada deporte tiene su verbo: <b>spielen</b> para juegos de pelota e instrumentos, <b>fahren</b> para lo que se hace sobre algo que se desliza o rueda, <b>machen</b> para el resto.",
   "tables": table(["Verbo", "Con…", "Ejemplos"], [
     ["spielen", "juegos, deportes de pelota, instrumentos", "Fußball / Tennis / Karten / Gitarre spielen"],
     ["fahren", "esquí, bici, patines", "Ski / Snowboard / Velo / Inliner fahren"],
     ["machen", "actividades en general", "Yoga / Sport / einen Ausflug / Fotos machen"],
     ["gehen", "ir a hacer algo", "schwimmen / wandern / tanzen / ins Kino gehen"],
     ["gern → lieber → am liebsten", "gustos y preferencias", "Ich lese gern, ich koche lieber, aber am liebsten wandere ich."]]),
   "quiz": [
     q("b41-s2q1", "1. «Me gusta nadar» →", ["Ich mag schwimmen.", "Ich schwimme gern.", "Mir gefällt schwimmen."], 1, "Gustos con verbos: verbo + <b>gern</b>."),
     q("b41-s2q2", "2. Ski ___", ["spielen", "fahren", "machen"], 1, "Deslizarse sobre algo: <b>Ski fahren</b>."),
     q("b41-s2q3", "3. Gitarre ___", ["spielen", "machen", "fahren"], 0, "Instrumentos: <b>spielen</b>."),
     q("b41-s2q4", "4. «Lo que más me gusta es leer» →", ["Ich lese am liebsten.", "Ich lese lieber.", "Ich lese gernsten."], 0, "Superlativo de gern: <b>am liebsten</b>."),
     q("b41-s2q5", "5. Yoga ___", ["spielen", "fahren", "machen"], 2, "Actividades sin pelota ni deslizamiento: <b>machen</b>.")]},
  {"idx": "41.3", "title": "Proponer planes, aceptar y decir que no", "level": "A2",
   "rule": "Proponer con suavidad: <b>Hast du Lust, …?</b> (¿te apetece…?), <b>Wollen wir …?</b>, <b>Wie wäre es mit …?</b> Aceptar: <i>Gute Idee! / Gern!</i> Rechazar con cortesía: <i>Ich kann leider nicht, ich habe schon etwas vor.</i> Y para entradas: <i>Gibt es noch Karten? Was kostet der Eintritt?</i>",
   "examples": examples([
     ("<b>Hast du Lust</b>, am Samstag wandern zu gehen?", "¿Te apetece ir de senderismo el sábado?"),
     ("<b>Wollen wir</b> heute Abend ins Kino gehen?", "¿Vamos al cine esta noche?"),
     ("<b>Wie wäre es mit</b> einem Konzert am Freitag?", "¿Qué tal un concierto el viernes?"),
     ("Gute Idee! Wann und wo treffen wir uns?", "¡Buena idea! ¿Cuándo y dónde quedamos?"),
     ("Ich kann leider nicht, ich habe schon etwas vor.", "Lo siento, no puedo, ya tengo plan."),
     ("Vielleicht ein anderes Mal?", "¿Quizá otro día?"),
     ("Gibt es noch Karten für heute Abend?", "¿Quedan entradas para esta noche?"),
     ("Was kostet der Eintritt für Studenten?", "¿Cuánto cuesta la entrada para estudiantes?")]),
   "notes": [note("tip", "<b>Hast du Lust, … zu + infinitivo?</b>: el infinitivo con <i>zu</i> va al final (<i>wandern zu gehen</i>). Si es más corto: <i>Hast du Lust auf Kino?</i>")],
   "quiz": [
     q("b41-s3q1", "1. «¿Te apetece ir al cine?» →", ["Hast du Lust, ins Kino zu gehen?", "Hast du Lust ins Kino gehen?", "Bist du Lust, ins Kino zu gehen?"], 0, "<b>Lust haben</b> + <i>zu</i> + infinitivo al final."),
     q("b41-s3q2", "2. Rechazas con cortesía:", ["Nein, keine Lust.", "Ich kann leider nicht, ich habe schon etwas vor.", "Das ist mir egal."], 1, "Con <b>leider</b> y una razón suena amable. «Keine Lust» es muy directo."),
     q("b41-s3q3", "3. «¿Quedan entradas?» →", ["Gibt es noch Karten?", "Haben noch Karten?", "Sind es noch Karten?"], 0, "Existencia: <b>es gibt</b> + acusativo.")]},
  {"idx": "41.4", "title": "Diálogo: excursión a la montaña", "level": "A2",
   "rule": "Dos amigos planean una ruta por los Alpes. Fíjate en cómo se propone, se negocia la hora y se reparte qué llevar.",
   "dialog": dialog("b41-wandern", "Chat de voz · jueves por la noche", {"L": ("Luca", "Amigo"), "A": ("Ana", "Tú")}, [
     ("L", "Hey Ana! Hast du Lust, am Samstag wandern zu gehen? Das Wetter soll super sein.", "¡Eh, Ana! ¿Te apetece ir de senderismo el sábado? Dicen que hará un tiempo genial."),
     ("A", "Ja, sehr gern! Wohin denn?", "¡Sí, me encantaría! ¿Adónde?"),
     ("L", "Auf den Pilatus. Die Aussicht auf den Vierwaldstättersee ist der Hammer.", "Al Pilatus. Las vistas del lago de los Cuatro Cantones son increíbles."),
     ("A", "Klingt toll! Ist es sehr anstrengend? Ich bin nicht so fit.", "¡Suena genial! ¿Es muy duro? No estoy muy en forma."),
     ("L", "Kein Problem, wir können mit der Zahnradbahn hochfahren und nur runterwandern.", "No pasa nada, podemos subir en el tren cremallera y solo bajar andando."),
     ("A", "Perfekt! Wann treffen wir uns?", "¡Perfecto! ¿A qué hora quedamos?"),
     ("L", "Um halb acht am Bahnhof Luzern? Dann sind wir früh oben.", "¿A las siete y media en la estación de Lucerna? Así estamos arriba temprano."),
     ("A", "Halb acht ist ein bisschen früh … Geht auch acht Uhr?", "Las siete y media es un poco pronto… ¿Puede ser a las ocho?"),
     ("L", "Okay, acht Uhr. Ich bringe Sandwiches mit, nimmst du Wasser und Schokolade mit?", "Vale, a las ocho. Yo llevo bocadillos, ¿tú llevas agua y chocolate?"),
     ("A", "Abgemacht! Und gute Schuhe, oder?", "¡Trato hecho! Y buen calzado, ¿no?"),
     ("L", "Unbedingt! Bis Samstag!", "¡Sin falta! ¡Hasta el sábado!")]),
   "quiz": [
     q("b41-s4q1", "1. ¿A qué hora quedan al final?", ["7:30", "8:00", "8:30"], 1, "Ana dice que 7:30 (<i>halb acht</i>) es pronto y acuerdan <b>acht Uhr</b>."),
     q("b41-s4q2", "2. ¿Cómo suben a la montaña?", ["andando", "en tren cremallera", "en coche"], 1, "«mit der <b>Zahnradbahn</b> hochfahren»."),
     q("b41-s4q3", "3. «Abgemacht!» significa…", ["¡Hecho! (trato hecho)", "¡Cancelado!", "¡Qué cansado!"], 0, "<b>Abgemacht!</b> = ¡trato hecho!")]},
  {"idx": "41.5", "title": "Rollenspiel: entradas para el cine", "level": "A2",
   "rule": "En la taquilla de un cine de Zúrich. Responde a cada turno y compara con el modelo.",
   "roleplay": roleplay("b41-rp", "Kasse", "Taquilla del cine", [
     ("Grüezi! Für welchen Film?", "¡Buenas! ¿Para qué película?", "Pide dos entradas para la película de las 20:15.", "Grüezi! Zwei Karten für den Film um zwanzig Uhr fünfzehn, bitte."),
     ("Die Vorstellung ist auf Englisch mit deutschen Untertiteln. Ist das okay?", "La sesión es en inglés con subtítulos en alemán. ¿Está bien?", "Pregunta si hay una sesión en alemán.", "Gibt es auch eine Vorstellung auf Deutsch?"),
     ("Ja, um 21 Uhr, Saal 3.", "Sí, a las 21:00, sala 3.", "Elige esa y pregunta el precio.", "Dann nehmen wir die um 21 Uhr. Was kostet das?"),
     ("Zwei Erwachsene, das macht 38 Franken. Wo möchten Sie sitzen?", "Dos adultos, son 38 francos. ¿Dónde quieren sentarse?", "Pide asientos en el centro, no muy delante.", "In der Mitte, bitte, nicht zu weit vorne."),
     ("Reihe 8, Plätze 10 und 11. Bar oder Karte?", "Fila 8, asientos 10 y 11. ¿Efectivo o tarjeta?", "Paga con tarjeta y da las gracias.", "Mit Karte, bitte. Vielen Dank!")])}
 ]}
write(B)
