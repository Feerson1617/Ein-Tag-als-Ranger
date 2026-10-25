# Ranger Kompakt V1 – aktueller Abschlusskandidat

**RC lieferbar im vorab festgelegten Softwareumfang D1–D4.** Geräte-, Safari-, Unterrichts- und Veröffentlichungsfreigabe bleiben getrennt. Genau ein aktueller Kandidat: **`ranger-kompakt-v1.0.0-rc.1-4eb186a5325a`**. Der frühere e9899ef-Kandidat ist historisch und wird nicht erneut als aktuelle Lieferung angeboten.

## Eindeutiger Lieferstand

| Gegenstand | Identität |
|---|---|
| Produkt und QA-Treiber | `4eb186a5325ae30dfa233e10dd44eb73ea710afa` |
| Runtimebaum SHA256 | `c0de642ab378548f7422dd5e0206ff54af70562d6eec7e7c5c4b7ceccf922bc1` |
| Tatsächlich geprüfte Einzel-HTML SHA256 | `3748c6590afefb18a5e07bb3cedc2c40b0b2be1619a57cc52553a30de5869412` |
| Webmanifest SHA256 | `bde34af101acb396cc2c73d37985865660e806daf99bd5394564a4bd97d93aaa` |
| Webmanifest beim funktionalen Abschlusslauf | `0746e31d51e2dc0f9236a747ae9e40a5fe9943ca964daa2f18bc4301403d4bf9` |
| Lernpaket-Buildinfo SHA256 | `e62322175e3ba3f2645fc7be8cf379113293dfe22777dc3e1bb26dc3938b3e97` |

Der saubere Produktcommit wurde vor dem vollständigen neuen Lauf erzeugt. Danach bleiben sämtliche Spielmodule, CSS, Medien, Web-Einstieg, Einzel-HTML und Lernpaket eingefroren. Ausschließlich die Statusdatei des Webpakets und ihre Manifestbindung wurden anschließend dokumentarisch korrigiert: Die Datei nannte fälschlich den vorherigen Kandidaten und verlinkte einen dort nicht enthaltenen Bericht. Alle ausführbaren Dateien bleiben bytegleich; der unveränderte Paketverifizierer wurde erneut ausgeführt. Ursprüngliches Manifest und ursprüngliche Freeze-Datei bleiben erhalten. Der abschließende reine Nachweis-/Liefercommit steht separat in `LIEFERUNG.json`, um keine Commit-Selbstreferenz zu erzeugen. [Runtimebindung](Nachweise/runtime-freeze.json), [Statuskorrektur mit Vorher-/Nachherhashes](Nachweise/documentation-package-update.json), [begrenzter Produktänderungsnachweis](Nachweise/change-scope-binding.json).

Eigene aktuelle Ausführung: 25.10.2026 UTC, Linux, Node 24.19.0, Python 3.12.14, Chromium 154.0.8037.57/SwiftShader. Das ist eine Cloudprüfung, kein unterstütztes reales Schulgeräteprofil. Der ursprüngliche Inhalts-/Quellaudit bleibt an den funktionalen Produktstand gebunden. Das nach dem reinen Dokumentationscommit erneut erzeugte Quell-ZIP erhält einen eigenen Lieferaudit; dessen Commit und Hash werden separat in `LIEFERUNG.json` gebunden. Der frühere Audit wird dabei nicht überschrieben.

Vollständige Zeit-/Befehls-/Buildkontexte liegen unter `Nachweise/contexts/` und `Nachweise/environment.json`.

## Gezielte Ursachenanalyse und Korrekturen

**Produktfehler beim Druck:** Der generische Systemfont erzeugte unterschiedliche Metriken. Auf identischem Inhalt liefert der Cloudfont OpenAI Sans 2 Starter-/39 Schülerseiten, DejaVu Sans 3/40, Arial mit tatsächlichem Liberation-Sans-Fallback 2/38. Die unveränderte originale Zwei-Seiten-Assertion wurde mit DejaVu Sans tatsächlich zum Scheitern gebracht; [vollständiger lokaler Traceback](Nachweise/historical-diagnostics/print-original-dejavu.log) und [Fontmessung](Nachweise/historical-diagnostics/font-probe/result.json) bleiben erhalten. Welchen Font der frühere CI-Rechner tatsächlich nutzte, ist ohne dessen Artefakte nicht nachgewiesen. Die zwei bestehenden Dokumentgeneratoren legen jetzt ausschließlich im Druck Arial/Liberation Sans fest. Keine Texte, Schriftgrößen, Ränder, Zeilenhöhen, Schreibflächen oder Assertions wurden reduziert. Alle fünf HTML-Dokumente sind außerhalb ihrer Style-Tags bytegleich, `Materialkarten.json` ebenfalls. 52 weitere eingebundene Runtime-/Medien-/CSS-Dateien bleiben bytegleich.

