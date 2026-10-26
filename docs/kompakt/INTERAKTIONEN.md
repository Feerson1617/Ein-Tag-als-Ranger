# Interaktionsregister und Beleggrenzen

Die folgenden Verträge stammen direkt aus dem aktiven Register in ecology.js. Das Register wird bei der Ereigniserzeugung gegen die konkrete Ressource geprüft; Herkunft und Aussagegrenze werden mitgesichert. Die Importprüfung kontrolliert Partner, Wirt/Pflanze, Ressource, Mengenänderung, Stadium und erforderliche Ereignisfolge. Eine Paarentdeckung ist kein Interaktionsbeleg.

| Fall | Akteure / Ressource | Fenster / Folge | Zulässige Aussage / Grenze | Quellenstatus |
|---|---|---|---|---|
| fox-mouse (predation) | vulpes_vulpes / apodemus_sylvaticus; wood-mice | dusk; stalk → attempt → caught-or-escaped | Einzelner Jagdversuch; kein Beweis einer Populationsregel | S24 |
| ladybird-aphid (predation) | coccinella_septempunctata / aphidoidea; aphid-colony | summer; search → contact → consume | Blattlaus als Beute dieses Individuums | S53,S54 |
| shell-competition (interspecific-competition) | haematopus_ostralegus / carcinus_maenas; shared-mussels | summer; accessible → remove → reduced-yield | Zugang und Ertrag am begrenzten Pool; Kontrollvergleich erforderlich | S37,S39 |
| same-species-competition (intraspecific-competition) | coccinella_septempunctata / coccinella_septempunctata; aphid-colony | summer; shared-resource → remove → reduced-yield | Begrenzte Beute bei zwei Individuen, kein Revierkampf | S53 |
| tick-deer (parasitism) | ixodes_ricinus / capreolus_capreolus; deer-host | summer; attached → feeding | Adulte Zecke am konkreten Wirt; relative Kosten nur Ergänzungsmodell | S22 |
| root-fungus (symbiosis) | fagus_sylvatica / ectomycorrhiza; root-exchange | summer; carbon-to-fungus → mineral-to-root | Bereitgestelltes Wurzelschnittmodell, keine Fernglassichtung | S32 |
| bee-clover (pollination) | bombus_lapidarius / trifolium_pratense; clover-pollen | summer; anther-contact → pollen-carried → stigma-contact | Pollentransport; weder Befruchtung noch Samenbildung garantiert | S17,S51,S52 |
| deer-browse (herbivory) | capreolus_capreolus / rubus_fruticosus; browse-shoot | summer; bite → shoot-reduced | Materialverändernder Verbiss, keine bloße Kopfbewegung | S23 |
| caterpillar-nettle (herbivory) | aglais_io / urtica_dioica; nettle-leaf | summer; bite → leaf-reduced | Raupenfraß; Falter und Raupe gehören zu einem Taxon | S20 |
| worm-litter (detritus) | lumbricidae / saprotrophs; leaf-litter | summer; grip → pull → mixed-litter | Streueinzug; vollständige Mineralisierung ist ein anderer Prozess | S55 |
| fungus-wood (decomposition) | fomes_fomentarius / saprotrophs; dead-wood | summer; wood → fungal-growth → carbon-release | Langzeit-Schnittmodell; Zunderschwamm ist kein Mykorrhizapartner | S30,S31 |
| jay-acorn (zoochory) | garrulus_glandarius / quercus_robur; acorns | autumn; pick → carry → cache | Transport/Verstecken; kein garantierter Keimungserfolg | S25,S26 |
| shore-feeding (niche) | platalea_leucorodia / recurvirostra_avosetta / tringa_totanus / haematopus_ostralegus; size-specific-prey | summer; depth-access → technique → prey-size | Mehrere Nischendimensionen; keine Erklärung allein durch Schnabelform | S33-S40 |
| communication (communication-model) | parus_major / parus_major; signal | spring; signal → receiver-orients | Gestaltete Sender-/Empfängerfolge; keine unabhängige Naturvalidierung oder Absichtsdeutung | S27; didactic response sequence |

Direkte Weltvorgänge: Jagdversuch (erfolgreich/erfolglos), Blattlausprädation, Fraßspuren, Pollentransport, Streueinzug, Muschelentnahme, passende Küstenvogelbeute und herbstliches Eichelverstecken. Ressourcen werden endlich geführt, Beute wird entfernt. Auswahl und Grafikprofil erzeugen keine neuen Individuen.

Gesonderte Ergänzungen: Mykorrhiza/Wurzeltausch, Pilz-/mikrobieller Langzeitabbau, Kohlenstoff- und Stickstoffmodelle sind gekennzeichnete Schnitt-/Datenmodelle. Diese Stoffprozesse werden nicht als unmittelbar beobachtbare Fernglasereignisse ausgegeben. Die sechs funktionalen Gruppen sind offen benannte Ressourcen/Prozesse, keine zusätzlichen Sammelarten.

Konkurrenz: K2 vergleicht zwei explizite synthetische Läufe ohne/mit Mitnutzer bei identischem Seed, Startpool, Tide und Szenenkontext. Diese Kontrollläufe ändern den realen Weltpool nicht und sind keine Quest-Respawns. Sie prüfen die Modellregel, keine Naturdichte oder unabhängige Naturvalidierung.

Umstellung: M1 → K1 (Merkmale und methodengleiche Mikrohabitate), M2 → K2 (kuratierte Beziehungen statt Wiesen-/Hasenpfad), M3 → K3 (eigene Probenstelle, gleiches Muschel-Individuum / worldVersion / initialSeed / runId / Fenster / Stelle / Tiefe / getrennte Zeitintervalle). Alte Weltmodule und 168er-Katalog werden im Kompaktgraphen nicht geladen. Original-IDs und Antworten bleiben in historischen Archiven erhalten.

Numerische Entwurfswerte, Einheiten und Geometrieausmaße: MODELLPARAMETER.json. Die angegebenen Fachreferenzen stammen aus den übergebenen Matrizen; sie kalibrieren nicht die lokalen Raten.
