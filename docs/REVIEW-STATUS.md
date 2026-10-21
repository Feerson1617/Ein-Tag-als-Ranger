# Prüfstatus

## Gezielte Nachprüfung von PR #1 (21.10.2026)

Aktuelle Diagnose, Änderungen und erneute Prüfungen: [Nachweise](../verification/pr1-hardening/README.md).
C01: Der Original-Log ist jetzt zugänglich; ein durch den begrenzten Physikschritt
verursachter Beobachtungs-Timeout wurde lokal mit stabiler Fokus-ID reproduziert
und gezielt korrigiert. Mission 3 prüft Individuum, Modelldurchlauf und getrennte
Zeitfenster ausdrücklich, einschließlich Feldbuchimport. Vollständige erneute
Qualitätssicherung: 26 Node-Reihen, fünf Python-Methoden, alle Pakete und die unabhängige CI mit 13 Browserblöcken bestanden. Lokal bestehen M1/M2; M3 überschritt bei 800×500 wegen langsamer Modellzeit das 180-s-Testlimit (4,1/6 Modellsekunden). Dieser Fehllauf ist dokumentiert; ein ergänzender 600×350-Lauf läuft. Die CI wird um die vorhandenen Fehlerfälle, Projektarchiv- und Einzel-HTML-Prüfung ergänzt. Der PR bleibt Draft, ohne Merge oder Veröffentlichung.
Die folgenden Abschnitte dokumentieren frühere, davon getrennte Prüfstände.

## Baseline vom 21.10.2026

HEAD `227e61e1aef850609732255859ee954f328430a9` stimmt mit dem im Review
genannten Commit und dem aktuellen GitHub-main überein. Vor Arbeitsbeginn sauberer
Checkout, keine fremden Änderungen. Node 24.19.0, Python 3.12.14, Pillow 12.3.0.
`python3 tools/run-checks.py`: 22/22 Reihen bestanden (aktuell neu ausgeführt).
`python3 tools/build-web.py` und `python3 tools/verify-web.py`: bestanden;
52 aktive Module, 189 Assets, 36.637.429 Bytes, statische Startobergrenze
26.584.925 Bytes. Keine gemessenen Transferwerte. Chromium 154.0.8037.57: Start und echte
3D-Szene über lokalen HTTP-Ursprung bestanden, keine JavaScriptfehler.
Screenshots unter `work/baseline-*.png`, Messmetadaten im Baselineordner.
Software-Rendering, keine belastbare physische Leistungsprüfung. Historische Nachweise in
`verification/` behalten ihre ursprüngliche Aussagegrenze.

| ID | Priorität | Nachweis / Dateien | Entscheidung | Abnahmetest | Status |
|---|---|---|---|---|---|
| F01 | P0 | `interaction-scenarios.js`: `pairSighting` als Abschluss | Entdeckung erhalten, Untersuchung separat belegen | Paarfund ohne Ereignis; gültiges Ereignis; Replay | umgesetzt, Regressionen bestanden |
| F02 | P0 | `field-ecology.js`, Szenarien: Taxon statt Pflanze | stabile Pflanzen-/Patch-Identität und Fokusreset | falsche Pflanze/Habitat/Gruppe, Pause, Wiederaufnahme | umgesetzt; 30.549 eindeutige IDs geprüft |
| F03 | P1 | `quest-learning.js`, `quest-interface.js`: alle Fundorte | lokaler Lernabschluss, Fachhilfe jederzeit, keine Scheinautorschaft | 1 von 196; Hilfe vor Abschluss | umgesetzt, lokaler Lauf endet nach erstem Beleg |
| F04 | P1 | `plant-forms.js`, `expedition-state.js`: Form als Nektartrait | artspezifische Ressourcen | Mohn/Holunder ohne modellierten Nektar | umgesetzt; Primärtext-Nachprüfung extern offen |
| F05 | P1 | 168 Taxoneinträge/Katalog/Fotos | Strukturprüfung separat von Fachvalidierung | IDs, Einheiten, Habitate, Medien, Quellen; Fokustaxa | Struktur bestanden; keine umfassende biologische Validierung |
| M1–3 | P1 | noch keine vollständigen Kernmissionen | im bestehenden Feldbuch ergänzen | richtige/falsche/unvollständige/unsichere Antworten in UI | umgesetzt, getrennte Live-/UI-Läufe bestanden |
| S01 | P0 | Speicherfehler werden verschluckt | sichtbarer Fehler, versionierter Import, Migration | Quota, beschädigte Datei, Altstand, kein Teilimport | Modul- und UI-Tests bestanden |
| B01 | P1 | Build verfolgt statische `from`-Imports | vollständige Referenz-/Hashprüfung | fehlende Datei und manipuliertes Paket müssen scheitern | umgesetzt, positive und negative Paketprüfungen bestanden |
| D01 | P1 | physische Geräte fehlen | Desktopprüfung klar begrenzen | iPad/Safari und Mindestgerät durch Eigentümer | NICHT GEPRÜFT |
| U01 | P1 | kein Unterrichtspilot durchgeführt | 20–35 Minuten nur Planungsziel | reale Zeiten, anonyme Produkte | NICHT GEPRÜFT |
| L01 | P1 | keine globale Codelizenz | keine ungefragte Lizenzwahl | Eigentümerentscheidung; Medienrechte separat | offen |

