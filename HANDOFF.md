# Zusatzkorrektur – echte Filtration im Probenmodell

Die lebenden Probenmuscheln reagieren in echten Simulationsschritten auf die
Wasserbedeckung. Ruhezustand bei Niedrigwasser und Filtration bei Hochwasser sind
nun in Node- und Live-Browserläufen geprüft. Hintergrundfraß an den festen
Untersuchungsorganismen ist eine ausdrücklich dokumentierte Kontrollbedingung;
gezielte Modellaufträge bleiben möglich. M3 verlangt lebende Individuen und die
passenden Zustände. Importierte Abschlussflags werden aus Belegen neu berechnet.

# Aktiver Stand – Ranger 1.0.0-rc.1

Branch `codex/ranger-v1`, Ausgangsbasis `227e61e`. Aktuelle Regeln stehen hier und
in `docs/REVIEW-STATUS.md`; folgende Versionsabschnitte sind historische Nachweise.
Kein Deployment, kein Merge und keine Freigabe zur Veröffentlichung.

Drei Missionen und 15 Fokustaxa im bestehenden FieldJournal. Die drei Kernmissionen
wurden in echten UI-Läufen abgeschlossen; M1/M2 und M3 in getrennten protokollierten
Läufen. Synthetische Import-/Formularfixtures sind getrennt bezeichnet. 26/26
Node-Reihen, 5/5 Paketprüfungen und der M3-/Formular-/Werkzeug-Browserlauf bestehen.
Die zusätzliche Unterpfad-/Grafikverlust-/Ladefehler-Abnahme ist bestanden.
Auch die Einzel-HTML startet und zeigt zurückgestellt dekodierte Referenzfotos.
Ihre Assetausgabe ist sortiert; Vergleich mit zwei Python-Hashseeds verlangt
identische Bytes. Browserberichte erfassen künftig den Dirty-Status.
Nachweise und genaue Laufgrenzen: `verification/rc1/README.md`.
Feldbuch und Antworten werden gespeichert, kein vollständiger Weltzustand.

Speicher: vorhandene Schlüssel bleiben. Neue Feldbuchhülle schemaVersion 3 mit
learning.version 1; unversionierte alte Exporte migrieren ohne Fortschrittsverlust.
Beschädigte Gerätespeicher werden bis zur ausdrücklichen Import-/Sitzungsentscheidung
nicht überschrieben. JSON-Import wird vollständig geprüft und vor Übernahme bestätigt;
Schreibfehler verändern den laufenden Stand nicht. Offene Antworten bleiben Text.
Druckbericht trennt Herkunft, Sachverhalt und Erklärung; Punkte/Tempo sind keine Note.

`pairSighting` ist nur Entdeckung. `investigations` enthalten zeitnah beobachtete
Modellereignisse mit konkreten IDs, nie automatisch eine eigene Erklärung. Später
übernommene Ereignisse heißen Modellprotokoll. Beobachtungsdauern werden mit der
Simulationsuhr gespeichert; Fernglasfaktor 0,5 bleibt. Wiederholungen sind markiert
und löschen frühere Belege nicht. Ein lokaler Abschluss genügt, weitere Fundorte
bleiben optional. Hummeln sind anhand der groben Fokussicht nur auf Gruppenebene
bestimmbar. Eigenständige Artbestimmung nicht aus Programmeintrag ableiten.

Publikationsartefakt ist nur outputs/GitHub-Pages; dist enthält Quellcode. Gemeinsamer
Modulgraph unterstützt literale dynamische Imports/Worker/URL-Medien und lehnt
fehlende Dateien, Ausbrüche, nichtliterale Imports und Zyklen ab. Einzel-HTML und
Projektarchiv separat erzeugen, keine .game-dev-/Schüler-/lokalen Arbeitsdaten deployen.

Offen: Primärartikelzugang (Proxy-403), fachliche Einzelvalidierung der Referenzen,
Codelizenzentscheidung, physische Geräte und Unterrichtspilot. Pythonwerkzeuge
wurden auch in frischer venv installiert; Cloud-Skript und Startanweisungen sind als
Entwurf gespeichert. Der zwischenzeitliche GitHub-API-403 war kein Beleg für ein fehlendes Token;
Git-Schreibzugriff und PR-Erstellung funktionieren inzwischen. Entwurfs-PR:
https://github.com/Feerson1617/Ein-Tag-als-Ranger/pull/1 .
Keine Tokens im Chat oder Repository anfordern.
Die Cloud-Umgebung zu veröffentlichen erteilt keine Pages-Freigabe.

# Phase 1 – Belegverträge

Paarfund (`encounters`, `pairSighting`) und beobachteter Vorgang
(`investigations`, `own-observation`) sind separat. Vor Fokusbeginn protokollierte
Ereignisse zählen nicht als selbst beobachtet. `interpretation:null` bedeutet
keine Einordnung durch Lernende. Pflanzen-ID verwendet registrierte
Weltkoordinaten/Habitat/Taxon, nie LOD-Slots. `plant-resources.js` trennt Pollen
und Nektar; unmodelliert bedeutet nicht biologisch abwesend. Die historische
Sperre aller Fachhilfen bis zur Gesamtsammlung ist ausdrücklich aufgehoben.
Nächster Schritt: Kernmissionen im bestehenden FieldJournal.

# Arbeitsstand Ranger 1.0 – Phase 0

Branch `codex/ranger-v1`, Ausgangscommit `227e61e`. Baseline 22/22, Build und
Paketverifikation am 21.10.2026 neu bestanden. Chromium 154 zeigt die echte
3D-Szene ohne JavaScriptfehler; Software-Rendering ist keine Gerätefreigabe.
Die bisherigen Abschnitte sind historisch. Aktuelle Regeln und Befunde:
`docs/RELEASE-PLAN.md`, `docs/REVIEW-STATUS.md`, `docs/DEVELOPMENT.md`.
Keine Veröffentlichung freigegeben. Nächster Schritt: Phase-1-Regressionen.

# Feldbuch – aktive Übergabe 0.20
Stand: 9. Oktober 2026. Einstieg: `dist/index.html → expedition.js`.

## Verträge der Ergänzungen aus 0.20
Kostenrahmen verbindlich: ausschließlich lokale kostenlose Werkzeuge und frei lizenzierte Inhalte. Niemals Konten bei kostenpflichtigen Anbietern für den Nutzer anlegen oder anbinden. Game-dev und Blender sind jetzt installiert; die gegenteilige frühere Aussage ist überholt. Nachweise und absolute Aufrufe: /Users/tobi/Documents/Codex/Tools/README.md.

`authored-wildlife.js` liest die eigenen, geprüften statischen Single-Mesh-GLBs. Absichtlich kein allgemeiner glTF-Loader: keine Skelette, fremden Erweiterungen, externen Puffer oder unbeachteten Node-Transformationen zulassen. COLOR_0 ist linear; _RIGDATA / _RIGJOINT enthalten die bestehenden Gameplay-Pivots (+X vorwärts, +Y oben, +Z seitlich). UV < 0 kennzeichnet kleine glänzende Augen-/Nasenteile. `legFeet` bleibt im selben Maßstab und Koordinatensystem. Der Shader benötigt keinen weiteren Vertexkanal.

`prepareAuthoredWildlife` vor dem Aufbau der texturierten Welt abwarten. Sonst kann der LoadingManager seine Fertigmeldung während des Modellladens auslösen, bevor die Startfreigabe angeschlossen ist. Die Einzel-HTML muss .glb mit model/gltf-binary einschließen; Pages verwendet gehashte dokumentrelative URLs. Geometrien werden pro Art vorbereitet, geklont und gemeinsam instanziert. Bestehende Artgruppen ohne neues Modell bleiben bei ihren bisherigen Formen. Vorbereiteter Cache darf nicht bei der Vorschau-Entsorgung mit entsorgt werden.

Gewichtete Halsrotation verwendet ausschließlich bei Teil 6 rigJoint.w. Legacy-Gewicht 0 bedeutet unverändert 1. Beinrollen 0/1/2 bleiben Oberbein, Unterbein und Fuß. Farb-, Normalen- und Tiefenpass folgen derselben Pose. Für Robben horizontale Flossenprofile verwenden: breit in X/Z, dünn in Y. Bodenursprung allein genügt nicht; auch die Bauchunterseite muss am Boden liegen. Dafür neue Regression in `authored-wildlife-check.mjs`.

`flight-feathers.js` erzeugt dünne gewölbte Schwungfedern; `pairedWingGeometry` spiegelt Normalen und Winding. Die bestehenden Artenpaletten bleiben maßgeblich. Keine Flügelfarbe aus beliebigen Akzentfarben ableiten. Modellkontrolle `pruefung.html` rahmt anhand der tatsächlichen Modellhöhe und Breite, damit Rehköpfe nicht abgeschnitten werden.

Authoring: tools/author-wildlife-v020.py, Blender-Quelldateien und initiale Skriptfassung in authoring/. Sechs lokale kanonische Pakete, die zwei korrigierten Robbenpakete sowie Hash-/Lizenz-/Vendoring-Nachweise in assets/vendor, .game-dev und verification/asset-receipts-v020. Aktive GLBs in dist/assets müssen exakt den gewählten kanonischen Modellen entsprechen. Keine Providerkonten oder bezahlten Dienste wurden genutzt. Keine GPU-Sealed-Run-Telemetrie oder menschliche Freigabe behaupten.

22 Prüfreihen bestehen. Noch offen: fotografische Fell-/Gefiederoberflächen, detailliertere Gesichtsanatomie und hochwertige artspezifische Modelle für die übrigen Arten; echte Tabletgeräte prüfen. Simulation ist weiterhin eine didaktische Lernlandschaft. Fachliche Inhalte und biologische Zuordnungen bleiben unverändert, Evolution weiterhin untergeordnet. Nicht wegen der neuen Modelle Arten automatisch freischalten.

## Verträge der Ergänzungen aus 0.19
`avian-anatomy.js` erzeugt eine geschlossene Torsooberfläche mit symmetrischen Gefiederfarben und geglätteter UV-Naht. `recipe.add` erhält geometrische Vertexfarben und kombiniert sie mit der Grundfarbe. Farbflächen nicht wieder durch überlappende Körperkugeln ersetzen. Kopf-/Schnabel-/Flügelmerkmale und publizierte Gesamtlänge weiter getrennt beachten. 64 Arten und 26.624 nach außen orientierte Torso-Dreiecke geprüft; keine fotografische Anatomie versprechen.

`motionControls.x` ist jetzt `age + phase`, der individuelle Simulationszeitgeber für Ruhebewegungen. `motion.run` bleibt im Gangmodell erhalten, ist aber nicht dieser Shaderkanal. `gaitData.y` bleibt unverändert der streckenabhängige Gangzyklus bzw. Insektenflügelschlag. Farb-, Normalen- und Tiefenpass verwenden dieselbe Pose; die Detailansicht übernimmt denselben Zeitgeber. WebGL2-Budget weiterhin höchstens 16 Attribute einschließlich Instanzmatrix und Farbe. Shader-Schlüssel unterscheiden nun auch Säugetiere von anderen Nichtvögeln. Eigenständige Preview-Materialien, Fell- und Oberflächentexturen beim Renderer-Entsorgen freigeben.

`render-visibility.js` behält pro Ausgabeplatz die Quellinstanz-ID. Erst bei anderer Belegung werden Matrix/Farbe geschrieben und Attribute hochgeladen. Auch nach Ausblenden, Verkleinern der sichtbaren Anzahl und Rückkehr bleiben Prefixe korrekt. Full/LOD/Shadow/Shadow-LOD getrennt halten. Unveränderliche `source`-/`colors`-Daten sind Voraussetzung; bei künftig dynamischen statischen Instanzen den Cache explizit invalidieren oder eine getrennte dynamische Batch verwenden. Bestehende Kamera-Toleranzen in `HabitatWorld.setView` sind davon unabhängig. `staticUploads` und `staticReusedFrames` sind lesbare Browserdiagnosen.

`resetControls` beendet beide Pointer-Captures, Tastenzustand, Tempo, Steuerkreis und Pinch. Auch Pointer-ID 0 ist gültig. Auf Canvas-Pinch ausschließlich `targetTouches` verwenden, damit die linke Bewegungssteuerung nicht als zweiter Kamerafinger zählt. Panel-, Blur-, Visibility- und Context-Loss-Ereignisse zurücksetzen; beim Wiederherstellen keinen Start, Szenario-Reset oder neuen Tierbestand erzeugen. GPU-Timer nach Context-Restore neu anlegen. Wiederherstellungsanzeige bietet nach 20 Sekunden einen bewussten Neustart an; gespeicherte Einträge bleiben erhalten, ungespeicherter Weltzustand bei Neustart nicht.

Startschaltfläche ist schon im HTML deaktiviert; erst erfolgreiche Material-/Shader-Vorbereitung aktiviert sie. Fehler beim Vorbereiten werden mit einem Wiederholungsangebot sichtbar. Die Builds unterstützen Revisionsparameter im HTML-Einstieg und CSS; Standalone und Pages müssen danach exakt die aktuelle Fassung enthalten. Einzel-HTML wird beim Bauen automatisch auch nach `dist/Feldbuch.html` kopiert. `switchFullscreen` in `ranger-controls.js` fängt auch nie endende WebView-Promises nach zwei Sekunden ab; ein ausstehender Aufruf verhindert weitere parallele Vollbildanforderungen. Die aktuelle Cross-Origin-Pages-Einbettung ist in beiden Tabletformaten getestet; das ist kein physischer Tablet-Leistungstest.

