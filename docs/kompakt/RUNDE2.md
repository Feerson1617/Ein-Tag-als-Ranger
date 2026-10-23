# Gezielte Nachbesserung, Runde 2

Ausgangspunkt: `1b51e7c370b6a8e1e67eacd9db89882eed8d52db`. Remote-Head von Draft-PR #3 vor Änderungen ausdrücklich geprüft: identisch. Keine zwischenzeitlichen Quelländerungen. Branchkorrekturen sind freigegeben; Merge, Release und Deployment bleiben ausgeschlossen.

## N05: Konsistenz von Ereigniskopien

Die Originalfixture `verification/kompakt-runde2/original-fixtures/evidence/conflicting-same-run-events.json` ist bytegleich aus dem kleinen Nutzer-Übergabepaket übernommen (SHA256 `f9065d06cba40456bb9e4b9e21eefccc5a58ddb0d03335dfddd1b2171585000f`). Originale und fremde Befunde bleiben als solche bezeichnet.

Die alte vollständige HTML wurde selbst im WebGL-Browser ausgeführt: Import akzeptiert, K2 fälschlich erfüllt. Nach der Reparatur wird dieselbe Datei vor der Übernahme zurückgewiesen. Exportierte echte Altbelege und Lernstand bleiben erhalten; lokale Speicherbytes sind unverändert. Das ist interne Konsistenzprüfung, kein kryptografischer Echtheitsnachweis.

Ein Ereigniszähler gehört zum Rundgang und vollständigen Szenenkontext (Seed, Welt, Modellrevision, datiertes Fenster, Herkunft). Kopien müssen in allen Ereignisfeldern übereinstimmen. Die Reihenfolge von JSON-Objektschlüsseln spielt keine Rolle, Reihenfolge von Akteuren und sonstige Werte hingegen schon. Auch eine direkte K2-Bewertung ohne vorheriges Parsen verweigert widersprüchlichen Kopien die Gutschrift. Bereits widersprüchlicher Speicher wird gesperrt und bleibt im Original exportierbar; keine Ereignisse werden stillschweigend umgedeutet oder gelöscht.

Zwischenstand: 12 Node-Gruppen zu Ereignisbezügen bestanden; 46 bisherige echte Browser-Importprüfungen bestanden. Identische Kopien, verschiedene tatsächliche Ereignisse eines Rundgangs, alte Revisionen, mehrdeutige Mehr-Rundgang-IDs sowie ausdrücklich qualifizierte Auswahl bleiben erhalten. Die vollständige abschließende QA folgt nach allen Laufzeitänderungen.

Reproduktion:

```sh
node tests/compact-event-reference-check.mjs work/round2/n05-node
python tools/build-compact.py
python tools/browser-compact-event-integrity.py
python tools/browser-compact-imports.py --output work/round2/n05-full-imports
```

## Weitere Punkte

F02, F05, F09/C17, N06 und N07 sind in Bearbeitung; für sie wird aus N05 kein PASS abgeleitet. Das mitgelieferte Originaljoblog bestätigt nun den 900-s-Abbruch bei Hauptwegpunkt 710, letzte protokollierte Modellzeit 90,1 s. Es ersetzt die vorher fehlende Diagnosegrundlage; eine genaue GPU-/CPU-Ursache folgt daraus allein nicht. Physisches iPad 9/Safari/iPadOS 27 und Unterrichtspilot bleiben NICHT GEPRÜFT.
