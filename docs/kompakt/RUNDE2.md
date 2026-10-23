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

## Weitere gezielte Änderungen und erneute Prüfung

Modellrevision 5 behält alle Revision-4-Pflanzen, Baumpositionen und Vogelstützen exakt. Oberhalb der unveränderten Kollisionen bekommen bestehende Kronen unterschiedlich hohe, tiefere, asymmetrische Volumen; Ast-/Stammverläufe variieren. Die drei diagnostischen Stützbäume behalten ihre ursprüngliche Verankerung. F05 wird am aktuellen Bild beurteilt, nicht an Objektzahlen; eine vollständige Anatomieabnahme ist damit nicht verbunden.

Die optionale didaktische Detailvergrößerung rendert dasselbe aktive Vogel-/Beutegeometriepaar aus einer Übersicht und einer Kontaktkamera. Keine generische zusätzliche Animation und keine vergrößerte Beute in der Landschaft. Die ab Annäherung stabile Ereignis-ID erscheint später unverändert im tatsächlichen Erwerbsereignis. Erst ein erfolgreicher konkreter Kontakt verbraucht Nahrung. Im vorhandenen Schluckabschnitt wandert dieselbe Beute vom Schnabel zum Mund; dies ist als schematischer Weg ohne Innenanatomie gekennzeichnet. Die Detailansicht selbst vergibt keinen Beleg. Alte Revisionen behalten ihre ursprüngliche Darstellung/Belege.

C17, Quellenreichweite und alle Karten sind in den separaten Runde-2-Dokumenten beschrieben. Der vollständige Schlussplan, sämtliche Fehlversuche, die Einzelmatrix sowie neue Originalbilder/-videos werden an genau den aktuellen Quell-SHA und die neu gebaute HTML gebunden. Das kleine Übergabepaket enthält Text, Fixtures, Rohstatus und Dateihashes; große Medien bleiben im gesonderten Abnahmearchiv. Keine Veröffentlichung der Anwendung und kein Merge.

## Gezielte Detailkamera-Regression am tatsächlich erreichbaren Steg

Die isolierte normale Untersuchung am Weg-Endpunkt (63 / 4 m) reproduzierte eine übernommene Distanz-Ausblendung: Die tatsächliche erste Muschel liegt 19,3358 m entfernt und wird in der Landschaft ab 18 m aus Detaildarstellung entfernt. Die neue optische Kamera übernahm zuerst diese Darstellungsausblendung; Schnabel sichtbar, vorhandene Muschel unsichtbar. Nachgewiesen mit unveränderter HTML und Originalbildern vor der Korrektur, ohne Ressourcen- oder Zeitinjektion.

Für die beiden ausdrücklich didaktischen Kameras wird nun ausschließlich die Sichtbarkeit des vorhandenen lebenden Beutemodells beziehungsweise der tatsächlichen leeren Schale/getragenen Beute kurz freigegeben und danach in `finally` wiederhergestellt. Keine Änderung an Maßstab, Bestand, Position oder Beleglogik. Der Regressionstest prüft die sichtbare reale Muschel, unveränderte Landschafts-Ausblendung, erneutes Öffnen ohne Modellschritt und null Beobachtungsguthaben. Am Anfang eines neuen Modells wird das konkrete Beuteziel erst durch einen ausdrücklich geklickten Feinschritt gewählt; bis dahin zeigt die Detailfläche einen leeren Zielzustand und keine alten Ereignisdaten.

Reproduktion: `python tools/browser-compact-detail-lod.py`. Die aktuelle erfolgreiche Prüfung ist ein gezielter Render-/UI-Nachweis nach einer offen bezeichneten Referenzansicht; sie ersetzt weder den normalen Fußweg noch die separate Echtzeitvideo-Abnahme. Der vollständige Schlussplan enthält sie zusätzlich zu allen bisherigen Prüfungen.

Die zunächst überlappenden massiven Muschelklappen verdeckten zudem die Öffnung. Sie sind jetzt als zwei hohle, innen hellere Klappen mit derselben tatsächlichen Gewebemasche ausgeführt. Ein Geometrie-Strahltest trifft bei geschlossenen Klappen zuerst die Schale, bei geöffneter Schale dasselbe reale Gewebe. Der sichtbare Rand und der physikalische Kontaktpunkt stimmen in Modellrevision 6 überein; die dynamischen Kontaktformeln der Revisionen 1–5 bleiben erhalten. Pflanzen, Baumstandorte und Stützen ändern sich dabei nicht. Die Handhabung ist weiterhin als vereinfachte Darstellung bezeichnet, ohne vollständige Anatomieabnahme.
