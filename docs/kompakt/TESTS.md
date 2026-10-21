# Prüfprotokoll Kompakt

## Baseline

Unveränderter main a6c5c8e in isoliertem Git-Test-Worktree: 26/26 Node-Prüfreihen; Webbuild/-Integrität, Einzel-HTML und 5/5 Python-Pakettests neu ausgeführt, erfolgreich. Historische frühere PR-Ergebnisse werden nicht als eigene neue Läufe gezählt. Logs: work/compact-baseline/.

Erster früher Paketlauf gegen den Arbeitsbaum: 2/5 fehlgeschlagen, weil neue Clock-/Parsermodule bereits im Quellgraphen lagen, die Paketdateien aber noch vom alten Graphen stammten. Kein bestandenes Ergebnis daraus abgeleitet. Neue Builds müssen vor Pakettests laufen.

## Reproduzierbare Kommandos

```sh
python tools/run-checks.py
python tools/build-web.py
python tools/verify-web.py
python tools/build-standalone.py
python -m unittest discover -s tests -p 'test_*.py' -v
node tests/kompakt-check.mjs
python tools/build-compact.py
python tools/browser-compact.py
python tools/package-project.py
```

Node26/Python5 betreffen die große Fassung und gemeinsame APIs, neue Kompaktprüfungen den separaten Einstieg. Browserergebnisse und tatsächliche Screenshots werden nach dem Lauf ergänzt. Keine Laufzeit-Assertions/Timeouts der alten Missionsprüfungen gelockert.

## Offen / keine Zertifizierung

Visuelle/fachliche Eigentümerfreigabe nach Phase 2; alle 36 aktiven Organismen und K1–K5; reales Mindestgerät, Safari/iPad/Mac, 20-Minuten-Hardwaretest und Unterrichtspilot. Eine Viewportprüfung ersetzt keine Gerätezertifizierung. Reine berechnete Gehzeit ist keine gemessene Lernzeit.

## Neue Vertragsprüfungen

14 Node-Fallgruppen: Manifest/36 Verträge, Route/Abkürzung/Gehhöhe, sämtliche Deckflächen einschließlich Verzweigungen ohne Überlappung sowie tatsächliche Renderdreiecke/Indexe/UVs/Normalen, Tastatur-/Touchprofil und alte Standardwerte, aktive Uhr, drei Seeds und Stützenverlust, atomare Importe/Quota, korrupter Speicher, vollständige Archive, GLB-Meter-/Rig-/Fußvertrag und historischer M3-Vergleich mit anderen Individuen, Kontextwiderspruch, Überlappung und kurzen gültigen Daten. Die verformten tatsächlichen Reh-Hufvertices werden über eine Bewegungsfolge auf Bodenkontakt geprüft; beim Specht müssen Schnabelrichtung und Körperflugrichtung übereinstimmen und die Füße bei Landung an die Stammkontaktpose zurückkehren. Vier zusätzliche Python-Pakettests prüfen Inhaltsabschluss, Manipulation, Standalone-Rückvergleich/JavaScript-Syntax und ZIP-Identität.

Lokaler erster formaler Browserstart scheiterte am fehlenden Playwright-FFmpeg, noch vor einer Spielprüfung. Der Treiber erfasst Video nur bei vorhandenem Werkzeug; echte Bilder bleiben Pflicht. Ein anschließender Lauf startete die Welt, scheiterte jedoch beim ersten Screenshot nach 45 Sekunden unter Softwaregrafik und gleichzeitig laufenden Node-Physikprüfungen. Kein JavaScriptfehler protokolliert; dies ist kein bestandener Browserlauf. Die Bild-/Funktionsprüfung wird nach Ende der CPU-Prüfungen getrennt wiederholt. Timeout und fachliche Assertions wurden nicht gelockert.

Der getrennte Browserlauf bestand Start/Ladegraph und erreichbare Starttafel, fand anschließend einen echten Eingabefehler: Der verzögert eintreffende native `dialog.close`-Handler löschte die gerade nach dem Schließen neu gedrückte Bewegungstaste. Der direkte Schließpfad hatte die alte Eingabe bereits synchron gelöscht. Die doppelte verzögerte Eingabelöschung wird entfernt; die Bewegungsaussage bleibt unverändert streng. Vorher-Datensatz in verification/kompakt/attempts/local-movement-before.json. Erneute Browserprüfung folgt auf diesem korrigierten Stand.

Ein weiterer Browserversuch kam bis zu den Referenzbildern und meldete danach einen Specht-Timeout. Die vollständige Fehlerauswertung fand jedoch wiederholte `terrainHeight is not defined`-Fehler: Beim Tierfokus fehlte der Import in compact/main.js. Dadurch wurden nach dem Werkzeugwechsel die Diagnosedaten und die Darstellung nicht mehr aktualisiert. Die erste Einordnung als alleiniger Annäherungs-/Softwaregrafikfehler war unvollständig und ist hier korrigiert. Der fehlende Import wird ergänzt. Der Browser prüft beide Werkzeuge jetzt direkt nach dem Start und scheitert bei Laufzeitfehlern sofort; frühere Bildblöcke dieses Laufs gelten nicht als fehlerfrei bestanden. Vorher-Datensatz mit verdichteten Fehlerhäufigkeiten (Rohfassung in Commit 811c056): verification/kompakt/attempts/local-bird-wait-before.json.

Zusätzlich wartet der Bildtreiber auf eine gerenderte Revisionskennung für Kamera-/Werkzeugwechsel. Frühere unmittelbare Screenshots sind keine verlässlichen Zoomnachweise. Die Annäherung an den Specht erfolgt über echte Eingaben bis zum tatsächlichen Startzustand, nicht über eine angenommene Modellstrecke aus 1,5 Sekunden Wandzeit. Kein Timeout wurde angehoben und keine Weltzeit injiziert. Bewegungsnachweise werden über den browserinternen MediaRecorder erfasst, ohne ein fehlendes Playwright-FFmpeg als benutzt auszugeben.

Zwischenstand 7484ed4: vollständiger lokaler Chromium-Lauf mit 16 Blöcken und ohne JavaScriptfehler erfolgreich. Reale Tastatur-/Touchbewegung, eigener Pflanzenbeleg/Download/Neuladen/Archive, Bilder, native Flug-/Bewegungsvideos, Geometriekontakt, Tabletviewport, WebGL-Verlust, Assetfehler und korrupter Speicher geprüft. Nachgelagerte Änderungen verbessern die Spechtpose und sichtbare Quota-Meldungen; der vollständige finale Lauf erfolgt erneut.

Späte gezielte Absicherung: Die frühere pauschale Ausnahme für die letzten 40 cm eines Sichtstrahls konnte ein Tier unmittelbar hinter einem Stamm fälschlich zulassen. Sie wurde durch Segmenttests gegen den tatsächlichen geneigten/verjüngten Stamm und massive Hauswände ersetzt. Negativ-/Positivfälle sowie derselbe Specht von verdeckter und freier Stammseite werden geprüft. Sein Darstellungsmaß wurde auf rund 24 cm aus dem bestehenden Katalog abgeglichen; auch die Fokusposition folgt der tatsächlichen Körpermitte. Die vorherigen kompletten Browser-/Standalone-Läufe bleiben als Zwischenstand erhalten; der korrigierte Stand wird erneut geprüft.
