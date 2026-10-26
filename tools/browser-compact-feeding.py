"""Four complete actual WebGL feeding sequences in shipped HTML, through UI only.
The visible model-step controls are intentionally used; this is a labelled model
observation, not newly earned active-sighting evidence or real-time FPS proof.
"""
from pathlib import Path
from compact_graphics_audit import observe_graphics_errors
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
from module_graph import ModuleGraph
from compact_runtime import audit_standalone
import argparse,base64,json,shutil,hashlib,subprocess,time,traceback,html
p=argparse.ArgumentParser();p.add_argument('--detail',action='store_true');p.add_argument('--entry',default='Ranger-Kompakt.html');p.add_argument('--site',default='outputs');p.add_argument('--output',default='work/qa-correction/feeding-browser');a=p.parse_args();root=Path(__file__).resolve().parents[1];out=root/a.output;out.mkdir(parents=True,exist_ok=True)
# Immutable authored prey positions select sampling cadence only. They never
# place animals, advance a hidden clock, create a resource or grant evidence.
inventory_code="import{identityInventory}from'./dist/compact/evidence.js';import{MANIFEST,MODEL_REVISION}from'./dist/compact/manifest.js';console.log(JSON.stringify([...identityInventory(MANIFEST.initialSeed,MODEL_REVISION).individuals.values()].map(p=>({id:p.id,x:p.x,z:p.z}))));"
initial_positions={p['id']:p for p in json.loads(subprocess.check_output(['node','--input-type=module','-e',inventory_code],cwd=root,text=True))}
audit_standalone(root,root/a.site/a.entry);g=ModuleGraph(root/'dist','compact/main.js');result={'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'htmlSHA256':hashlib.sha256((root/a.site/a.entry).read_bytes()).hexdigest(),'runtimeSourceHashes':{n:hashlib.sha256((root/'dist'/n).read_bytes()).hexdigest()for n in sorted(set(g.modules)|g.assets|{'kompakt.html','compact/style.css','icon.svg'})},'scope':'Actual WebGL in shipped standalone HTML; normal UI model-time steps, following camera. No state/clock/evidence injection. Not natural animation certification or FPS benchmark.','browser':None,'sequences':[],'errors':[],'passed':False}
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(root/a.site)));Thread(target=server.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{server.server_port}/{a.entry}'
def save():(out/'result.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
def sample(page,id):
 d=page.locator('#world').evaluate('(c)=>({time:Number(c.dataset.simulationTime),observer:JSON.parse(c.dataset.observer),actors:JSON.parse(c.dataset.coastal),events:JSON.parse(c.dataset.coastalEvents),runId:c.dataset.runId,modelObservation:c.dataset.modelObservation,ownSeconds:Number(c.dataset.observationSeconds),renderRevision:c.dataset.renderRevision,sceneRevision:c.dataset.sceneRevision,visibility:JSON.parse(c.dataset.behaviorVisibility||"null"),detail:JSON.parse(c.dataset.feedingDetail||"null")})');d['actor']=next(a for a in d.pop('actors')if a['id']==id);return d
def tick(page,size):page.locator('#behavior-step-size').select_option(str(size));page.locator('#behavior-step').click();page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision')
def begin_video(page):
 page.evaluate("()=>{const stream=document.querySelector('#world').captureStream(12);const v=window.__feedingVideo={stream,chunks:[]};v.rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8',videoBitsPerSecond:900000});v.rec.ondataavailable=e=>{if(e.data.size)v.chunks.push(e.data)};v.rec.start(1000);}")
def end_video(page,row):
 encoded=page.evaluate("()=>new Promise(resolve=>{const v=window.__feedingVideo;v.rec.onstop=async()=>{const b=new Uint8Array(await new Blob(v.chunks,{type:'video/webm'}).arrayBuffer());let s='';for(let i=0;i<b.length;i+=32768)s+=String.fromCharCode(...b.subarray(i,i+32768));v.stream.getTracks().forEach(t=>t.stop());window.__feedingVideo=null;resolve(btoa(s));};v.rec.stop();})")
 raw=base64.b64decode(encoded);assert len(raw)>3000 and raw.startswith(bytes.fromhex('1a45dfa3'));name=row['id']+'-model-steps.webm';(out/name).write_bytes(raw);row['video']={'file':name,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'scope':'Direct MediaRecorder capture of the live WebGL canvas during the explicitly labelled public model steps. Pauses and stepped motion are retained; not an unaccelerated animation or FPS proof. No synthesized or interpolated frames.'};save()
def capture(page,row,s,phase):
 assert s['visibility']and all(s['visibility'][k]for k in ['meshVisible','bodyClear','billClear','bodyInFrame']),(row['id'],phase,'Actual model hidden or occluded',s['visibility'])
 name=row['id']+'-'+phase+'.png';page.screenshot(path=str(out/name));row['captures'].append({'file':name,'sha256':hashlib.sha256((out/name).read_bytes()).hexdigest(),'phase':phase,'sample':s});save();print('CAPTURE',row['id'],phase,s['time'],flush=True)
with sync_playwright()as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);result['browser']=b.version
 try:
  for id in ['avocet','redshank','spoonbill','oystercatcher']:
   ctx=b.new_context(viewport={'width':1000,'height':700},accept_downloads=True);page=ctx.new_page();page.set_default_timeout(45000);page.on('pageerror',lambda e:result['errors'].append(str(e)));observe_graphics_errors(page,result['errors']);page.goto(url);page.wait_for_function('document.querySelector("#world").dataset.ready==="true"',timeout=120000);page.locator('#start').click();page.locator('#menu-button').click();page.get_by_text('Referenzabschnitt prüfen',exact=True).click();page.locator(f'[data-view="feeding-{id}"]').click();page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision');page.locator('#binocular').click();page.locator('#study').click()
   # Start the complete episode via public UI before locking the lens. A busy
   # renderer may otherwise reach the first contact before setup has finished.
   before_window=sample(page,'compact-'+id);stored_before=page.evaluate('localStorage.getItem("ranger-compact-fieldbook-v2")')
   page.locator('#new-observation-context').click()
   page.wait_for_function('(old)=>document.querySelector("#world").dataset.runId!==old && Number(document.querySelector("#world").dataset.simulationTime)===0',arg=before_window['runId'])
   fresh_window=sample(page,'compact-'+id);assert fresh_window['observer']==before_window['observer'];assert page.evaluate('localStorage.getItem("ranger-compact-fieldbook-v2")')==stored_before
   page.locator(f'[data-behavior="compact-{id}"]').click();page.wait_for_function('document.querySelector("#world").dataset.modelObservation!==""');
   if a.detail:page.locator('#behavior-detail').click();tick(page,.025);page.wait_for_function('JSON.parse(document.querySelector("#world").dataset.feedingDetail||"null")!==null')
   row={'id':'compact-'+id,'captures':[],'event':None};result['sequences'].append(row);begin_video(page);s=sample(page,row['id']);capture(page,row,s,'initial');seen=set();episode=None
   row['beforeNewWindow']=before_window;row['freshWindow']=fresh_window
   # The first fine step can already be the approach. Do not silently skip that
   # phase and switch the test to a second prey while the lens keeps the first.
   if s['actor']['phase']=='approaching':
    episode=s['actor']['targetId'];row['preyId']=episode;seen.add('approaching');capture(page,row,s,'approaching')
   if id in ['avocet','redshank']:
    target=26 if id=='avocet'else 18
    while sample(page,row['id'])['time']<target-6:tick(page,5)
    while sample(page,row['id'])['time']<target:tick(page,1)
   for i in range(480):
    target=initial_positions.get(s['actor'].get('targetId'));near_contact=target and s['actor']['phase']=='approaching' and ((target['x']-s['actor']['x'])**2+(target['z']-s['actor']['z'])**2)**.5<1.05
    tick(page,.025 if near_contact else .1 if 'departing'in seen else .25);s=sample(page,row['id']);row['lastSample']=s;phase=s['actor']['phase'];assert s['modelObservation']==row['id'];assert s['ownSeconds']==0,'Model stepping must not fabricate active sighting time'
    if a.detail and s['detail'] and s['detail']['eventRecorded']:
     d=s['detail'];assert any(e['id']==d['eventId'] and e['actors']==[d['individualId'],d['preyId']]for e in s['events'])
    if episode is None and phase=='approaching':episode=s['actor']['targetId'];row['preyId']=episode
    if episode is None:continue
    event=next((e for e in s['events']if e['actors']==[row['id'],episode]),None)
    if event:row['event']=event
    if event and 'departing'in seen and(s['actor'].get('targetId')!=episode or phase=='waiting'):
     assert ((s['actor']['x']-event['bodyPosition']['x'])**2+(s['actor']['z']-event['bodyPosition']['z'])**2)**.5>=.40,'No actual departure from acquired prey'
     capture(page,row,s,'after-departure');break
    if s['actor'].get('targetId')==episode and phase not in seen:seen.add(phase);capture(page,row,s,phase)
   required={'approaching','searching','handling','swallowing','departing'};assert required<=seen,(id,'Missing actual rendered phases',required-seen);assert row['event'],id+' no successful real resource acquisition';assert row['event']['after']==row['event']['before']-1;assert row['event']['contactDistance']<.004;
   if a.detail:
    for c in row['captures']:
     if c['phase'] in ['initial','after-departure']:continue
     d=c['sample']['detail'];assert d and d['eventId']==row['event']['id'] and d['individualId']==row['id'] and d['preyId']==row['preyId'];assert d['sharedLiveSceneNodes'] and d['preyGeometryUnscaled']
   assert page.locator('#count').inner_text()=='0';assert not result['errors'];end_video(page,row);row['passed']=True;save();ctx.close();print('PASS',id,flush=True)
  result['passed']=True;result['completedAt']=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime());save()
  cards=[]
  for row in result['sequences']:
   cards.append('<h2>'+html.escape(row['id'])+'</h2><p>Originalvideo der sichtbaren Modellschritte: keine Echtzeit-Zertifizierung.</p><video controls preload="none" style="max-width:100%" src="'+html.escape(row['video']['file'])+'"></video><div class="grid">'+''.join('<figure><img loading="lazy" src="'+html.escape(c['file'])+'"><figcaption>'+html.escape(c['phase'])+' · t='+str(c['sample']['time'])+' Modell-s</figcaption></figure>'for c in row['captures'])+'</div>')
  (out/'index.html').write_text('<!doctype html><html lang="de"><meta charset="utf-8"><title>Tatsächliche Nahrungssuche</title><style>body{font:16px system-ui;background:#eee8d6;color:#263c32;margin:25px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:15px}figure{margin:0}img{width:100%}</style><h1>Vier tatsächliche WebGL-Bildfolgen</h1><p>Beschriftete Modellzeitschritte durch die sichtbare Oberfläche; keine Tier-, Beute- oder Beleginjektion. Originalaufnahmen unverändert. Kamera folgt dem Vogel. Dies ist keine Echtzeit-FPS-Prüfung oder biologische Endabnahme.</p>'+''.join(cards))
 except Exception:
  result['failure']=traceback.format_exc()
  try:
   page.screenshot(path=str(out/'failure.png'));result['failureScreenshot']={'file':'failure.png','sha256':hashlib.sha256((out/'failure.png').read_bytes()).hexdigest(),'source':'Actual failed paused model frame; not a successful phase proof'}
  except Exception:pass
  save();raise
 finally:b.close();server.shutdown();server.server_close()
print(json.dumps({'passed':result['passed'],'sequences':len(result['sequences'])}))
