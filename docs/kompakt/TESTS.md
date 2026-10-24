# Aktueller V1-Prüfplan

```sh
PLAYWRIGHT_BROWSERS_PATH=/pfad/zu/playwright python tools/check-compact-v1.py --output work/v1-final-eindeutig
```

Voraussetzungen: sauberer Git-Commit, Node, Python mit Playwright/Pillow, Chromium, Poppler (`pdfinfo`, `pdftotext`, `pdftoppm`). Keine neuen npm-Pakete oder externen Laufzeitdienste. Das Zielverzeichnis muss neu sein. Browserprozesse laufen seriell. Der Plan friert die gesamte Runtime einschließlich CSS/Medien ein und protokolliert jeden Prozess samt Exitcode und Buildbindung. Die 28 Legacy- und 13 Kompakt-Suiten sowie die nach aktuellem Bestand gefundenen Pythonprüfungen sind Vorprüfungen; danach folgen reale UI-/WebGL-Läufe an Quelle, Website und Einzeldatei, Native-200%-Zoom, echte Grafikverluste, 20 reale Minuten und vollständige Begehung einschließlich Abkürzung.

Die unveränderte ursprüngliche 900-s-Prüfung bleibt eine separat ausgewiesene Softwaregrafik-Diagnose. Sie läuft tatsächlich; ein FAIL bleibt FAIL und der Gesamtprozess endet dann mit Exitcode 1. `softwareGatesPassed` beurteilt ausschließlich den zuvor in [D3](../ABSCHLUSSVERTRAG-V1.md) erklärten Pflichtumfang; `allProcessesPassed` umfasst zusätzlich die Diagnose. Bilder, Druckraster, nachvollziehbare Mund-/Beutekontakte und Waldentwurf benötigen zusätzlich die eigene dokumentierte Sichtprüfung. Ein grüner Prozess allein bescheinigt weder Ästhetik noch Hardwareleistung oder Lernwirkung.

Der aktuelle Abschlussbericht bindet alle Ergebnisse an tatsächliche Commits, Hashes und Daten. Physischer Safari-/iPad-Hintergrundwechsel sowie Unterrichtspilot können in dieser Cloud nicht ersetzt werden. `browser-compact-v1-reference.py` dient ausschließlich einer ausdrücklich gekennzeichneten Vorprüfung; Referenzbesuche gelten niemals als normaler Fußweg. Alte Läufe und ihre Fehlschläge werden nicht überschrieben.

## Historische Runde-2-Verfahren und Ergebnisse

# Reproduzierbare Prüfung der zweiten Korrekturrunde

```sh
python tools/check-compact-corrections.py --round2 --output work/final-qa-round2
```

Dieser vollständige Plan prüft zuerst alle 40 Node-Suiten, Python, beide Builds und das Quellpaket. Danach laufen die bisherigen 15 Browserprüfungen mit unveränderter ursprünglicher 900-s-Weggrenze sowie einer gezielten Detailkamera-LOD-Regressionsprüfung, Original-N05-Import, frisch gepaarten Waldkameras und ein ausdrücklich gesonderter 3600-s-Funktionsweg mit vier Echtzeit-Detailfolgen. Kein fehlgeschlagener Schritt wird in PASS umgedeutet. Der abschließende Planstatus enthält alle tatsächlich ausgeführten Ergebnisse. Damit umfasst der neue vollständige Plan 19 Browserprüfschritte. Die neue UI-Importsuite erhält zusätzlich die gelieferten bytegleichen Original-F01/F04/N05-Dateien und das alte Revision-3-Feldbuch.

Historische Revisionsprüfung: `node tests/compact-habitat-revision-check.mjs work/historical` vergleicht die aktuelle Modellfunktion mit neun unveränderten Git-Modulen von `f921468`. Diskrete Struktur/IDs/Reihenfolge bleiben exakt; numerische Toleranz 1e-10 plus vier relative Maschinen-Epsilon liegt weit unter 3 cm Importtoleranz. Der Fixture-Snapshot wird über SHA256, Git-Blob-Identität und bei verfügbarem Commit direkt gegen `git show` geprüft. Separate Linux-/macOS-Jobs mit Node 24.19/24.21 führen auch die nachfolgenden Gradienten-/Pfadprüfungen aus. Nicht ausgeführte Matrixfelder erhalten kein PASS.

