# Arbeitsunterbrechung am 1. November 2026

Status: **nicht abgenommen; keine finale HTML-/SCORM-Auslieferung**.

Der integrierte grafische Entwicklungsauftrag bleibt offen. Der erste Implementierungsstand ist 822aeb3f30bb1e67248725a8a51e441f3ae5516e auf feature/ranger-kompakt. Die Ausführungsumgebung wurde während der zusätzlichen Browserprüfungen unzugänglich. GitHub-Zugriff blieb möglich. Unterbrochene oder ausstehende Prüfungen zählen nicht als bestanden.

## Gesicherte Korrekturen nach dem ersten Stand

- Tablet-Pixelverhältnis wieder auf maximal 1 gesetzt. Die unveränderten Browserprüfungen erwarten bei DPR 1 die volle CSS-Breite des Canvas; der Versuch mit 0,8 verletzte diesen Vertrag. Tests und Grenzwerte bleiben unverändert.
- Keilmeldeblätter an denselben gekrümmten Achsen verankert, die die Stängel erzeugen.
- Baumstämme durchgängig bis zur Basis modelliert.
- NPC-Kopf als zusammenhängendes Drehprofil, Schultervolumen reduziert.

Die drei Formkorrekturen waren vor der Unterbrechung lokal implementiert und der zusätzliche Geometriecheck bestand; ihre abschließende Sichtprüfung fehlt. Die Auflösungskorrektur wurde anhand der tatsächlichen CI-Fehler vorgenommen und benötigt einen neuen Browserlauf. Frühere Performancewerte des 0,8-Profils sind kein Nachweis für diesen Stand.

## Beobachtete Prüfungen und Fehler

- Lokal bestanden 15 bestehende Node-Suiten und der zusätzliche Geometriecheck; kein Nachweis einer vollständig bestandenen Endabnahme.
- GitHub CI 41283672156: Node-/Geometrieprüfungen bestanden. Die Jobs compact und compact-learning scheiterten an erwarteten Canvas-Breiten 1024 bzw. 1080. Im Lernjob bestanden davor K1–K5 samt vorhandenen Negativ-, Speicher- und Importprüfungen. Diese vorhandenen Abläufe ersetzen nicht den zusätzlichen Weg ausschließlich mit normalen Bewegungseingaben.
- SCORM-Lauf 41283666329: fünf Chromium-Popup-Prüfungen der unveränderten Referenzvorlage scheiterten; ranger-export wurde übersprungen. Ursache noch nicht geklärt, kein neuer geprüfter Auslieferungs-ZIP.
- Zusätzlicher nativer Lernlauf lokal: K1 tatsächlich durch Bewegung und Beobachtung erreicht; zuletzt noch unterwegs zum nächsten Ort. K2–K5 dieses Laufs und die zusätzlichen Echtzeit-Nahrungsvideos nicht bestätigt.
- Weltvergleich: 14 feste Vorher-/Nachheransichten aufgenommen. Galerie: 38 Detail-/Weltzeilen für 36 Taxa plus Stadien erzeugt; vollständige Sichtabnahme und erneute Bilder der letzten Korrekturen fehlen.
- Erster 360°-Vergleich scheiterte numerisch, weil die Messfläche einen später eingeblendeten HUD-Hinweis einschloss. Messfläche verkleinert, Schwelle unverändert; Wiederholung am endgültigen Himmel offen.
- Keine neue vollständige Langzeit-, 900-Sekunden-Routen-, native-200%-Zoom- oder reale iPad-/LMS-Abnahme.

## Priorisierte Fortsetzung

1. Ausführungsumgebung wieder verfügbar machen; lokale Änderungen und Ergebnisse zuerst sichern. Remote-Änderungen mit dem lokalen Stand abgleichen, nichts pauschal zurücksetzen.
2. Tatsächliche SCORM-Popup-Fehler untersuchen und korrigieren; originale Tests unverändert bestehen lassen. Auflösungskorrektur mit den originalen Browserprüfungen bestätigen.
3. Zusätzliche native K1–K5-Wege, zwei unbeschleunigte Nahrungsvorgänge, erreichbare Freiansichten von Maus, Meise und Eichelhäher sowie kleine SCORM-Frames und Formulare vollständig prüfen.
4. Finale Form-/Weltbilder, alle Arten und Stadien, durchgängigen Himmel sowie Deichansichten visuell beurteilen. Verbleibende Stilisierung und nicht erfüllte Realismusziele ausdrücklich ausweisen.
5. Isolierte finale Performance- und Langzeitmessungen mit genauer Renderer-/Auflösungskonfiguration; Software-Rendering nicht als iPad-Leistung darstellen.
6. Qualitätsmatrix, ein priorisiertes Restregister und Abschlussbericht erstellen. Finalen Quellstand einfrieren, HTML und SCORM neu bauen, aktuelle Actions-ZIP herunterladen und unabhängig samt Hash prüfen. Kompaktes Belegpaket erzeugen und Draft-PR aktualisieren.

Lokale Arbeitsbelege lagen unter work/rc. Der zuletzt lokal gebaute, nicht finale HTML-Stand hatte SHA-256 a347b561fdb4021910b23c3a7121d75e9773bf51df90cd9ae5aadfe6c6e38aeb; er enthält noch die 0,8-Auflösung und darf nicht als korrigierte Endfassung ausgegeben werden. Die lokale Erweiterung compact_native_feeding.py und ihre Einbindung waren noch nicht committed; beim Wiederanlauf sichern und tatsächlich prüfen.

Kein Merge, keine Veröffentlichung auf Pages und kein LMS-Upload.
