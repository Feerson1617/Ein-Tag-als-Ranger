# Ein Tag als Ranger / Feldbuch – 1.0.0-rc.1

Releasekandidat für die technische Prüfung und einen begrenzten Unterrichtspilot.
Die bisherigen Versionsabschnitte unten sind historische Nachweise aus 0.20 und
älteren Ständen; sie sind keine aktuelle Tablet- oder Unterrichtsabnahme.

Zwei Einstiege: **Freie Erkundung** und **Lernmissionen**. Die drei Missionen
bearbeiten Artenliste/Bestimmung, gemeinsame Ressourcennutzung und Gezeiten.
Paarfund, merkmalsbezogene Bestimmung, dokumentierter Vorgang und fachliche
Einordnung sind getrennt. Die freie Erkundung, alle 168 Taxoneinträge und die
vorhandenen Begegnungs-/Evolutionsangebote bleiben erhalten. 15 Fokustaxa bieten
zugängliche Referenzen; Unsicherheit und passende Gruppenbestimmung sind erlaubt.

Das bestehende Feldbuch besitzt versionierten JSON-Import/Export, einen lesbaren
Druckbericht, sichtbare Speicherfehler und einen bewussten Sitzungswechsel. Alte
Exporte und Gerätespeicherstände werden übernommen; beschädigte gespeicherte
Daten werden nicht ungefragt überschrieben. Kein Konto, Spielserver, Datenbank
oder KI-Bewertung erforderlich. Keine Käufe/Providerjobs und keine neue Engine.

Entwicklung: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).
Aktuelle Nachweise und offene Punkte: [docs/REVIEW-STATUS.md](docs/REVIEW-STATUS.md).
Unterrichtsvorschläge: [docs/LEHRKRAEFTE.md](docs/LEHRKRAEFTE.md).
Veröffentlichung ausschließlich nach ausdrücklicher Freigabe:
[docs/CI-UND-RELEASE.md](docs/CI-UND-RELEASE.md).

## Historischer Stand vor dieser Weiterentwicklung

# Feldbuch – eine ökologische Expedition
Stand: 9. Oktober 2026, Version 0.20.

Eine begehbare Lernlandschaft für Klasse 12, Biologie-Leistungskurs. Als neuer Nationalparkranger lernst du ein fiktives norddeutsches Revier kennen: Wald mit zwei Teichen, Wiese, Acker, Dorf/Stadt, Salzwiese, Watt, Strand und See. Der Katalog umfasst 119 Tierarten, darunter 64 Vogelarten, sowie 49 Pflanzen-/Pilzarten. Der Salzwiese sind 40 Vogelarten zugeordnet; das sind Katalogarten, keine gleichzeitig sichtbare Population.

## Neu in 0.20
Sechs lokal in Blender erstellte GLB-Modelle ersetzen die bisherigen Grundformen von Rotfuchs, Feldhase, Reh, Eichhörnchen, Seehund und Kegelrobbe. Körper und Kopf bilden zusammenhängende Oberflächen; gewichtete Halsübergänge halten Kopfbewegungen am Körper. Beine behalten den vorhandenen Laufshader mit Fußkontakten. Die Robbenmodelle sind so korrigiert, dass ihre Flossen den Bauch nicht vom Boden heben. Schwungfedern der 64 Vogelarten sind nun schmale, gewölbte Flächen mit körperlicher Dicke; Farben und spiegelgleiche Flügel bleiben erhalten.

Die sechs Modelle teilen weiterhin Geometrie und GPU-Animation je Art. Kein zusätzlicher Animationsmischer pro Individuum; höchstens 16 Vertexattribute auch mit individuellen Farben. Tieridentität, Quests, Fernglasfaktor 0,5 und vorhandene Sichtbarkeitsoptimierung bleiben erhalten. Je Modell weniger als 10.000 Dreiecke. Diese lokal modellierten Formen sind keine Scans und noch nicht fotorealistisch.

Game Development Studio 1.5.0 und Blender 4.5.14 LTS wurden tatsächlich verwendet. Sechs kanonische Assetpakete mit Lizenz CC0-1.0, Dateiprüfsummen, Validierung und Vendoring-Nachweisen sind im Projekt enthalten. Zwei Robbenpakete haben die korrigierte Assetversion 0.20.2; die Spielversion ist 0.20. Keine bezahlten Jobs, Käufe, Abonnements oder Kontoerstellungen. Der Nutzer untersagt ausdrücklich Konten bei kostenpflichtigen Anbietern.

