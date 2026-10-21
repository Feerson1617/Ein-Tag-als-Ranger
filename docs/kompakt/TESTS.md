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

11 Node-Fallgruppen: Manifest/36 Verträge, Route/Abkürzung/Gehhöhe, sämtliche Deckflächen einschließlich Verzweigungen ohne Überlappung, Tastatur-/Touchprofil und alte Standardwerte, aktive Uhr, drei Seeds und Stützenverlust, atomare Importe/Quota, korrupter Speicher, vollständige Archive, GLB-Meter-/Rig-/Fußvertrag und historischer M3-Vergleich mit anderen Individuen, Kontextwiderspruch, Überlappung und kurzen gültigen Daten. Vier zusätzliche Python-Pakettests prüfen Inhaltsabschluss, Manipulation, Standalone-Rückvergleich/JavaScript-Syntax und ZIP-Identität.

Lokaler erster formaler Browserstart scheiterte am fehlenden Playwright-FFmpeg, noch vor einer Spielprüfung. Der Treiber erfasst Video nur bei vorhandenem Werkzeug; echte Bilder bleiben Pflicht. Ein anschließender Lauf startete die Welt, scheiterte jedoch beim ersten Screenshot nach 45 Sekunden unter Softwaregrafik und gleichzeitig laufenden Node-Physikprüfungen. Kein JavaScriptfehler protokolliert; dies ist kein bestandener Browserlauf. Die Bild-/Funktionsprüfung wird nach Ende der CPU-Prüfungen getrennt wiederholt. Timeout und fachliche Assertions wurden nicht gelockert.

Der getrennte Browserlauf bestand Start/Ladegraph und erreichbare Starttafel, fand anschließend einen echten Eingabefehler: Der verzögert eintreffende native `dialog.close`-Handler löschte die gerade nach dem Schließen neu gedrückte Bewegungstaste. Der direkte Schließpfad hatte die alte Eingabe bereits synchron gelöscht. Die doppelte verzögerte Eingabelöschung wird entfernt; die Bewegungsaussage bleibt unverändert streng. Vorher-Datensatz in verification/kompakt/attempts/local-movement-before.json. Erneute Browserprüfung folgt auf diesem korrigierten Stand.
