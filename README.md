Cadavre Exquis von Siobhán Dieterle (https://github.com/shiiiveiiir) und Sina Schweickert
-
Zum Spiel: https://sinerbeener.github.io/cc2/CadavreExquis/

Vorstellung/Kurze Beschreibung:
-
Bei unserem Cadavre Exquis ist es möglich Online mit 4 anderen zuzeichnen und gemeinsam eine Kreatur zuerschaffen.
Jeder bekommt dabei einen Abschnitt zugeteilt in dem man den zugeteilten Körperabschnitt zeichnen kann.
wenn man fertig ist, kann man die zugedeckten Teile des Canvas aufdecken und die anderen Zeichnungen sehen. 
Dazu wird dann an die anderen ein Soundeffekt gesendet und man selbst hat nicht mehr die Möglichkeit zuzeichnen.
Sobald mehr als 4 Leute dem Raum beitreten wird ein neuer Raum erstellt.

Verwendete API's
-
- Web-Rooms (basierend auf WebSocket) 
- Canvas und p5.js //Für den Canvas und das Zeichnen
- Web Audio //Für den Soundeffekt

Schwierigkeiten und Erkenntnisse
-
- Canvas synchonisation: Wir hatten Probleme um einen canvas zu erstellen auf dem man zusammen zeichnen kann. Wir haben es dann gelöst indem wir die Koordinaten direkt an die anderen Clients in dem Raum schicken.
  Geholfen hat uns dieses Video: https://youtu.be/i6eP1Lw4gZk?si=0SiX8c8EMFnA-chp
- Overlay für den Canvas: zuerst funktionierte das "Overlay" nicht da des nicht verschwunden ist und später auch die anderen Striche nicht gezeigt wurden. Das haben wir dann gelöst indem die Striche sozusagen zwischen gespeichert haben damit sie beim reveal nicht gelöscht werden

Wer hat was gemacht?
-
- Siobhán: Webrooms Kommunikation mit den anderen Räumen
- Sina: Funktion des Spiels

