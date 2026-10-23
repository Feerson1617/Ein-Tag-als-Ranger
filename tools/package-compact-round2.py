"""Seal source-bound round-2 QA, preserving failures and a small text/fixture handoff."""
from pathlib import Path
import argparse,hashlib,html,json,shutil,subprocess,zipfile
from compact_runtime import audit_standalone
from module_graph import ModuleGraph
p=argparse.ArgumentParser();p.add_argument('--plan',default='work/final-qa-round2');p.add_argument('--review',default='work/round2/FINAL-REVIEW.json');p.add_argument('--ci',default='work/round2/CI-RESULT.json');p.add_argument('--output',default='outputs/Ranger-Kompakt-Abnahme-Runde2');p.add_argument('--small',default='outputs/Ranger-Kompakt-Uebergabe-Runde2.zip');p.add_argument('--validate-only',action='store_true');a=p.parse_args();root=Path(__file__).resolve().parents[1]
load=lambda name:json.loads((root/name).read_text());sha=lambda path:hashlib.sha256(path.read_bytes()).hexdigest();commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip();assert not subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True).strip(),'Source must be clean'
plan=load(a.plan+'/result.json');freeze=load(a.plan+'/runtime-freeze.json');preflight=load(a.plan+'/preflight.json');review=load(a.review);ci=load(a.ci)
assert plan['sourceCommit']==freeze['runtimeCommit']==preflight['sourceCommit']==review['sourceCommit']==ci['head']==commit
assert plan['complete'] and preflight['complete'] and len(plan['checks'])==18,'The full original plan plus three explicit round-2 browser scenarios must have completed'
assert plan['arrivalPlan']['walkWallBudgetSeconds']==900,'The original traversal contract remains unchanged'
g=ModuleGraph(root/'dist','compact/main.js');hashes={n:sha(root/'dist'/n)for n in sorted(set(g.modules)|g.assets|{'kompakt.html','compact/style.css','icon.svg'})};assert hashes==freeze['sourceHashes']
standalone=audit_standalone(root,root/'outputs/Ranger-Kompakt.html');web=load('outputs/Ranger-Kompakt/build-manifest.json');materials=load('outputs/Ranger-Kompakt-Lernpaket/build-info.json');assert web['sourceCommit']==materials['sourceCommit']==commit and not web['sourceDirty'] and not materials['sourceDirty'];assert materials.get('print');assert f'<meta name="compact-build" content="{commit}; dirty=false">' in (root/'outputs/Ranger-Kompakt.html').read_text()
for directory in ['work/qa-correction/final-feeding','work/round2/final-detail-realtime','work/round2/final-event-integrity','work/round2/final-forest']:
 r=load(directory+'/result.json');assert r['sourceCommit']==commit and r['htmlSHA256']==standalone['htmlSHA256'],directory
 if 'runtimeSourceHashes'in r:assert r['runtimeSourceHashes']==hashes,directory
assert set(row['id']for row in review['results'])=={*(f'F{i:02}'for i in range(1,14)),*(f'N{i:02}'for i in range(1,8))}
assert all(row['status']in ['BESTANDEN','FEHLGESCHLAGEN','NICHT GEPRÜFT']for row in review['results'])
assert next(row for row in review['results']if row['id']=='F12')['status']=='NICHT GEPRÜFT'
# Visual acceptance must cite actually reviewed ORIGINAL files and exact hashes.
for capture in review['reviewedFiles']:
 path=root/capture['path'];assert path.is_file() and sha(path)==capture['sha256'],capture['path']
with zipfile.ZipFile(root/'outputs/Feldbuch-Projekt.zip')as z:
 source= json.loads(z.read('PROJECT-MANIFEST.json'));assert source['sourceCommit']==commit and not source['sourceDirty']
 assert source['files']['dist/compact/feeding-detail.js']==sha(root/'dist/compact/feeding-detail.js')
