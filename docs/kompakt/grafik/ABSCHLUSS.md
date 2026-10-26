# Ranger Kompakt · grafischer Abschlussdurchgang

Der Durchgang überarbeitet alle fünf begehbaren Raumabschnitte, die Oberfläche und alle 36 aktiven Taxa einschließlich der zusätzlichen Raupen- und Seeringelwurmstadien. Die Änderungen sind implementiert, nicht lediglich vorgeschlagen. Der angestrebte durchgehend naturnahe Detailgrad moderner Naturspiele wird jedoch **nicht vollständig erreicht**. Besonders Würmer, Wattschnecke, Herzmuschel, NPC-Gesichter und manche Vogel-/Insektenkörper bleiben deutlich geometrisch. Materialverbesserung wird nicht als anatomischer Neubau ausgegeben.

Ausgangspunkt: `9d45aba9e7fb2c170291ca760eec0f5e6e33fb71`. Letzter 3D-/Simulationscode: `2b26879a2306d043dc6767ad20f2a66b379b1a10`. Nachfolgende Änderungen betreffen Prüfwerkzeuge, Dokumentation und zwei reine CSS-Farbregeln: der aktivierte Schnellgang und ausgewählte Werkzeuge beim Darüberfahren erhalten wieder einen lesbaren Hell-Dunkel-Kontrast. Geometrie, Modelle und Simulationslogik bleiben gegenüber diesem Code unverändert. Zusätzlich aktualisiert die Hauptschleife den Text der Untersuchungsschaltfläche nur bei einer tatsächlichen Beschriftungsänderung, damit dessen Textknoten während eines Klicks erhalten bleibt. Diese begrenzte DOM-Korrektur ist eine weitere ausdrücklich ausgewiesene Abweichung von den langen 3D-Prüfungen. Branch `feature/ranger-kompakt`, Draft-PR #3. Keine Veröffentlichung, kein Merge, kein LMS-Upload. Der abschließende saubere Dokumentations-/Prüfcommit und die daraus neu gebauten Dateien stehen im Lieferdatensatz `LIEFERUNG.json`; bei dessen Neubau werden die unveränderten 3D-/Medienquellen sowie die exakt abgegrenzten CSS-/DOM-Korrekturen zusätzlich byteweise geprüft.

## Grafische Änderungen

| Abschnitt | Tatsächliche Umsetzung | Verbleibende Grenze |
|---|---|---|
| Wald | Eigene elliptische Buchen- und gelappte Eichenblattkarten, kleinere unregelmäßige Kronenkerne, kleinere Nahblätter, Rinde, Bodenübergänge | Gerade Stammgrundformen, wiederholte Verzweigung und Krautmodule bleiben |
| Dorf | Dachkurse/First, Fensterkreuze/-bänke, Rinnen/Fallrohre, Tür-/Schornsteindetails; geformte NPC-Körper, Gelenke, Gesichter/Kleidung | Hauskörper, Hände und Gesichter weiterhin vereinfacht |
| Deich | Bodenoberfläche, Übergänge, zusammenhängende Hintergrund-/Lichtwirkung | Böschung, Krone und Höhe unverändert; kein bautechnischer Realismusnachweis |
| Salzwiese | Feinere Blattflächen, Rippen, Kanten und Oberflächen der vorhandenen unterschiedlichen Wuchsformen | Keine vollständige botanische Rekonstruktion; korrigierte Höhen/Überflutung unverändert |
| Watt/Priel | Sedimentfeuchte an tatsächlicher Wasserhöhe, Rippelzeichnung, differenziertere Wasseroberfläche; geschützte Beutekontakte erhalten | Flaches Relief, Texturwiederholung; keine neuen simulierten Spuren oder echten Umgebungsreflexionen |

Die Oberfläche verwendet Waldgrün, helles Papier und zurückhaltendes Gold, gut lesbare Systemschrift, Serifenschrift für Überschriften und lokale Vektorsymbole. Werkzeuge haben erkennbare aktive Zustände; Fokus, Dialoge, Formulare und kleine Bildschirmhöhen sind angepasst. Die Startanleitung wurde mitgepflegt. Alle neuen Grafikbestandteile stammen aus eigenem Code; keine neuen fremden oder kostenpflichtigen Assets, Konten oder Runtime-Netzabrufe.

