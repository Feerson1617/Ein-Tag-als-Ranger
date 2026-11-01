# Visuelle und didaktische Endkorrektur – Prüfgrundlage

Auftrag: Nutzerpaket `Ranger-Kompakt-Optik-Nachbesserung-Codex-klein.zip`, SHA-256 `15db322827d8c00eae3ba717ed7afa21bfc9c45a6b7078d27a763db5b85089b7`. Die darin tatsächlich enthaltene Anweisung heißt `Codex-Auftrag.txt`; die im Begleittext genannte längere TXT-Datei fehlt. Ausgangscommit ist `6cd1c901365575da928d5f723ed0d68a7c9ad50f`. Entwicklungsbranch und Draft-PR #3 bleiben erhalten. Kein Merge, Deployment, Release oder LMS-Upload.

## Umsetzung und Ursachen

- Sieben Vögel: zusammenhängende Rumpf-/Flügelkonturen, kleinere Köpfe/Augen, variable Halsquerschnitte, Federfächer statt Schwanzstäben. Artspezifische Schulter-, Wangen-, Bauch-, Flügel- und Unterschwanzzeichnung. Der aktive Waldspecht besitzt einen eigenen Renderer und wurde dort ebenfalls korrigiert. Die verbreiterte Löfflerspitze bleibt am originalen Kontaktpunkt.
- Reh und Fuchs: lokal neu erzeugte CC0-GLBs mit durchgehenden Körperkonturen, schmalerem Fang und angepassten Extremitäten. Beim alten Export begrenzten Blender-Farbattribute negative Gelenkkoordinaten auf null. Der neue Export verschiebt die Werte vorübergehend in den positiven Bereich und dekodiert anschließend die unveränderten FLOAT-Accessors. Fuchsbeckenhöhe berücksichtigt die tatsächliche IK-Reichweite; Laufphase folgt zurückgelegtem Weg. Kein Austausch von biologischen Akteuren oder Bewegungszielen.
- Waldmaus: schmaler spitzer Kopf, kleinere Augen/Ohren, gegliederte kleine Füße. Die 9,5 cm Kataloglänge wird als Kopf-Rumpf-Maß umgesetzt; der Schwanz kommt hinzu. Die Form allein trennt Wald- und Gelbhalsmaus nicht sicher.
- Kleine Tiere: durchgehende Raupen-/Wurmkonturen, flacher Zeckenkörper, birnenförmige Blattlaus, Hummelkörper mit zwei Flügelpaaren und breiterer Krabbenpanzer. Vorhandene Bein-, Punkt-, Rippen-, Scheren- und Segmentverträge bleiben erhalten. Die Zecke hatte bereits acht Beine.
- Eiche: echte gerundete Blattlappen und geöhrter Grund; Buche bleibt unterscheidbar. Waldkräuter erhalten begrenzte deterministische Biegungsvarianten in den vorhandenen Standortzellen. Zunderschwamm als hinten ansetzende hufförmige Konsole mit Porenunterseite. Keilmelden-Blattgeometrie unverändert.
- Detailkamera: Perspektivabstand aus den tatsächlichen sichtbaren animierten Meshgrenzen und realer Beute statt pauschaler Rumpfradien. Ganze Vogelübersicht und Kontaktansicht reagieren auf ihr tatsächliches Seitenverhältnis. Vergrößerte Ansicht für den LMS-Rahmen, Hintergrundbedienung währenddessen verborgen; Schließen setzt die Vergrößerung zurück.
- Drehbare Inspektion: vergrößerbare Fläche, unveränderte aktive 2,5-Sekunden-Beobachtung und Rücksetzung beim Drehen. Nur lesbare Individuen-/Positionsherkunft für den Prüflauf; keine zusätzlichen Belege.
- Welt: begrenzte Stamm-/Krautvarianz, zurückhaltender Wasserfarb-/Rauheitsabgleich, kleinere NPC-Kopf-/Gesichtsproportionen. Keine zusätzlichen Pflanzen, NPC-Dialoge, Kollisionsänderungen, Missionen oder neuen Biome.

## Abnahmeverfahren

`verification/kompakt-endkorrektur/baseline-audit.json` wurde vor den Modelleingriffen angelegt. Es unterscheidet historischen Referenzblick und noch ausstehende native Sichtbarkeit. `morphology-sources.json` ergänzt eigene kurze Paraphrasen tatsächlich gelesener Fachseiten für alle 36 Taxa, einschließlich Grenzen bei Gras-/Gruppenbestimmungen. Quellenzugriff ist keine empirische Größenkalibrierung.

