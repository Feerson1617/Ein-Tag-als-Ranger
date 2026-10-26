# F13 / N04 Druckkorrektur – Arbeitsprotokoll

## Frische Reproduktion

Das unveränderte Worktree `/workspace/ranger-baseline-20261023` liegt auf `f92146876f4364a4fb78d30d9e9b190bbb7dc1f4`. Beide PDFs wurden dort neu mit dem damaligen Druckskript und dem lokalen Chromium erstellt. `baseline/` enthält die tatsächlichen HTML/PDFs, build-info, extrahierte Texte und Reproduktionsdaten. Die historische Ausgabe wurde vorher nur zur Orientierung gelesen; sie ist kein neuer Nachweis.

- Arbeitsblätter: 41 Seiten; Seiten 5,13,18,27,29,31,35 enthalten ausschließlich dieselbe 121-Zeichen-Leistungsnachweiszeile.
- C04: Antworttabellenkopf erscheint auf Schülerseiten 6 **und** 7 sowie Lehrkräfteseiten 8 **und** 9. Die Tabelle wurde fragmentiert.
- Fortsetzungsseiten besitzen keine Kartenkennung.
- Lehrkräftefassung: 54 Seiten.
- Abweichung von den unabhängigen macOS-Seitenzahlen (39/54): unterschiedliche lokale Chromium-/Schriftumgebung; dieselben strukturellen Fehler sind reproduziert. Keine Gleichheit der Seitenzahlen behauptet.

## Nachgewiesene Ursachen und Korrektur

Die bisherige CSS-Regel hielt nur einzelne Tabellenzeilen zusammen. Die abschließende Rückmeldezeile war ein eigenständiger Absatz ohne Fragmentierungsbindung. Artikel begannen zwar jeweils auf neuer Seite, besaßen aber keinen wiederholten Seitenkopf.

Der neue äußere Tabellenrahmen wiederholt Karten-ID, Titel und Fortsetzungskennung. Die Antworttabellen liegen in zusammenhängenden Arbeitsblöcken; Grenze, Quellen und Leistungsnachweis bleiben zusammen. In der Lehrkräftefassung bilden Erwartung, Fehlvorstellung, Rückmeldung und Quellen einen zusammenhängenden Begleitblock. Bei Flussaufgaben dürfen Grafik und Bilanz-/Begründungsteil auf zwei Seiten liegen. Lange Absätze dürfen mit drei Mindestzeilen am Anfang/Ende umbrechen. Normale Absatzabstände wurden angepasst, keine PDF-Skalierung vorgenommen.

Schreibraum bleibt erhalten: gemessene bisherige Tabellenzelle 47 CSS-px einschließlich Padding/Rand, bisheriger Schreibbereich 101 CSS-px. Die neuen Regeln übernehmen diese Gesamtgrößen; SVG-Flächen bleiben bis 200 px hoch. Mindestens 12 CSS-px Quellenfont, 14 px Haupttext, A4/15-mm-Rand und Druckmaßstab 1. Die verschiedenen aufgabenspezifischen Formen bleiben aus `lesson-layouts.js` erhalten.

## Entwicklungsversuche (archiviert)

- `candidate-1/`: 42/56 Seiten; fortgesetzte IDs und C04-Tabelle korrigiert, aber mehrere kleine Abschlussseiten. Nicht als Endabnahme ausgegeben.
- `candidate-2/`: 35/55 Seiten; Abschlussblöcke zusammengehalten, C07 hatte wegen zu starrer Gruppierung eine unangemessen kurze Einstiegsseite. Anschließend Grafik/Bilanz getrennt.
- `candidate-3/`: 35/55 Seiten; alle 90 Seiten in fünf Kontaktbögen angesehen. Automatischer Text-/ID-/Tabellenaudit bestand für beide Dokumente. C24 besaß noch eine kurze, isolierte Auftragsseite; deshalb folgt ein weiterer Druck mit erlaubtem Absatzumbruch. Dieser Stand enthält noch nicht die endgültigen C15/C17-Inhalte.
- Früher Auditversuch mit `pdftotext -layout` interleavte mehrzeilige Tabellenspalten und meldete fälschlich fehlenden Text. Vollständigkeit wird nun anhand `pdftotext -raw` geprüft, Layout/Koordinaten weiterhin getrennt anhand Layout- und BBox-Ausgabe. Es wurde keine Inhaltsanforderung abgeschwächt.

## Wiederholbare Prüfung

`tools/print-compact-materials.py --audit-dir work/qa-2026-10-23/print/final/audit --contact-sheets`

Der Drucker erstellt zwei frische PDFs, prüft 25 Karten, ausschließlich lokale Requests und tatsächlichen Schreibraum. `tools/audit-compact-materials.py` prüft anschließend A4, Randgrenzen, Textvollständigkeit, Kartenkennung auf jeder Fortsetzung, je einen vollständigen Antworttabellenkopf pro Karte und Leistungsnachweis zusammen mit Grenze. Die optionale Bildausgabe rendert jede Seite und Kontaktbögen. Visuelle Beurteilung der Seitenaufteilung bleibt zusätzlich nötig; sie wird nicht durch Zeichenanzahl simuliert. Neue Abhängigkeit: Poppler `pdftotext`, für Bildausgabe `pdftoppm`; Pillow ist schon Entwicklungsvoraussetzung.

Bisher erfolgreich: bestehende 8 Gruppen in `tests/compact-pedagogy-check.mjs`; Python-Kompilierung beider Druck-/Auditwerkzeuge. Vollständiger finaler PDF-Lauf und Großansichten nach C17-Materialabschluss noch ausstehend.

## Abschluss

`candidate-4/` ist nach finalem Materialstand frisch gedruckt und komplett geprüft: 39/58 Seiten, beide Audits PASS, alle 97 Seiten in Kontaktbögen und die geforderten Karten in Großansicht angesehen. Ausführlicher Status und Grenzen: `FINAL-REVIEW.md`, maschinenlesbare Herkunft/Seiten-/Rasterhashes: `final-review.json`. Die Absatzfreigabe allein reduziert C24 nicht auf zwei Seiten; die vollständige Auftrags-/Antwortaufteilung bleibt bewusst erhalten. Eine danach kurz vorbereitete weitere Verkleinerung ausschließlich der Abstände wurde **vor jedem Druck** zurückgenommen; der eingefrorene Quellhash stimmt exakt mit `candidate-4` überein. Keine weitere Runtimeänderung.
