# Ranger Kompakt · SCORM 1.2 für itslearning

Diese Ausgabe verwendet die bestehende Universalvorlage aus `Feerson1617/Interaktive-Lernmodelle-SKORM`, exakt Commit `86006235258195cae76a6cfe33c0be58f4bd05d1`. Herkunft, unveränderte Originaldateien und gezielte Anpassungen stehen in [INTEGRATION.md](../../tools/scorm-template/INTEGRATION.md) und `tools/scorm-template/provenance.json`. Es gibt keinen zweiten Manifest-/SCORM-/ZIP-Exporter.

## Ausgabe und Speicherung

`tools/build-compact.py` erzeugt weiterhin die normale Webfassung und eigenständige HTML-Datei. Das SCORM-Staging verwendet genau diesen Webordner, seine lokalen Assets, Module und Fachinhalte. Lehrkräftelösungen und interne Prüfdateien werden entfernt; allgemeine Schülerarbeitsblätter und Quellen bleiben. Die SCORM-Schülerpfade verweisen zur Sicherung auf das Arbeitsblatt; Anweisungen zum persönlichen JSON-Export werden dort ersetzt. Die Fach- und Importvalidatoren werden nicht verändert.

Die Anwendung lädt `web/storage-adapter.js`. Er wählt anhand des frühen `SCORM_CONTEXT.classroomMode` vor jedem Browser-Speicherzugriff entweder den bisherigen lokalen Speicher oder einen eigenen flüchtigen Speicher. Im SCORM-Modus werden keine persistenten Speicher-APIs verwendet und keine vorhandenen Spiel-/Fremddaten eingelesen oder gelöscht. Beobachtungen, Antworten, Entwürfe, K1–K5 und lokale Modellläufe bleiben innerhalb derselben geöffneten Sitzung erhalten. Neuladen oder ein neuer Start beginnt leer. Persönlicher Dateiimport/-export ist ausschließlich in dieser Oberfläche entfernt. Keine globalen Speicherpatches im Produkt.

Zusatzmodellparameter und berechnete Ergebnisse bleiben beim Dialogwechsel im Anwendungsspeicher. Der Berechnungsknopf führt eine lokale, weiterhin nativ validierte Berechnung aus. Ein restriktiver LMS-Frame ohne `allow-forms` blockiert diese Berechnung damit nicht mehr. Die reguläre Ausgabe behält Feldbuchspeicherung, Import, Export, Wiederaufnahme und Datenvalidierung.

## LMS-Vertrag und Grenze

Nur die ausdrückliche Konfiguration `trackingMode: "ranger-session-only"` aktiviert den Ranger-Vertrag: `LMSInitialize("")`, `LMSFinish("")` und technische `LMSGetLastError()`-Abfragen. Keine `LMSGetValue`, `LMSSetValue` oder `LMSCommit`; keine Identität, Antworten, Punkte, Orts-, Fortschritts- oder Abschlussdaten. Auch Hintergrund-/Seitenwechsel und bfcache verwenden keine Daten-API.

Das unveränderte generische Standardprofil der Vorlage behält Statuslesen, erforderliches `incomplete` und Commit. Die bisherigen Standardtests bleiben erhalten.

itslearning kann unabhängig vom Spiel Zugriffe, Sitzungen oder automatische Statuswerte erfassen. Der übernommene Mock-LMS setzt einen ungemeldeten ersten Versuch beim Beenden selbst auf `completed`: Die Ranger-Prüfung weist gleichzeitig nach, dass kein Status geschrieben wurde. Das ist keine Bestätigung des tatsächlichen itslearning-Verhaltens. Sollte itslearning dadurch eine unerwünschte Fertigmeldung erzeugen, muss diese LMS-Einstellung beziehungsweise dieser Zielkonflikt entschieden werden; Ranger schaltet keine Statusübertragung ein.

## Build und reproduzierbare Prüfung

Voraussetzungen: Node 24, Python 3.12; Abhängigkeiten aus den beiden festgelegten Requirements-/Lockdateien.

```sh
npm ci --prefix tools/scorm-template
python -m pip install -r tools/requirements-dev.txt -r tools/scorm-template/requirements.txt
python tools/build-compact.py
python tools/verify-compact.py
node tools/scorm/stage.mjs
node tools/scorm-template/scripts/build.mjs tools/scorm/ranger.config.json
python tools/scorm/verify.py tools/scorm-template/dist/Ranger-Kompakt-itslearning-SCORM12.zip --report work/scorm/package.json
npm --prefix tools/scorm-template test
node tests/compact-storage-adapter-check.mjs
TEST_WEBKIT=1 tools/scorm-template/node_modules/.bin/playwright test --config tools/scorm/playwright.config.js
```