21 Prüfreihen, Paketvergleich und Browserprüfungen in `verification/` nachlesen. `pruefung.html` dient der lokalen Modellkontrolle; ihr Sitzungstest öffnet die echte Hauptansicht mit `?pruefung=1`. Nur dieser explizite Parameter aktiviert zwei sichtbare Grafik-Testschaltflächen. Normale Spielansichten zeigen keine Teststeuerung. Keine geheimen Teleport-/Freischalthooks ergänzen.

Pluginprüfung: Game-Studio Three.js, Web-3D-Assets, UI und Playtest wurden genutzt. Bei 0.19 fehlten die lokalen Programme noch. In 0.20 sind game-dev/Blender und geprüfte eigene GLBs samt Asset-Vendoring-Quittungen enthalten. Keine Providerjobs, GPU-Sealed-Run-Bundles oder KTX2-Modelle behaupten. GitHub-Connector ist erreichbar; kein Repository-/Pages-/Jimdo-Schreibzugriff durchgeführt. Für den nächsten großen Realismusschritt bleiben lizenzierte, artspezifische animierte 3D-Modelle nötig.

## Verträge der Ergänzungen aus 0.18
`render-budget.js`: Darstellungswahl verändert ausschließlich Auflösung, Schattenauflösung und Bildtakt. Auto / Sharp behalten die frühere Untergrenze `min(devicePixelRatio,1.35)`. Smooth ist die explizite Wahl für bis 60 FPS und darf auf Ratio 1 zurücknehmen. Mehrere Sekunden und Abkühlzeit zwischen Änderungen verhindern Flackern. Buch-/Start-/verdeckte Zeit nicht als Leistungsspielraum auswerten. Physische Größen, Fokus, Bestimmungsdauer und Simulation nicht an die Bildrate koppeln. Fernglas-Faktor 0,5 bleibt verbindlich. GPU-Abfragen nie synchron abwarten, maximal vier ausstehende Abfragen; fehlende Erweiterung und Disjoint zurücksetzen. Referenz: https://registry.khronos.org/webgl/extensions/EXT_disjoint_timer_query_webgl2/.

`asset-url.js` ist in der HTTP-Fassung eine Identität. Die Einzel-HTML erhält einen eigenen Resolver für `asset://`, der Artenfotos und MP3 erst bei Nutzung als Blob dekodiert. Fotografien nicht wieder im Startpfad dekodieren. Alle optionalen Inhalte bleiben in der Einzeldatei eingebettet. PNG-Originale sind im Quellprojekt erhalten; die aktive Fassung verwendet verlustfreie WebP-Kopien mit exakt denselben RGBA-Pixeln. `preparePlantImpostors` erst nach Laden der Texturen aufrufen, vor der Shader-Vorbereitung.

`tools/build-web.py` erzeugt das aktive Modulnetz mit Hashnamen, relativen Importen und dokumentrelativen Assetpfaden. Keine externen CDNs, keine Basis `/`, keine absolute localhost-Adresse in publizierten Dateien. `index.html` liegt im Wurzelverzeichnis des Pages-Pakets. `Feldbuch.html` ist ein zweiter identischer Einstieg. Nicht die große standalone-Datei im Pages-Paket ablegen. 168 Bilder und drei optionale Tondateien, Autoren-/Lizenzdateien und Three.js-Lizenz erhalten. Bei Aktualisierungen immer den gesamten Stand einschließlich HTML verteilen. Die Jimdo-Einbettung ist Cross-Origin geprüft; Speicher kann dort getrennt vom Direktaufruf sein. Vollbild ist browserabhängig.

`web-performance-check.mjs` ist die 18. Prüfreihe: Auflösungsgrenzen, Last und Leerlauf, 60-FPS-Auswahl, GPU-Queue und Lizenzfoto erst nach Fund. `verify-web.py` prüft alle gehashten Dateien, Importe, exakte Medien, ZIP und acht verlustfreie Bildvergleiche. Das Projekt enthält ausschließlich lokale Veröffentlichungsvorbereitung; kein Repository oder Jimdo-Konto wurde geändert.

Nächster visueller Ausbauschritt: echte artspezifische GLB-Modelle, Animationen und bei Bedarf KTX2-Texturen. Seit 0.20 sind sechs eigene GLB-Modelle enthalten; fotografische Modelle und KTX2 stehen weiterhin aus. WebP spart Downloadgröße, keine komprimierte GPU-Speicherung. Bei neuen Binärformaten beide Buildwerkzeuge erweitern, datei- und Modul-relative Loaderpfade berücksichtigen und Worker/Transcoder auf dieselbe Three.js-Version abstimmen. Große Assets nach Lebensraum nachladen; bestehende Tieridentität, Fokus, Paar-Quests und Kollisionen dürfen nicht an Modellwechsel gekoppelt sein.

## Verträge der Ergänzungen aus 0.17
`bird-plumage.js`: `accent` darf nicht pauschal Flügelfarbe sein. `wing`, `primary`, `wingBar`, `cap`, `speculum`, Schnabel- und Augenmerkmale sind semantisch getrennt; Flugpaar und gefaltete Flügel verwenden dieselbe Artenpalette. Anatomie bleibt prozedural, keine sichere Bestimmung aller ähnlichen Arten versprechen. Austernfischer-Referenz: https://www.rspb.org.uk/birds-and-wildlife/oystercatcher.

`curved-leaves.js` / `plant-forms.js`: geschlossene gekrümmte Blätter und Petalen für Nahmodelle, reduzierte gekrümmte Blattflächen für Gräser/Moose. `flowerTargets` muss weiterhin an der tatsächlich dargestellten Blüte liegen. `WIND_FLOWERS` und `hasNectarFlowers` halten Brennnessel, Wegerich und Strand-Beifuß aus dem Bestäuber-Nektarmodell heraus. Kein automatischer Katalogeintrag durch Modellaufbau.

`sediment-excavation.js`: vier Uniformöffnungen in Grund- und Regionsgelände; eigene animierte Bodendreiecke und identische `TerrainContact`-Abfrage. Bestehende Atlas-/Region-Shader beim Zusammensetzen erhalten. `.terrainGround` bezeichnet ausschließlich Gelände, keine Haus-/Wegmaterialien. Grabung läuft auch im geöffneten Probenfenster. Bei neuer Grabtiefe wird nur Geometrie der sich verändernden Probe aktualisiert. `WattSurvey.update` hält reale vorhandene Probenindividuen am tatsächlichen Boden. Die Probe wird ausschließlich tiefer; andere Stellen bleiben unverändert. Entfernung und Wasserbedeckung bleiben verbindliche Bedingungen.

`species-photos.js` / `species-photo-view.js`: 168 echte, attribuierte Fotos. Nur bekannte Arten zeigen ein Foto; tatsächliche Fokusidentität bestimmt den wiederkehrenden Eintragsknopf. Alle Bilder lokal einbetten, einschließlich Unterstrichen in Art-IDs. Bildquelle, Urheber, Lizenz und Verkleinerung stehen im Eintrag und in `assets/SPECIES-PHOTOS.txt`. Manche ältere Quelldateien benötigen manuell überprüfte Autorennamen; keine Namen aus Uploadnamen erraten. Bilder zeigen teilweise Schalen, Präparate oder andere Jahreskleider. Keine Fotobestimmungssicherheit aus den prozeduralen Spielmodellen ableiten.

`QuestBook.partners`: ausschließlich lebende, aktive und nicht unterdrückte reale Teilnehmer der aktuellen Kontexte; Artenfilter pro Kontext. Pflanzen nur bei expliziter Zugehörigkeit zum Artenpaar und am tatsächlichen `instance`-Platz markieren. `QuestInterface` verwendet gemeinsame instanzierte goldene/grüne Strahlen für freie Aufträge und Szenarien; Abschluss, Abbruch und Wechsel löschen alte Markierungen. Das einzelne kurze blaue Relaislicht ist kein Artenmarker.

`ranger-controls.js`: 7,5 m/s Sprintmaximum, 2,8 m/s normales Tastaturgehen, 1,05 m/s beim Beobachten. Joystickamplitude genau einmal anwenden, Diagonalen begrenzen, kleine Totzone erhalten. Physische Bewegungen werden in höchstens 10-cm-Schritte unterteilt, damit Sprinten keine Zäune überspringt. Berührungsabbruch löst den Steuerkreis. Die Starttafel und aufklappbare Steuerungshilfe bleiben synchron.

Fundamente verwenden die tatsächlichen sichtbaren Geländeflächen, einschließlich Grundgelände und Grundstückskanten. Die Höhenzugabe von Dorfkollisionen muss weiterhin zur analytischen Simulationshöhe passen. Die Holzunterlage ergänzt die sichtbaren Bohlen; Plattformbreiten und Wegprofil sind weiterhin gemeinsame Grundlage für Gehen, Tafeln und Wegbau. Die neue Ray-Prüfung findet an 2898 Punkten eine tatsächliche Holzfläche; kleinere Profilabweichungen an Kurven sind dokumentiert.

`fidelity-check.mjs` ergänzt die 16 bestehenden Prüfreihen um 45 Szenariopaare, 938 Markerkontrollen, 4293 Fundamentpunkte, tatsächliche Holzflächen, 64 Gefiederpaletten, 16 Blütenformen, sechs Grabtiefen, neun Geländeöffnungs-Materialien, 168 Fotos samt Lizenz und proportionalen Sprint. Aktuelle Browserstichproben enthalten auch Einbrüche bei UI-/Gebietswechseln. Keine dauerhaften Tablet-30-FPS zusagen.

## Weiter geltende Verträge
`bird-wings.js` spiegelt die rechte Schwinge einschließlich Normalen, Farben, UVs und umgekehrter Dreieckswindung. `wingSide` und die Instanzpose animieren ein Flügelpaar mit ausschließlich positiven Matrizen. `wingShader` läuft ebenso im Tiefen- und Vorschauprogramm. Nicht wieder negative Instanzskalierung einsetzen. Die Vorschau hat ein gemeinsames Flügelmesh; beide Schwingen haben dieselbe Materialoberfläche wie der Körper. Artabhängige Handschwingenfarben sind symmetrisch.

`world-layout.js` enthält die gemeinsame `AUTHORED_PONDS`-Liste: zwei Waldteiche, ein See, ein Dorfteich. Kein Modul darf eine eigene dritte Waldteichposition hinzufügen. Der Waldkern bleibt 73 Autorenmeter groß; äußere Bänder sind mit 0,46 komprimiert. Organismengrößen, Deckbreite und Gebäudemaße sind echte Modellmeter. `VILLAGE_LOTS` erhält die bisherigen lokalen Gebäudeabstände explizit; globale Kompression darf diese nicht erneut verkleinern.

`trail.js` führt mit 734.690 m durch alle acht Regionen. Die räumliche Suche ist geometrisch exakt, erhält die erste Segmententscheidung bei Gleichstand und fällt bei sehr fernen Punkten auf vollständige Suche zurück. Keine gerundeten Höhen-/Positionscaches verwenden. Wegprofile und Tierfüße brauchen unveränderte Präzision. 4495 Vollsuchvergleiche und ein isolierter Geschwindigkeitsvergleich liegen in `compact-world-check`.

`VILLAGE_STREET`: 2,7 m breit, x=`CENTERS.city.x+3.8`, z=-23 bis `layoutAxis(106)` (54,6716 m). `FARM_APPROACH` setzt die Straße als gebogene Schotterzufahrt fort; offene Torflügel und Pfosten markieren den Feldzugang. Genau eine Asphaltstraße bleibt bestehen. Drei `permanentRoad`-Rechtecke decken Straße und Zufahrt ab; Rotation und sichtbare Streifen müssen übereinstimmen. `villagePlotContains` reserviert auch die Zufahrt, und `builtPlot` gilt für Vegetation aller Lebensräume, einschließlich Weizen. Habitatzaun muss Fahrbahnen aussparen. Straße, Zufahrt und Bohlenweg-/Tafelflächen dürfen sich nicht überschneiden. Grundstücksmitten zählen bei der Fundamenthöhe mit.

`EncounterBehavior.move` prüft horizontale Schritte mit geplanter Flug- und Zielhöhe. Bereits fliegende Vögel halten genügend Abstand zu Hindernissen unter ihrer Landespalte; kein sofortiges Sinken in Zäune oder Dächer. `birdDestination` prüft Platzierung in der künftigen Stützhöhe ohne Boden-Segmenttest für einen vorgelagerten Flug. Auch Bodenfutterplätze verwenden die getrennte Reservierung für Konkurrenzpartner. Sink- und Kollisionsregeln nicht ohne Prüfung von 180 Gruppen sowie Flut-/Ebbe-Rast ändern.

`FieldEvolution.demeX` passt die lokalen Modellstandorte an die verfügbare Habitatbreite an. Die gleiche Breite gilt für Startpopulationen und Wanderroute; alte feste ±20-m-Koordinaten können im verkleinerten Offenland außerhalb des Habitatlimits liegen. Die Dorfisolation bleibt an der sichtbaren Straße, Genfluss führt um ihr seewärtiges Ende. Alle 21 regionalen Modelle müssen reale Evidenz und erreichbare Individuen behalten.

`ExpeditionEcology` verwendet Arten-/Räuberkandidaten- und Vogelrasterlisten wieder. Arrays vor jedem Neuaufbau vollständig leeren; keine inaktiven oder verstorbenen Individuen als aktive Nachbarn übernehmen. `birdClear` liest Zellen direkt, behält aber dieselbe Reihenfolge und Abstandsregel wie `birdNeighbors(...).every(...)`. Der Vergleich umfasst 1920 Entscheidungen. Die natürliche Individuenidentität und fortlaufende Bewegung außerhalb der Kamera bleiben erhalten.

