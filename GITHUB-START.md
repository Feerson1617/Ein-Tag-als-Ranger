# Feldbuch – Start mit GitHub und Codex Cloud

Dieses Repository enthält das vollständige Projekt der Spielversion 0.20.

## Einstieg
- `dist/index.html` ist der aktive Startpunkt; die Startlogik liegt in `dist/expedition.js`.
- Der Entwicklungsstand besteht bereits aus statischen Dateien. `npm install` ist für den Spielstart **nicht** erforderlich. `package.json` enthält derzeit keine Build- oder Testskripte.
- Lokal mit einem HTTP-Server testen, z. B. `python3 -m http.server 8000 --directory dist` und danach `http://localhost:8000` im Browser öffnen (nicht per `file://`).
- Mit `python3 tools/run-checks.py` die Node.js-Prüfungen ausführen. Dafür muss `node` installiert sein.

## Spätere Veröffentlichung
- Das GitHub-Pages-Paket mit `python3 tools/build-web.py` erzeugen. Ergebnis: `outputs/Feldbuch-GitHub-Pages.zip` beziehungsweise `outputs/GitHub-Pages/`.
- Das erzeugte Paket ist ein Website-Export, **nicht** der vollständige Entwicklungsstand; die Inhalte von `outputs/GitHub-Pages/` können separat für GitHub Pages bereitgestellt werden.
- `python3 tools/verify-web.py` prüft das erzeugte Paket. Für die Texturprüfung ist Pillow erforderlich.
- Bei einem Entwicklungsrepository mit dem aktiven Spiel in `dist/` ist GitHub Pages nicht ohne Weiteres über *Deploy from a branch → /(root)* konfigurierbar. Eine spätere GitHub-Actions-Bereitstellung aus `dist/` oder aus `outputs/GitHub-Pages/` kann Codex ergänzen.

## Projektorganisation
- `AGENTS.md` enthält verbindliche Regeln für Codex; `HANDOFF.md` und `README.md` erläutern den Stand.
- Die drei curricularen PDFs liegen außerhalb dieses Repositorys und sollten bei Bedarf als gesonderte Referenzen eingebracht werden; vor einer öffentlichen Veröffentlichung die Lizenzen aller Medien prüfen.
- Vorerst keine automatische Veröffentlichung anlegen: erst fachliche und technische Überprüfung, dann explizite Freigabe.

## Minimale Änderungen an der ursprünglichen ZIP
- `.gitignore` hinzugefügt, um generierte Webseiten und Prüfausgaben nicht versehentlich zu committen.
- `tools/verify-web.py` erkennt nun zusätzlich den im ZIP tatsächlich vorhandenen Ordner `dist/`.
- Diese Startanleitung ergänzt. Der Spielcode wurde nicht geändert.