21 bisherige Prüfreihen und eine zusätzliche GLB-/Rig-Prüfung bestehen. Die ausgelieferte Einzel-HTML und das Pages-Paket enthalten dieselben sechs Modelle. Browserprüfung der tatsächlichen Shader, Szenariowahl, ausgewählten Questmarkierungen und Fernglasverlangsamung; lokale Stichproben erreichen etwa 30 FPS. Keine allgemeine oder physische Tablet-Garantie, kein gemessener Vergleich als Nachweis einer FPS-Steigerung. Prüfdetails stehen in PRUEFUNG.md / verification.

## Neu in 0.19
Die Vogelrümpfe bestehen aus einer zusammenhängenden, symmetrisch gefärbten Oberfläche. Brust, Rücken und Bauch gehen ohne die bisherigen überlappenden Körperkugeln ineinander über. Die Köpfe sind feiner aufgelöst; artspezifische Merkmale bleiben erhalten. Die Modelle sind weiterhin prozedural modelliert, keine fotorealistischen Scans.

Ruhende Vögel und Säugetiere bewegen Kopf, Ohren und Körper dezent. Der individuelle Simulationszeitgeber hält diese Bewegungen beim Lesen an und verlangsamt sie im Fernglas auf die Hälfte. Gangzyklen bleiben an zurückgelegte Strecke und echte Bodenkontakte gekoppelt; ruhende Füße laufen nicht weiter.

Sichtbare Vegetationsinstanzen behalten ihre Daten, solange dieselben Modelle an denselben Ausgabeplätzen stehen. Sichtbarkeit, Farbe, Dichte und Detailstufe ändern sich durch diese Optimierung nicht. Ein deterministischer Vergleich über 252 Ansichten/Übergänge bestätigt identische Ergebnisse und 83,3 % weniger Matrixübertragung in diesem Testablauf. Das ist kein Nachweis einer entsprechenden FPS-Steigerung auf Tablets.

Steuerung und Zeigerfang werden beim Lesen, Tabwechsel und Grafikverlust zurückgesetzt. Steuerkreis und Kamera-Pinch verwenden getrennte Berührungen. Nach einem vorübergehenden WebGL-Kontextverlust wird die Aussicht wiederhergestellt; Feldbuch und laufende Welt bleiben erhalten. Im Browser erfolgreich mit aktivem Fernglas geprüft. Unveränderte Schatten werden beim Lesen und auf der Startseite wiederverwendet.

21 Prüfreihen bestanden. Für weitere lokale Kontrolle ist `dist/pruefung.html` enthalten: tatsächliche Tiermodelle und ein expliziter Grafikverlust-Test. Diese Prüfoberfläche gehört nicht zum öffentlichen Pages-Paket. Die neuen Game-Studio-Anleitungen für Three.js, Modellaufbereitung, UI und Spieltests wurden angewandt. Bei diesem älteren Stand waren Blender und die `game-dev`-CLI noch nicht eingerichtet. Sie wurden inzwischen kostenlos installiert und für 0.20 verwendet. Die GitHub-Verbindung wurde lesend geprüft; veröffentlicht wurde noch nichts.

## Neu in 0.18
Zusätzlich zur Einzel-HTML gibt es ein vorbereitetes GitHub-Pages-Paket. Es enthält nur aktive Module und Assets, relative Pfade auch für Repository-Unterverzeichnisse sowie eindeutig benannte Dateien für die Wiederverwendung im Browser. Quellen und Lizenzen bleiben enthalten. Jimdo Creator kann das Spiel als iFrame einbetten, Jimdo Website Builder verlinkt die Spieladresse. Die tatsächliche Veröffentlichung steht noch aus; eine Anleitung liegt in `VEROEFFENTLICHUNG.md` im Projektpaket und in der README des Pages-Pakets.

Acht große Naturmaterialien sind verlustfrei als WebP neu kodiert: 26,918 auf 16,867 MB, bei identischen RGBA-Pixeln. Die Webfassung lädt Artenfotos und Vogelaufnahmen erst bei Nutzung. Auch in der Einzel-HTML werden diese optionalen Medien erst dann aus ihren eingebetteten Daten dekodiert. Beim Start wurden zwölf Materialien, beim ersten Artenfoto dreizehn dekodierte Assets geprüft. Ferne Pflanzenansichten werden nun erst nach geladenen Ausgangstexturen erstellt.

Unter ⚙ und auf der Startseite sind drei Darstellungen wählbar. Automatisch strebt 30 FPS an und steigert die Auflösung bei freier Leistung; unter die bisherige 1,35-fache Darstellung bis zur Geräteauflösung geht es nicht. Hohe Schärfe ergänzt feinere 2048er Schatten. Flüssigere Bewegung strebt bis 60 FPS an und darf für dieses Ziel die Auflösung auf den einfachen Bildschirmmaßstab zurücknehmen. Die Regelung berücksichtigt sichtbare Bildabstände, CPU und, wo verfügbar, nicht blockierende GPU-Messungen. Inhalte und Individuen bleiben unabhängig von der Darstellung. ⛶ öffnet Vollbild; in eingebetteten Ansichten bietet das Darstellungsfenster einen direkten Startlink.

