# Prüfprotokoll Kompakt

## Abschließender technischer Stand

Getestete Runtime: `2326283ab01fbb25644f82e3cada26d9a2b509ea`. Lokaler Chromium 154.0.8037.57, Node 24.19.0, Python 3.12.14. Nachfolgende Nachweisdokumentation ändert keine Runtimequellen; das Abnahmepaket vergleicht jeden Quellhash.

| Prüfung | Ergebnis |
|---|---|
| Bisherige Node-Reihen | 26/26 erfolgreich |
| Neue Kompakt-Fallgruppen | 14/14 erfolgreich |
| Python-Pakettests (bisherige + neue) | 9/9 erfolgreich |
| Kompakt-Chromium über Projektpfad | 18 Blöcke erfolgreich, keine JavaScriptfehler |
| Einzel-HTML | 5 Blöcke erfolgreich, darunter neun unbeschriftete WebGL-Direktaufnahmen |
| Große Fassung: Chromium-Smoke | 2 Blöcke erfolgreich, Viewport [600, 375] |

Die vollständigen alten Live-Missionsabschlüsse wurden in diesem Kompakt-Schritt nicht neu im Browser erworben; ihre Logik-/Import-/Speicherprüfungen sind in den 26 Reihen enthalten. Die früheren vollständigen CI-Ergebnisse sind historische Nachweise. Neue GitHub-Actions-Läufe sind mangels freigegebenem Remote-Push ausstehend.

Bild- und Videoquellen: `verification/kompakt/`, `SUMMARY.json` und `final-result.json`. Die Direktaufnahmen sind unveränderte WebGL-PNGs ohne DOM-Beschriftung; Canvas-Videos zeigen echte Modellbewegung. FFmpeg/FFprobe werden nur zur Formatprüfung bzw. zeitgleichen H.264-Kompatibilitätskopie verwendet. Keine generierten Zielbilder als Implementierungsbelege.

Offen bleiben visuelle/fachliche Eigentümerfreigabe, differenzierte Baum-Nahbestimmung, Quellenlücken, reales Mindestgerät/Safari/iPad/Mac, 20-Minuten-Hardwarelauf und Unterrichtspilot. Laufzeit langer Cloudprüfungen ist kein Nachweis dafür.

## Baseline

Unveränderter main a6c5c8e in isoliertem Git-Test-Worktree: 26/26 Node-Prüfreihen; Webbuild/-Integrität, Einzel-HTML und 5/5 Python-Pakettests neu ausgeführt, erfolgreich. Historische frühere PR-Ergebnisse werden nicht als eigene neue Läufe gezählt. Gesicherte Logs: verification/kompakt/baseline/.

Erster früher Paketlauf gegen den Arbeitsbaum: 2/5 fehlgeschlagen, weil neue Clock-/Parsermodule bereits im Quellgraphen lagen, die Paketdateien aber noch vom alten Graphen stammten. Kein bestandenes Ergebnis daraus abgeleitet. Neue Builds müssen vor Pakettests laufen.

## Reproduzierbare Kommandos

```sh
python tools/run-checks.py
python tools/build-web.py
python tools/verify-web.py
python tools/build-standalone.py
node tests/kompakt-check.mjs
python tools/build-compact.py
python tools/verify-compact.py
python -m unittest discover -s tests -p 'test_*.py' -v
python tools/browser-compact.py
python tools/browser-compact.py --site outputs --entry Ranger-Kompakt.html --smoke
python tools/browser-check.py --smoke --width 600 --height 375 --site outputs/GitHub-Pages --prefix /Ein-Tag-als-Ranger/
python tools/package-project.py
python tools/package-compact-review.py
```

Die 26 bisherigen Node-Reihen und fünf der neun Python-Methoden betreffen die große Fassung und gemeinsame APIs; die neuen Kompaktprüfungen betreffen den separaten Einstieg. Die Browserwerkzeuge benötigen Playwright und Chromium, die Python-Pakettests Pillow. Lokale Ergebnisse und tatsächliche Screenshots stehen oben und in verification/kompakt/. Keine Laufzeit-Assertions/Timeouts der alten Missionsprüfungen gelockert.

