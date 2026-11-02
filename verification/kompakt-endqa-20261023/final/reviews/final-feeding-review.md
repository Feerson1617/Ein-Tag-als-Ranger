# Neue Sichtprüfung der Nahrungssuchfolgen · 23.10.2026 · Runtime 3920a1d

Alle **28 neuen unveränderten Original-PNGs** wurden in diesem Review einzeln in Originalauflösung angesehen: sieben Aufnahmen je Säbelschnäbler, Rotschenkel, Löffler und Austernfischer. Es wurden keine Kontaktbögen als Detailersatz und keine historischen Bilder als neue Sichtung verwendet. Die Bilder zeigen nachvollziehbare Haltungswechsel; eine vollständige visuelle Freigabe sämtlicher Erwerbs- und Schluckvorgänge wird **nicht** erteilt. Technischer PASS, Zustandslabels und echte Bildsichtung sind getrennte Aussagen.

## Herkunft und Bytebindung

- Neuer Report: [final-feeding/result.json](../qa-correction/final-feeding/result.json), abgeschlossen `2026-10-23T08:56:22Z`, Chromium `154.0.8037.57`; Report `passed:true`, vier Folgen bestanden, keine gemeldeten Fehler. [Originalgalerie](../qa-correction/final-feeding/index.html).
- Reportcommit und [Runtime-Freeze](../final-qa/runtime-freeze.json): `3920a1d1d2692889b75403c1b0e50f5b856398aa`. Alle **51/51 Runtime-Quellhashes** stimmen zwischen Report, Freeze und aktuell vorhandenen `dist/`-Dateien überein.
- Alle **28/28 PNG-SHA256s** stimmen mit den vom Browserreport deklarierten Hashes überein; alle Bilder sind 1000 × 700 Pixel. Jeder Dateiname, Hash, Modellzeitpunkt und tatsächliche Sichtungsumfang ist in [final-feeding-review.json](final-feeding-review.json) festgehalten.
- Report-SHA256: `e8f483fe5eeee5988b1c2964ada5fff18447cbac557b8fd2796a59b1e4ec3db4`.
- Freeze-JSON-SHA256: `76848e7e5c86e476f38831af4d4162623adfc01a8ad310c7b7ab1dc0aee0a667`.
- Das aktuell gebaute `outputs/Ranger-Kompakt.html` ist bytegleich zum getesteten HTML: SHA256 `b61a35456fcd6253ed6693d7fa8031f3ae5b7ca48502837d744c82b3dfc227b4`, 11,953,336 Bytes.
- Review abgeschlossen `2026-10-23T09:06:52.429251+00:00`. Kein Browser, Build oder Test gestartet; nur vorhandene Belege gelesen und diese zwei WORK-Reviewdateien geschrieben. Originalbilder unverändert. Die frühere 78e-Bewertung bleibt separat im historischen Archiv.

## Was tatsächlich sichtbar ist

| Art | Sichtbarer Befund | Grenze der Bildfolge |
|---|---|---|
| Säbelschnäbler | Schwarz-weiße Silhouette und gebogener Schnabel; Kopf/Schnabel sinken zwischen Annäherung und Suche deutlich, Beine sind in der tiefen Pose gebeugt; Abgang und anschließendes Warten wieder aufrecht. | Suchen, Kontakt und Aufnahme sehen sehr ähnlich aus. Der feine Schnabel ist vor dem Wasser kontrastarm; das 6-mm-Beuteindividuum lässt sich nicht sicher erkennen. Ein seitliches Schwenken und der vollständige Schluckweg sind mit diesen Einzelbildern nicht nachgewiesen. |
| Rotschenkel | Rote Beine und Schnabel, fast frontale Ansicht. Kopf und Hals senken sich von Annäherung über Suche bis zum Kontakt deutlich zum Boden; beim Abgang richtet sich der Vogel wieder auf. | Das Tier ist relativ klein im Bild. Kleine Beute ist vor dem gemusterten Boden nicht sicher auflösbar; die frontale Perspektive erschwert Schnabelkontakt, Aufnahme und Schlucken. Keine vollständige visuelle Detailbestätigung. |
| Löffler | Große freie Seitenansicht mit langem verbreitertem Schnabel. Kopf und Beine wechseln deutlich in die tiefe Such-/Kontaktpose und beim Abgang in die aufrechte Pose. Im Aufnahmebild liegt ein sehr kleines helles Detail am Schnabelende. | Das helle Detail identifiziert für sich keine Garnele und belegt keinen Transport in den Rachen. Je ein Such-/Kontaktbild weist keine seitliche Schwenkbewegung nach. Hals und Beine bleiben stark schematisiert; Naturtreue und flüssige Übergänge sind nicht bestätigt. |
| Austernfischer | Kontrastreiches Muschelfeld und orangefarbener Schnabel. Im Kontaktbild erreicht die Spitze eine einzelne dunkle Muschel; im Aufnahmebild ist ein kleines helles Detail an der Spitze sichtbar. Danach aufrechtere Pose und veränderte Position zum Muschelfeld. | Klarster Kontaktbefund dieser vier Folgen, aber Schalenöffnung und vollständiger Transport/Schluckweg sind in den sieben Bildern nicht zu verfolgen. Die Identität des hellen Materials als Muschelgewebe stammt ergänzend aus dem Modellprotokoll. |

