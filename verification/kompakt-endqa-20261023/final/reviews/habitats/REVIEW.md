# F05 / N02 – gezielte Nachbesserung und Belege, 23.10.2026

N02 ist im vierfachen Seedvergleich numerisch korrigiert und in echter Niedrig-/Hochwasseransicht bestätigt. F05 zeigt eine sichtbare Verbesserung der räumlichen Waldgliederung; eine vollständige gestalterische oder naturkundliche Freigabe wird daraus nicht erklärt.

## Vergleichsgrundlage

- Unveränderter Ausgangscommit: `f92146876f4364a4fb78d30d9e9b190bbb7dc1f4` im separaten Worktree. HTML SHA256: `d774d542d8a2984100b880ed1d771721e064299da11c8f9b3c616fc7ea844ff9`.
- Schlusslauf des gemeinsam gebauten Rev4-Kandidaten: `10e6f5395f17fe40cd66fa445b8c08226d0d694c4c883a18192a53c128e49749`. `final-browser/result.json` enthält die tatsächlichen Runtime-Quellhashes, Kamerapositionen, Modellzeit, Tide und Renderzähler.
- 26 Schlussbilder: zehn ursprüngliche eigene Kameras plus ein ausdrücklich neu aufgenommener fester Lichtlückenblick mit exakt gleichem x/z/yaw/pitch/800×600-Viewport; normale Geh-/Erkundungsbilder getrennt davon; vier Tidebilder und acht echte K1-Nahbilder.
- Die ursprünglichen unabhängigen Review-Kameradaten aus dem großen ZIP standen nicht zur Verfügung. Die Bilder sind ein frisch reproduzierter eigener f921↔Rev4-Vergleich und werden nicht als diese unabhängigen Originalbilder bezeichnet.
- `comparison-review.html` zeigt die unveränderten Original-PNGs nebeneinander. Kein nachträgliches Übermalen, keine Ersatzillustrationen und keine Positions-/Tideninjektion.

## Fachliche Sichtung

**Waldkern / Start:** Die vorher verstreuten niedrigen Waldmeisterpflanzen bilden nun einen lesbaren Krautsaum neben dem Weg. Reh, Verbissstrauch und liegendes Holz bleiben sichtbar. Unterschiedliche Stammstärken und niedrige/breite bzw. schmale/höhere Kronen gliedern den Raum stärker. Die bereits vorhandenen Individuen wurden räumlich zusammengefasst; die Bestandszahl ist unverändert und kein Abnahmekriterium.

**Lichtlücke:** Der zusätzliche feste Vergleich sowie der normale Gehblick zeigen unterschiedlich große Bäume, größere Kronenabstände und einen zusammenhängenderen Brombeerbestand auf der Wegseite. Der offene braune Vordergrund bleibt sehr kahl; die Ranken wirken weiterhin dünn und gerüsthaft. Größe und Staffelung sind sichtbar, biologische Altersklassen sind aus dem Bild allein nur teilweise sicher abzuleiten.

**Totholz:** Das unveränderte liegende Stammstück ist über echte Rindenrippen, Endflächen/Ringe und Astbruchstellen klarer lesbar. Ein zusammengefasster Krautbestand rahmt den Standort. Pilz und Streu bleiben zugänglich. Das stilisierte Holz bleibt eine vereinfachte Geometrie, kein realistischer Zerfallsnachweis.

**Saum:** Brennnesseln im Vordergrund, Strauchbestand und unterschiedlich hohe Kronen bleiben vom offenen Weg aus untersuchbar. Die weitere Waldkulisse besteht weiterhin aus wiederholten polygonalen Formen und geraden Stämmen; die Randlandschaft bleibt stark vereinfacht.

**Diagnostik:** Vier tatsächliche aktive Individuen wurden in der öffentlichen Nahansicht standardmäßig und per echter Mausbewegung gedreht erfasst: Waldmeister mit Blattquirlen, Brennnessel mit gegenständigen gezähnten Blättern, Buche mit ungelapptem Blattrand und Eiche mit gelappten Blättern. Unbenannte K1-Fundlabels bleiben erhalten. Die Drehung setzt den aktiven Beobachtungszähler zurück; nach erneutem ruhigem Betrachten wird die Schaltfläche regulär aktiv. Die Bildaufnahme erzeugt keinen Feldbuchbeleg.

