# Ökologische Recherche und Katalogvertrag

Stand: 8. Oktober 2026. Diese Notizen dokumentieren den Artenkatalog und seinen Datenvertrag. Alle Katalogtexte sind neu formulierte Zusammenfassungen; es werden keine fremden Tierbilder oder Tiermodelle ausgeliefert.

## Umfang

Der importierbare ES-Modulkatalog exportiert `ANIMALS`, `PLANTS` und `HABITATS`: 118 Tierarten, darunter 64 Vogelarten, sowie 49 Pflanzen-/Pilzarten. Die acht Räume sind Wald, Wiese, Dorf/Stadt, See, Strand, Salzwiese, Wattenmeer und Acker/Feldsaum. Der Salzwiese sind 40 Vogelarten zugeordnet. Die Zahlen sind Arten im Referenzkatalog und **keine** Populationen oder gleichzeitigen Sichtungen. 32 ortsbezogene Katalogtafeln (44 aktuell aufgestellte Tafeln mit zusätzlichen Feldstationen, Schicht- und Teichtafeln) verknüpfen eine Beobachtungsfrage mit einem LK-Konzept.

| Habitat | Tiere | Pflanzen/Pilze | Katalogtafeln |
|---|---:|---:|---:|
| forest | 39 | 25 | 5 |
| meadow | 30 | 13 | 4 |
| city | 42 | 16 | 4 |
| lake | 23 | 7 | 4 |
| beach | 59 | 6 | 4 |
| wadden | 59 | 6 | 4 |
| farmland | 28 | 16 | 3 |
| saltmarsh | 53 | 12 | 4 |

## Renderer und Simulation

- `size` bezeichnet eine ungefähre erwachsene Körperlänge in Metern, bei Säugern einschließlich Schwanz; Krabben und Schalen verwenden ihre charakteristische größte Ausdehnung. Bei Pflanzen ist es Wuchshöhe beziehungsweise die typische Ausdehnung des sichtbaren Sprosses. Keine Vogelspannweite in `size`; das Tagpfauenauge hat ca. 2,5 cm Körperlänge. Kleine Tiere bleiben klein und benötigen Fernglas/Lupe statt übergroßer Freilandmodelle.
- Zusätzliche Formen sind `frog`, `newt`, `dragonfly`, `beetle` und `shrimp`, zusätzlich zum Grundschema. Amphibien haben `type:'amphibian'`. Bei Nordseegarnele und Strandfloh gruppiert `type:'crab'` die Krebstiere; die Form `shrimp` beschreibt den länglichen Körper und darf nicht als rundlicher Taschenkrebs dargestellt werden.
- `prey` ist die konkrete Artenbeziehung und hat für sichtbare Jagd Vorrang vor der groben Ressourcenklasse. Die aktive Fassung enthält `rodents`: Fuchs, Bussard, Waldkauz und Turmfalke nutzen diese Klasse und besitzen explizite Mäuse in `prey`. Frei formulierter `diet` und `trophic` sind die fachlichen Aussagen.
- Alle Tiere besitzen Tageszeit, Habitat, Zone, Bestimmungsmerkmale, beobachtbares Verhalten und Quellenlink. Der Katalog enthält Rollen, **keine** fertigen Verhaltenszustandsmaschinen. Verhaltenseinträge sollten erst nach einer tatsächlich sichtbaren Aktivität freigeschaltet werden; der Arteintrag nach einer ausreichend langen Beobachtung desselben Tieres.
- `PLANTS` enthält aus praktischen Gründen auch einen Pilz, kennzeichnet ihn aber mit `kingdom:'Fungi'`. Im Lexikon als Pilz einordnen. Ein Zunderschwamm ist weder Pflanze noch Moos. Pflanzen brauchen unterschiedliche Blatt-/Kronen-/Blütenformen; eine zufällig benannte identische Baumform erfüllt Artbestimmung nicht.
- Tafeln liegen in lokalen Koordinaten innerhalb etwa +/- 50 m. `feature` ist ein Vorschlag zur passenden Platzierung: `canopy`, `log`, `pond`, `flowers`, `hedge`, `house`, `strandline`, `channel`, `saltmarsh` usw. Die zentrale Spazierroute/Versetzung der Weltzentren liegt beim Hauptauftrag. Tafeln sind keine Experimentmenüs.
- Wald enthält Grasfrosch, Teichmolch, Blaugrüne Mosaikjungfer, Dreistachligen Stichling sowie passende Wasservögel und Ufer-/Wasserpflanzen. Diese Arten gehören an unterschiedliche Teiche/Teichränder, nicht überall in den Wald. Mindestens ein Teich sollte fischarm oder fischfrei bleiben; Grasfrosch und Molch benötigen zusätzlich passende Landlebensräume.