Alle 18 Prüfreihen bestehen. Die Webfassung und Einzel-HTML wurden direkt geprüft, einschließlich einer Einbettung über verschiedene lokale Ursprünge und Vollbild. Desktop-Stichproben zeigen 30 beziehungsweise 60 FPS; keine allgemeine oder physische Tablet-Garantie. Der Hosting-Speicher darf für hochwertigere Modelle künftig wachsen; die aktuelle Paketgröße begrenzt den Detailanspruch nicht.

## Neu in 0.16
Beide Vogelschwingen sind mit korrekt gespiegelter Anatomie, Normalen und Gefiederfarbe dargestellt. Positive Instanztransformationen verhindern die zuvor dunkle linke Schwinge. Schatten und Detailansicht folgen derselben Pose; ein gemeinsamer Flügelkörper ersetzt zwei Instanzen. Alle 64 Vogelarten sind geprüft. Silbermöwen und Weißstörche erhalten ihre jeweiligen hellen und dunklen Federbereiche auf beiden Seiten.

Zwei Waldteiche, kürzere Umwege und ein stärker komprimiertes Offenland verkürzen den Weg um 96.2 auf 734.7 Modellmeter. Der Waldkern bleibt gleich. 36 Tafeln, alle acht Lebensräume und sämtliche regionalen Pflanzenarten bleiben enthalten. Die fünf Dorfgrundstücke behalten ihre bisherigen Abstände und Abmessungen. Die 77,7 m lange Asphaltstraße führt zu einer gebogenen Feldzufahrt und einem offenen Tor; Weg und Straßenflächen überschneiden sich nicht. Seehunde stehen auf der sichtbaren Oberfläche. Vögel meiden Zäune auch beim Sinken und reservieren getrennte Bodenfutterplätze.

Eine geometrisch exakte Wegsuche und wiederverwendete Tier-/Nachbarlisten sparen Rechenarbeit ohne Änderung der Materialien oder Tieridentität. Alle 16 Prüfreihen bestehen. Aktuelle Browserstichproben und Einschränkungen stehen in `PRUEFUNG.md`; eine physische Tabletprüfung bleibt erforderlich. Vogelstimmen bleiben optional und standardmäßig aus.

## Neu in 0.15
Die Startseite ist zurückhaltender gestaltet. Helle Modusfelder und ein abgesetztes Szenariofeld mit 18-Pixel-Schrift machen die Auswahl deutlicher; die Steuerungshilfe ist aufklappbar. Ein Szenario beginnt ohne aktiven Auftrag und ohne Artmarkierungen. Das Questbuch blinkt dezent, bis selbst ein Auftrag gewählt wird. Vor dessen Abschluss stehen dort nur praktische Beobachtungsanweisungen; die fachliche Auswertung einschließlich Modellgrenzen und Quellen wird erst beim abgeschlossenen Auftrag sichtbar. Die bestehenden Paar-Fokusbedingungen bleiben erhalten.

Die Bewohner erhalten zusammenhängende modellierte Köpfe, eingebettete kleine Gesichtszüge und natürlichere Körperproportionen. Maren trägt einen hellen Imkerhut. Gesprächsaktionen prüfen die tatsächlich im gewählten Modus verfügbaren Aufgaben; Marens Bestäubungsbutton führt in der freien Erkundung zu den Bienen ihres Gartens und im Jagdszenario zum dortigen Questbuch. Es entsteht kein Dialogfehler durch einen fehlenden Auftrag.

Der Bodenkontakt folgt jetzt den sichtbaren Geländedreiecken einschließlich des Grundgeländes. Damit verschwindet der Fuchs am Dorfrand nicht mehr in der Differenz zwischen analytischer Höhenfunktion und sichtbarem Boden. Kleine Pfahl-/Reisigzäune markieren die acht Lebensräume. 503 kurze Abschnitte folgen dem Gelände; Bohlenweg und Tafelflächen bleiben mit breiten Durchgängen frei. Wasserbereiche werden ausgespart. Die gleichen gedrehten Zaunflächen wirken auf Spieler und bodengebundene Tiere; durchgehende Bewegungsstrecken werden auf Querungen geprüft.

Ein räumliches Hindernisraster begrenzt Kollisionsprüfungen auf die Umgebung und die gesamte aktuelle Bewegungsstrecke. Ein Vergleich mit vollständiger Hindernissuche ergab in 1216 Fällen identische Entscheidungen. Alle 15 Prüfreihen bestehen. Aktuelle Browserbelege und Desktop-Leistungsstichproben stehen in `PRUEFUNG.md`; dauerhaft 30 FPS auf einem physischen Tablet bleiben zu prüfen.

