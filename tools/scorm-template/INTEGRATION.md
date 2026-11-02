# Herkunft und begrenzte Abweichungen

Quelle: https://github.com/Feerson1617/Interaktive-Lernmodelle-SKORM

Exakter Stand: `86006235258195cae76a6cfe33c0be58f4bd05d1`.
Maßgeblich ist der vollständige, maschinengeprüfte Commit in `provenance.json` (die Originaldateien liegen unter `upstream/`).

Die benötigten Skripte, Laufzeit, lokalen XSDs, Tests, Dokumentation und Lockdateien sind übernommen. Alle übernommenen Originaldateien sind zusätzlich unverändert mit SHA-256 inventarisiert. Beispiele entstehen nur in der ignorierten, separaten Prüfumgebung; keine Beispielmodelle im Ranger-Paket. Das ursprüngliche GitHub-Repository wird nicht geändert.

Am festgelegten Stand existiert keine allgemeine LICENSE-Datei. Der Eigentümer beauftragt ausdrücklich die Verwendung seiner Vorlage. Daraus wird keine zusätzliche offene Lizenz erfunden. `THIRD-PARTY-NOTICES.txt`, `schemas/sources.json` und Copyrighttexte der Schemata bleiben unverändert. Ranger behält eigene Quellen- und Assetnachweise.

Gezielte Abweichungen zur Kopie unter `upstream/`:

- `scripts/build.py`: geprüfte Konfigurationsfelder `trackingMode` und `allowOptionalLiterature`; frühe Kontextinjektion und zutreffende Datenrichtlinie im Paket. Manifest, XSD-Inventar, deterministisches ZIP und Originaldateihashes bleiben Verfahren der Vorlage.
- `runtime/session.js`, `runtime/entry.js`: explizites `ranger-session-only`. Nur Initialisieren, Beenden und technische Fehlerabfrage; auch Lifecycle-/bfcache-Wege rufen keine Daten- oder Commit-API. Ohne diese Konfiguration unveränderte Standardregel einschließlich `incomplete` und Commit.
- `scripts/validate.py`: optional nur ausdrücklich markierte HTTPS-Literaturanker mit `_blank`, `noopener noreferrer` erlauben. Externe Laufzeitressourcen bleiben verboten; Standardprofil bleibt streng.
- Neue `tests/ranger-session.test.js` und `tests/test_ranger.py`. Vorhandene Standardtests unverändert; deren Originalhashes sind nachprüfbar. Generische Beispiel-/Smoke-Browsertests laufen in der getrennten Referenzkopie. Ranger hat zusätzlich eigene Mock-LMS-Tests.

`../scorm/stage.mjs` ist ein Schüler-Staging aus dem tatsächlich erzeugten Ranger-Webbuild, kein zweiter SCORM-Exporter. Es bündelt die bestehende Modulgrundlage, entfernt Lehrkräfte-Datensätze und rendert ausschließlich allgemeine Schülerdokumente. Der eigene Speicheradapter bleibt eine tatsächlich geladene ES-Moduldatei. `../scorm/verify.py` ergänzt die vorhandene unabhängige ZIP-Validierung um Ranger-Verträge und prüft den Artefaktrückdownload bytegenau.
