# CI und ausdrücklich freizugebendes Deployment

Die offizielle GitHub-Dokumentation „Using custom workflows with GitHub Pages“
wurde am 21.10.2026 aus dem offiziellen `github/docs`-Repository gelesen.
Sie verlangt das Pages-Artefakt, `needs: build`, `pages:write`, `id-token:write`
und eine Deploymentumgebung. Referenz:
https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

Die verwendeten Actions sind auf die am selben Tag mit `git ls-remote` aus den
offiziellen `actions/*`-Repositories ermittelten vollständigen Tag-SHAs gepinnt.
`ci.yml` besitzt nur `contents:read`; kein PR kann damit veröffentlichen.
`pages.yml` läuft ausschließlich per manuellem `workflow_dispatch` auf main.
Der Eingabewert muss ein vollständiger SHA auf main sein, die Freigabe lautet
ausdrücklich `VEROEFFENTLICHEN`. Alle Prüfungen und der Browserdurchlauf müssen
für diesen Commit bestehen. Der Deployjob erhält erst danach die minimalen
Pages-/OIDC-Rechte und ausschließlich das geprüfte Websiteartefakt.

Vor erstem Deployment durch den Eigentümer:

1. Releasebericht, Commit, Paket und offene Gerätegrenzen prüfen.
2. Erst nach ausdrücklicher Freigabe den PR prüfen/mergen; keine automatischen Merges.
3. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
4. Settings → Environments → `github-pages`: geeignete Review-/Branchregeln setzen.
5. Actions → Approved Ranger Pages release → Run workflow: main, freigegebener SHA,
   ausdrücklich bestätigte Freigabe. Erst dies veröffentlicht Code.

Vorgesehenes Ziel (noch keine Live-Erfolgsbehauptung):
`https://feerson1617.github.io/Ein-Tag-als-Ranger/`.
Nach Deployment frisches Profil: index, Module und Medien ohne 404/CORS/Mixed
Content, Freies Spiel, alle drei Missionen, Wiederaufnahme, Cache/Version unter
genau diesem Unterpfad prüfen. Erst dann „veröffentlicht und live geprüft“ melden.

Rollback: den letzten guten, vorher freigegebenen main-Commit über denselben
manuellen Workflow erneut testen und deployen. Gibt es noch keinen guten Release,
Deployment stoppen bzw. Pages deaktivieren; keinen ungeprüften Stand verwenden.
Kein Force-Push, keine Umbauten anderer Repositories, keine neuen Konten/Tokens.

Eine gespeicherte **Cloud-Umgebung** ist ein anderes Produktartefakt als die
Veröffentlichung des **Spiels auf GitHub Pages**. Die Umgebung zu speichern oder
zu veröffentlichen erteilt keine Pages-Freigabe.