`TAXON-QUALITAET.json` enthält 38 Einzelzeilen für 36 Taxa plus zwei zusätzliche Stadien: Vorher, Umsetzung, diagnostische Merkmale, Geometrie/Material/Animation, echte Individuenbilder, Grenzen und begrenzten Abnahmestatus. `WELT-QUALITAET.json` beschreibt jede Weltperspektive. Die lesbare Offline-Galerie `index.html` im Nachweispaket stellt die Originalbilder unmittelbar gegenüber.

## Umfang der visuellen Abnahme

**BESTANDEN** bezeichnet in der Matrix die konkret beschriebene sichtbare Überarbeitung und erhaltene Grundmerkmale im geprüften Bild. Es ist keine pauschale Freigabe aller Animationen, natürlicher Feinbestimmung oder Fotorealismus. Alle 38 Nahansichten wurden tatsächlich angesehen. Die Bild-/Langzeitnachweise stammen vom dokumentierten 3D-Endstand vor der nachträglichen reinen Schaltflächen-Kontrastkorrektur; sie zeigen unveränderte Modelle und Simulation. Die Weltkontextbilder zeigen denselben Spielbetrieb; sehr kleine, verdeckte oder außerhalb des Bildes liegende Individuen werden dadurch nicht als sichtbar ausgegeben. Reh und Specht besitzen zusätzlich tatsächliche Welt-/Bewegungssequenzen; weitere ausgerichtete Weltansichten ergänzen die Katalogbilder. Der Fuchs ist dort vollständig sichtbar; Waldmaus und Kohlmeise bleiben verdeckt, der Eichelhäher teilweise am Stammrand. Ihre freien natürlichen Gesamtansichten werden deshalb nicht als abgenommen ausgegeben; die tatsächlich geprüften Nahansichten sind davon getrennt. Im Flugvideo ist der Specht klein und teilweise von Blättern verdeckt; dieses Video allein genügt nicht zur Beurteilung einer natürlichen Flügelkinematik. Die Aufnahmen am Stamm und nach der Landung zeigen die Stützung deutlicher.

Die 14 festen Weltperspektiven haben dieselben Kamerapositionen, Seed und jahreszeitlichen Bedingungen. Tiere und Tide laufen während freier Aufnahmen weiter: **vollständig identische Modellzeit ist für diese Paare nicht belegt**. Der ergänzende Austernfischer-Vergleich bei Modellsekunde 1 prüft Kamera, Zeit, Tiere und Ökologie ausdrücklich auf Gleichheit. Bilder sind unveränderte Browseraufnahmen; Hashes stehen bei den jeweiligen Ergebnissen.

## Funktions- und Browserprüfungen

