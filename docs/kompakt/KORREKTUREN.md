# Ranger Kompakt – Korrekturmatrix

Geprüfter Runtime-Stand: `3920a1d1d2692889b75403c1b0e50f5b856398aa`. Alle 15 Schritte des [neuen lokalen Funktionsprüfplans](../../verification/kompakt-endqa-20261023/final/plan/result.json) sind bestanden. Die fachlichen, visuellen und gerätebezogenen Grenzen der folgenden Matrix bleiben davon getrennt. Details stehen in [TESTS.md](TESTS.md).

| Befund | Gezielte Korrektur | Frisch belegter Status und verbleibende Grenze |
|---|---|---|
| F01 – Antwortimporte | Strikte Typen/Formen, atomare Ablehnung und Originalbackup; qualifizierte K2-Altbezüge | 46 native Importfälle bestanden, darunter 40 Ablehnungen und drei Legacy-K2-UI-Fälle. Fixtures sind keine eigenen Sichtungen. Originalfixture-Abgleich mit dem unabhängigen End-QA-ZIP wegen Transfergrenze nicht erfolgt. |
| F02 – endlicher Nahrungserwerb / N01 | Neue lokale endliche Kontexte mit Run-ID, Zeit und Herkunft; Beobachter und Feldbuch bleiben erhalten | Ergänzender Ankunftslauf bestanden: acht Folgen, 48 Phasenbilder. Der ursprüngliche 900-Sekunden-Lauf bleibt fehlgeschlagen. Kein Geschwindigkeitsnachweis. |
| F03 – Bewegung/Kontakt | Konkrete Beute, Kontakt vor Erwerb, Mengen, Größe, Tiefe und Handhabung | Neue Feeding- und Arrival-Assertions bestanden. Im Echtzeitvideo sind konkrete Kleinstbeute und Schlucken nicht sicher auflösbar; visuelle Abnahme bleibt begrenzt. |
| F04 – Ort/Methode/Szene | Individuum, Seed, Revision, Ort, Methode, Zeit und Herkunft werden gebunden | Kontextgruppen sowie K3-Positiv- und Negativfall bestanden. Unsigniertes JSON hat keine Authentizitätsgarantie. |
| F05 – Waldgestaltung | Zusammenhängender Krautsaum, gestaffelte Kronen, Sträucher und lesbareres Totholz | Neue Sichtung aller 26 aktuellen Bilder zeigt Verbesserungen. **Teilweise erfüllt:** kahle Lichtlücken, dünne Sträucher, wiederholte Formen und überdeckte Bildbereiche bleiben. |
| F06 – Dorf/Deich/Wege | Begehbare Wege und Böschungen; lokal erreichbare verfasste Perspektiven | Normaler Hauptweg, zusätzliche Habitatwege und drei lokale Gespräche geprüft. Gespräche sind keine realen Befragungen. |
| F07 – Salzwiese / N02 | Andel höhengebunden in Revision 4; andere Taxa und alte Rekonstruktionen erhalten | Frische Vier-Seed-Modellprüfung und gleiche Tidekameras bestanden. Andel bleibt bei normalem Hochwasser trocken. Höhere absolute Analysepegel sind keine jährlichen Fluthäufigkeiten. |
| F08 – Bestimmung/Transfer | Anonyme Labels, eigene Merkmale, plausible Fehlwahl, Unsicherheit und Transfer | K1 richtig, falsch und begründet unsicher in beiden Lernpfaden geprüft; neue Webgalerie mit 37 Bildern vollständig. Keine Garantie natürlicher Feinbestimmung. |
| F09 – Materialtiefe | C01 mit veröffentlichten Biomdaten; C15 mit zwei konkreten Studienarten; C17 mit getrennten Endpunkten und Quellen | Fünf Materialgruppen, Downloads und neuer Druck bestanden. **Teilweise erfüllt:** C17-Fekunditätsnotation und Weibchenbezug bleiben offen. ETS-Seiten 27–28 nicht zugänglich. |
| F10 – Management | Küstenbeleg, Kriterienbezug, Gewichte, Alternative und getrennte Sach-/Wert-/Norm-/Folgenfelder | K5 weist Waldbelege zurück und nimmt passende Küstenbegründungen an. Freie Argumentation erfordert menschliche Bewertung. |
| F11 – Stickstoff | Fixierung und Assimilation getrennt; offene und geschlossene Bilanz | Nodeprüfungen und Modellplots/-tabellen bestanden. Relatives Modell, keine mg/l-Prognose oder vollständige Prozesskinetik. |
| F12 – Mindestgerät/Pilot | Zielgerät: Apple iPad 9, Safari, vom Nutzer genanntes iPadOS 27 | **Nicht geprüft:** physisches Gerät, Unterrichtspilot und Lernwirkung. Cloud-Softwaregrafik und Touchsimulation ersetzen dies nicht. |
| F13 – Aufgabenprodukte / N04 | Spezifische Antwortprodukte, zusammengehörige Blöcke und Fortsetzungskennzeichnung | Neuer Druck mit 39 Schüler- und 58 Lehrkräfteseiten bestanden; fünf Kontaktbögen angesehen, 37 frühere Detailansichten über 97 identische Raster gebunden. Lange Karten bleiben mehrseitig. |
| N03 – Nullwachstum | Nullfall vor potenziell überlaufender Exponentialrechnung; positiver Overflow bleibt Fehler | Vier Browsergruppen bestanden, einschließlich nativer Exporte. Positive Überläufe und ungültige Eingaben werden weiterhin abgelehnt. |

