# Stand der Kompaktvorschau

Ausgang: a6c5c8e (origin/main), neuer Branch feature/ranger-kompakt. Der bestehende große Stand ist erhalten. Phasen 0–2 in Bearbeitung; **keine visuelle/fachliche Eigentümerfreigabe und kein fertiger Release**.

- Phase 0: vier Eingangsdateien inventarisiert. 36 Planungsverträge und sechs Funktionsgruppen in ARTEN.md/compact/taxa.js; alle 25 Curriculumzeilen unverändert als Entwicklungsziele übernommen. Fehlend: separate Quellen-/Rechenbasisdatei, Original-PDFs, Nutzerbilder. Keine Originallektüre behauptet.
- Phase 1: separate begehbare Kompaktlandschaft, drei Biologiezonen, Dorf/Deichübergang, vier Schilder, vier Häuser, kurzer Rückweg. Exakte Maße werden aus layout.js gemessen. Keine acht alten Simulationen werden erzeugt.
- Phase 2: neun aktive Referenztaxa. Neuer lokaler Blender-Rehexport; eigener vegetativer Pflanzenaufbau; Specht mit Stammstützen, Start/Flug/Landung/Suche/Ruhe und Störungsreaktion. Beobachtungsbelege mit Individuen-ID, worldVersion, Seed, Rundgang, Modellzeit und aktiver Beobachtungszeit. Noch keine biologische Wechselwirkungsgutschrift.
- Speicherung: separater atomarer Einzelschlüssel; sichtbare Fehler; validierte Kompaktimporte, explizit bestätigte historische Archive ohne neue Gutschrift. Große Spielstände bleiben unangetastet.
- Phasen 3–6: nicht freigegeben. K1–K5/36 aktive Einträge, vollständige Unterrichtsmaterialien, Geräteabnahme und Pilot sind nicht fertiggestellt oder als bestanden bezeichnet.

Aktuelle Tests, Fehler und Bildnachweise: TESTS.md. Start: `python tools/build-compact.py`; anschließend outputs/Ranger-Kompakt lokal per HTTP öffnen oder outputs/Ranger-Kompakt.html direkt öffnen. Der Build veröffentlicht nichts. Die große Fassung bleibt unter dist/index.html und ihren bisherigen Paketnamen.
