"""Package original graphics evidence and an offline comparison reader.
Does not assign visual verdicts: those must be written in the reviewed matrix.
"""
from pathlib import Path
import argparse,hashlib,html,json,shutil,zipfile
p=argparse.ArgumentParser();p.add_argument('--source',default='work/visual');a=p.parse_args();root=Path(__file__).resolve().parents[1];source=root/a.source;out=root/'outputs/Ranger-Kompakt-Grafiknachweise';
if out.exists():shutil.rmtree(out)
out.mkdir(parents=True,exist_ok=True)
groups=['world-before','world-optimized','gallery-before','gallery-final','ragworm-before','extras-before','extras-final','feeding','animal-video','learning-final','imports','ui','stability','arrival','profile-before','profile-baseline-final','profile-after','profile-before-optimization','node-final','walk-supplement','fauna-world','embedded-fault','offline-final','offline-file-policy-block','offline-contrast-settling-failure','scorm-failed-context','held-click']
for group in groups:
 src=source/group
 if not src.exists():continue
 dst=out/group;dst.mkdir(exist_ok=True)
 for f in src.rglob('*'):
  if f.is_file()and f.suffix in ['.png','.webm','.json','.html','.md']and not f.name.endswith('-cpu.json'):
   target=dst/f.relative_to(src);target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(f,target)
historical={'QA-INITIAL.json','QA-RUN.json','pr-before.json','shader-failure-before-fix.json','superseded-actions.json'}
for f in source.iterdir():
 if f.is_file()and f.suffix in ['.json','.log']:
  target=out/'historisch'if f.name in historical else out;target.mkdir(exist_ok=True);shutil.copy2(f,target/f.name)
for f in (root/'docs/kompakt/grafik').iterdir():
 if f.is_file():shutil.copy2(f,out/f.name)
def read(group):
 f=source/group/'result.json';return json.loads(f.read_text())if f.exists()else{}
def picture(group,file,caption):
 if not(out/group/file).is_file():raise ValueError('Missing original image '+group+'/'+file)
 return '<figure><a href="'+html.escape(group+'/'+file)+'"><img loading="lazy" src="'+html.escape(group+'/'+file)+'" alt="'+html.escape(caption)+'"></a><figcaption>'+html.escape(caption)+'</figcaption></figure>'
worldnotes=json.loads((root/'docs/kompakt/grafik/WELT-QUALITAET.json').read_text());matrix=json.loads((root/'docs/kompakt/grafik/TAXON-QUALITAET.json').read_text());before=read('ragworm-before').get('captures',[])+read('gallery-before').get('captures',[]);after=read('gallery-final').get('captures',[])
body=['<h1>Ranger Kompakt · Grafiknachweise</h1><p>Originalbilder aus der tatsächlichen Simulation. Bilder anklicken, um die unveränderte Originaldatei zu öffnen. Die Modellnahansichten zeigen dieselben aktiven Individuen, keine separaten Ersatzmodelle. Die Qualitätsurteile sind begrenzte visuelle Abnahmen, keine Naturbestimmungs- oder Gerätefreigabe.</p><nav><a href="#welt">Weltvergleich</a> · <a href="#arten">Artenmatrix</a> · <a href="#video">Bewegung</a> · <a href="#tests">Prüfbelege</a> · <a href="ABSCHLUSS.md">Vollständiger Abschlussbericht</a></nav><h2 id="welt">Alle fünf Raumabschnitte</h2><p>14 feste Perspektiven plus ergänzende Deich-/Nahrungsansicht. Sonnenlicht, Jahresfenster und Seed stimmen überein. In den freien Weltaufnahmen laufen Tiere und Tide weiter; exakte Zeitgleichheit wird nur für die separat kontrollierte Nahrungsszene behauptet.</p>']
delivery=json.loads((source/'LIEFERUNG.json').read_text())
body.insert(2,'<p><strong>Finaler Commit:</strong> <code>'+html.escape(delivery['sourceCommit'])+'</code> · <a href="LIEFERUNG.json">Dateigrößen, Hashes und Downloadprüfung</a> · <a href="'+html.escape(delivery['scorm']['artifactURL'])+'">Geprüfte SCORM-ZIP bei GitHub Actions</a></p>')
for row in worldnotes:
 body.append('<article><h3>'+html.escape(row['name'])+'</h3><p><strong>'+html.escape(row['status'])+'</strong> · '+html.escape(row['assessment'])+'</p><div class="pair">'+picture(row['beforeGroup'],row['file'],'Vorher · '+row['name'])+picture(row['afterGroup'],row['file'],'Nachher · '+row['name'])+'</div><p class="muted">'+html.escape(row['limits'])+'</p></article>')
