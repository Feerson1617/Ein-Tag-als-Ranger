# Ranger 1.0.0-rc.1 – technische Nachweise vom 21.10.2026

Diese Daten stammen aus der aktuellen Cloud-Umgebung. Browser: Chromium
154.0.8037.57 mit SwiftShader. Alle Bilder sind tatsächliche Browseraufnahmen.
Keine Hardware-/Unterrichtsfreigabe und keine biologische Gesamtvalidierung.

- `node-checks.json`: abschließende 26 Prüfreihen, Codecommit `a4e4db7`, alle bestanden.
- `packaging-checks.txt`: fünf Python-Prüfmethoden, alle bestanden.
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
GitHub-Actions wurden vorbereitet, aber nicht auf GitHub ausgeführt.
Kein Merge, kein Deployment und keine Live-Veröffentlichung.