Eine zweite unabhängige lokale PNG-Sichtung durch den Growth-Agenten bestätigt die sichtbare Verbesserung am Waldstart und nennt dieselben Grenzen (kahler Lichtlückenboden, gerüsthafte Sträucher, wiederholte Formen). Sie ist keine externe biologische Zertifizierung. Der echte Hinweis zur langsamen Clouddarstellung verdeckt im Schlussbild der Lichtlücke rechts einen Teil des Ausschnitts; daraus folgt ausdrücklich keine vollständige visuelle Freigabe dieses verdeckten Bereichs.

## N02

`flooding-table.md` und `model/habitat-revision-result.json` enthalten sämtliche ortsfesten Pflanzentaxa einschließlich Bäumen × Seeds 20260825/1/42/20261022 × absolute Pegel −1,05/−0,25/+0,05/+0,30 m. Bei allen Seeds stehen nun 0/55 Andelpflanzen unter normalem Hochwasser, gegenüber 44/43/44/40 im unveränderten Rev3-Zustand. Bei beiden analytischen höheren absoluten Pegeln liegen 55/55 darunter. Keilmelde bleibt vollständig bei normalem Hochwasser trocken (Referenz 0/35); alle Keilmelde-/Queller-/Schlickgras-/Rotschwingelpositionen sind unverändert. Die lokalen Andelstandorte fallen seewärts ab; dies ist Geometrie, keine hydrodynamische Entwässerungssimulation. Eine natürliche Überflutungszahl pro Jahr wird nicht behauptet.

Die Quellenbegründung Schutzstation/Nationalpark wird aus dem bereitgestellten unabhängigen QA-Bericht nachvollzogen. Beide neuen Originalabrufe waren durch Cloudproxy-403 blockiert (`source-access.json`); eine neue eigene Volltextprüfung wird nicht behauptet.

## Technische Prüfungen und Grenzen

- `node tests/compact-habitat-check.mjs …`: 6 Prüfgruppen bestanden; bestehende LOD-/Matrizen-/Ausblendungs-, Wege-, Sprecher- und Importprüfungen erhalten, Andel-Assertion fachlich verschärft.
- `node tests/compact-habitat-revision-check.mjs …`: 4 Seedgruppen bestanden, darin 12 historisch exakte Rev1/2/3-Rekonstruktionen anhand vor der Änderung berechneter SHA256s. Alle bestehenden Pflanzen-IDs, Reihenfolge, Größen und Winkel erhalten; keine zusätzlichen Bestandsindividuen; die drei Stützbäume und ihre Vogelansatzpunkte unverändert.
- Frischer Baseline-Browser: 28 Bilder / PASS. Zusätzliche feste Baseline-Lichtlücke: 1 Bild / PASS. Erster Kandidat: 25 Bilder / PASS, dabei störende kugelförmige Fernunterkronen visuell erkannt. Diese wurden einmalig bodengebunden und unregelmäßiger angeordnet. Schlusslauf: 26 Bilder / PASS, keine JavaScript-Seitenfehler.
- Ein gerade begonnener Schlusslauf wurde wegen der letzten C17-Quellenkorrektur kontrolliert beendet und neu gebaut (`interrupted-snapshot-browser`, Exit143). Er ist **kein** bestandener Abschlusslauf und **kein** abgeschwächter Assertionstest. Der folgende Schlusslauf endete mit Exit0.
- Beispiel derselben Startkamera: Dreiecke 1232379 → 911975. Das ist ein Renderzähler, keine Aussage über biologische Qualität oder Gerätegeschwindigkeit. Die wechselnden SwiftShader-Framezeiten sind kein kontrollierter Gerätebenchmark.
- Instancing, LOD, Sichtbarkeit ausgeblendeter Verbissinstanzen und Tabletprofil bleiben erhalten. Ein echtes iPad 9/Safari/iPadOS 27 wurde hier nicht geprüft. Die vollständige gemeinsame Node-/Python-/Paket-/Chromium-QA führt der Hauptagent auf dem abschließend eingefrorenen Stand aus.

## Reproduktion

`tools/browser-compact-habitat-revision.py --baseline <Baselineordner> --baseline-fixed-gap <Ordner mit festem Lichtlückenblick> --output <Zielordner>` prüft das frisch gebaute Standalone-HTML und vergleicht die tatsächlichen aufgezeichneten Baselinekameras. Beide Baseline-JSONs müssen bestandene Aufnahmen derselben unveränderten HTML- und Quellhashes enthalten. Der bestehende allgemeine Habitat-Smoke wird nicht ersetzt.
