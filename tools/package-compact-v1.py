"""Assemble exactly one local V1 candidate from executed QA and own review.

No GitHub release, upload, deployment or status conversion. Reports must already
exist. Private browser profiles and third-party paper fulltexts are excluded.
"""
from pathlib import Path
import argparse, hashlib, json, shutil, subprocess, zipfile

p = argparse.ArgumentParser(description=__doc__)
p.add_argument('--qa', required=True)
p.add_argument('--review', required=True, help='Own signed-off scope/findings JSON, not generated PASS claims')
p.add_argument('--report', required=True, help='Completed ABSCHLUSS.md')
p.add_argument('--output', required=True)
a = p.parse_args()
root = Path(__file__).resolve().parents[1]
qa, review_path, report_path, out = [root / x for x in (a.qa, a.review, a.report, a.output)]
load = lambda f: json.loads(f.read_text())
sha = lambda f: hashlib.sha256(f.read_bytes()).hexdigest()
r, freeze, review = load(qa / 'result.json'), load(qa / 'runtime-freeze.json'), load(review_path)
assert r['complete'], 'Finish the declared plan first, retaining failed processes'
assert r['sourceCommit'] == freeze['sourceCommit'] == review['sourceCommit']
assert review['htmlSHA256'] == freeze['htmlSHA256'] == sha(root / 'outputs/Ranger-Kompakt.html')
assert review['status'] in ('RC lieferbar', 'konkrete Blockade')
assert review['status'] != 'RC lieferbar' or r['softwareGatesPassed']
expected = [f'F{i:02}' for i in range(1, 14)] + [f'N{i:02}' for i in range(1, 9)]
assert [row['id'] for row in review['matrix']] == expected
for row in review['matrix']:
    assert row['status'] in ('BESTANDEN', 'FEHLGESCHLAGEN', 'NICHT GEPRÜFT')
    for field in ('dateUTC', 'sourceCommit', 'evidenceKind', 'scope', 'finding', 'historical'):
        assert row[field], (row['id'], field)
    assert row['sourceCommit'] == freeze['sourceCommit']
for name, digest in freeze['runtimeSourceHashes'].items():
    assert sha(root / 'dist' / name) == digest, name
assert sha(root / 'outputs/Ranger-Kompakt/build-manifest.json') == freeze['webManifestSHA256']
assert sha(root / 'outputs/Ranger-Kompakt-Lernpaket/build-info.json') == freeze['lessonBuildInfoSHA256']
candidate = 'ranger-kompakt-v1.0.0-rc.1-' + freeze['sourceCommit'][:12]
assert candidate in report_path.read_text() and freeze['htmlSHA256'] in report_path.read_text()
out.mkdir(parents=True, exist_ok=False)

def copy(source, target):
    dest = out / target
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, dest)

copy(report_path, 'ABSCHLUSS.md')
copy(review_path, 'PRUEFMATRIX-UND-SICHTPRUEFUNG.json')
copy(root / 'docs/ABSCHLUSSVERTRAG-V1.md', 'ABSCHLUSSVERTRAG-V1.md')
copy(root / 'docs/kompakt/GERAETE-UND-PILOT-V1.md', 'GERAETE-UND-PILOT-V1.md')
copy(root / 'docs/kompakt/QUELLEN-V1.md', 'QUELLEN-V1.md')
copy(root / 'outputs/Ranger-Kompakt.html', 'Ranger-Kompakt.html')
shutil.copytree(root / 'outputs/Ranger-Kompakt', out / 'Webpaket')
shutil.copytree(root / 'outputs/Ranger-Kompakt-Lernpaket', out / 'Lernpaket')
# Text evidence only. Explicitly reject all private Chrome profile descendants.
for file in sorted(qa.rglob('*')):
    if not file.is_file() or any('private' in part.lower() for part in file.relative_to(qa).parts):
        continue
    if file.suffix.lower() in ('.json', '.log', '.txt', '.csv', '.md'):
        copy(file, Path('Nachweise') / file.relative_to(qa))