## Ergänzende Beleggrenzen

K2-Altbezüge werden bei eindeutiger Zuordnung erhalten; mehrfach kopierte Belege desselben Rundgangs/Ereignisses bleiben eindeutig. Mehrdeutige Alt-IDs werden nicht automatisch ausgewählt. Zwei echte UI-Bilder zeigen die Warnung mit zwei zunächst ungewählten qualifizierten Optionen und den erfolgreichen Abschluss erst nach ausdrücklichem Speichern.

Die reale Stabilitätsprüfung besteht funktional nach 1205,13 Messsekunden (1211,59 Sekunden einschließlich Nachprüfungen); das 30-FPS-Cloudbudget ist in den Stichproben nicht eingehalten. Beim Tabwechsel blieb die gemeldete Sichtbarkeit `visible`, daher kein Nachweis einer Hintergrundpause.

Beide tatsächlichen Grafikpfade sind bestanden: nativer Restore mit gleicher Run-ID und öffentliche Retry-UI mit echter Reloadnavigation und neuer Run-ID. Beide vergleichen 922 unveränderte Feldbuchbytes mit einem eigenen Beleg. Der normale Lernreload prüft getrennt die erworbene K1–K5-Arbeit. Der Warnlayoutfall mit `warningVisible: false` belegt lediglich berechnete Positionen.

Die Ankunftswartebedingung erzeugt 1200 Modellsekunden in 55,474 Wandsekunden; sie ist keine 20-minütige K1-Arbeit. Das Echtzeitvideo wird über eine 18,216 Sekunden dauernde Aufnahmeoperation und dekodierte Frame-Zeitstempel bis 17,454 Sekunden beschrieben, nicht über eine unbestätigte Containerdauer. Ein eigener gespeicherter Fernglasbeleg ist vorhanden; die Ereignisse liegen separat in der Telemetrie.

K1–K5 bestehen im Webpfad und in der Einzeldatei. Der getrennte Legacy-Gesamtlauf besteht mit 16 Prüfgruppen einschließlich M1–M3, freiem Spiel und Speicher-/Resilienzpfaden. Der Legacy-Einzeldatei-Smoke besteht mit drei Gruppen; er wiederholt keinen vollständigen Missionslauf. Der [historische Plan](../../verification/kompakt-endqa-20261023/final/historical-plan/result.json) mit zwei Fehlern bleibt erhalten. Der PR bleibt Draft; kein Merge, Deployment oder Release.