Seehunde verwenden wie die Landtiere den sichtbaren Kontakt aus `walkHeight`, nicht die analytische Bodenformel. Böden für Wasser-/Ast-/Felsposen behalten ihre gesonderten Konventionen. Wegprüfung verwendet auch echte Geländedreiecke: mindestens 14.8 cm Bodenfreiheit, 936 eingegrabene Stützen. 500 geländefolgende Reisigfelder; alle Wege, Plattformen und Gewässerübergänge bleiben frei.

## Lieferung
Version 0.17.0, 51 JS-Dateien, 47 aktive Module, 183 aktive Bild-/Tonassets einschließlich 168 Artenfotos. 119 Tiere, 64 Vögel, 49 Pflanzen/Pilze, 168 Profile, 45 Szenariopaare, 180 Begegnungsgruppen, 36 Tafeln, 30549 registrierte Pflanzenplätze und 2365 Weizenplätze. Alle 17 Prüfreihen bestehen. Aktuelle browserbasierte Leistungswerte und Belege stehen in `PRUEFUNG.md` und `verification/`; sie sind keine Garantie für dauerhaft 30 FPS auf realen Tablets. HTML und Quellen-ZIP gemeinsam aktualisieren. Vollständiger Fotorealismus bleibt offen.

## Historische Grundlage 0.15 – nachfolgende Angaben sind früherer Stand

# Feldbuch – aktive Übergabe 0.15
Stand: 9. Oktober 2026. Aktiver Einstieg: `dist/index.html → expedition.js`.

## Neue Verträge
`quest-learning.js` enthält praktische Anweisungen, die vollständige Abschlussprüfung und modusabhängige Bewohnerziele. `questFinished` verlangt alle Begegnungen des Auftrags. `QuestInterface.details` zeigt Definition, Wirkung, Nachweis-Einordnung, Modellgrenzen, Theorie und Quellen erst danach. Die Szenarioübersicht enthält unabhängig von schon gefundenen Paaren nur Anleitung und Fortschritt. Keine Theorie aus einem abgeschlossenen Paar global vor unentdeckten Paaren anzeigen. Vor Abschluss keine allgemeine Definition in freien Auftragskarten. Das Questbuch bleibt nach Ökosystemen sortiert.

`InteractionScenarios.start` und `expedition.start` entfernen den bisherigen aktiven Auftrag. Beim Szenariostart wird kein erster Auftrag gewählt; Markerzahl bleibt null. `QuestInterface.updateSelectionPrompt` blinkt das Questbuch bis zur bewussten Auswahl und setzt sichtbare Diagnosefelder `awaitingQuest`/`activeQuest`. Auswahl aktiviert weiterhin ausschließlich die Partner des konkreten Auftrags. Bestehende Artbestimmung, Paarfokus und Speicherung nicht durch Menüauswahl ersetzen.

`residentDestination` löst Gesprächsaktionen gegen `book.available()` auf. Maren öffnet im freien Modus die echte Bestäubungsquest mit bevorzugtem Dorfhabitat; im Mutualismusszenario das passende Honigbienenpaar. In anderen Szenarien öffnet sie das aktuelle Questbuch mit erklärendem Hinweis. Ein nicht vorhandener Auftrag wird in `details` abgefangen. `openPanel` aktualisiert einen schon offenen Dialog ohne erneutes `showModal()` und setzt dessen Scrollposition zurück. Verabschiedung schließt den Dialog.

`village-people.js` baut nun zusammenhängende indizierte Gesichter und geformte Haarkappen. Kleine eingebettete Augen, Lidlinien, Mundkontur, integrierte Nase/Wangen und besser proportionierte Gliedmaßen ersetzen die überlappenden Kopfkugeln. Marens heller Imkerhut, geschlossene Jacke und ein leicht angewinkelter Arm bleiben im bisherigen beleuchteten 3D-Stil. Zwei Meshes je Figur, gemeinsames Material, zusammen 48252 Dreiecke, 55-m-Sichtgrenze. Es sind weiterhin prozedurale Figuren, keine Scanmodelle.

`terrain-contact.js` interpoliert die tatsächlichen Dreiecke der registrierten PlaneGeometry mit binärer Suche in ihren nicht gleichmäßig komprimierten Achsen. `HabitatWorld.terrainHeight` verwendet das Maximum aus regionaler Fläche und sichtbarem Grundgelände. `walkHeight` legt vorhandene Bohlenwegoberfläche darüber. Landtierkörper und Standfüße sowie Ranger benutzen diesen Kontakt. Wasser-, Flug-, Ast- und Felsposen behalten ihre eigenen Höhenkonventionen. Nicht wieder auf die analytische Formel als Bodenkontakt wechseln: am Dorfwall betrug die Differenz bis 0,768 m.

`habitat-fences.js` folgt denselben Autorenkoordinaten-Voronoi-Grenzen wie die Habitatzuordnung. 503 geländefolgende Reisigfelder mit 1006 Pfählen und 6036 Zweigstücken; zwei instanzierte Meshes mit bestehenden Sichtfiltern. Wegmitte, tatsächliche Deckflächen und Tafelausbuchtungen bleiben offen; Teiche und tiefe Wasserflächen werden ausgespart. Gedrehte `habitatFence`-Rechtecke gelten als echte Kollisionen für Ranger und bodengebundene Tiere. Durchgehende Bewegungssegmente werden ebenfalls geprüft. `collisionContains` und `segmentHitsBarrier` müssen die gleiche Rotation verwenden. Die Zäune beschreiben eine gestaltete Lehrlandschaft und sind keine typischen natürlichen Biotopgrenzen.

`blocker-grid.js` indexiert statische Hindernisse in 8-m-Zellen. `ExpeditionEcology.nearbyBlockers` fragt die gesamte Bewegungs-AABB mit artspezifischer Körperzugabe ab, einschließlich vorheriger Position. Raster neu aufbauen bei Änderung der Listenreferenz oder Länge; Hindernisse nicht später still verschieben. Prüfungen gegen vollständige Suche schließen gedrehte, dünne Zäune und längere Bewegungsstrecken ein. Von 432880 möglichen Einzelprüfungen blieben im Stichprobentest 3341 lokale Kandidaten; alle 1216 Entscheidungen identisch. `resolvePlacement` prüft zunächst lokal, ob überhaupt eine Überlappung besteht. Die tatsächliche Korrektur behält die vollständige ursprüngliche Hindernisreihenfolge; 160 Vollsuchvergleiche prüfen identische Korrekturentscheidungen und Endpositionen.

## Lieferung und Prüfung
Version 0.15.0. 44 JavaScript-Dateien, davon 40 aktive eingebettete Module; 15 aktive Bild-/Tonassets mit drei MP3-Aufnahmen. Arten-, Pflanzen-, Tafeln- und Paarumfang unverändert. Alle 15 Prüfreihen bestehen. `ranger-usability-check` ergänzt 720 tatsächliche Gelände-Raycasts, Fox-Standfüße, 2515 Zaun-/Wegpunkte, 1216 Raster-/Vollsuchvergleiche, sechs Starts ohne Auftrag/Marker, verzögerte Theorie und 35 Bewohnerziele in sieben Modi. `tools/build-standalone.py` ermittelt die Abhängigkeiten nun selbst; keine manuelle Modulreihenfolge ergänzen.

Die Startseite zeigt deutlich abgesetzte 16–17-Pixel-Modusfelder, 18-Pixel-Szenarioauswahl und native Dropdownoptionen. Die Steuerungshilfe ist aufklappbar; kurze Querformate bleiben scrollbar und der Startknopf liegt im sichtbaren Auswahlbereich. `field-guide.js` und erreichbare Starttafel erklären selbstgewählte Quests, nachträgliche Auswertung und freie Zaun-Durchgänge.

HTML und ZIP gemeinsam aktualisieren; Belege und Leistungswerte stehen in PRUEFUNG.md. Direkte lokale Dateiausführung und physisches Tablet-Multitouch bleiben ungeprüft. Die identische HTML wurde über HTTP ausgeführt. Vollständiger Fotorealismus und dauerhaft 30 FPS auf Tablets sind nicht bestätigt.

## Historische Grundlage 0.14 – nachfolgende Angaben sind früherer Stand

# Feldbuch – Übergabe 0.14
Stand: 9. Oktober 2026. Aktiver Einstieg: `dist/index.html → expedition.js`.

## Dorf, Stil und Hindernisse
`village-people.js`: fünf beleuchtete, ortsfeste 3D-Körper mit anatomischen Proportionen, kleinen Gesichtszügen, unterschiedlicher Kleidung und gesondert sanft drehbaren Köpfen. Gemeinsames raues Standardmaterial mit Vertexfarben; keine fotografischen Ebenen, keine Orientierung des ganzen Körpers zur Kamera. Außerhalb 55 m werden die jeweiligen Gruppen ausgeblendet. Zwei kompakte Meshes je Figur; zusammen 23168 Dreiecke. `build-standalone.py` bettet nur tatsächlich im aktiven Modulgraph referenzierte Bild-/Tondateien ein. Der historische Bewohneratlas liegt noch im Quellenbestand, ist aber inaktiv.

`village.js`: geschlossener extrudierter Giebelkörper und zwei feste Dachplatten je Haus. Giebel und Dach teilen exakt denselben Neigungswinkel; Überstände liegen auf dessen Verlängerung. Der Firstabschluss deckt den Anschluss. Zwanzig durchgehende `gardenFence`-Rechtecke passen zu den sichtbaren Zaunabschnitten; zentrale Tore bleiben offen. Hausausdehnung und Gartengrundstücke bleiben gleich. Vollständig gerahmte Rückseiten-/Giebelfenster sowie Regenrinnen und bis zum Boden reichende Fallrohre ergänzen den westlichen Blick.

`VILLAGE_STREET` ist eine einzelne 46 × 2,7 m Fahrbahn bei `CENTERS.city.x+3.8`, z=-23 bis +23. Asphaltkörnung entsteht als kleine deterministische DataTexture; Randsteine sind instanziert. Die ganze Fahrbahn samt Randsteinen liegt außerhalb des Bohlenweg-Fußabdrucks einschließlich aller Tafelflächen. Der bisherige zweite durchgehende Wegstreifen entfällt; kurze Gartenpfade bleiben.

`permanentRoad` ist unabhängig von `factors.road/corridor`. `HabitatWorld.canWalk` erlaubt dem Ranger diese flache Fahrbahn. `roadBlocks` sperrt Säuger, Amphibien und bodengebundene Wirbellose; bodenstehende Vögel müssen abheben. Fisch-/Flugbewegung bleibt möglich. `passable` prüft sowohl Körperüberlappung als auch durchgehende Bewegungssegmente an Straße und Gartenzäunen. Eine frühe Rechteckprüfung spart Arbeit bei weit entfernten Hindernissen. Inaktive Szenariotiere dürfen gemeinsam neu platziert werden; daraus darf kein freies Teleportieren aktiver Tiere entstehen. `resolvePlacement` verwendet bei Rechtecken die nächste erreichbare Kante anstatt den großen Umkreisradius.

`InteractionScenarios` reserviert für Dorfjagden ausreichend freien gemeinsamen Bewegungsraum. Die erste Beuteposition muss auch für den Körper und den Weg des Räubers erreichbar sein. `FieldEvolution.migrationCrossing` prüft im Dorf die ganze Wanderroute. Der Dorf-Isolationsauftrag verwendet die sichtbare permanente Straße, ihre reale westliche Kante und Teilpopulationen relativ zur Straßenmitte. Er aktiviert dort keine zweite unsichtbare experimentelle Straßensperre. Genfluss folgt einer freien Verbindung um das Straßenende; niemand läuft über die Fahrbahn. Dorfwanderungsmodelle haben 120 Modellsekunden je Generation. Die übrigen Regionen behalten ihre kürzeren vorhandenen Folgen. Die Dorfstation erklärt Modellannahme, unterschiedliche reale Durchlässigkeit und den Unterschied zwischen Zerschneidung und tatsächlicher evolutionärer Veränderung. Separate Straßen-/Durchlassschalter erscheinen an der Dorfstation nicht mehr.

`HabitatWorld.vegetation` wendet `builtPlot` auch auf Schilf und Wasserpflanzen an. Beide müssen die Straßen-/Grundstücksreservierung beachten; die frühere Ausnahme erzeugte Schilf mitten auf dem Asphalt. Pflanzengeometrie und registrierte Beobachtungsplätze werden gemeinsam ausgelassen. Der Dorfcheck prüft den tatsächlichen Pflanzenbestand gegen Fahrbahn und Randsteine.

## Lieferung und Prüfungen
Version 0.14.0, 40 JavaScript-Dateien, 36 aktive eingebettete Module, 15 aktive Bild-/Tondateien einschließlich drei echter Vogelaufnahmen. 119 Tierarten, 49 Pflanzen/Pilze, 168 Profile, 37 Tafeln, 45 Szenariopaare, 35602 registrierte Pflanzenplätze einschließlich 420 Gartenblüten und 3526 Weizenplätze. Vierzehn Prüfreihen samt Quellen/Ausgaben und aktuelle Spielbelege im Projektpaket.

`village-barrier-check.mjs` prüft zehn sichtbare Giebelseiten, neunzig Dach-/Überstandsstellen, achtzig Zaunrichtungen, fünf offene Tore, sechzehn Straßenquerungen, 6930 Fahrbahn-/Randsteinpositionen gegen die Wegflächen, echte Rehbewegung am Zaun und die 3D-Bewohnergeometrie. `regional-evolution-check` verlangt für die Dorfisolation ein tatsächliches Ereignis an der sichtbaren Straßenkante. Alle Interaktionsgruppen bleiben unter realen Hindernissen zu prüfen.

