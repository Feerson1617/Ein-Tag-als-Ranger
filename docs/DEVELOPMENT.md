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
