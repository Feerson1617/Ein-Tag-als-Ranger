# Prüfstatus des Korrekturauftrags

Die vollständige neue Abschlussprüfung ist noch in Arbeit. Aktueller Fehlerstatus: KORREKTUREN.md; neue Belege: verification/kompakt-korrektur. Die folgenden alten Zahlen betreffen ausschließlich den ausdrücklich genannten historischen Runtime-Prüfpunkt und werden nicht auf neue Quellen übertragen.

# Historische Softwareprüfung vor dem unabhängigen Korrekturauftrag

Runtime-Prüfpunkt: `5be5e9b8f7394613279f5a2834741a0abf33b570`. Alle Browser- und Stabilitätsnachweise vergleichen dieselben Module, Medien, HTML und CSS einzeln per SHA256. Spätere Nachweis-/Paketcommits ändern diese Runtimequellen nicht. Die tatsächlichen Commitkennungen und Zeiten stehen pro Lauf im JSON; sie werden nicht durch den Dokumentationsstand ersetzt.

Node 24.19.0, Python 3.12.14, Chromium 154.0.8037.57 mit Cloud-Softwaregrafik; Python-Werkzeuge aus tools/requirements-dev.txt. Dies ist keine Safari-/Apple-Hardwareabnahme.

| Prüfung | Ergebnis |
|---|---|
| Bisherige Node-Prüfreihen | 26/26 erfolgreich |
| Kompakt-Referenzgruppen | 14/14 erfolgreich |
| Neue Lern-/Import-/Modellgruppen | 34/34 erfolgreich |
| Python-Paketmethoden | 9/9 erfolgreich |
| Kompakt-Chromium über Projektpfad | 18/18 erfolgreich |
| Kompakt-Einzeldatei | 5/5 erfolgreich |
| K1–K5, Importe, Materialien, Touch und Modellgalerie | 17/17 erfolgreich |
| Große Fassung: Live-Auswahl m3 + UI/Fehler, 600×375 | 14/14 erfolgreich |
| Große Fassung: Einzeldatei-Smoke | 3/3 erfolgreich |
| Web-, Einzeldatei-, Vorschau- und Quellpaket | erfolgreich gebaut und geprüft |
| Zwei druckbare Dokumente mit je 25 Karten | erfolgreich, keine externen Medienrequests |
| Erste spielbare Szene, kalter lokaler HTTP-Kontext | 8.86 MiB / 3.06 s bis Startfreigabe; 15-MiB-Obergrenze bestanden |
| Kontinuierliche Cloudstabilität | 1215.43 s, ohne Laufzeitfehler; Geometrie-/Texturzahlen innerhalb der geprüften Grenzen |
| Cloud-Grafikbudget 30 FPS | NICHT erreicht; Median der dünn abgetasteten Frameintervalle 1783.3 ms |
| Reales iPad 9 / Safari / iPadOS 27 und Unterrichtspilot | nicht durchgeführt |

Der Ersttransfer summiert Resource-Timing-transferSize einschließlich Navigation in einem frischen Browserkontext; keine WAN-/iPad-Startzeit. Browserberichtete JS-Heap-Spanne im Stabilitätslauf: 58606638–60825793 Bytes, inklusive GC-Zyklen; keine absolute Hardware-Speicherzusage. Der große CI-Prüfjob besitzt nach der historischen 29:22-Minuten-Baseline ein Gesamtbudget von 40 Minuten. Die beiden Kompakt-CI-Jobs besitzen ein Gesamtbudget von 30 Minuten für die erweiterten Render-/Einzeldateiprüfungen; individuelle Assertions und Missionszeitlimits bleiben unverändert. Die Frameintervall-Stichproben sind keine vollständige FPS-Verteilung. Funktionale Stabilität bedeutet keine flüssige Darstellung oder Gerätefreigabe. Modellbewegung wird bei langsamer Darstellung gedeckelt; aktive Sichtungszeit bleibt getrennt. Der 20-Minuten-Lauf beginnt nach zwei protokollierten Aufwärmrunden aller Messansichten (371.51 s); die Aufwärmzeit zählt nicht zu den 1215.43 s. Er ist nicht die aufsummierte Dauer anderer Tests.

## Regressionen und tatsächlich erworbene Belege

M1 und M2 wurden in den archivierten 800×500- und 600×375-Gesamtversuchen jeweils vor dem M3-Timeout tatsächlich abgeschlossen. Der nachfolgende frische Legacy-Lauf verwendet die Live-Auswahl m3 bei 600×375; die Missionen werden damit über getrennte tatsächliche Läufe nachgewiesen. Ein vollständiger lokaler Durchlauf aller drei zusammen blieb an der nachfolgend dokumentierten Cloud-Rendergrenze hängen. Der frische Lauf prüft freie Erkundung, Neuladen, JSON-Import/-Export, Speicherfehler und echte Grafik-Wiederherstellung. Der ursprüngliche M1-Timeout bleibt 120 Sekunden. Fokus-/Sicht-/Werkzeugwechsel und der ursprüngliche physikzeitbedingte Stillstand sind weiterhin durch mission-runtime-check.mjs abgesichert; frühere Ursachenanalyse: verification/pr1-hardening/README.md.