## Offen / keine Zertifizierung

Visuelle/fachliche Eigentümerfreigabe nach Phase 2; alle 36 aktiven Organismen und K1–K5; reales Mindestgerät, Safari/iPad/Mac, 20-Minuten-Hardwaretest und Unterrichtspilot. Eine Viewportprüfung ersetzt keine Gerätezertifizierung. Reine berechnete Gehzeit ist keine gemessene Lernzeit.

## Neue Vertragsprüfungen

14 Node-Fallgruppen: Manifest/36 Verträge, Route/Abkürzung/Gehhöhe, sämtliche Deckflächen einschließlich Verzweigungen ohne Überlappung sowie tatsächliche Renderdreiecke/Indexe/UVs/Normalen, Tastatur-/Touchprofil und alte Standardwerte, aktive Uhr, drei Seeds und Stützenverlust, atomare Importe/Quota, korrupter Speicher, vollständige Archive, GLB-Meter-/Rig-/Fußvertrag und historischer M3-Vergleich mit anderen Individuen, Kontextwiderspruch, Überlappung und kurzen gültigen Daten. Die verformten tatsächlichen Reh-Hufvertices werden über eine Bewegungsfolge auf Bodenkontakt geprüft; beim Specht müssen Schnabelrichtung und Körperflugrichtung übereinstimmen und die Füße bei Landung an die Stammkontaktpose zurückkehren. Vier zusätzliche Python-Pakettests prüfen Inhaltsabschluss, Manipulation, Standalone-Rückvergleich/JavaScript-Syntax und ZIP-Identität.

Lokaler erster formaler Browserstart scheiterte am fehlenden Playwright-FFmpeg, noch vor einer Spielprüfung. Der Treiber erfasst Video nur bei vorhandenem Werkzeug; echte Bilder bleiben Pflicht. Ein anschließender Lauf startete die Welt, scheiterte jedoch beim ersten Screenshot nach 45 Sekunden unter Softwaregrafik und gleichzeitig laufenden Node-Physikprüfungen. Kein JavaScriptfehler protokolliert; dies ist kein bestandener Browserlauf. Die Bild-/Funktionsprüfung wird nach Ende der CPU-Prüfungen getrennt wiederholt. Timeout und fachliche Assertions wurden nicht gelockert.

Der getrennte Browserlauf bestand Start/Ladegraph und erreichbare Starttafel, fand anschließend einen echten Eingabefehler: Der verzögert eintreffende native `dialog.close`-Handler löschte die gerade nach dem Schließen neu gedrückte Bewegungstaste. Der direkte Schließpfad hatte die alte Eingabe bereits synchron gelöscht. Die doppelte verzögerte Eingabelöschung wird entfernt; die Bewegungsaussage bleibt unverändert streng. Vorher-Datensatz in verification/kompakt/attempts/local-movement-before.json. Erneute Browserprüfung folgt auf diesem korrigierten Stand.

Ein weiterer Browserversuch kam bis zu den Referenzbildern und meldete danach einen Specht-Timeout. Die vollständige Fehlerauswertung fand jedoch wiederholte `terrainHeight is not defined`-Fehler: Beim Tierfokus fehlte der Import in compact/main.js. Dadurch wurden nach dem Werkzeugwechsel die Diagnosedaten und die Darstellung nicht mehr aktualisiert. Die erste Einordnung als alleiniger Annäherungs-/Softwaregrafikfehler war unvollständig und ist hier korrigiert. Der fehlende Import wird ergänzt. Der Browser prüft beide Werkzeuge jetzt direkt nach dem Start und scheitert bei Laufzeitfehlern sofort; frühere Bildblöcke dieses Laufs gelten nicht als fehlerfrei bestanden. Vorher-Datensatz mit verdichteten Fehlerhäufigkeiten (Rohfassung in Commit 811c056): verification/kompakt/attempts/local-bird-wait-before.json.