Kein Release-/Live-Abnahmestatus aus grünen Modultests ableiten.

## Phase 1 – aktueller Nachweis

23/23 Prüfreihen einschließlich neuer Belegregression bestanden; zusätzliche
168er-Strukturprüfung bestanden. Webpaket und Einzel-HTML neu erzeugt,
Paketverifikation bestanden (54 Module / 189 unveränderte Laufzeitassets).
F01–F03 umgesetzt: Paarfund bleibt Entdeckung, zeitnah beobachteter Vorgang
separat; keine automatische eigene Deutung; individuelle Pflanzen-IDs; Fachhilfe
ohne Gesamtsammlung. F04: explizite Pollen-/Nektartraits, keine Formabkürzung;
F05: alle Taxa strukturell geprüft, keine pauschale biologische Validierung.
HTTP-Lizenzlinks auf Creative-Commons-HTTPS umgestellt, Lizenzversionen erhalten.

Primärtexte PubMed/DOI sind aktuell durch Proxy-403 gesperrt. Die Aussagen zu
Mohn/Holunder stützen sich auf das bereitgestellte Review mit genannten Quellen;
kein erneutes Lesen der Primärartikel behauptet. Domainergänzungen werden im
Umgebungsentwurf gespeichert; dies allein ändert die laufende Netzpolitik nicht.
Fachliche Einzelvalidierung und Geräteabnahme bleiben offen.

## Phase 2–5 – aktueller Arbeitsstand

26/26 Node-Prüfreihen bestanden. Zusätzlich fünf Python-Paketprüfungen:
fehlender Worker, nichtliteraler Import, Pfadausbruch, manipulierte/fehlende
Paketdatei, bereinigter Export, exakte Standalone-Modul-/Medienwiederherstellung
und gültige Bootstrap-Syntax. Diese Fälle sind automatisierte technische
Nachweise, keine biologischen oder schulischen Validierungen.

Die natürliche UI-Abnahme in Chromium hat M1 mit Waldmeister, Brennnessel und
Rotbuche bestanden (bei Rotbuche begründet unsichere Gruppenbestimmung). M2 ist
mit einem tatsächlich während des Laufs erzeugten Konkurrenzereignis an einer
endlichen Ressource und ausdrücklich als gelesen bezeichnetem Modellprotokoll
abgeschlossen. M3: Ort, Tiefe, konstante IDs und tatsächliche Wasserbedeckung sowie
Ruhe/Filtration sind in der echten Modellwelt geprüft; abschließender UI-Lauf bestanden.
Der Testablauf wurde nach einer versehentlichen Aktion hinter einem offenen
Dialog korrigiert; kein erzwungenes Durchklicken und kein Appfehler daraus behauptet.