**Zusätzlicher Testfehler der Detailfolge:** Der vorherige Treiber ignorierte die bereits angefangene erste Löffler-Beute und verfolgte anschließend eine zweite, während die Produktkamera korrekt die erste hielt. Der korrigierte Treiber beginnt über die öffentliche Oberfläche einen expliziten neuen lokalen Versuch bei Zeit 0 und erfasst die erste tatsächliche Annäherungsphase. Ort und gespeicherte Bytes werden zusätzlich unverändert geprüft. Die ursprünglichen Kontakt-/Identitäts-/Sicht-/Zeitkreditassertions bleiben bestehen. Beide Modi bestehen für alle vier Arten. Kein Produktkamera- oder Speicherfix war dafür nötig. [Unveränderter Fehlbefund](Nachweise/historical-diagnostics/feeding-detail/result.json), [neuer Detailtest](Nachweise/feeding-detail/result.json).

**Behebbarer Umgebungsfehler beim Videostart:** Der erste höher aufgelöste Weglauf scheiterte vor dem Öffnen der Spielseite, weil FFmpeg im gewählten Playwright-Verzeichnis fehlte. Der unveränderte vollständige Traceback und der ursprüngliche 34-Prozess-Plan bleiben erhalten. Der offizielle Nachinstallationsversuch endete ebenfalls mit HTTP 403. Der vorhandene System-FFmpeg 7.1.5 wurde am erwarteten lokalen Encoderpfad angebunden; eine echte VP8-Aufnahme und deren `ffprobe`-Prüfung bestätigten die Abhängigkeit. Danach wurde ausschließlich dieser Lauf mit identischen Optionen und Assertions in einem neuen Ausgabeordner wiederholt. Der ursprüngliche Fehler bleibt ein Fehler; der separate erfolgreiche Wiederholungslauf erfüllt den zuvor blockierten Softwarevertrag. Die Kontaktbogen-Erzeugung scheiterte zunächst ebenfalls an den fehlenden Eingabedaten und wurde nach dem erfolgreichen Wiederholungslauf fortgesetzt; ihre bereits erfolgreichen UI-/Inhaltsprüfungen wurden nicht umetikettiert. [Originalplan](Nachweise/main-plan-original-result.json), [originaler Traceback](Nachweise/logs/v1-full-walk-feeding.log), [Umgebungsbeleg](Nachweise/ffmpeg-environment/result.json), [separater Wiederholungslauf](Nachweise/retry-run-status.json).

**CI-Ankunftsfehler:** Lauf 40101598733 bleibt fehlgeschlagen: gemeldeter 900-s-Abbruch bei Wegpunkt 1386, x = 54.73158935811298 / z = −9.557866034125013. Vollständige ursprüngliche CI-Tracebacks waren nicht verfügbar; offizieller Log-/Artefaktzugriff HTTP 403. Keine Zeilen wurden erfunden. Der unveränderte lokale Vorprüfungslauf schaffte den Hauptweg in 667,25 s und den Gesamttest vollständig. Die genaue Ursache des abweichenden CI-Rechnerverhaltens ist damit lokal nicht bewiesen. Der originale 900-s-Vertrag, der Treiber und alle Assertions bleiben unverändert. Neuer lokaler und neuer CI-Befund stehen unten jeweils separat; ein längerer Funktionslauf ersetzt keinen fehlgeschlagenen Budgetlauf.

Die bereits umgesetzten V1-Verträge bleiben erhalten: gekoppelte äußere Nahrungsaufnahme/Identität, scrollbare kleine Ansicht, begrenzter Waldentwurf/Rendergruppen, historische Revisionen 1–6 und aktuelle Revision 7, zwei kurze Unterrichtspfade, 25 Karten und C17-Provenienz. Keine neuen Arten, Missionen, Lebensräume oder Spielsysteme. C17 trennt sechs Wochen Konditionierung vom thermisch ausgelösten Laichversuch; 3.380.000 / 12 = 281.666,7 Eier je tatsächlich ablaichendem Weibchen ist keine Jahresrate. Der unabhängige gelieferte Primärabgleich bleibt als Herkunft benannt; ein eigener neuer Volltextabruf wird nicht behauptet. C23 bleibt ein externer BPA-Datenfall.

