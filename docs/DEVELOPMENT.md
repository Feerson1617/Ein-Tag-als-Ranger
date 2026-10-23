# Entwickeln und prüfen

Im vorhandenen Checkout arbeiten; Cloudtasks sind bereits isoliert. Ohne
ausdrücklichen Auftrag keinen weiteren Git-Worktree anlegen. `dist/` enthält
bearbeiteten ES-Modul-Quellcode. Ältere Einstiegsmodule bleiben Referenzen.

Getestete Basis: Node 24.19.0, Python 3.12.14, Pillow 12.3.0,
Playwright 1.62.0. Keine npm-Laufzeitabhängigkeit. Optionale Browserwerkzeuge:

```sh
python3 -m venv .venv --system-site-packages
.venv/bin/python -m pip install -r tools/requirements-dev.txt
python3 tools/run-checks.py
.venv/bin/python tools/build-web.py
.venv/bin/python tools/verify-web.py
python3 tools/build-standalone.py
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

`node` muss im PATH stehen; keine Abhängigkeit von früheren Mac-Verzeichnissen.
Pillow prüft Bildpixel. Playwright steuert einen echten Browser; Chromium ist in
dieser Cloud unter `/usr/bin/chromium` vorhanden. Auf anderen Maschinen mit
`python -m playwright install chromium` einrichten. Keine historische Installation
von Blender oder game-dev voraussetzen; für Spielstart und Prüfungen nicht nötig.
Der frische A4-Druckaudit benötigt Poppler (`pdfinfo`, `pdftotext`, `pdftoppm`),
unter Debian/Ubuntu aus `poppler-utils`. Kontaktbögen verwenden zusätzlich Pillow.
FFmpeg erstellt bei Bedarf kompatible Videokopien ohne Änderung der Zeitfolge.
Der Ankunftstest zeichnet die erste echte Nahrungssuchfolge über den nativen
Canvas-Medienstream mit unveränderten Zeitstempeln auf. Die gesamte Wegsitzung
wird durch Eingabetelemetrie und Bilder belegt. Ein verworfener Explorationslauf
benötigte Playwright-FFmpeg; dessen blockierter Download und die lokale Prüfung
mit bereits installiertem System-FFmpeg bleiben im Fehlversuchsarchiv dokumentiert.

Erforderlich: Modulprüfungen, beide Builds/Paketverifikation und repräsentative
Browserprüfung bei UI-Änderungen. Physisches Tablet und Unterrichtspilot sind
separate, ausdrücklich als ungetestet zu meldende Abnahmen. Alle Laufzeitmedien
sind lokal; keine Anmeldung, Datenbank oder Spielserver nötig.

Speicherverträge: `evolutionswald-fieldjournal-v2` (Einträge/Interaktionen),
`feldbuch-quests-v1` (Fundorte), `feldbuch-graphics` (Darstellung). Diese Schlüssel
bei Migration bewahren. Export bislang JSON ohne Versionshülle.

Rendering: stabile Agenten/Plants → Simulation/Relationen → instanzierte Sicht;
LOD/Modellladen dürfen Identitäten nicht verändern. Individuen-ID gilt zusammen
mit Habitat. `dist/index.html` → `expedition.js`; Buildhashnamen sind Ausgabe.
Assets: lokale 168 Taxonfotos, drei Vogelaufnahmen, Naturmaterialien und sechs
eigene GLBs; Nachweise in `dist/assets/*LICENSE*`, `*PHOTOS*`, `*RECORDINGS*`,
`WILDLIFE-MODELS.txt`, `attribution.json`, `assets/vendor/` und `verification/`.
Assetrechte sind nicht mit Biologiereferenzen oder einer Codelizenz gleichzusetzen.


Vollständige aktuelle Prüfkette zusätzlich zu den obigen Basisbefehlen:

```sh
python3 tools/build-standalone.py
python3 -m unittest discover -s tests -p 'test_*.py' -v
python3 tools/browser-check.py --live --width 800 --height 500
python3 tools/browser-check.py --site outputs/GitHub-Pages --prefix /Ein-Tag-als-Ranger/
python3 tools/package-project.py
```

Für eine gezielte neue Abnahme nach bereits bestandenem M1/M2:
`--live --live-mission m3`. Standard `--live` prüft alle drei aus dem laufenden
Spiel. Der nachfolgende Import-/Formulartest verwendet sichtbar als synthetisch
bezeichnete UI-Fixtures. Diese sind getrennt von echten Live-Beobachtungen zu
berichten. Browserausgaben liegen in `work/browser-*`, Node-Laufmetadaten in
`work/check-run.json`. Gemeinsame Graphprüfung für Pages und Standalone in
`tools/module_graph.py`: nichtliterale Imports und zyklische Graphen werden mit
Fehler abgelehnt statt unvollständig veröffentlicht.

Die Nachbesserungsrunde vom 23.10.2026 ist durch folgende zusätzliche Prüfungen
wiederholbar. Der Gesamtplan verlangt einen sauberen Commit und läuft mit jeweils
nur einem Browser; der Dauerlauf misst mindestens 20 echte Minuten nach Aufwärmen.

```sh
python3 tools/check-compact.py
python3 tools/build-compact.py
python3 tools/browser-compact-arrival.py
python3 tools/print-compact-materials.py --contact-sheets --audit-dir work/qa-correction/final-print
python3 tools/check-compact-corrections.py
python3 tools/collect-compact-endqa.py
```

Der Ankunftstest geht den vollständigen Hauptweg per Tastatur/Maus ab. Er startet
neue endliche Beobachtungsfenster ausschließlich über die sichtbare Oberfläche.
Der zweite lange Aufenthalt verwendet ausdrücklich 1200 Modellsekunden; er gilt
nicht als 20 Minuten eigener Wald- oder K1-Arbeit. Die erste Nahrungssuchfolge läuft
in Echtzeit und bleibt als unbeschleunigtes Video erhalten. Historische Belege
unter `verification/kompakt-korrektur/` werden nicht durch die neue Runde ersetzt.
