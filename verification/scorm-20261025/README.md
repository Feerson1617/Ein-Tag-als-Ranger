# Lokale Nachweise vor dem SCORM-Liefercommit

Grundlage: `28284b1e1638f546b5b191cf3b9935fc09ad3ce6` plus die in `local-checks.json` gehashten Änderungen. Diese Dateien sind **keine** Behauptung eines bereits erfolgten GitHub-Artefaktrückdownloads. Maßgeblicher Liefernachweis ist der erfolgreich abgeschlossene Actions-Lauf am finalen Commit, mit `delivery.json`, `download-verified.json` und Browsernachweisen im Artefakt `Ranger-SCORM-proof`.

Erfolgreiche lokale Prüfungen stehen einzeln in `local-checks.json`; unveränderte Standardtests, Paket-, Fach-, Speicher- und Druckregressionen sind durch vollständige Textprotokolle belegt. Die letzten sieben SCORM-Kernprüfungen bestanden; der zusätzlich entwickelte Interaktionstest wurde nach seinem unten beschriebenen Treiberfehler separat erfolgreich wiederholt. Der unter `scorm-core-and-initial-interaction.log` gesicherte frühe Acht-Test-Lauf bleibt als **FEHLGESCHLAGEN** dokumentiert. Anschließend bestanden alle acht Prüfungen zusammen am sauberen Commit `0c5cc3e7c9a601b0ef3cb1e0dcfd5a03a8d65f48` (`scorm-complete-0c5cc3e.log`). GitHub prüft zusätzlich beide Browser.

## Ursachen und Fehlversuche

- **FEHLGESCHLAGEN**, erster SCORM-Lauf: Der übernommene Mock-Frame erlaubt keine Formularübermittlung. Chromium protokollierte tatsächlich: `Blocked form submission to '' because the form's frame is sandboxed and the 'allow-forms' permission is not set.` Produkt-/Einbettungsfehler: Zusatzmodelle waren dort nicht berechenbar. Gezielte Korrektur: lokale Berechnung nach `reportValidity()` ohne nativen Submit; keine Erlaubnisausweitung im Testframe. Die fünf Modelle und die unveränderte normale Wachstums-/Formularprüfung bestanden danach.
- **FEHLGESCHLAGEN**, zweiter SCORM-Lauf: Neuer Test verglich `innerText` mit `toHaveText`, das auch eingeklappte Tabellen liest. Testfehler: Vergleich nun auf beiden Seiten mit vollständigem DOM-Inhalt, weiterhin einschließlich sämtlicher Ergebniszeilen.
- **FEHLGESCHLAGEN**, dritter SCORM-Lauf: Datenschutzinstrumentierung übersprang das anfangs `about:blank`-Popup. Testfehler: Wächter werden vor Navigation installiert, der aktuelle Dokumentpfad erst beim tatsächlichen API-Zugriff geprüft. Kein Produkt-Monkeypatch; alle persistenten Zugriffe werden weiter verworfen und protokolliert. Neustart und unveränderte fremde Einträge bestanden danach.
- **FEHLGESCHLAGEN**, neuer Interaktionstest im vierten Lauf: Der Austernfischer erzeugt seit bisherigem Fachvertrag `shell-competition`, nicht `shore-feeding`. Der Treiber erwartete den falschen Typ. Kein Eingriff in die Biologie; der korrigierte Test verlangt ausdrücklich den richtigen Typ, dieselben Individuen, alle fünf sichtbaren Phasen, freie Sicht, endlichen Ressourcenverbrauch und weiterhin null eigene Belege bei Modellzeitschritten.
- **FEHLGESCHLAGEN**, erste Python-Paketprüfung: Zwei große Legacy-Artefakte enthielten noch die vorige gemeinsame Startanleitung. Nach regulärem Neubau bestanden alle neun unveränderten Tests. Kein Validator abgeschwächt.
- **FEHLGESCHLAGEN**, erster generischer Smoke-Aufruf: Der gleiche Testserverport war durch die laufende SCORM-Prüfung belegt. Sequenziell wiederholt: vier Prüfungen **BESTANDEN**. CI trennt die Prüfungen durch Job-Abhängigkeit.
- **FEHLGESCHLAGEN**, lokale WebKit-Installation: Cloud-Proxy verweigert die offiziellen Browserdownloadhosts mit HTTP 403. Lokale WebKit-Browserprüfung **NICHT GEPRÜFT**; diese Grenze wird nicht als Browsererfolg ausgegeben.

