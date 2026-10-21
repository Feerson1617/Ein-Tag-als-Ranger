# Getrennte Prüfstände für Inhalte und Rechte

| Bereich | Vorhandener Nachweis | Aussagegrenze |
|---|---|---|
| 168 Taxoneinträge | IDs, Namen, Habitatbezüge, Größen in Metern, lokale Medien/Metadaten abgeglichen | kein Beweis biologischer Einzelrichtigkeit; Aggregat-/Gruppenauflösung beachten |
| 15 Fokustaxa | konkrete Merkmalslisten, lokale Referenzfotos und Fachlinks im Feldbuch | Darstellbarkeit/Fotoansicht einzeln prüfen; Unsicherheit zulassen |
| Mohn/Holunder | im Review belegte Primärquellen; explizite Pollen-/Nektartraits | Primärartikel in dieser Umgebung bisher per Proxy-403 gesperrt; kein erneutes Lesen behauptet |
| 168 Fotos | lokale Dateien, Urheber-, Quellen-, Lizenzversion-/Änderungsmetadaten in `dist/assets/SPECIES-PHOTOS.txt` | gefüllte Felder ersetzen keine rechtliche Einzelprüfung; historische Hinweise auf unklare Autoren beachten |
| 3 Vogelaufnahmen | `BIRD-RECORDINGS.txt` und Laufzeitmetadaten | keine pauschale Übertragung einer Lizenz auf andere Medien |
| 6 eigene GLBs | CC0-Kennzeichnung, Hash-/Vendoring-/Geometrienachweise im Repository | unverändert; keine neue menschliche Modellabnahme behauptet |
| Naturmaterialien | `attribution.json`, lokale Original-/WebP-Dateien, identische Pixelprüfung | WebP ist keine GPU-Texturkompression; keine KTX2-/Draco-Behauptung |
| Three.js | mitgelieferte `THREE-LICENSE.txt` | gilt für Bibliothek, nicht automatisch für Projektcode |
| Projektcode | keine globale Lizenzentscheidung vorhanden | Eigentümerentscheidung offen, keine pauschale „Open Source“-Behauptung |
| Curriculare PDFs | nur übermittelte belegte Zusammenfassung | Original-PDFs nicht als gelesen ausgegeben; schulinterne PDFs nicht veröffentlicht |

Es wurden keine neuen Modelle, Fotos oder Providerassets gekauft/generiert.
Der vorhandene Instancing-/LOD-/Pivotvertrag bleibt erhalten. Blender ist auf
dieser Maschine auffindbar; für diese Änderungen war kein neuer Blender-Export
erforderlich. Keine unnötige Kompression unveränderter GLBs ohne Vorher/Nachher-
Nachweis. Die bestehenden Geometrie-/Parser-/Flossen-/Attributprüfungen sichern
die unveränderten Modelle ab; sie sind keine biologische Artvalidierung.

Primärreferenzen aus dem Review:
https://pubmed.ncbi.nlm.nih.gov/17149583/ ;
https://doi.org/10.1371/journal.pone.0158117 ;
https://doi.org/10.1007/s00425-019-03176-5 .
Neue Regel im Code: ein nicht modelliertes Angebot wird nicht als biologische
Abwesenheit beschrieben. Blütenbesuch, Nahrungserwerb und Pollentransport bleiben
verschiedene Ereignisse; keine erfundenen Milligrammwerte.