## Fachliche Entscheidungen

- Rotfüchse jagen häufig Kleinsäuger. Gesunde adulte Feldhasen sind keine ebenso leicht erreichbare Standardbeute. Keine ausschließlich aus Fuchs und Hase bestehende angeblich realistische Lotka-Volterra-Welt.
- Stockenten, Eiderenten, Eichhörnchen und Feldlerchen erhalten keine starre einheitliche Trophiestufenzahl: Nahrung und Entwicklungsstadium ändern ihre Stellung im Netz. Beim Tagpfauenauge unterscheiden sich Raupe und Falter; beim Frosch Kaulquappe und adultes Tier.
- Stoffe kreisen; Energie wird gerichtet übertragen und als Wärme abgegeben. Totholz und Spülsaum besitzen ein eigenes Detritusnetz. Wattwurm gewinnt Energie aus organischen Bestandteilen, nicht aus Sand.
- Lichtgradient und Waldstockwerke werden mit Bestandsstruktur verbunden. Geschlossene Buchenkrone und flächendeckend hohe, lichthungrige Wiese sind am selben Ort widersprüchlich. Dichter Waldboden darf aus Laub, Moos, Farnen und schattentoleranten Kräutern bestehen; Blühwiesen an Lichtungen/Säumen.
- Limnologische Schichten sind zweierlei: horizontale Uferzonierung und vertikale temperaturabhängige Schichtung. Epilimnion, Metalimnion und Hypolimnion treffen besonders auf ausreichend tiefe geschichtete Seen zu; flache Waldteiche sind oft durchmischt. Sauerstoffmangel wird mit Abbau organischer Substanz erklärt, nicht mit einer automatisch sauerstofflosen Tiefenzone.
- Wattvögel nutzen verschiedene Schnäbel, Suchtechniken und Substrattiefen; Nischen sind nicht vollständig überschneidungsfrei. Süßwasserfische und marine Aufwuchsgebiete sind getrennt. Robben brauchen Ruheplätze und dürfen den Spaziergänger nicht ständig aktiv verfolgen.
- Straßen/Hecken sind artspezifisch wirkende Barrieren oder Korridore. Mutation ist nicht zielgerichtet; Selektion verändert Fortpflanzungserfolg und langfristig Allelhäufigkeiten. Die Tafeltexte beschreiben zuerst beobachtbare Ökologie. Evolution ist ein späteres, nachgeordnetes Experiment mit Generationen, nicht eine sofortige Verwandlung beim Schalterdruck.

## Saison und Modellgrenzen

Habitatangaben sind grundsätzliche Eignung einschließlich Rändern, Parks, Rast und Nahrungssuche; keine Behauptung, dass jede Art dort ganzjährig vorkommt. Mauersegler/Rauchschwalben sind sommerliche Gäste, mehrere Küstenlimikolen vor allem Zug- oder Wintergäste. Eine gleichzeitige Darstellung ist eine didaktische Artenwelt und braucht eine sichtbare Saisonkonvention, bevor als exakter aktueller Bestand erzählt wird. Nachtaktive Tiere sollten am Tag ruhen und bei Dämmerung tätig werden. Individuen, Alter, Geschlecht, Wetter und Jahreszeit fehlen noch als Varianten.