Der lokale unveränderte Weglauf durchquert den Bereich der gemeldeten CI-Position zwischen Wegpunkt 1382 und 1406 ohne Stillstand. Der nächste abgetastete Streckenabschnitt liegt rund 0,029 m von der gemeldeten Position entfernt; das ist eine Strecke zwischen Messpunkten, kein erfundener exakter CI-Messpunkt. Der vollständige Hauptweg benötigt 225,717 Modellsekunden in 667,251 Wandsekunden. Damit ist eine lokale Wegblockade an dieser Stelle nicht reproduziert, langsamer Software-Modellfortschritt dagegen gemessen. Die konkrete CI-Ursache bleibt mangels Originaltelemetrie offen. [Historischer lokaler Positionsabgleich](Nachweise/arrival-position-diagnosis.json). Der neue unveränderte Originaltreiber auf dem aktuellen HTML-Stand passiert denselben Bereich zwischen den aufgezeichneten Wegpunkten 1364 und 1387, nach 566,55 bis 571,70 realen Sekunden. Der nächste abgetastete Abschnitt liegt etwa 0,010 m von der gemeldeten Position entfernt. Auch dies ist ein lokaler Streckenvergleich, keine nachträglich erfundene CI-Telemetrie. [Aktueller Abgleich](Nachweise/arrival-current-position-diagnosis.json).

## Eigene neue Prüfbelege am ausgelieferten Build

| Prüfung | Ergebnis / Reichweite |
|---|---|
| Vollständiger Abschlussplan | **34/35 Prozesse bestanden**. Fehlgeschlagene Prozesse: **v1-full-walk-feeding**. Der erste Videostart scheiterte vor dem Laden des Spiels am fehlenden FFmpeg; nach Umgebungskorrektur bestand derselbe Lauf separat. Der ursprüngliche FAIL bleibt erhalten. Verpflichtende Softwareverträge damit erfüllt; D3-Diagnose separat. [Rohplan](Nachweise/result.json) |
| Node/Python/Build/Pakete | **28 Legacy- und 13 Kompakt-Node-Prüfreihen sowie 9 Python-Tests bestanden**; beide Webverifizierer, beide Einzel-HTMLs, Lernpaket und Quell-ZIP neu geprüft. |
| K1–K5 über tatsächliche UI | Quelle `18` Gruppen einschließlich Galerie, Web `17`, ausgelieferte HTML `17`. Richtig/falsch/unvollständig/berechtigt unsicher, Transfer, neue Versuche, Reload, Export/Import. Keine direkten Speicherflags als positive Lernleistung. |
| Imports/Fachverträge | **51 native Fälle bestanden**: Original-F01/F04/N05, identische Kopien, gültige alte Bücher, atomare Ablehnung widersprüchlicher Ereignisse/Kontexte, Quota und Rohexport. K3 schützt konkretes Individuum, Bedingungen, Szenen-/Run-Kontext und Reihenfolge; K5 weist sachfremde Belege ab. |
| Alte Spielversion | **16 Gruppen** mit M1–M3, freiem Spiel und Speicher-/Reloadfällen; zusätzlich 3 Einzeldatei-Smokegruppen. Der ursprüngliche 120-s-M1-Fokuswartevertrag bleibt unverändert. |
| Nahrungsaufnahme | Vier aktuelle normale und vier Detail-Referenzfolgen; zusätzlich vollständiger echter Weg und **8 Folgen / 56 Phasen** selbst gesichtet: vier unbeschleunigt, vier nach ausdrücklich 1200 Modellsekunden. Kontakt/Verbrauch/Run-/Individuen-/Beute-/Ereignisidentität numerisch und visuell. Kein eigener Sichtzeitkredit durch Modellschritte. [Sichtung](Nachweise/own-feeding-review.json) |
| Original 900-s-Diagnose | Status: **BESTANDEN**. full-main-route: 667.16 s; return-to-study-spur: 126.85 s; study-spur: 34.25 s. 900 s gelten unverändert je Wegsegment, nicht für den gesamten Prozess einschließlich Beobachtungen. [Originaltreiberlauf](Nachweise/arrival-original900/result.json) |
| Separater höher aufgelöster Funktionsweg | shortcut-out: 117.73 s; shortcut-return: 203.82 s; full-main-route: 1001.12 s; return-to-study-spur: 162.16 s; study-spur: 44.07 s. Abkürzung/Rückkehr ebenfalls über Eingaben geprüft. Längeres gesondertes Budget, kein Ersatz für die Originaldiagnose. |
| 20 reale Minuten | **1214.39 s zusammenhängende Messzeit**, 79 Stichproben; Aufwärmen 246.73 s separat, Messfenster einschließlich Nachprüfung 1218.44 s. Begrenzte Geometrie-/Texturressourcen und echte Kontextwiederherstellung, keine Zeitaddition kurzer Läufe. |
| Bedienung/WebGL | **12 UI-Gruppen**, vier Pflichtviewports, Rotation, nativer 200 %-Zoom, Eingabeabschirmung und Kontextverlust/Wiederherstellung. Ergänzende vollständige native Aufnahmen selbst gesichtet. [UI-Sichtung](Nachweise/own-ui-review.json) |
| Wald und Organismen | Sechs tatsächliche identische Festkameras plus drei Gehblicke erneut gesichtet; Reh/Specht und vier Bestimmungspflanzen gezielt geprüft. Begrenzter D2-Entwurf, keine anatomische Vollfreigabe aller 36 Taxa oder Photorealismusbehauptung. [Wald](Nachweise/own-forest-review.json), [Fokustaxa](Nachweise/own-organism-review.json) |
| Frischer vollständiger Druck | **5 PDFs / 103 Seiten**: 38 Schüler-, 59 Lehrkräfte- und 6 kurze Seiten. Alle Seiten im Raster, 22 Seiten lesbar gesichtet. Vollständige Text-/Tabellen-/Schreibflächenassertions und beide Fontprofile bestanden. [Sichtung](Nachweise/own-print-review.json) |
| Inhalt/Rechte/Quellpaket | Tatsächliche Inventare, ZIP-Integrität, geschlossene Runtimeabhängigkeiten, bestehende Quellen-/Asset-/Three-Nachweise geprüft. Keine neuen Fremdassets oder fremden Volltexte; synthetische QA-Daten sind keine echten Schülerdaten. Begrenzter Schlüssel-/Privatprofilaudit, keine universelle Rechtsgarantie. [Audit](Nachweise/public-content-audit.json) |

