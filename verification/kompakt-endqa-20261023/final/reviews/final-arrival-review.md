# Schlussreview des ergänzenden Ankunftslaufs

**Funktionale Nachweise bestanden; uneingeschränkte visuelle Abnahme nicht erteilt.** Der historische 900-Sekunden-Fehler bleibt FAILED. Der neue Lauf verwendet ausdrücklich 3600 Sekunden je Wegabschnitt und eine getrennte Prozessgrenze von 6000 Sekunden.

Geprüfter sauberer Runtime-Stand: `3920a1d1d2692889b75403c1b0e50f5b856398aa`. Alle 51 Runtime-Hashes stimmen mit dem Freeze und den Dateien überein; die tatsächlich gelieferte Einzel-HTML entspricht dem Report. Der neue Prozess endete mit Exitcode 0 nach 2016.05 Sekunden. Die vollständigen Hashes, Prüfschritte und Sichtungslisten stehen in [final-arrival-review.json](final-arrival-review.json).

## Tatsächlich gelaufener Weg

| Abschnitt | Wandzeit | Modellzeit | Abgetastete Strecke | Abstand zum Endpunkt |
|---|---:|---:|---:|---:|
| `full-main-route` | 1493.347 s | 225.730 s | 361.055 m | 0.051 m |
| `return-to-study-spur` | 268.597 s | 26.928 s | 42.422 m | 0.404 m |
| `study-spur` | 74.630 s | 6.147 s | 9.817 m | 0.449 m |

Die vorgesehene Hauptroute misst 362.210 m. Die geringere abgetastete Bewegungsstrecke entsteht durch Endpunkt-/Schritt-Abtastung und ist als solche bezeichnet. Alle drei Endpunkte erfüllen die bestehende Distanzassertion. Der Treiber benutzt gewöhnliche W-/Mauseingaben; der Weg wird durch Telemetrie und drei Endpunktbilder dokumentiert, nicht durch ein durchgehendes Wegvideo.

Ankunft bei 259.635 Modellsekunden: kleine Jungtiere, kleine Würmer, Garnelen und gemeinsame Muscheln sind sämtlich bei 0. Der Hauptweg dauert **1493.347 Wandsekunden** und liegt damit über 900 Sekunden. Der ergänzende funktionale Erfolg belegt keine verbesserte Geschwindigkeit und keinen bestandenen ursprünglichen 900-Sekunden-Lauf.

## Acht ausdrücklich neue lokale Fenster

Jedes der acht Fenster besitzt eine eigene Run-ID, beginnt bei Modellzeit 0 und verweist mit `sceneOrigin` auf den konkreten Vorgängerrundgang und dessen Zeitpunkt. Der neue Kontext verändert den Beobachterstandort nicht. Die vier anfänglichen Vorräte sind jeweils 3/3/5/18; die vorherige Erschöpfung bleibt in der Herkunftskette nachvollziehbar.

In jeder Folge sind Annäherung, Suche, Handhabung, Schlucken, Abgang und der Zustand nach dem Abgang protokolliert. Die fünf benannten Phasen bleiben jeweils während der Originalaufnahme stabil. Für alle 48 Phasenbilder wurden SHA256, native 800×600-PNG-Integrität, Zielindividuum, Kontext, Zeitpunkt und die protokollierte Sichtbarkeit geprüft. Nach dem Erwerb ist genau das konkrete Beuteindividuum nicht mehr lebend; der Vorrat sinkt um eins.

| Folge | Individuum | Zeitart | Ressource vorher → nachher | Kontaktabstand | Weg seit Erwerb |
|---|---|---|---|---:|---:|
| 1 | Austernfischer | Echtzeit | `shared-mussels` 18 → 17 | 0.002335 m | 0.445 m |
| 2 | Säbelschnäbler | beschriftete Modellschritte | `small-juveniles` 3 → 2 | 0.000000 m | 0.450 m |
| 3 | Rotschenkel | beschriftete Modellschritte | `small-worms` 3 → 2 | 0.000000 m | 0.423 m |
| 4 | Löffler | beschriftete Modellschritte | `shrimp` 4 → 3 | 0.000000 m | 0.432 m |
| 5 | Säbelschnäbler | beschriftete Modellschritte | `small-juveniles` 3 → 2 | 0.000000 m | 0.450 m |
| 6 | Rotschenkel | beschriftete Modellschritte | `small-worms` 3 → 2 | 0.000000 m | 0.423 m |
| 7 | Löffler | beschriftete Modellschritte | `shrimp` 4 → 3 | 0.000000 m | 0.432 m |
| 8 | Austernfischer | beschriftete Modellschritte | `shared-mussels` 17 → 16 | 0.002344 m | 0.432 m |