Die Mock-API protokolliert bei Start/Beenden genau `LMSInitialize("")`, `LMSGetLastError()`, `LMSFinish("")`, `LMSGetLastError()`. Der Mock setzt anschließend selbst `completed`; kein Ranger-Statusschreibzugriff. Diese automatische LMS-Reaktion und die ausstehende echte itslearning-Abnahme stehen in [SCORM.md](../../docs/kompakt/SCORM.md).

Die Landschaft und die tatsächlich gerenderte Nahrungsaufnahme wurden an unveränderten Browseraufnahmen visuell geprüft. Das bestätigt dargestellte Geometrie und Bedienbarkeit im geprüften Browser; keine Naturvalidierung, keine allgemeine didaktische oder gestalterische Endabnahme und keine reale iPad-Zertifizierung. Frühere 900-Sekunden-Cloudfehler bleiben **FEHLGESCHLAGEN**. Merge, Deployment, Release-Veröffentlichung und itslearning-Upload sind nicht erfolgt.

## Schülerdokumente: abschließende Textkorrektur

Bei der abschließenden Sichtung enthielten die herunterladbaren Schülerpfade noch die normale Anleitung „JSON exportieren“. Ausschließlich das SCORM-Staging ersetzt sie durch Arbeitsblattsicherung und den Hinweis auf den flüchtigen Sitzungsspeicher. Unbenutzte ursprüngliche Seitentexte werden nicht mehr in der Dokument-Metadatenkopie mitgeliefert.

**BESTANDEN:** Der aktualisierte vollständige Sitzungstest erwirbt erneut K1–K5, lädt alle drei Schülerdokumente tatsächlich herunter, prüft deren Texte sowie leeren Neustart und unveränderte Fremddaten (`student-documents-browser.log`). Die heruntergeladenen Schülerpfade A/B haben weiterhin jeweils zwei A4-Seiten, der Arbeitsblattpool 38 (`scorm-student-print.json`). Direkte `file://`-Navigation war durch die Browserrichtlinie **FEHLGESCHLAGEN**; der reguläre lokale HTTP-Druckserver wurde erfolgreich verwendet, ohne Richtlinienänderung.

## Direkter Artefaktdownload: Ursache und Korrektur

**FEHLGESCHLAGEN:** SCORM-Lauf [40223709507](https://github.com/Feerson1617/Ein-Tag-als-Ranger/actions/runs/40223709507) am Commit `0c5cc3e7c9a601b0ef3cb1e0dcfd5a03a8d65f48`. Generische Vorlagenprüfung, normale Regressionen, Ranger-Chromium/WebKit, direkter Upload und Download sind laut Actions-Schrittstatus **BESTANDEN**; erst die Prüfung der angebotenen Datei scheiterte. Der Artefakt-API-Hash und die Größe stimmen mit der lokal erzeugten ZIP dieses Commits überein. Sie wird wegen des fehlgeschlagenen Rückdownloadnachweises nicht als Importkandidat ausgewiesen.

Die Download-Action v8 verwendet am gepinnten Commit `@actions/artifact@6.3.1`. Dessen unveränderte Downloadfunktion entpackt ZIP-Antworten standardmäßig, auch nach `archive: false` beim Upload. Im Workflow fehlte `skip-decompress: true`. **BESTANDEN:** lokale Reproduktion mit genau dieser Bibliothek und der tatsächlichen SCORM-ZIP: Standardmodus extrahiert das Wurzelmanifest und lässt keine ZIP zurück; der korrigierte Modus erhält den Dateinamen und sämtliche Bytes. Die unveränderte Paketprüfung besteht auf der so zurückgeladenen Datei (`download-action-reproduction.json`, `download-action-local-package.json`, vollständiges lokales Protokoll).

Reproduktion vom Repositoryverzeichnis aus:

```sh
npm install --prefix work/scorm/action-download-repro --no-audit --no-fund @actions/artifact@6.3.1
node verification/scorm-20261025/reproduce-download-action.mjs
```

Der Workflow setzt nun ausdrücklich `skip-decompress: true` und `digest-mismatch: error`; die anschließende Bytegleichheits-, XSD- und Paketprüfung bleibt unverändert verpflichtend. Die lokale HTTP-Reproduktion ersetzt keinen GitHub-Rückdownload. Nur der neue erfolgreiche Actions-Lauf am Liefercommit kann diesen belegen.

**NICHT GEPRÜFT:** vollständiger Traceback des ersten Actions-Dateifehlers in dieser Cloud. Der Log-/Artefakthost `productionresultssa19.blob.core.windows.net` liefert HTTP 403; es werden keine fehlenden Logzeilen ergänzt. Schrittstatus und Artefaktmetadaten wurden über die GitHub-API gelesen; die oben beschriebene Ursache wurde unabhängig lokal reproduziert.
