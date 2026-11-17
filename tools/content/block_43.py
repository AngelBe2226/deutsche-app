from common import *

B = {"block": "43", "title": "Dinero y banco: francos, cajeros y facturas", "kicker": "Bloque 43 · Supervivencia · A2",
 "intro": "Todo sobre el dinero: <b class=\"hl\">francos y Rappen</b>, cajeros, cambio de divisas, transferencias y las facturas con código QR que llegan a casa en Suiza. Incluye el vocabulario del cajero automático para que no te tiemble el pulso delante de la pantalla.",
 "sections": [
  {"idx": "43.1", "title": "Wortschatz: el dinero", "level": "A2", "rule": VOCAB_RULE,
   "vocab": vocab("b43-voc", [
     ("das Geld", "el dinero", ""), ("das Bargeld", "el efectivo", ""), ("die Münze", "la moneda", "Münzen"),
     ("der Geldschein / die Note (CH)", "el billete", "Geldscheine / Noten"), ("der Franken", "el franco", "Franken"), ("der Rappen", "el céntimo suizo", "Rappen"),
     ("das Konto", "la cuenta", "Konten"), ("der Geldautomat / der Bancomat (CH)", "el cajero automático", "Geldautomaten"), ("die Gebühr", "la comisión", "Gebühren"),
     ("der Wechselkurs", "el tipo de cambio", "Wechselkurse"), ("Geld abheben", "sacar dinero"), ("Geld einzahlen", "ingresar dinero"),
     ("überweisen", "hacer una transferencia"), ("die Überweisung", "la transferencia", "Überweisungen"), ("die Rechnung", "la factura / la cuenta", "Rechnungen"),
     ("die Kreditkarte", "la tarjeta de crédito", "Kreditkarten"), ("sparen", "ahorrar"), ("teuer · billig / günstig", "caro · barato")]),
   "notes": [note("tip", "Precios: <i>CHF 12.80</i> = <b>zwölf Franken achtzig</b>. Los céntimos se llaman <b>Rappen</b> (en Alemania, <i>Cent</i>). Coloquialmente, «Stutz» es un franco: <i>Das kostet zwanzig Stutz</i>.")],
   "quiz": [
     q("b43-s1q1", "1. «Sacar dinero» →", ["Geld einzahlen", "Geld abheben", "Geld überweisen"], 1, "<b>abheben</b> = sacar (del cajero o del banco). <i>einzahlen</i> = ingresar."),
     q("b43-s1q2", "2. Los céntimos del franco se llaman…", ["Cent", "Rappen", "Pfennig"], 1, "En Suiza: <b>Rappen</b>. 100 Rappen = 1 Franken."),
     q("b43-s1q3", "3. die Gebühr es…", ["la factura", "la comisión / tasa", "la tarjeta"], 1, "<b>die Gebühr</b> = comisión o tasa.")]},
  {"idx": "43.2", "title": "Redemittel: en el banco y al cambiar dinero", "level": "A2",
   "rule": "Frases para el banco, la oficina de cambio y los problemas con la tarjeta. Fíjate en las colocaciones: <i>ein Konto <b>eröffnen</b></i>, <i>Geld <b>wechseln</b></i>, <i>eine Karte <b>sperren</b></i> (bloquear).",
   "tables": table(["Situación", "Redemittel"], [
     ["Abrir una cuenta", "Ich möchte ein Konto eröffnen. Welche Unterlagen brauchen Sie?"],
     ["Cambiar dinero", "Ich möchte 200 Euro in Franken wechseln. Wie ist der Wechselkurs?"],
     ["Comisiones", "Gibt es eine Gebühr? Wie hoch ist die Gebühr?"],
     ["Transferencia", "Ich möchte Geld auf ein spanisches Konto überweisen."],
     ["Tarjeta perdida", "Ich habe meine Karte verloren. Bitte sperren Sie sie sofort."],
     ["Cajero problemático", "Der Automat hat meine Karte eingezogen."],
     ["Pagar", "Kann ich mit Karte zahlen? · Nur bar? · Zahlen Sie getrennt oder zusammen?"]]),
   "quiz": [
     q("b43-s2q1", "1. «Abrir una cuenta» →", ["ein Konto öffnen", "ein Konto eröffnen", "ein Konto machen"], 1, "Colocación fija: <b>ein Konto eröffnen</b>."),
     q("b43-s2q2", "2. Has perdido la tarjeta. Pides que la…", ["sperren", "schließen", "stoppen"], 0, "Bloquear una tarjeta = <b>sperren</b>."),
     q("b43-s2q3", "3. «Quiero cambiar euros por francos» →", ["Ich möchte Euro in Franken wechseln.", "Ich möchte Euro zu Franken tauschen um.", "Ich möchte Euro für Franken ändern."], 0, "<b>Geld in … wechseln</b> = cambiar a otra moneda.")]},
  {"idx": "43.3", "title": "La pantalla del cajero", "level": "A2",
   "rule": "El cajero habla en imperativo formal o en infinitivo. Estas son las instrucciones que verás (y conviene reconocerlas a la primera).",
   "examples": examples([
     ("Bitte Karte einführen.", "Introduzca la tarjeta, por favor."),
     ("Bitte geben Sie Ihre PIN ein.", "Introduzca su PIN."),
     ("Betrag wählen: 100 · 200 · 500 · anderer Betrag", "Elija importe: 100 · 200 · 500 · otro importe."),
     ("Möchten Sie eine Quittung?", "¿Desea un recibo?"),
     ("Bitte entnehmen Sie Ihre Karte.", "Retire su tarjeta."),
     ("Bitte entnehmen Sie das Geld.", "Retire el dinero."),
     ("Kontostand anzeigen", "Consultar el saldo."),
     ("Abbrechen · Korrektur · Bestätigen", "Cancelar · Corregir · Confirmar.")]),
   "notes": [note("exception", "Los cajeros dan el dinero <b>después</b> de devolver la tarjeta. Si tu tarjeta es extranjera, cuidado con la opción «en tu moneda» (conversión dinámica): suele ser más cara. Elige pagar <b>in CHF</b>.")],
   "quiz": [
     q("b43-s3q1", "1. «Bitte entnehmen Sie Ihre Karte» significa…", ["Introduzca su tarjeta", "Retire su tarjeta", "Su tarjeta está bloqueada"], 1, "<b>entnehmen</b> = retirar, sacar."),
     q("b43-s3q2", "2. ¿Qué botón pulsas para cancelar?", ["Bestätigen", "Abbrechen", "Korrektur"], 1, "<b>Abbrechen</b> = cancelar; <i>Bestätigen</i> = confirmar."),
     q("b43-s3q3", "3. «Kontostand» es…", ["el saldo", "el extracto anual", "el tipo de cambio"], 0, "<b>der Kontostand</b> = el saldo de la cuenta.")]},
  {"idx": "43.4", "title": "Diálogo: cambiar dinero y una factura QR", "level": "A2",
   "rule": "En una sucursal bancaria de Basilea. La clienta cambia euros y pregunta por las facturas con código QR que llegan por correo en Suiza.",
   "dialog": dialog("b43-bank", "Sucursal bancaria, Basilea · martes, 11:00", {"B": ("Bankangestellter", "Empleado"), "K": ("Kundin", "Tú")}, [
     ("B", "Grüezi, was kann ich für Sie tun?", "Buenos días, ¿qué puedo hacer por usted?"),
     ("K", "Grüezi. Ich möchte 300 Euro in Franken wechseln. Wie ist der Kurs heute?", "Buenos días. Quiero cambiar 300 euros a francos. ¿Cómo está el cambio hoy?"),
     ("B", "Für einen Euro bekommen Sie heute 0,94 Franken. Das macht 282 Franken, abzüglich drei Franken Gebühr.", "Por un euro recibe hoy 0,94 francos. Son 282 francos, menos tres de comisión."),
     ("K", "In Ordnung. Noch eine Frage: Ich habe diese Rechnung mit einem QR-Code bekommen. Wie bezahle ich sie?", "De acuerdo. Otra pregunta: he recibido esta factura con un código QR. ¿Cómo la pago?"),
     ("B", "Am einfachsten scannen Sie den QR-Code mit der App Ihrer Bank. Dann sind alle Daten schon drin.", "Lo más fácil es escanear el código QR con la app de su banco. Así ya están todos los datos."),
     ("K", "Und bis wann muss ich bezahlen?", "¿Y hasta cuándo tengo que pagar?"),
     ("B", "Meistens innerhalb von 30 Tagen. Das Datum steht oben rechts.", "Normalmente en un plazo de 30 días. La fecha está arriba a la derecha."),
     ("K", "Perfekt, vielen Dank für die Hilfe!", "¡Perfecto, muchas gracias por la ayuda!"),
     ("B", "Gern geschehen. Hier sind Ihre 279 Franken.", "De nada. Aquí tiene sus 279 francos.")]),
   "quiz": [
     q("b43-s4q1", "1. ¿Cuántos francos recibe al final?", ["282", "279", "300"], 1, "282 francos menos 3 de comisión (<i>abzüglich drei Franken Gebühr</i>) = <b>279</b>."),
     q("b43-s4q2", "2. ¿Cómo se paga la factura QR?", ["En efectivo en Correos", "Escaneando el código con la app del banco", "Llamando a la empresa"], 1, "«scannen Sie den <b>QR-Code</b> mit der App Ihrer Bank»."),
     q("b43-s4q3", "3. ¿Cuál es el plazo habitual de pago?", ["7 días", "30 días", "90 días"], 1, "«Meistens innerhalb von <b>30 Tagen</b>»."),
     q("b43-s4q4", "4. «abzüglich» significa…", ["más", "menos (descontando)", "incluido"], 1, "<b>abzüglich</b> = descontando, menos.")]},
  {"idx": "43.5", "title": "Szenario: el cajero se traga tu tarjeta", "level": "B1",
   "rule": "Problema real: sábado por la tarde, el cajero se ha quedado tu tarjeta. Llama al número de emergencia de tu banco.",
   "scenario": {"id": "b43-sc", "situation": "Es sábado a las 19:00 en Lucerna. El <b>Bancomat</b> no te devuelve la tarjeta y muestra «Karte eingezogen». No tienes efectivo. Llama a la línea de urgencias de tu banco.",
     "goals": ["Presentarte y explicar qué ha pasado (<i>Der Automat hat meine Karte eingezogen</i>)", "Decir dónde está el cajero", "Pedir que bloqueen la tarjeta (<i>sperren</i>)", "Preguntar cómo conseguir una nueva y cuánto tarda", "Preguntar si puedes sacar dinero de otra manera", "Agradecer y despedirte (<i>auf Wiederhören</i>)"]},
   "produce": {"id": "b43-s5", "label": "<b>tu turno:</b> escribe la llamada (8–10 turnos).", "placeholder": "Guten Abend, hier ist Ana López. Der Bancomat am Bahnhof Luzern hat meine Karte eingezogen …"}}
 ]}
write(B)
