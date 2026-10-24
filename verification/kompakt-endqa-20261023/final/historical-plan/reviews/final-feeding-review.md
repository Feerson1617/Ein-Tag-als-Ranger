# Sichtprüfung der vorhandenen Feeding-Folgen · 23.10.2026

Alle **28 unveränderten Originalbilder** (sieben Phasen je Säbelschnäbler, Rotschenkel, Löffler und Austernfischer) wurden einzeln angesehen. Die Folgen belegen sichtbare Änderungen der Haltung; sie tragen **keine uneingeschränkte Freigabe der Nahrungserwerbsanimation**. Insbesondere kleine Beute und die eigentliche Schluckbewegung sind teilweise nicht sicher auflösbar. Der bestandene technische Test und die Phasenbeschriftungen wurden nicht als Ersatz für die Bildsichtung verwendet.

## Herkunft und Integrität

- Report: [final-feeding/result.json](../qa-correction/final-feeding/result.json), abgeschlossen `2026-10-23T07:06:52Z`, Chromium `154.0.8037.57`; Originalgalerie: [index.html](../qa-correction/final-feeding/index.html).
- Reportcommit und [aktuelle Laufzeitfixierung](../final-qa/runtime-freeze.json): beide `78e723bcb5ca448fa7161146db82fc4451b59f38`.
- Alle **51/51 Runtime-Quellhashes** stimmen zwischen Report, Laufzeitfixierung und vorhandenen Dateien in `dist/` überein. Alle **28/28 PNG-SHA256s** stimmen mit dem Report überein.
- Die vorhandene `outputs/Ranger-Kompakt.html` stimmt mit dem Report überein: `a96e7c830df5c8dd0c92dd9df8f509b722b0485ca843a7f4cdb69866bf152bc7`.
- Report-SHA256: `ffaf2ad2956c2ce9fdfbc01fa0e5dca54953b82dbd02b06503a451b8b11a240e`. Freeze-JSON-SHA256: `d143ce1cd50ad75d4b7f4b9ac69638c81f714eb4e0bd39be9c142295e785f8fa`.
- Keine neuen Browserläufe, Builds, Bildbearbeitungen oder Änderungen an getrackten Dateien; Rohbilder bleiben erhalten.

## Was in den Bildern erkennbar ist

| Art | Sichtbarer Befund | Grenze der Bildfolge |
|---|---|---|
| Säbelschnäbler | Schwarze/weiße Silhouette, gebogener Schnabel und helle Beine frei sichtbar. Zwischen Annäherung und Suche sinken Kopf/Schnabel deutlich ab; nach der Aufnahmephase richtet sich der Vogel wieder auf. | Such-, Kontakt- und Aufnahmebilder unterscheiden sich nur wenig. Kleine Beute im Wasser ist nicht sicher erkennbar. Ein seitliches Schwenken oder ein tatsächlich sichtbarer Schluckvorgang ist aus je einem Einzelbild nicht nachgewiesen. |
| Rotschenkel | Rote Beine und Schnabel sowie das Absenken des Kopfes bis zum Boden sind sichtbar; die Kontaktpose liegt tiefer als die Annäherung, die Abgangspose ist wieder aufrecht. | Das Tier ist klein und fast frontal aufgenommen. Die Beute ist vor dem unruhigen Boden nicht sicher auflösbar; die Bilder erlauben keine sichere Detailbeurteilung des Schnabelkontakts oder der Aufnahme. |
| Löffler | Größter und am besten lesbarer Vogel dieser Folge. Langer breiter Schnabel, abgesenkter Kopf und gebeugte Beine wechseln deutlich in eine aufrechte Haltung. Im Aufnahmebild liegt ein sehr kleines helles Detail an der Schnabelspitze. | Dieses Detail allein identifiziert keine Garnele und belegt keinen vollständigen Schluckweg. Die einzelnen Such-/Kontaktposen beweisen keine seitliche Schwenkbewegung. Beine/Hals wirken stark schematisiert; Naturtreue oder flüssige Übergänge wurden nicht bestätigt. |
| Austernfischer | Muschelfeld und oranger Schnabel sind kontrastreich sichtbar. Im Kontaktbild erreicht die Spitze eine einzelne dunkle Muschel; im Aufnahmebild ist helles Material an der Spitze sichtbar. Aufrichten sowie Änderung der Position zum Muschelfeld sind nachvollziehbar. | Das Öffnen der Schalen und der Transport in den Rachen sind in diesen wenigen Bildern nicht vollständig zu verfolgen. Die Identität des kleinen hellen Materials stammt aus dem Modellprotokoll, nicht allein aus seiner sichtbaren Form. |

Bei allen vier Arten bleiben Körper und Schnabel innerhalb des Bildes; das seitliche Bedienfeld verdeckt das Haupttier nicht. Die Tiergeometrien sind deutlich stilisiert. Wegen der mitgeführten Kamera lässt sich ein Ortswechsel nicht allein aus der Bildschirmposition des Vogels ablesen; Hintergrundänderung und Modellkoordinaten ergänzen die Bilder. Aus sieben Standbildern folgen keine Aussage über flüssige Animation, Gelenkkinematik, reales Gangbild oder Geräte-FPS.

## Abgrenzung zu Protokoll und Ankunftstest

Die Bildnamen sind keine zusätzlichen biologischen Beobachtungen: Bei Löffler und Austernfischer zeigt `initial` bereits Nahrungssuche an einem **vorherigen** Ziel. Erst `approaching` bis `swallowing` gehört jeweils zum anschließend verfolgten konkreten Beuteindividuum. Bei Rotschenkel, Löffler und Austernfischer zeigt `after-departure` bereits eine neue Annäherung; es bedeutet nicht, dass das Tier das Bild verlassen hat. Der Säbelschnäbler wartet dann wieder.

Das beigefügte Modellprotokoll meldet Kontakt vor Erwerb (Säbelschnäbler 31,033 → 31,683 s; Rotschenkel 22,017 → 22,717 s; Löffler 6,950 → 7,825 s; Austernfischer 7,240 → 10,165 s). Diese Zeiten und Beute-IDs sind **ergänzende Zustandsnachweise**, keine im Bild selbst ablesbaren Detailvorgänge. In allen Aufnahmen ist `ownSeconds = 0`; die UI kennzeichnet Modellschritte ausdrücklich als keine eigene Sichtung.

Die vorhandenen Folgen beginnen in frischen Szenen und umfassen ungefähr 0,4–34 Modellsekunden. Sie prüfen weder die normale Ankunft nach dem vollständigen Wald-Küsten-Weg noch einen vorangegangenen 15–25-minütigen Wald-/K1-Aufenthalt. Der aufgrund des 900-Sekunden-Cloudlimits abgebrochene Ankunftslauf bleibt davon getrennt; dessen noch ausstehende Wiederholung kann durch diese früh aufgenommenen Folgen nicht ersetzt werden.

**Bewertung:** Sichtbare und nachvollziehbare Posenänderungen sind bei allen vier Arten vorhanden; der Austernfischer bietet den klarsten visuellen Kontaktnachweis. Eine vollständige visuelle Bestätigung aller einzelnen Erwerbs-/Schluckvorgänge oder der biologischen Animation wird nicht erteilt. Der spätere Ankunftsnachweis bleibt offen.