body.append('<h2 id="arten">36 Taxa und zusätzliche Stadien</h2><p>Die Matrix unterscheidet ausdrücklich neue Geometrie, reine Materialänderungen und erhaltene Animationen. Sehr kleine Tiere sind in der normalen Weltaufnahme teils unter Pixelgröße. Eine Detailansicht ist kein Beleg für Fernsichtbarkeit.</p>')
for row in matrix:
 taxon=row['taxon'];stage=row['stage'];new=next((x for x in after if x['taxon']==taxon and (x['stage']==stage or stage=='adult / vorhandenes Katalogstadium' and x['stage']not in ['caterpillar','juvenile'])),None)
 if not new:raise ValueError('Missing final capture '+taxon+' '+stage)
 old=next((x for x in before if x['taxon']==taxon and x['stage']==new['stage']),None)
 if not old:raise ValueError('Missing baseline capture '+taxon+' '+stage)
 oldgroup='ragworm-before'if taxon=='hediste_diversicolor'else'gallery-before'
 body.append('<article><h3>'+html.escape(row['name'])+'</h3><p><strong>'+html.escape(row['status'])+'</strong> · '+html.escape(row['statusScope'])+'</p><dl>'+''.join('<dt>'+label+'</dt><dd>'+html.escape(row[key])+'</dd>'for label,key in [('Vorher','before'),('Implementiert','implemented'),('Diagnostik','diagnostics'),('Geometrie / Material','changed'),('Animation','animation'),('Grenzen','limits'),('Realismusziel','realismGoal')])+'</dl><div class="pair">'+picture(oldgroup,old['world'],'Vorher · Weltkontext')+picture('gallery-final',new['world'],'Nachher · Weltkontext')+picture(oldgroup,old['detail'],'Vorher · tatsächliches Individuum')+picture('gallery-final',new['detail'],'Nachher · tatsächliches Individuum')+'</div><p class="muted">'+html.escape(new['individual'])+' · '+html.escape(new['stage'])+' · '+html.escape(new['window'])+' · Modellzeit '+str(new['modelTime'])+' s. Original-Hashes in gallery-final/result.json.</p></article>')
body.append('<h2>Tatsächlich begangener Hauptweg</h2><p>Originalbilder während normaler Tastatur-/Mausbewegung. Das Grenzbild deich.png entstand noch bei x=0,61 m vor der Deichzone; tatsächliche Zonenquerung und Endpunkt werden anhand der Positionsprotokolle separat geprüft.</p>')
for row in read('walk-supplement').get('captures',[]):body.append(picture('walk-supplement',row['file'],'Rundgang · '+row['file']))
body.append('<h2>Ergänzende Weltansichten</h2>')
for row in read('fauna-world').get('captures',[]):body.append(picture('fauna-world',row['file'],row['taxon']+' · tatsächlicher Weltmaßstab'))
body.append('<h2 id="video">Echte Bewegungsaufnahmen</h2><p>Die vier Küstenvögel werden mit den offen beschrifteten Modellschritten geprüft. Ihre Originalvideos erhalten diese Pausen; sie sind keine Echtzeit- oder FPS-Nachweise. Weitere Aufnahmen dokumentieren unbeschleunigte Runtime-Bewegung mit separater Modellzeit.</p>')
for group in ['feeding','animal-video','extras-final','arrival']:
 for f in sorted((out/group).glob('*.webm')):
  body.append('<figure><video controls preload="none" src="'+group+'/'+f.name+'"></video><figcaption>'+html.escape(group+' / '+f.name)+'</figcaption></figure>')
body.append('<p><a href="feeding/index.html">Alle vier Nahrungsvorgänge mit Phasenbildern und konkreten Beute-/Ereignis-IDs</a></p><h2 id="tests">Prüfbelege und unveränderte Originaldateien</h2><p>Status und Grenzen stehen im Abschlussbericht. Ein vorhandenes Ergebnisdokument ist für sich noch kein bestandener Test.</p><ul>')
for f in sorted(out.rglob('*.json')):body.append('<li><a href="'+f.relative_to(out).as_posix()+'">'+html.escape(f.relative_to(out).as_posix())+'</a></li>')
body.append('</ul>')
(out/'index.html').write_text('<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ranger Kompakt · Originalnachweise</title><style>body{font:17px/1.55 system-ui;background:#f3f0e4;color:#263b31;max-width:1300px;margin:auto;padding:28px}h1,h2,h3{font-family:Georgia,serif}h1{font-size:2.5em}h2{border-top:1px solid #aaa;padding-top:24px;margin-top:50px}a{color:#285d4b}nav{padding:15px;background:#e0e6da}article{padding:15px 0 25px;border-bottom:1px solid #cbcbbd}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}figure{margin:0 0 18px}img,video{width:100%;height:auto;border-radius:5px}dt{font-weight:700}dd{margin:0 0 8px}.muted,figcaption{font-size:.88em;color:#4d594e}@media(max-width:720px){.pair{grid-template-columns:1fr}body{padding:16px}}</style>'+''.join(body))
manifest={p.relative_to(out).as_posix():hashlib.sha256(p.read_bytes()).hexdigest()for p in out.rglob('*')if p.is_file()and p.name!='EVIDENCE-MANIFEST.json'};(out/'EVIDENCE-MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n');zpath=out.with_suffix('.zip')
with zipfile.ZipFile(zpath,'w',zipfile.ZIP_DEFLATED,compresslevel=6)as z:
 for f in sorted(out.rglob('*')):
  if f.is_file():z.write(f,f.relative_to(out).as_posix())
with zipfile.ZipFile(zpath)as z:assert z.testzip()is None
print(json.dumps({'output':str(zpath),'bytes':zpath.stat().st_size,'sha256':hashlib.sha256(zpath.read_bytes()).hexdigest(),'files':len(manifest)+1}))
