# F13 / N04 – abgeschlossene Druckprüfung

**PASS für die nachgewiesenen Druckfehler:** keine verwaiste Leistungsnachweiszeile, zusammenhängende Antworttabellen einschließlich C04, Kartenkennung und Fortsetzungslabel auf jeder fortgesetzten Seite. Geprüfter Stand: `candidate-4/`, nach den endgültigen C01/C15/C17-Materialänderungen. Der vollständige Prüfplan muss später nochmals vom sauberen Commit drucken; dieser Vorabnachweis gibt sich nicht als bereits erfolgte Prüfung jenes Commits aus.

## Herkunft und Umfang

- Frischer Chromium-A4-Druck: Version 154.0.8037.57, 15-mm-Rand, Maßstab 1, 2026-10-23 06:22 UTC.
- Arbeitsblätter: **39 Seiten**, 723 HTML-Textfragmente vollständig im PDF.
- Lehrkräftefassung: **58 Seiten**, 971 HTML-Textfragmente vollständig im PDF.
- Pro Fassung: 25 Karten, 26 aufgabenspezifische Antworttabellen, 100 Antwortzeilen, 27 Schreibfelder.
- Gemessen: mindestens 47 CSS-px Tabellenzeile, 101 px Schreibfeldhöhe, 12 px Quellenfont. Das entspricht dem vorhandenen Schreibraum einschließlich Innenabstand/Rand. Keine pauschale Seitenskalierung.
- Alle 97 Seiten als fünf Kontaktbögen angesehen; jede Seite liegt zusätzlich als unveränderte 110-dpi-PDF-Rasterung vor. Alle mehrseitigen Schülerkarten sowie C06/C14/C19/C23/C24 in Großansicht geprüft, ergänzt um die relevanten Lehrer-Erwartungs-/Quellenseiten. Exakte Seitenliste und Hashes stehen in `final-review.json`.
- C04: vier Antwortzeilen vollständig auf Schülerseite 7 beziehungsweise Lehrkräfteseite 10; Tabellenkopf jeweils genau einmal. Vorher waren dieselben vier Zeilen auf zwei Seiten verteilt.
- Quellen, lange URLs, Tabellenzellen, Achsen und Schreiblinien lesbar; keine beobachtete Überlagerung oder abgeschnittenen Inhalte. Der automatische BBox-Audit bestätigt den A4-Druckbereich.

## Bewusste Mehrseitigkeit und Grenzen

C15 und C24 behalten drei Schülerseiten: Materialdaten, vollständiger Auftrag mit Hilfen und Antwort-/Quellenblatt. Die Auftragsseiten haben deutlich freien Raum; sie sind keine einzelnen verwaisten Fußzeilen. C17 umfasst vier Seiten, weil zwei Datentabellen, zwei Schreibbereiche und sieben ausführliche Quellen vollständig erhalten bleiben. Quellen/Grenze/Leistungsnachweis stehen hier gemeinsam auf der letzten Seite. Der restliche freie Raum wurde nicht durch Schriftverkleinerung oder entfallende Schreibfelder eingespart.

Die automatische Prüfung erkennt fehlende Textfragmente, Druckbereichsüberschreitungen, fehlende Kartenkennungen, wiederholte/fehlende Antworttabellenköpfe und getrennte Leistungsnachweise. Sie ersetzt keine visuelle Beurteilung der Seitengestaltung. Keine Prüfung eines physischen Druckers, Unterrichtspiloten oder realen iPad/Safari-Geräts behauptet.

## Belege

- `baseline/reproduction.json`: neu gedruckte unveränderte Baseline f921; 41/54 Seiten, sieben reine 121-Zeichen-Seiten, C04-Tabelle in beiden Fassungen geteilt. Großbilder `baseline/f13-before-05.png` bis `07.png`.
- `candidate-4/Arbeitsblaetter.pdf` und `Lehrkraefte.pdf`: frisch erzeugte, hier tatsächlich gesichtete PDFs.
- `candidate-4/audit/`: fünf Kontaktbögen, alle 97 Rasterseiten, Layout-/Raw-Text, BBox-Daten und beide bestandenen Audits.
- `candidate-4/build-info.json`: Browser, Quellhashes, tatsächliche Größenmessung, PDF-SHA256, ehrlicher Dirty-Status vor dem finalen Commit.
- `candidate-1/` bis `candidate-3/`: vorangehende Versuche erhalten; keine alten PDFs als neue Ausgabe ausgegeben.
- `node-pedagogy.log`: bestehende acht Pädagogik-/F13-Prüfgruppen bestehen weiterhin; beide Python-Werkzeuge syntaktisch geprüft.

Eingefrorener `learning-documents.js`-SHA256: `53a2c78930b1a164c618bdfb91a49701076bf94fe22a8f990afca70402bc0173`.