In der Browserprüfung wurden zwei echte Bedienbefunde korrigiert: M1 erhält drei
ortsbeständige Fokustaxa im Gebiet, und der Beobachtungsbutton empfängt trotz der
umgebenden transparenten Optikebene Pointerereignisse. Keine Organismen entfernt.
Aufgezeichnete Dauern verwenden die Simulationsuhr; der Fernglasfaktor bleibt 0,5.

Evolution: Vorhersage, Datenvergleich und Modellkritik als offene Arbeitsnotizen,
keine automatische Benotung. Quantitatives Areal ausdrücklich P2 außerhalb des
Kernrelease; zusätzliche methodische Validierung wäre ein eigener Arbeitsumfang.

Python-Abhängigkeiten sind mit exakten Versionen auch in einer frischen venv ohne
system-site-packages aus den normalen Paketquellen installiert worden; TLS blieb
aktiv. Setupskript und Startanweisungen sind im Cloud-Entwurf gespeichert, aber
nicht dadurch veröffentlicht oder als neuer Task unabhängig geprüft.

Vor PR-Anlage waren CI/Pages-Workflows YAML-/SHA-strukturell geprüft; ein
entfernter Lauf war zu diesem Zeitpunkt noch nicht ausgeführt. Der spätere
CI-Nachweis steht unten. Kein Deployment ausgeführt. Die GitHub-API lieferte
zwischenzeitlich Forbidden; die bestehende Git-Authentifizierung funktionierte zum Lesen. Kein neuer
Token angefordert. Zusätzlicher Host api.github.com im Entwurf, nicht als wirksam
behauptet. Primärquellen-/Rechte-Einzelprüfung, physische Geräte, Mindestgerät und
Unterrichtspilot bleiben offen. 30-FPS-/50-ms-/20-Minuten-Ziele sind nicht abgenommen.


### Abnahme der Kernmissionen

Alle drei Kernmissionen sind im echten Chromium mit sichtbarer 3D-Welt
abgeschlossen worden: M1/M2 im ersten Live-Lauf; M3 nach Korrektur des
Dialogschritts im Testtreiber in einem eigenen frischen Profil. Anschließend
bestehen die neun Browserprüfblöcke einschließlich aller drei Formularpfade,
Import-/Download-/Sitzungswechsel, Fernglas/Lupe, Pause, Karte mit acht Regionen
und 1024×768-Layout. Keine JavaScriptfehler oder HTTP-Fehler in diesem Lauf.
M1 enthält eine begründete unsichere Rotbuchen-Zuordnung, nicht drei behauptete
sichere Artbestimmungen. Import-Formulartests verwenden ausdrücklich synthetische
Belege und sind getrennt von den Live-Belegen markiert.

M3 automatisiert: 257,7 Sekunden einschließlich Bedienhandlungen und der beiden
Beobachtungsfenster im Software-Renderer; kein Schüler-/Unterrichtszeitnachweis.
Startmessung dieses Laufs: 7,42 s bis Startfreigabe, 27.375.985 Bytes summierte
Resource-Timing-Transfers im kalten rohen Entwicklungsstand. Diese Messung ist
weder das gehashte Endpaket noch die statische Startobergrenze.

Im 1024×768-Software-Rendering treten mehrsekündige Bildabstände auf. Dieses
System erfüllt das vorgeschlagene 30-FPS-Geräteziel nicht. Keine Verbesserung
oder allgemeine Hardwaretauglichkeit daraus abgeleitet. Unterstütztes Mindestgerät
und reale iPad-Prüfung bleiben offen; keine 20-Minuten-Leistungsabnahme behauptet.

Aktuelle Regression: lokaler Abschluss wird nach einem gültigen Fundort erreicht;
unerreichbare/tote Partner werden weiterhin nicht als Beleg gezählt und die
optionale Gesamtsammlung bleibt unvollständig. Alle 26 Reihen nach Anpassung der
veralteten Gesamtsammel-Erwartung erneut bestanden. Die neue Hummelreferenz erlaubt
mit den groben sichtbaren Merkmalen ausdrücklich nur die Gruppenzuordnung.


