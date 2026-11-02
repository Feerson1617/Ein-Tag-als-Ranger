# F13 / N04 – frische Schlussdruckprüfung

**PASS im geprüften Druckumfang.** Beide PDFs wurden im vollständigen Prüfplan vom sauberen Commit `3920a1d1d2692889b75403c1b0e50f5b856398aa` neu erzeugt. Die fünf frischen Kontaktbögen aller **97 Seiten** wurden anschließend tatsächlich angesehen. Keine sichtbaren Überlagerungen, abgeschnittenen Inhalte oder verwaisten Leistungsnachweiszeilen; die fortgesetzten Seiten tragen Kartenkennung und Fortsetzungslabel.

Diese Fassung gehört zum **zweiten vollständigen QA-Lauf**. Dessen Schritt `materials` endete erfolgreich (Exit 0, 13,24 Sekunden); Manifest und PDFs stammen aus diesem neuen Druck. Der erste saubere Review für `78e723b` bleibt unverändert unter `historical-plan/reviews/final-print-review.md` und `.json` erhalten.

## Herkunft und Bindung

- Druckzeit: 2026-10-23 09:12:47 UTC; Chromium 154.0.8037.57, A4, 15 mm Rand, Maßstab 1; `sourceDirty: false`.
- Quellenbindung: **51/51 Runtime-Dateien** stimmen aktuell mit `work/final-qa/runtime-freeze.json` überein. Die **4/4 Dokument-/Materialmodule** aus `outputs/Ranger-Kompakt-Lernpaket/build-info.json` stimmen nach dem Präfix `compact/` mit demselben Freeze und der früheren Detailprüfung überein.
- Arbeitsblätter: **39 Seiten**, 723 von 723 HTML-Textfragmenten im PDF, Audit PASS. SHA256 `0332d299806867907f0763e985fa6ea470f94bca8c35dd6d047a57c93586cc8d`.
- Lehrkräfte: **58 Seiten**, 971 von 971 HTML-Textfragmenten im PDF, Audit PASS. SHA256 `9b821f60b7ab16894a8279761129c267277bda756999636ecbd8e8cce42b4e67`.
- **11/11 Manifestdateien** einschließlich HTML, PDFs, Materialkarten und Begleitdokumenten wurden nach Dateigröße und SHA256 geprüft. Die sechs mitgelieferten Begleitdokumente sind bytegleich mit den aktuellen Quellen unter `docs/kompakt/`; auch die separate Quellenstatus-JSON ist per Hash gebunden. PDF-, Manifest-, Audit-, Kontaktbogen-, Seiten- und Freezehashes sind in `final-print-review.json` frisch erfasst. Dies wiederholt keine biologische Quellenprüfung.

## Tatsächliche Sichtung und überprüfte Wiederverwendung

Neu angesehen wurden `work/qa-correction/final-print/Arbeitsblaetter-contact-01.png` und `-02.png` sowie `Lehrkraefte-contact-01.png` bis `-03.png`. Die Kontaktbögen zeigen alle Seiten einschließlich der langen Karten C01/C15/C17, der C04-Antworttabelle sowie C06/C14/C19/C23/C24.

Zusätzlich wurden **alle 97 frischen PNG-Seiten byteweise** mit den tatsächlichen früheren Rasterdateien in `print/candidate-4/audit/` und mit ihren in `print/final-review.json` gespeicherten SHA256 verglichen: **97/97 exakt identisch**. Auch beide erzeugten HTML-Dokumente sind bytegleich. Die frischen PDF-Dateihashes unterscheiden sich von den älteren; sie sind oben ausdrücklich als neue PDFs ausgewiesen.

Deshalb wurden die bereits dokumentierten 37 Großansichten nicht unnötig erneut geöffnet: Arbeitsblätter Seiten **2, 3, 6, 7, 9, 10, 11, 17, 18, 19, 20, 21, 22, 24, 25, 26, 27, 29, 31, 32, 34, 35, 36, 37, 38**; Lehrkräfte Seiten **4, 10, 14, 28, 30, 33, 38, 39, 43, 48, 53, 56**. Ihre frühere Prüfung von Tabellenzellen, Diagrammen, Schreibraum, langen Quellen und vollständigen Aufträgen gilt durch die bestätigte Bytegleichheit unverändert für diese neuen Raster. Die frühere Prüfung entstand bei `f921468…`, `sourceDirty: true`; sie wird nicht nachträglich als damalige Prüfung von `3920a1d` ausgegeben.

C04 enthält alle vier Antwortzeilen zusammen auf Arbeitsblattseite **7** und Lehrkräfteseite **10**. Pro Fassung bleiben 25 Karten, 26 Antworttabellen, 100 Antwortzeilen und 27 Schreibfelder erhalten; gemessene Mindesthöhen 47 CSS-px beziehungsweise 101 px, Quellenfont mindestens 12 px. Die unterschiedlichen Antwortformate und Schreibflächen wurden erhalten.

## Verbleibende Grenzen

C15 und C24 behalten je drei Schülerseiten mit vollständiger eigener Auftrags-/Hilfeseite und deutlich freiem Raum. C17 bleibt wegen zwei Materialtabellen, zwei Schreibbereichen und sieben ausführlichen Quellen vierseitig; Quellen, Grenze und Leistungsnachweis stehen zusammen. Dies sind bekannte Gestaltungsgrenzen, keine wiederaufgetretenen isolierten Abschlusszeilen. Keine pauschale Verkleinerung auf eine Seite wurde eingesetzt.

Automatischer Text-/BBox-/Karten-/Tabellen-Audit und eigene visuelle Sichtung ergänzen einander. Diese Prüfung bescheinigt weder unabhängige externe Endabnahme noch physischen Druck, Unterrichtserprobung oder ein reales iPad-/Safari-Ergebnis. Während dieser Nachprüfung wurden keine Browser, Builds oder Runtimeänderungen ausgeführt; nur dieses Markdown und die zugehörige JSON-Datei wurden aktualisiert.