M3 und K3 verlangen dasselbe konkrete Individuum, identischen Szenenkontext, Stelle/Tiefe, getrennte zeitlich geordnete vollständige Beobachtungsfenster und passende Modellzustände. Andere Individuen, Neustarts, Kontextwidersprüche, überlappende Fenster und manipulierte Zustandsangaben tragen keinen Abschluss. Gültige kurze/unvollständige Daten bleiben lesbar. Importierte Abschlussflags werden neu berechnet.

K1–K5 wurden über echte UI-Aktionen erworben, einschließlich begründeter Unsicherheit, Konkurrenz-Kontrollläufen, negativem Vergleich verschiedener Muscheln, eA-Quadraten mit Nullprobe, falschem Energiekreislauf und mehreren begründbaren Managementoptionen. Eigene freie Texte bleiben unbenotet. Quota beim tatsächlichen Bearbeiten erhält den alten Stand und erlaubt die Sicherung des aktuellen Entwurfs als Datei. Der v1-Bootumzug erhält Originaldaten und große Speicherkeys ohne neue Gutschrift.

Die Galerie enthält 36 aktive Taxa plus Raupe aus tatsächlich gerenderten vorhandenen Geometrien; keine generierten Zielbilder. Touchprüfung: 1080×810 und 810×1080 CSS-Pixel, DPR2, automatisches Tabletprofil, Bewegung, Drehung des Viewports, Dialoge und erworbener Beleg. Angefragtes Ziel: Apple iPad der 9. Generation, Safari, iPadOS 27; die konkrete OS-/Gerätekombination und reale Safari-Lauffähigkeit sind nicht bestätigt.

## Fehlversuche und Korrekturen

Die lokale Legacyprüfung mit Live-Auswahl m3 verwendet nach den nachfolgend dokumentierten Cloudgrenzen 600×375. Die CI behält das Profil 800×500 bei. Das ist eine andere Darstellungsgröße, keine gelockerte Beleg-/Zeitbedingung.

Die historischen Phasen-0–2-Nachweise bleiben in verification/kompakt. Im aktuellen Ausbau wurden folgende konkrete Befunde korrigiert: globaler Missionsselektor überschreibt den HUD-Auftragsknopf; verzögerte Kontextverlustmeldung in der Nahansicht; Konkurrenzimporte fehlen in der Rundgangskontrolle; falsch typisierte verschachtelte Antworten führen nach Import zum Anzeigeabbruch; Leistungswarnung verdeckt bei mittlerem Viewport die Untersuchungsbedienung. Die Regressionen prüfen die ursprünglichen Anforderungen weiter.

Zusätzlicher Layoutnachweis: learning/layout-four-viewports.json hält die vier geprüften DOM-Viewportfälle mit tatsächlichem HTML/CSS und einer negativen Reproduktion der alten Überlagerung fest. Die 3D-Runtime war für diese gesonderte UI-Fixture blockiert; sie ist kein Spiel-/Beobachtungsbeleg. Der vollständige Treiber prüft die berechneten Abstände zusätzlich in der laufenden Anwendung auch bei ausgeblendeter Warnung (learning/layout-result.json).

Ein Galerie-Lauf scheiterte nach 16 bestandenen Blöcken ausschließlich am fehlenden Rotschenkelbild. Die Simulation hatte den Vogel tidebedingt von seiner Futterstelle wegbewegt; der Treiber suchte zu spät an derselben Stelle. Der erneute Treiber betrachtet ihn zuerst am realen Beobachtungssteg. Kein Tier wird versetzt oder neu erzeugt, keine Artenassertion entfernt und kein Timeout angehoben. Der Fehllauf bleibt in attempts/gallery-redshank erhalten.

Die visuelle Galerie zeigte außerdem eine unter dem Schnabel schwebende Eichel. Ihr Ursprung lag am Vogelkörper statt am Kopf-/Schnabelkontakt. Die Eichel folgt jetzt einem tatsächlichen Schnabelanker; ein zusätzlicher Node-Vertrag prüft reale Eichel-/Schnabelvertices unter mehreren Körper-/Kopfstellungen und reproduziert die alte Lücke negativ. Zusätzlich zeigt learning/jay-carry-contact.png die reale Transportphase nach sechs über die Oberfläche gesteuerten Modellsekunden; Ablauf und Quellhashes stehen in jay-contact-result.json. Die abschließenden Softwareprüfungen wurden danach auf der neuen Runtime vollständig neu gestartet.

