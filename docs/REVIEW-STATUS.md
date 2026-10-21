# Prüfstatus

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
| F01 | P0 | `interaction-scenarios.js`: `pairSighting` als Abschluss | Entdeckung erhalten, Untersuchung separat belegen | Paarfund ohne Ereignis; gültiges Ereignis; Replay | offen |
| F02 | P0 | `field-ecology.js`, Szenarien: Taxon statt Pflanze | stabile Pflanzen-/Patch-Identität und Fokusreset | falsche Pflanze/Habitat/Gruppe, Pause, Wiederaufnahme | offen |
| F03 | P1 | `quest-learning.js`, `quest-interface.js`: alle Fundorte | lokaler Lernabschluss, Fachhilfe jederzeit, keine Scheinautorschaft | 1 von 196; Hilfe vor Abschluss | offen |
| F04 | P1 | `plant-forms.js`, `expedition-state.js`: Form als Nektartrait | artspezifische Ressourcen | Mohn/Holunder ohne floralen Nektar | offen |
| F05 | P1 | 168 Taxoneinträge/Katalog/Fotos | Strukturprüfung separat von Fachvalidierung | IDs, Einheiten, Habitate, Medien, Quellen; Fokustaxa | offen |
| M1–3 | P1 | noch keine vollständigen Kernmissionen | im bestehenden Feldbuch ergänzen | richtige/falsche/unvollständige/unsichere Antworten in UI | offen |
| S01 | P0 | Speicherfehler werden verschluckt | sichtbarer Fehler, versionierter Import, Migration | Quota, beschädigte Datei, Altstand, kein Teilimport | offen |
| B01 | P1 | Build verfolgt statische `from`-Imports | vollständige Referenz-/Hashprüfung | fehlende Datei und manipuliertes Paket müssen scheitern | offen |
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