`tools/profile-compact.py` misst tatsächliche rAF-Intervalle, Modellfortschritt, Renderer, CPU-Profile und Prozess-CPU-Zeit. Sein erfolgreicher Messablauf bedeutet kein bestandenes 30-FPS-Ziel. `tools/print-compact-materials.py --contact-sheets` rendert beide aktuellen A4-Fassungen unabhängig vom Wegerfolg; alle neuen Raster und C17-Details benötigen eine eigene Sichtprüfung. Der CI-Druckschritt läuft nun auch nach einem fehlgeschlagenen Wegtest.

## Vorheriger versiegelter Prüfstand (historisch, keine neuen Runde-2-Erfolge)

# Ranger Kompakt – abschließende lokale Prüfungen und Nachweise

Abschließender lesender Abgleich: `2026-10-23T09:53:37.553510+00:00`. Runtime-Commit: `3920a1d1d2692889b75403c1b0e50f5b856398aa`. Der [zweite Gesamtplan](../../verification/kompakt-endqa-20261023/final/plan/result.json) ist vollständig: **15 von 15 Schritten bestanden**, `complete: true`.

## Automatische Vorprüfungen

[Node-Rohbericht](../../verification/kompakt-endqa-20261023/final/legacy-node/check-run.json) und [Kompakt-Rohbericht](../../verification/kompakt-endqa-20261023/final/compact-node/result.json): 40 von 40 Node-Suiten sind bestanden: 28 Legacy-Suiten und 12 Kompakt-Suiten mit zusammen 105 Kompaktgruppen. Dazu gehören acht K2-Ereignisreferenzgruppen und fünf Materialtiefen-Gruppen. Die 105 Gruppen sind keine Zählung aller Node-Assertions. Neun [Pythonprüfungen](../../verification/kompakt-endqa-20261023/final/logs/final-python.log), beide Buildverifikationen und die vorläufige Quellenpaketprüfung sind bestanden. Der hier geprüfte Runtime-Stand ist vom späteren Dokumentations-/Paketstand zu unterscheiden. Konkreter Paketcommit und HTML-Hashes werden durch dessen Build-/Paketmanifest gebunden; CI-Ergebnisse gehören zum jeweiligen PR-Head.

[Runtime-Freeze](../../verification/kompakt-endqa-20261023/final/plan/runtime-freeze.json): 51 Runtime-Dateien stimmen mit den aktuellen Quellen überein. Die geprüfte Einzeldatei hat 11.953.336 Bytes und SHA256 `b61a35456fcd6253ed6693d7fa8031f3ae5b7ca48502837d744c82b3dfc227b4`; der Webstart hat SHA256 `81d9b512b6526682e4800babdc9f2797f4385ddd04e6a908bea419d88e8ed5b3`. Die Berichte nennen ihre vorhandenen Bindungsfelder ausdrücklich; fehlende Commit- oder Hashfelder werden nicht ergänzt. Chromium 154.0.8037.57 läuft mit Cloud-Softwaregrafik, nicht auf dem Mindestgerät.

## Vollständiger neuer Gesamtplan

