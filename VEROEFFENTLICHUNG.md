# Feldbuch über GitHub Pages und Jimdo veröffentlichen

Version 0.20 · vorbereitet am 9. Oktober 2026. Das Paket ist fertig zum Hochladen; es wurde noch nicht in einem GitHub-Konto veröffentlicht.

## GitHub Pages

1. Das Paket `Feldbuch-GitHub-Pages.zip` entpacken.
2. Bei GitHub ein **öffentliches** Repository anlegen, zum Beispiel `feldbuch`. GitHub Free unterstützt Pages für öffentliche Repositories.
3. Den **Inhalt** des entpackten Ordners hochladen: `index.html`, `Feldbuch.html`, `icon.svg`, `assets`, `web`, `README.md` und `.nojekyll`. Die `index.html` muss direkt im Repository liegen. Den ZIP-Ordner selbst nicht hochladen. Am bequemsten funktioniert das über **GitHub Desktop**: das Repository klonen, Paketinhalt in den Repositoryordner kopieren, Änderungen speichern und hochladen. Über die GitHub-Weboberfläche gilt **maximal 100 Dateien pro Upload**: zuerst die Hauptdateien und den Ordner `web` hochladen. Dann über **Add file → Create new file** eine Datei `assets/.keep` anlegen und speichern; so entsteht der Ordner `assets`. Diesen öffnen und die Material-/Fotodateien in mehreren Gruppen mit höchstens 100 Dateien über **Add file → Upload files** hochladen. Die Dateien müssen direkt in `assets` landen, ohne einen zusätzlichen Unterordner gleichen Namens.
4. Unter **Settings → Pages → Build and deployment** die Quelle **Deploy from a branch** wählen. Den verwendeten Hauptzweig, normalerweise `main`, und **/(root)** auswählen, dann speichern.
5. Nach erfolgreicher Bereitstellung zeigt GitHub die Spieladresse an: `https://DEIN-NAME.github.io/DEIN-REPOSITORY/`. Diese tatsächliche Adresse kopieren.
6. Die Spieladresse direkt auf dem Tablet öffnen, Freie Erkundung starten und Fernglas, Lupe, Questbuch und Wattprobe ausprobieren. Für die Tablet-Nutzung ist Querformat angenehm. Die Vollbildschaltfläche ist oben neben der Darstellung.

Die Webfassung besteht aus kleinen Einzeldaten mit eindeutig benannten Versionen. Der Browser kann diese wiederverwenden. Alle Spielmaterialien liegen im eigenen Repository; die 168 Artenfotos werden erst beim Eintrag abgerufen, Vogelaufnahmen erst nach Einschalten. Quellen und Lizenzen bleiben am Foto und in `assets/SPECIES-PHOTOS.txt` / `assets/BIRD-RECORDINGS.txt` erhalten.

**Nicht die große Einzel-HTML über die GitHub-Weboberfläche hochladen.** Diese ist für die Weitergabe als eine Datei gedacht und überschreitet das dortige Limit von 25 MiB je Datei. Im Pages-Paket ist jede Datei kleiner als dieses Limit.

## Jimdo Creator

Auf der gewünschten Seite ein **Widget/HTML** einfügen. Im folgenden Beispiel beide Adressen durch die tatsächliche GitHub-Pages-Adresse ersetzen:

```html
<div style="max-width:1100px;margin:0 auto;">
  <p><a href="https://DEIN-NAME.github.io/DEIN-REPOSITORY/" target="_blank" rel="noopener" style="display:inline-block;padding:14px 22px;background:#244c37;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">Feldbuch im großen Fenster starten ↗</a></p>
  <iframe
    src="https://DEIN-NAME.github.io/DEIN-REPOSITORY/"
    title="Feldbuch – ökologische Expedition"
    width="100%" height="720"
    style="display:block;width:100%;height:min(82vh,820px);min-height:480px;border:0;border-radius:10px;background:#213b32;"
    loading="lazy"
    allow="fullscreen; autoplay"
    allowfullscreen>
  </iframe>
</div>
```

Die Einbettung ist möglich, wenn dein Creator-Editor das Widget/HTML anbietet. Auf Tablets bietet der darüberliegende Startlink den meisten Platz und verhindert, dass das Jimdo-Seitenlayout mit der Spielsteuerung konkurriert. In der eingebetteten Ansicht steht zusätzlich unter ⚙ ein Link zum eigenen Fenster bereit. Vollbild hängt vom Browser und seiner Freigabe ab. Das Spiel startet Ton erst nach ausdrücklichem Antippen.

## Jimdo Website Builder / Dolphin

Dieser Editor unterstützt laut Jimdo keinen eigenen HTML-Code und keine iFrames. Einen normalen Button **„Feldbuch spielen“** hinzufügen und als Ziel die GitHub-Pages-Adresse eintragen. Das Spiel öffnet sich dann direkt im Browser. Falls du die Jimdo-Version nicht kennst: Ein verfügbares Widget/HTML deutet auf Creator hin; sonst nutze den Startbutton.

## Darstellung und Leistung

