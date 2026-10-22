# Neue Abschlussprüfung des Korrekturauftrags

Ausgang: eece965c2afdd367ab9a610e0e05d09e9c706388. Letzter geänderter Appstand: 55c2ecd184ea79b8b829a2a6486114cc964d497a. Alle 50 Runtimequellen (42 Module, fünf Medien, HTML/CSS/Icon) sind einzeln per SHA256 gebunden. Spätere Werkzeug-/Berichtscommits ändern diese Quellen nicht. Originalzeiten, Fehler und Buildkennungen bleiben pro Lauf erhalten.

| Tatsächlich ausgeführte Prüfung | Ergebnis / Aussage |
|---|---|
| Bestehende Node-Suiten | 26/26 BESTANDEN |
| Kompakt-Modell-/Import-/Pädagogikgruppen | 76/76 BESTANDEN: 14 Referenz, 34 Lernen, 9 QA, 5 Küsten-, 6 Habitat- und 8 Pädagogikgruppen |
| Python-Paketmethoden | 9/9 BESTANDEN |
| Quell-Einstieg dist/kompakt.html | BESTANDEN, 2 Blöcke |
| Website-Build mit echtem WebGL | BESTANDEN, 18 Blöcke |
| Saubere Kompakt-Einzeldatei | BESTANDEN, 5 Blöcke |
| Web K1–K5 / Speichern / Import / Touch / Galerie | BESTANDEN, 18 Blöcke, 37 Taxa-/Stadienansichten |
| K1–K5 in tatsächlicher Einzeldatei | BESTANDEN, 17 Blöcke |
| Echte Dateiimporte einschließlich 250-ms-Dateilesefixture | BESTANDEN, 15 Fälle, Originalspeicher bytegleich nach Ablehnung |
| Vier tatsächliche Nahrungserwerbsfolgen | BESTANDEN, 28 unveränderte Renderbilder; Mehrseed-/Schrittregression zusätzlich in Node |
| Eigene Vergleichskameras, Gehen, NPCs, Gezeiten | BESTANDEN, 6 Blöcke / 26 Bilder |
| Arbeitsblätter / Lehrkräfte | BESTANDEN, je 25 Karten, 41/54 PDF-Seiten, keine externen Medienrequests |
| Kontinuierliche Standalone-Stabilität | BESTANDEN, 1207.89 s tatsächliche Messphase, 1223.5 s einschließlich Abschlussprüfungen, nach 271.12 s separatem Aufwärmen |
| Native WebGL-Kontextwiederherstellung im Dauerlauf | BESTANDEN |
| Große Fassung, Live M1–M3 + Resilienz, 800×500 | FEHLGESCHLAGEN, 3 abgeschlossene Blöcke |
| Große Einzeldatei, 800×500 | BESTANDEN, 3 Blöcke |
| 30 FPS im gemessenen Cloudprofil | FEHLGESCHLAGEN; Median dünner Frameintervallstichproben 1683.25 ms |
| Physisches iPad 9 / Safari / iPadOS 27 | NICHT GEPRÜFT |
| Unabhängige biologische/visuelle Abnahme, Unterrichtswirkung | NICHT GEPRÜFT; volle gestalterische Waldzielerreichung in eigener Sichtprüfung FEHLGESCHLAGEN |

Node 24.19.0, Python 3.12.14, Chromium 154.0.8037.57. Linux-Cloud/Xeon 8573C mit fünf sichtbaren logischen Kernen; Chromium erzwingt SwiftShader-Softwaregrafik. Das ist weder eine gemessene Apple-GPU noch ein garantiertes Gerätebudget. Die Touchläufe verwenden 1080×810 und 810×1080 CSS-Pixel/DPR2. Hardwarekompatibilität und reales Safari-Verhalten werden daraus nicht abgeleitet.

Erste kalte Webnavigation der Lernprüfung: 9383646 Transferbytes bei 3817,1 ms bis zur Startfreigabe, lokaler HTTP-Kontext. Das ist keine WAN-/Safari-Startzeit. JS-Heap im Dauerlauf: 84404314–91407419 Bytes einschließlich GC; erste/letzte Fünfermediane 86758571/87569219 Bytes. Geometrie-/Texturgrenzen sind relative Laufprüfungen, keine absolute Gerätespeicherzusage. Sparse Frameintervalle sind keine vollständige FPS-Verteilung. Funktionale Stabilität bedeutet keine flüssige Darstellung.