Zwei lokale Legacy-800×500-Läufe sind fehlgeschlagen: zunächst die Locator-Anklickbarkeitsprüfung bei „Rotbuche suchen“ (45 s); ein altes Fehlerbild wurde ausdrücklich als veraltet erkannt und nicht diesem Lauf zugeordnet. Im unveränderten Wiederholungslauf gelangen M1 und M2, anschließend erreichte das M3-Fenster in 180 s nur 5,7 von 6 Modellsekunden (p95-Bildabstand 3416,5 ms, keine JS-/Konsolen-/HTTP-Fehler). Das Modellzeitminimum und alle Einzelzeitlimits blieben erhalten. Auch der vollständige 600×375-Lauf blieb bei 5,9/6 Modellsekunden stehen (p95 2283,2 ms). Ein nachfolgender frischer Lauf isoliert M3 über die bereits vorhandene CLI-Auswahl, weiterhin mit denselben sechs Modellsekunden und 180 s Limit. Der nachfolgende Funktionslauf nutzt den kleineren Viewport; CI prüft weiterhin 800×500. Die einmalige erste Klickstörung ist nicht ursächlich rekonstruiert und wird nicht als behobener Produktfehler ausgegeben. Aktuelle Fehlerdiagnosen sichern DOM, frische Bildzuordnung und erreichte eigene Feldbuchdaten.

Ein erster Stabilitätsversuch verwendete irrtümlich die erste kalte Waldansicht als Speicherbaseline. Beim Standortwechsel wurden weitere bereits vorhandene Geometrien erstmals auf die GPU geladen (47 zunächst, 60 nach der dritten Ansicht); der frühe Grenztest scheiterte vor der eigentlichen Dauerprüfung. Der korrigierte Treiber protokolliert zwei Aufwärmrunden über dieselben Ansichten und beginnt danach die vollen 20 Minuten. Die relativen Geometrie-/Texturgrenzen bleiben unverändert; sämtliche Pflanzenzahlen und Rundgang-IDs werden auch während des Aufwärmens geprüft.

Weitere Entwicklungsfehler: Rundung an einem sechssekündigen Protokollende (1e-8 numerische Toleranz, keine Zeitverkürzung), fehlerhafter Testfixture ohne quadratId, einmalige Python-Einrückung im Fehlerbildpfad, administrativ gesperrte file://-Navigation (lokaler HTTP-Zugang verwendet) sowie Aufklappen einer geschlossenen Test-Detailsgruppe. Überholte Läufe wurden nach neuen Befunden ausdrücklich beendet und nicht als abgeschlossene Gesamtläufe gezählt. Ergebnis-/Fehlerprotokolle: verification/kompakt-v2/attempts; der letzte vollständige Lauf steht separat in final-validation.json. Keine Assertion oder bestehende Missionswartezeit wurde abgeschwächt/angehoben.

## Nachweise und Reproduktion

verification/kompakt-v2/SUMMARY.json fasst die tatsächlichen Ergebnisse zusammen; SHA256.json bindet Dateien. reference/ enthält Bilder/Videos und Referenz-/Standaloneprüfungen, learning/ tatsächlich erworbene Lernprodukte/Downloads und Modellbilder, legacy/ den frischen M3-/UI-Lauf; tatsächliche M1-/M2-Abschlüsse stehen in den archivierten Gesamtversuchen unter attempts/, stability/ den kontinuierlichen Cloudlauf. Quellhashes sind in allen neuen Browserdaten identisch.

```sh
python tools/run-checks.py
node tests/kompakt-check.mjs
node tests/compact-learning-check.mjs
python tools/build-web.py
python tools/verify-web.py
python tools/build-standalone.py
python tools/build-compact.py
python tools/verify-compact.py
python -m unittest discover -s tests -p 'test_*.py' -v
python tools/package-project.py
python tools/browser-compact.py
python tools/browser-compact.py --site outputs --entry Ranger-Kompakt.html --smoke
python tools/browser-compact-learning.py --gallery
python tools/browser-check.py --live --live-mission m3 --resilience --width 600 --height 375 --site outputs/GitHub-Pages --prefix /Ein-Tag-als-Ranger/
python tools/browser-check.py --smoke --width 800 --height 500 --site outputs --entry Feldbuch.html
python tools/print-compact-materials.py
python tools/browser-compact-stability.py
python tools/package-compact-review.py
python tools/collect-compact-evidence.py
```

Die Browserwerkzeuge benötigen lokale HTTP-Sockets sowie Playwright/Chromium; in einer Cloud-Sandbox kann hierfür deren übliche Ausführungsfreigabe nötig sein. Alle Builds bleiben lokal. CI wird durch den abschließenden Push im bestehenden Draft-PR #3 erneut ausgeführt; der jeweilige Remote-Status steht bei den PR-Checks. Frühere grüne Läufe sind historische Baselines und werden nicht als Prüfung des neuen Heads ausgegeben.