# Every image here must have been selected by an actual review, with its hash.
for item in review['selectedEvidence']:
    source = root / item['source']
    assert sha(source) == item['sha256'], item['source']
    target = Path(item['target'])
    assert not target.is_absolute() and '..' not in target.parts
    copy(source, target)
# Portable drivers/fixtures preserve repository-relative paths. Original pinned
# fixtures remain original; these files are not represented as newly earned work.
tracked = subprocess.check_output(['git', 'ls-files', '-z'], cwd=root).decode().split('\0')
for name in filter(None, tracked):
    file = root / name
    if name.startswith(('tools/', 'tests/')) or (name.startswith('verification/') and file.suffix in ('.json', '.log', '.txt', '.csv', '.md')):
        if file.is_file(): copy(file, Path('Reproduktion') / name)
# Use this checkout or the separately updated Feldbuch-Projekt.zip to rerun GPU
# tests. The handoff intentionally avoids duplicating all historical media.
(out / 'Reproduktion/README.md').write_text(
    '# Reproduktion\n\nGeprüfter Produktstand: `' + freeze['sourceCommit'] + '`. '
    'Die beigelegten QA-Treiber enthalten die anschließend geprüften Korrekturen '
    'für den echten Quelleinstieg und pausierte WebGL-Aufnahmen; die Runtime ist bytegleich. '
    'Die genaue Build-/QA-Provenienz und Startbefehle stehen in '
    '[START-REPRODUKTION.md](START-REPRODUKTION.md). '
    'Treiber und Originalfixtures behalten ihre Repo-Pfade. Im zugeordneten '
    'Git-Checkout oder Feldbuch-Projekt.zip die relative Struktur erhalten. '
    'Node, Python mit Playwright/Pillow, Chromium und Poppler bereitstellen; '
    '`python tools/check-compact-v1.py --output work/neuer-v1-lauf` ausführen. '
    'Keine Entwickler-Homepfade notwendig; PLAYWRIGHT_BROWSERS_PATH nur bei Bedarf '
    'auf die lokale Installation setzen. GPU-Prozesse seriell ausführen. '
    'Der ursprüngliche 900-s-Treiber wird unverändert ausgeführt; ein neuer Fehler '
    'wird weiterhin als Fehler gemeldet. Historische Ergebnisse bleiben erhalten.\n')
metadata = {'candidate': candidate, 'status': review['status'], 'sourceCommit': freeze['sourceCommit'],
            'runtimeTreeSHA256': hashlib.sha256(json.dumps(freeze['runtimeSourceHashes'], sort_keys=True, separators=(',', ':')).encode()).hexdigest(),
            'htmlSHA256': freeze['htmlSHA256'], 'softwareGatesPassed': r['softwareGatesPassed'],
            'allProcessesPassed': r['allProcessesPassed'], 'physicalDeviceAndPilot': 'NICHT GEPRÜFT',
            'publication': 'Not merged, deployed or published', 'scope': 'One local review candidate; historical failures remain failures.'}
(out / 'KANDIDAT.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + '\n')
manifest = {str(f.relative_to(out)): {'bytes': f.stat().st_size, 'sha256': sha(f)} for f in sorted(out.rglob('*')) if f.is_file()}
(out / 'SHA256.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
archive = out.parent / (out.name + '.zip')
assert not archive.exists()
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED, compresslevel=7) as z:
    for file in sorted(out.rglob('*')):
        if file.is_file(): z.write(file, file.relative_to(out))
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    for name, item in manifest.items(): assert hashlib.sha256(z.read(name)).hexdigest() == item['sha256'], name
print(json.dumps({**metadata, 'zip': str(archive.relative_to(root)), 'bytes': archive.stat().st_size, 'sha256': sha(archive), 'verifiedFiles': len(manifest)}, ensure_ascii=False))
