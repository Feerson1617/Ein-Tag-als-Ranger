# Abschließende Habitat-Sichtung · 23.10.2026

Der frische [Habitat-Browserreport](../qa-correction/final-habitat-revision/result.json) gehört zum eingefrorenen Stand **`78e723bcb5ca448fa7161146db82fc4451b59f38`**. Er enthält 26 Bilder und keine gemeldeten JavaScript-Seitenfehler. Die aktuelle Sichtung bestätigt die gezielte Verbesserung; **F05 erhält weiterhin keine uneingeschränkte gestalterische Freigabe**.

## Integrität und Vergleich

- Alle **51/51 Quellenhashes** stimmen zwischen Report, `work/final-qa/runtime-freeze.json` und `dist/` überein. Die vorhandene Standalone-HTML stimmt mit SHA256 `a96e7c830df5c8dd0c92dd9df8f509b722b0485ca843a7f4cdb69866bf152bc7` überein.
- Alle 26 PNGs sind strukturell lesbar (PNG-Chunks/CRC und dekomprimierbare Bilddaten). **8/8** im Originalreport verzeichnete Diagnosebild-Hashes stimmen überein. Für die 18 Weltbilder enthält der Originalreport keinen vorherigen Bildhash; ihre jetzt berechneten Hashes stehen in [final-habitat-review.json](final-habitat-review.json). Ein früherer Hashvergleich wird für diese 18 Bilder nicht behauptet.
- Die gesicherten f921-Baselines für ursprüngliche Kameras und zusätzlichen festen Lichtlückenblick stammen von derselben unveränderten HTML `d774d542d8a2984100b880ed1d771721e064299da11c8f9b3c616fc7ea844ff9` und identischen Quellenhashes. Bei **16 festen Vergleichsbildern** stimmen x/z/yaw/pitch innerhalb 0,00001 überein: zehn ursprüngliche Ansichten, Lichtlücke, Saum und vier Tidebilder. Normale Gehbilder wurden ausdrücklich nicht als exakt gleiche Endkameras behandelt.
- Elf aktuelle PNGs und fünf f921-PNGs wurden direkt angesehen; Auswahl und alle Hashes stehen im JSON. Keine Bilder verändert, keine Browser/Builds gestartet, keine getrackten Dateien geändert.

## Kurze aktuelle Bildbewertung

**Waldkern:** Der Krautsaum ist deutlich zusammenhängender als in f921; unterschiedliche Kronenhöhen und -breiten gliedern den Raum stärker. Weg, Reh und liegender Stamm bleiben sichtbar. Das normale Gehbild bestätigt diese Wirkung aus näherer Position.

**Lichtlücke:** Die feste gleiche Kamera zeigt die vielfältigeren Kronensilhouetten und niedrigeren Jungbaumformen. Der normale Gehblick zeigt den zusammengefassten Brombeerbestand. Der große Vordergrund bleibt kahl, die Ranken wirken dünn/gerüsthaft; gerade Stämme und wiederholte polygonale Kronen prägen weiter das Bild. Sichtbare Größenunterschiede sind kein sicherer alleiniger Nachweis biologischer Altersklassen. Der echte Hinweis zur langsamen Clouddarstellung verdeckt rechts einen Ausschnitt; dieser Bereich wird nicht visuell freigegeben.

**Totholz und Saum:** Rindenrippen, Aststummel und Endfläche machen den vorher glatten Stamm deutlicher lesbar; die Krautschicht ist räumlich stärker gebündelt. Brennnesselblätter und freier Weg bleiben am Saum sichtbar. Holz, Boden und Fernkulisse bleiben grobe stilisierte Formen, kein naturgetreuer oder vollständiger Waldnachweis.

**K1-Diagnostik:** Die acht Diagnose-PNGs sind bytegleich mit den zuvor geprüften Schlussbildern; die gedrehten Waldmeister-/Eichenbilder wurden nochmals direkt angesehen. Blattquirle bzw. gelappte Blattform bleiben erkennbar. Daraus folgt keine neue Feinbestimmungs- oder Naturtreuezertifizierung.

**N02:** Im gleichen aktuellen Andelblick liegt der Bestand sowohl bei Niedrigwasser (ca. -1.049901 m) als auch bei normalem Hochwasser (ca. -0.250092 m) auf dem trockenen Vordergrund; die f921-Hochwasseransicht zeigt den früheren Bestand weiter seewärts in der überfluteten Zone. Keilmelde bleibt im aktuellen Hochwasserbild trocken. Die vollständigen Höhen-/Überflutungszahlen für vier Seeds kommen aus dem separat bestandenen [Modellresultat](../qa-correction/final-review-node/compact-habitat-revision/habitat-revision-result.json), nicht aus einer Bildzählung. Keine neuen Modellläufe oder Plots erstellt; +0,05/+0,30 m bleiben absolute analytische Pegel ohne behauptete Jahreshäufigkeit.

**Verbleibende Abnahmegrenze:** Technische Reproduzierbarkeit und sichtbare gezielte Verbesserungen sind belegt. Kahle Lichtlückenflächen, dünne Sträucher, wiederholte Formen und teilweise verdeckte Bildbereiche bleiben offen. Das ist weder eine vollständige F05-Freigabe noch ein Test auf echtem iPad 9/Safari/iPadOS 27; Renderzähler und SwiftShader-Framezeiten ersetzen keine fachliche Bildbewertung oder Geräteprüfung.