HTML und ZIP gemeinsam aktualisieren. Leistungswerte und Browserbelege stehen in PRUEFUNG.md. Direkte Datei-Adressen sind für das Browserwerkzeug gesperrt; Tests verwenden den vorhandenen HTTP-Spielserver. Die HTML wird dennoch bytegenau mit dem aktiven Quellenbestand abgeglichen. Vollständiger Fotorealismus, eindeutige visuelle Bestimmung aller Arten und stabile Tablet-30-FPS bleiben offen; keine solchen Zusagen aus Desktopstichproben ableiten.

## Historische Grundlage 0.13 – nachfolgende Angaben sind früherer Stand

# Feldbuch – aktive Übergabe 0.13
Stand: 8. Oktober 2026. Aktiver Einstieg: `dist/index.html → expedition.js`.

## Neue Verträge
`village-people.js` definiert genau einen Bewohner je vorhandenem Haus. Standpunkte und Personenkollisionen entstehen in `buildVillage` vor Simulation und Vegetation. Die fünf KI-generierten Freisteller teilen einen Atlas und einen instanzierten Zeichenaufruf; außerhalb von 65 m wird das gesamte Bewohner-Mesh ausgeblendet. Keine Bewegung durch Wände, keine behaupteten vollständig geriggten Menschen. `expedition.js` zeigt Kopfknöpfe alle 150 ms bei weniger als 4,5 m, Projektion im Bild, freier Sicht und ohne offenes Werkzeug/Dialog. Marens Aktion öffnet die echte Bestäubungsuntersuchung.

`living-habitats.js` ergänzt zwei echte Felsen mit je zwei getrennten Rastplätzen und sieben Kobel samt Astlöchern an vorhandenen Baumstämmen. `attachRefuges` überträgt Weltpositionen in lokale Habitatkoordinaten. `RefugeBehavior` steuert ausschließlich natürliche Kormorane und Eichhörnchen; Begegnungs-/Genetikakteure werden nicht übersteuert. Eichhörnchen mit aktivem Questauftrag folgen ihrer fachlichen Interaktion. Abstieg endet mit einem echten Schritt vom Stamm, bevor dessen Kollisionsausnahme aufgehoben wird. Ausnahme gilt nur für den zugeordneten Stamm beziehungsweise Felsen. Andere Hindernisse und benachbarte Vögel werden weiter geprüft. Beim Tauchen müssen Vogelabstand und `flight=0` dieselbe Höhenkonvention verwenden.

`poseY` ist absolute Welt-Höhe für Stamm, Ast, Fels und Tauchen; sonst bleibt sie null. `refugeOnRock` verhindert Schwimmanimation auf dem Felsen. `treeClimbing` ist die Eichhörnchenaktivität; vorhandenes `climbing` bleibt der Aufstieg von Falken. `wildlife-motion.js` koppelt Kletterzyklus an tatsächliche vertikale Verschiebung. Flügeltrocknen hat eine eigene sanft überblendete Haltung, keine Flugphase; Welt- und Detaildarstellung verwenden denselben Flügelwinkel. Individuen bleiben gleich, erfolgreiche natürliche Prädation bleibt tödlich und hat keine Ersatzspawns.

`field-soundscape.js`: drei lokal eingebettete echte MP3-Aufnahmen mit Public-Domain-/CC0-Herkunft. Kein AudioContext und keine Dekodierung vor bewusster Nutzung. Puffer werden einmal geladen, maximal zwei Quellen auch bei parallelen asynchronen Starts. Umgebungsrufe kommen ausschließlich von aktiven nahen passenden Vögeln; Flugruf nur im Flug. Ein offenes Feldbuch stoppt Umgebungsquellen, aber keine ausdrücklich gestartete Hörprobe. Verstecktes Dokument und Tonabschaltung stoppen alle Quellen. Keine synthetischen Stimmen als Artnachweis ausgeben.

`motionShaderKey` fasst nur identische erzeugte Bewegungsprogramme zusammen. Fisch-, Seehund-, Molch- und Wurmdeformation bleiben größenabhängig getrennt. Füße und Rig-Zuordnungen bleiben Uniformwerte der jeweiligen Art; anatomische Unterschiede werden nicht zusammengeführt. Der Coast-Check vergleicht den vollständigen Vertex-Code für jeden gemeinsamen Schlüssel. `ViewVolume` verwendet 2° bis 6° Sicherheitszugabe abhängig vom Sichtwinkel; die statische Kamera-Winkel-Schwelle ist dazu auf 0,015 rad verkürzt. Neue Artbeschriftungen vermeiden sichtbare UI-Rechtecke.

## Aktueller Lieferstand
Version 0.13.0, 40 JavaScript-Dateien insgesamt, davon 36 im aktiven Einzel-HTML-Modulgraph. 119 Tierarten einschließlich 64 Vögeln, 49 Pflanzen/Pilze, 168 beschreibende Artprofile, 37 Tafeln und 45 Szenariopaare. Dreizehn Prüfreihen und tatsächliche Browserbilder/Prüfprotokoll liegen im Projektarchiv. HTML und Projektpaket nach jeder Änderung gemeinsam aktualisieren. Tablet-Leistung und vollständiger Fotorealismus bleiben unbestätigt; die vorhandenen Artmodelle sind prozedural und die Bewohner sind Freisteller.

## Bewahrte Grundlage 0.12

### Übergabe 0.12
Stand: 8. Oktober 2026. Aktiver Einstieg: `dist/index.html → expedition.js`.

## Aktuelle Umsetzung und Verträge
Diese Fassung ergänzt das vorhandene Ranger-Spiel, ohne Dorfgrundstücke oder Waldkern zu vergrößern. `village.js` baut fünf geschlossene Häuser mit instanzierter Geometrie, richtigen Dachanschlüssen, Fenstern, Türen, Gartenzäunen, offenen Gartenzugängen, Straße und 420 registrierten Gartenpflanzen. Rechteckige Hauskollisionen gelten für Spieler, Tiere und Beobachtungs-Verdeckung. `villagePlotContains` hält allgemeine Vegetation aus Häusern, Gärten und Straßen heraus.

`garden-bees.js` hält acht tatsächliche `hiveWorker` mit dauerhaften IDs. Die natürliche Folge lautet Stock → Anflug → Blütenbesuche → Rückkehr → Abliefern. Besuche erreichen die realen `flowers`; Pollentransport benötigt getrennte Pflanzen derselben Art. Vorratsverbrauch und Nahrungslieferung sind endliche Modellgrößen. Generische Bewegung und `EcologicalRelations` dürfen die spezialisierten Arbeiter nicht ein zweites Mal steuern. Szenariobienen nutzen dagegen `EncounterBehavior`. Freie Bestäubungsaufträge richten `questPlant` und aktuelle Partner auf das tatsächliche Ziel des jeweiligen Arbeiters aus.

`observation-tools.js` stellt `sealGap`, Rechteck-/Kreis-Kollisionen, Fokusbewertung und größeren Fernglasbereich bereit. Seehundabstände berücksichtigen Längsachsen und Flossen statt nur Mittelpunkte. `settleSeals` läuft bei Aktivierung und nach Bewegung. Die glatte Seehund-/Kegelrobbengeometrie in `wildlife.js` behält die vorhandenen Animationsattribute und maßstäbliche Körperlänge.

Automatischer Fokus in `expedition.js`: unbekannte Art vor bekannter Art, kurze stabile Übernahme, dauerhafte Individuen-/Pflanzenidentität während Bestimmung; Projektion und Hindernisverdeckung bleiben zwingend. Expliziter Fokus (`lockMode='manual'`) wird nicht durch eine andere unbekannte Art ersetzt. Eigenes Schwenken löst die Bindung. Tierzeit wird weiterhin genau einmal halbiert. Die Lupe zeigt ausschließlich ihren tatsächlichen Pflanzenfokus. `showDiscovery` bietet 16 Sekunden lang direkten Zugriff auf das neu freigeschaltete beschreibende Profil. Keine Freischaltung durch Markierung.

`field-boards.js` kuratiert bereits vor der Plattformreservierung sieben doppelte Tafeln und erzeugt zugängliche SVG-Schaubilder. 37 Tafeln/Plattformen bleiben. `HabitatWorld.auditBoards` ergänzt tatsächliche Standortkontexte. Die Gartentafel steht am erreichbaren Bienenstock; Totholz steht außerhalb der Wegplattform. `field-guide.js` enthält nur den Rangerintro und Fernglas, Lupe, Questbuch, Karte. Bei weiterer Arbeit mitpflegen.

`field-evolution.js` wählt den Straßen-Zugang für Migration anhand tatsächlicher Hindernisse. Eine Tafel darf nicht als Beleg geographischer Isolation gelten. Der Durchlass verwendet denselben `crossingZ`. Die 21 regionalen genetischen Modelle müssen weiterhin tatsächliche Faktorereignisse liefern.

`field-ecology.js` bildet je Update Arten- und Räuberlisten in ursprünglicher Individuenreihenfolge. Nahrungssuche verwendet passende Listen statt wiederholter Suchen durch den gesamten Bestand. Identität, Animation, Dichte und Materialien bleiben erhalten. Der erste Render wartet auf vollständige Materialien und Shader-Vorbereitung; keine frühen Textur-Uploads ohne Bild.

## Umfang, Prüfung und Ausgabe
119 Tierarten (64 Vögel), 49 Pflanzen/Pilze, 168 beschreibende Artprofile. Acht Lebensräume, drei Waldteiche, etwa 831 Modellmeter Bohlenweg, 35688 Pflanzenplätze einschließlich 3538 Weizenplätze. 45 Szenariopaare, 180 Gruppen, 276 reservierte Szenarioindividuen. Die bisherige Fokus-/gemeinsame-Bild-Regel bleibt erhalten.

Zwölf erfolgreiche Prüfreihen, einschließlich `ranger-check.mjs` für Häuser/Gärten, tatsächliche Bienenbesuche und Stocklieferung, dauerhafte Identität, rotierende Seehundabstände, Artprofile und Fokuspriorität. `regional-evolution-check` prüft alle 21 Modelle nach dem Umbau. Direkte Browserprüfung: Rangerintro, erreichbare Gartentafel/Schaubild, Lupe mit unbekannter Art, neue Fundmeldung und Profil, vergrößerte Geräte in Hoch-/Querformat, Dorfspaziergang. Leistungsstichprobe in `PRUEFUNG.md`.

37 JS-Dateien, 33 aktive Module in der Einzel-HTML. `tools/build-standalone.py` erzeugt `outputs/Feldbuch.html`; danach identisch nach `dist/Feldbuch.html` kopieren. Projektarchiv enthält Quellen, Prüfungen, Ergebnisse, Katalog und Belege. Die aktive README und PRUEFUNG sind maßgeblich; nachfolgende Übergaben sind historische Zwischenstände.

Die Modelle bleiben prozedural. Vollständiger Fotorealismus, sichere grafische Bestimmung ähnlicher Arten und dauerhaft 30 FPS auf einem physischen Tablet sind nicht bestätigt. Jahres-/Lebenszyklen und empirische Kalibrierung bleiben offen. Keine öffentliche Veröffentlichung; lokale Dateien sind autorisiert.

---

# Historische Übergabe 0.11

# Feldbuch – aktive Übergabe 0.11
Stand: 8. Oktober 2026. Aktiver Einstieg: `dist/index.html → expedition.js`.
Die nachfolgenden historischen Abschnitte beschreiben ältere Zwischenstände. Für Questregeln, Verhalten, Modulzahl und aktuelle Prüfung gilt dieser Abschnitt zusammen mit `README.md` und `PRUEFUNG.md`.

## Aktueller Auftrag und Umsetzung
Alle sechs Interaktionsszenarien und 44 Artenpaare wurden überarbeitet. Die Turmfalken auf Wiese und Acker müssen im Flug bleiben: Kreisen → Rütteln → Stoß zur lebenden Feldmaus → sofortiges Aufsteigen. Weitere Jäger nutzen Anschleichen/Verfolgung, Lauern/kurze Beschleunigung oder Beutebearbeitung. Die Beute reagiert passend; Muscheln und vergrabene Würmer bewegen sich nicht wie Mäuse.

Die zuletzt gewünschte Questregel ist ausdrücklich ein Suchauftrag: beide tatsächlichen Partner einmal fokussieren und anschließend im selben gewöhnlichen Weltbild sehen. Sofortiger Abschluss; keine sechs Sekunden und keine vorangehende Feldbuchbestimmung erforderlich. Artbestimmung (3 s Tier / 2,5 s Pflanze) und Verhaltensdokumentation (6 s) sind getrennt. Freie Fachaufträge und Evolutionsversuche behalten ihre eigenen Nachweisbedingungen. Eine gemeinsame Sichtung beweist wissenschaftlich noch keine Beziehung.

## Aktiver Datenvertrag der Verhaltenssteuerung
`encounter-behavior.js` enthält `EncounterBehavior`. Eine Begegnung besitzt einen dauerhaften `plan` mit wirklichen `actors`, `patch`, `destination`, Phase und Modelluhr. `arm` setzt den Ablauf auf; `clear` entfernt vorübergehende Absichten, ersetzt keine Individuen. Im zentralen `ExpeditionEcology.update` läuft Alterszeit einmal; die generische Bewegung überspringt `encounterPlan`. Danach bewegen sich die Pläne und `EcologicalRelations.tick` übernimmt unter anderem die tatsächliche Parasitenversorgung. Keine doppelte Simulation von Szenarioakteuren.