Zusätzlich wartet der Bildtreiber auf eine gerenderte Revisionskennung für Kamera-/Werkzeugwechsel. Frühere unmittelbare Screenshots sind keine verlässlichen Zoomnachweise. Die Annäherung an den Specht erfolgt über echte Eingaben bis zum tatsächlichen Startzustand, nicht über eine angenommene Modellstrecke aus 1,5 Sekunden Wandzeit. Kein Timeout wurde angehoben und keine Weltzeit injiziert. Bewegungsnachweise werden über den browserinternen MediaRecorder erfasst, ohne ein fehlendes Playwright-FFmpeg als benutzt auszugeben.

Zwischenstand 7484ed4: vollständiger lokaler Chromium-Lauf mit 16 Blöcken und ohne JavaScriptfehler erfolgreich. Reale Tastatur-/Touchbewegung, eigener Pflanzenbeleg/Download/Neuladen/Archive, Bilder, native Flug-/Bewegungsvideos, Geometriekontakt, Tabletviewport, WebGL-Verlust, Assetfehler und korrupter Speicher geprüft. Nachgelagerte Änderungen verbessern die Spechtpose und sichtbare Quota-Meldungen; der vollständige finale Lauf erfolgt erneut.

Späte gezielte Absicherung: Die frühere pauschale Ausnahme für die letzten 40 cm eines Sichtstrahls konnte ein Tier unmittelbar hinter einem Stamm fälschlich zulassen. Sie wurde durch Segmenttests gegen den tatsächlichen geneigten/verjüngten Stamm und massive Hauswände ersetzt. Negativ-/Positivfälle sowie derselbe Specht von verdeckter und freier Stammseite werden geprüft. Sein Darstellungsmaß wurde auf rund 24 cm Entwurfsmaß am bestehenden Katalogwert von 23 cm orientiert; auch die Fokusposition folgt der tatsächlichen Körpermitte. Die vorherigen kompletten Browser-/Standalone-Läufe bleiben als Zwischenstand erhalten; der korrigierte Stand wird erneut geprüft.

Die Sichtprüfung berücksichtigt zusätzlich die tatsächlichen undurchsichtigen Szenenmeshes (Äste, Tafeln, Totholz, Häuser und Bohlenflächen), damit eine analytische Stammprüfung keine Sicht durch andere massive Gegenstände zulässt. Prüfansichten wählen eine tatsächlich freie Kamera-/Laufposition. Schilder und Totholz erhalten Spielerkollision. Der Browserprüfer verlangt vor dem Start einen mit aktuellen Modulen, Medien, CSS und HTML übereinstimmenden Build; bei der Einzeldatei werden die eingebetteten Quellen zusätzlich vor dem Browserstart abgeglichen.

Nach dem Umgebungsneustart wurde ein Testtreiberfehler sichtbar: Die Bewegungsmessung las nach dem Wechsel der Prüfansicht noch einen Diagnosestand des vorherigen Renderframes. Der Spieler bewegte sich tatsächlich, aber der Distanzvergleich enthielt den Ansichtswechsel. select_view wartet jetzt auf die bereits vorhandene gerenderte Revisionskennung, bevor eine Messung beginnt. Die Geschwindigkeitsassertion wurde unverändert beibehalten. Vorher-Datensatz: attempts/stale-movement-baseline.json. Ein durch den Cloud-Neustart beendeter Lauf ist separat als unterbrochen dokumentiert.

Ein weiterer Umgebungsneustart beendete den abschließenden Legacy-Smoke nach dem Startblock. Der unterbrochene Lauf ist in attempts/legacy-smoke-environment-interrupted.log erhalten. Der erneute Lauf mit 600 × 375 Pixeln bestand beide unveränderten Smoke-Blöcke; fachliche Assertions und Timeouts wurden nicht geändert.