## Bewahrte Funktionen aus 0.14
Die fotografischen Bewohnerbilder sind durch fünf räumliche Figuren ersetzt. Körper, Gesichter, Haare und Kleidung verwenden wie die Tiere farbige, rau beleuchtete 3D-Flächen. Die Figuren drehen nur ihren Kopf sanft zum nahen Spieler; Körper und Füße stehen fest im Garten. Gespräche, Imkerin und Bienenstock bleiben erhalten. Der alte Fotofreistelleratlas wird im Spiel nicht mehr geladen und in die HTML nicht mehr eingebettet.

Alle fünf Häuser haben geschlossene Giebelkörper und feste Dachplatten mit passender Dachneigung und Überständen. Vollständig gerahmte Fenster ergänzen Rückseiten und Giebel; Regenrinnen und bodenständige Fallrohre machen die Traufen erkennbar. Die zwanzig sichtbaren Gartenzaunabschnitte sind feste Hindernisse mit offenen mittigen Gartentoren. Körpergrößen und durchgehende Bewegungsstrecken werden geprüft; eine schnelle Bewegung kann nicht zwischen zwei geprüften Endpunkten durch einen Zaun springen.

Genau eine 46 m lange, 2,7 m breite Asphaltstraße mit dezenter Körnung und Randsteinen verläuft östlich des Bohlenwegs. Auch Schilf und Wasserpflanzen beachten die reservierten Straßen- und Grundstücksflächen; am Dorfteich wächst keine Vegetation durch die Fahrbahn. Weder der Weg noch seine seitlichen Tafelflächen werden gekreuzt. Die Fahrbahn ist eine dauerhafte Barriere für bodengebundene Tiere; Vögel überqueren sie im Flug. Der Ranger kann sie zu Fuß betreten. Experiment-Schalter heben diese Barriere nicht auf. Der Isolationsauftrag im Dorf prüft die tatsächliche sichtbare Straßenkante; der Genflussauftrag erreicht die andere Seite über eine Verbindung jenseits des Straßenendes. Die längere Wanderung erhält im Dorf 120 statt 75 Modellsekunden je Lehrgeneration. Szenariopaare werden gemeinsam an ausreichend freien Stellen platziert; keine Jagd durch einen Zaun.

Vierzehn Prüfreihen, einschließlich eines eigenen Dorf-/Barrierechecks, und Browserbelege sind im Projektpaket enthalten. Die Einzel-HTML benötigt keine zusätzlichen Spieldateien aus dem Internet.

## Bewahrte Funktionen aus 0.13
Fünf Dorfbewohner stehen jeweils im Vorgarten ihres eigenen Hauses. Maren steht am Bienenstock. Ein mindestens 44 Pixel hoher Gesprächsknopf erscheint über dem Kopf nur bei Nähe und freier Sicht. Begrüßungen und konkrete Beobachtungstipps führen bei Bedarf direkt zu Bestäubung, Questbuch oder Karte.

Zwei eigens platzierte Ruhefelsen im See und im Strandwasser bieten vier getrennte Kormoranplätze. Tatsächliche Kormorane fliegen dorthin, breiten bei der Rast ihre Flügel aus, fliegen zum Wasser zurück und suchen dort lebende passende Fische. Annäherung unterbricht die Rast. Körperabstände gelten auch beim Tauchen. Sieben Kobel und zugehörige Astlöcher liegen an vorhandenen Bäumen im Wald und Dorf. Eichhörnchen klettern am tatsächlichen Stamm hoch, ruhen im Kobel und kehren über Stamm und Boden zurück. Beobachtungs-Szenarien behalten ihre jeweiligen Interaktionsfolgen. Kormorane erhalten dunkle gefaltete Flügel, schlankere Körper, längere Schwänze, Kehlenzeichnung und Schnabelhaken.

Drei echte lokale Vogelaufnahmen ergänzen die Landschaft: Kohlmeise, Amsel und Silbermöwe. Über ♫ freiwillig einschalten. Aufnahmen werden erst danach dekodiert und nur passenden aktiven Vögeln in Hörweite zugeordnet; der Silbermöwen-Flugruf gehört fliegenden Möwen. Entfernung und Richtung bestimmen Lautstärke und Stereoposition. Höchstens zwei Aufnahmen gleichzeitig. Im Feldbuch können gefundene Arten mit Aufnahme separat angehört werden; ein geöffnetes Buch pausiert nur Umgebungsrufe. Quelle und Lizenz stehen am Eintrag und in `dist/assets/BIRD-RECORDINGS.txt`. Es gibt noch keine Originalstimmen für sämtliche Vogelarten.