Bewegung nutzt geglättete Winkelgeschwindigkeit, Beschleunigung, Bremsweg, echte Wasser-/Hindernisprüfungen und Vogelabstände. Flughöhe bleibt bei wechselndem Grund absolut kontinuierlich. `behaviorDistance` und `lastMoved` belegen tatsächliche Bewegung; `liveHunt` benennt den lebenden verfolgten Partner. `validEncounter` darf Verfolgung nicht allein aus räumlicher Nähe ableiten. Kestrel-Aktivitäten `circling/hovering/stooping/climbing` sind über `isHuntFlight` echte Flugzustände, auch unten im Stoßflug.

Konkurrenz benötigt einen passenden endlichen gemeinsamen Vorrat. Waldmeisen nutzen echte Baumäste und einen expliziten Wirbellosen-Lehrvorrat. Verbrauch und Ausweichen sind gekoppelt; Wechsel zu anderen Ressourcen darf verbrauchte Vorräte nicht neu auffüllen. `foodSites` merkt den Vorrat pro Baum. Watt-Nahrungsklassen dürfen keine beliebigen Grasplätze verwenden.

`botanicalGeometry.userData.flowerTargets` benennt Blütenpunkte in der tatsächlichen normalisierten Geometrie. `HabitatWorld.botanicalFlowers` transformiert sie mit identischen Platzierungswerten zu Weltpunkten, auch in den zusätzlichen Entdeckungspflanzungen. `expedition-state.js` überträgt `flowers` habitatlokal, erhält aber ihre absolute Y-Höhe und den realen Pflanzenplatz als `instance`. Das konkrete Anflugziel heißt `blossom`; `flower` bleibt der boolesche Ressourcenfilter. Keine Zentimeter-Mindest-Ankunftstoleranz für millimetergroße Insekten. Beim Ressourcenwechsel den Tätigkeitszustand sofort auf Anflug/Suche setzen; kein Bestäubungslabel am verlassenen Ort.

Pflanzenfraß findet an erreichbaren äußeren Pflanzenplätzen statt. Zoochorie koppelt Sammlung, `carriedSeed`, Transport und räumlich getrenntes Versteck. `WildlifeRenderer.carriedSeeds` zeichnet eine kleine Eichel nur für ein wirklich sichtbares tragendes Individuum. Das Versteck ist noch keine erfolgreiche Keimung. Parasiten behalten `attachedHost`, `parasiteIntake` und `parasiteCost`; Wirte bewegen sich weiter und Fische bleiben in tatsächlich wasserbedeckten Bereichen.

Küstenvögel nutzen bei Überflutung echte trockene Rastziele; auch das nach Vogelabständen verschobene Ziel muss über dem Wasser liegen. Ebbe schaltet zurück auf Anflug/Nahrungssuche. Nähe zum Ranger unterbricht Nahrungssuche. Nach Störung erst am realen Futterplatz wieder fressen. Niedrig gestörte Turmfalken steigen ohne Einfrieren auf.

## Quest- und Sichtungsvertrag
`InteractionScenarios.observe` speichert `focusedPartners` je Begegnungsgruppe. Tierfokus zählt über die tatsächliche Individuen-ID; Partner aus anderen Gruppen sind kein Ersatz. Pflanzenbestimmung zählt im passenden Lebensraum über die Art, der gemeinsame Blick muss den tatsächlich aktuell genutzten Pflanzenplatz enthalten. `partnersOf`, Strahlen und `QuestBook.partners` nutzen `group.plan.patch`, damit Fraß-/Bestäubungswechsel keine veraltete Pflanze markieren.

`questPartnerVisible` in `expedition.js` prüft echte Weltprojektion, Reichweite, Hindernisverdeckung und bei Tieren die tatsächlich gezeichnete Instanz. Übersicht, Dialog und Detailinset zählen nicht als gemeinsames Weltbild. Pausierte Nullzeit erzeugt keine Sichtung. `pairSighting` dokumentiert IDs, Phase, `sameFrame` und Modellzeit. Fertige Aufträge und bisherige Speicher-IDs bleiben erhalten. Auch ungewählte passende Paare zählen. Nur der ausgewählte offene Paarauftrag erhält Strahlen.

`field-guide.js`, Startseite und Questbuch erklären die neue Regel. Die Fokus-Taste sitzt unten rechts außerhalb der Bildmitte. Das Szenario zeichnet keinen zusätzlichen doppelten Nah-Wegstrahl über dem beobachteten Individuum. Entfernte Wegführung bleibt erhalten.

## Animation, Landschaft und Leistung
Flugneigung folgt vertikaler Bewegung und Kurvenrate; Kreisen gleitet, Rütteln schlägt kräftiger, Stoßflug legt an. Beinpose bleibt eingefaltet. Die Detailansicht erhält eigene Flügel und dieselbe Uhr/Pose des beobachteten Tiers. Gegliederte Bodenbewegung und weltfeste Standfüße bleiben erhalten; höchstens 16 Vertexattribute einschließlich Instanzfarbe. Fernglas halbiert die zentrale Tier-/Animationszeit genau einmal.

Acht Lebensräume, Waldkern mit drei Teichen unverändert, etwa 831 Modellmeter gestützter Bohlenweg, 44 Tafeln/Plattformen, 34987 Pflanzenplätze einschließlich 3526 Weizenplätze. 118 Tiere, 64 Vögel, 49 Pflanzen/Pilze; 40 Vogelarten im Salzwiesenkatalog. Sichtfilter und Pflanzenansichten erhalten die Dichte und Materialien. Die Bevölkerung wird nicht wegen fehlender Sicht gelöscht.

## Prüfung und Auslieferung 0.11
Elf Prüfskripte mit Ausgaben unter `tests/` im Archiv. Die neue `behavior-check.mjs` prüft alle 44 Paare / 176 Gruppen je 240 Modellsekunden und die unveränderten 272 reservierten IDs. Sie verlangt alle Jagdphasen, reale Kontaktversuche, Flucht, Konkurrenz samt Ausweichen, genaue Blütenkontakte/Pollenübertragung, tatsächlichen Fraß, Transport/Versteck und fortlaufende Parasitenversorgung. Zusatzfälle prüfen trockene Hochwasserrast, Rückkehr bei Ebbe, Annäherung und sofortigen Falkenaufstieg.

`scenario-check.mjs` prüft getrennt biologische Ereignisse aller Paare und die neue Spielregel: beide fokussiert, gemeinsame Sicht, kein Mischen von Gruppen, keine Auswahl-Autobestimmung, keine Nullzeit-Sichtung und korrekter Speicherreload. `locomotion-check.mjs` prüft zusätzlich Stoßflug/Detailflügel und ausschließlich echten Eicheltransport. Die übrigen acht bisherigen Prüfungen decken Simulation, freie Aufträge, Genetik, Welt/Kollision, Beobachtungswerkzeuge, Küste/Leistung und Route/Vogelabstände ab. Einzelheiten und Browserbelege in `PRUEFUNG.md`.

34 JS-Dateien, 30 in der Einzel-HTML aktive Module. `tools/build-standalone.py` erzeugt die selbstständige `outputs/Feldbuch.html`; im Entwicklungsprojekt danach identisch nach `dist/Feldbuch.html` kopieren. `work/package-project.py` erzeugt das Projektarchiv aus ausdrücklicher Dateiliste inklusive Quellen, Prüfungen und Belegen, ohne Zugangsdaten/Chatmetadaten. Nach künftigen Änderungen beide Artefakte aktualisieren.

## Grenzen und nächste Arbeit
Die Szenario-Fangversuche scheitern bewusst, ohne Ersatzspawns. Natürliche Prädation bleibt potentiell tödlich. Modelle sind prozedural und nicht empirisch kalibriert. Vollständiger Fotorealismus, vollständige Jahres-/Fortpflanzungszyklen, Wasserchemie, keimende Bäume und grafisch eindeutige Bestimmung aller ähnlichen Arten bleiben offen. Höchste Priorität danach: physische Tabletmessung, Speicher-/Startprofil und morphologisch geprüfte lizenzierte Artmodelle mit Skelettanimation. Desktop-Stichproben sind keine Tabletgarantie.

Keine bestätigte öffentliche Veröffentlichung. Der frühere Sites-Upload war ohne ausdrückliche Uploadfreigabe abgelehnt worden; nicht auf anderem Weg veröffentlichen. Lokale Weiterarbeit und Dateien sind autorisiert.

---

# Historische Übergabehinweise bis Version 0.10


# Weiterarbeit am Feldbuch
Stand: 8. Oktober 2026, Version 0.10. Aktiver Einstieg: `dist/index.html → expedition.js`.

## Neu in 0.10: zusammenhängender Weg und besser beobachtbare Tiere
Der Bohlenweg und seine Ausbuchtungen teilen jetzt eine Höhenlinie für Darstellung, Figurenhöhe und Tafeln. Bohlen folgen Steigungen, kurze Randhölzer folgen Kurven; die Hauptspur bleibt an den Zugängen frei. Durchgehende Längsträger, Querträger und 1068 im Boden verankerte Stützen tragen den Weg einschließlich der Ausbuchtungen. Innenkanten an überlappenden Kurven werden nicht als Stolperholz gezeichnet. Die drei zusätzlichen Feldrandtafeln sind entfernt; ihre Inhalte stehen an der zentralen Feldstation. Jetzt 44 Tafeln/Plattformen statt 47.

Nur die äußeren Achsenabschnitte werden zusätzlich von 0,68 auf 0,56 komprimiert. Waldkern und drei Waldteiche behalten ihre Maße. Die Route misst rund 831 statt 876 Modellmeter. Niedrige Offenlandvegetation und Gehölze erhalten 24 % mehr Platzierungsversuche je Fläche; Kulturpflanzen behalten reale Reihenabstände. 34987 tatsächlich registrierte Pflanzenplätze, darunter 3526 Weizenplätze. Alle regionalen Pflanzenarten bleiben vorhanden. Regionale Bodenflächen verwenden auch nach der Kompression konsistente Koordinaten im Sichtbarkeits-Shader.

Vögel erhalten voneinander getrennte Futter- und Sitzziele. Sitzplätze stammen von den dargestellten Ästen. Räumlich gefiltertes Ausweichen, Körperabstände, früheres Abbremsen und ein erneuter Anflug bei belegtem Landeplatz verhindern das Ineinandersitzen. Neu aktivierte Vögel beginnen früher mit individueller Aktivität. Kleine Kontaktkorrekturen bei Aktivierung/Moduswechsel erhalten Objekte und IDs; kein Ersatzspawn. Ansitzen ist von Fliegen getrennt: Ein Vogel auf einem erhöhten Ast schlägt nicht allein wegen seiner Höhe mit den Flügeln. Im Flug werden die gegliederten Beine zum Körper gezogen.

Im Szenario erhalten ausschließlich die vier Begegnungsgruppen des **ausgewählten Paarauftrags** Lichtstrahlen. Andere passende Beobachtungen dürfen weiterhin Aufträge erfüllen. Ohne Auswahl oder nach Abschluss keine weiteren Szenariostrahlen. Auswahl und Strahlen bestimmen keine Art automatisch.

Fernglas: Bewegungs-, Animations- und Modellzeit laufen mit Faktor 0,5; „Tiere · ½ Tempo“ bestätigt den Modus. Der mittlere Einrastbereich ist vergrößert und bleibt innerhalb des sichtbaren Feldes. Manuelles Umsehen löst die Bindung. Lupe: nur die konkret betrachtete Pflanze beschriften; zusätzliche Hintergrundnamen wie ständig eingeblendeter Rotschwingel entfallen. Tierbeschriftung im Fernglas bleibt erhalten.

Wattproben: Der Hinweis richtet zunächst den Blick zur erreichbaren Probenstelle. Vor Ort sind die sechs Tiefentasten mit 52-px-Mindesthöhe bedienbar. Unpassende Entfernung oder Überflutung werden nach Antippen erklärt; „Niedrigwasser einstellen“ ist direkt im Probenfenster verfügbar. Bestehende Funde und Grabtiefe bleiben beim Öffnen erhalten; kein automatischer Arteintrag. Im Browser zur Probe gelaufen, 35 cm untersucht, vier Tiere freigelegt und einen Fund im Fernglas angesehen. Hochwasser verweigert weiteres Graben mit Erklärung; direktes Niedrigwasser ermöglicht es wieder. Keine zusätzlichen Hintergrundnamen in der Lupe.

## Prüfung der Fassung 0.10
Zehn automatisierte Prüfungen erfolgreich. Zusätzlich `route-birds-check.mjs`: komplette Wegmitte und Querschnitte, maximale Steigung 12 %, mindestens 16,3 cm Abstand zum analytischen Boden, identische Tafelhöhen, verankerte Stützen und Randhölzer außerhalb der Hauptspur. 63124 räumliche Vogelvergleiche in Konkurrenz-/Herbivorie-Szenarien einschließlich Moduswechsel, keine Körperüberschneidung in dieser Prüfung. 64 Vogelarten mit eingefalteten Flugbeinen, Ansitzen ohne Flügelanimation. Tatsächliche Bewegungs-/Darstellungskette geprüft: in zwei Realzeitsekunden 6,8 m regulär versus 3,4 m im Fernglas; Alter und Gangzyklus ebenfalls exakt halbiert. Alle 44 Paaraufträge liefern weiterhin passende Nachweise; Strahlenfilter gegen fremde Auftrags-IDs geprüft.