- **BESTANDEN:** 15 lokale Node-Prüfsuiten einschließlich biologischer/didaktischer Regressionen, visueller Geometrie-/Materialprüfung und Speicheradapter. 15 geschützte Simulations-/Vertragsdateien sind gegenüber dem Ausgangsstand bytegleich (`protected-source.json`).
- **BESTANDEN:** allgemeine CI-Jobs `verify`, `compact`, `compact-learning`, `compact-corrections`; historische Portabilität auf Linux/Node 24.19 und 24.21 sowie macOS/Node 24.21. Ein macOS-24.19-Job wurde abgebrochen und wird nicht als Pass gezählt.
- **BESTANDEN:** K1–K5, positive/negative Beobachtungsfälle, echte Import-/Export-/Reload-Prüfungen und Schüler-/Lehrmaterialien im vollständigen CI-Lernlauf. Lokale Zusatzprüfung der historischen Importe: 51 Fälle. Der lokale lange Lernlauf wurde durch die Ausführungsumgebung unterbrochen; seine Teilergebnisse ersetzen keinen vollständigen Pass.
- **BESTANDEN:** vier aktuelle Küstenvogelsequenzen mit individuellen Beute-/Ereignis-IDs, Kontakt-/Aufnahme-/Abgangsphasen und endlichen Ressourcen (`feeding/result.json`). Originalvideos zeigen offen beschriftete Modellschritte mit Pausen, keine Echtzeit-FPS-Abnahme.
- **BESTANDEN, begrenzter Umfang:** 15 aktuelle lokale Beobachtungs-/Bewegungs-/Recovery-Prüfungen, einschließlich echter Rehbewegung, Spechtflug und Landung sowie zweier echter WebGL-Wiederherstellungen bei unverändertem erworbenem Feldbuch. Der anschließende Netzwerk-GLB-Negativfall scheiterte beim Aufruf dieses Webtests auf einer Einzel-HTML: deren Modelle sind eingebettet und erzeugen die zu blockierende externe Anfrage nicht. Der ursprüngliche Fehlversuch bleibt in `animal-video/result.json`; die reguläre Webfassung hat den unveränderten Negativtest im CI bestanden. Der ergänzende Einzel-HTML-Test beschädigt tatsächlich eingebettete GLB-Bytes.
- **BESTANDEN, UI-Scope:** Desktop, Tablet-Hoch-/Querformat, 600×375, nativer 200-%-Browserzoom, Tastatur/Fokus/Scrollschutz und Downloads. Dieser UI-Lauf stammt vom früheren Grafikcommit mit derselben UI-Struktur; die abschließende Korrektur zweier aktiver Farbstaaten wird separat am finalen Offline-Neubau geprüft. Der frühere UI-Lauf ist keine Abnahme später korrigierter Shader. Aktuelle Lern- und SCORM-Läufe prüfen die endgültige Gestaltung zusätzlich.

Eingebettetes defektes Modell: **BESTANDEN** (`embedded-fault/result.json`).

Langzeittest: **BESTANDEN**, 1213.11 reale Sekunden nach 260.38 Sekunden Aufwärmen, 77 Messpunkte. Wiederholte Ansichten aller Bereiche, unveränderter Pflanzenbestand und Rundgang, begrenzte Renderer-Allokationen und echte Kontextwiederherstellung. Modellzeit ist wegen Softwaregrafik langsamer als Wanduhrzeit. Headless-Tab-Aktivierung ist keine verlässliche Prüfung von Safari-Hintergrundverhalten (`stability/result.json`). Dieser Langzeittest liegt vor der späteren Schaltflächen-DOM-Korrektur; deren native Klickfunktion und Offlinebetrieb werden gesondert am korrigierten Neubau geprüft.

**FEHLGESCHLAGEN:** unveränderter Hauptwegtest mit 900-Sekunden-Grenze im CI. Der Lauf erreichte etwa 62,5 Modellsekunden / Routenindex 490, bevor die Grenze überschritten wurde. Das ist ein Leistungsproblem unter Softwaregrafik; weder umbenannt noch grün gesetzt. Der allgemeine CI-Gesamtstatus bleibt deshalb rot, obwohl der separate SCORM-Lauf grün ist.

Ergänzende vollständige Begehung des 362,21-m-Hauptwegs: **BESTANDEN**, 739.0397443139991 reale Sekunden, 362.00308415012665 abgetastete Meter. Normale W-/Mauseingaben, vorhandenes „Zügig gehen“ mit 2,8 m/s Modellgeschwindigkeit, 600×375 und separat ausgewiesene 3600-Sekunden-Grenze. Kein Versetzen, kein Uhr-/Positionsschreiben. Die Deich-Grenzaufnahme dieses Laufs entstand bei x=0,61 m noch knapp vor der tatsächlichen Zonengrenze x=1 m; die nachfolgenden unveränderten Positionsprotokolle belegen die tatsächliche Deichquerung. Die unabhängige Zonenprüfung steht in `walk-zone-audit.json`. Dorfquerverbindung und separater Aussichtsast sind keine zusätzlich vollständig begangenen Strecken dieses Laufs. Diese Funktionsprüfung ersetzt weder den fehlgeschlagenen 900-Sekunden-Lauf noch eine Bildratenfreigabe (`walk-supplement/result.json`).