Identische Tier- und Schattenprogramme teilen sich nun dieselben Grafikprogramme; eine Prüfung vergleicht ihren vollständigen erzeugten Bewegungs-Code. Eine kleinere, weiterhin konservative Sichtzugabe spart Arbeit außerhalb des Bildes, auch im Fernglas. Bekannte Artbeschriftungen halten Werkzeug-, Quest- und Beobachtungsflächen frei. Vierzehn Prüfreihen und direkte Browserprüfungen decken Identität, Verhalten, Abstände, Werkzeuge, Bewohner und Ton ab. Die Einzel-HTML enthält die aktiven Materialbilder und MP3-Dateien; dafür sind keine Online-Abfragen nötig.

## Ergänzungen aus 0.12
Fünf kleine Dorfhäuser ersetzen die offenen Gebäudekästen auf den bisherigen Grundstücken. Geschlossene Giebel, Ziegeldächer, Schornsteine, Fenster, Türen, niedrige Gartenzäune, offene Zugänge und eine kurze Straße verbessern das Dorf, ohne seine Ausdehnung zu vergrößern. Die Hauswände bleiben feste Hindernisse. Vorgärten enthalten 420 registrierte Blütenpflanzen von Rotklee, Früher Margerite und Gewöhnlicher Schafgarbe.

Ein tatsächlicher Bienenstock gehört zum mittleren westlichen Garten. Acht dauerhafte Honigbienen sammeln an sichtbaren Blüten, übertragen Pollen zwischen getrennten Pflanzen derselben Art und kehren mit endlicher gesammelter Nahrung zurück. Die Westliche Honigbiene ergänzt den Katalog und ein weiteres Bestäubungs-Artenpaar im Dorf: insgesamt 45 Szenariopaare und 168 beschreibende Artprofile.

Seehunde und Kegelrobben erhalten glatte, längs orientierte Körper mit Flossen, Schnurrhaaren und Fellzeichnung. Körperabstände berücksichtigen auch ihre Drehung; dieselben Tiere bleiben erhalten. Fernglas und Lupe sowie das aktuelle Artenpaar sind deutlich größer. Die automatische Beobachtung bevorzugt unbekannte Arten, hält deren Identität während der Bestimmung und erfasst einen größeren sichtbaren Bereich. Eine ausdrückliche Fokusauswahl bleibt gebunden, bis man selbst schwenkt. Neue Einträge lassen sich über eine kurze Fundmeldung unmittelbar öffnen.

Die Einführung ist auf den Rangerauftrag und vier Werkzeuge gekürzt. 37 erreichbare Tafeln ersetzen 44 teilweise doppelte Tafeln; standortbezogene Hinweise und acht Arten von Schaubildern erläutern Waldschichten, Bestäubung, Nahrungsbeziehungen, Teichufer, Seezonierung, Tide, Bodenproben und Zersetzung. Der Isolationsversuch wählt einen freien Straßenzugang, sodass eine Garten-Tafel nicht fälschlich zur Barriere wird.

Artenweise Kandidatenlisten verkürzen wiederholte Räuber-/Beutesuchen, ohne den Bestand oder die Vegetationsqualität zu reduzieren. Die erste Darstellung wartet auf geladene Materialien. Zwölf Prüfreihen und direkte Browserprüfungen decken die neuen Funktionen ab.

## Erhaltene Verhaltensfolgen aus 0.11
Alle 45 Artenpaare der sechs Interaktionsszenarien nutzen artspezifische, räumlich überprüfbare Abläufe. Turmfalken kreisen, rütteln, stoßen zu ihrer tatsächlichen Feldmaus hinunter und steigen direkt wieder auf. Sie landen im Jagdszenario nicht. Füchse schleichen und verfolgen, Hechte lauern und beschleunigen kurz zur Beute. Krabben bearbeiten stationäre Muscheln; Watvögel suchen am trockenfallenden Grund. Mäuse und Fische reagieren durch Flucht.

Konkurrenten teilen endliche passende Nahrung und weichen nach einem Konflikt tatsächlich aus. Waldmeisen nutzen dargestellte Äste. Bestäuber fliegen zu den sichtbaren Blüten und übertragen Pollen erst zwischen getrennten Pflanzen derselben Art. Pflanzenfresser erreichen die Pflanze vor dem Fraß und wechseln ihren Futterplatz. Eichelhäher und Eichhörnchen sammeln Eicheln, tragen sie sichtbar und verstecken sie räumlich getrennt. Parasiten bleiben an ihren lebenden Wirten; Ressourcenaufnahme und modellierte Wirtkosten laufen weiter.

