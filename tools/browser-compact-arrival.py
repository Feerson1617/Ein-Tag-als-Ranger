"""N01: ordinary full walk, explicit local windows, finite feeding and real-time video.
Only native UI input changes the game. Dataset reads are diagnostic observations.
The second visit uses 1200 explicitly clicked model seconds, not claimed active K1 time.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
from module_graph import ModuleGraph
from compact_runtime import audit_standalone
import argparse,json,shutil,hashlib,subprocess,time,traceback,math,base64,io
from PIL import Image

p=argparse.ArgumentParser();p.add_argument('--detail-realtime',action='store_true',help='Additional 1200x750 didactic-detail scenario: all four first encounters run in real time; default route/budget assertions remain unchanged.');p.add_argument('--site',default='outputs');p.add_argument('--entry',default='Ranger-Kompakt.html');p.add_argument('--output',default='work/qa-2026-10-23/arrival-browser');p.add_argument('--walk-wall-budget',type=int,default=900,help='Explicit operational wall-clock budget per walked segment; the default 900-second run and any longer supplemental run must be reported separately.');p.add_argument('--v1-route',action='store_true',help='Additional native shortcut out/back and precise native-joystick endpoint alignment for V1; original default900s route remains unchanged.');a=p.parse_args()
if a.walk_wall_budget<=0:p.error('--walk-wall-budget must be positive')
root=Path(__file__).resolve().parents[1];out=root/a.output;out.mkdir(parents=True,exist_ok=True)
audit=audit_standalone(root,root/a.site/a.entry);graph=ModuleGraph(root/'dist','compact/main.js')
result={'passed':False,'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'sourceDirty':bool(subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True).strip()),'htmlSHA256':audit['htmlSHA256'],'runtimeSourceHashes':{n:hashlib.sha256((root/'dist'/n).read_bytes()).hexdigest()for n in sorted(set(graph.modules)|graph.assets|{'kompakt.html','compact/style.css','icon.svg'})},'scope':'Fresh standalone HTML; full authored path walked using ordinary W/mouse input; no reference-camera visits, position/clock/resource/evidence writes. Explicit UI new contexts at the reached coast, finite resource acquisition, model steps separate from real-time sighting. Cloud software graphics, no iPad/Safari certification.','errors':[],'walk':[],'sequences':[],'walkWallBudgetSeconds':a.walk_wall_budget,'walkBudgetScope':'Default 900-second operational traversal guard. A larger explicitly requested budget is a supplemental functional walk, not a passed 900-second run or evidence of improved performance.'}
layout=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import{ROUTE,OUTLOOK,SHORTCUT,routeMetrics}from'./dist/compact/layout.js';console.log(JSON.stringify({route:ROUTE,outlook:OUTLOOK,shortcut:SHORTCUT,metrics:routeMetrics()}));"],cwd=root,text=True))
inventory=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import{identityInventory}from'./dist/compact/evidence.js';import{MANIFEST,MODEL_REVISION}from'./dist/compact/manifest.js';console.log(JSON.stringify([...identityInventory(MANIFEST.initialSeed,MODEL_REVISION).individuals.values()].map(p=>({id:p.id,x:p.x,z:p.z}))));"],cwd=root,text=True));prey={p['id']:p for p in inventory}
resources=['small-juveniles','small-worms','shrimp','shared-mussels']
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(root/a.site)));Thread(target=server.serve_forever,daemon=True).start()
def save():(out/'result.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
SAMPLE_SCRIPT='c=>({time:Number(c.dataset.simulationTime),observer:JSON.parse(c.dataset.observer),actors:JSON.parse(c.dataset.coastal),events:JSON.parse(c.dataset.coastalEvents),ecology:JSON.parse(c.dataset.ecology),runId:c.dataset.runId,origin:JSON.parse(c.dataset.sceneOrigin||"null"),mode:c.dataset.modelObservation,realtime:c.dataset.behaviorRealtime==="true",ownSeconds:Number(c.dataset.observationSeconds),focus:c.dataset.focusIndividual,visibility:JSON.parse(c.dataset.behaviorVisibility||"null"),detail:JSON.parse(c.dataset.feedingDetail||"null")})'
def sample(page):return page.locator('#world').evaluate(SAMPLE_SCRIPT)
def sequence_frame(page,individual,seen,episode):
 # Read the actual pixels and before/after telemetry in one synchronous callback
 # after an actual advancing frame. Paused model-step mode instead reads the
 # retained compositor with strictly identical before/after model state.
 s=page.locator('#world').evaluate('''(c,a)=>new Promise(resolve=>requestAnimationFrame(()=>{
  const read=('''+SAMPLE_SCRIPT+'''),before=read(c),actor=before.actors.find(x=>x.id===a.individual);
  const late=actor&&a.detail&&actor.phase==='swallowing'&&!a.seen.includes('mouth-transfer')&&before.events.some(e=>e.actors[0]===actor.id&&e.actors[1]===a.episode&&before.time-e.endedAt>=.7);
  const next=actor&&(!a.seen.includes(actor.phase)&&['approaching','searching','handling','swallowing','departing'].includes(actor.phase));
  const departed=actor&&a.seen.includes('departing')&&(actor.targetId!==a.episode||actor.phase==='waiting');
  if(next||departed||late){
   const renderRevision=c.dataset.renderRevision,sceneRevision=c.dataset.sceneRevision,png=before.realtime?c.toDataURL('image/png'):null;
   before.frameCapture={png,after:read(c),renderRevision,sceneRevision,afterRenderRevision:c.dataset.renderRevision,afterSceneRevision:c.dataset.sceneRevision,method:'Actual canvas pixels and telemetry in one post-render rAF callback; no pause, clock change or reconstructed frame.'};
  }
  resolve(before);
 }))''',{'individual':individual,'seen':sorted(seen),'episode':episode,'detail':a.detail_realtime})
 if s.get('frameCapture') and not s['realtime']:
  # With preserveDrawingBuffer=false an idle model-step canvas has discarded
  # its direct read buffer. Capture the actual retained compositor instead.
  # Model time is already paused by the PUBLIC model-step mode, not by this test.
  frame=s['frameCapture'];raw=page.screenshot();after=sample(page)
  for key in ['time','runId','observer','actors','events','ecology','mode','realtime']:assert after[key]==s[key],('Paused composited capture changed model state',key)
  revisions=page.locator('#world').evaluate('c=>({render:c.dataset.renderRevision,scene:c.dataset.sceneRevision})')
  frame.update(png='data:image/png;base64,'+base64.b64encode(raw).decode(),after=after,afterRenderRevision=revisions['render'],afterSceneRevision=revisions['scene'],method='Actual composited browser pixels in public paused model-step mode; exact model state before/after; no state/time injection or reconstructed frame.')
 return s
def pointer(page,button):
 button.wait_for(state='visible');assert button.is_enabled();button.evaluate("b=>b.scrollIntoView({block:'center',behavior:'instant'})")
 hit=button.evaluate('b=>{const r=b.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,e=document.elementFromPoint(x,y);return{x,y,hit:e===b||b.contains(e),visible:x>=0&&y>=0&&x<innerWidth&&y<innerHeight}}');assert hit['hit']and hit['visible'],hit;page.mouse.click(hit['x'],hit['y'])
def look(page,yaw,pitch=None):
 o=sample(page)['observer'];delta=(o['yaw']-yaw+math.pi)%(2*math.pi)-math.pi;expected=o['yaw']
 while abs(delta)>.00001:
  turn=max(-.6,min(.6,delta));page.mouse.move(400,280);page.mouse.down();page.mouse.move(400+turn/.003,280);page.mouse.up();delta-=turn;expected-=turn
  page.wait_for_function('(target)=>{const yaw=JSON.parse(document.querySelector("#world").dataset.observer).yaw;return Math.abs(Math.atan2(Math.sin(yaw-target),Math.cos(yaw-target)))<1e-5}',arg=expected)
 if pitch is not None:
  o=sample(page)['observer'];page.mouse.move(400,280);page.mouse.down();page.mouse.move(400,280+(o['pitch']-pitch)/.0025);page.mouse.up()
def walk(page,path,name):
 started=time.monotonic();before=sample(page);i=0;last_motion=time.monotonic();last=before['observer'];motion_anchor=last;travel=0;page.keyboard.down('w')
 try:
  while True:
   s=sample(page);o=s['observer'];moved=math.hypot(o['x']-last['x'],o['z']-last['z']);travel+=moved;last=o
   if math.hypot(o['x']-motion_anchor['x'],o['z']-motion_anchor['z'])>.025:last_motion=time.monotonic();motion_anchor=o
   assert time.monotonic()-last_motion<12,('Ordinary walk is blocked',name,i,o)
   assert time.monotonic()-started<a.walk_wall_budget,('Full path did not finish within the explicitly recorded operational wall budget',a.walk_wall_budget,name,i,o)
   # Advance by proximity along the authored centreline, never by setting position.
   nearby=range(i,min(len(path),i+30));i=min(nearby,key=lambda j:math.hypot(path[j]['x']-o['x'],path[j]['z']-o['z']))
   if i>=len(path)-4 and math.hypot(path[-1]['x']-o['x'],path[-1]['z']-o['z'])<.5:break
   target=path[min(i+6,len(path)-1)];yaw=math.atan2(-(target['x']-o['x']),-(target['z']-o['z']))
   if abs((o['yaw']-yaw+math.pi)%(2*math.pi)-math.pi)>.025:look(page,yaw)
   if not result['walk']or time.monotonic()-result['walk'][-1]['wall']>5:
    result['walk'].append({'segment':name,'index':i,'wall':time.monotonic(),'modelTime':s['time'],'observer':o});save();print('WALK',name,i,round(s['time'],1),flush=True)
   page.wait_for_timeout(100);page.wait_for_function('(previous)=>Number(document.querySelector("#world").dataset.simulationTime)>previous',arg=s['time'])
 finally:page.keyboard.up('w')
 after=sample(page);assert math.hypot(after['observer']['x']-path[-1]['x'],after['observer']['z']-path[-1]['z'])<.55,('Endpoint not reached',name,after['observer'])
 row={'name':name,'start':before,'end':after,'actualSeconds':time.monotonic()-started,'modelSeconds':after['time']-before['time'],'sampledTravelMeters':travel};result.setdefault('walkSegments',[]).append(row);save();page.screenshot(path=str(out/('walk-'+name+'.png')))
def align_outlook(page):
 # Reach the actual authored endpoint using the real analog control. No JS
 # observer/camera/clock write. This strengthens the endpoint from55cm to8mm.
 started=time.monotonic();target=layout['outlook'][-1];before=sample(page)
 if page.locator('#binocular').get_attribute('aria-pressed')!='true':pointer(page,page.locator('#binocular'))
 for tolerance,offset in [(.045,10),(.008,6)]:
  for retry in range(8):
   o=sample(page)['observer'];distance=math.hypot(o['x']-target['x'],o['z']-target['z'])
   if distance<tolerance:break
   look(page,math.atan2(-(target['x']-o['x']),-(target['z']-o['z'])))
   rect=page.locator('#joystick').bounding_box();assert rect
   x=rect['x']+rect['width']/2;y=rect['y']+rect['height']/2;page.mouse.move(x,y);page.mouse.down();page.mouse.move(x,y-offset)
   best=distance
   try:
    for step in range(300):
     assert time.monotonic()-started<150,'Native endpoint alignment exceeded its separate150s operational budget'
     sample_before=sample(page);o=sample_before['observer'];distance=math.hypot(o['x']-target['x'],o['z']-target['z'])
     if distance<tolerance or distance>best+.02:break
     best=min(best,distance);page.wait_for_function('(t)=>Number(document.querySelector("#world").dataset.simulationTime)>t',arg=sample_before['time'])
   finally:page.mouse.up()
  else:raise AssertionError('Native endpoint alignment could not reach stronger tolerance')
 after=sample(page);assert math.hypot(after['observer']['x']-target['x'],after['observer']['z']-target['z'])<.008
 result['nativeEndpointAlignment']={'before':before,'after':after,'actualSeconds':time.monotonic()-started,'input':'ordinary native mouse/joystick analog movement; no observer injection','toleranceMeters':.008};save()

def tick(page,size):
 page.locator('#behavior-step-size').select_option(str(size));pointer(page,page.locator('#behavior-step'));page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision')
def start_window(page,id,realtime=False):
 if page.locator('#behavior-stop').is_visible():pointer(page,page.locator('#behavior-stop'))
 pointer(page,page.locator('#study'));before=sample(page);pointer(page,page.locator('#new-observation-context'));page.wait_for_function('(old)=>document.querySelector("#world").dataset.runId!==old && Number(document.querySelector("#world").dataset.simulationTime)===0',arg=before['runId']);fresh=sample(page)
 assert fresh['runId']!=before['runId']and fresh['time']==0
 assert fresh['origin']['previousRunId']==before['runId']and abs(fresh['origin']['previousSimulationTime']-before['time'])<.002
 assert fresh['observer']==before['observer'],'Local window must not move the visitor'
 assert fresh['origin']['startSimulationTime']==0 and not fresh['events']
 assert {k:fresh['ecology']['resources'][k]for k in resources}=={'small-juveniles':3,'small-worms':3,'shrimp':5,'shared-mussels':18}
 pointer(page,page.locator(('[data-realtime="'if realtime else'[data-behavior="')+id+'"]'))
 page.wait_for_function('(id)=>document.querySelector("#world").dataset.modelObservation===id && document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision',arg=id)
 if a.detail_realtime:
  pointer(page,page.locator('#behavior-detail'))
  if not realtime:tick(page,.025) # First explicit fine step assigns the actual prey target at time zero.
  page.wait_for_function('JSON.parse(document.querySelector("#world").dataset.feedingDetail||"null")!==null')
 if not realtime and page.locator('#binocular').get_attribute('aria-pressed')!='true':pointer(page,page.locator('#binocular'))
 row={'id':id,'realtime':realtime,'beforeNewContext':before,'freshContext':fresh,'captures':[],'samples':[],'startedWall':time.monotonic()};result['sequences'].append(row);save();return row
def capture(page,row,s,phase):
 frame=s.pop('frameCapture');assert frame['renderRevision'] is not None and frame['renderRevision']==frame['sceneRevision']==frame['afterRenderRevision']==frame['afterSceneRevision']
 raw=base64.b64decode(frame.pop('png').split(',',1)[1]);assert len(raw)>3000 and raw.startswith(bytes.fromhex('89504e470d0a1a0a'))
 extrema=Image.open(io.BytesIO(raw)).convert('RGB').getextrema();assert max(hi-lo for lo,hi in extrema)>8,('Empty/uniform capture cannot prove a rendered feeding phase',row['id'],phase,extrema)
 v=s['visibility'];assert v and v['individualId']==row['id']and all(v[k]for k in ['meshVisible','bodyClear','billClear','bodyInFrame']),(row['id'],phase,v)
 name=f"sequence-{len(result['sequences'])}-{row['id']}-{phase}.png";(out/name).write_bytes(raw);after=frame['after'];assert after['time']==s['time'] and after['runId']==s['runId']
 before_actor=next(a for a in s['actors']if a['id']==row['id']);after_actor=next(a for a in after['actors']if a['id']==row['id'])
 phase_stable=before_actor['phase']==after_actor['phase'] and before_actor.get('targetId')==after_actor.get('targetId')
 context_name=Path(name).stem+'-context.png';page.screenshot(path=str(out/context_name));context_after=sample(page);context_actor=next(a for a in context_after['actors']if a['id']==row['id'])
 row['captures'].append({'file':name,'sha256':hashlib.sha256(raw).hexdigest(),'phase':phase,'sample':s,'afterCapture':after,'phaseStableAcrossCapture':phase_stable,'frameCapture':frame,'contextFile':context_name,'contextSHA256':hashlib.sha256((out/context_name).read_bytes()).hexdigest(),'contextAfterCapture':context_after,'contextPhaseStableAcrossCapture':before_actor['phase']==context_actor['phase']and before_actor.get('targetId')==context_actor.get('targetId'),'contextScope':'Actual full-page UI context; if its phase changed, it is not used as a phase proof. The canonical canvas PNG above is bound atomically to the recorded phase.'});save()
 if phase!='after-departure':assert phase_stable,('Phase crossed during actual capture; image is not a confirmed phase proof',row['id'],phase,after_actor['phase'])
 print('CAPTURE',row['id'],phase,round(s['time'],2),flush=True)
def sequence(page,row):
 seen=set();episode=None;event=None;completed_departure=False;started=time.monotonic()
 for i in range(600):
  s=sequence_frame(page,row['id'],seen,episode);actor=next(a for a in s['actors']if a['id']==row['id']);phase=actor['phase'];row['lastSample']=s
  if episode is None and phase=='approaching':episode=actor['targetId'];row['preyId']=episode
  if episode:
   event=next((e for e in s['events']if e['actors']==[row['id'],episode]),event)
   if event and 'departing'in seen and(actor.get('targetId')!=episode or phase=='waiting'):
    assert math.hypot(actor['x']-event['bodyPosition']['x'],actor['z']-event['bodyPosition']['z'])>=.4
    capture(page,row,s,'after-departure');completed_departure=True;break
   if a.detail_realtime and event and phase=='swallowing' and s['time']-event['endedAt']>=.7 and 'mouth-transfer'not in seen:
    seen.add('mouth-transfer');capture(page,row,s,'mouth-transfer')
   elif actor.get('targetId')==episode and phase not in seen:seen.add(phase);capture(page,row,s,phase)
  assert s['mode']==row['id']and s['realtime']==row['realtime']
  if a.detail_realtime and s['detail'] and s['detail']['eventRecorded']:
   detail=s['detail'];assert any(e['id']==detail['eventId'] and e['actors']==[detail['individualId'],detail['preyId']]for e in s['events']),'Detail must not assign a previous acquisition to the next prey'
  if not row['realtime']:assert s['ownSeconds']==0
  row['samples'].append({'wallSeconds':time.monotonic()-started,'modelTime':s['time'],'phase':phase,'ownSeconds':s['ownSeconds'],'focus':s['focus']})
  if row['realtime']:
   # Count model-progress samples, not repeated reads of a software-rendered frame.
   page.wait_for_timeout(80);page.wait_for_function('(previous)=>Number(document.querySelector("#world").dataset.simulationTime)>previous',arg=s['time'])
  else:
   target=prey.get(actor.get('targetId'));near=target and phase=='approaching'and math.hypot(target['x']-actor['x'],target['z']-actor['z'])<1.05
   tick(page,.025 if near else .1 if 'departing'in seen else 1 if phase=='waiting' else .25)
 assert completed_departure,(row['id'],'No confirmed departure from the acquired prey')
 required={'approaching','searching','handling','swallowing','departing'};assert required<=seen,(row['id'],required-seen)
 assert event and event['after']==event['before']-1 and event['contactDistance']<.004
 if a.detail_realtime:
  assert 'mouth-transfer'in seen,(row['id'],'No actual late swallowing render captured')
  transfer=next(c['sample']['detail']for c in row['captures']if c['phase']=='mouth-transfer');distance=lambda p,q:math.sqrt(sum((p[k]-q[k])**2 for k in ['x','y','z']))
  assert distance(transfer['carried'],transfer['mouth'])<distance(transfer['tip'],transfer['mouth'])*.2,'Actual concrete prey must reach the external mouth junction'
  for captured in row['captures']:
   if captured['phase']=='after-departure':continue
   detail=captured['sample']['detail'];assert detail and detail['individualId']==row['id'] and detail['preyId']==row['preyId'];assert detail['eventId']==event['id'];assert detail['runId']==row['freshContext']['runId'];assert detail['sharedLiveSceneNodes'] and detail['preyGeometryUnscaled'] and detail['didacticMagnification']
   if captured['phase']=='handling':assert detail['preyVisible'],'The actual contact prey must render in the magnified view'
 row.update(event=event,actualSeconds=time.monotonic()-started,passed=True);save()

def begin_video(page):
 page.evaluate("()=>{const stream=document.querySelector('#world').captureStream(12);window.__arrivalVideo={stream,chunks:[]};const v=window.__arrivalVideo;v.rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8',videoBitsPerSecond:500000});v.rec.ondataavailable=e=>{if(e.data.size)v.chunks.push(e.data)};v.rec.start(1000);}")
def end_video(page):
 data=page.evaluate("()=>new Promise(resolve=>{const v=window.__arrivalVideo;v.rec.onstop=async()=>{const b=new Uint8Array(await new Blob(v.chunks,{type:'video/webm'}).arrayBuffer());let text='';for(let i=0;i<b.length;i+=32768)text+=String.fromCharCode(...b.subarray(i,i+32768));v.stream.getTracks().forEach(t=>t.stop());window.__arrivalVideo=null;resolve(btoa(text));};v.rec.stop();})")
 raw=base64.b64decode(data);assert len(raw)>3000 and raw.startswith(bytes.fromhex('1a45dfa3'))
 filename='coastal-feeding-realtime.webm';(out/filename).write_bytes(raw);result['video']={'file':filename,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'scope':'Unaccelerated live canvas MediaRecorder capture of the first real-time feeding sequence; no reconstructed frames, no model-step segments. Full walk is documented separately by actual input telemetry and screenshots.','actualSeconds':time.monotonic()-result['realtimeVideoStartWall']};save()

with sync_playwright()as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);result['browser']=b.version
 ctx=b.new_context(viewport={'width':1200 if a.detail_realtime else 800,'height':750 if a.detail_realtime else 600},accept_downloads=True,has_touch=a.v1_route,**({'record_video_dir':str(out/'page-video'),'record_video_size':{'width':1200,'height':750}} if a.detail_realtime else {}));page=ctx.new_page();result['videoTimingScope']='Canvas recording uses browser wall-time timestamps during the first actual real-time sequence; model time is separately recorded.';page.set_default_timeout(45000);page.on('pageerror',lambda e:result['errors'].append(str(e)))
 try:
  page.goto(f'http://127.0.0.1:{server.server_port}/{a.entry}');page.wait_for_selector('#world[data-ready=true]',timeout=120000);pointer(page,page.locator('#start'));result['initial']=sample(page)
  if a.v1_route:
   walk(page,layout['shortcut'],'shortcut-out');walk(page,list(reversed(layout['shortcut'])),'shortcut-return')
  walk(page,layout['route'],'full-main-route');result['routeMetrics']=layout['metrics']
  # Return along the same physical boardwalk to the existing study spur.
  branch=min(range(len(layout['route'])),key=lambda i:math.hypot(layout['route'][i]['x']-70,layout['route'][i]['z']-10))
  walk(page,list(reversed(layout['route'][branch:])),'return-to-study-spur');walk(page,layout['outlook'],'study-spur')
  if a.v1_route:align_outlook(page)
  arrived=sample(page);result['arrival']=arrived;assert all(arrived['ecology']['resources'][key]==0 for key in resources),'Expected finite prey depleted after actual full route'
  # First new local window is entirely real time, including unaccelerated video.
  row=start_window(page,'compact-oystercatcher',True);result['realtimeVideoStartWall']=time.monotonic();begin_video(page);sequence(page,row);result['realtimeVideoEndWall']=time.monotonic();end_video(page)
  page.wait_for_function('!document.querySelector("#record").disabled');pointer(page,page.locator('#record'));page.locator('#note').fill('Nahrungssuche am selbst erreichten Küstenort im ausdrücklich neu begonnenen Modellfenster beobachtet.');pointer(page,page.locator('#save-note'));assert page.locator('#count').inner_text()=='1'
  for id in ['compact-avocet','compact-redshank','compact-spoonbill']:sequence(page,start_window(page,id,a.detail_realtime))
  if a.detail_realtime:
   # The four additional first encounters all use real time. Switch explicitly
   # through the same public UI before the already-labelled model-step wait.
   # Keep this exact run/world/visitor; do not create another context here.
   before_switch=sample(page);stored_before=page.evaluate('localStorage.getItem("ranger-compact-fieldbook-v2")')
   pointer(page,page.locator('#behavior-stop'));pointer(page,page.locator('#study'));pointer(page,page.locator('[data-behavior="compact-spoonbill"]'))
   page.wait_for_function('document.querySelector("#world").dataset.modelObservation==="compact-spoonbill" && document.querySelector("#world").dataset.behaviorRealtime==="false" && document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision')
   pointer(page,page.locator('#behavior-detail'));after_switch=sample(page)
   assert after_switch['runId']==before_switch['runId'] and after_switch['origin']==before_switch['origin'] and all(after_switch['observer'][axis]==before_switch['observer'][axis]for axis in ['x','z'])
   assert page.evaluate('localStorage.getItem("ranger-compact-fieldbook-v2")')==stored_before
   assert page.locator('#behavior-step').is_visible() and not after_switch['realtime']
   result['longWaitModeSwitch']={'before':before_switch,'after':after_switch,'sameRunAndObserver':True,'fieldbookBytesUnchanged':True,'scope':'Explicit native UI change from real-time following to labelled model-time steps, with no reset or injected time.'};save()
  # A disclosed equivalent model wait. This is not 20 minutes of active forest/K1 work.
  before=sample(page);wait_start=time.monotonic()
  for i in range(240):tick(page,5)
  after=sample(page);assert abs(after['time']-before['time']-1200)<.01 and after['runId']==before['runId'];assert all(after['ecology']['resources'][key]==0 for key in resources)
  result['equivalentLongWait']={'scope':'240 ordinary UI clicks of labelled 5-model-second steps; equivalent 20-minute model delay, not actual active forest/K1 time','before':before,'after':after,'actualSeconds':time.monotonic()-wait_start};save()
  for id in ['compact-avocet','compact-redshank','compact-spoonbill','compact-oystercatcher']:sequence(page,start_window(page,id))
  pointer(page,page.locator('#journal-button'))
  with page.expect_download()as d:pointer(page,page.locator('#export'))
  d.value.save_as(str(out/'arrival-fieldbook.json'));book=json.loads((out/'arrival-fieldbook.json').read_text());assert len(book['records'])==1 and book['records'][0]['sceneOrigin']['previousRunId']==arrived['runId'];assert book['records'][0]['observationSeconds']>=2.5
  assert not result['errors'] and result.get('video');result['checksCompleted']=True;result['passed']=True;result['completedAt']=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime());save()
 except Exception:
  result['failure']=traceback.format_exc()
  try:result['failureSample']=sample(page);page.screenshot(path=str(out/'failure.png'))
  except Exception:pass
  save();raise
 finally:
  try:
   if page.evaluate('!!window.__arrivalVideo'):end_video(page)
  except Exception:
   result['passed']=False;result['videoFailure']=traceback.format_exc();save();raise
  finally:
   if a.detail_realtime and page.video:result['pageVideo']=str(Path(page.video.path()).relative_to(out));result['pageVideoScope']='Original real-time browser recording from actual start until completion or failure; completed route and sequence coverage is stated individually in result.json. No accelerated playback or synthesized frames';save()
   ctx.close();b.close();server.shutdown();server.server_close()
print(json.dumps({'passed':result['passed'],'sequences':len(result['sequences'])}))