Kurze Desktop-Stichprobe der fertigen Einzel-HTML bei 848 × 477 CSS-Pixeln im Wald: 30 FPS, P95 33,8 ms, 35 gezeichnete Tiere, Simulation 2,7 ms und Render-Vorbereitung 2,2 ms im letzten diagnostizierten Bild. Keine protokollierten Browserwarnungen oder Fehler. Das bleibt eine Stichprobe, keine Langzeitmessung auf einem physischen Tablet. Vollständiger Fotorealismus, empirische Flugphysik und aufgezeichnete Artanimationen bleiben offen.

33 JavaScript-Dateien syntaktisch geprüft. Die Einzeldatei enthält 29 aktive Module mit eingebettetem Bildmaterial und Three.js. Prüfbelege: `Bohlenweg-und-Ausbuchtung.jpg`, `Wattprobe-Untersuchung.jpg`; die isolierte Bewegungsprüfung bietet jetzt auch eine Flugpose. Das Projektarchiv enthält Quellen, zehn Prüfskripte und deren Ergebnisse. Direkte lokale Dateiausführung konnte durch die Browserwerkzeuggrenze weiterhin nicht geprüft werden; dieselbe Einzeldatei wurde über HTTP ausgeführt.

## Neu in 0.9: Schritte mit Bodenkontakt
84 Tierarten besitzen jetzt gegliederte Laufbeine. Aufgesetzte Füße halten ihren Platz in Weltkoordinaten; eine Hüft-/Kniekette folgt dem Kontaktpunkt. Die Schwungphase hebt die Füße an und führt sie nach vorne. Schrittlänge folgt Beinmaßen und zurückgelegter Strecke, bei schnellem Lauf werden die Schritte länger. Wendungen, Hänge, Stillstand und Blickfeldwechsel berücksichtigen dieselben Individuen.

Vierbeiniger Gang bei Fuchs/Reh, gebündeltes Absetzen bei Hase/Frosch/Eichhörnchen, wechselnde Schritte bei Watvögeln und synchrones Hüpfen kleiner Singvögel. Strandkrabben bewegen sich seitwärts mit acht gegliederten Beinen; Käfer nutzen sechs Beine. Zusätzliche Arthropodenbeine teilen vier Kontaktkanäle, daher sind sie beim Wenden nur näherungsweise unabhängig verankert. Robben kriechen mit Körper-/Flossenbewegung; schwimmende Amphibien bewegen Beine und Molche ihren Schwanz. Molche werden an Land nicht mehr pauschal über dem Boden positioniert.

Kleine Bodentiere erhalten weniger hektische Modellgeschwindigkeiten. Die Detailansicht übernimmt die Bewegung des tatsächlich beobachteten Individuums. Fernglaszeit bleibt halbiert. Fußziele werden nur für gezeichnete Tiere berechnet; Gangphasen laufen auch außerhalb des Bildes weiter. Beleuchtung und Schatten verwenden dieselbe Gelenkpose. Höchstens 16 Vertexattribute einschließlich Instanzfarbe, keine zusätzlichen Tier-Drawcalls.

Die Verfahren sind prozedural. Keine empirisch kalibrierte Biomechanik, vollständige Muskel-/Flugphysik oder aufgezeichneten Artanimationen. Die Fußstellung ist am Kontaktpunkt an den Untergrund angepasst; komplette Zehen-/Hufauflage auf steilen Flächen, Fresskniebeugen und eigenständige achtbeinige IK bleiben nächste Schritte. Sicherheitsbegrenzung verhindert überlange Beine bei extremen Geschwindigkeiten; dabei kann der Fuß vorzeitig abheben. Vollständiger Fotorealismus bleibt offen.

## Neu in 0.8: Rangerrolle und Interaktionsszenarien
Startseite und gemeinsame Starttafel inszenieren den ersten Dienst als Nationalparkranger in einem fiktiven Revier. `mode-free`, `mode-interactions`, `scenario-select` sind die Auswahl. `in-service` blendet die Spieloberfläche erst nach dem Start ein; beim Moduswechsel die laufende Beobachtung schließen. Auswahl allein verändert keine Feldbucheinträge.

`interaction-scenarios.js` ergänzt sechs `SCENARIOS` mit 44 stabilen Paarauftrags-IDs. 272 reservierte Individuen (vier Gruppen je Paar) werden **vor** `WildlifeRenderer` registriert, an tatsächlichen Ressourcen/Hindernissen platziert und zunächst mit `scenarioReserve`, `scenarioInactive` und `dormant` deaktiviert. Pro Modus sind 16–64 Szenariotiere aktiv. `scenarioGroup` verhindert Kreuzjagd/Konkurrenz mit anderen Lerngruppen. Nicht passende natürliche Tiere behalten ihre Objekte, IDs und Positionen, werden während des Szenarios über `scenarioSuppressed` bei Simulation, Rendering, Fokus und Beschriftung ausgenommen; im freien Modus wieder freigeben. Kein Ersatzspawn und kein Löschen der natürlichen Population. Der Moduswechsel ist ein bewusster Wechsel der Lerninszenierung.

`QuestBook.available()` liefert im Szenario dessen Paaraufträge, sonst die bisherigen 16 Kategorien. Questwechsel löschen die übergreifenden Szenariobegegnungen nicht. `InteractionScenarios.observe` prüft **beide** Feldbucheinträge und ein frisches, gruppenkorrektes Ereignis bzw. reale Verfolgung. Sechs Sekunden am selben Individuum; Unterbrechung/Individuenwechsel zurücksetzen. Ein Paarauftrag wird durch eine der vier Alternativbegegnungen erfüllt, nicht durch vier Wiederholungen. Auch ein nicht ausgewählter passender Auftrag kann abgeschlossen werden. Fertige Szenariopaare bleiben beim erneuten Auswählen fertig. Speicher bleibt `feldbuch-quests-v1`, Szenario-IDs sind separat benannt; natürliche Altaufträge werden nicht überschrieben.

`QuestInterface.showScenario()` sortiert nach Route: Wald, Wiese, Acker, Dorf, Salzwiese, Watt, Strand, See. Hohe 28-m-Strahlen und Bodenringe sind zwei InstancedMeshes; `markers(book.active.quest.id)` filtert ausschließlich den ausgewählten Paarauftrag. Ohne Auswahl beziehungsweise nach Abschluss ausblenden. Tierstrahlen gold, Pflanzenstrahlen grün; beim Bestäuben folgen sie der aktuell genutzten realen Pflanze. Beobachtungsmodus senkt Strahlopazität. Der Fokus nutzt weiterhin die konkrete gerenderte Instanz/den realen Pflanzenplatz. Gezielt gewählte Pflanzen werden in der Lupe gehalten, statt durch überlagerndes Gras ersetzt zu werden.

Drei Parasiten im Katalog: `ixodes_ricinus` (Arachnida, acht Beine), `argulus_foliaceus` (Branchiura) und `lepeophtheirus_pectoralis` (Copepoda). `attachedHost` bindet Bewegung an Reh, Rotauge bzw. Scholle. `parasiteIntake`/`parasiteCost` speichern positiven Ressourcentransfer, frische Ereignisse identifizieren beide IDs. Anatomische Detailgeometrie bleibt vereinfacht; keine mikroskopische Artenbestimmung oder komplette Infektionsökologie behaupten. `scenarioAquatic` begrenzt marine Wirte auf dauerhaft ausreichend tiefe Modellwasserbereiche.

Ressourcenkorrekturen: mindestens drei tatsächlich vorhandene Pflanzenplätze je regionalem Taxon in der ökologischen Auswahl, soweit vorhanden; Pollentransport braucht getrennte Pflanzen. Konkurrenz zwischen Stockente und Blässhuhn nutzt nun tatsächlich gemeinsame Wasserpflanzen, statt unterschiedliche Nahrungsklassen als Konkurrenz auszugeben. `EcologicalRelations.travel` beginnt eine neue Besuchsphase und sucht an Baumressourcen erreichbare Plätze außerhalb des Stamms. So werden Samenaufnahme und anschließendes Verstecken auch tatsächlich getrennt dokumentiert. `educationHunt` betrifft ausschließlich die inszenierten Jagdgruppen: misslungene Fangversuche, keine versteckte Wiederbelebung. Freie Prädation bleibt unverändert.

`tests/scenario-check.mjs`: sechs Szenarien je 240 Modellsekunden im tatsächlichen HabitatWorld; alle 44 Paare mit passenden Nachweisen, keine verlorenen Lerngruppentiere, dauerhaftes Wasser für marine Wirte. Beide Partner erforderlich; fremde Ereignis-ID, Nullzeit und Auswahl allein liefern keinen Nachweis. Unausgewählte Aufträge und Speicherreload geprüft; Originalindividuen bleiben nach Moduswechsel erhalten. Neun automatisierte Prüfungen sind im Archiv enthalten.

## Nutzerprioritäten
Entdeckungsfreude beim Spaziergang und möglichst naturgetreue Darstellung für Klasse 12, Biologie-LK. Arten zuerst bestimmen, danach Verhalten beobachten. Tabletsteuerung, Egoansicht und freie Übersicht. Dichter Wald mit Stockwerken und drei Teichen; Wiese, See, Dorf/Stadt, Acker, Strand, Salzwiese und Watt. Bohlenweg mit seitlichen Tafeln, begehbare Randgebiete und sichtbare Landzäune. Fernglas für Tiere, Lupe für Pflanzen/Pilze, dezente bekannte Namen und sanfte Fokusbindung. Questbuch mit tatsächlichen Interaktionen und Lichtführung vor der Artbestimmung; Evolutionsversuche bleiben nachgeordnet. Individuen beim Gebietswechsel behalten, erstmals durch Nähe oder Auftrag aktivieren. Ziel 30 FPS ohne Verlust der sichtbaren Qualität.

## Aktiver Datenvertrag
`biodiversity.js` plus `catalogue-extension.js`: 118 Tiere, 64 Vögel, 49 Pflanzen/Pilze, acht Habitate. Salzwiese: 53 Tierarten, davon 40 Vögel, und zwölf Pflanzen. `ANIMALS.size` ist ungefähre Körperlänge in Metern, keine Spannweite. `prey` nennt konkrete Arten, `resource` die breitere Nahrungsklasse; `trophic` ist nahrungsabhängig. Fomes ist Fungi. Größen/Varianten und zahlreiche Direktlinks weiter artspezifisch überprüfen.

`createExpeditionSimulations` in `expedition-state.js` ist das gemeinsame Setup für Spiel und Integrationstests: tatsächliche Pflanzenplätze, endliche Nahrungspatches, Grundhöhen und körper-/höhenabhängige Hindernisse. Koordinaten `x,z` sind habitatlokal; `renderX,renderZ` beziehungsweise `offsetX,offsetZ` beziehen sich auf `CENTERS`. Grund- und Wasserhöhe sind für Landschaft, Tiere und Beobachtung konsistent.

`enableProximityActivation` stellt natürliche Tiere zunächst auf `dormant=true, alive=false`. `activateNear` verwendet 48 Modellmeter, `activateSpecies` aktiviert vorhandene Auftragspartner. Nach Aktivierung nie wegen Entfernung zurücksetzen oder deaktivieren. Sie werden weiter simuliert, auch wenn keine Instanz gezeichnet wird. Prädation setzt `dead=true`; kein automatischer Ersatz nach 80 Sekunden. Die alte temporäre Wiedererscheinungslogik darf tote, dormant, zurückgezogene Modell- oder Bodenprobentiere nicht wiederbeleben. Natürliche Fortpflanzungszyklen stehen noch aus. Populationen werden bisher nur während einer laufenden Sitzung erhalten, nicht beim Neuladen.

`EcologicalRelations` koppelt Ankunft, Vorratsverbrauch, Konkurrenz, Pollenübertragung und Samenverstecke. Frische Ereignisse tragen Zeit und Akteursalter. Ein Set `regrowing` enthält nur tatsächlich verringerte Ressourcen. Keine Regeneration voller unberührter Patches pro Frame. Zusätzliche kleine Wirbellosen-, Algen- und Detritusressourcen sind Lehrvorräte, keine automatisch bestimmten Tierarten.

`FieldJournal`: Speicherkey `evolutionswald-fieldjournal-v2`. Tier 3 s, Pflanze/Pilz 2,5 s, passende Tätigkeit 6 s zusammenhängend. Wechsel von Individuum, Tätigkeit oder Kontext setzt Zeiten zurück. Vorhandene Nutzereinträge niemals löschen. Spuren können Artbelege liefern, aber keinen lebenden Verhaltenseintrag. JSON-Export vorhanden; Import/Migration noch offen.

## Welt, Küste und Beobachtung
`habitat-world.js` enthält acht Regionen, 44 Tafeln/Plattformen und 34987 räumliche Pflanzenplätze einschließlich tatsächlicher Ackerpflanzen. Kronenblätter sind Teile desselben Baums, keine separaten Artfundorte. Alle registrierten Pflanzen sind über `PlantIndex` räumlich suchbar; nicht mehr nur repräsentative Grasplätze. Drei Waldteiche, See und Dorfteich stehen in `PONDS`; der dritte Waldteich ist fischfrei.

`trail.js`: etwa 831 Modellmeter, Wald → Wiese → Acker → Dorf → Salzwiese → Watt → Strand → See. `nearestTrail`, `trailPoint` und `TRAIL_ENTRIES` teilen Route, Karte, Plattformen und Lichtnavigation. Plattformen vor Vegetation reservieren. Niedrigste Küstenbohlen liegen über dem höchsten Modellwasserstand. Beobachtungen abseits bleiben erlaubt. West-, Ost- und landseitige Grenzen sind bis an die Küste eingezäunt; die Meerseite bleibt unsichtbar begrenzt.

