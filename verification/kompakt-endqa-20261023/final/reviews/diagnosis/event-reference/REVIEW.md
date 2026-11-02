# Unabhängiger Code-Review: Kontext, Beobachtung und Ereignisbezüge

Geprüfter eingefrorener Stand: `78e723bcb5ca448fa7161146db82fc4451b59f38`; Diffbereich `f921468..78e723b`. Reviewdatei und Kandidat liegen ausschließlich im ignorierten Work-Verzeichnis. Kein Browser, kein Build, kein Commit und keine Änderung getrackter Dateien. Die isolierten Node-Prüfungen verwenden eine Kopie des Runtimecodes und ersetzen die abschließende Prüfung des integrierten Builds nicht.

## Ein nachgewiesener Befund: Mehrdeutige Legacy-Ereignisreferenz kann K2 nachträglich erfüllen

Priorität P2. `dist/compact/evidence.js:11–14` löst eine alte nackte Ereignis-ID gegen sämtliche gespeicherten Belege auf. `dist/compact/missions.js:64` prüft alle so gefundenen Ereignisse. Neue `record-event-v1`-Referenzen sind korrekt auf den konkreten Beleg begrenzt; die kompatible Altauflösung bleibt jedoch mehrdeutig. Die Verwechslungsregel existierte schon vor diesem Diff; das neu hinzugefügte örtliche Beobachtungsfenster erzeugt nun ausdrücklich einen weiteren Rundgang mit zurückgesetztem Ereigniszähler. Damit erhält die alte Schwäche einen unmittelbaren neuen Ablauf.

Reproduktion mit echten, deterministisch erzeugten Modellereignissen und ausdrücklich künstlichen Import-Beobachtungszeilen:

1. Alten Rundgang 30 Modellsekunden mit Beobachter bei `(-59, 3)` ausführen. `ranger-compact-v2:summer:9` ist dort `tick-deer`.
2. Eine ältere, fachlich unpassende K2-Antwort mit `caseId=worm-litter`, `eventIds=["ranger-compact-v2:summer:9"]` und passender Behauptung/Grenze importieren. K2 ist offen.
3. Am erreichten Küstenort einen neuen Rundgang beginnen, 30 Modellsekunden ausführen und dessen tatsächlich erzeugten `worm-litter`-Vorgang sichern. Er besitzt dieselbe lokale Ereignis-ID.
4. `journal.add` fügt nur den neuen Beleg hinzu. Die alte Antwort bleibt bytegleich. Trotzdem wechselt K2 von `complete:false` auf `complete:true`, weil die alte Referenz automatisch auch den neuen Vorgang auswählt.

Belege: [Baseline-Reproduktion](baseline-repro.json), [reproduzierbares Skript](reproduce.mjs), [Kandidaten-Reproduktion](candidate-repro.json). In der Kandidatenkopie bleibt dieselbe unveränderte Antwort nach Schritt 4 offen. Erst eine bewusst ausgewählte qualifizierte Referenz auf den neuen Beleg schließt den Fall ab. Diese Modell-/Importprobe ist kein Nachweis eigener aktiver Browsersichtung.

## Engste vorgeschlagene Korrektur, noch nicht angewendet

[Produkt und Node-Regressionen](proposal.patch), fünf Dateien:

- `evidence.js`: Parserkandidaten von wirksamer Auswahl trennen. Eine nackte Legacy-ID löst weiter auf, wenn alle Treffer dasselbe `runId/event.id` bezeichnen. Mehrere gespeicherte Kopien dieses einen Ereignisses bleiben gültig. Treffer aus mehreren Rundgängen werden nicht automatisch ausgewählt.
- `task-schema.js`: Mehrdeutige Altverweise bleiben valide lesbar und werden unverändert exportiert. Fehlende Referenzen und doppelte Aliasbezüge bleiben ungültig. Keine stille Neuzuordnung zum ersten Treffer.
- `learning-ui.js`: Bei mehrdeutigen Altverweisen keine voreingestellten Ereigniskästchen; konkreter Hinweis zur erneuten Auswahl anhand von Rundgang, Modellzeit und Belegnummer. Alle Originalbelege bleiben erhalten. Nach erfolgreichem Speichern der qualifizierten Auswahl wird der vorhandene Hinweis entfernt, ohne das Formular neu aufzubauen; bei einem Speicherfehler bleibt er erhalten.
- `field-guide.js`: Kurzanleitung erklärt die notwendige erneute Auswahl alter mehrdeutiger Vorgangsbezüge.
- `compact-event-reference-check.mjs`: echte Tick/Wurm-Kollision als Regression; unveränderte Altdatei, explizite qualifizierte Neuauswahl, eindeutiger Altbezug und doppelte Sicherung desselben Run/Ereignisses geprüft.