## Leistung vor / nach

Messstand ist der 3D-Endstand `2b26879` vor der späteren Schaltflächen-DOM-Korrektur. Deren Rendergeometrie, Materialien und Simulation sind unverändert; die UI-Aktualisierung ist nicht Bestandteil dieser Bildratenmessung. Cloud-Chromium mit SwiftShader, 800×600, identischer Startkamera, je 20 Sekunden tatsächliche rAF-Messung pro Profil. Dies sind Softwaregrafikwerte, keine hardwarebeschleunigte Desktop- oder iPad-Messung. Heap ist JS-Speicher einschließlich GC, keine GPU-VRAM-Messung.

| Profil / Stand | FPS | Median ms | P95 ms | Draw Calls | Dreiecke | Geometrien | Texturen | JS-Heap MiB |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| desktop / Vorher | 1.77 | 583.3 | 683.3 | 96 | 508923 | 177 | 6 | 195.8 |
| tablet / Vorher | 1.51 | 633.3 | 1283.2 | 96 | 508923 | 177 | 6 | 89.7 |
| desktop / Nachher | 0.93 | 1066.7 | 1733.2 | 115 | 802753 | 170 | 8 | 151.9 |
| tablet / Nachher | 1.02 | 1000.0 | 1266.7 | 115 | 800449 | 170 | 8 | 158.6 |

Start bis WebGL-bereit: vorher 4.96 s, nachher 7.20 s. Browsernavigation und Originalmessungen stehen in `profile-baseline-final/result.json` und `profile-after/result.json`.

Gegenüber dem Ausgangsstand liegt die in dieser Messreihe ermittelte Bildrate im Desktopprofil rund 47 % und im Tabletprofil rund 32 % niedriger. Die erste Grafikfassung war unter Softwaregrafik noch langsamer. Drei statt sechs Blattkarten je Gruppe, ein einfacheres diffuses Blattmaterial und bedingte Atlaszugriffe reduzieren unnötige Arbeit. Die Messreihe vor dieser Optimierung bleibt in `profile-before-optimization/result.json`. Auch der Endstand erfüllt auf dieser Umgebung kein flüssiges 30-FPS-Ziel. Leistungsverschlechterungen gegenüber dem Ausgangsstand sind in der obigen Tabelle ausdrücklich sichtbar; keine Freigabe für Schul-iPads oder beliebige Desktopgeräte.

## HTML und SCORM

Die reguläre Offline-Einzeldatei enthält alle 52 Laufzeitmodule und fünf vorhandenen lokalen Medien einschließlich der neuen prozeduralen Grafik. Lokales Speichern, Import und Export bleiben erhalten. Die SCORM-1.2-ZIP entsteht aus demselben Webbuild mit der vorhandenen Universalvorlage. Sitzungsdaten bleiben flüchtig; keine Lern-/Leistungsdaten werden an SCORM übermittelt. Lehrkräftelösungen und interne Prüfbilder werden nicht in das Schülerpaket aufgenommen.

