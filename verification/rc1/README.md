# Ranger 1.0.0-rc.1 – technische Nachweise vom 21.10.2026

Diese Daten stammen aus der aktuellen Cloud-Umgebung. Browser: Chromium
154.0.8037.57 mit SwiftShader. Alle Bilder sind tatsächliche Browseraufnahmen.
Keine Hardware-/Unterrichtsfreigabe und keine biologische Gesamtvalidierung.

- `node-checks.json`: abschließende 26 Prüfreihen, Codecommit `a4e4db7`, alle bestanden.
- `packaging-checks.txt`: fünf Python-Prüfmethoden, alle bestanden.
  Der abschließende Werkzeugtest vergleicht zusätzlich zwei Hashseeds für
  identische Einzel-HTML-Bytes; der Spielcode ist dabei unverändert.
- `web-verification.json`: gehashtes Kandidatenpaket; Identität einschließlich
  damaliger uncommitteter Änderungen ausgewiesen. Das finale saubere Paket erhält
  nach dem Berichtscommit seine eigene Bindung in `build-manifest.json`.
- `live-m1-m2-and-test-driver.txt`: M1/M2 aus der laufenden Szene erreicht. Danach
  scheiterte der Testtreiber an einem bereits offenen Dialog; dies ist kein
  vollständig grüner Gesamtlauf. M1 enthält eine begründete unsichere
  Rotbuchen-Zuordnung. Die historische Logzeile „two features each“ ist dafür
  ungenau und wird nicht als sichere Artbestimmung ausgelegt.
- `chromium-m3-and-ui.json` / `live-m3-and-ui.txt`: früherer grüner UI-/M3-Lauf.
  Noch kein Nachweis der später explizit geprüften tatsächlichen Filtrationsaktivität.
- `pages-m3-live-and-ui.json` / `.txt`: nach der Probenmodellkorrektur; echte
  Ruhe/Filtration derselben lebenden Individuen bei gleicher Tiefe unter
  `/Ein-Tag-als-Ranger/`; neun Blöcke bestanden. `pages-*.png` gehören dazu.
- `pages-resilience.json`: fünf Blöcke; echter Grafikverlust/Wiederherstellung,
  abgefangener Modelldownloadfehler und sichtbarer Speicherfehler. Quota wird nach
  einem Hänger der kombinierten Instanz in einem frischen Browser geprüft.
  Erwartete Fehlerinjektionen sind getrennt protokolliert; die Bilder
  `context-*`, `asset-failure.png`, `storage-failure.png` gehören zu diesen Fällen.
- `quota-isolated.json`: zusätzliche isolierte Bestätigung der sichtbaren
  Speichermeldung; kein Ersatz für einen allgemeinen Gerätestabilitätsnachweis.
- `standalone-browser.json` / `.txt` / `standalone-*.png`: endgültiger Codecommit
  `a4e4db7`, echter Start und zurückgestellt dekodiertes Kohlmeisenfoto in der
  Einzel-HTML. Kein externer Assettransfer.
- `fresh-python-install.txt`: Installation in frischer venv ohne geerbte
  Systempakete; keine Änderung der TLS-Prüfung.

Import-/Formularfälle nutzen ausdrücklich synthetische Testdaten. Live-Missionen
werden im Protokoll separat als live bezeichnet. Keine echten Schülerdaten.

Reproduktion steht in `docs/DEVELOPMENT.md`. Wesentliche Befehle:

```sh
python3 tools/run-checks.py
python3 tools/build-web.py
python3 tools/verify-web.py
python3 tools/build-standalone.py
python3 -m unittest discover -s tests -p 'test_*.py' -v
python3 tools/browser-check.py --live --width 800 --height 500 --site outputs/GitHub-Pages --prefix /Ein-Tag-als-Ranger/
python3 tools/browser-check.py --smoke --resilience --width 800 --height 500 --site outputs/GitHub-Pages --prefix /Ein-Tag-als-Ranger/
python3 tools/browser-check.py --smoke --width 800 --height 500 --site outputs --entry Feldbuch.html
```

Die Node-Prüfung erzeugt die benötigten synthetischen Formularfixtures. Browser
und Pythonabhängigkeiten müssen gemäß Entwicklungsanleitung installiert sein.
Ergebnisse unter `work/` sind laufbezogen.

Mindestgerät/30 FPS/p95/20-Minuten-Test, physisches iPad/Safari, Unterrichtspilot
und vollständige Primärquellen-/Rechteprüfung bleiben offen. Mehrsekündige
Bildabstände im Cloud-Software-Renderer erfüllen das FPS-Ziel nicht.
GitHub-Actions wurden inzwischen auf einem frischen Runner bestanden; der
frühere Fehllauf bleibt ausdrücklich dokumentiert.
Kein Merge, kein Deployment und keine Live-Veröffentlichung.


## Zusätzliche vollständige Abläufe

`all-missions-browser.json` / `.txt` und `all-missions-*.png`: alle drei Missionen
in einem frischen lokalen Browserprofil auf dem sauberen Commit `5a1a11a`,
anschließend alle Formular-/Import-/Bedienpfade. Elf Blöcke bestanden, keine
JavaScript-, Konsolen- oder HTTP-Fehler. M1/M2/M3: 399,62 / 238,01 / 264,80
automatisierte Sekunden, keine Schülerzeiten. 7,66 s bis Startfreigabe,
26.674.136 Bytes Ersttransfer einschließlich Navigation. Chromium 154/SwiftShader,
800×500; nachfolgende Layoutprobe 1024×768. Softwareleistung erfüllt das FPS-Ziel
weiterhin nicht.

`github-ci.json`: unabhängiger frischer GitHub-Runner; vollständige Pipeline und
elf Browserblöcke bestanden. Getesteter PR-Head `5a1a11a`, von Actions erzeugter
Mergecommit `aa2a9c2`. M1/M2/M3: 294,71 / 164,89 / 180,02 automatisierte Sekunden.
Die kompakte Check-Annotation ist über die GitHub-API abgerufen worden; vollständige
Log-/Artefaktdownloads sind aus dieser Cloud per Egress-403 gesperrt.

Der frühere Run 39595902666 ist im Browserteil fehlgeschlagen. Seine konkrete
Ursache ist ohne die Originalprotokolle nicht gesichert. Zwischen dem fehlgeschlagenen
und dem bestandenen CI-Lauf wurde nur die Ausgabe von Diagnoseannotationen
ergänzt, kein Spielcode und keine abgeschwächte Assertion. Der Fehllauf wird
weder als erfolgreich noch als behobener Produktfehler ausgegeben. Vor einer
stabilen Veröffentlichung verbleibt seine Diagnose als offener Prüfpunkt.

Der Browserprüfer prüft HTTP-Fehler künftig ausdrücklich als Fehler und veröffentlicht
Versions-/Transfer-/Fehlerdetails im GitHub-Check. Die erfolgreichen archivierten
Läufe besitzen bereits leere HTTP-Fehlerlisten.