if a.validate_only:print(json.dumps({'validated':True,'sourceCommit':commit,'browserSteps':len(plan['checks'])}));raise SystemExit
out=root/a.output;assert not out.exists(),'Preserve previous package; select a new output';out.mkdir(parents=True)
def copy(source,destination):
 src=root/source;dest=out/destination;assert src.exists(),source;dest.parent.mkdir(parents=True,exist_ok=True)
 if src.is_dir():shutil.copytree(src,dest)
 else:shutil.copyfile(src,dest)
copy('work/round2/INPUT-REVIEW.json','EINGANGSDATEIEN.json');copy('work/round2/FAILED-ATTEMPTS.json','FEHLVERSUCHE.json');copy(a.plan,'Pruefplan');copy(a.review,'SICHTPRUEFUNG.json');copy(a.ci,'CI-RESULT.json');copy('verification/kompakt-runde2/original-fixtures','Originalfixtures');copy('verification/kompakt-runde2/baseline-forest','Vorher-Wald-1b51e7c');copy('docs/kompakt','Dokumentation');copy('outputs/Ranger-Kompakt.html','Ranger-Kompakt.html');copy('outputs/Ranger-Kompakt-Lernpaket','Lernpaket')
for folder in ['compact-regressions','compact-learning','compact-learning-standalone','compact-source','compact-browser','compact-stability','browser-chromium-subpath','browser-chromium']:
 copy('work/'+folder,'Aktuelle-Pruefungen/'+folder)
for name in ['final-feeding','final-arrival','final-growth','final-imports','final-habitats','final-habitat-revision','final-print','coastal-tests']:
 copy('work/qa-correction/'+name,'Aktuelle-Pruefungen/'+name)
for name in ['final-event-integrity','final-forest','final-detail-realtime','final-profile']:
 copy('work/round2/'+name,'Aktuelle-Pruefungen/'+name)
for row in preflight['checks']:copy(row['log'],'Vorpruefung-Logs/'+Path(row['log']).name)
for row in load('work/check-run.json')['results']:
 for name in [('final-check-output.txt' if row['check']=='field' else row['check']+'-check-output.txt'),row['check']+'-check-errors.txt']:copy('work/'+name,'Legacy-Node-Logs/'+name)
for name in ['check-run.json','v020-check-summary.json']:copy('work/'+name,'Legacy-Node-Logs/'+name)
for name in ['sources','n05-baseline-browser','n05-browser','n05-full-imports','expanded-original-imports-preflight','forest-before-attempt1','forest-current-draft','f02-detail-draft','f02-detail-zoom','profile-baseline','n06-linux','n06-linux-node24.21','original-ambiguous-import-preflight','original-ambiguous-import-attempt2','preflight-compact']:
 copy('work/round2/'+name,'Zwischenversuche/'+name)
for path in (root/'work/round2').glob('*.log'):copy(path.relative_to(root),'Zwischenversuche/Logs/'+path.name)
artifacts={}
for name in ['Ranger-Kompakt.html','Ranger-Kompakt-Lernpaket.zip','Feldbuch-Projekt.zip','Feldbuch.html']:
 path=root/'outputs'/name;artifacts[name]={'bytes':path.stat().st_size,'sha256':sha(path)}