Die bestehenden Testdateien und ihre Assertions bleiben unverändert. Neue Prüfungen ergänzen sie:

- `tests/compact-anatomy-framing-check.mjs`: geschlossene nach außen orientierte Profile, tatsächliche Fuchs-Gelenkgeometrie über 180 Hanglauf-Frames und über 119.000 Projektionen animierter Vogel-/Kopf-/Beutegrenzen bei vier Seitenverhältnissen; erhaltene Merkmalszahlen.
- `tools/browser-compact-native-gallery.py`: ursprüngliche 38-Aufnahmen-Inventarassertions, normale W-/Mauseingaben vom Start, reguläres Fernglas/Lupe, dieselben aktiven Individuen in vergrößerter Inspektion, Referenzkamera-Klickzahl null. Fokus-Übereinstimmung wird separat protokolliert. Geplanter Weg und lesbare Koordinaten steuern den Prüfer, nicht das Spiel. Das belegt technische Erreichbarkeit, keine selbstständige Orientierung von Schülerinnen und Schülern.
- `tools/browser-compact-anatomy-ui.py`: 600×375, 768×1024 und 600×300, echte Touchbewegung, Scrollrad und Escape/Fokusrückkehr. Referenzkamera und öffentliche Modellschritte sind hier ausdrücklich UI-Testfixtures, keine unbeschleunigten Lernendenbelege.
- Native K1–K5-Prüfung mit unveränderten positiven/negativen Assertions; vier regulär gesicherte unbeschleunigte Fressereignisse, echte WebM-Aufnahmen, individuelle Run-/Beute-/Ereignis-ID und wiederverwendbarer Feldbuchexport.
- Originale 20-Minuten-Stabilität, WebGL-Wiederherstellung, Datei-/Offlinebetrieb, 360°-Himmel, gleiche Referenzkameras und Modellzeiten, getrennte Vorher-/Nachher-Softwaregrafikprofile.
- Bestehender Universal-SCORM-Export, tatsächlicher ZIP-Start in Chromium/WebKit, erneut heruntergeladene ZIP mit Hash-/Manifest-/Ein-SCO-Prüfung. Getrennte Belegartefakte vermeiden den 32-MiB-Downloadgrenzwert.

Die beiden Workflows `ranger-rc-acceptance.yml` und `ranger-scorm.yml` prüfen den gepushten Commit neu. Erst ihre tatsächlichen Resultate und der heruntergeladene Export bilden den abschließenden Abnahmebericht; dieses Dokument behauptet keinen vorweggenommenen grünen Lauf. Der nach dem Build erzeugte Bericht samt Hashmanifest liegt beim Releasekandidaten in `outputs/` und trägt dessen konkreten Commit.

## Grenzen und erhaltene Fehlbefunde

Die Modelle bleiben vereinfachte Echtzeitgeometrien. Naturtreue wird nicht pauschal als bestanden bewertet. Ein gelungenes Diagnosemerkmal ist keine unabhängige taxonomische oder pädagogische Validierung. Die endgültige Tabelle führt Körperform/Merkmale, Welt-Sichtbarkeit, Nahansicht, Bewegung und diagnostische Brauchbarkeit getrennt.

Lokale Zwischenprüfungen bleiben in `work/optik-endkorrektur/`: ein konkurrierender Browserlauf blockierte die native Eingabeprüfung; der isolierte Durchlauf wurde separat begonnen. Ein UI-Zwischenlauf fand beim erneuten Öffnen einen beibehaltenen Vergrößerungszustand. Nach dessen Korrektur zeigte die visuelle Kontrolle noch durchscheinende Landschaftsbedienelemente; diese sind während der vergrößerten Ansicht ausgeblendet. Eine bestandene Rechteckprüfung allein wurde nicht als visuelle Freigabe behandelt. Keine ursprüngliche Assertion oder Zeitgrenze wurde dafür abgeschwächt.

**NICHT GEPRÜFT:** physisches Schul-iPad/iPadOS-Safari, realer itslearning-Import, Unterrichtseinsatz, hardwarebeschleunigter GPU-Vorher-/Nachher-Vergleich und unabhängige unbekannte Artenbestimmung durch Lernende. Die Umgebung besitzt keine bereitgestellte Hardware-GPU. SwiftShader-Messungen werden als solche mit roten Werten ausgewiesen, nicht als Tablet-FPS-Zertifikat.