| Schritt | Ergebnis | Prozessdauer | Rohbericht / Review |
|---|---|---:|---|
| supplemental-arrival-3600 | PASS | 2016.05 s | [Beleg](../../verification/kompakt-endqa-20261023/final/supplemental-arrival-3600/result.json) |
| feeding | PASS | 81.96 s | [Beleg](../../verification/kompakt-endqa-20261023/final/feeding/result.json) |
| learning-web | PASS | 228.22 s | [Beleg](../../verification/kompakt-endqa-20261023/final/learning-web/result.json) |
| source | PASS | 12.94 s | [Beleg](../../verification/kompakt-endqa-20261023/final/source/result.json) |
| reference | PASS | 210.40 s | [Beleg](../../verification/kompakt-endqa-20261023/final/reference/result.json) |
| standalone-smoke | PASS | 64.96 s | [Beleg](../../verification/kompakt-endqa-20261023/final/standalone/result.json) |
| learning-standalone | PASS | 107.08 s | [Beleg](../../verification/kompakt-endqa-20261023/final/learning-standalone/result.json) |
| growth | PASS | 8.37 s | [Beleg](../../verification/kompakt-endqa-20261023/final/growth/result.json) |
| imports | PASS | 40.86 s | [Beleg](../../verification/kompakt-endqa-20261023/final/imports/result.json) |
| habitats | PASS | 143.54 s | [Beleg](../../verification/kompakt-endqa-20261023/final/habitats/result.json) |
| habitat-revision | PASS | 155.52 s | [Beleg](../../verification/kompakt-endqa-20261023/final/habitat-revision/result.json) |
| materials | PASS | 13.24 s | [Beleg](../../verification/kompakt-endqa-20261023/final/reviews/final-print-review.json) |
| stability | PASS | 1471.06 s | [Beleg](../../verification/kompakt-endqa-20261023/final/stability/result.json) |
| legacy-full | PASS | 711.47 s | [Beleg](../../verification/kompakt-endqa-20261023/final/legacy/result.json) |
| legacy-standalone | PASS | 87.13 s | [Beleg](../../verification/kompakt-endqa-20261023/final/legacy-standalone/result.json) |

Laufbefehl: `python tools/check-compact-corrections.py --supplemental-arrival-wall-budget 3600`. Alle 15 Prozesse endeten mit Exitcode 0. Der Plan umfasst getrennte Prüfpfade mit unterschiedlicher Reichweite; insbesondere ist der Legacy-Einzeldateilauf ein Smoke-Test.

## K1–K5: richtige, falsche und unsichere Bearbeitung

Web: 18 Prüfgruppen, davon 17 Funktionsgruppen und eine Galerieprüfung; 46 Aufnahmen insgesamt, darunter 37 Galerieaufnahmen (36 aktive Taxa und Raupe). Einzeldatei: dieselben 17 Funktionsgruppen ohne Galerie. Beide Berichte melden keine JavaScript-Seitenfehler.

| Familie | Tatsächlich angenommene Bearbeitung | Geprüfter Gegenfall / Unsicherheit |
|---|---|---|
| K1 | Drei verschiedene eigene Beobachtungen, zwei Standorte mit gleicher Methode und neuer Eichen-Gruppentransfer | Plausibel falsche Art zurückgewiesen; begründete Unsicherheit erhalten; anonyme Labels vor begründeter Bestimmung |
| K2 | Tatsächliche Kontroll- und Konkurrentenläufe mit Ressourcenbezug | Bloße Koexistenz als Erklärung zurückgewiesen |
| K3 | Dasselbe konkrete Individuum in passender Szene und Zeitfolge; Q1/Q2/Q0 mit echtem Nullfund | Belege verschiedener Individuen zurückgewiesen |
| K4 | Eigene Pilzsichtung und Verbindungen im ausgewiesenen Schnittmodell | Falscher Energiekreislauf zurückgewiesen |
| K5 | Küstenbeleg, Kriterienbezug, Gewichte, Sach-/Wert-/Norm-/Folgenfelder und drei lokale Gespräche | Sachfremder Waldbeleg zurückgewiesen; freie Begründung bleibt unbenotet und menschlich zu beurteilen |

Nicht jede Familie besitzt eine eigene Unsicherheitsoption. Die Kompaktprüfungen und die Legacy-Missionen M1–M3 besitzen jeweils eigene Nachweise. Die Lernläufe bestätigen außerdem tatsächliches Reload mit erhaltenen Antworten und Belegen, JSON-/Lesedownloads, atomare Ablehnung widersprüchlicher Szenen/Seeds/Antwortformen, Quota-Verhalten, 25 Materialkarten, fünf numerische Modelle, V1-Migration, Lupe-Kontextverlust und Touch-/Viewportemulation. Emulation ersetzt kein physisches iPad-/Safari-Ergebnis. Beim Warnlayoutfall war `warningVisible: false`; geprüft wurde die berechnete Position, keine sichtbare Warnung.