`field-guide.js` liefert physische Kurztafel und Lesefenster. Bei Mechanikänderungen gemeinsam pflegen, siehe AGENTS.md. Körperradius, Hindernishöhe und Tafelsockel auf dem Deck berücksichtigen; hohe Flüge dürfen über Tafeln führen. Robben benutzen `sealSurfaceY`, Fische tatsächlich passierbares Wasser. Tagesruhe wird über Bewegung zum Schlafplatz erreicht statt per Ortswechsel.

`observation-tools.js` trennt Tier-/Pflanzenwerkzeug strikt. Sanfte automatische Bindung nach kurzem stabilen Fokus; manuelles Schwenken löst sie vorübergehend. Bekannte Namen sind im Beobachtungsmodus schwach beschriftet. `FocusMarker` verwendet bei Tieren die **kompaktierte aktuelle Renderinstanz**, bei Pflanzen den konkreten Platz. Feldfotos enthalten denselben Zielrahmen. Verdeckung basiert noch hauptsächlich auf Gebäuden/Stämmen; Blatt-/Geländeverdeckung ist ausbaubar.

`TideClock` in `tidal-system.js`: separater 240-s-Zyklus, Niedrigwasser −0,9 / Hochwasser +0,4, manuelles Einstellen pausiert. Fernglas skaliert Tier-/Animations-/Generationszeit mit 0,5, nicht Tide oder Beobachtungszeit. Lupe verlangsamt Tiere nicht.

`WattSurvey` in `field-sampling.js`: vier feste Stellen, zehn Arten, Lehrtiefen 0–30 cm, freilegbar bis 35 cm. Vorhandene Individuen-IDs, keine zufällige Katalogbelohnung. Entfernung ≤3,8 m und tatsächliche Wasserbedeckung begrenzen Graben. Ein Richtungspfeil führt zur nächsten Stelle. Anschließend selbst im Fernglas bestimmen.

## Questbuch und Genetik
`quest-cases.js`, `quests.js`, `quest-interface.js`: 16 Kategorien, davon acht Interaktionen und acht Faktoren. 50 Kernfundorte, 196 ergänzende Ressourcennischen, 21 regionale genetische Begegnungen. Jede Tierart ein primärer Schwerpunkt; natürlich mögliche andere Beziehungen bleiben erhalten. Keine biologisch unsinnige Pflicht, jede Beziehung in jedem Habitat abzubilden.

Auftragswahl aktiviert vorhandene Partner, ohne Ortsversetzung oder automatische Bestimmung. Lichtstrahl zum nächsten Fundort; jenseits von 85 m ein Weglicht 55 m voraus. Kleine Lichtpunkte folgen tatsächlichen Partnern, auch Pflanzen. Bodenprobentiere können als Suchziel erscheinen, bevor sie freigelegt sind. Kontinuierliche Beobachtung desselben Individuums/Kontexts nötig. Speicherkey `feldbuch-quests-v1` enthält regionale Nachweise; alte Bestätigungen ohne regionale Records sind keine neuen Gesamtnachweise.

Nicht verfügbare Fundorte bleiben in der Sollzahl erhalten. Ein fehlender lebender Partner darf den gesamten Auftrag nicht unbemerkt abschließen. Die Oberfläche benennt die fehlenden Partner; kein versprochener automatischer Respawn. Gespeicherte Teilnachweise werden als Teilnachweise angezeigt.

`EvolutionCollection` enthält 21 `FieldEvolution`-Modelle mit jeweils 48 Renderplätzen (1008 Slots); nur der ausgewählte Faktor ist aktiv. 16 Eltern, zwei Teilpopulationen, zwei diploide Genorte. 55 s Generation bzw. 75 s bei Genfluss/Isolation; bei unzureichenden Nachkommen verlängern. Mutationsrate 6 % je Lehr-Locus/Keimzelle. Fellhelligkeit und Partnerpräferenz sind hypothetisch, keine behauptete Artgenetik.

Fortpflanzung benötigt tatsächliche Annäherung. Neue Geburten bekommen neue IDs, obwohl Renderplätze wiederverwendet werden. Genfluss setzt Durchlassüberquerung und Nachkommenschaft anderer Herkunft voraus. Isolation blockiert dieselbe Passage. Selektion aktiviert vorhandene Füchse und genotypabhängigen Modell-Fraßdruck. Alte natürliche Tiere niemals als Nachwuchsslots verwenden. Neustart eines Versuchs setzt bewusst neue Lehr-Eltern an; keine heimliche Ergänzung von Paaren.

## Rendering und Leistung
`render-visibility.js`: unveränderte Ausgangsmatrizen, räumliche 16-m-Kacheln, konservativ erweitertes Kamerasichtfeld, Kompaktierung sichtbarer Instanzen. Nahe abgewandte Schattenwerfer stehen in separaten Instanzgruppen auf Layer 1: die Hauptkamera zeichnet sie nicht, die Sonnen-Schattenkamera berücksichtigt sie weiterhin. Keine Simulationsmutation. Neu prüfen nach Position/Blick/FOV/Viewport.

Lokaler Three.js-Patch in `dist/vendor/three.module.js`, Funktion `WebGLShadowMap.renderObject`: Ebenenprüfung verwendet `shadowCamera.layers` statt `camera.layers`. Die Sonnen-Schattenkamera aktiviert Layer 1; ohne diesen Patch würden die separaten Schattenwerfer fehlen. Bei Vendor-Updates übernehmen oder die Trennung anders implementieren. MIT-Lizenz bleibt erhalten.

`plant-impostors.js`: acht Ansichten desselben botanischen Modells, 256 px je Ansicht. Vollmodell bei projizierter Höhe ≥24 px; Fernglas-/Lupenzoom holt es automatisch zurück. Entfernte Schatten verwenden Alpha-Silhouetten. Abendbeleuchtung tönt die entfernten Ansichten mit. Atlanten werden beim Start gebacken; Startdauer und GPU-Speicher noch auf echten Tablets messen.

`mesh-geometry.js`: exakt gleiche Eckpunkte einschließlich Normalen, Farben und UVs indexieren. Keine Änderung von Form/Flächen. `WildlifeRenderer` zeichnet nur lebende sichtbare Tiere; `renderIndex` ist vom Simulationsindex getrennt. `boundsFor` muss die aktuelle kompakte Matrix verwenden. Flügel nur für tatsächliche Flüge. Der ungestartete Willkommenbildschirm rendert selten; versteckte Dokumente pausieren.

Bestehende Materialqualität, Vegetationsdichte, Antialiasing und Pixelratio-Obergrenze 1,35 bleiben erhalten. Kamerasichtfilter/LOD ändern Berechnungsaufwand, keine Population. Salzwiesenboden mischt Gras/Schlick nach Höhe. Regionale Bodenflächen werden anhand derselben Habitat-Zuordnung getrennt, um Überlagerungsflimmern zu verhindern.

Canvas-Datasets liefern Revision, 2-s-FPS, Zielrate 30, 95. Perzentil der letzten bis zu 180 Bildabstände, Drawcalls/Dreiecke, aktive/inaktive/gezeichnete Tiere, LOD-Zahl und CPU-Zeiten. Die Oberfläche bleibt frei von Technik. Historische Stichproben der Version 0.6: Wald und Salzwiese ca. 848 × 477 CSS-Pixel, jeweils 30 FPS; Feld im Querformat ca. 1017 × 763 und im Hochformat ca. 763 × 1017, jeweils 30 FPS. P95 in diesen Stichproben ca. 33,4–34,3 ms. Das sind kurze Messungen; keine reale Tabletgarantie. Angeforderte Browser-Testgrößen werden intern skaliert, deshalb tatsächliche Canvasmaße verwenden.

## Prüfungen und Auslieferung
Zehn Prüfungen und deren Ausgaben liegen unter `tests/` im Archiv:
1. `field-check.mjs`: 450 Modellsekunden je Habitat, Artenreferenzen, Wasserbindung, Jagd, Nacht, Beobachtung/Persistenz.
2. `quest-check.mjs`: Route, Pollenübertragung, endliche gemeinsame Nahrung, alle 16 Kategorien, acht genetische Faktoren je 380 s.
3. `live-experiment-check.mjs`: acht Faktoren je 300 s im vollständigen Ackerhabitat.
4. `world-check.mjs`: tatsächliche 44 Plattformen, vollständige Wegmitte alle 0,5 m, Zugänge, freie Pflanzenplätze, Randgebiete, Tier-/Tafelkollisionen.
5. `observation-check.mjs`: Körper- und Flughöhe, Startkorrektur, Bewegung am Schild, tatsächliche Fokusgrenzen im Quer-/Hochformat.
6. `coast-performance-check.mjs`: Näheaktivierung, fortlaufende Identität/Position, kein Ersatz nach Tod, sämtliche Questkontexte, fehlende Partner, Werkzeugtrennung, alle Salzpflanzen/Acker, Bodenproben/Tide, Fences, Robbenhöhe, kompakte Matrizen und exakte Geometrie.
7. `regional-evolution-check.mjs`: alle **21 tatsächlichen regionalen Modelle** jeweils 380 s, legale Start-/Endpositionen, Geburten mit eindeutigen IDs, konkrete Faktornachweise und Genfluss/Isolation.
8. `scenario-check.mjs`: alle sechs Szenarien und 44 Artenpaare, Nachweisbedingungen, marine Wirte und unveränderte reservierte Individuen.
9. `locomotion-check.mjs`: 84 gegliederte Arten bei 30 Hz, echte gerenderte Fußziele, Hang/Kurve, Aufsetzen/Fußheben, Gelenkreichweite, Stillstand, Wiedereintritt, neue IDs und reale Detailpose.

30 Root-JS-Module syntaktisch geprüft. Browser-QA prüft normale HTTP-Spielvorschau, Tabletformate, Werkzeuge, Tide, Karte/Regionen, echte Jagdbeobachtung und Downloads. Nativen Multitouch, Wärme, GPU-Speicher und physische Tablet-FPS noch prüfen.

`tools/build-standalone.py` erzeugt nach Codeänderung `outputs/Feldbuch.html` mit 28 eingebetteten aktiven Modulen, Bibliothek und Bildern. `Feldbuch-Projekt.zip` enthält ausschließlich benötigte öffentliche Projektdateien, Quellen und Tests. Keine Zugangsdaten oder Chatmetadaten. Direkter lokaler Datei-Browserzugriff konnte wegen einer Werkzeuggrenze nicht geprüft werden; über HTTP prüfen.

## Weiterarbeit
Höchste Priorität: physische Tabletmessung, Start-/Speicherprofil und morphologisch geprüfte lizenzierte Artmodelle mit Skelettanimation. Artgrößen, Schnäbel, Gefieder, Bodenkontakt und Tagesruhe vertiefen. Danach diagnostische Pflanzenmerkmale, konsistente Jahreszeiten, natürliche Fortpflanzung/Lebensstadien, keimende Samen und Wasserchemie. Generierte Materialatlanten nicht als zertifizierte Scans beschreiben. Vollständiger Fotorealismus und reine grafische Artbestimmung aller ähnlichen Arten sind weiterhin nicht erreicht.

Es gibt keinen bestätigten öffentlichen Live-Link. Der frühere Sites-Upload war ohne ausdrückliche Uploadfreigabe abgelehnt worden. Nicht auf anderen Wegen veröffentlichen; lokale Weiterarbeit und Downloads sind autorisiert.

## Letzte fachliche Küstenkorrektur
Freilegen setzt Probentiere zunächst auf Ruhen mit leerem Nahrungsziel. Anschließend entscheidet die tatsächliche Artregel: Detritivorie, Filtration, Aufwuchsfraß oder Jagd. Retusa besitzt Peringia als Beute, eine tonnenförmige Schale und langsame Kriechbewegung; kleine Beute benötigt entsprechend kurze Fangdistanz. Eine Probe enthält beide Arten in enger Nachbarschaft. Nahrungssuche-Aufträge aktivieren auch vorhandene Beutepartner; deren Beobachtung darf den Auftrag des Räubers nicht ersetzen. FieldJournal verweigert unpassenden Detritus-Nachweis. Früher gespeicherte entsprechende Beobachtungen bleiben erhalten und werden als erneut zu prüfende Nachweise bezeichnet.


## Selektive Offenlandverdichtung in 0.7
`world-layout.js` definiert die gemeinsame, invertierbare Raumabbildung. `spaced` bleibt die alte lineare Umrechnung (0,62). `layoutAxis` erhält den Waldkern von −73 bis +73 Autorenmetern und komprimiert nur die darüber hinausgehenden Achsenabschnitte um 0,68. `authoredAxis` ist die Umkehrung. Globale Platzierung über `layoutPoint`, lokale Habitatkoordinaten über `localPoint(id,p)`; `authoredLocal` für biologische Wasser-/Grenzprüfungen. Regionale Zuordnung und Boden-Shader benutzen dieselbe inverse Zuordnung. **Nicht `spaced(offset)` zu einem verschobenen offenen Habitat addieren.** Weltpositionen immer vom Autorenmittelpunkt aus abbilden. Organismen, Deckbreite und Augenhöhe nie mitskalieren.

Alle Terrainpunkte, Route, Tafelausgangsorte, Feldreihen, Zäune, Deiche und Bodenproben folgen derselben Abbildung. Teiche können außerhalb des Waldkerns elliptisch werden: `rx/rz` sowie `pondContains` für Wasserflächen, Uferbepflanzung, Gehen und Tier-Wasserzuordnung verwenden. Waldteiche bleiben kreisförmig und unverändert groß. Niedrige Vegetationsmengen folgen `habitatArea`, Feldreihen behalten ihre tatsächlichen Abstände. Kleine Artgruppen wiederholen erfolglose Platzierungen begrenzt, bis wenigstens ein Exemplar vorhanden ist; keine Katalogart darf durch Verdichtung vollständig wegfallen.

