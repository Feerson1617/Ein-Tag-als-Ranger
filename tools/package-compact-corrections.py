"""Build a local review package from executed, hash-bound correction evidence."""
from pathlib import Path
import json,hashlib,html,shutil,subprocess,zipfile,re,sys
root=Path(__file__).resolve().parents[1];load=lambda p:json.loads(p.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
subprocess.run([sys.executable,str(root/'tools/package-compact-review.py')],cwd=root,check=True)
out=root/'outputs/Ranger-Kompakt-Abnahme';feeding=root/'work/qa-correction/final-feeding';habitat=root/'work/qa-correction/final-habitats';f=load(feeding/'result.json');h=load(habitat/'result.json');base=root/'verification/kompakt-korrektur/baseline';info=load(out/'build-info.json')
assert f['passed']and len(f['sequences'])==4 and all(s['passed']and len(s['captures'])==7 for s in f['sequences'])
assert h['passed']and not h['errors']
assert f['runtimeSourceHashes']==h['runtimeSourceHashes']==info['runtimeSourceHashes']
for name,digest in info['runtimeSourceHashes'].items():assert sha(root/'dist'/name)==digest,name
proof=out/'Korrekturen';proof.mkdir();cards=[]
# Bind this exact delivered file, retaining the original tested hashes. Only a
# provenance stamp may differ after documentation/evidence-only commits.
delivered_html=(root/'outputs/Ranger-Kompakt.html').read_text();matches=[]
delivery_stamp=re.search(r'<meta name="compact-build" content="([^"]+)">',delivered_html)[1]
assert load(root/'work/compact-browser/standalone-result.json')['buildStamp']==delivery_stamp,'Fresh standalone smoke must match this delivered build stamp'
for dirty in ['false','true']:
 stamp='<meta name="compact-build" content="'+f['sourceCommit']+'; dirty='+dirty+'">'
 recreated=re.sub(r'<meta name="compact-build" content="[^"]+">',stamp,delivered_html)
 if hashlib.sha256(recreated.encode()).hexdigest()==f['htmlSHA256']:matches.append(dirty)
assert len(matches)==1,'Delivered HTML differs beyond its provenance stamp from the actual feeding-tested file'
delivery_binding={'deliverySourceCommit':info['sourceCommit'],'deliveryHTMLSHA256':sha(root/'outputs/Ranger-Kompakt.html'),'testedFeedingHTMLSHA256':f['htmlSHA256'],'testedFeedingCommit':f['sourceCommit'],'testedFeedingDirtyStamp':matches[0],'identicalExceptProvenanceMetaTag':True,'runtimeSourceHashes':info['runtimeSourceHashes'],'scope':'Original feeding report unchanged; replacing only the delivery build provenance stamp exactly reconstructs the originally tested HTML. Final delivery has its own fresh browser smoke.'}
(proof/'delivery-html-equivalence.json').write_text(json.dumps(delivery_binding,ensure_ascii=False,indent=2)+'\n')
for source,folder,result in [(feeding,'Nahrungssuche',f),(habitat,'Landschaft',h)]:
 dest=proof/folder;dest.mkdir();shutil.copyfile(source/'result.json',dest/'result.json')
 captures=[c for s in result['sequences']for c in s['captures']]if folder=='Nahrungssuche'else result['captures']
 for item in captures:
  name=item['file'];assert Path(name).name==name
  if 'sha256'in item:assert sha(source/name)==item['sha256'],name
  shutil.copyfile(source/name,dest/name)
 if(source/'index.html').exists():shutil.copyfile(source/'index.html',dest/'index.html')
 if folder=='Nahrungssuche':
  cards.append('<h2>Vier vollständige Nahrungserwerbsfolgen</h2><p>Vorhandene Modelltiere in ausdrücklich sichtbaren Zeitschritten, keine eigenen Sichtungsbelege. Jede Folge zeigt dieselbe konkrete Beute. Keine biologische Endabnahme oder Echtzeit-FPS-Zertifizierung.</p><a href="Korrekturen/Nahrungssuche/index.html">28 unveränderte echte WebGL-Aufnahmen und Phasen lesen</a>')
# Own cameras only. Do not mislabel them as the unavailable independent report.
before=proof/'Vorher';before.mkdir()
pairs=[]
for name in ['start','woodruff','nettle','wood','village','ramp','salt-shrub','salt-segments','salt-grass','coast']:
 shutil.copyfile(base/(name+'.png'),before/(name+'.png'))
 pairs.append('<figure><figcaption>'+html.escape(name)+' · eigene gesicherte Vergleichskamera; neue Augenhöhe folgt dem Gelände</figcaption><div class="pair"><img loading="lazy" src="Korrekturen/Vorher/'+name+'.png" alt="Eigener Ausgangsstand"><img loading="lazy" src="Korrekturen/Landschaft/'+name+'.png" alt="Überarbeitung"></div></figure>')
shutil.copyfile(base/'browser-baseline.json',before/'browser-baseline.json')
for source,name in [(root/'docs/kompakt/KORREKTUREN.md','KORREKTUREN.md'),(root/'docs/kompakt/TESTS.md','TESTS.md'),(root/'docs/kompakt/QUELLEN-KORREKTUR.json','QUELLEN-KORREKTUR.json'),(root/'work/final-qa/runtime-freeze.json','runtime-freeze.json'),(root/'work/final-qa/html-equivalence.json','html-equivalence.json'),(root/'work/final-qa/environment.json','environment.json')]:
 shutil.copyfile(source,proof/name)
for name in ['flooding-all-taxa.csv','flooding-report.md','visual-review.json','pdf-audit.json','coastal-frequency.csv','coastal-frequency.md']:
 shutil.copyfile(root/'work/final-qa'/name,proof/name)
summary=root/'verification/kompakt-korrektur/final/SUMMARY.json'
assert summary.exists(),'Collect the complete executed final plan before packaging'
shutil.copyfile(summary,proof/'SUMMARY.json')
assert load(summary)['runtimeFreeze']['sourceHashes']==info['runtimeSourceHashes']
for source,folder in [(summary.parent,'Prueflogs'),(root/'verification/kompakt-korrektur/phase5-attempt1','Fehlversuch-Abtastung'),(root/'verification/kompakt-korrektur/phase5-gallery-attempt','Fehlversuch-Galerie'),(root/'verification/kompakt-korrektur/phase5-window-gap','Fehlversuch-Fensterpruefung'),(root/'verification/kompakt-korrektur/phase5-stability-attempt','Fehlversuch-Dauerlauf'),(root/'verification/kompakt-korrektur/phase5-stability-postcheck-attempt','Fehlversuch-Dauerlauf-Abschluss'),(root/'verification/kompakt-korrektur/phase5-legacy800-attempt','Fehlversuch-Legacy800'),(root/'verification/kompakt-korrektur/phase5-legacy600-attempt','Fehlversuch-Legacy600'),(root/'verification/kompakt-korrektur/phase5-legacy-single-attempt','Fehlversuch-Legacy-Einzeldatei')]:
 for file in sorted(source.rglob('*')):
  if file.is_file()and(file.suffix in ['.json','.log','.txt','.csv','.md']or folder!='Prueflogs'and file.suffix=='.png'):
   dest=proof/folder/file.relative_to(source);dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(file,dest)
def report_html(text):
 parts=[];table=False;code=False
 for line in text.splitlines():
  if line.startswith(chr(96)*3):
   if table:parts.append('</tbody></table></div>');table=False
   parts.append('</pre>'if code else'<pre>');code=not code;continue
  if code:parts.append(html.escape(line)+'\n');continue
  if line.startswith('|'):
   cells=[c.strip()for c in line.strip().strip('|').split('|')]
   if all(re.fullmatch(r':?-+:?',c)for c in cells):continue
   if not table:
    parts.append('<div class="table-scroll"><table><thead><tr>'+''.join('<th>'+html.escape(c)+'</th>'for c in cells)+'</tr></thead><tbody>');table=True
   else:parts.append('<tr>'+''.join('<td>'+html.escape(c)+'</td>'for c in cells)+'</tr>')
   continue
  if table:parts.append('</tbody></table></div>');table=False
  if line.startswith('#'):
   level=min(6,len(line)-len(line.lstrip('#')));parts.append('<h'+str(level)+'>'+html.escape(line[level:].strip())+'</h'+str(level)+'>')
  elif line:parts.append('<p>'+html.escape(line)+'</p>')
 if table:parts.append('</tbody></table></div>')
 return ''.join(parts)
report=(root/'docs/kompakt/KORREKTUREN.md').read_text()
(proof/'Pruefbericht.html').write_text('<!doctype html><html lang="de"><meta charset="utf-8"><title>Korrekturprüfung</title><style>body{font:15px/1.6 system-ui;max-width:1400px;margin:30px auto;padding:20px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}table{border-collapse:collapse;width:100%;font-size:12px}td,th{border:1px solid #a4b0a8;padding:8px;text-align:left;vertical-align:top}.table-scroll{overflow:auto}</style><body><p>Jeder Status bezieht sich auf die im Bericht genannte ausgeführte Prüfung.</p>'+report_html(report)+'</body></html>')
page=(out/'index.html').read_text();extra='<section><h2>Korrekturbericht und Grenzen</h2><p><a href="Korrekturen/Pruefbericht.html">Prüfbericht F01–F13</a> · <a href="Korrekturen/SUMMARY.json">Ausgeführte Prüfungen</a> · <a href="Korrekturen/delivery-html-equivalence.json">Bindung der Auslieferungsdatei an die getestete HTML</a></p><p>Eigene Reproduktionen; das unabhängige QA-Archiv war nicht lesbar. Physisches iPad 9/Safari/iPadOS 27, unabhängige biologische/visuelle Endabnahme und Unterrichtswirkung bleiben ungeprüft.</p>'+''.join(cards)+'<h2>Eigene Vorher-/Nachherkameras</h2><p>XZ, Blickwinkel und Viewport sind gleich; die Augenhöhe folgt dem geänderten Boden. Die unbekannten Originalkameras des unabhängigen Berichts werden nicht behauptet.</p>'+''.join(pairs)+'</section>'
page=page.replace('</style>','.pair{display:grid;grid-template-columns:1fr 1fr;gap:10px}.pair img{width:100%}</style>',1)
page=page.replace('</body>',extra+'</body>')if'</body>'in page else page.replace('</html>',extra+'</html>')
page=page.replace('vollständige Softwarevorschau','Korrekturfassung zur Prüfung')
(out/'index.html').write_text(page)
info['correctionProof']={'feedingSpecies':4,'feedingRawImages':28,'landscapeImages':len(h['captures']),'independentOriginalArchiveRead':False,'identicalRuntimeSources':True,'runtimeFreeze':load(proof/'runtime-freeze.json'),'htmlEquivalence':delivery_binding,'originalCleanFeedingProof':load(proof/'html-equivalence.json'),'limits':['No physical iPad/Safari test','No independent biological/visual final acceptance','No classroom learning-effect proof']}
(out/'build-info.json').write_text(json.dumps(info,ensure_ascii=False,indent=2)+'\n')
(out/'FILE-SHA256.json').write_text(json.dumps({str(p.relative_to(out)):sha(p)for p in sorted(out.rglob('*'))if p.is_file()and p.name!='FILE-SHA256.json'},indent=2)+'\n')
with zipfile.ZipFile(root/'outputs/Ranger-Kompakt-Abnahme.zip','w',zipfile.ZIP_DEFLATED,compresslevel=7)as z:
 for p in sorted(out.rglob('*')):
  if p.is_file():z.write(p,p.relative_to(out))
with zipfile.ZipFile(root/'outputs/Ranger-Kompakt-Abnahme.zip')as z:
 assert z.testzip()is None
 for name,digest in load(out/'FILE-SHA256.json').items():assert hashlib.sha256(z.read(name)).hexdigest()==digest,name
print(json.dumps({'zipBytes':(root/'outputs/Ranger-Kompakt-Abnahme.zip').stat().st_size,'feeding':4,'actualUneditedFeedingImages':28,'ownBeforeAfterPairs':10,'verified':True}))