In allen 28 Aufnahmen sind Körper und Schnabel innerhalb des Bildes. Das rechte Bedienfeld und die obere Meldung verdecken das Haupttier nicht. Eine leere Szene, ein vollständig fehlendes Tier oder eine neu nachgewiesene Verdeckung wurde in diesen Bildern nicht gefunden. Diese begrenzte Feststellung ist keine umfassende Fehlerfreiheits- oder biologische Abnahme.

Die mitgeführte Kamera hält den Vogel ungefähr in der Bildmitte. Ein tatsächlicher Ortswechsel ist deshalb nicht aus seiner Bildschirmposition allein abzulesen; veränderte Hintergrundbezüge und Modellkoordinaten ergänzen die Bilder. Die Tiere bleiben sichtbar stilisiert. Sieben Standbilder je Art erlauben keine sichere Aussage über flüssige Animation, Gelenkkinematik, Schritt-/Schwenkrhythmus, durchgängigen Beutetransport oder reale Geräte-FPS. Die Vergrößerung bereits vorhandener Pixel würde fehlende Kleinstbeutedetails nicht ergänzen.

## Phasen und ergänzende Zustandsdaten

Die sieben Namen sind `initial`, `approaching`, `searching`, `handling`, `swallowing`, `departing`, `after-departure`. Sie kennzeichnen vom Modelltreiber ausgewählte Aufnahmen und sind keine zusätzliche biologische Sichtung.

**Wichtiger Unterschied zum alten 78e-Bericht:** Nur beim neuen Löffler zeigt `initial` noch das vorherige Ziel `compact-shrimp-4`; die verfolgte Folge ab `approaching` betrifft `compact-shrimp-3`. Beim neuen Austernfischer beziehen sich bereits `initial` und `approaching` auf dasselbe spätere Beuteindividuum `compact-mussel-16`. Die frühere Aussage, beide Initialbilder zeigten ein anderes Ziel, wurde nicht übernommen.

`after-departure` bedeutet den Abschluss des protokollierten Weggehens von der Beutestelle, nicht das Verlassen des Bildes: Rotschenkel, Löffler und Austernfischer nähern sich dann bereits einer weiteren Beute; der Säbelschnäbler wartet ohne Ziel. Die Kamera folgt weiterhin dem Vogel.

| Art | Konkrete Beute laut Report | Kontakt bei Modell-s | Erwerb bei Modell-s | Abgang abgeschlossen bei Modell-s | Endlicher Pool vor → nach |
|---|---|---:|---:|---:|---:|
| Säbelschnäbler | `compact-juvenile-worm-0` | 31.017 | 31.667 | 33.917 | 3 → 2 |
| Rotschenkel | `compact-juvenile-worm-3` | 22.016 | 22.716 | 24.966 | 3 → 2 |
| Löffler | `compact-shrimp-3` | 6.958 | 7.833 | 10.083 | 4 → 3 |
| Austernfischer | `compact-mussel-16` | 1.103 | 4.028 | 6.303 | 18 → 17 |

Kontakt liegt in allen vier protokollierten Fällen vor Erwerb und abgeschlossenem Abgang; der zugehörige endliche Pool sinkt um genau eins. Diese Zeiten, Mengen und Identitäten sind **ergänzende Modellzustandsnachweise**, keine allein aus den sichtbaren Pixeln festgestellten Vorgänge. Die kleinen hellen Schnabeldetails werden deshalb nicht allein anhand ihrer Form als konkrete Beute identifiziert.

Alle 28 Aufnahmen haben `ownSeconds = 0`. Die UI zeigt „MODELLZEIT · KEINE EIGENE SICHTUNG“, das Feldbuch bleibt bei null und „Beleg sichern“ ist deaktiviert. Diese Folgen entstanden durch die regulären beschrifteten UI-Modellschritte in frischen Szenen; die erfassten Bildzeitpunkte reichen von 0,278 bis 33,917 Modellsekunden. Sie sind keine neu erworbenen Lernbelege, keine 15–25 Minuten geleistete Wald-/K1-Arbeit und kein Echtzeitvideo.

## Reichweite und offene Grenzen

Dieser Review beurteilt ausschließlich die neuen frühen Nahrungssuch-Standbilder und ihre Herkunft. Er ersetzt weder die gesonderte normale Wald-Küsten-Ankunftsprüfung noch deren aktive Echtzeit- und Videobelege. Der historische 900-Sekunden-Wegfehler bleibt FAILED; die gesonderte 3600-Sekunden-Funktionsroute wird durch diesen Bildreview weder freigegeben noch umgewertet. Ihre Belege sind separat zu prüfen. Physisches iPad 9/Safari/iPadOS 27, Unterrichtspilot und unabhängige biologische Endabnahme sind hier **nicht geprüft**.

**Bewertung:** Haltungswechsel und freie Darstellung des Haupttiers sind in allen vier neuen Folgen bestätigt; Austernfischer liefert den klarsten sichtbaren Schnabel-Muschel-Kontakt. Die Kleinstbeute bei Säbelschnäbler/Rotschenkel, vollständige Schluckwege aller Arten und die natürliche/flüssige Bewegung bleiben visuell unzureichend belegt. Kein zusätzlicher technischer Defekt wurde aus diesen Standbildern nachgewiesen. Die bekannten Grenzen werden ausdrücklich beibehalten; kein vollständiger visueller oder globaler QA-PASS.
