# Ranger Kompakt: Phasen und Verträge

## Fortsetzungsauftrag vom 22.10.2026

Der Eigentümer hat ausdrücklich die Fortsetzung sämtlicher Phasen ohne weitere Freigabefrage und den abschließenden Push in den bestehenden Draft-PR #3 beauftragt. Das frühere visuelle Stoppgatter wird dadurch für die Weiterentwicklung aufgehoben. Fachliche Unsicherheiten, fehlende Originalquellen und nicht verfügbare reale Geräte-/Unterrichtsprüfungen bleiben als solche ausgewiesen. Kein Merge, öffentliches Deployment oder Release ist beauftragt.

Arbeitsfolge: (3) vollständiger kuratierter Bestand, Stützen, Ressourcen und Ereignisse; (4) K1–K5, sichere Migration, Datenmodelle und verwendbares Unterrichtspaket; (5) automatisierte Negativ-/Regressions-/Browser-/Paketprüfungen und tatsächliche Rendernachweise; (6) sauberes commitgebundenes Paket, aktualisierter Draft-PR und Push. Reale Hardwareabnahme und Unterrichtspilot können in dieser Cloud nicht ersetzt werden.

Auftrag: die vier am 21.10.2026 übergebenen Kompakt-Unterlagen. SHA256/Inventar in EINGANGSDATEIEN.json. Der Masterprompt fordert ausdrücklich Implementierung der Phasen 0–2 und danach eine visuelle Eigentümerfreigabe. Kein Merge, öffentliches Deployment oder Release autorisiert.

Ausgangsstand: frisch abgefragter origin/main a6c5c8e50c273895e5ca7667542f63d4e075c13b. Er enthält den vom Eigentümer inzwischen gemergten PR #1 mit Beobachtungsuhr und M3-Härtung (67b8d1c). Kein Zurücksetzen. Neuer Branch feature/ranger-kompakt. Die alte Fassung bleibt unter dist/index.html vollständig erhalten. Ein temporärer, benannter Git-Test-Worktree unter /tmp prüft ausschließlich diese Baseline; er ist kein zweites Repository/Spielprojekt und wird danach entfernt.

## Architektur

- Bestehendes Three.js, ES-Module und DOM; keine Engine-/Framework-Migration.
- Separater Einstieg dist/kompakt.html → compact/main.js, explizites Inhaltsmanifest, eigener Build. Die drei Biologiezonen sind Wald, Salzwiese und Watt. Dorf und Deich sind Übergänge, keine weiteren simulierten Gemeinschaften.
- Reine Zustands-/Layoutmodule besitzen IDs, Stützen, feste Pflanzen, Geschwindigkeiten und Gehfläche. Darstellung ändert keine Zählregeln. Renderprofile ändern nur Pixelzahl.
- Gemeinsam weiterverwendet: Three.js, unveränderte Beobachtungsuhr, Action-Mapping mit optionalem Profil, vorhandener GLB-Validierungsvertrag. Die bisherigen APIs/Standardwerte bleiben erhalten. Clock, GLB-Parser und die katalogunabhängige M3-Protokollprüfung werden aus ihren bisherigen Katalog-/Preloadmodulen isoliert, damit die Kompaktfassung keine 168-Taxa-/Sechs-GLB-Abhängigkeit erhält.
- Metereinheiten, +Y oben, Reh +X vorwärts. Specht im Ruhezustand nur an einer tatsächlich gerenderten, identifizierten Stammstütze. Spielerkollision und Tierzustände getrennt.
- Eigenes worldVersion und Speicherkey. Neue Rundgang-ID pro Start; Zahlengleichheit erzeugt keine Individuenkontinuität. Historische Feldbücher werden als unveränderte Datenarchive erhalten, einschließlich nichtaktiver Taxa und Antworten; keine neuen Missionserfolge daraus.

## Umfang und Gatter

0. Inventar, 36 Planungsverträge, sechs Funktionsgruppen, 25 Curriculumzeilen, Quellen-/Rechte- und Speicherplan; Baseline prüfen.
1. 160 × 100 m Kern, ca. 362 m Hauptweg, ca. 29 m direkte Dorfverbindung. Vier Schilder, vier Häuser, geschlossene Deichkrone, Priel. 1,6 m/s normal / 2,8 m/s zügig gerätegleich. Modellmaße, keine Küstenschutzplanung. Reine Gehzeit und tatsächliche Browserbewegung getrennt prüfen.
2. Kleiner Referenzabschnitt: neues aktives Reh-GLB, am Stamm gestützter Specht, vegetativer Waldmeister, Brennnesselsaum, eigener Keilmelde-/Queller-/Schlickgrasaufbau. Nah-/Seiten-/Front-/Rückansichten und Bewegungssequenz. **Danach Eigentümerfreigabe.**
3. Erst nach Freigabe restliche Taxa/Funktionsnetz, belegfähige Interaktionen, alle aktiven biologischen Rollen. Keine vorgezogene Massenintegration.
4. K1–K5, Untersuchungs-/Datenmodelle, Begleitunterricht und vollständige nutzbare Lehrmaterialien. 25 Matrixzeilen bis dahin ausdrücklich Ziele.
5. Geräteprüfung, mindestens 20 Minuten Stabilität, visuelle und fachliche Einzelabnahme sowie realer Unterrichtspilot. Mindestgerät bisher unbekannt; Cloud-Chromium bestätigt keine iPad-/Mac-Leistung oder Lernwirkung.
6. Commitgebundene lokale Vorschau; Merge/Deployment nur nach gesonderter konkreter Freigabe.

P0: falsche Beleggutschrift, Datenverlust, schwebende Pflichtmodelle, defekte Gehfläche, unvollständiger Build. P1: glaubwürdige Merkmale/Bewegung, Orientierung, Eingabegleichheit, transparente Grenzen. P2: zusätzliche Arten/komplexere Saisonen, jetzt gesperrt.