## Legacy M1–M3, freies Spiel und Speichern/Laden

Der getrennte [Legacy-Gesamtlauf](../../verification/kompakt-endqa-20261023/final/legacy/result.json) besteht mit **16 Prüfgruppen**, sauberem Runtime-Commit `3920a1d…` und 711,47 Sekunden Prozessdauer. M1 erwirbt drei tatsächliche fokussierte Pflanzenbelege und prüft Merkmalsvergleiche sowie begründete Unsicherheit. M2 verwendet ein tatsächliches Simulationsereignis, endliche gemeinsame Ressourcen, ausdrücklich gelesenes Modellprotokoll und Interpretation. M3 verwendet eine bestehende Probe und dasselbe konkrete Individuum `wadden:138` in demselben Rundgang und Szenenseed, an `probe-2` und Tiefe 5: Niedrigwasser bei Modellzeit 13,5882, Hochwasser bei 19,7332. Die geordneten Modellzeitfenster dauern 6,1915 beziehungsweise 6,1450 Modellsekunden; die Quelle ist ausdrücklich `model-protocol`.

Ein tatsächliches Reload erhält erworbene Missionsbelege, Antworten und Abschlüsse; anschließend wird das freie Spiel fortgesetzt. Eigene UI-Fixtures prüfen M1 falsch/unvollständig/richtig/begründet unsicher, M2 fehlende Hypothese/falsche Herkunft und M3 die unzulässige Gleichsetzung von Nichtfund und Abwesenheit. Diese importierten Fixtures werden nicht als selbst erworbene Belege ausgegeben. Widersprüchliche Stationsimporte werden vor einer Ersetzung abgelehnt; gültige Importe verlangen ausdrückliche Ersetzung. Referenzansicht, JSON-/Berichtdownloads, abgebrochener neuer Rundgang, Werkzeuge, Tastatur, Karte mit acht Regionen und Tablet-Viewport sind geprüft.

Die getrennten Fehlerfälle bestätigen tatsächlichen WebGL-Verlust und Wiederherstellung mit erhaltenem Feldbuch, blockierten Start bei absichtlich fehlendem Tiermodell mit erfolgreichem Reload sowie sichtbare Quota-Fehler. Der Bericht enthält keine fehlgeschlagenen Prüfungen, JavaScript-, Konsolen- oder HTTP-Fehler. Der getrennte [Legacy-Einzeldatei-Smoke](../../verification/kompakt-endqa-20261023/final/legacy-standalone/result.json) besteht mit drei Gruppen in 87,13 Sekunden: Start, verzögert geladenes und tatsächlich dargestelltes Referenzfoto sowie freies Erkunden mit Werkzeugen, Karte und emuliertem Tablet-Viewport. Anfangs sind 18 Medien dekodiert, nach Öffnen der Referenzen 33. Auch dieser Bericht enthält keine Prüf-/JS-/Konsolen-/HTTP-Fehler. Er wiederholt nicht den vollständigen M1–M3-Missionslauf.

## Import, Wachstum und Grafik

[Native Importsuite](../../verification/kompakt-endqa-20261023/final/imports/result.json): **46 Fälle bestanden**, darunter 40 negative und sechs weitere Fälle. Drei tatsächliche Legacy-K2-UI-Fälle prüfen eindeutige Altbezüge, mehrfache Kopien desselben Rundgangs/Ereignisses und mehrdeutige Alt-IDs. Die ersten beiden bleiben gültig. Mehrdeutige Bezüge wählen keine Option automatisch; erst die ausdrückliche qualifizierte Neuauswahl und das Speichern ergeben den erfolgreichen Abschluss. Originalspeicher bleibt beim Öffnen erhalten. Fixture- und Exporthashes sind protokolliert. Die importierten Fixtures sind keine selbst erworbenen Beobachtungen.

