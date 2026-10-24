# Ranger Kompakt V1 – Abschluss

**Status: RC lieferbar im ausdrücklich festgelegten Softwareumfang.** Eine reale Hardware-, Safari- oder Unterrichtsfreigabe ist damit nicht erteilt.

Kandidat: **`ranger-kompakt-v1.0.0-rc.1-e9899efaa314`**. Genau dieser Kandidat wird zur einen gezielten Nutzer-/Geräteabnahme übergeben. Kein Merge, kein Deployment, keine Veröffentlichung; PR #3 bleibt Draft.

## Identität und Prüfumfang

| Gegenstand | Identität |
| --- | --- |
| Geprüfter Produktcommit | `e9899efaa314d052191d7d3a95b5de904f2932b6` |
| Runtimebaum SHA256 | `bfd7020b1b21c96ac6fa0ba19ae2c71eea0b9f3c3a06844d748129c7b43e3e61` |
| Tatsächlich ausgelieferte Einzel-HTML SHA256 | `87ff215191f543c1d91cadeef0ecf14c98012ff1f2b0c9866df0bbe2fd6494b8` |
| Webmanifest SHA256 | `01d3c8a50974b94eb1f00272f12d8e24fb087df17e265e1c80a86ee47da5dead` |
| Lernpaket-Buildinfo SHA256 | `584a0ff36352faabc7c726f82b9e81f0a4ed1db2d02b2f7bd19682a2fef6dc6d` |
| Korrektur des tatsächlichen Quelltests | `bd859abe098a50408f8b950794b012b59b8432dd` |
| Korrektur pausierter Bildaufnahmen | `a1602a6fee0c37406d7eaded0724ae03f92b6f61` |
| Abschließend geprüfter QA-/Pakettreiberstand | `39c76226d42e0d34dda130b984c4c58825b84d39` |

Die Runtimeabbildung umfasst die tatsächlich eingebundenen Module, CSS, Einstieg, Medien und Icon. Ihr Hash entsteht aus der sortierten kompakten JSON-Dateihashabbildung in [runtime-freeze.json](Nachweise/runtime-freeze.json). Nach dem Produktcommit änderten sich ausschließlich QA-Treiber und Abschlussdokumente. Der bytegleiche Produktbaum und die drei gelieferten Artefaktstempel wurden erneut verifiziert; kein nachträgliches Neubauen unter einem Dokumentationscommit. Der spätere reine Liefercommit wird in `LIEFERUNG.json` neben dem fertigen Archiv vermerkt, um eine Selbstreferenz im Commit zu vermeiden.

Eigene Ausführung: 24.10.2026 UTC, Node 24.19.0, Python 3.12.14, Chromium 154.0.8037.57 mit SwiftShader. Das sind Cloudprüfungen, keine benannten unterstützten realen Schulgeräte. Genaue Start-/Abschlusszeiten stehen in den Rohberichten.

## Konkrete Änderungen

Die gekoppelte Detailkamera hält Run, Individuum, konkrete Beute und Ereignis bis nach der äußeren Aufnahme zusammen. Kopf und Schnabel begrenzen das Heranzoomen; nach dem Fang wechselt sie nicht auf die nächste Beute oder eine alte Schale. Weltknoten und Beute bleiben maßstabstreu. Ein eigener Nahrungserwerbsbeleg verlangt tatsächlich sichtbaren Kontakt und passende Aufnahme; die freigestellte Modelllinse allein vergibt keinen Beleg. D1 verlangt keine innere Verdauungsanatomie.

Begrenzte scrollbare Flächen, erreichbares Schließen und abgeschirmte Eingaben sichern die vier Pflichtgrößen und nativen200%-Zoom. Tatsächlicher Grafik-Retry erhält dasselbe Dokument, denselben Rundgang und gespeicherte Bytes. Diagnostische Koordinatenobjekte bleiben kompatibel.

Revision 7 korrigiert nachgewiesene Bodenpenetration des Such-/Rückschwenks und bindet das sichtbare Bodennetz an die unveränderten konkreten Beutekontaktstellen. Ein begrenzter Wald-Durchgang variiert vorhandene Stämme/Kronen, Gruppen und Lücken sowie bodengebundene Strauchübergänge. Räumliche Gruppen statischer Dekoration reduzieren sichtbare Dreiecke, ohne gezählte biologische Individuen, Ressourcen oder Beobachtbarkeit umzuschalten. Revisionen 1–6 und alle geschützten Anker bleiben erhalten.