Native Tabaktivierung im Dauerlauf: gemeldete Sichtbarkeit während des anderen Tabs = visible, nach Rückkehr = visible. Headless Chromium meldet gegebenenfalls weiterhin sichtbar; dann ist damit nur Aktivierung/Rückkehr, keine Hintergrundpausierung nachgewiesen. Es wird kein Sichtbarkeitszustand injiziert.

## Lern-, Speicher- und Vergleichsregressionen

K1–K5 wurden erneut über echte UI-Handlungen erworben. Die Feldbücher enthalten eigene Beobachtungen, Unsicherheit, falsche Antworten, K2-Kontrollläufe, K3-Einzeltiervergleich und Nullprobe, K4-Energiefehler und K5-relevante Küstenbelege. Reload, Download/Import/Wiederaufnahme, Quota-Sicherung und alte Archive wurden mitgeprüft. Offene Texte werden nicht fachlich per Stichwort benotet. Importierte Abschlussflags werden neu berechnet.

M3/K3 verlangen dasselbe konkrete Individuum, Szenenkontext, Stelle/Tiefe und getrennte vollständige, zeitlich geordnete Beobachtungsfenster. Unterschiedliche Individuen, Seed/Rundgang/Modellstand, überlappende Fenster und widersprüchliche Zustände scheitern. K3 verlangt Niedrigwasser vor Hochwasser; M3 erlaubt auch die umgekehrte Erhebungsreihenfolge bei klar getrennten, datierten Fenstern. M1-Fokus-/Werkzeug-/Zeitregressionen bleiben in mission-runtime-check.mjs abgesichert. Die ursprünglichen 120/180-Sekunden-Limits und alle Beobachtungsbedingungen sind unverändert.

## Fehlversuche bleiben sichtbar

Die eigene unveränderte Baseline reproduzierte F01/F04, fehlende Nahrungserwerbe und Positionssprünge. Das unabhängige QA-Archiv war wegen der Transfergrenze nicht lesbar; seine Dateien, Originalkameras und behaupteten Ergebnisse wurden nicht als selbst gelesen ausgegeben.

Ein neuer Importtreiber las die Meldung vor Ende von File.text. Die frische DOM-Antwort wird jetzt abgewartet; eine ausdrücklich verzögerte Dateilesung prüft diesen Treiber. Die Anwendung lehnte bereits im Fehlerbild korrekt ab. Zwei Kameraversuche trafen automatisch nachgeführte Blickpunkte; die eigenen festen XZ/Winkel und echte Mauseingaben stellen die Vergleichbarkeit her.

Eine grobe 0,25-s-Fressbildabtastung traf die Suchschnabelspitze 1–2 mm im Sediment. Tatsächliche Geländestrahlen reproduzieren diese Sichtverdeckung, kein Stegtreffer. Die sichtbare 0,025-s-Feinschrittweite erfasst den vorhandenen Phasenübergang; Tierzustände, Beute, Ressourcen und Assertions wurden dafür nicht ersetzt.

Ein neuer Dauerlauf scheiterte nach 517,51 Messsekunden an Playwrights sicht-/aktiv-/stabil-Klickwartezeit für Totholz. Es gibt kein frisches Fehler-DOM/Bild aus diesem alten Pfad; der interne Teilgrund wird nicht als vollständig rekonstruiert ausgegeben. Native Mausereignisse mit expliziter Sicht-/Aktiv-/Trefferprüfung und anschließendem Schließen-/Rendernachweis ersetzen diesen Treiberpfad. Künftige Fehler sichern DOM und Bild. Ein weiterer erfolgreicher Lauf wurde mit neuem Aufwärmen und vollen 1200 Messsekunden ausgeführt; der alte Versuch bleibt FEHLGESCHLAGEN in phase5-stability-attempt.

Der erste neue vollständige Web-Lernlauf scheiterte nach 34 Galeriebildern an Playwrights Rahmenstabilitätswartezeit. Der Wiederholungslauf besteht mit nativen Mausereignissen, sichtbarem/aktivem Button, elementFromPoint-Trefferprüfung und anschließendem Abgleich des geöffneten Individuums. Kein Force-Klick, kein längeres Limit. Der browserinterne Grund des alten Stillstands ist nicht vollständig rekonstruiert. Der ursprüngliche Fehllauf bleibt unter phase5-gallery-attempt erhalten.

Im verworfenen früheren Plan enthielt die Scheduler-Zeit von 1505,83 s für reference eine bewusst angehaltene Elternsteuerung; sie ist kein Browserleistungswert. Der neue vollständige Plan ist separat und ohne diese Pause ausgeführt. Der 20-Minuten-Lauf summiert keine anderen Prüfzeiten.

