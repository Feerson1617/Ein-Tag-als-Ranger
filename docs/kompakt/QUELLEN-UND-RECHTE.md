# Quellen, Rechte und fehlende Unterlagen

Übergeben wurden Masterprompt, Prüfbericht, Artenmatrix und Curriculum-Matrix. Separate Ranger-Kompakt-Quellen.md, Ranger-Kompakt-Rechenbasis.json, Original-PDFs und erwähnte Nutzerscreenshots liegen nicht vor. Keine fehlenden Daten rekonstruiert. Ausgangsberechnungen werden direkt aus aktuellem Code neu gemessen. Die Quellenlisten in ARTEN.md/CURRICULUM.md sind die vom Review angegebenen Referenzen; eine URL bestätigt nicht sämtliche Modellparameter. Die Behauptung des Reviews, Original-PDFs gelesen zu haben, ist keine eigene Prüfung dieses Entwicklungsstands.

Fundstellen laut Zusammenfassung: ETS 2025/26 S.27–28; Fachanforderungen SH 2026 S.50–55/62; Leitfaden 2017 gedruckt S.47–49 (möglicher damaliger E-Phasen-Unterrichtsgang). Keine schulinternen PDFs, persönlichen Daten oder Nutzerbilder werden vendort.

| Bestandteil | Herkunft / Lizenz | Änderungen / Status |
|---|---|---|
| Three.js | vorhandenes vendor/three.module.js; MIT, THREE-LICENSE.txt mitgeliefert | unverändert |
| Reh-GLB | lokal mit Blender 4.3.2, tools/author-compact-deer.py, vorhandene CC0-Authoringhelfer | neuer Export; Hash, Pivot-/Rigvertrag, Füße und Maße in REH-ASSET.json; biologische/visuelle Freigabe offen |
| Specht, übrige prozedurale Organismen, Pflanzen, Häuser, Schilder, Terrain, Weg | lokale eigene prozedurale Geometrie/Canvas-Schrift | keine externen Medien oder Providerassets; Implementierungsquellen im Projekt |
| Boden-/Holzatlas und Panorama | vorhandene eigene generierte Projektmaterialien, Eintrag in dist/assets/attribution.json und IMAGE-PROMPTS.md | drei unveränderte WebP-Dateien; keine Natur-/Bestimmungsfotografie; Herkunft im Kompaktpaket mitgeliefert |
| Projektcode | Eigentümerentscheidung | keine globale neue Codelizenz festgelegt |
| Arten-/Curriculumtabellen | übergebene Reviewzusammenfassungen | aktive Umsetzung in CATALOG/MATERIALS und dokumentierte Grenzen; keine eigene Original-PDF-Lektüre |

Keine externen Fotos, Tieraufnahmen, Robbenmodelle oder acht Habitatmodule im Kompaktpaket. Keine Käufe, Konten, Tokens, kostenpflichtigen Dienste oder externen KI-Anfragen. Fachquellen sind keine Medienlizenzen. GlTF Transform, SpectorJS, KTX2 oder Draco wurden hier nicht eingesetzt und werden nicht als verwendete Optimierungswerkzeuge ausgegeben.

## Ausbau vom 22.10.2026

Der vorhandene Fuchs wird gezielt als einzelnes GLB aus dem Projekt geladen. Seine ursprüngliche CC0-Authoringherkunft und SHA256 stehen im erzeugten MATERIALS.json; die sechs alten Spezialmodelle werden nicht vorab geladen. Die übrigen neuen Formen sind lokale prozedurale Geometrie. Der Paketgraph enthält genau zwei GLBs und drei vorhandene WebPs.

FloraWeb (Galium/Urtica) antwortete bei den aktuellen Abrufen mit HTTP 200, lieferte aber keine hier verifizierten artscharfen Ellenbergwerte. PubMed 17517636 antwortete mit HTTP 203 ohne auswertbaren Abstract. Abrufstatus ist kein Nachweis der Modellparameter. Der konkrete Abrufbericht wird in verification/kompakt-v2/source-access.json gesichert. C04/C15/C23/C24 enthalten deshalb ausdrücklich Quellenaufträge und begrenzte Aussagen; keine numerischen Ellenberg-, Kidd- oder Fußabdruckwerte wurden erfunden.

Keine biologische oder bibliographische Endabnahme wird behauptet. Lehrkräfte müssen die bezeichneten externen Originalmaterialien für ihren Unterricht auswählen und prüfen. Alle 25 Karten liefern Aufgaben, Herkunft, Kriterien und Grenzen; vier dieser Karten sind ausdrücklich ergänzende Lektüre/Recherche statt eines vollständig mitgelieferten empirischen Datensatzes.


Korrekturquellen (tatsächlich gelesene Fassungen und Fundstellen in lesson-resources.js / QUELLEN-KORREKTUR.json): FloraWeb Galium 2560 L2/F5/N5 und Urtica s. l. 6145 Lx/F6/N8; Atriplex portulacoides 20705 als akzeptierter Name mit Halimione-Synonym. CNX-Lehrdarstellung zum Hornvogel/Meerkatzen-Playbackfall, ausdrücklich Sekundärdarstellung von Rainey et al. 2004. OpenStax Biology 2e zur Homologie und Strahlung, als eigene Paraphrasen ohne fremde Bilder. Die missverständliche ältere Formulierung „reflect“ wird als Absorption/Emission präzisiert; historische CO₂-Zahlen nicht als aktuelle Messwerte benutzt.

Tse et al. 2013, DOI 10.1242/bio.20134283: Originaltext über öffentliches Forschungskorpus tatsächlich gelesen; Versuchsbedingungen und berichtete Ergebnisrichtungen mit Fundstellen lokal paraphrasiert. Keine Originalabbildung, fremder Volltext, Rohwinkel oder erfundene Häufigkeiten mitgeliefert. Der Originaltext nennt CC BY-NC-SA 3.0; hier werden bibliographische Angaben und sachliche Studieninformationen in eigener deutscher Darstellung verwendet. Kidd 2007 war durch Zugangs-/Identitätsblock nicht lesbar und wird nicht als gelesener Datenbeleg ausgegeben.

C24: drei historische Wertepaare der öffentlichen Datei NFA 2019 public_data.csv für 2016, mit festgehaltener Commit- und Dateiprüfsumme. Keine vollständige Fremddatendatei, offizielle aktuelle Faktoren oder Originalgrafik übernommen. Die GFN-Methodenwebsite war gesperrt; historische Spiegelungswerte sind kein unabhängiger Audit der nationalen Rechnungen. Der zusätzliche Flächenfall ist als synthetische Übung gekennzeichnet.
