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
Chromium-/SwiftShader-Rendering bleibt das Individuum stabil im Blick, während
nach 119,41 realen Sekunden nur 1,0566 Beobachtungssekunden aufgelaufen sind.
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

26/26 Node-Prüfreihen, gezielte Regressionen und fünf Python-Paketprüfmethoden bestanden.
Vollständige Node-/Paket-/Chromium-Prüfung und CI werden nach Abschluss hier ergänzt.
Entwicklungsläufe mit verändertem Quellbaum bleiben als solche erkennbar.
Historische Nachweise in `verification/rc1/` werden nicht überschrieben.