- **Automatisch** strebt 30 FPS an und nutzt freie Leistung für höhere Schärfe. Es senkt die Auflösung nicht unter den bisherigen Maßstab bis 1,35-fach. Vegetation, Tiermodelle und Simulation behalten ihre Inhalte.
- **Hohe Schärfe** nutzt bis 2,5-fache Darstellung und 2048er Schatten. Bei hoher Last wird nur die zusätzliche Schärfe zurückgenommen, mindestens auf den bisherigen Maßstab. Für kräftige Geräte.
- **Flüssigere Bewegung** strebt bis 60 FPS an. Die Auflösung darf dafür bis zum einfachen Bildschirmmaßstab sinken. Dieser Modus ist eine bewusste Wahl zwischen Bildschärfe und Bewegung.

Die Auswahl findet sich auf der Startseite unter „Darstellung und Steuerung“ sowie während der Erkundung unter ⚙. Die Bildrate ist ein Ziel und keine Garantie; Prozessor, Grafikleistung, Browser, Auflösung und Temperatur bestimmen das Ergebnis. GitHub Pages liefert Dateien, rechnet aber die 3D-Welt nicht für das Tablet.

Das Feldbuch wird lokal im Browser gespeichert. Eine eingebettete Ansicht und ein eigener Tab können wegen der Browserregeln getrennte Speicher führen. Mit dem Feldbuch-Download lassen sich Funde sichern. Es gibt keinen Server für gemeinsame Spielstände und keine Konten. Das Grundspiel funktioniert ohne externes Tracking. GitHub und Jimdo verarbeiten ihre üblichen Hosting-Zugriffsdaten; beim Klick auf Quellen verlässt man das Spiel.

## Größere und realistischere Spielassets

Für Schüler bleibt eine Browserfassung mit normalem Weblink die passende Auslieferung. HTML bildet den Einstieg, JavaScript und WebGL zeichnen die Welt. Zusätzliche Dateiformate ergänzen diese Webfassung:

- **GLB / glTF**: räumliche Tier- und Pflanzenmodelle mit Materialien, Skeletten und Animationen. Geeignet für fachlich korrekte Anatomie und ausgearbeitete Bewegungen. Die derzeitige Fassung erstellt ihre Spielmodelle noch prozedural; echte ausgearbeitete GLB-Modelle wären der nächste Ausbau.
- **KTX2**: Texturen in einem GPU-freundlichen Format. Geeignete Kompression spart auch Grafikspeicher. Die jetzigen verlustfreien WebP-Materialien sparen Übertragungsgröße; auf der GPU werden sie wie normale Bilder entpackt. KTX2 ist in dieser Version noch nicht eingebaut.
- **Nachladen nach Lebensraum**: größere Assets dürfen auf dem Server liegen, während das Tablet nur die aktuell benötigten Modelle und Detailstufen bereithält. Artenfotos und Ton werden bereits bei Bedarf geladen; aufwendige 3D-Modelle könnten als nächster Schritt entsprechend organisiert werden.

Ein anderes Engine-Exportformat erhöht den Realismus nicht automatisch. Er entsteht durch genaue Anatomie, Materialien, Animationen und Beleuchtung sowie zum Gerät passende Detailstufen. Für die GitHub-/Jimdo-Kombination empfehle ich die aufgeteilte Webfassung. GLB und KTX2 sind ergänzende Assetformate, keine Datei, die Schüler separat öffnen müssen. Eine Installation ist für diese Fassung nicht nötig. Für die beständige Tablet-Nutzung dient WebGL als Grundlage; neuere Grafikwege wie WebGPU können später bei passender Geräteunterstützung ergänzen.

Quellen: [glTF und GLB, Materialien, Skelette und Animationen](https://www.khronos.org/gltf/), [KTX und GPU-komprimierte Texturen](https://www.khronos.org/ktx/), [WebGL im Browser](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API).

## Später aktualisieren

Das neue Pages-Paket als vollständigen Stand hochladen; `index.html` immer mit aktualisieren. Die neuen Dateinamen verhindern eine Mischung neuer und alter Spieldaten. Veraltete Dateien mit alten Hashnamen können anschließend entfernt werden. Gespeicherte Feldbuchfunde bleiben unter derselben Spieladresse im normalen Browser erhalten. `.nojekyll` ist für einen reinen statischen Build gedacht; wenn die Weboberfläche die versteckte Datei nicht übernimmt, enthalten die übrigen Pfade keine speziellen Jekyll-Unterstrichordner.

## Geprüfte Anbieterinformationen

- [GitHub Pages: statische Dateien, Verfügbarkeit mit GitHub Free](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [GitHub Pages: maximal 1 GB veröffentlichte Website, weiche Grenze 100 GB Datenverkehr pro Monat](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [GitHub: Webupload maximal 25 MiB je Datei, Repositorydateien maximal 100 MiB](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)
- [GitHub: maximal 100 Dateien gleichzeitig im Webupload](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)
- [Jimdo Creator: eigener Code und Widget/HTML](https://help.jimdo.com/hc/de/articles/115005505763-Wie-f%C3%BCge-ich-eigenen-Code-ein)
- [Jimdo Website Builder: kein eigener Code und keine iFrames](https://help.jimdo-dolphin.com/hc/en-us/articles/26931604070044-Adding-custom-code-or-external-widgets-in-Jimdo-Website-Builder)

Anbieterregeln geprüft am 9. Oktober 2026. Reales Hosting, Jimdo-Einbettung und ein physisches Tablet müssen nach dem Upload an der endgültigen Adresse geprüft werden.
