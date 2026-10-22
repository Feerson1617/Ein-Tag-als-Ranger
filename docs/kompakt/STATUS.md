# Stand der Kompaktvorschau

22.10.2026: Softwarephasen 0–4 umgesetzt, automatische Phase-5-Prüfung abgeschlossen, commitgebundene lokale Pakete für Phase 6 erstellt. Der Eigentümer hat die Weiterarbeit ohne erneute Freigabefrage und den abschließenden Push ausdrücklich beauftragt. Draft-PR #3 bleibt Draft. Kein Merge, Deployment oder Release.

Ausgang: main a6c5c8e mit inzwischen vom Eigentümer gemergtem PR #1. Die große Fassung bleibt erhalten. Separater Einstieg dist/kompakt.html auf feature/ranger-kompakt. Aktiver Runtime-Prüfpunkt: `5be5e9b8f7394613279f5a2834741a0abf33b570`; Nachweise und spätere Paketstände gleichen alle Runtimequellen einzeln ab.

36 aktive kuratierte Einträge, sechs Funktionsgruppen, drei Biologiezonen, vier datierte Fenster und 14 konkrete Ressourcen-/Ereignisverträge. Fünf frei wählbare Lernfamilien mit strikter Belegprüfung, eA-Flächenproben/Nullfund, fünf berechenbare Datenmodelle und 25 nutzbare Unterrichtskarten. Speichermigration erhält Originaldaten ohne neue Abschlüsse; widersprüchliche oder falsch typisierte Importe ersetzen keine bestehenden Arbeiten. Arbeitsblätter und Lehrkräftefassung liegen als HTML/PDF vor, ergänzt um das vollständige Handbuch, Curriculum-/Quellen-/Parameterregister.

Abschluss-QA: 26 bisherige Node-Reihen, 14 Referenz- und 34 Lern-/Import-/Modellgruppen, 9 Python-Paketmethoden; 18 Referenz-, 5 Kompakt-Einzeldatei-, 17 neue Lern-, 14 bisherige Live-/UI- und 3 bisherige Einzeldatei-Browserblöcke erfolgreich. Die lokalen M1-/M2-Belege stammen aus den archivierten, später bei M3 fehlgeschlagenen Gesamtversuchen; der abschließende Legacy-Lauf prüft M3 separat. Separater Cloudstabilitätslauf: 1215.43 Sekunden. Details/Fehlversuche: TESTS.md und verification/kompakt-v2.

Offen: reales Apple iPad der 9. Generation, Safari, iPadOS 27, OS-/Gerätekompatibilität, biologische/visuelle Endabnahme und Unterrichtspilot. Das Cloud-30-FPS-Budget ist nicht erreicht; Cloudfunktionstests sind kein Mindestgerätebenchmark. Fehlende Original-PDFs und externe Datentabellen wurden nicht als gelesen/kalibriert ausgegeben. Vier Karten verlangen ausdrücklich ergänzende Quellenarbeit; die reale Exkursion bleibt außerhalb des Spiels.

Start: python tools/build-compact.py; anschließend outputs/Ranger-Kompakt per lokalem HTTP oder outputs/Ranger-Kompakt.html öffnen. Druckpaket: python tools/print-compact-materials.py. Die Pakete veröffentlichen nichts. Historische Phase-2-Nachweise bleiben unverändert in verification/kompakt; deren damalige Freigabe-/Pushsperre ist durch den Fortsetzungsauftrag überholt.