[Wachstum](../../verification/kompakt-endqa-20261023/final/growth/result.json): vier Prüfgruppen bestanden. Vier gültige Nullrandfälle liefern endliche Nulltabellen, Plots und native Exporte. Die Ursache war `0 * exp(730) → NaN`; der Nullfall wird vor der potenziell überlaufenden Exponentialrechnung behandelt. Der tatsächlich ausgeführte positive Overflow bleibt ein Fehler und entfernt die vorherige Kurve samt Export; die nächste gültige Nullrechnung entfernt die Fehlermeldung. Negative, fehlende oder gebrochene unzulässige Eingaben werden durch die native Formularvalidierung blockiert. Für diese blockierten Fälle prüft der Treiber keine Entfernung des vorherigen Diagramms. Das gespeicherte Feldbuch bleibt unverändert.

[Grafikwiederherstellung](../../verification/kompakt-endqa-20261023/final/reference/context-recovery-result.json): Der native Restore verwendet den tatsächlich erhaltenen Extension-Handle und bewahrt dieselbe Run-ID. Der Klick auf die öffentliche Retry-UI löst eine wirkliche Reloadnavigation mit neuer Run-ID aus. Beide Tests vergleichen unveränderte 922 Bytes des Feldbuchschlüssels mit einem eigenen Beleg (SHA256 `4857daf3dd4a393b3aaa27dc2ab41dce480128f9b36172a947a8d8b26b8fe202`). Das ist kein gesonderter Nachweis aller K1–K5-Antworten für beide Grafikpfade; diese Lernarbeit wird im normalen Reloadfall geprüft. Keine Extension-Mocks oder Zustandsinjektion ersetzen die beiden Grafikwege.

## Ankunft, Nahrungserwerb und Zeitarten

[Ankunftsreview](../../verification/kompakt-endqa-20261023/final/reviews/final-arrival-review.md): Der Hauptweg wurde mit gewöhnlichen W-/Mauseingaben gegangen: 1493,347 Wandsekunden, 225,730 Modellsekunden und 361,055 m abgetastete Strecke. Die vorgesehene Route misst 362,210 m. Rückweg und Abzweig benötigen weitere 268,597 und 74,630 Wandsekunden. Neue lokale Kontexte entstehen erst am tatsächlich erreichten Ort; Run-ID, Zeit, Herkunft, endliche Vorräte und unveränderter Beobachterstandort sind protokolliert.

Acht Erwerbsfolgen und 48 Phasenbilder bestehen technisch: eine Echtzeitfolge und sieben ausdrücklich beschriftete Modellschrittfolgen. Das exportierte Feldbuch enthält einen tatsächlich über die UI gespeicherten Fernglasbeleg zum Austernfischer mit 18,2826 Sekunden aktiver Beobachtung. Seine Ereignisliste ist leer; Nahrungserwerbsereignisse liegen separat in der Browsertelemetrie. Daraus folgt kein abgeschlossener K2-Auftrag.

Die WebM-Aufnahmeoperation dauerte 18,216 Wandsekunden. Das Originalvideo enthält 97 dekodierte VP8-Frames mit Präsentationszeiten von 0 bis 17,454 Sekunden; eine Container-Gesamtdauer ist nicht angegeben. Fünf Originalframes, acht Phasenbilder und zwei Endpunktbilder wurden angesehen; alle 48 Phasenbilder und drei Endpunktbilder wurden technisch geprüft. Der Zielvogel steht klein im Hintergrund. Konkrete Beute und vollständiges Schlucken sind nicht sicher visuell auflösbar; Telemetrie ersetzt diese Bildabnahme nicht.