Die bisherige Erwartung „Legacy-ID mit Treffern in zwei Rundgängen gilt und wählt beide vor“ muss ausdrücklich geändert werden. Das ist die nachgewiesene Fehlsemantik; auch zwei gleichartige Vorgänge verschiedener Rundgänge sind keine eindeutige historische Auswahl. Eindeutige alte Antworten, mehrere Kopien desselben Run/Ereignisses sowie qualifizierte neue Antworten behalten ihre Bewertung.

[Separater Browser-Regressionsvorschlag](browser-proposal.patch) erweitert `tools/browser-compact-imports.py` um drei native Importfälle: eindeutiger Altbezug, doppelte Sicherung desselben Ereignisses und mehrdeutige Rundgänge. Er prüft unveränderte Speicherung beim Öffnen, tatsächliche Checkboxen/Hinweis/K2-Zustand, ausdrückliche qualifizierte Neuauswahl samt anschließend fehlendem Hinweis und native Export-/Reimportdateien. Ereignisse werden mit dem aktuellen lokalen Node-Modell erzeugt; die Sichtungszeilen und drei Sekunden sind klar als künstliche Importfixtures gekennzeichnet. Dieser Treiber wurde hier nicht gestartet.

## Prüfung und Grenzen

- Isolierter Produktkandidat: **8/8** gezielte Node-Prüfungen bestanden; [Ergebnis](candidate-node/result.json).
- Isolierter Produktkandidat vor dem ergänzten Hinweis-Entfernen: **34/34** bestehende `compact-learning-check`-Prüfungen bestanden; [Protokoll](candidate-learning.log).
- Browser-Vorschlag: Python-Syntax gültig. Alle drei erzeugten Importfixtures erfolgreich mit dem Kandidatenparser und erwarteter K2-Bewertung geprüft. **Browserausführung ausstehend.**
- Beide Patchdateien bestehen `git apply --check`; kein Patch wurde angewendet.
- SHA256 der Ausgangsdateien, Patches und maschinenlesbare Reviewdaten: [review.json](review.json).

Nach Integration sind mindestens die Referenz-/Lern-/Importprüfungen und der ergänzte native Import-Browserlauf auf dem neuen Build erforderlich. Der angekündigte vollständige Prüfplan wird auf dem neuen Freeze erneut ausgeführt; die bisherigen Browsernachweise gehören weiterhin zum alten Stand.

## Weitere geprüfte Verträge ohne neuen nachgewiesenen Befund

- Der lokale Kontext erzeugt einen frischen endlichen Modellzustand mit neuer Run-ID. Beobachtungszeit und Ereignissammlung werden zurückgesetzt; Journal und Observerposition bleiben unverändert. Rendererreset erhält den tatsächlichen Observer, stellt ausgelagerte Muschelgewebe zurück und aktualisiert LOD/Vegetation.
- `sceneOrigin` wird an neue Beobachtungs-, Protokoll-, Mess-, Proben-, Versuchs- und Gesprächsdaten weitergegeben. Der Parser prüft Konsistenz innerhalb eines Rundgangs, Herkunftsort, vorherige dokumentierte Modellzeit, Szenenparameter und Zyklen. Fehlende historische Vorgängerdatensätze bleiben zulässig; das ist keine Authentizitätsgarantie.
- K3 verlangt dasselbe konkrete Individuum, Run, Seed, Modellrevision, Beobachtungsfenster, Probenstelle und Tiefe; `validateProtocols` bezieht auch `sceneOrigin` ein. Niedrigwasser muss zeitlich vor dem nicht überlappenden Hochwasserfenster liegen; Tide und Verlauf werden nachgerechnet.
- Echtzeitverfolgung läuft durch die gewöhnliche Fokus-/Sichtprüfung und aktive Beobachtungsuhr. Schrittweise Modellbeobachtung kann keine eigene Sichtungszeit sammeln. Ein Reset verwirft bisherige Fokuszeit und mitgesicherte Ereignisse. Diese Aussage beruht auf Codepfaden, nicht auf einem hier durchgeführten Gerätetest.

Keine zusätzlichen hypothetischen Mängel als Befund ausgegeben. Kein Merge, Deployment oder Push durch diesen Agenten.