Die Ressourcenwerte werden unverändert übernommen: In einigen beschrifteten Modellfolgen wurde bereits frühere Beute verbraucht, bevor die hier vollständig dokumentierte Annäherung beginnt. Deshalb sind beispielsweise Garnelen 4 → 3 oder Muscheln 17 → 16 korrekt und werden nicht zu anfänglichen Vorräten umgeschrieben. Ein Bild „nach Abgang“ kann bereits die nächste Annäherung zeigen; es dokumentiert das Verlassen der abgeschlossenen Beuteepisode.

## Modellwartezeit und erworbenes Feldbuch

Zwischen den beiden Vierergruppen führt der Treiber 240 gewöhnliche Klicks auf beschriftete 5-Modellsekunden-Schritte aus: **1200 Modellsekunden in 55.474 Wandsekunden**. Run-ID bleibt gleich, sämtliche vier Vorräte sind danach erschöpft. Eigene Beobachtungszeit bleibt vor und nach dieser Wartebedingung 0. Das ist keine tatsächlich geleistete 20-minütige K1-Arbeit.

Das exportierte Feldbuch enthält **einen tatsächlich über die Oberfläche gespeicherten Fernglasbeleg** zum Austernfischer: Quelle `own-observation`, 18.2826 Sekunden aktive Sichtung, Modellzeit 6.6483, erster neuer lokaler Kontext und vollständige Herkunft zur selbst erreichten Ankunft. Seine Ereignisliste ist leer; das konkrete Nahrungserwerbsereignis steht separat in der Browsertelemetrie. Hieraus wird kein abgeschlossener K2-Auftrag behauptet.

## Originalvideo und tatsächliche Sichtungsgrenzen

Die ursprüngliche WebM-Datei hat 213407 Bytes, passenden aufgezeichneten SHA256, VP8 und 800×600 Pixel. `ffprobe` dekodiert 97 Frames mit streng steigenden Präsentationszeiten von 0 bis **17.454 Sekunden**; der größte Abstand beträgt 0.381 Sekunden. Die protokollierte Aufnahmeoperation dauert **18.216 Wandsekunden**. Der Container nennt keine Gesamtdauer. Die Metadatenangabe `r_frame_rate=1000/1` wird nicht als tatsächliche Bildrate ausgegeben.

Angesehen wurden fünf unverändert dekodierte Originalframes (Indizes 0, 24, 48, 72, 96; ohne Skalierung, Ausschnitt, Überblendung oder Zeitmanipulation), acht Original-Phasenbilder – eines aus jeder Folge – und zwei Original-Endpunktbilder. Alle 48 Phasenbilder und drei Endpunktbilder wurden technisch geprüft. Die übrigen Bilder werden ausdrücklich nicht als einzeln visuell angesehen bezeichnet.

Der Ziel-Austernfischer ist klein im Hintergrund zwischen Pfosten. Der größere Vogel im Vordergrund ist ein anderes Individuum. Kopf- und Körperhaltung ändern sich; konkrete Muschel und eigenständiger Schluckvorgang sind in den ausgewählten Frames nicht sicher erkennbar. Die näheren Modellbilder von Säbelschnäbler, Rotschenkel und Löffler zeigen erkennbare Haltungsunterschiede und eindeutig beschriftete Modellzeit, erlauben aber ebenfalls keine uneingeschränkte Kleinstbeute-/Schluckabnahme. Die programmgesteuerten Sichtprüfungen „Körper/Schnabel frei und im Bild“ ersetzen diese visuelle Beurteilung nicht.

Die Aufzeichnung zeigt ausschließlich die erste echte Echtzeitfolge. Die sieben übrigen Folgen verwenden ausdrücklich beschriftete Modellschritte. Es wurden keine nachgebauten Videoframes als Originalnachweise ausgegeben.

## Quellen und Grenzen

- Neuer Rohbericht: `work/qa-correction/supplemental-arrival-3600/result.json`.
- Originalvideo und Feldbuch: `coastal-feeding-realtime.webm` und `arrival-fieldbook.json` neben diesem Rohbericht.
- Decoder-Metadaten und fünf ausgewählte Frames: `work/qa-2026-10-23/arrival-final-review/`.
- Historischer 900-Sekunden-Fehler: `work/qa-2026-10-23/historical-plan/arrival-failure/result.json`, eigener alter Runtime-Freeze und unverändert übereinstimmende Fehlerlogs.

Diese eigene, rein lesende Review bestätigt die genannten funktionalen Belege. Physisches iPad 9, Safari/iPadOS 27, ausreichende Gerätegeschwindigkeit, biologische Endabnahme und Unterrichtserprobung bleiben ungeprüft. Kein Browser oder Build wurde für diese Review neu gestartet; keine Produktdatei wurde verändert.