37700 Pflanzenplätze gegenüber 58560 in 0.6; 5264 tatsächliche Weizenplätze. Waldkern-Flächenfaktor 1 gegenüber 0.6, Wiese ca. 0,693, Acker 0,471, Strand 0,486, Salzwiese 0,524. Route 876,12 m statt rund 1001 m, weiterhin 47 Tafeln. Alle Wege in Halbmeterabständen und alle Einstiegspunkte begehbar. West/Ost ±106,8136 m, Nord 101,7544 m, Süd −113,5592 m, Meereszugangsschwelle −103,4408 m. Echte begrünte Böschungen schließen Landblicke. Normale Kamera weiterhin 135 m Far-Plane; Übersicht 360 m.

`uploadInstances` überträgt ausschließlich belegte Matrix-/Farb-/Animationsbereiche. Matrixkompaktierung vermeidet temporäre Subarray-Objekte pro Instanz. Die Darstellung ist auf 30 FPS begrenzt; Tier- und Beobachtungszeit verwenden weiterhin die tatsächliche Zeitdifferenz. Schatten werden höchstens etwa 20-mal/s aktualisiert (bei 30 FPS typischerweise 15-mal/s); texelgerasterte Sonnenposition reduziert schwimmende Schatten. Lesen rendert den pausierten Hintergrund seltener. Alle Materialvarianten werden vor dem Start asynchron vorbereitet, um erste Arten-/Regionsbesuche zu entlasten. Bei zukünftigen Frame-Änderungen ruhige Tiere nicht künstlich durch neue Individuen ersetzen.

`INTERACTION_TERMS` in `quests.js` benennt Prädation, interspezifische Konkurrenz, Mutualismus, Herbivorie, Zoochorie, Detritivorie, Filtration und ökologische Nische. Die letzten beiden sind ausdrücklich als Ernährungsweise bzw. Konzept eingeordnet. Fachliche Wirkungen (+/−), benötigte Nachweise und Aussagegrenzen stehen in der Detailansicht. IDs/Speicherschlüssel bleiben bestehen. Neue Modell-Eltern werden vor dem ersten Frame aus körperlichen Hindernissen heraus platziert.

Die kompakte Anordnung von Forschungsauftrag und Nebentasten gehört zu `index.html`/`field.css`; Fernglas und Lupe haben größere Flächen. Gemeinsame Starttafel wurde angepasst. Zusätzliche Assertions im Küsten-/Leistungstest prüfen verkleinerte Fläche, alle Pflanzenarten, alle Einstiegspunkte, echte Böschungen und maßstäbliche Bäume. Desktop-Bildnachweis liegt unter `verification/` im Projektarchiv.

## Historische Tierbewegung in 0.7 (durch 0.9 ersetzt)
`wildlife-motion.js`: Persistenter Zustand `a.motion`, an echte Individuen-ID und Tieralter gebunden. Phasen aus zurückgelegter Strecke; stillstehende/blockierte Tiere bewegen nicht weiter ihre Füße. Stop-/Fress-/Flug-/Schwimmzustände weich einblenden, Wendeneigung und Kopfpose beruhigen. Keine gemeinsame Batch-Altersuniform mehr: Tod oder Neuaktivierung eines anderen Tiers darf die Bewegung nicht umschalten. Wiederverwendete Nachwuchsslots setzen ihren Bewegungszustand bei neuer ID zurück. Beobachtungs-/Fernglaszeit gilt auch für Animation.

`wildlife.js`: Anatomische Fox-/Hare-Gruppen liefern vier Hip-/Knie-Pivots. Andere Säuger und Vögel haben passende lokale Komponenten. `rigData` packt Part-ID und Gelenkpunkt, `rigJoint` Kniepunkt/Gewicht; diese statischen Attribute müssen beim Normalisieren genauso transformiert werden wie die Geometrie. `motionControls` überträgt Lauf-, Fress-, Flug- und Schwimmgewicht pro tatsächlich gezeichneter Instanz. Normalen und gerichtete Tiefenschatten verwenden dieselbe Gelenkpose (`customDepthMaterial`). Neue CPU-Bewegungsphasen vor dem Sichtfilter fortführen. Grenzen für Selektion konservativ erweitern.

Kleine Singvögel/Spechte können synchron mit beiden Beinen hüpfen; Watvögel laufen abwechselnd. Hare-Lauf blendet zum gebündelten Hinter-/Vorderbeinzyklus. Vogel-Flügel weicher entfalten, Flügelschlag und Gleitabschnitte pro Individuum; Insektenflügel, Robbenflossen und Fischschwanz ebenfalls bewegen. Werte sind gestalterische Näherungen, keine arttypisch gemessenen Frequenzen, vollständiges IK oder biomechanische Simulation. Hochwertige lizenzierte Skelettanimation bleibt ein nächster Schritt.

`ExpeditionEcology`: vorausschauende Hindernislenkung, gedämpfte Winkelgeschwindigkeit und kontinuierliches Bremsen an statischen Zielen. Kein wiederholtes hartes `speed *= 0.6` bei Ankunft. Beobachtungsprüfung ergänzt Stillstand/Blockade, kontinuierliche Halbzeit, weichen Fressübergang und neue Geburts-ID; Küstenprüfung bestätigt echte vierbeinige Fox-/Knieattribute. Alle sieben Prüfungen erneut bestanden. Frame-Diagnose zählt tatsächlich gerenderte Bilder; Statuswechsel Lesen/Gehen/Willkommen starten neue Messfenster. Keine Tablet-FPS-Garantie.

Abschlussprüfung der v0.7-Einzeldatei über HTTP, CSS ca. 477 × 450: Wiese 30 FPS, P95 34,9 ms, keine protokollierten Warnungen/Fehler. Deadline-basierte 30-FPS-Taktung vermeidet aufsummierte Abweichungen; längere Einzelbilder werden ohne Render-Burst übersprungen. Startup-/Regionsübergänge und physische Tablets bleiben gesondert zu prüfen.

Abschlussprüfung 0.8 über HTTP: Ranger-Startseite/Dropdown, alle acht Szenario-Ökosystemgruppen, gezielte Lupe auf Rotklee, Fernglas auf Steinhummel und tatsächlich abgeschlossener Bestäubungs-Paarauftrag (1/8), anschließender Wechsel zur freien Erkundung verifiziert. Keine Warnungen/Fehler protokolliert. Aktuelle Browser-Fernglas-Stichprobe P95 33,5 ms, FPS-Zähler mit UI-Wechseln 19 FPS; kein neuer stabiler 30-FPS-Nachweis. Desktop-CSS ca. 848 × 477, zusätzlicher Tablet-Aufruf intern ca. 678 × 508. Belege in verification/Ranger-Startseite.jpg und Ranger-Questbuch.jpg.

## Aktive Animationsdaten in 0.9
`prepareLegRig` liest transformierte Hüft-/Kniepunkte und `legFeet` aus der tatsächlichen Geometrie. `rigJoint.w`: 0 Oberbein, 1 Unterbein, 2 Pfote/Zehen. Primärbeine Part 1–4, weitere Arthropodenbeine Part 10–13, Zuordnung über `legSlots`. Bei Geometrieänderungen diese Punkte mittransformieren. Die Kontakthöhe wird aus der tatsächlichen untersten Sohlen-/Zehengeometrie abgeleitet, nicht aus der bloßen Gelenkhöhe. Distanzphasen auch für Millimeterarten mit ihrer tatsächlichen Schrittlänge berechnen; keine Zentimeter-Mindestschrittlänge setzen. `gaitData` ersetzt die zwei alten Einzelattribute. Drei gepackte `footTargetsA/B/C` enthalten vier lokale XYZ-Ziele; Ruhestellung/weitere Beinpunkte sind Art-Uniforms. Nicht wieder Sinusrotationen mit begrenzter Fußhöhe verwenden.

`a.motion.contacts` hält weltfeste Kontaktpunkte und Swing-Anfang/-Ziel. Der Sichtfilter darf die individuelle Distanzphase nicht stoppen. Bei neuer ID, Rückkehr nach Sichtpause und großer Ortskorrektur neu verankern. Für normale Geschwindigkeiten bleiben Standfüße auf Hängen/während Wendungen ortsfest. Große Zeit-/Geschwindigkeitssprünge dürfen die Knie nicht überstrecken. `WildlifeRenderer.updatePreview` kopiert Pose und Uhr des beobachteten Tiers in Uniforms; die normale Weltinstanz und deren Buffer werden dabei nicht verändert. `field-guide.js` beschreibt die mitbewegte Detailansicht.

`locomotion-check.mjs` prüft alle 84 gegliederten Arten bei 30 Hz: normale Gehgeschwindigkeit und Robustheitsfall 3,4 m/s, echte gerenderte Fußbuffer, Bodenkontakt auf einem Hang/bei Wendungen, Schweben der Schwungfüße, endliche/erreichbare Ziele, Stillstand, Sichtwiedereintritt, neue IDs und die Detailpose. Der hohe Stresswert ist kein biologischer Geschwindigkeitsanspruch für kleine Arten. Weitere Tests prüfen unverändert Simulation, Welt, Werkzeuge und Szenario-Nachweise.

## Browserprüfung 0.9
Die fertige Einzel-HTML über HTTP gestartet. Räuber-Beute-Szenario, Rotfuchs/Waldmaus im Wald, Karte zur Wiese und tatsächlich beobachtete Feldmaus geprüft. Die kleine Feldmaus zeigte eine mitbewegte Detailansicht; Fernglas behielt Tierzeit 0,5. Danach Fernglas geschlossen und zu Fuß weitergegangen. Keine protokollierten Warnungen/Fehler.

Kurze Desktop-Stichproben bei etwa 848 × 477 CSS-Pixeln: Fernglas 30 FPS, P95 34,4 ms, 3 gezeichnete Tiere; normales Gehen 30 FPS, P95 33,5 ms, 5 gezeichnete Tiere. Keine Aussage über Langzeit-/Wärmeverhalten oder physische Tablets. Alle Artmaterialien vor dem Start vorbereitet; separate Nahansicht von Fuchs, Hase, Krabbe und Käfer zur Kontrolle der Gelenkposen geprüft. Belege: Tierbewegungen-Nahansicht.jpg und Tierbewegungen-im-Spiel.jpg.

Neun automatisierte Prüfungen erfolgreich, 32 JavaScript-Dateien syntaktisch geprüft, alle 28 eingebetteten Module mit den aktuellen Quellen identisch. Die Bewegungsprüfung umfasst 84 gegliederte Arten bei 30 Hz, einschließlich Millimeterarten. Reale Standkontakte auf Hang/bei Wendungen bleiben innerhalb von 0,002 mm pro Bild ortsfest. Testausgaben liegen im Archiv; sehr hohe Testgeschwindigkeiten sind Robustheitsfälle, keine biologischen Messwerte.


Die isolierte Nahansicht `verification/Bewegungspruefung.html` nutzt dieselbe WildlifeRenderer-Pipeline. Für dieses Prüfwerkzeug HTTP ab Archivwurzel starten; sein HTML-Basispfad verweist auf `../dist/` einschließlich Materialien. Das ausgelieferte `Feldbuch.html` ist davon unabhängig.

## Datenvertrag der Änderungen in 0.10
`boardwalk-layout.js`: `BoardwalkLayout` stellt profilierte Höhen, verbreiterte Wegquerschnitte und `at(x,z)` bereit. Vor Landschaftsaufbau nach `reserveLandings` anlegen; alle Tafelhöhen daraus ableiten. Bodenfreiheit inklusive voller Ausbuchtungsbreite prüfen. Randhölzer nur auf Außenkanten, niemals quer durch die Hauptspur. Die Feld-Thementafeln bleiben als fachliche Quelldaten im Katalog, werden physisch nicht aufgebaut; Inhalte mit der zentralen Feldstation zusammenführen.

Bäume tragen tatsächliche `perches` in Weltkoordinaten; `expedition-state` überträgt sie habitatlokal an Nahrungspatches. `birdDestination`, 4-m-Raster, Höhenprüfung beim Landen und `settleBirdStarts` bewahren individuelle IDs. Letztere korrigiert ausschließlich kleine Kontaktüberschneidungen beim Moduswechsel. `birdAirborne` verwendet Tätigkeit und Stützhöhe statt pauschal der Flughöhe. Fußkontakt auf Ästen berücksichtigt die Stützhöhe. Keine körperliche Überlagerung mit einem belegten Landeplatz zulassen.

`binocularAperture` begrenzt das größere Fangfeld durch den sichtbaren Bildwinkel. Tierzeit nur einmal über `animalTimeStep` halbieren; Anzeige, Detailpose und Flügelzeit übernehmen dasselbe Akteursalter. Beobachtungszeit und Tide bleiben unabhängig. `updateKnownLabels` liefert in der Lupe keine Hintergrundetiketten; `FocusMarker` benennt weiterhin die konkret fokussierte bekannte Pflanze.

`faceSample`, `showSampling`, `sampleLowTide`: Hinführung vor Grabdialog, erreichbare Tiefentasten und genaue Fehlermeldungen. `WattSurvey.canDig` bleibt für echte Entfernung und Wasserstand verantwortlich. Nie zugunsten bedienbarer Tasten die Grabbedingungen umgehen oder Arten automatisch bestimmen. `route-birds-check` ist die zehnte Prüfung und enthält die tatsächlich gemessene Halbzeitstrecke sowie neue Weg-/Vogelprüfungen.
