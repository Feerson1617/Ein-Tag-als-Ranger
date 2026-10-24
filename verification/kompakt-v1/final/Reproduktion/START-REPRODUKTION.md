# Reproduktion dieses Kandidaten

Produktcommit: `e9899efaa314d052191d7d3a95b5de904f2932b6`. Geprüfte Einzel-HTML: `87ff215191f543c1d91cadeef0ecf14c98012ff1f2b0c9866df0bbe2fd6494b8`. Die Auslieferung enthält exakt diese Datei; QA-/Dokumentationscommits stempeln sie nicht neu.

QA-Korrekturen: `bd859abe098a50408f8b950794b012b59b8432dd` prüft den tatsächlichen Quelleinstieg; `a1602a6fee0c37406d7eaded0724ae03f92b6f61` korrigiert pausierte Canvasaufnahmen. Stand der nachfolgenden kurzen Prüfungen und Paketführung: `39c76226d42e0d34dda130b984c4c58825b84d39`. Alle Runtime-/Medien-/Materialquellen bleiben bytegleich zum Produktcommit.

Voraussetzungen: Node24, Python3.12, Versionen aus `tools/requirements-dev.txt`, Chromium und Poppler (`pdfinfo`, `pdftotext`, `pdftoppm`). Kein npm-Installationsschritt. Konkrete ausgeführte Versionen stehen unter `Nachweise/environment.json` und in den Browserberichten.

```sh
git clone https://github.com/Feerson1617/Ein-Tag-als-Ranger.git
cd Ein-Tag-als-Ranger
git checkout 39c76226d42e0d34dda130b984c4c58825b84d39
python3 -m venv .venv
.venv/bin/python -m pip install -r tools/requirements-dev.txt
.venv/bin/python -m playwright install chromium
```

Für einen neuen kompletten Prüfgegenstand mit aktuellem QA-Treiber (neuer Commitstempel, gleiche Runtime) die portable Baseline `Historische-Vorpruefungen/Baseline936/webgl/result.json` aus diesem Paket nach `work/v1-abschluss/baseline/webgl/result.json` kopieren. Danach:

```sh
.venv/bin/python tools/check-compact-v1.py --output work/eigener-v1-lauf
.venv/bin/python tools/browser-compact-paused-capture.py --output work/eigene-paused-capture
```

`--require-discarded` verlangt zusätzlich die Reproduktion des schwarzen direkten Alt-Exports; diese Diagnose hängt vom Grafikpfad ab. Der neue Compositor muss unabhängig davon ein sichtbares Bild und exakt unveränderten Modellzustand liefern. GPU-Jobs seriell ausführen. Ausgabeziele müssen neu sein und der Checkout vor dem vollständigen Plan sauber. Nicht zugängliche Hardware-/Datei-/Hintergrundfälle bleiben offen. Ein tatsächlicher Prozessfehler führt weiterhin zu Exitcode1, auch beim ursprünglichen900-s-Treiber; alte Ergebnisse werden nie überschrieben.

Für die exakten bereits gelieferten87ff…-Bytes separat einen sauberen Git-Checkout des Produktcommits e9899ef verwenden und die dortigen Builder `tools/build-web.py`, `tools/build-standalone.py`, `tools/build-compact.py` ausführen. Dieser alte QA-Plan hatte die dokumentierte Quelleinstiegslücke. Um exakt die gelieferten Produkte mit korrigierter QA zu prüfen, im QA-Checkout die gelieferten `Webpaket`/`Lernpaket` nach `outputs/Ranger-Kompakt`/`outputs/Ranger-Kompakt-Lernpaket` und `Ranger-Kompakt.html` nach `outputs/` kopieren, dann die einzelnen Prüfungen ohne erneuten Build ausführen, insbesondere:

```sh
.venv/bin/python tools/browser-compact-learning.py --site dist --entry kompakt.html --gallery --output work/eigene-quelle
.venv/bin/python tools/browser-compact-learning.py --site outputs/Ranger-Kompakt --entry index.html --output work/eigenes-web
.venv/bin/python tools/browser-compact-learning.py --site outputs --entry Ranger-Kompakt.html --output work/eigene-html
```

Das Quell-ZIP enthält Dateibaum und `PROJECT-MANIFEST.json`, absichtlich keine `.git`-Metadaten. Es ersetzt keine Git-Commitidentität; historische Snapshotvergleiche benötigen den echten Git-Checkout. Ein eigener neuer Git-Commit hätte einen anderen Provenienzstempel. Der später dokumentierte Liefercommit betrifft nur Abschlussnachweise.

Die zusätzlichen nativen200%-Aufnahmetreiber unter `Reproduktion/work/v1-abschluss/` an denselben relativen Ort im Checkout kopieren und mit `--output` auf ein neues Ziel starten. Tatsächlicher Zoom über Chrome-Einstellungen, keine CSS-Imitation. Private Browserprofile sind nicht enthalten. `PLAYWRIGHT_BROWSERS_PATH` nur bei abweichender lokaler Installation setzen; keine Entwickler-Homepfade nötig. Poppler separat installieren.

Die eigene Sichtprüfung ersetzt weder physische Geräteprüfung noch Unterrichtspilot. Kein Befehl hier merged, veröffentlicht oder deployed.