Die gesonderte Langwartebedingung umfasst 240 UI-Schritte zu je fünf Modellsekunden: 1200 Modellsekunden in 55,474 Wandsekunden bei unveränderter eigener Beobachtungszeit von null. Sie ist keine tatsächlich geleistete 20-minütige K1-Arbeit und ist vom gesonderten realen Stabilitätstest zu unterscheiden. Der ursprüngliche 900-Sekunden-Lauf bleibt fehlgeschlagen; 3600 Sekunden je Wegabschnitt sind ein ausdrücklich anderer funktionaler Budgetfall.

## Reale Stabilitätsmessung und Cloud-Grafikbudget

[Stabilitätsbericht](../../verification/kompakt-endqa-20261023/final/stability/result.json): **funktionales PASS** nach 251,18 Sekunden Aufwärmphase. Die 78 Stichproben reichen bis 1205,13 reale Sekunden ab Messbeginn; einschließlich anschließender Tab-/Kontextprüfungen dauerte der Abschnitt 1211,59 Sekunden. Die Stichproben wurden bei wiederholten Besuchen von acht öffentlichen Referenzansichten erhoben. Der Lauf bestätigt fortschreitende Modellzeit, dieselbe Run-ID, unveränderte Pflanzenzahl, begrenzte Geometrie-/Texturbelegung und keine JavaScript-Seitenfehler. Referenzansichten wurden über echte UI-Eingaben aufgerufen; dies ist kein durchgehend normal gegangener Weg und keine 20-minütige K1-Bearbeitung.

Das **Cloud-Grafikbudget für 30 FPS ist nicht eingehalten**: medianes abgetastetes Frameintervall 374,95 ms, Maximum 1283,3 ms; `allSampledIntervalsWithinBudget: false`. Diese einzelnen Intervallstichproben sind keine vollständige FPS-Verteilung und kein physischer iPad-Benchmark. Die 78 Heapwerte liegen zwischen 86.564.136 und 91.806.989 Bytes; Garbage-Collection-Zyklen begrenzen ihre Aussagekraft. Daraus folgt keine Hardware-Speicherzertifizierung.

Beim tatsächlichen Wechsel zu einem anderen Headless-Chromium-Tab blieb die gemeldete Sichtbarkeit `visible`; die Modellzeit stieg um 0,163 Sekunden. Der Lauf belegt daher keine Pause bei einem tatsächlich verborgenen Tab. Die native Wiederherstellung des verlorenen WebGL-Kontexts bestand mit demselben Rundgang und anschließendem echten Render-/Modellfortschritt; kein Reload oder injizierter Sichtbarkeitszustand ersetzte diesen Test.

## Habitat und Druck

[Habitatreview](../../verification/kompakt-endqa-20261023/final/reviews/final-habitat-review.md): Alle 26 aktuellen Originalbilder und fünf unveränderte Baselinebilder wurden angesehen. 16 feste Kamerapaare stimmen in x/z/yaw/pitch innerhalb 0,00001 überein; die Augenhöhe folgt dem Gelände. 51 Quellenhashes und acht vorhandene Diagnosebildhashes stimmen. Für die anderen 18 Bilder nennt der Originalreport keinen früheren Bildhash; neue Hashes sind im Review erfasst. Vier frische Modellseeds bestätigen die Andel-Höhenrevision. Analytische absolute Pegel von +0,05/+0,30 m sind keine natürlichen jährlichen Fluthäufigkeiten. F05 bleibt teilweise erfüllt: kahle Flächen, dünne Sträucher, wiederholte Formen und teilweise verdeckende Leistungshinweise bleiben sichtbar.

[Druckreview](../../verification/kompakt-endqa-20261023/final/reviews/final-print-review.md): 39 Schülerseiten und 58 Lehrkräfteseiten, zusammen 97 frisch erzeugte Raster. Textaudit: 723/723 beziehungsweise 971/971 HTML-Fragmente im PDF. Alle elf Manifestdateien sind nach Größe und Hash geprüft. Fünf neue Kontaktbögen wurden angesehen. 97/97 frische Seitenraster stimmen byteweise mit den früher geprüften Rastern überein; deshalb werden 37 frühere Detailansichten ausdrücklich durch Rastergleichheit weiterverwendet. Die neu erzeugten PDF-Hashes sind im Review separat ausgewiesen. C04 enthält alle vier Antwortzeilen zusammen; lange Karten behalten nachvollziehbar mehrere Seiten.