Ein bestätigter Katalog und erkennbare Modelle sind getrennte Anforderungen. Namen über generischen Tierkörpern reichen nicht für Fotorealismus oder gesicherte Feldbestimmung. Quellen dienen der fachlichen Überprüfung; daraus ergeben sich keine Nutzungsrechte für Fotos oder 3D-Assets.

## Primärquellen

Jeder Eintrag besitzt einen Quellenverweis. Mehrere Ergänzungen verwenden noch allgemeine Behörden- oder Projektseiten; nicht jeder neu ergänzte Direktlink wurde abschließend einzeln verifiziert. Grundlage waren Naturschutzverbände mit eigenen Artenporträts, Fachbehörden/Forschungseinrichtungen und floristische Fachportale. Die wichtigsten Prüfpfade:

- [NABU Vogelporträts](https://www.nabu.de/tiere-und-pflanzen/voegel/portraets/): 35 direkte Porträts von Kohlmeise bis Brandgans; [Mauersegler im NABU Vogeltrainer](https://vogeltrainer.nabu.de/vogel/mauersegler/). Die einzelnen Arten besitzen eigene Porträt-URLs im Katalog.
- [NABU Insektentrainer](https://insektentrainer.nabu.de/): Steinhummel, Tagpfauenauge, Siebenpunkt und Blaugrüne Mosaikjungfer, mit direkten Eintragslinks.
- [Deutsche Wildtier Stiftung: Fuchs](https://www.deutschewildtierstiftung.de/wildtiere/fuchs), [Feldhase](https://www.deutschewildtierstiftung.de/wildtiere/feldhase), [Reh](https://www.deutschewildtierstiftung.de/wildtiere/reh), [Feldmaus](https://www.deutschewildtierstiftung.de/wildtiere/feldmaus), [Igel](https://www.deutschewildtierstiftung.de/wildtiere/igel); [NABU Kiel: Eichhörnchen](https://www.nabu-kiel.de/natur-landschaft/kieler-w%C3%A4lder/eichh%C3%B6rnchen/); [info fauna: Waldmaus](https://www.infofauna.ch/de/node/2713) mit Originalbeobachtung und Nahrung-/Habitatangaben.
- [NABU Hamburg: Amphibien vor Ort](https://hamburg.nabu.de/imperia/md/content/hamburg/geschaeftsstelle/16.pdf) und [NABU Brandenburg: Teichmolch](https://brandenburg.nabu.de/imperia/md/content/brandenburg2/20230925_teichmolch_ansicht.pdf).
- [Bayerische Landesanstalt für Landwirtschaft: Rotauge](https://www.lfl.bayern.de/mam/cms07/ifi/dateien/dbl_rotauge__pl%C3%B6tze.pdf), [LFV Bayern Fischlexikon](https://www.lfvbayern.de/fischlexikon), [IGB: Europäischer Hecht](https://www.igb-berlin.de/europaeischer-hecht). Artmerkmale sind überregional; die regionale Gewässersituation bleibt standortabhängig.
- [Nationalpark Wattenmeer: Lebensraum Watt](https://www.nationalpark-wattenmeer.de/wp-content/uploads/2022/11/FB_Lebensraum-Watt-web.pdf), [Small Five](https://www.nationalpark-wattenmeer.de/sh/naturerlebnisraum-spo/small-five/), [Wattschnecke](https://www.nationalpark-wattenmeer.de/wissensbeitrag/wattschnecke/), [Kegelrobben](https://www.nationalpark-wattenmeer.de/wissensbeitrag/kegelrobben/), [Seegraswiese](https://www.nationalpark-wattenmeer.de/wissensbeitrag/lebensraum-seegraswiese/), [Pflanzen und Salz](https://www.nationalpark-wattenmeer.de/wissensbeitrag/pflanzen-und-salz/).
- [Schutzstation Wattenmeer: Nordseegarnele](https://www.schutzstation-wattenmeer.de/wissen/tiere/krebstiere/nordseegarnele/); [BeachExplorer der Schutzstation: Strandfloh](https://www.beachexplorer.org/arten/talitrus-saltator/steckbrief).
- [FloraWeb des Bundesamtes für Naturschutz](https://www.floraweb.de/): direkte Artseiten für die meisten Pflanzen, einschließlich Binomen und nördlichen Standortmerkmalen. Queller und Hundsrose gehören zu taxonomisch anspruchsvollen Artgruppen; der Katalog nennt ausdrücklich den dargestellten Modelltyp und behauptet keine Bestimmung bis zur Kleinart allein aus der Spielform.
- [Waldwissen: Stiel- und Traubeneiche](https://www.waldwissen.net/de/lebensraum-wald/baeume-und-waldpflanzen/laubbaeume/traubeneiche-und-stieleiche-im-portrait), [Waldkiefer](https://www.waldwissen.net/de/lebensraum-wald/baeume-und-waldpflanzen/nadelbaeume/die-waldkiefer), [Krautschicht in Buchenmischwäldern](https://www.waldwissen.net/de/lebensraum-wald/baeume-und-waldpflanzen/krautschicht-in-buchenmischwaeldern), [BfN Totholz](https://www.bfn.de/daten-und-fakten/totholzmengen-im-wald).
- [Consortium of Bryophyte Herbaria: Polytrichum commune](https://bryophyteportal.org/portal/taxa/index.php?taxon=160442), mit Flora-of-North-America-Beschreibung und europäischer Verbreitung; [DGfM: Zunderschwamm](https://www.dgfm-ev.de/de/ueber-uns/news/pilz-des-jahres-1995-zunderschwamm).
- [Umweltbundesamt: Seen und Schichtung](https://www.umweltbundesamt.de/system/files/medien/publikation/long/3256.pdf), [NABU Agrarökologie: Brachen und Blühstreifen](https://blogs.nabu.de/naturschaetze-retten/nabu-agrar-blog-brachen-vs-bluehstreifen/).

## Prüfung

Version 0.3 ergänzt nachgeprüfte Aufträge: [NABU Steinhummel](https://insektentrainer.nabu.de/insekt/steinhummel/), [Waldwissen: Eichelhäher und Eichenverbreitung](https://www.waldwissen.net/de/lebensraum-wald/tiere-im-wald/voegel/markwart-der-vorlaute-eichenpflanzer) und [OpenStax: Populationsgenetik](https://openstax.org/books/biology-2e/pages/19-2-population-genetics). Die neue Feldmausgenetik mit zwei Genorten ist eine hypothetische Lehrsimulation. Eltern, Geschlechter und Nachkommen sind dort modelliert; für den allgemeinen Artenbestand bleiben vollständige Lebenszyklen und Varianten offen.

Ergänzung am 8. Oktober: Der aktive Katalog verwendet für Fuchs, Mäusebussard, Turmfalke und Waldkauz die Ressourcenklasse `rodents` statt der früheren Sammelklasse. Die konkreten Beute-IDs bleiben maßgeblich für Jagdereignisse. Dorf/Stadt enthält nach Ergänzung des Dorfgewässers 16 Pflanzen-/Pilzarten.

Importprüfung: alle Habitat-Verweise und expliziten Beute-IDs aufgelöst; alle Räume über dem Minimum von zehn Tierarten. Syntax und Pflichtfelder separat überprüft. Keine Datenbank-/API-Abfrage beim Spielstart erforderlich; die Quellen sind nur beim Nachlesen externe Links.

## Ergänzung Version 0.5: Küste und Evolutionsvergleich
Die Salzwiese wird nach Höhenlage und Überflutungshäufigkeit gegliedert. Vogelschnäbel, Beinlängen, Nahrung und Rast unterscheiden die Nischen; saisonale Zug- und Wintergäste sind als didaktische Saisonmischung enthalten. Pflanzenbestimmung nutzt die Lupe, Tiere das Fernglas. Der feste Bodenprobenbestand umfasst zehn typische Muschel-, Schnecken- und Wurmarten; Einbautiefen sind Lehrannahmen, keine Standortprognose. Eine sichtbare Schale allein ist kein lebendes Tier.

Zusätzlich recherchierte fachliche Grundlagen:
- [Nationalpark Wattenmeer: Watt als Nahrungsquelle](https://www.nationalpark-wattenmeer.de/wissensbeitrag/watt-als-nahrungsquelle/).
- [Bedeutung von Salzwiesen](https://www.nationalpark-wattenmeer.de/wissensbeitrag/bedeutung-von-salzwiesen/) und [Salzregulation](https://www.nationalpark-wattenmeer.de/sh/naturerlebnisraum-spo/salzregulation/).
- [Vogelkarussell im Takt der Tide](https://www.nationalpark-wattenmeer.de/wissensbeitrag/vogelkarussell/).
- [Muscheln und Schnecken](https://www.nationalpark-wattenmeer.de/mediathek/muscheln-und-schnecken/) und [Atlas des Nationalparks Hamburgisches Wattenmeer](https://www.nationalpark-wattenmeer.de/wp-content/uploads/2009/06/nphw-atlas.pdf).
- [Handbuch für Natur- und Landschaftsführende im Wattenmeer](https://www.nationalpark-wattenmeer.de/wp-content/uploads/2024/08/ZNL-Handbuch_Wattenmeer.pdf).
- [BeachExplorer: Orchestia gammarellus](https://www.beachexplorer.org/arten/orchestia-gammarellus/steckbrief).

21 regionale genetische Modellversuche verwenden verschiedene Kleinsäugerarten. Die dargestellte Zwei-Locus-Merkmalsgenetik bleibt hypothetisch; tatsächliche Vererbung im Modell ist kein Beleg für dieselbe Genetik der realen Art. Weitere Prüfung: präzise Quellen je ergänztem Kleinsäuger/Pflanze, Linkaudit und aktuelle Taxonomie/Synonyme. Der CSV-Katalog enthält 164 Arten. Fotorealismus und morphologische Bestimmbarkeit müssen unabhängig vom fachlichen Katalog beurteilt werden.

Die Kopfschildschnecke Retusa obtusa erhält eine konkrete Räuber-Beute-Beziehung zu Peringia ulvae, keinen pauschalen Detritus- oder Filtrationsnachweis. Grundlage: [MarLIN / Marine Biological Association: muddy sand shores](https://www.marlin.ac.uk/habitats/detail/21/polychaete_bivalve_dominated_muddy_sand_shores) und [Schutzstation Wattenmeer / BeachExplorer: Retusa obtusa](https://www.beachexplorer.org/en/species/retusa-obtusa/description). Die Schale wird tonnenförmig mit niedriger Spitze dargestellt. Freigelegte Probentiere starten ohne erfundene Fraßtätigkeit und wählen anschließend Verhalten nach Art/Nahrung.


8. Oktober, v0.6: Fachbegriffe und Einordnung des Questbuchs mit OpenStax Biology 2e, Community Ecology und Population Genetics abgeglichen. https://openstax.org/books/biology-2e/pages/45-6-community-ecology und https://openstax.org/books/biology-2e/pages/19-2-population-genetics. Filtration als Ernährungsweise, ökologische Nische als Konzept; Bestäubung nicht pauschal mit dauerhafter Symbiose gleichgesetzt; Zoochorie nicht automatisch ein erfolgreicher Mutualismusnachweis.

## Ektoparasitismus für die Ranger-Szenarien (0.8)
- Gemeiner Holzbock, Ixodes ricinus: Adulte an größeren Wirten einschließlich Rehen; achtbeinige Milbe. [ECDC-Factsheet](https://www.ecdc.europa.eu/en/disease-vectors/facts/tick-factsheets/ixodes-ricinus).
- Argulus foliaceus: Rotauge als untersuchter Fischwirt, Wirtsnutzung abhängig vom Entwicklungsstadium. Walker et al. 2008, DOI 10.14411/fp.2008.019, [Originalstudie](https://pubmed.ncbi.nlm.nih.gov/18666418/).
- Lepeophtheirus pectoralis: ektoparasitischer Ruderfußkrebs von Plattfischen, adulte Phase vereinfacht. [Boxshall 1974, Originalstudie](https://doi.org/10.1017/S0031182000063058); Scholle/Haftorte außerdem [Untersuchung zur Parasitenfauna von Pleuronectes platessa](https://sapientia.ualg.pt/server/api/core/bitstreams/447ddee8-d4ce-4734-a7bf-087966425733/content).
- Karpfenlaus und Seelaus sind Krebstiere, keine Insektenläuse. Die Detailgeometrie erleichtert das Auffinden, ersetzt keine mikroskopische Diagnose. Nahrungsaufnahme/Wirtkosten sind Modellwerte, keine empirische Kalibrierung.


## Artspezifische Verhaltensfolgen in 0.11
Die Lernbegegnungen verwenden kontinuierliche Bewegung und Ressourcenbesuche statt allein einer Tätigkeitsbezeichnung. Jagdversuche in den reservierten Gruppen scheitern bewusst, damit dieselben Individuen wiederholt beobachtet werden können. Natürliche Prädation außerhalb der Lerngruppen kann tödlich sein. Flugradien, Geschwindigkeiten und zeitliche Wiederholung sind gestalterische Lehrparameter; daraus folgt keine empirisch gemessene Flugphysik oder Fangquote.

- [NABU: Turmfalke](https://www.nabu.de/tiere-und-pflanzen/voegel/portraets/turmfalke/) und [NABU Dortmund: Der gefährdete Mäusejäger](https://www.nabu-dortmund.de/aktuelles/artikel/der-gefaehrdete-maeusejaeger): offene Jagdflächen, Rüttelflug, Absuchen und Stoß zur kleinen Bodenbeute. Im Szenario bleibt der Falke in der Luft und beginnt jeden neuen Suchgang durch Aufsteigen und Kreisen.
- [IGB: Europäischer Hecht](https://www.igb-berlin.de/europaeischer-hecht): Lauerjäger, kurze Beschleunigung zur tatsächlichen Beute; Rotaugen reagieren durch Ausweichen. Alle Fische werden an die tatsächlich dargestellte Wasserfläche gebunden.
- [NABU: Blaumeise](https://vogeltrainer.nabu.de/vogel/blaumeise-gartenedition/): Suche nach Wirbellosen an Gehölzen. Waldkonkurrenz nutzt tatsächliche Äste und einen gemeinsamen begrenzten Lehrvorrat; andere Konkurrenten teilen passende pflanzliche oder tierische Nahrung.
- [NABU: Ackerhummel](https://insektentrainer.nabu.de/insekt/ackerhummel/): Pollen-/Nektarnutzung als allgemeiner fachlicher Hintergrund. Die konkreten Hummelarten behalten ihre eigenen Katalogprofile. Bestäubung braucht den Besuch zweier tatsächlicher Pflanzen derselben Art; Anflugziele entsprechen den sichtbaren Blüten der Geometrie.
- [NABU: Eichelhäher](https://www.nabu.de/tiere-und-pflanzen/voegel/portraets/eichelhaeher/) und [Bayerische Waldbauernschule](https://waldbauernschule.bayern.de/343829/index.php): Aufnahme, sichtbarer Transport und räumlich getrenntes Versteck von Eicheln. Verstecken ist noch kein Nachweis erfolgreicher Keimung.
- [Nationalpark Wattenmeer: Rotschenkel](https://www.nationalpark-wattenmeer.de/wissensbeitrag/rotschenkel-april/) und [Vogelkarussell](https://www.nationalpark-wattenmeer.de/wissensbeitrag/vogelkarussell/): Nahrungssuche am trockenfallenden Grund und Hochwasserrast. Modellvögel wechseln durch echten Flug zu einer über der Flut liegenden Raststelle und kehren bei Ebbe zurück.
- [Schutzstation Wattenmeer: Muscheln](https://www.stiftung-schutzstation-wattenmeer.de/fileadmin/schutzstation/dokumente/Zeitschrift_wattenmeer/wattenmeer2018-4_Muscheln.pdf): Hintergrund zu Muscheln und ihren Feinden. Krabben bearbeiten stationäre Beute; Muscheln und vergrabene Würmer fliehen im Modell nicht wie Mäuse.

Der vereinfachte Paarauftrag ist ein Suchauftrag: beide tatsächlichen Partner fokussieren und danach gemeinsam im Bild sehen. Diese Spielbedingung ist kein ausreichender biologischer Nachweis für Konkurrenz, Mutualismus oder evolutionäre Veränderung. Fachliche Erklärung und Verhaltensdokumentation bleiben getrennt zugänglich.



## Dorf, Honigbienen und Robben in 0.12
- [Deutscher Imkerbund: Damit aus Blüten Früchte werden](https://deutscherimkerbund.de/damit-aus-blueten-fruechte-werden/) – Honigbienen sammeln Blütennahrung und übertragen Pollen. Bestäubung ist von Befruchtung und erfolgreicher Samenbildung zu unterscheiden.
- [Deutscher Imkerbund: Honigbiene, Stationenlernen](https://deutscherimkerbund.de/userfiles/Kinder_Jugendseite/Bienen_Extras/Honigbiene_Stationen_lernen_Web.pdf) – Sammeln, Rückkehr zum Stock und Arbeitsteilung. Acht sichtbare Arbeiter sind eine Darstellungsstichprobe; Mengen und Zeiten sind nicht empirisch kalibriert, vollständiges Volk und Tänze werden nicht simuliert.
- [Nationalpark Wattenmeer: Seehund](https://www.nationalpark-wattenmeer.de/wissensbeitrag/seehund/) – Meeressäuger mit Ruheplätzen auf trockenfallenden Bänken. Körperform, Flossen und Körperabstände verbessern die Darstellung, ersetzen keine aufgezeichnete Biomechanik.

Aktueller CSV-Katalog: 168 Arten (119 Tiere, 49 Pflanzen/Pilze). Die Frühe Margerite kommt in den angelegten Dorfblütenflächen als Gartenpflanze vor. Artbeschreibungen, Ressourcen und tatsächliche Sichtungen bleiben von Szenariomarkierungen getrennt.


## Lebendige Mikrohabitate und Artstimmen · Fassung 0.13
- Kormoran: LANUV / Naturschutzinformationen NRW, Artbeschreibung einschließlich Flügeltrocknung an Rastplätzen: https://ffh-arten.naturschutzinformationen.nrw.de/ffh-arten/de/arten/vogelarten/kurzbeschreibung/103027
- Eichhörnchen, Kobel und Baumhöhlen: Deutsche Wildtier Stiftung, https://www.deutschewildtierstiftung.de/wildtiere/eichhoernchen; NABU naturgucker, https://nabu-naturgucker.de/meldeportal/naturbeobachtungen-melden/nester-und-misteln/
- Echte Tonaufnahmen und Lizenzen: Quelldateiseiten von Oona Räisänen (Mysid) und Sonothèque ADVL; genaue Zuordnung in `dist/assets/BIRD-RECORDINGS.txt`.
- Modellgrenze: Rastdauer, Klettertempo und Tauchzyklen sind Lehr- und Gestaltungseinstellungen, keine gemessenen Verhaltensdaten. Astloch und Kobel bleiben unterschiedliche Strukturen; Kormoran-Trocknungshaltung zählt als Verhalten, nicht als Prädationsbeweis.
