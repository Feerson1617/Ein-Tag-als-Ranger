"""Package the new review round locally; never merge, deploy or publish."""
from pathlib import Path
import argparse,hashlib,html,json,re,shutil,subprocess,sys,zipfile
p=argparse.ArgumentParser();p.add_argument('--evidence',default='verification/kompakt-endqa-20261023/final');a=p.parse_args()
root=Path(__file__).resolve().parents[1];proof=root/a.evidence;load=lambda p:json.loads(p.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
summary=load(proof/'SUMMARY.json');freeze=summary['runtimeFreeze'];manifest=load(proof/'SHA256.json')
for name,digest in manifest.items():assert sha(proof/name)==digest,'Changed sealed evidence: '+name
for name,digest in freeze['sourceHashes'].items():assert sha(root/'dist'/name)==digest,'Runtime changed: '+name
subprocess.run([sys.executable,str(root/'tools/package-compact-review.py')],cwd=root,check=True)
out=root/'outputs/Ranger-Kompakt-Abnahme';shutil.copytree(proof,out/'Nachbesserung-2026-10-23')
for name in ['STATUS.md','TESTS.md','KORREKTUREN.md','QUELLEN-2026-10-23.md']:
 shutil.copyfile(root/'docs/kompakt'/name,out/name)
delivery=(root/'outputs/Ranger-Kompakt.html').read_text();stamp=re.search(r'<meta name="compact-build" content="([^"]+)">',delivery)[1]
smoke=load(root/'work/compact-browser/standalone-result.json');assert smoke['buildStamp']==stamp and smoke['runtimeSourceHashes']==freeze['sourceHashes']
bindings={}
for name in ['arrival','feeding','growth']:
 tested=load(proof/name/'result.json');assert tested['passed'];matches=[]
 for dirty in ['false','true']:
  original_stamp=f'<meta name="compact-build" content="{tested["sourceCommit"]}; dirty={dirty}">'
  recreated=re.sub(r'<meta name="compact-build" content="[^"]+">',original_stamp,delivery)
  if hashlib.sha256(recreated.encode()).hexdigest()==tested['htmlSHA256']:matches.append(dirty)
 assert len(matches)==1,'Delivery differs beyond provenance metadata from '+name
 bindings[name]={'testedCommit':tested['sourceCommit'],'testedHTMLSHA256':tested['htmlSHA256'],'testedDirtyStamp':matches[0],'identicalExceptProvenanceMetaTag':True}
info=load(out/'build-info.json');info['endQA']={'summary':'Nachbesserung-2026-10-23/SUMMARY.json','deliveredHTMLSHA256':sha(root/'outputs/Ranger-Kompakt.html'),'deliveredBuildStamp':stamp,'bindings':bindings,'runtimeFreeze':freeze,'physicalDeviceAndClassroomTested':False}
(out/'build-info.json').write_text(json.dumps(info,ensure_ascii=False,indent=2)+'\n')
arrival=load(proof/'arrival/result.json');gallery=[]
for n,sequence in enumerate(arrival['sequences'],1):
 gallery.append('<h3>'+html.escape(sequence['id'])+' · '+('Echtzeit'if sequence['realtime']else'beschriftete Modellschritte')+'</h3><div class="grid">'+''.join('<figure><img loading="lazy" src="arrival/'+html.escape(c['file'])+'"><figcaption>'+html.escape(c['phase'])+'</figcaption></figure>'for c in sequence['captures'])+'</div>')
page='''<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nachbesserung 23.10.2026</title><style>body{font:16px/1.5 system-ui;max-width:1300px;margin:30px auto;padding:20px;background:#eee8d6;color:#263c32}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px}figure{margin:0}img,video{width:100%}a{color:#345d45}</style><h1>Neue Nachbesserungsprüfung</h1><p>Eigene frische Belege: vollständiger Weg über normale Eingaben, am erreichten Ort ausdrücklich begonnene endliche Beobachtungsfenster, getrennte Rundgangherkunft und acht Nahrungssuchfolgen. Der lange Wiederholungsfall enthält 1200 ausdrücklich gesteuerte Modellsekunden; er gilt nicht als 20 Minuten eigener K1-Arbeit.</p><p><a href="SUMMARY.json">Ausgeführte Prüfungen und Grenzen</a> · <a href="SHA256.json">Rohdatei-Hashes</a> · <a href="../KORREKTUREN.md">Status F01–F13/N01–N04</a> · <a href="../QUELLEN-2026-10-23.md">Quellenabgleich</a></p><p>Physisches iPad 9/Safari/iPadOS 27, unabhängige biologische/visuelle Endabnahme und Unterrichtspilot bleiben ungeprüft. Keine Veröffentlichung oder Freigabe durch dieses lokale Paket.</p>'''
if arrival.get('video'):page+='<h2>Unbeschleunigte tatsächliche Nahrungssuchfolge</h2><video controls preload="metadata" src="arrival/'+html.escape(arrival['video']['file'])+'"></video><p>Das Rohvideo zeigt die erste Nahrungssuchfolge als tatsächliche Canvasaufnahme in Echtzeit. Wegtelemetrie und Bilder dokumentieren die normale Bedienung separat. Die weiteren Folgen verwenden ausdrücklich beschriftete Modellschritte.</p>'
page+=''.join(gallery)+'</html>';(out/'Nachbesserung-2026-10-23/index.html').write_text(page)
index=(out/'index.html').read_text();index=index.replace('<h1>','<p><a href="Nachbesserung-2026-10-23/index.html">Neue Nachbesserungsbelege vom 23.10.2026 öffnen</a></p><h1>',1);(out/'index.html').write_text(index)
(out/'FILE-SHA256.json').write_text(json.dumps({str(p.relative_to(out)):sha(p)for p in sorted(out.rglob('*'))if p.is_file()and p.name!='FILE-SHA256.json'},indent=2)+'\n')
archive=root/'outputs/Ranger-Kompakt-Abnahme.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=7)as z:
 for p in sorted(out.rglob('*')):
  if p.is_file():z.write(p,p.relative_to(out))
with zipfile.ZipFile(archive)as z:
 assert z.testzip()is None
 for name,digest in load(out/'FILE-SHA256.json').items():assert hashlib.sha256(z.read(name)).hexdigest()==digest,name
print(json.dumps({'verified':True,'bytes':archive.stat().st_size,'deliveredHTMLSHA256':info['endQA']['deliveredHTMLSHA256'],'newSequences':len(arrival['sequences'])}))