## Originalquellen und Materialtiefe

[Quellenprotokoll](../../verification/kompakt-endqa-20261023/final/sources/QUELLEN-2026-10-23.md) und [Abruf-/Hashnachweis](../../verification/kompakt-endqa-20261023/final/sources/QUELLEN-2026-10-23.json) unterscheiden tatsächlich gelesene Fundstellen und Zugangslücken. Die Fachanforderungen Biologie SH 2026 wurden auf S. 49–55, 58 und 62 sowie ergänzend S. 72–73/75 gelesen; S. 62 wurde auch visuell geprüft. Beim Leitfaden 2017 wurden Druckseiten 44–49 gelesen, davon 47–49 (PDF 49–51) zusätzlich visuell geprüft. Dieser Leitfadenabschnitt ist ein möglicher Unterrichtsgang der Einführungsphase. Die ETS-Originalseiten 27–28 bleiben wegen Proxy-403 ungeprüft; eine vollständige ETS-Curriculum-Abdeckung wird nicht behauptet.

C01 nutzt veröffentlichte Biomspannen mit Einheiten und Grenzen, keine erfundenen Stationsmessungen. C15 vergleicht zwei konkrete Studienarten und trennt ökologische Funktion von Abstammungsmerkmalen. C17 trennt Reife, potenzielle Nachkommen, Fürsorge, Dichteänderung und Überlebensschätzung; die Ei-/Weibchenbezugsgröße bleibt ausdrücklich offen. Materialangebot und Softwaretests belegen weder individuelle Schülerkompetenz noch reale Geräteführung oder Exkursion.

## Historische Fehler und offene Abnahme

Der bereitgestellte HTML-Prüfbericht und der Nachbesserungsauftrag wurden gelesen. Das unabhängige End-QA-ZIP vom 23.10.2026 überschritt die 32-MiB-Transfergrenze; seine Originalskripte, Bilder und Importdateien konnten nicht selbst gelesen werden. Die Baselinebilder dieser Runde sind eigene frische Browseraufnahmen. Als Rekonstruktion gekennzeichnete Fehlimporte werden nicht als bytegleich geprüfte Originaldateien dieses ZIPs ausgegeben.

Der [historische Plan](../../verification/kompakt-endqa-20261023/final/historical-plan/result.json) gehört zu `78e723bcb5ca448fa7161146db82fc4451b59f38`: 13 von 15 Schritten bestanden. Arrival scheiterte nach 904,64 Sekunden an der ursprünglichen 900-Sekunden-Grenze; Web-Learning scheiterte nach 417,95 Sekunden an der fehlenden Löffleraufnahme. Diese Fehler bleiben erhalten. Der neue Galerieerfolg und der ergänzende Weglauf überschreiben sie nicht.

Fachlich offen bleiben die C17-Fekunditätsnotation und der Weibchenbezug sowie die Prüfung der ETS-Originalseiten 27–28 (Proxy-403). Physisches Apple iPad 9 mit Safari/iPadOS 27, Unterrichtspilot, Lernwirkung und reale Geräteführung/Exkursion sind nicht geprüft. Cloud-Framezeiten und Touchemulation liefern dafür keinen Ersatz.

Der Runtime-Freeze und die hier genannten Test-HTML-Hashes bleiben an den tatsächlichen Prüfstand gebunden. Ein späterer sauberer Dokumentations-/Paketcommit wird anhand seines Build-/Paketmanifests identifiziert; seine Identität wird nicht rückwirkend in diese Runtime-Nachweise geschrieben. Die konkreten CI-Ergebnisse werden am jeweiligen Head des [Draft-PR #3](https://github.com/Feerson1617/Ein-Tag-als-Ranger/pull/3) dokumentiert. Quellenpaket und Abnahme-ZIP sind lokale Ausgaben, kein Release oder Deployment.
