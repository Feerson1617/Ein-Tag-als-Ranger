"""Local complete preview, bound to actual browser evidence and identical sources."""
from pathlib import Path
import hashlib,html,json,shutil,subprocess,zipfile
root=Path(__file__).resolve().parents[1];reference=root/'work/compact-browser';learning=root/'work/compact-learning';result=json.loads((reference/'result.json').read_text());standalone=json.loads((reference/'standalone-result.json').read_text());learn=json.loads((learning/'result.json').read_text());stability=json.loads((root/'work/compact-stability/result.json').read_text())
for r,minimum in [(result,18),(standalone,5),(learn,17)]:assert not r.get('failure')and not r['errors']and len(r['checks'])>=minimum,'Successful full browser evidence required'
assert learn.get('completedAt'),'Completed learning browser run required'
assert stability['passed']and stability['actualElapsedSeconds']>=1200 and not stability['errors'],'20-minute cloud run required'
assert standalone['runtimeSourceHashes']==result['runtimeSourceHashes']==learn['runtimeSourceHashes']==stability['runtimeSourceHashes'],'Tested runtime sources differ'
assert result.get('captures')and len(result.get('videos',[]))==2,'Actual synchronized images and two videos required'
assert len([r for r in learn['captures']if r.get('taxon')])==37,'36 taxa and caterpillar renders required'
sha=lambda b:hashlib.sha256(b).hexdigest()
for name,digest in result['runtimeSourceHashes'].items():assert sha((root/'dist'/name).read_bytes())==digest,'Runtime changed since browser check: '+name
out=root/'outputs/Ranger-Kompakt-Abnahme'
if out.exists():shutil.rmtree(out)
out.mkdir(parents=True);items=[];cards=[];clips=[]
for source,folder,records in [(reference,'reference',result['captures']+standalone['captures']+result['videos']),(learning,'learning',learn['captures'])]:
 target=out/folder;target.mkdir()
 for r in records:
  name=r['file'];assert Path(name).name==name;data=(source/name).read_bytes();assert sha(data)==r['sha256'],name;(target/name).write_bytes(data);relative=folder+'/'+name;items.append({**r,'file':relative});title=r.get('taxon')or name
  if name.endswith('.webm'):
   portable=Path(name).with_suffix('.mp4').name
   if shutil.which('ffmpeg'):
    subprocess.run(['ffmpeg','-nostdin','-v','error','-i',str(target/name),'-c:v','libx264','-preset','fast','-crf','22','-fps_mode','vfr','-pix_fmt','yuv420p','-movflags','+faststart',str(target/portable)],check=True);items.append({'file':folder+'/'+portable,'sha256':sha((target/portable).read_bytes()),'source':relative,'operation':'H.264 compatibility copy; original variable timestamps, no speed change'});relative=folder+'/'+portable
   clips.append(f'<figure><video controls preload="metadata" src="{html.escape(relative)}"></video><figcaption>{html.escape(name)} · tatsächliche Canvas-Aufzeichnung</figcaption></figure>')
  else:cards.append(f'<figure><img loading="lazy" src="{html.escape(relative)}" alt="{html.escape(title)}"><figcaption>{html.escape(title)}</figcaption></figure>')
for source,names,folder in [(reference,['result.json','standalone-result.json','earned-fieldbook.json'],'reference'),(learning,['result.json','earned-all-families.json','downloaded-fieldbook.json','readable-report.txt','quota-recovered-draft.json'],'learning')]:
 for name in names:shutil.copyfile(source/name,out/folder/name)
shutil.copytree(root/'outputs/Ranger-Kompakt-Lernpaket',out/'Lernpaket')
shutil.copyfile(root/'work/compact-stability/result.json',out/'cloud-stability.json');shutil.copyfile(root/'outputs/Ranger-Kompakt.html',out/'Ranger-Kompakt.html')
commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip();info={'sourceCommit':commit,'sourceDirty':bool(subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True).strip()),'browserTestSourceCommit':result['sourceCommit'],'identicalRuntimeSources':True,'runtimeSourceHashes':result['runtimeSourceHashes'],'browser':result['browserVersion'],'buildManifest':json.loads((root/'outputs/Ranger-Kompakt/build-manifest.json').read_text()),'media':items,'scope':'Complete software preview; user authorized continued phases and final push. Draft only; no merge/deployment/release. Real iPad 9/Safari/iPadOS 27, biology review and classroom pilot unverified.'}
(out/'build-info.json').write_text(json.dumps(info,ensure_ascii=False,indent=2)+'\n')
page=f'''<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ranger Kompakt: vollständige Softwarevorschau</title><style>body{{margin:30px auto;padding:0 20px;max-width:1250px;background:#eee8d6;color:#263c32;font:17px/1.55 Georgia}}h1,h2{{font-weight:400}}a{{color:#345d45}}.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px}}figure{{margin:0}}img,video{{width:100%;height:auto}}figcaption,small{{font:13px/1.6 system-ui}}</style><h1>Ranger Kompakt · vollständige Softwarevorschau</h1><p>36 aktive Einträge, sechs Funktionsgruppen, fünf Lernfamilien und 25 Unterrichtskarten. Tatsächliche unveränderte Renderbilder und erworbene Lernprodukte liegen im Paket.</p><p><a href="Ranger-Kompakt.html">Lokale Einzeldatei öffnen</a> · <a href="Lernpaket/Arbeitsblaetter.pdf">Arbeitsblätter</a> · <a href="Lernpaket/Lehrkraefte.pdf">Lehrkräfte</a> · <a href="build-info.json">Quell-/Medienhashes</a> · <a href="learning/result.json">Lernprüfung</a> · <a href="cloud-stability.json">Cloudstabilität</a></p><p><small>Paketstand {html.escape(commit)}. {len(result['checks'])} Referenz-, {len(standalone['checks'])} Einzeldatei- und {len(learn['checks'])} Lernblöcke. Alle Runtimequellen per SHA256 identisch. Keine tatsächliche iPad-/Safari-/iPadOS-27-Prüfung, biologische Endabnahme oder Unterrichtserprobung. Cloudsoftwaregrafik ist kein Mindestgerätebenchmark.</small></p><h2>Tatsächliche Bewegungssequenzen</h2><div class="grid">{''.join(clips)}</div><h2>Unveränderte Renderbilder</h2><div class="grid">{''.join(cards)}</div><p>Weiterarbeit und Push ausdrücklich beauftragt. Draft-PR; kein Merge, Deployment oder öffentlicher Release.</p></html>'''
(out/'index.html').write_text(page)
with zipfile.ZipFile(root/'outputs/Ranger-Kompakt-Abnahme.zip','w',zipfile.ZIP_DEFLATED,compresslevel=7)as z:
 for path in sorted(out.rglob('*')):
  if path.is_file():z.write(path,path.relative_to(out))
print(json.dumps({'sourceCommit':commit,'identicalRuntimeSources':True,'images':len(cards),'videos':len(clips),'zipBytes':(root/'outputs/Ranger-Kompakt-Abnahme.zip').stat().st_size}))