Große Fassung, aktueller Gesamtversuch: ["Page.wait_for_function: Timeout 180000 ms exceeded."]. Tatsächlich abgeschlossene Blöcke: ["boot, two main entries, three mission choices, real WebGL startup", "LIVE M1: three concrete focal taxa, observation button, feature comparisons and justified uncertainty", "LIVE M2: real simulation event, finite shared resource, explicitly read protocol, interpretation"]. Fehlerdetails und frische Bilder bleiben erhalten; kein anderer Versuch überschreibt dessen Ergebnis.

## Belege und Reproduktion

Aktuelle Rohdaten: verification/kompakt-korrektur/final/SUMMARY.json und SHA256.json; fehlgeschlagene Versuche separat daneben. Die historischen unveränderten Nachweise unter verification/kompakt-v2 gehören zum früheren Runtimepunkt 5be5e9b und sind keine Nachweise der neuen Runtime. Befundtabelle und verbleibende Grenzen: KORREKTUREN.md. Bilder sind unveränderte WebGL-Aufnahmen; Vergleichskameras sind eigene Reproduktionen, keine unbekannten Originalkameras des unabhängigen Reviews.

```sh
python tools/check-compact-corrections.py
# Alternativ die einzelnen Schritte:
python tools/run-checks.py
python tools/check-compact.py
python tools/build-web.py
python tools/verify-web.py
python tools/build-standalone.py
python tools/build-compact.py
python tools/verify-compact.py
python -m unittest discover -s tests -p 'test_*.py' -v
python tools/package-project.py
python tools/browser-compact-source.py
python tools/browser-compact.py
python tools/browser-compact.py --site outputs --entry Ranger-Kompakt.html --smoke
python tools/browser-compact-learning.py --gallery
python tools/browser-compact-learning.py --site outputs --entry Ranger-Kompakt.html --output work/compact-learning-standalone
python tools/browser-compact-imports.py --output work/qa-correction/final-imports
python tools/browser-compact-feeding.py --output work/qa-correction/final-feeding
python tools/browser-compact-habitats.py --output work/qa-correction/final-habitats
python tools/print-compact-materials.py
python tools/browser-compact-stability.py
python tools/browser-check.py --live --resilience --width 800 --height 500 --site outputs/GitHub-Pages --prefix /Ein-Tag-als-Ranger/
python tools/browser-check.py --smoke --width 800 --height 500 --site outputs --entry Feldbuch.html
python tools/package-compact-corrections.py
```

Diese Browserwerkzeuge benötigen Playwright/Chromium und lokale HTTP-Sockets. Alle Builds bleiben lokal. Der abschließende beauftragte Branch-Push startet PR-CI; dessen tatsächlicher Status steht im Draft-PR #3. Ein früherer grüner CI-Lauf wird nicht als Prüfung des neuen Heads ausgegeben. Kein Merge, Deployment oder Release.

## Separater M3-/UI-/Resilienzlauf mit kleinerem Viewport

600×375, vorhandene CLI-Auswahl m3, gleiche sechs Modellsekunden/180 s: FEHLGESCHLAGEN; nur der Startblock bestand. Der erste tatsächliche Protokollbeleg (6,1432 Modellsekunden für wadden:138) steht in legacy-m3-profile/failed-earned-fieldbook.json; Profil/Fehler: legacy-m3-profile/result.json. Das zweite Fenster erreichte 5,8/6 Modellsekunden (p95 2933,2 ms). Der vollständige 800×500-Lauf bleibt FEHLGESCHLAGEN mit M1/M2 erfolgreich und M3 bei 4,5/6 Modellsekunden (p95 3499,9 ms; keine JS-/Konsolen-/HTTP-Fehler). Dies ist eine andere Darstellungsgröße, keine gelockerte Belegbedingung. M1/M2 sind in den neuen lokalen Läufen tatsächlich erfolgreich; M3 wurde lokal nicht vollständig erworben. Ein Fixture-Test ersetzt diesen Erwerb nicht. CI behält 800×500.

## Separater regulärer Legacy-UI-/Speicher-/Resilienzlauf

800×500 ohne Live-Erwerb: BESTANDEN, 12 Blöcke. Hier werden Missionsformulare mit ausdrücklich bezeichneten Fixtures sowie echte UI-Import-/Export-/Speicher-/Quota-/Grafik-Fehlerwege geprüft. Dies ersetzt keinen tatsächlich erspielten M3-Abschluss. Rohdaten: legacy-ui-resilience/result.json.