Der vollständige25-Karten-Pool bleibt bestehen. Ergänzt sind zwei Lehrkräfteseiten und je zwei Schülerseiten für Pfad A/B;90 Minuten sind Planungswerte. C17 präzisiert sechs Wochen Konditionierung und den getrennten thermisch ausgelösten Laichversuch. 3.380.000/12=281.666,7 bleibt ein Ereignismittel je tatsächlich ablaichendem Weibchen, keine Jahresrate;100 konditionierte Tiere werden nicht als100 Weibchen ausgegeben. Der neue eigene Volltextabruf ergabHTTP 403; der gelieferte unabhängige Primärabgleich ist ausdrücklich die Grundlage, kein behaupteter neuer eigener Volltextnachweis. C23 bleibt externer BPA-Datenfall.

36 Taxa, drei Kernlebensräume, Dorf/Deich, Hauptweg362,210m und Abkürzung29,146m, fünf Missionsfamilien und die Fach-/Speicherverträge bleiben erhalten. Keine zusätzlichen Arten, Karten, Konten, externe KI, Notengebung oder Engineänderung. Der Abschlussvertrag wurde als erster neuer Commit vor den Änderungen festgelegt.

## Eigene aktuelle Prüfungen

| Prüfung | Tatsächliches Ergebnis und Reichweite |
| --- | --- |
| Vollständiger Abschlussplan | **31/31 Prozesse bestanden**, davon21 Browserprozesse; sämtliche Prozessfehler bleiben als Fehler behandelt. [Rohplan](Nachweise/result.json) |
| Node / Python / Pakete | **28 Legacy- und13 Kompakt-Node-Prüfreihen,9 Python-Tests bestanden**. Builder, geschlossene Modulgraphen, Web-/HTML-/Lernpaket- und ZIP-Prüfungen bestanden. Nach den reinen QA-Korrekturen erneut alle41 Node-Reihen,9 Python-Tests und beide Paketverifizierer bestanden. [Nachprüfung](Nachweise/Nachpruefung-QA/result.json) |
| Tatsächliche Quelle / Website / Einzel-HTML | K1–K5 über reale UI neu erworben: **Quelle 18 Gruppen+Galerie, Web 17, Einzel-HTML 17 bestanden**. Richtige, falsche, unvollständige und berechtigt unsichere Fälle, Transfer, neue Versuche, Reload, Export/Import im jeweiligen sinnvollen Umfang. [Quellnachprüfung](Nachweise/Quellnachpruefung/result.json) |
| Fach-/Importverträge | **51 Importfälle bestanden**: F01/F04/N05-Originale, positive alte Bücher, identische Kopien, widersprüchliche Ereignisse, mehrdeutige Alt-IDs, atomare Ablehnung, beschädigter Speicher, Quota und Rohexport. K3 prüft konkrete Individuen-ID, Kontext und Reihenfolge; K5 weist sachfremde Belege ab. Nullpopulation und Stoffbilanzen bleiben korrekt. [Importlauf](Nachweise/imports/result.json) |
| Alte Spielversion | **16 Gruppen bestanden**, M1–M3 tatsächlich erworben, freies Spiel sowie Speichern/Reload geprüft; zusätzlicher Einzeldatei-Smoke3 Gruppen bestanden. M1/M2/M3 dauerten112,36/151,50/161,95s; keine Verlängerung des120-s-Fokuswartevertrags. [Legacy-Lauf](Nachweise/legacy-full/result.json) |
| Nahrungsaufnahme / B1–B5 | Vollständiger nativer Hauptweg, Rückweg, Abzweig und Dorfabkürzung; danach vier unbeschleunigte Folgen und vier weitere nach1200 expliziten Modellsekunden. **8 Folgen mit je7 gültigen visuellen Phasen**, konkrete Kontakte/Verbrauch/Identitäten numerisch geprüft, alle8 Kontaktbögen selbst angesehen. [Sichtprüfung](Nachweise/own-feeding-review/REVIEW.json), [Bildübersicht](BILDBELEGE.html) |
| Wege / unveränderte900-s-Diagnose | Neuer Originaltreiber besteht vollständig: Hauptweg667,416s, Rückweg125,069s, Abzweig35,356s, jeweils unter900s. Gesamter Prozess942,252s einschließlich Beobachtungen/Export: **kein Gesamtprozess-unter900s-Anspruch**. Separater höher aufgelöster V1-Funktionsweg mit Video: Hauptweg996,9s, Rückweg166,9s, Abzweig46,7s, Abkürzung113,5s/Rückkehr200s; kein Ersatz für die Originaldiagnose. [Budgetbeleg](Nachweise/original900-budget-summary.json) |
| Langbetrieb | **1201,29reale zusammenhängende Messsekunden**,78 Stichproben, keine Seitenfehler,1292 Pflanzen/9 Texturen/415 Geometrien am Ende erhalten; insgesamt1207,63s inklusive Nachprüfungen nach247,29sAufwärmen. Kein Addieren kurzer Läufe, keine beschleunigte20-Minuten-Beobachtung behauptet. [Langlauf](Nachweise/stability/result.json) |
| Bedienung / WebGL | **12 UI-Gruppen bestanden**:1440×900,1080×810,810×1080,600×375CSS-Pixel, Rotation, Eingabeschutz und Grafikverlust/Wiederherstellung. Zwei zusätzliche native200%-Prüfläufe bestanden; volle physische Browserfläche und ganze gescrollte Linse tatsächlich gesichtet. [Sichtprüfung](Nachweise/own-responsive-review.json) |
| Wald / lerntragende Organismen | Sechs exakt gleiche Vorher-/Nachherkameras und drei normale Gehblicke selbst verglichen. W1–W5 im begrenzten D2-Umfang bestanden. Reh/Specht und Bestimmungspflanzen gezielt angesehen; **keine anatomische Vollfreigabe aller36 Taxa**. Historische Revisionen 1–6 gegen echte unveränderte Git-Module:659.240 numerische/397.008 exakte Vergleiche, maximale numerische Abweichung0. [Waldsichtung](Nachweise/own-forest-review/REVIEW.json) |
| Material / frischer Druck | **5 PDFs,104 Seiten**:39 Schüler-,59 Lehrkräfteseiten und6 kurze Einstieg-/Pfadseiten. Alle112 frischen Raster bytegleich mit tatsächlich gesichteten8 Kontaktbögen/19 lesbaren Detailseiten; aktuellePDF-Hashes separat gebunden. Text-, Schreibraum- und Umbruchassertions bestanden, Runtime-Downloads und Lernpaket aus denselben Quellen. [Drucksichtung](Nachweise/own-print-review.json) |
| Quellen / Paketinhalt | Geschlossene Web-/Materialinventare, bestehende Asset-/Three-Nachweise, keine neuen Fremdassets, keine übernommenen fremden Volltext-PDFs. Tatsächlicher Dateiinhalts-/Pfadaudit auf erkennbare Schlüssel und private Browserprofile bestanden; begrenzte Prüfung, keine universelle Rechts-/Geheimnisgarantie. Quell-ZIP wird nach dem reinen Liefercommit separat aktualisiert und auditiert. |

