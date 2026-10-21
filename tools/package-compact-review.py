"""Local owner-review bundle, bound to actual renders and identical runtime sources."""
from pathlib import Path
import hashlib,html,json,shutil,subprocess,zipfile
root=Path(__file__).resolve().parents[1];evidence=root/'work/compact-browser';result=json.loads((evidence/'result.json').read_text());standalone=json.loads((evidence/'standalone-result.json').read_text())
assert not result.get('failure') and not result['errors'] and len(result['checks'])>=17,'Full compact browser run required'
assert not standalone.get('failure') and not standalone['errors'],'Standalone browser run required'
assert standalone['runtimeSourceHashes']==result['runtimeSourceHashes'],'Standalone sources differ'
assert result.get('captures') and len(result.get('videos',[]))==2,'Actual synchronized images and two videos required'
sha=lambda b:hashlib.sha256(b).hexdigest()
for name,digest in result['runtimeSourceHashes'].items():assert sha((root/'dist'/name).read_bytes())==digest,'Runtime changed since browser check: '+name
out=root/'outputs/Ranger-Kompakt-Abnahme'
if out.exists():shutil.rmtree(out)
out.mkdir(parents=True)
items=[]
for record in result['captures']+standalone['captures']+result['videos']:
 name=record['file'];assert Path(name).name==name
 source=evidence/name;data=source.read_bytes();assert sha(data)==record['sha256'],name
 (out/name).write_bytes(data);items.append(record)
# Optional portable copies preserve the recorded variable timestamps. Originals stay.
portable={}
if shutil.which('ffmpeg'):
 for record in result['videos']:
  name=record['file'];target=Path(name).with_suffix('.mp4').name
  subprocess.run(['ffmpeg','-nostdin','-v','error','-i',str(out/name),'-c:v','libx264','-preset','fast','-crf','22','-fps_mode','vfr','-pix_fmt','yuv420p','-movflags','+faststart',str(out/target)],check=True)
  portable[name]=target
  items.append({'file':target,'sha256':sha((out/target).read_bytes()),'bytes':(out/target).stat().st_size,'source':name,'operation':'ffmpeg H.264, variable timestamps preserved; no speed change'})
shutil.copyfile(root/'outputs/Ranger-Kompakt.html' ,out/'Ranger-Kompakt.html')
for name in ['result.json','standalone-result.json','earned-fieldbook.json']:shutil.copyfile(evidence/name,out/name)
manifest=json.loads((root/'outputs/Ranger-Kompakt/build-manifest.json').read_text());commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
info={'sourceCommit':commit,'browserTestSourceCommit':result['sourceCommit'],'identicalRuntimeSources':True,'runtimeSourceHashes':result['runtimeSourceHashes'],'browser':result['browserVersion'],'viewport':result['viewport'],'buildManifest':manifest,'media':items,'gate':'Phase 2; owner visual approval required before phase 3. No publication/merge authorized.'}
(out/'build-info.json').write_text(json.dumps(info,ensure_ascii=False,indent=2)+'\n')
titles={'01-waldstart':'Waldstart und Orientierung','02-deer-side':'Reh: Seite','03-deer-front':'Reh: vorn','04-deer-back':'Reh: hinten','05-bird':'Specht: Stammkontakt','06-woodruff':'Waldmeister: vegetativ','07-nettle':'Brennnessel: Saum','08-salt-shrub':'Keilmelde: Zwergstrauch','09-salt-segments':'Queller: Sprosse','10-salt-grass':'Schlickgras: Horste','11-ramp':'Deich: Rampe','12-coast':'Watt: Kurve und Priel','13-bird-flight':'Specht: tatsächlicher Flug','14-bird-landed':'Specht: tatsächliche Landung','15-deer-moving':'Reh: Bewegung','16-tablet':'Tabletprofil: Viewportprüfung'}
cards=[]
for record in [r for r in standalone['captures']if r.get('canvasOnly')]+result['captures']:
 stem=Path(record['file']).stem;title=titles.get(stem,stem.replace('unlabelled-','').replace('-', ' '));cards.append(f'<figure><img loading="lazy" src="{html.escape(record["file"])}" alt="{html.escape(title)}"><figcaption>{html.escape(title)} · FOV {html.escape(str(record.get("renderFov")))}°</figcaption></figure>')
clips=''.join(f'<figure><video controls preload="metadata" src="{html.escape(portable.get(r["file"],r["file"]))}"></video><figcaption>{html.escape(r["file"])} · unveränderte Canvas-Aufzeichnung</figcaption></figure>'for r in result['videos'])
page=f'''<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ranger Kompakt: visuelle Prüfung</title><style>body{{margin:30px auto;padding:0 20px;max-width:1250px;background:#eee8d6;color:#263c32;font:17px/1.55 Georgia}}h1,h2{{font-weight:400}}a{{color:#345d45}}.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px}}figure{{margin:0}}img,video{{width:100%;height:auto;border-radius:4px}}figcaption,small{{font:13px/1.6 system-ui}}.note{{padding:18px;border:1px solid #bbb49a}}</style><h1>Ranger Kompakt · Referenzabschnitt</h1><p>Phasen 0–2. Bitte beurteile Rehproportionen, Bewegung/Fußkontakt, Spechtstützen, Pflanzenhabitus, Wege und Gesamteindruck. Technische Prüfungen ersetzen diese visuelle und fachliche Freigabe nicht.</p><p><a href="Ranger-Kompakt.html">Die lokale Einzeldatei öffnen</a> · <a href="build-info.json">Commit, Prüfdaten und Medienhashes</a> · <a href="result.json">Browserprotokoll</a></p><div class="note"><small>Getestete Runtime: {html.escape(result['sourceCommit'])}<br>Dokumentations-/Paketstand: {html.escape(commit)}. Identische Runtimequellen einzeln per SHA256 geprüft.<br>{len(result['checks'])} Browserblöcke, {len(standalone['checks'])} Standaloneblöcke; Chromium {html.escape(result['browserVersion'])}. Softwaregrafik kann die Modellbewegung deutlich verlangsamen. Die Videos zeigen den tatsächlich gerenderten Lauf. Keine Mindestgeräte-, Safari-/iPad- oder Unterrichtszertifizierung.</small></div><h2>Bewegungssequenzen</h2><div class="grid">{clips}</div><h2>Unveränderte Renderbilder</h2><div class="grid">{''.join(cards)}</div><p>Vor Phase 3 verlangt der Masterprompt die visuelle Freigabe des Eigentümers. Kein öffentlicher Release, kein Deployment, kein Merge.</p></html>'''
(out/'index.html').write_text(page)
with zipfile.ZipFile(root/'outputs/Ranger-Kompakt-Abnahme.zip','w',zipfile.ZIP_DEFLATED,compresslevel=7)as z:
 for path in sorted(out.iterdir()):z.write(path,path.name)
print(json.dumps({'sourceCommit':commit,'testedRuntime':result['sourceCommit'],'identicalRuntimeSources':True,'images':len(result['captures']),'videos':len(result['videos']),'zipBytes':(root/'outputs/Ranger-Kompakt-Abnahme.zip').stat().st_size}))