Die neue Paarquest ist ein Suchauftrag: **Beide beteiligten Individuen einmal fokussieren und danach gemeinsam im tatsächlichen Bildausschnitt sehen.** Dann ist sie unmittelbar erfüllt, auch ohne einen schon gespeicherten Arteintrag. Individuen aus verschiedenen Begegnungsgruppen lassen sich nicht vermischen. Bei Pflanzenpaaren übernimmt die Lupe den Pflanzenpartner. Die Artbestimmung und das Dokumentieren einer tatsächlichen Tätigkeit bleiben eigene Entdeckungen. Der bloße gemeinsame Anblick gilt fachlich nicht als Beweis einer Interaktion.

Flugneigung folgt Steigen, Sinken und Kurven; Flugbeine bleiben auch beim Stoßflug eingefaltet. Die kleine Detailansicht übernimmt Flügel und Bewegungsuhr desselben beobachteten Individuums. Bei Flut suchen betroffene Küstenvögel trockene Rastplätze und kehren bei Ebbe zurück. Annäherung unterbricht Nahrungssuche; danach müssen Tiere ihren echten Futterplatz wieder erreichen.

## Starten
Die Einzeldatei `Feldbuch.html` enthält Spiel, Three.js und Bildmaterial. Sie benötigt keine weiteren Spieldateien aus dem Internet. Auf Tablets ist eine normale HTTP-/HTTPS-Adresse am verlässlichsten; manche Dateivorschauen führen HTML nicht aus. Direkte lokale Dateiausführung konnte mit dem Browserwerkzeug nicht geprüft werden; dieselbe Datei wurde über HTTP ausgeführt.

Für die Projektfassung einen statischen Server starten:

```sh
python3 -m http.server 4173 --directory dist
```

Dann `http://localhost:4173/` öffnen. Ein Paketbuild ist nicht erforderlich.

## Dein erster Dienst
Am Start **Freie Erkundung** oder **Interaktionen und Wechselwirkungen** wählen. Das Aufklappmenü enthält Räuber-Beute-Beziehung, interspezifische Konkurrenz, Ektoparasitismus, Mutualismus/Bestäubung, Herbivorie und Zoochorie. Räuber-Beute, Konkurrenz, Ektoparasitismus und Herbivorie bieten jeweils acht Artenpaare; Bestäubung bietet neun und Zoochorie vier passende terrestrische Beziehungen. Das Questbuch sortiert nach Ökosystemen.

Nur der ausgewählte Paarauftrag erhält hohe goldene Tierstrahlen und grüne Pflanzenstrahlen. Diese folgen den tatsächlichen Partnern und dem aktuell genutzten Pflanzenplatz. Vier feste Begegnungsgruppen je Paar erhöhen die Entdeckungsdichte. Andere passende Paare dürfen ebenfalls gefunden werden. Nach Abschluss verschwinden die Strahlen. Auswahl und Markierung bestimmen keine Art automatisch. Über das Questbuch lässt sich der Expeditionsmodus wechseln.

Die Jagdgruppen zeigen wiederholte, bewusst gescheiterte Fangversuche. Dadurch bleiben die gleichen Beutetiere für erneute Beobachtungen erhalten; sie werden nicht wiederbelebt oder ersetzt. Natürliche Prädation in der freien Erkundung kann tödlich sein. Die Lernbegegnungen belegen keinen Lotka-Volterra-Zyklus.

## Steuerung und Entdecken

- Links am Steuerkreis ziehen: gehen. Rechts ziehen: umsehen. Computer: WASD/Pfeiltasten, Maus ziehen, B Fernglas, L Lupe, E Tafel.
- Fernglas für Tiere, Lupe für Pflanzen und Pilze. Im Fernglas laufen Bewegung, Tierzeit und Animation mit Faktor 0,5. Gezeiten und Bestimmungszeit bleiben unabhängig.
- Der vergrößerte mittlere Fernglasbereich hält das konkrete Individuum sanft und bevorzugt automatisch noch unbekannte Arten. Manuelles Schwenken löst die Bindung. Die Lupe beschriftet ausschließlich die fokussierte Pflanze; bekannte Tiere tragen im Fernglas dezente Namen.
- Für den Arteintrag Tiere drei Sekunden, Pflanzen/Pilze 2,5 Sekunden beobachten. Eine tatsächliche Tätigkeit lässt sich anschließend nach sechs Sekunden dokumentieren. Diese Zeiten sind keine zusätzliche Voraussetzung für den Szenario-Paarauftrag.
- Kleine Arten erhalten eine mitbewegte Detailansicht; ihre Freilandgröße bleibt maßstäblich.
- Ein etwa 735 Modellmeter langer, gestützter Bohlenweg verbindet alle acht Lebensräume. 36 Tafeln stehen auf seitlichen Plattformen; die aktuelle Startanleitung ist am Spawn erreichbar. Für Beobachtungen darfst du den Weg verlassen.
- Dorf, Gärten und Feldsäume sind teilweise begehbare Randgebiete. Holzzäune, Hecken und begrünte Wälle schließen die Landseite, Meer und tiefe Gewässer die Wasserseite.
- Unter „Gezeiten“ Wasserstand einstellen und Tide anhalten. Im Watt dem Probenpfeil folgen, neben den Weg treten und eine der sechs Untersuchungstiefen antippen. Vier Probenstellen enthalten zehn typische Arten. Freilegen bestimmt keine Art automatisch.
- Karte, Übersicht, Tageszeit und Feldfoto ergänzen die Erkundung. Das Feldbuch wird im Browser gespeichert und lässt sich herunterladen. ♫ schaltet echte Vogelaufnahmen von drei Arten ein; deren Feldbucheinträge bieten zusätzlich eine Hörprobe.