### Abschließende Zusatzprüfungen

Der gehashte Export unter `/Ein-Tag-als-Ranger/` besteht die neun UI-Prüfblöcke
inklusive des erneuten Live-M3-Laufs. Dieser prüft jetzt ausdrücklich den tatsächlichen
Ruhezustand bei Niedrigwasser und Filtration bei Hochwasser in der laufenden
Simulation. Der zuvor pauschale Ruhezustand der Probenmuscheln wurde korrigiert;
ein direkter Aufruf der Aktionswahl allein war dafür kein ausreichender Test.
Die Regression verwendet vollständige Simulationsschritte und kontrollierten
Hintergrundfraß. Die festen Probenorganismen sind dafür als Kontrollareal vor
zufälligem Hintergrundfraß geschützt; gezielte Modellaufträge bleiben separat.

Zusätzlicher Fehlerlauf des gehashten Exports: fünf Prüfblöcke bestanden, darunter
reale WebGL-Wiederherstellung mit unverändertem Feldbuch, absichtlich unterbrochener
Fuchsmodelldownload mit gesperrtem Start und erfolgreicher Wiederholung sowie
sichtbarer Quota-Fehler. Der Quota-Fall läuft in einem separaten frischen Browser,
nachdem die kombinierte Instanz nach den Grafikfehlern beim Start hängen blieb.
Isoliert startet er in 7,25 s; die Meldung bietet einen JSON-Export an. Keine
Abschaltung von Assertions oder erzwungenen Klicks. Keine JavaScript-/Konsolen-/
HTTP-Fehler im anschließenden erfolgreichen Fehlerlauf; zwei beabsichtigte
Fehler-Injektionen sind separat bezeichnet.

Aktualisierte Messung des gehashten M3-/UI-Laufs: 7,43 s bis Startfreigabe,
26.673.085 Bytes gemessener Ersttransfer einschließlich Navigation. Automatisierter
M3-Durchlauf 262,43 s; keine gemessene Schülerzeit. Renderer: Chromium 154,
SwiftShader, 800×500; spätere Tablet-Layoutprobe 1024×768, keine Hardwareprüfung.
Auch dieser Software-Renderer erfüllt das FPS-Ziel nicht. Berichte unter
`verification/rc1/` unterscheiden die getrennten Läufe und ihre Aussagegrenzen.

Importe berechnen den lokalen Missionsabschluss aus den tatsächlichen Belegen und
Antworten neu; ein gespeichertes `complete:true` ohne passende Belege genügt nicht.
Bei M3 reichen Wasserstände allein nicht, wenn das Protokoll keine aktive Filtration
zeigt. Ungültige Untersuchungsbelege werden vor der Übernahme abgelehnt.


Abschließender Spielcode-Prüfpunkt: `a4e4db7b6301fcbe547632d3c5a13ac985d10f50`.
26/26 Node-Reihen und 5/5 Python-Prüfmethoden erneut bestanden. Der Spielcode bleibt
danach unverändert; Paketwerkzeuge und Berichte erhalten die unten dokumentierte
Ergänzung. Finale Pakete werden aus dem sauberen Commit mit neuer Commitbindung
erzeugt.

Die eigenständige `Feldbuch.html` startet ebenfalls im echten Chromium ohne
JavaScript-, Konsolen- oder HTTP-Fehler. Ein vor Entdeckung geöffnetes Referenzfoto
(Kohlmeise) besitzt dekodierte Bildpixel; 18 Assets sind zunächst, 33 nach Öffnen
der Referenzen dekodiert. Der Rest bleibt zurückgestellt. Startfreigabe nach
8,32 s, 48.152.856 Bytes Navigationsübertragung der vollständigen Einzeldatei;
kein externer Assettransfer. Das ist keine kleinere Netzwerkfassung als Pages.