Die ergänzten Läufe sind Wiederholungen bzw. zusätzliche Abdeckung, keine künstliche Summe unabhängig verschiedener Tests. Das20-Minuten-Modellschritt-Warten ist vom20-Minuten-Echtbetrieb und von aktiver eigener Beobachtungszeit getrennt. In Modellschritten wird kein eigener Beobachtungskredit erzeugt.

## Fehlläufe, Korrekturen und bewusste Grenzen

Der zuerst `learning-source` genannte Kernlauf verwendete tatsächlich `Web/index.html`. Sein unveränderter Rohbericht bleibt ein Webnachweis. Die Abdeckungslücke wurde im QA-Treiber korrigiert und anschließend der tatsächliche Einstieg `dist/kompakt.html` mit vollständigem Modulgraph geprüft; kein alter Bericht wurde umbenannt oder grün gefärbt.

Die28 direkten Canvasexporte der pausierten späten Nahrungsfolgen sind schwarz. Ursache: verworfener WebGL-Lesepuffer bei `preserveDrawingBuffer=false`. Sie sind **fehlgeschlagene Bildnachweise**, trotz bestandener funktionaler Assertions. Die28 unabhängig gleichzeitig erzeugten Compositorbilder zeigen dieselben Phasen bei exakt gleichem Modellzustand vor/nach der Aufnahme; diese gültigen Bilder wurden selbst gesichtet. Der neue reale Regressionstest reproduziert die schwarze Alt-Methode und bestätigt den sichtbaren Compositor ohne Zeit-/Zustandsinjektion. [Validierung](Nachweise/own-feeding-review/CAPTURE-VALIDATION.json), [Regression](Nachweise/Paused-Capture-Regression/result.json). Die Bildfolge enthält somit28 gültige direkte Echtzeitbilder und28 gültige pausierte Compositorbilder; schwarze Bilder zählen nicht mit.

Frühere Vorprüfungen bleiben dokumentiert: zu langer Lehrkräfte-Einstieg, verdeckte Touch-Schaltfläche, früherer Reload statt Kontext-Retry, nicht angewandte Zoom-Voreinstellung, Bodenpenetration, veraltete Retry-Erwartung und die danach entdeckte Koordinatenformat-Regression. Produktfehler wurden gezielt korrigiert, fehlerhafte QA-Erwartungen durch stärkere konkrete Prüfungen ersetzt. Zwei Pakettests fanden zunächst veraltete Legacy-Artefakte; Neubau behob dies ohne geänderte Assertions. [Unveränderte Vorgeschichte und aktuelle Ergänzungen](Nachweise/preserved-attempt-history.json). Die historischen936-N01/N07/N08-Fehler stehen unverändert neben der neuen Bewertung in der vollständigen21-Punkte-Matrix.