**BESTANDEN:** getrennte Referenz-/Ranger-Vorlagentests, tatsächlicher Start der entpackten ZIP in Chromium und WebKit, API-/Datenschutz-/Sitzungsprüfungen, XSD, Wurzelmanifest, Integrität und Bytevergleich des tatsächlich hochgeladenen und erneut heruntergeladenen Artefakts. Der Lauf für den letzten Grafikcode ist [40369491297](https://github.com/Feerson1617/Ein-Tag-als-Ranger/actions/runs/40369491297). Die finale Neubau-/Downloadzuordnung mit vollständigem Commit, URL, Hash und Größe wird nach dem sauberen Abschlusscommit im Lieferdatensatz ausgewiesen. Alle fünf Medien sind gegenüber den aktuellen Quelldateien bytegleich; der gebündelte SCORM-Code enthält die neuen Grafikmodule (`scorm-graphics-parity.json`).

## Offlinebetrieb und letzte Kontrastkorrektur

**BESTANDEN im Vorabneubau:** Die einzelne HTML wird einmal von localhost bereitgestellt; unmittelbar nach DOMContentLoaded wird das Browsernetz abgeschaltet. Die tatsächliche WebGL-Szene, beide optischen Werkzeuge, Nahansicht und Beobachtungszeit funktionieren ohne weitere HTTP(S)-Anfragen. Aktive Werkzeugschaltflächen erreichen nach dem tatsächlichen CSS-Übergang 7,88:1, „Zügig gehen“ 8,57:1 Textkontrast. Die Gesprächsschaltfläche ist bei 600×375 vollständig innerhalb ihrer Textgrenzen. Dieser Test wird nach dem sauberen Commit am endgültigen Neubau wiederholt und in `offline-final/result.json` zugeordnet.

**NICHT GEPRÜFT als direkter Dateistart:** Der verwaltete Chromium blockiert `file://` mit `ERR_BLOCKED_BY_ADMINISTRATOR`. Diese Browserrichtlinie wurde nicht deaktiviert. Die erfolgreiche lokale HTTP-/Offline-Prüfung wird ausdrücklich nicht als bestandener Doppelklick-/Datei-URL-Test ausgegeben. Der abgewiesene Versuch bleibt erhalten.

## Offene Abnahmen und erhaltene Fehlversuche

- **NICHT GEPRÜFT:** physisches Schul-iPad/Safari, echter itslearning-Import, reale hardwarebeschleunigte Bildrate, Unterrichtserprobung mit Lerngruppe.
- **NICHT VOLLSTÄNDIG ERREICHT:** durchgehend organische Anatomie, natürliche Einzelbaumverzweigung, realistische NPC-Gesichter, neue Gang-/Flügelskelette aller Tiere, physikalisches Wasser/Reflexionen. Die seeseitige Deichansicht ist wegen der sehr flachen Modellböschung und einer sichtbar werdenden Naht des vorhandenen Himmelpanoramas grafisch als FEHLGESCHLAGEN bewertet. Die genaue Grenze steht pro Taxon und Weltansicht in der Matrix.
- **Nicht als Pass gezählt:** ältere Softwaregrafik-/Routenfehler, Umgebungsabbruch des lokalen Lernlaufs, Netzwerk-Fehlerinjektion auf eingebetteten Assets, der korrigierte Vergleichstreiberfehler beim zusätzlichen Hummelbild und der erste Zusatzkameralauf mit zu früh gelesener Referenzpose. Zwischenbilder mit Shaderfehler oder unsichtbaren Falterflügeln sind keine Endnachweise.
- **Tatsächlich korrigiert und erneut geprüft:** Falterflügel-Winding, zu starke Fellzeichnung, reservierter GLSL-Rindenbezeichner. Grafikprüfungen werten jetzt auch Shader-Konsolenfehler aus. Historische Fehlerprotokolle bleiben erhalten.

Es wird eine grafisch überarbeitete, überprüfbare Lieferfassung bereitgestellt; eine vollständige Realismus-, Leistungs- oder Unterrichtsfreigabe wird ausdrücklich nicht behauptet.

## Zusätzlicher WebKit-Klickfehler im Lieferneubau

Der SCORM-Lauf `40384719887`, Versuch 3, hat 15 von 16 Fällen bestanden. Im WebKit-Lernfall erschien nach einem Klick auf „Ort untersuchen“ an der tatsächlichen Brennnesselstelle kein Dialog; der unveränderte Test überschritt 600 Sekunden. Screenshot, Originalkontext und Protokoll bleiben erhalten. Die Buttonbeschriftung wurde zuvor bei jedem Renderbild durch einen neuen Textknoten ersetzt. Sie wird jetzt nur noch bei tatsächlichem Textwechsel gesetzt. Ein zusätzlicher Fall hält eine echte Maustaste über zwei gerenderte Frames und verlangt danach den geöffneten Dialog und die reale Brennnessel-Auswahl. Die ursprünglichen 16 Fälle und ihre Grenzen bleiben unverändert; der abschließende Wiederholungsstatus steht im Lieferdatensatz. Die Diagnose ist keine iPad-Gerätefreigabe.