Gespeichert werden Feldbuchbelege und Antworten, nicht der vollständige laufende
Welt-/Kamera-/Gezeitenzustand. Nach Wiederaufnahme sind Vergleichsbedingungen bei
Bedarf erneut einzustellen. Live-Belege und importierte Aufzeichnungen bleiben
als solche gekennzeichnet.


GitHub-Verbindungsstatus zum Abschluss: Der zuvor gesperrte API-Zugriff funktioniert
wieder. Branch `codex/ranger-v1` ist gepusht, Entwurfs-PR #1 ist angelegt:
https://github.com/Feerson1617/Ein-Tag-als-Ranger/pull/1 .
Der frühere 403 ist ein historischer Befund, kein fortbestehender Tokenbedarf.
Es gab keinen Merge und keine Veröffentlichung. Status der entfernten CI-Läufe
wird getrennt von den lokal bestandenen Tests behandelt.


Beim wiederholten Paketbau fiel eine wechselnde SHA256-Prüfsumme der Einzel-HTML
auf: Die Menge der eingebetteten Assets hatte eine von Pythons Hashrandomisierung
abhängige Reihenfolge. Die Ausgabe ist jetzt sortiert. Ein zusätzlicher Vergleich
innerhalb der bestehenden Paketprüfung baut mit `PYTHONHASHSEED=1` und `2` und
verlangt identische HTML-Bytes. Alle fünf Python-Prüfmethoden bestehen damit.
Browserberichte erfassen künftig auch den Dirty-Status des Quellbaums.


## Vollständige Abläufe und CI zum Abschluss

Auf dem sauberen PR-Head `5a1a11a` sind alle drei Missionen in einem einzigen
frischen lokalen Browserprofil abgeschlossen; anschließend bestehen alle
Formular-/Import-/Bedienpfade (elf Blöcke). M1/M2/M3: 399,62 / 238,01 / 264,80
automatisierte Sekunden. 7,66 s Startfreigabe, 26.674.136 Bytes Ersttransfer.
Keine JavaScript-/Konsolen-/HTTP-Fehler. Keine Schülerzeit- oder Hardwareaussage.

Auch GitHub-Run 39597573474 besteht auf einem frischen Runner: Installation,
26 Node-Reihen, Webbuild/-verifikation, Einzel-HTML, fünf Python-Prüfmethoden und
elf Browserblöcke einschließlich der drei Live-Missionen. Actions testet den
prospektiven Mergecommit `aa2a9c2` des PR-Heads `5a1a11a` gegen main. Nachweise
unter `verification/rc1/github-ci.json` und `all-missions-browser.*`.

Offener Teststabilitätsbefund C01 (P1): Run 39595902666 war im Browserteil
fehlgeschlagen; seine konkrete Ursache ist wegen blockierter Original-Log-/
Screenshotdownloads nicht festgestellt. Der erfolgreiche Folgelauf ändert nur
die Diagnoseausgabe im Prüfer, keine Spielimplementierung und keine abgeschwächte
Assertion. Der alte Fehllauf bleibt verlinkt. Vor stabiler Veröffentlichung
Originalprotokolle prüfen; keinen diagnostizierten oder behobenen Produktfehler
behaupten. Die beiden zwischenzeitlich überholten frühen Läufe wurden nach
Quellstandsaktualisierung abgebrochen, nicht als erfolgreiche Abnahmen gezählt.

GitHub-Logserver `results-receiver.actions.githubusercontent.com` und der konkret
beobachtete Artefakthost `productionresultssa18.blob.core.windows.net` sind dem
Cloud-Entwurf hinzugefügt, aber dadurch nicht in der laufenden Netzpolitik
freigeschaltet. Kompakte CI-Fehler/Ergebnisse sind nun auch per Check-Annotation
über die erreichbare GitHub-API verfügbar. Der Prüfer behandelt HTTP-Fehler
ausdrücklich als Fehler. Alle archivierten erfolgreichen Läufe besitzen bereits
leere HTTP-Fehlerlisten. Keine Veröffentlichung und keine stabile Gerätefreigabe.