summary={'sourceCommit':commit,'sourceDirty':False,'runtimeSourceHashes':hashes,'artifacts':artifacts,'browserPlan':plan,'preflight':preflight,'results':review['results'],'ci':ci,'scope':'Actual current-source HTML, media, worksheets and tests. Failures are retained. Supplemental traversal is not a 900-second/FPS/device pass. Structured form completion is not competence or teaching efficacy. No merge, release or deployment.'}
(out/'PRUEFMANIFEST.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
rows=''.join('<tr><td>'+html.escape(row['id'])+'</td><td>'+html.escape(row['status'])+'</td><td>'+html.escape(row['finding'])+'</td></tr>'for row in review['results'])
(out/'index.html').write_text('<!doctype html><html lang="de"><meta charset="utf-8"><title>Ranger Kompakt – Korrekturrunde 2</title><style>body{font:16px/1.5 system-ui;max-width:1100px;margin:30px auto;padding:20px;background:#f1ecda;color:#263c32}td,th{border:1px solid #81917a;padding:8px;vertical-align:top}table{border-collapse:collapse}a{color:#234d37}</style><h1>Korrekturrunde 2</h1><p>Quellstand '+commit+'. Draft-PR #3 bleibt offen; keine Veröffentlichung. Physisches iPad und Unterrichtspilot sind nicht geprüft. Die Matrix unterscheidet tatsächliche Teilabnahmen und offene Grenzen.</p><p><a href="Ranger-Kompakt.html">Aktuelle vollständige HTML</a> · <a href="PRUEFMANIFEST.json">Manifest / Rohstatus / Hashes</a> · <a href="SICHTPRUEFUNG.json">Eigene Sichtprüfung</a> · <a href="Lernpaket/Arbeitsblaetter.pdf">Neue Arbeitsblätter</a> · <a href="Lernpaket/Lehrkraefte.pdf">Neue Lehrkräftefassung</a> · <a href="Dokumentation/IPAD-UND-UNTERRICHTSPILOT.md">Geräte- und Pilotplan</a></p><table><thead><tr><th>Befund</th><th>Status</th><th>Reichweite</th></tr></thead><tbody>'+rows+'</tbody></table><p>Alle Originalmedien unter Aktuelle-Pruefungen, ältere Versionen und Fehlversuche ausdrücklich unter Zwischenversuche / Vorher-Wald. Originalfixtures bleiben bytegleich. Dateiübergreifende interne Konsistenz ist kein kryptografischer Echtheitsnachweis.</p></html>')
filehashes={str(p.relative_to(out)):sha(p)for p in sorted(out.rglob('*'))if p.is_file()};(out/'DATEI-SHA256.json').write_text(json.dumps(filehashes,indent=2)+'\n')
large=out.with_suffix('.zip');assert not large.exists()
with zipfile.ZipFile(large,'w',zipfile.ZIP_DEFLATED,compresslevel=6)as z:
 for p in sorted(out.rglob('*')):
  if p.is_file():z.write(p,p.relative_to(out))
with zipfile.ZipFile(large)as z:
 assert z.testzip()is None
 for name,digest in filehashes.items():assert hashlib.sha256(z.read(name)).hexdigest()==digest,name
summary['reviewArchive']={'name':large.name,'bytes':large.stat().st_size,'sha256':sha(large)}
(root/'outputs/Ranger-Kompakt-Abschluss-Runde2.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
small=root/a.small;assert not small.exists();small_files=[]
with zipfile.ZipFile(small,'w',zipfile.ZIP_DEFLATED,compresslevel=8)as z:
 for p in sorted(out.rglob('*')):
  if p.is_file()and p.suffix.lower()in ['.json','.md','.log','.txt']:
   z.write(p,p.relative_to(out));small_files.append(str(p.relative_to(out)))
 z.write(root/'outputs/Ranger-Kompakt-Abschluss-Runde2.json','ABSCHLUSS.json')
 z.writestr('LIESMICH.txt','Kleines Text-/Fixturepaket. Quelle, HTML und Originalmedien gehören zu '+commit+'. Vollständige aktuelle Bilder/Videos/PDFs/HTML liegen im großen Archiv '+large.name+'. Die Originaldateinamen/Hashes und alle negativen Status bleiben in den Berichten erhalten. Dies ist keine eigenständig erneut ausgeführte QA durch den Empfänger.\n')
with zipfile.ZipFile(small)as z:assert z.testzip()is None
assert small.stat().st_size<=16*1024*1024,'Text handoff unexpectedly large'
print(json.dumps({'sourceCommit':commit,'large':str(large),'largeBytes':large.stat().st_size,'small':str(small),'smallBytes':small.stat().st_size,'smallSHA256':sha(small),'files':len(filehashes)},indent=2))