Browser zunächst mit der Playwright-Version unter `tools/scorm-template` installieren. `tools/scorm/prepare-reference.py` bereitet separat die generischen Beispiele am exakten Vorlagencommit vor. Der Workflow führt daran die unveränderten generischen Node-/Python-, Chromium-/WebKit- und Smoke-Tests aus. Beispielmodelle bleiben außerhalb des Schülerpakets.

Die SCORM-Konfiguration löst `sourceDir` relativ zu `tools/scorm/ranger.config.json` auf. `work/scorm/staging.json` protokolliert die gezielten Materialtransformationen und ihre Hashes. Die Vorlage prüft lokale XSDs, einen SCO, Startdatei, vollständiges Inventar, Referenzen, unveränderte Quellbytes und ZIP-Integrität. Ranger ergänzt Provenienz- und Datenschutzprüfungen. Freiwillige Literaturanker werden ausschließlich im expliziten Profil zugelassen; Pflichtressourcen bleiben lokal. Berechnete URLs benötigen zusätzlich Browserprüfung.

## Download und itslearning-Import

Der Workflow [Ranger SCORM 1.2](https://github.com/Feerson1617/Ein-Tag-als-Ranger/actions/workflows/ranger-scorm.yml) startet bei Push auf `feature/ranger-kompakt`; zusätzlich ist `workflow_dispatch` definiert. GitHub zeigt einen ausschließlich auf dem Entwicklungsbranch liegenden manuellen Workflow eventuell noch nicht in der Standardbranch-Oberfläche.

1. Den erfolgreichen Lauf für den gewünschten Commit öffnen. Im Job-Ergebnis die geprüfte Datei `Ranger-Kompakt-itslearning-SCORM12.zip` herunterladen.
2. Größe und SHA-256 mit dem Laufbericht beziehungsweise `delivery.json` aus `Ranger-SCORM-proof` vergleichen. Die SCORM-Datei wird mit `upload-artifact@v7`, `archive: false` direkt angeboten. `download-artifact@v8` lädt genau diese Datei erneut; anschließend werden Bytegleichheit und vollständige Paketvalidierung verlangt. Die Nachweise liegen in einem gesonderten, gewöhnlichen Belegartefakt.
3. In itslearning im vorgesehenen Kurs ein SCORM-/Lernpaket hinzufügen, **die unveränderte SCORM-ZIP ohne vorheriges Entpacken** auswählen und SCORM 1.2 verwenden. `imsmanifest.xml` und `index.html` liegen unmittelbar in der ZIP-Wurzel. Menübezeichnungen können je nach itslearning-Version/Berechtigung abweichen.
4. Vor Unterrichtseinsatz Start im Frame und neuen Fenster, vollständiges Schließen/Neuladen, den Sitzungshinweis und den LMS-eigenen Status prüfen. An tatsächlichem iPad 9 mit installierter iPadOS-/Safari-Version Touch, Rotation, Dialogscrollen und längere Nutzung prüfen. Wichtige Ergebnisse auf dem Arbeitsblatt sichern.

Dieser Auftrag beinhaltet keinen Upload in itslearning, keinen Merge, kein GitHub Release und kein Pages-Deployment. Der PR bleibt Draft. Actions-Artefakte sind befristet; die SCORM-Datei ist nicht als Binärdatei in Git eingecheckt.

## Abnahmegrenzen

Mock-LMS, Linux-Chromium und Linux-WebKit sind technische Prüfumgebungen. Reales itslearning, physisches iPad 9/Safari einschließlich der tatsächlichen Systemversion sowie der Unterrichtspilot bleiben **NICHT GEPRÜFT**. Erfolgreiche Beleg-/Formulartests bestätigen keine Lernwirksamkeit oder fachliche Qualität freier Texte. Stilisierte Landschaft, Artenmodelle, Sichtungs- und Ressourcenregeln behalten ihre bisherigen Grenzen.

Der historische 900-Sekunden-Lauf unter Cloud-Softwaregrafik bleibt **FEHLGESCHLAGEN**. Dieser SCORM-Auftrag verlängert dessen Zeitgrenze nicht, entfernt keine ursprüngliche Assertion und etikettiert ihn nicht um. Der bestehende CI-Workflow bleibt unverändert; SCORM erhält zusätzliche eigene Pflichtprüfungen.

N15: Aktive C23-Lehrkräfteinformationen sind auf Tse et al. 2013, BPA und Zebrafischembryonen berichtigt. C17 unterscheidet weiterhin sechs Wochen Konditionierung, anschließenden thermischen Laichversuch und 3.380.000 Versuchseier von zwölf tatsächlich laichenden Weibchen aus 100 konditionierten Tieren; keine Jahresfekundität. Frühere Rechercheberichte werden nicht rückwirkend als erfolgreiche neue Quellenabrufe ausgegeben.