## Individuen, Ressourcen und Evolution
Natürliche Tiere sind vor der ersten Annäherung oder Auftragseinwahl inaktiv. Nach Aktivierung bleiben dieselben Objekte und IDs während der Sitzung erhalten und bewegen sich auch außerhalb des sichtbaren Ausschnitts weiter. Erbeutete Tiere kommen nicht automatisch zurück. Moduswechsel erhalten die natürliche Population; beim Neuladen beginnt ein neuer Naturbestand. Feldbuch und fertige Quests bleiben gespeichert.

Konkurrenz und Fraß verändern echte endliche Vorräte. Bestäubung benötigt getrennte Pflanzen und Pollentransport. Samenverstecken ist noch kein Nachweis von Keimung. Filtration setzt Wasserbedeckung voraus; eine leere Schale ist eine Spur. Fehlende lebende Partner verkleinern das Soll eines freien Auftrags nicht.

In der freien Erkundung stehen 16 Questkategorien zur Verfügung: acht Interaktions-/Ressourcenkategorien und acht Evolutionsfaktoren. 51 Kernbegegnungen, 196 ergänzende Nahrungssuche-Fundorte und 21 regionale genetische Begegnungen. Die Evolutionsversuche verwenden getrennte endliche diploide Modellpopulationen mit zwei Genorten. Paarung erfordert Annäherung; Nachkommen erben Allele und erhalten neue IDs. Genfluss braucht Ortswechsel und anschließend genetischen Beitrag. Tabellen und Ereignisse helfen, Ursachen von Veränderungen zu unterscheiden.

## Landschaft und Leistung
Dichtes Kronendach, Strauch-, Kraut-, Moos- und Bodenschicht, Ufervegetation und Salzwiesenpflanzen bilden die Lernlandschaft. Der Waldkern und die zwei verbleibenden Waldteiche behalten ihre Größe. Offenlandstrecken sind verkürzt und dichter bepflanzt. 30549 registrierte Pflanzenplätze, darunter 2365 Weizenplätze. Alle regionalen Pflanzenarten bleiben vertreten.

Die Darstellung ist auf 30 FPS begrenzt. Räumliche Sichtfilter, kompakte Instanzbuffer, kleinere Ansichten ferner Pflanzen und seltener aktualisierte Schatten reduzieren Arbeit. Größere oder herangezoomte Pflanzen wechseln zurück zur vollständigen Geometrie. Vegetationsdichte, Materialien und Auflösungsgrenze wurden in 0.12 und 0.13 nicht reduziert. Unsichtbare Tiere werden nicht gelöscht. Der sichtbare Eicheltransport benötigt höchstens einen zusätzlichen kleinen Zeichenaufruf.

Sechzehn automatisierte Prüfungen und Ergebnisse liegen im Projektarchiv. Aktuelle Browserbelege und Leistungsstichproben stehen in `PRUEFUNG.md`. Desktop-Stichproben sind keine Garantie für dauerhaft 30 FPS auf einem physischen Tablet; Multitouch, Speicher und Wärmeverhalten bleiben dort zu prüfen.

## Fachliche und grafische Grenzen
Die Landschaft kombiniert Arten mehrerer Jahreszeiten auf engem Raum und bildet keinen konkreten Nationalpark maßstäblich ab. Flache Waldteiche werden nicht als dauerhaft geschichtete tiefe Seen erklärt. Artprofile und Tafeln erläutern Nischen, Waldstockwerke, Uferzonierung, Trophiebeziehungen, Stoffkreisläufe und Salztoleranz.

