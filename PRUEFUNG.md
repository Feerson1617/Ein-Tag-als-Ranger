# Prüfung und Übergabe · Feldbuch 0.20
9. Oktober 2026. Aktiver Einstieg: dist/index.html → expedition.js.

## Kosten und Konten
0 Euro für diese Überarbeitung. Nur Blender 4.5.14 LTS, Game Development Studio 1.5.0 und vorhandene lokale Werkzeuge verwendet. Keine Providerjobs, Käufe oder Abonnements. Kein Konto bei einem kostenpflichtigen Anbieter eingerichtet oder verbunden. Dieses Verbot ist in den Projektanweisungen festgehalten. GitHub/Jimdo wurden nicht verändert und nichts veröffentlicht.

## Änderungen
Sechs eigene GLB-Modelle: Rotfuchs, Feldhase, Reh (weiblich), Eichhörnchen, Seehund, Kegelrobbe. Zusammenhängende Körperoberflächen, gewichtete Halsbewegungen, Fell-/Hautfarben, Fußkontakte und angepasste Robbenflossen. Augen und Nasen liegen außen auf der Robbenhaut. Neue gewölbte Schwungfedern im bestehenden symmetrischen Vogelflügelmodell. Die Modellvorschau rahmt auch hohe Tiere vollständig.

Geometrie und Animation bleiben je Art instanziert; kein Animationsmischer pro Tier. Maximal 16 Vertexattribute einschließlich Instanzmatrix und individueller Farbe. Weniger als 10.000 Dreiecke je neuem Säugetiermodell. Sechs Dateien zusammen rund 2,36 MB; keine großflächigen neuen Texturen. Zwei gleichzeitige Modelldownloads, einmaliger Wiederholungsversuch bei einem Verbindungsfehler. Alle GLBs liegen auch in der Einzel-HTML.

## Prüfungen
Alle 22 Prüfreihen auch aus dem entpackten Projektpaket bestanden. Die 21 bestehenden Reihen: regionale Evolution, Verhalten, lebendige Welt, Ranger, Szenarien, Feldökologie, Quests, Experimente, Weltgeometrie, Beobachtung, Küsten-/Renderleistung, Fortbewegung, Route/Vögel, Dorfbarrieren, Rangerbedienung, kompakte Welt, Farb-/Modelltreue, Webdarstellung, Instanzwiederverwendung, Vogelanatomie, Sitzung/Wiederherstellung.

Zusätzliche GLB-Prüfung bestanden: sechs Größen und Bodenursprünge, endliche Koordinaten/Normals, Flächenbudgets, gewichtete Halsdaten, vier Beine/Fußkontakte bei Landtieren, Robben-Bauchkontakt, Parsergrenzen und Artzuordnung, höchstens zwei Downloads mit Erholung von einem künstlichen Verbindungsfehler, 120 instanzierte Laufbilder und 16-Attribut-Grenze mit individueller Farbe. Die Rahmenprüfung ist ein automatisierter Geometrie-/Simulationslauf; tatsächliche Shader wurden zusätzlich im Browser kompiliert und dargestellt.

Game-dev: sechs aktive kanonische Pakete mit Lizenz CC0-1.0, Prüfsummen, Validierung, Paketprüfung und tatsächlichen Vendoring-Quittungen. Korrigierte Robbenpakete tragen Assetversion 0.20.2. Aktive Laufspiel-Dateien stimmen bytegenau mit den gewählten Paketen überein. Keine GPU-Sealed-Run-Messung oder menschliche Freigabe behauptet.

Browser: Einzel-HTML und gehashtes Pages-Paket im Unterverzeichnis der lokalen HTTP-Vorschau startbereit; Szenario startet ohne aktiven Auftrag, Auswahl Wald-Räuber-Beute markiert ausschließlich die ausgewählten Rotfüchse/Waldmäuse. Im Fernglas Zeitfaktor 0,5. Lupe und Fernglas bleiben getrennt. Nahansichten Fuchs/Reh/Robbe und Vögel mit tatsächlichem Modell-/Animierungsrenderer geprüft. Dateiprotokoll file:// ist im automatisierten Prüfbrowser gesperrt; direktes Öffnen per Dateiprotokoll wurde daher nicht als bestanden ausgegeben. Die Einzeldatei ist selbständig eingebettet und über den erlaubten lokalen HTTP-Ursprung geprüft.

Webprüfung: 52 aktive Module, 189 Assets (168 Artenfotos, drei optionale Aufnahmen, zwölf Naturmaterialien und sechs GLBs), relative Pfade, keine externen CDNs, identische Bildpixel der verlustfreien WebP-Materialien, Quellen/Lizenzen und ZIP-Dateiintegrität bestätigt. Pro Datei maximal 2,66 MB. Pages-Paket: rund 36,64 MB entpackt; Startobergrenze 26,58 MB, Fotos/Audio erst bei Nutzung. Einzel-HTML: rund 48,08 MB.

## Grenzen
Keine vollständig fotorealistische Darstellung: die neuen Modelle sind lokale prozedurale Anatomie, keine Scans; fotografische Fell-/Gefiederoberflächen und feinere Gesichter stehen weiter aus. Die übrigen Arten behalten ihre bisherigen artspezifischen prozeduralen Modelle. Didaktische Simulation, keine naturgetreue Populationsprognose. Keine Änderungen der fachlichen Zuordnungen oder der acht Lebensräume in dieser Version.

Desktop-Stichproben erreichen ungefähr 30 FPS. Einzel-HTML-Stichprobe bei 847 × 476 CSS-Pixeln: 30 FPS; längere einzelne Bildabstände (P95 um 48 ms) bleiben messbar. Die aktuelle Diagnose liegt in verification/browser-verification-v020.json. Kein kontrollierter Vorher/Nachher-Leistungsnachweis und keine allgemeine 30-FPS-Garantie; physische Tabletprüfung bleibt offen. Die vorhandene adaptive Darstellung, Sichtbarkeitsoptimierung, dauerhaften Tieridentitäten und optionale abgeschaltete Vogelstimmen bleiben erhalten.

## Dateien und Weiterarbeit
Feldbuch.html ist die Einzeldatei. Feldbuch-GitHub-Pages.zip für die Veröffentlichung entpacken; Feldbuch-Projekt.zip enthält Quellcode, originale Medien, Blender-Dateien, Skripte und Prüfungen. README/HANDOFF beschreiben den aktuellen Stand und die Import-/Animationsverträge. Für weitere Modelle dieselben Koordinaten, Fußkontakte, Individuen und Artzuordnungen erhalten; keine Arten durch Modellladen freischalten. Kostenrahmen und Kontoverbot gelten weiter.
