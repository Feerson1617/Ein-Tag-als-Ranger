# Reproduktion des aktuellen Softwarekandidaten

Produkt-/QA-Commit: `4eb186a5325ae30dfa233e10dd44eb73ea710afa`. Tatsächlich geprüfte und gelieferte Einzel-HTML SHA256: `3748c6590afefb18a5e07bb3cedc2c40b0b2be1619a57cc52553a30de5869412`. Ein späterer reiner Dokumentations-/Liefercommit baut die Runtime nicht erneut und wird separat in LIEFERUNG.json ausgewiesen.

Voraussetzungen: Node 24, Python 3.12, `tools/requirements-dev.txt`, Chromium und Poppler. Für die reproduzierbare alte Schriftüberlauf-Fixture DejaVu Sans installieren; aktuelle Drucke verwenden Arial beziehungsweise metrisch kompatibles Liberation Sans. Unter Debian/Ubuntu: `poppler-utils fonts-dejavu-core fonts-liberation`. Kein npm-Schritt, keine Konten oder kostenpflichtigen Dienste.

```sh
git clone https://github.com/Feerson1617/Ein-Tag-als-Ranger.git
cd Ein-Tag-als-Ranger
git checkout 4eb186a5325ae30dfa233e10dd44eb73ea710afa
python3 -m venv .venv
.venv/bin/python -m pip install -r tools/requirements-dev.txt
.venv/bin/python -m playwright install chromium ffmpeg
```

Die im Paket enthaltene originale Baseline `Reproduktion/work/v1-abschluss/baseline/webgl/result.json` an denselben relativen Ort im Checkout kopieren. Die Quellen und historischen Git-Fixtures bleiben unverändert. Dann im sauberen Checkout:

```sh
.venv/bin/python tools/check-compact-v1.py --output work/eigener-v1-lauf
```

Der vollständige Plan enthält 34 Prozesse, einschließlich 41 Node-Prüfreihen, 9 Python-Tests, Builds/Pakete, aktuellem A4-Druck, zwei Schriftprofilen, Quelle/Web/Einzel-HTML, Imports, UI/WebGL, ursprünglichem 900-s-Treiber, 20 realen Minuten und separatem höher aufgelöstem Weg-/Nahrungsfolgenlauf. Ausgaben müssen neu sein. Alle GPU-Läufe seriell; der Langlauf benötigt tatsächlich 20 Minuten zuzüglich Aufwärmen. Jede fehlgeschlagene Assertion bleibt Fehler/Exit 1. D3 trennt Softwaregrafik-Diagnose und verpflichtende Softwareprüfungen; es gibt keine Timeoutverlängerung des Originaltreibers, kein xfail und kein stilles Überspringen.

Für zusätzliche vollständige native Zoom-/Linsenbilder den beigefügten Treiber `Reproduktion/work/v1-abschluss/supplement-native-middle.py` an denselben relativen Ort kopieren:

```sh
.venv/bin/python work/v1-abschluss/supplement-native-middle.py --output work/eigene-native-ui
```

Der Testdruck baut alle fünf Dokumente aus genau denselben Quellen wie die Runtime-Downloads. `check-compact-print-fonts.py` reproduziert zunächst den alten 3-Seiten-Fehler mit einer unveränderten Fixture; erst anschließend gelten die unveränderten 2-Seiten-/Text-/Tabellenassertions für die neuen Dateien. Die Substitution des generischen Systemfonts ist ausdrücklich ein kontrolliertes Fontprofil, kein behaupteter macOS- oder CI-Hostnachbau.

Der korrigierte Fütterungstreiber beginnt einen neuen lokalen Versuch über die öffentliche Oberfläche bei Modellzeit 0 und hält den ersten tatsächlichen Beutevorgang fest. Er prüft unveränderten Ort und bytegleiche Speicherung. Referenz-/Modellschritte sind keine neu erworbenen Weltbeobachtungen und ersetzen den vollständigen Fußweg nicht.

Für einzelne Prüfungen ohne Neubau zuerst die gelieferten Webpaket-/Lernpaket-Ordner und Ranger-Kompakt.html an die entsprechenden outputs-Pfade kopieren. Quellmodule/CSS/Medien müssen gemäß runtime-freeze.json übereinstimmen. Das Quell-ZIP ist eine Dateikopie mit PROJECT-MANIFEST.json, ohne .git; historische Tests benötigen zusätzlich den echten Git-Checkout. Keine Entwickler-Homepfade nötig; PLAYWRIGHT_BROWSERS_PATH nur bei abweichender Installation setzen.