Generationen sind auf etwa 55 beziehungsweise 75 Modellsekunden (Dorfwanderungen: 120) verkürzt. Die erhöhte Mutationsrate von 6 % je Lehr-Locus/Keimzelle und die Verknüpfung von Fellhelligkeit/Partnerpräferenz mit Genotyp sind didaktische Annahmen. Es fehlen vollständige natürliche Fortpflanzung, Jahreszyklen, Wasserchemie und keimende ausgewachsene Bäume. Das Modell liefert keine empirischen Populationsprognosen.

Die Artmodelle und Bewegungen bleiben prozedural. Weltfeste Standfüße, gegliederte Beine, Bremsen und sanfte Wendungen verbessern den Bodenkontakt; Flugfolgen sind gestalterische Näherungen. Vollständiger Fotorealismus und grafisch eindeutige Bestimmung aller ähnlichen Arten sind noch nicht erreicht. Geprüfte lizenzierte Modelle mit Skelettanimation und diagnostisch feinere Pflanzen bleiben nächste Schritte. Generierte Materialatlanten sind keine zertifizierten Scans.

Quellen, Arten-CSV, Materialherkunft und aktive Module liegen im Projektpaket. Three.js ist MIT-lizenziert. Es gibt keinen bestätigten öffentlichen Live-Link.

## Neu in 0.17
Blüten und breite Blätter besitzen gekrümmte räumliche Oberflächen mit Mittelrippe, leichter Schalenform und Blattdicke. In der Nähe bleiben blühende Pflanzen länger als echtes 3D-Modell sichtbar. Entfernte Pflanzen behalten ihre bestehenden Ansichten; Gräser und Moose verwenden sparsame Geometrie. Wegerich erhält Blattrosette und Ähren statt auffälliger Kronblätter. Windbestäubte Kräuter werden nicht als Nektarquelle für Bienen verwendet.

Vier Wattproben lassen sich von der Oberfläche bis 35 cm ausheben. Ein animierter Boden mit Wänden, Rundrand und kleinen Aushubwülsten ersetzt den zuvor nur dunkler gefärbten Fleck. Die ursprünglichen Geländeflächen werden an der Öffnung ausgespart; Bodenkontakt und freigelegte Individuen folgen denselben tatsächlichen Dreiecken. Eine Grabung vertieft die Probe, füllt bereits entfernten Sand jedoch nicht automatisch zurück. Auswahl und Lehrtiefen bestimmen keine Art von selbst.

Alle 168 Artprofile enthalten nach Entdeckung echte lokale Referenzfotos mit Urheber, Quelldatei und individueller Lizenz. Die Bilder werden erst beim geöffneten Eintrag angezeigt. Auch bei späteren Beobachtungen öffnet ein Knopf im Fernglas oder in der Lupe den tatsächlich fokussierten Arteintrag. Referenzbilder können anderes Geschlecht, Jahreskleid oder Entwicklungsstadium zeigen; Muschel-/Schneckenbilder zeigen zum Teil Schalen.

Artabhängige Flügel-, Brust-, Kopf- und Schnabelfarben ersetzen eine missverständliche gemeinsame Akzentfarbe. Beim Austernfischer sind Flanken und Schwingen schwarz-weiß; das Orange gehört zum Schnabel. Die symmetrische Flügelanimation aus 0.16 bleibt erhalten. Queststrahlen folgen ausschließlich den tatsächlichen Teilnehmern der gewählten Begegnung. Unbeteiligte Nahrungspflanzen werden nicht als Partner eines Tierpaars markiert. Ein kurzes blaues Weglicht dient allein zur Navigation.

Durchgehende Fundamente reichen bis unter das sichtbare Dorfgelände. Häuser und Grundstücke behalten ihre Maße. Eine zusammenhängende Holzunterlage schließt Lücken zwischen Bohlen an Kurven und Ausbuchtungen. Sprinttempo: 7,5 statt 5 m/s (+50 %). Der Tablet-Steuerkreis steigert das Tempo proportional zum Ausschlag; diagonales Gehen überschreitet das Maximum nicht. Die Startanleitung ist angepasst. Alle 17 Prüfreihen bestehen; Messungen und Grenzen stehen in `PRUEFUNG.md`.

## Frühere Änderungen – historischer Stand


## Ranger Kompakt: eigener Referenzabschnitt

Die große Fassung bleibt erhalten. `dist/kompakt.html` ist der separate Einstieg der Phasen 0–2 auf `feature/ranger-kompakt`. `python tools/build-compact.py` erzeugt eine lokale Vorschau unter `outputs/Ranger-Kompakt/`, `Ranger-Kompakt.html` und ein Vorschau-ZIP. Kein Deployment. [Stand und Freigabegatter](docs/kompakt/STATUS.md), [Plan](docs/kompakt/PLAN.md), [Prüfungen](docs/kompakt/TESTS.md). Restlicher Artenbestand und K1–K5 folgen erst nach visueller Freigabe.