Die Tests belegen ihren angegebenen Funktionsumfang. Sie sind keine automatische fachliche, didaktische oder gestalterische Gesamtfreigabe. [Alle 21 Matrixzeilen](PRUEFMATRIX.md) enthalten Datum, Build, Belegart, Reichweite und unveränderte historische Bewertungen. [Bildindex](BILDBELEGE.html), [Reproduktion](Reproduktion/START-REPRODUKTION.md).

## Neuer GitHub-Actions-Lauf

[40162404068](https://github.com/Feerson1617/Ein-Tag-als-Ranger/actions/runs/40162404068) auf dem exakt eingefrorenen Produktcommit: **failure**. Die originalen Ankunfts-/Druckschritte bleiben erhalten; hinzugekommen sind der Detailtreiber und der echte Fontregressionstest. [Vollständige eigene Statusabfrage mit Schrittstatus](Nachweise/ci-product.json).

| Job | Tatsächlicher Abschluss |
|---|---|
| compact-arrival-and-print | failure |
| compact-historical-portability (ubuntu-latest, 24.19.0) | success |
| compact-corrections | success |
| verify | success |
| compact-learning | success |
| compact-historical-portability (macos-latest, 24.21.0) | success |
| compact | success |
| compact-historical-portability (ubuntu-latest, 24.21.0) | success |
| compact-historical-portability (macos-latest, 24.19.0) | success |

Der neue Ankunftsschritt lief laut offizieller Metadaten von 04:35:46 bis 04:51:13 UTC (927 s einschließlich Einrichtung/Fehlerabschluss). Auch sein vollständiger Log und das neue Originalartefakt werden am Host `productionresultssa15.blob.core.windows.net` mit HTTP 403 blockiert. Daher wird kein genauer neuer Wegpunkt oder Traceback behauptet. [Aktueller Logabruf](Nachweise/ci-new-log-access.json), [Artefaktabruf](Nachweise/ci-new-artifact-access.json), [Schrittmetadaten](Nachweise/ci-new-job.json).

Ein späterer Dokumentationslauf wird separat in LIEFERUNG.json ausgewiesen. Keine alten FAILs wurden umetikettiert; insbesondere der frühere CI-Lauf bleibt 8 erfolgreich / 1 fehlgeschlagen. Ein leerer `gh run view --log`-Abruf ist kein gelesener Lognachweis. Der offizielle Download von Chromium 151 war in der Cloud ebenfalls HTTP 403; die eigene Ausführung mit 154 ist nicht als 151- oder macOS-Reproduktion dargestellt.

## Verbleibende Grenzen und eine priorisierte Restliste

Aktuelle kurze serielle Softwaregrafikprofile: **forest: 1.803 FPS / p95 700 ms; coast: 1.397 FPS / p95 849.9 ms; detail: 4.827 FPS / p95 500 ms**. 30 FPS/p95 ≤ 50 ms werden damit nicht als erfüllt erklärt. Das 0,065-s-Framecap bleibt unverändert; verlangsamte Modellzeit wird angezeigt. CPU-/Abgabeintervalle sind keine native GPU-Zeitmessung. Historische M1-60 FPS-Berichte ersetzen keine aktuelle Hardwareprüfung. D3 erlaubt den abgegrenzten Softwarekandidaten, ohne einen roten CI-Budgetschritt oder fehlende Hardwareabnahme grün zu nennen.

`file://` und ein tatsächlicher `document.hidden`-Hintergrundfall sind im verwalteten Browser im dokumentierten Umfang nicht ausführbar und bleiben **NICHT GEPRÜFT**. HTTP mit Projektpräfix, tatsächliche Eingaben, Pause und WebGL-Rückkehr sind getrennt geprüft. Landschaft und Organismen bleiben sichtbar stilisiert: geometrische Kronen, teils regelmäßige Hintergrundstämme, runde Strauchvolumen und vereinfachte Anatomie. Sehr kleine Würmer und Garnelen bleiben in maßstabstreuen Nahbildern dünn und teilweise kontrastarm; die gekoppelte äußere Interaktion ist sichtbar, eine detailreiche Beutebestimmung wird nicht behauptet. Alle 56 Phasenbilder wurden gesichtet, keine vollständige Videosichtung behauptet. Der gezielte Nutzerentscheid über den begrenzten Waldentwurf bleibt offen; keine neue ästhetische Ausbauphase.

1. **Offene CI-Diagnose:** Der Original-Ankunftstest des Produktlaufs 40162404068 bleibt fehlgeschlagen. Für dessen genaue Ursache fehlen zugängliche Originaltelemetrie und Traceback. Ein lokaler Erfolg hebt den CI-Fehler nicht auf; der festgelegte D3-Softwareumfang ist getrennt von dieser offenen Betriebsdiagnose.
2. **Reale Nutzer-/Geräteabnahme:** Waldentwurf entscheiden und tatsächliches Apple iPad 9 mit real eingetragener OS-/Safari-Version prüfen: K1/K3, Import/Export, Rotation, Hintergrund, WebGL und 20 Minuten; 30 FPS/p95 ≤ 50 ms dort messen. „iPadOS 27“ bleibt unverifizierte Nutzerangabe. [Abhakblatt](GERAETE-UND-PILOT-V1.md).
3. **Begleiteter Unterrichtspilot:** Verständlichkeit, reale Such-/Lesezeiten, Hilfen, Erst-/Revisionsprodukte und Naturtransfer erheben. Keine erfundenen Schülerzeiten, Noten oder Wirkungsbehauptungen.
4. **Gesonderte Veröffentlichung:** Erst nach ausdrücklicher separater Freigabe. PR #3 bleibt Draft; kein Merge, keine Änderung an main, kein Deployment, kein veröffentlichtes Release.

Damit endet die freigegebene begrenzte Umsetzung. Im belegten Softwareumfang besteht keine offene reproduzierte kritische Datenverlust-, Falschbeleg- oder Missionsblockade. Das Archiv enthält genau diesen aktuellen Kandidaten, die vollständigen Materialien, originale Fixtures, portable Treiber, ausgewählte Bilder und SHA256-Manifest. Frühere Kandidaten und rote Befunde bleiben historische Nachweise.
