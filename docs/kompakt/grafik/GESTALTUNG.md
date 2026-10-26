# Grafikdurchgang · 26. Oktober 2026

Ausgang: `9d45aba9e7fb2c170291ca760eec0f5e6e33fb71`, Branch `feature/ranger-kompakt`, Draft-PR #3. Auftrag: gesamte Kompaktfassung, reguläre HTML und bestehende SCORM-1.2-Ausgabe. Keine Änderung der fachlichen Simulation, kein Merge/Deployment.

## Bildsprache und Umsetzung

Naturkundliches Feldbuch: dunkles Waldgrün, helles Papier, zurückhaltendes Messing, Serifenschrift für Überschriften und gut lesbare Systemschrift für Handlungen. Lokale Vektorsymbole, erkennbare Werkzeugzustände, deutliches Fokuszeichen, ruhige Dialogflächen und gut getrennte Formulare. Kein Schrift- oder Bildabruf aus dem Netz.

| Raum | Tatsächlich bearbeitete Darstellung | Bewahrte Grundlagen |
|---|---|---|
| Wald | Aufgelöste Blattgruppen statt großer geschlossener Kronen; kleinere unregelmäßige Kronenkerne, Buchen-/Eichenblatttexturen, kleinere einzelne Blätter, Rindenzeichnung, differenzierter Boden | Alle Stammstandorte, Beobachtungszweige, Stützen, registrierten Pflanzen, Wege und Kollisionen |
| Dorf | Geformte statt quaderförmige Figurenoberkörper, Gelenkformen, Gesicht und Kleidung; Blickrichtung zum vorhandenen Zugang; Fensterkreuze/-bänke, Dachkurse, First, Regenrinnen, Fallrohre, Tür-/Schornsteindetails | Drei Sprecher, Dialoge, Positionen, Hauskörper und Kollisionen |
| Deich | Griffigere Bodenmaterialien, weichere Materialübergänge und atmosphärische Tiefe | Exakte bisherige Höhe, Rampen, Krone und Routen; keine neue Schutzwirkungsbehauptung |
| Salzwiese | Verfeinerte Blatt-/Blütenoberflächen, Blattmittelrippen und Farbvariation; getrennte bestehende Pflanzenformen, weichere Sedimentübergänge | Korrigierte Höhen, konkrete Pflanzen, Überflutungsbeziehungen und Saisonfenster |
| Watt/Priel | Feuchteabhängige Sedimentabdunklung an der echten Wasserhöhe, feine Rippelzeichnung und differenziertere Wasseroberfläche | Tide, Bodenhöhe, eingesetzte Beuteanker, endlicher Bestand; keine erfundenen Tierspuren |

Organismen: glattere geschlossene Vogelrümpfe und Hälse, gefächerte Schwanz-/gefaltete Schwungfedern, Rotschenkelzeichnung, geschwungene Falterflügel mit vier Augenflecken, Raupenfüße, Mausvibrissen, Zeckenschild/Mundwerkzeuge, Krabbenseitenzähne, Garnelenrostrum/-Schwanzfächer und Wattwurmbüschel. Bestehende Spezial-GLBs für Reh und Fuchs bleiben erhalten und bekommen dezente Felloberflächen. Specht bleibt an tatsächlichen Stützen. Alle Oberflächen erhalten nach Gruppe eine eigene feine Materialzeichnung; Merkmalsfarben werden nicht ersetzt. Die Taxonmatrix trennt Geometrie, Material und unveränderte Teile ausdrücklich.

Bewegung: zusätzliche kleine Fußhebungen der tatsächlich bewegten Maus/Käfer und gekrümmte Flügelschlagkurve; Kontaktphasen der Hummel bleiben ruhig. Gangphase folgt wirklicher Wegstrecke, kein automatisches Marschieren im Stand. Reh-IK und alle vier Küstenvogel-Beute-/Schnabelanker bleiben erhalten. Keine neue Fress-/Ressourcenlogik.

## Herkunft, Technik und Grenzen

Alle neuen Blatttexturen entstehen deterministisch aus eigenem Canvas-Code in `canopy-view.js`. Oberflächenzeichnung entsteht aus eigenem Shadercode in `scenic-materials.js`. Keine fremden Modelle, bezahlten Dienste, Accounts oder zusätzlichen Runtime-Downloads. Die vorhandenen lokalen Assets und ihre Lizenzhinweise bleiben erhalten; dieser Bericht erteilt keine pauschale Lizenz am gesamten Projekt.

Die Blattkarten verwenden Alpha-Test, keine transparente Sortierung. Sie gehören zu vorhandenen Bäumen; sie sind keine zusätzlichen zählbaren Individuen. Die feste Weltgeometrie für Boden-/Beutekontakte wird nicht verschoben. Feinblätter sind wie zuvor keine einzeln simulierten Kollisionskörper. Die Sichtprüfung verwendet weiter echte feste Kronenkerne/Stämme; nicht jedes dekorative Blatt ist ein eigenständiger Sichtblocker.

Die Darstellung bleibt prozedural und teilweise stilisiert. Keine photogrammetrischen Pflanzen, gescannte Menschen oder fotorealistische Fell-/Federstränge. Kein vollständig neues Skelett für alle Kleintiere, keine empirisch kalibrierte Biomechanik. Blatt- und Wasserbewegung werden nicht durch neue ungesicherte Umweltmodelle erfunden. Physisches iPad/Safari, itslearning und Unterrichtswirkung benötigen eigene Abnahmen.

Aktuelle Ergebnisse, Bilder, Hashes und vollständige Taxonmatrix werden nach den tatsächlichen Endläufen ergänzt. Frühere fehlgeschlagene Softwaregrafiktests bleiben unverändert erhalten.