Aktuelle Cloudgrenzen stehen in ABSCHLUSS.md: offizielle Chromium 151-/CI-Log-Downloads blockiert, eigener Browser Chromium 154. Kein lokaler PASS hebt einen historischen CI-FAIL auf. Physisches iPad/Safari, echter Hintergrundfall und Unterrichtspilot bleiben im jeweils dokumentierten Umfang offen. Kein Reproduktionsbefehl merged, deployed oder veröffentlicht.

## Dokumentationskorrektur nach dem funktionalen Lauf

Der vollständige Neubau auf Produktcommit 4eb186a erzeugt das ursprüngliche Webmanifest des funktionalen Prüflaufs. Im endgültigen Webpaket wurden anschließend ausschließlich STATUS.md und deren Manifestbindung berichtigt: Dort war irrtümlich noch der vorherige Kandidat als aktuell bezeichnet. Beide Manifeststände und die genaue Dateidifferenz sind in Nachweise/runtime-freeze.json sowie Nachweise/documentation-package-update.json enthalten. Alle ausführbaren Webdateien, CSS, Medien, der Web-Einstieg und die tatsächlich gelieferte Einzel-HTML bleiben bytegleich. Der unveränderte Paketverifizierer wurde für die Statuskorrektur gesondert ausgeführt. Der finale Dokumentationscommit steht in LIEFERUNG.json.

Um genau die ausgelieferten Webbytes zu prüfen, den vollständigen gelieferten Webpaket-Ordner nach outputs/Ranger-Kompakt kopieren und die einzelnen Browser-/Verifizierungsbefehle ohne neuen Build ausführen. Ein Neubau unter einem späteren Git-Commit trägt einen anderen Buildstempel und ist ein neuer Prüflauf. Die Quellen-/Dokumentationsprovenienz wird dadurch nicht vermischt.

## Tatsächlich erforderliche lokale Abhängigkeitskorrektur

Der erste neue Gesamtplan führte 34 Prozesse aus: 33 bestanden, der Videoweg scheiterte vor dem Öffnen der Spielseite am fehlenden FFmpeg. Der Originalplan und sein Traceback bleiben unverändert erhalten. Nach einem ebenfalls gesperrten offiziellen Download wurde der bereits installierte System-FFmpeg 7.1.5 am von Playwright erwarteten lokalen Encoderpfad angebunden. Eine echte VP8-Aufnahme und `ffprobe` bestätigten die Funktion. Genau der blockierte Weglauf wurde mit denselben Optionen und Assertions separat wiederholt. Die aktuelle Zusammenführung enthält beide Ausführungen; sie macht den ursprünglichen Fehler nicht zu einem Erfolg. `Nachweise/ffmpeg-environment/result.json`, `main-plan-original-result.json` und `retry-run-status.json` dokumentieren die tatsächliche Ausführung. Die Wiederholungsskripte liegen ebenfalls bei.

Für exakt die hier verwendeten QA-Abhängigkeiten gilt `tools/requirements-dev.txt` (Playwright 1.62.0, Pillow 12.3.0). Der reguläre Playwright-Installationsbefehl installiert auch den Videoencoder. Nur wenn dieser offizielle Download gesperrt ist und Chromium sowie FFmpeg bereits als geprüfte Systemprogramme vorhanden sind, lässt sich für diesen gepinnten Playwright-Stand ein frisches lokales Browserverzeichnis verwenden:

```sh
set -eu
export PLAYWRIGHT_BROWSERS_PATH="$PWD/work/browser-dependencies"
ranger_ffmpeg_bin="$(command -v ffmpeg)"
test -x "$ranger_ffmpeg_bin"
mkdir -p "$PLAYWRIGHT_BROWSERS_PATH/ffmpeg-1011"
ln -s "$ranger_ffmpeg_bin" "$PLAYWRIGHT_BROWSERS_PATH/ffmpeg-1011/ffmpeg-linux"
```

Dabei wird ausschließlich der vorhandene lokale Encoder angebunden. Es ist kein behaupteter erfolgreicher Download des Playwright-Binaries und keine Umgehung der Netzrichtlinie. Der verwendete Systembrowser muss ebenfalls protokolliert werden; hier Chromium 154.0.8037.57 und FFmpeg 7.1.5. Die tatsächliche Videofunktion vor einem langen Lauf prüfen. Keine vorhandenen Installationen überschreiben.