**30 FPS/p95≤50 ms in der Cloud verfehlt:** kurze serielle SwiftShader-Profile ergeben Wald1,736 FPS/p95633,3ms, Küste1,414 FPS/p951383,3ms und Detail5,138 FPS/p95266,6ms. Im Wald sinken sichtbare Dreiecke927.227→562.922; Drawcalls steigen36→127, an der Küste62→362. Das ist keine pauschale Geschwindigkeitsfreigabe. CPU-Abgabeintervalle können Treiberwartezeit enthalten; echteGPU-Zeitmessung fehlt. Das0,065-s-Framecap bleibt unverändert, verlangsamter Modellfortschritt wird angezeigt. AlterM1-60FPS-Bericht ersetzt keine aktuelle Hardwareprüfung. [Profile](Nachweise/performance-comparison.json).

`file://` wird im verwalteten Chromium administrativ blockiert; **NICHT GEPRÜFT**, HTTP samt Projektpräfix separat bestanden. Ein tatsächlicher `document.hidden`-Hintergrundzustand ließ sich mit zweitem Tab oder nativer Minimierung nicht herstellen; Rückkehr-/Pausefälle nur im belegten Umfang, kein Mock als echte Geräteprüfung. Reales Safari, installierteOS-/Browserversion und Unterrichtspilot bleiben **NICHT GEPRÜFT**. „iPad9/iPadOS27“ war eine Nutzerangabe, kein verifiziertes Geräteprofil.

START-HIER, Abschlussauftrag und Abschlussreview wurden vollständig berücksichtigt. Die dort genannten zusätzlichen vollständigen/kleinen Abschluss-QA-ZIPs und `pruefung/run-independent-checks.py` waren hier nicht vorhanden. Der936-Ausgangsstand wurde selbst mit exakt11.967.961 Bytes/SHA256`64b3a30a2c9a3f9fad48ab219d6b2a56a3190dafa7e06242654cad3d72d7ea17` gebaut. Eigene Repo-Prüfungen und vorhandene originale Fixtures bilden die aktuelle Evidenz; keine Ausführung des fehlenden14-Gruppen-Treibers behauptet. [Eingangsprovenienz](Nachweise/input-provenance.json).

## Ein Abschlussset und eine priorisierte Restliste

Das Archiv enthält genau diesen Kandidaten als Einzel-HTML, Webpaket und vollständiges Lernpaket, den Abschlussvertrag, [alle21 Matrixzeilen](PRUEFMATRIX.md) mit historischen Bewertungen, aktuelle Rohprotokolle, Originalfixtures, portable Treiber, ausgewählte unveränderte Bilder samt Herkunft und `SHA256.json`. [Reproduktion](Reproduktion/START-REPRODUKTION.md). Die zugeordnete Quellkopie `Feldbuch-Projekt.zip` ist ein Hilfsartefakt desselben Kandidaten; vergangene lokale Archive werden nicht als weitere neue Kandidaten angeboten. Das optionale gleich zugeordnete Medienarchiv enthält die vollen Rohbilder und Videos einschließlich ausdrücklich fehlgeschlagener schwarzer Direktexporte; die ausgewählten acht Kontaktbögen mit insgesamt56Phasen im kleinen Paket genügen B5.

1. **Reale Nutzer-/Geräteabnahme:** Waldentwurf gezielt entscheiden und auf dem tatsächlichen Apple iPad 9 mit eingetragenerOS-/Safari-Version K1/K3, Dateiimport/-export, Rotation, Hintergrundrückkehr, WebGL und20 Minuten prüfen;30 FPS/p95≤50 ms dort messen. [Abhakblatt](GERAETE-UND-PILOT-V1.md). Bis dahin kein entsprechender Geräteunterstützungsanspruch.
2. **Begleiteter Unterrichtspilot:** Verständlichkeit, echte Such-/Lesezeiten, Hilfen, anonyme Erst-/Revisionsprodukte, Fehlvorstellungen und Naturtransfer mit denselben kurzen Pfaden erheben. Keine erfundenen Schülerzeiten, keine Wirkungs- oder Notenbehauptung.
3. **Gesonderte spätere Veröffentlichung:** Erst nach ausdrücklicher separater Freigabe; dieser Abschlussauftrag autorisiert weder Merge noch Deployment noch Release.

Danach Stopp der eigenständigen Erweiterung. Es besteht im erklärten Softwareumfang keine bekannte offene reproduzierte kritische Datenverlust-, Falschbeleg- oder Missionsblockade. Die genannten externen Abnahmen bleiben offen.
