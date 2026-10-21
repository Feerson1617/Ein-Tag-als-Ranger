# Gezielte Nachprüfung von Draft-PR #1

Auftrag: C01/Mission 1 untersuchen, die Vergleichsbedingungen von Mission 3 absichern,
bestehende Missionen, freie Erkundung und Feldbuchfunktionen erneut prüfen.
Keine zusätzlichen Features, kein Merge, Deployment oder Veröffentlichen.

## Mission 1: nachgewiesene Ursache

Die Originalprotokolle von [Run 39595902666](https://github.com/Feerson1617/Ein-Tag-als-Ranger/actions/runs/39595902666)
sind jetzt abrufbar. `original-ci-excerpt.txt`, `original-ci-result.json` und
`original-ci-failure.png` belegen: zwei Pflanzen gesichert, Timeout beim dritten
Ziel Rotbuche, Lupe aktiv, unbekannte Pflanze, keine JS-/Konsolen-/HTTP-Fehler.
Der historische Lauf enthält keine Einzelbild-/Fokus-ID-Zeitreihe; eine ausschließliche
Rekonstruktion jedes damaligen Fokuswechsels ist damit nicht möglich.

Die lokale Reproduktion `m1-before.json` beobachtet den tatsächlichen Laufzustand
über einen ausschließlich lesenden Diagnosegetter im ausgelieferten Entwicklungsmodul.
Keine Freischaltung, Teleportation oder Änderung der Simulation. Bei langsamem
Chromium-/SwiftShader-Rendering ist ab t=58,11 bis t=119,41 s dasselbe Individuum
stabil im Blick. Nach diesen rund 61 realen Sekunden stabilen Fokus sind nur
1,0566 Beobachtungssekunden aufgelaufen.
Die Simulation steht bei 1,4466 s. Sichtbarkeit aktiv, Panel geschlossen, Lupe an,
manueller Fokus auf dasselbe registrierte Individuum. Der Mechanismus reproduziert
den Timeout schon beim Waldmeister; der historische CI-Lauf scheiterte bei der Buche.

Ursache: `frame()` reicht den auf 65 ms begrenzten Physikschritt auch an
Beobachtungszeit und Pflanzen-Kameranachführung weiter. Bei 24 Bildern in 120 s
kommen maximal 1,56 s zusammen. Weder fehlende Pflanzenidentität noch ein
Modellzustandswechsel ist für diese reproduzierte Blockade notwendig.

Änderung: aktive Beobachtungszeit wird zwischen zwei Sichtungen derselben konkreten
ID gemessen. Erster Sichtkontakt, andere ID, fehlende Sicht, Blickbedienung,
Werkzeugwechsel, Lesepause, Tabwechsel und Grafikverlust unterbrechen sie.
Pflanzen-Kameranachführung konvergiert nach verstrichener Zeit. Die Physik bleibt
begrenzt; M3 verlangt weiterhin sechs Modellsekunden. Eigene Belege unterscheiden
`observationSeconds` und die bereits vorhandene Simulationsdauer.

Der Regressionstest in `tests/mission-runtime-check.mjs` prüft alle drei
stationären M1-Ziele bei fünf Sekunden zwischen Einzelbildern, tatsächliche IDs,
die unveränderte Zwei-Sekunden-Schwelle sowie Pause/Fokus-/Sichtverlust.
Der Browser wartet weiterhin höchstens 120 s und verlangt zusätzlich das richtige
Taxon und eine konkrete Individuen-ID. Keine Assertion abgeschwächt.

## Mission 3: Individuum, Szenenkontext und Zeit

Abschluss verlangt genau eine identische `wadden:<id>` in beiden Stationsbelegen,
Watt/initialen Seed/dieselbe eindeutige Durchlaufkennung, gleiche Stelle und Tiefe,
passenden lebenden Zustand bei Phase 0/0,5 und je mindestens sechs Modellsekunden.
Die Zeitfenster `[simulationTime-duration, simulationTime]` müssen getrennt sein.
Beide chronologischen Reihenfolgen sind fachlich zulässig. Die laufend veränderte
Zufallszustandsvariable `seed` wird durch `initialSeed` als Kontext ersetzt;
`scene.runId` verhindert, dass nach Neuladen erneut vergebene numerische IDs als
Kontinuität desselben Individuums gelten.

Import und Abschluss verwenden dieselbe Stationsvalidierung. Widersprüchliche
Szenenkennungen, ungültige Bedingungen/Identitäten und überlappende Protokolle
werden vor Übernahme abgelehnt. Gültige Belege verschiedener Individuen oder
Durchläufe dürfen aufbewahrt werden, ergeben aber keinen gemeinsamen Abschluss.
Alte Stationsbelege ohne Durchlaufkennung bleiben importierbar; ihr gecachter
Abschluss wird mangels nachweisbarer Kontinuität neu als offen bewertet.
Ein bereits vollständig belegter Vergleich bleibt auch nach Neuladen gültig.

Negative Tests umfassen fremde/fehlende/mehrere IDs, anderen Lebensraum, Seed,
Durchlauf, Szenario, ungültige/überlappende Zeitfenster, Wasserstand und Zustand,
gefälschtes `complete:true` sowie unveränderten Speicher nach abgelehntem Import.
Die echten Stationsbelege aus der Modellwelt bestehen die strengere Prüfung.

## Prüfstatus

Auf sauberem Commit `7fbdac807c03dc017f00cd590ff7f9c377fe37e6`: 26/26 Node-Prüfreihen, gezielte Regressionen und fünf Python-Paketprüfmethoden bestanden. Webpaket, Einzel-HTML und Projektarchiv neu erzeugt und geprüft (jeweilige JSON-/Textnachweise hier).
Die unabhängige [CI 39610400022](https://github.com/Feerson1617/Ein-Tag-als-Ranger/actions/runs/39610400022) besteht vollständig: 26 Node-Reihen, fünf Python-Methoden, Web-/Standalone-Bau und 13 Chromium-/WebGL-Blöcke. Getesteter Mergecommit `8bdb4c9aa9e428d91d4b688a72c38f44744e2a59`, PR-Codehead `7fbdac8`, Chromium 155.0.8059.0, 800×500. `github-ci-job.json` und `github-ci-browser.json` stammen aus der GitHub-API. Alle drei Missionen, freies Spiel, echter Seitenneustart mit erhaltenen Belegen/Antworten/Abschlüssen, widersprüchlicher Import, Export/Report und Sitzungsabbruch bestanden. Keine JS-/Konsolen-/HTTP-Fehler. Automatisierte Missionszeiten: 124,61 / 172,22 / 196,88 s; keine Schülerzeiten.

**Fehlgeschlagen:** Lokaler 800×500-Gesamtlauf in Chromium 154/SwiftShader (`local-800x500-failed.json/.txt/.png`). M1 und M2 vollständig bestanden; in M3 nach 180 realen Sekunden erst 4,1 von 6 geforderten Modellsekunden (Screenshot nach weiteren Bildern: 4,2). p95-Bildabstand 4616,4 ms, keine JS-/Konsolen-/HTTP-Fehler. Die Schaltfläche wird unter dieser Last zu Recht nicht vor sechs Modellsekunden freigegeben. Dieser Lauf ist kein bestandener Gesamttest. Die CI bei gleicher CSS-Auflösung besteht alle Missionen; auch der ergänzende lokale Lauf bei 600×350 scheitert in M3 bei 4,6/6 Modellsekunden nach 180 s (p95 3749,9 ms; `local-600x350-failed.*`). M1/M2 bestehen dort ebenfalls. Der kleinere Lauf stammt aus einem geänderten Quellbaum: Änderungen nur an Nachweisen/Testausgabe, keine Spielcodeänderung gegenüber `7fbdac8`. Die restlichen lokalen UI-/Fehlerfälle laufen separat ohne Live-Missionsfenster; deren Fixture-Ergebnisse sind keine erspielten Live-Abschlüsse. Kein Timeout erhöht, keine Mindestdauer oder Belegprüfung abgeschwächt.

CI-Log-/Artefaktdownloads des neuen Laufs sind am Proxy für den dynamischen Blobhost gesperrt; die oben genannten API-Nachweise sind erfolgreich gesichert. Eine zwischenzeitlich verschärfte Ausführungssandbox blockierte auch den Start des lokalen HTTP-Servers (`PermissionError` beim Socketaufbau). Die erlaubte lokale Prüfung wurde anschließend mit freigegebenem Socketzugriff gestartet; Proxy und Netzpolitik wurden nicht umgangen.

Die verbliebenen Änderungen nach dem Spielcodecommit `7fbdac8` betreffen nur Nachweise und das Mitschreiben bereits erzeugter Live-Protokolle im Testtreiber. Die Spieldateien in `dist/` bleiben identisch. Zusätzliche lokale Browser-/Fehler-/Standalone-Ergebnisse werden nach Abschluss ergänzt.
Entwicklungsläufe mit verändertem Quellbaum bleiben als solche erkennbar.
Historische Nachweise in `verification/rc1/` werden nicht überschrieben.

Die CI führt künftig zusätzlich die bereits vorhandenen Fehlerprüfungen
(`--resilience`), den Projektarchivbau und den Standalone-Smoke-Test aus. Alle
Zeitlimits und Belegprüfungen bleiben erhalten. Die erweiterte Pipeline wird
getrennt vom oben bestandenen 13-Block-Lauf ausgewiesen.

Weiterer lokaler Fehllauf (`local-ui-failed.*`): Nach Start, abgelehntem
widersprüchlichem Import, bestätigtem gültigem Import und Referenzöffnung scheitert
`Locator.check` für das erste Waldmeistermerkmal am 45-s-Limit
(„visible, enabled and stable“). Keine JS-/Konsolen-/HTTP-Fehler. Dieser Lauf ist
kein bestandener Formulargesamttest; dieselben Formularfälle bestanden in der
unabhängigen CI. Die restlichen lokalen Fehlerfälle werden mit dem vorhandenen
`--smoke --resilience` separat geprüft. Keine erzwungenen Klicks oder gelockerten
Assertions.

Lokaler Fehlerlauf mit Grafiktests (`local-faults-failed.*`): Start, freie
Bedienung und echte WebGL-Wiederherstellung mit unverändertem Feldbuch bestanden.
Danach überschritt die Wiederholung des Modelldownloads das 180-s-Startlimit.
Der Treiber hielt dabei die wiederhergestellte 1024×768-Szene offen und startete
eine zweite WebGL-Szene im selben Browser; p95 der ersten Szene 14416,0 ms.
Die Fälle werden jetzt nacheinander in frischen Browserinstanzen ausgeführt,
entsprechend der bereits isolierten Quota-Prüfung. Alle bestehenden Assertions
und einzelnen Zeitlimits bleiben erhalten. Auch die Fehlerdiagnose zeigt nun
die tatsächlich geprüfte Seite. Dies ist eine Testtreiberänderung; Spielcode
bleibt unverändert. Der neue Fehlerlauf wird getrennt ausgewiesen.

Die isolierte lokale Wiederholung (`local-faults-isolated-failed.*`) kam nach
Start/freier Bedienung beim Klick auf den Grafikverlust-Test ins 45-s-Limit,
noch vor der Browsertrennung. Der Treiber hatte die vorherige Tabletansicht
1024×768 für die Fehlerfälle beibehalten (p95 14749,4 ms). Er stellt jetzt vor
diesen Fällen die angeforderte Ansicht wieder her; der Tablet-Layouttest und
seine Assertions bleiben erhalten. Kein Einzelzeitlimit geändert.

[CI 39617310697](https://github.com/Feerson1617/Ein-Tag-als-Ranger/actions/runs/39617310697)
wurde nach dem 30-Minuten-Gesamtbudget abgebrochen; GitHub meldet ausdrücklich
„The job has exceeded the maximum execution time of 30m0s“. Node/Python/Pakete
bestanden, der kombinierte Browserstep wurde abgebrochen und der Einzel-HTML-
Smoke-Test übersprungen. Kein bestandener Gesamtlauf. Job/Annotationen sind
als `github-extended-cancelled-*` archiviert. Der nachfolgende Lauf prüft die
isolierten Fehlerfälle mit unveränderten Einzelzeitlimits.
