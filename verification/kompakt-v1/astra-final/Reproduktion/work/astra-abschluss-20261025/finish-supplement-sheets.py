from pathlib import Path
import json,hashlib,math,shutil
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[2];base=Path(__file__).resolve().parent;q=base/'final-4eb186a'
r=json.loads((q/'supplement-result.json').read_text());assert len(r['checks'])==2 and all(x['passed']for x in r['checks'])
assert json.loads((q/'retry-run-status.json').read_text())['status']=='completed'
shutil.copyfile(q/'supplement-result.json',q/'supplement-before-feeding-sheets.json')
r['resumedAssembly']='Initial sheet assembly had no feeding result because the first video process failed before game-page startup (missing FFmpeg). Native UI and public audit had already passed. Sheet assembly resumed only after the unchanged separate retry completed; no UI results were rewritten.'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();data=json.loads((q/'v1-full-walk-feeding-retry/result.json').read_text());assert data['passed'];sheets=q/'feeding-sheets';sheets.mkdir();manifest=[]
for i,sequence in enumerate(data['sequences']):
 assert sequence['passed']and len(sequence['captures'])==7
 frames=[];images=[]
 for c in sequence['captures']:
  source=q/'v1-full-walk-feeding-retry'/c['file'];assert sha(source)==c['sha256'];assert c['phaseStableAcrossCapture']
  im=Image.open(source).convert('RGB');assert im.size==(1200,750),im.size
  assert max(hi-lo for lo,hi in im.getextrema())>8,'Invalid blank phase image'
  rects=[v['rect']for v in c['sample']['detail']['views']];box=(math.floor(min(v['x']for v in rects)),round(min(v['y']for v in rects)),math.ceil(max(v['x']+v['width']for v in rects)),round(max(v['y']+v['height']for v in rects)))
  crop=im.crop(box);frames.append((crop,c['phase'],c['sample']['time']));images.append({'file':str(source.relative_to(q)),'sha256':sha(source),'pixelCrop':box,'rescaled':False,'phase':c['phase'],'method':c['frameCapture']['method']})
 w=max(im.width for im,_,_ in frames);h=max(im.height for im,_,_ in frames)+28;sheet=Image.new('RGB',(2*w,4*h),'white');draw=ImageDraw.Draw(sheet)
 for j,(im,phase,t)in enumerate(frames):x=(j%2)*w;y=(j//2)*h;draw.text((x+5,y+5),f'{j+1}: {phase} | t={t:.3f}',fill='black');sheet.paste(im,(x,y+28))
 name=f'sequence-{i+1}-{sequence["id"]}.png';path=sheets/name;sheet.save(path);manifest.append({'file':str(path.relative_to(q)),'sha256':sha(path),'individualId':sequence['id'],'realtime':sequence['realtime'],'preyId':sequence['preyId'],'runId':sequence['captures'][0]['sample']['runId'],'eventId':sequence['captures'][0]['sample']['detail']['eventId'],'images':images,'scope':'Actual1:1nativepixel crops of current phased WebGL frames; no resizing, fabricated pose or visual acceptance claim. Own viewing required separately.'})
(sheets/'PROVENANCE.json').write_text(json.dumps(manifest,indent=2)+'\n');r.update(complete=True,passed=all(x['passed']for x in r['checks']),generatedContactSheets=len(manifest));(q/'supplement-result.json').write_text(json.dumps(r,indent=2)+'\n');print('COMPLETE',json.dumps(r),flush=True)
