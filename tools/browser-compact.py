"""Actual UI/scene checks for phase 2, plus screenshots from the tested build.
No state mutation/unlock hooks; screenshots use the normal preview-view buttons.
"""
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from playwright.sync_api import sync_playwright
from module_graph import ModuleGraph
import subprocess,sys
import argparse,base64,hashlib,json,shutil,time,traceback
p=argparse.ArgumentParser();p.add_argument('--site',default='outputs/Ranger-Kompakt');p.add_argument('--entry',default='index.html');p.add_argument('--smoke',action='store_true');p.add_argument('--visual-only',action='store_true');p.add_argument('--width',type=int,default=800);p.add_argument('--height',type=int,default=500);args=p.parse_args()
root=Path(__file__).resolve().parents[1];out=root/'work/compact-browser';out.mkdir(exist_ok=True,parents=True);site=(root/args.site).resolve();result={'checks':[],'errors':[],'captures':[],'startedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'site':args.site,'entry':args.entry,'viewport':{'width':args.width,'height':args.height},'hardwareScope':'Cloud Chromium; no actual iPad/Safari or minimum-device certification'}
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(site)));Thread(target=server.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{server.server_port}/Ein-Tag-als-Ranger/{args.entry}'
# Serve the project path, not just the origin root.
class PrefixHandler(Handler):
 def do_GET(self):
  if self.path.startswith('/Ein-Tag-als-Ranger/'):self.path=self.path[len('/Ein-Tag-als-Ranger'):]
  return super().do_GET()
server.shutdown();server.server_close();server=ThreadingHTTPServer(('127.0.0.1',0),partial(PrefixHandler,directory=str(site)));Thread(target=server.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{server.server_port}/Ein-Tag-als-Ranger/{args.entry}'
subprocess.run([sys.executable,str(root/'tools/verify-compact.py')],cwd=root,check=True,stdout=subprocess.PIPE)
g=ModuleGraph(root/'dist','compact/main.js');result['sourceCommit']=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip();result['runtimeSourceHashes']={name:hashlib.sha256((root/'dist'/name).read_bytes()).hexdigest()for name in sorted(set(g.modules)|g.assets|{'compact/style.css','kompakt.html','icon.svg'})};result['videos']=[]
if args.smoke:
 import re
 text=(site/args.entry).read_text();decoder=json.JSONDecoder();code=re.search(r'<script type="module">([\s\S]*)</script>',text)[1];sources,_=decoder.raw_decode(code.split('const sources=',1)[1]);assets,_=decoder.raw_decode(code.split(',assets=',1)[1]);assert set(sources)==set(g.modules) and set(assets)==g.assets
 for name in g.modules:assert sources[name]==g.rewrite(name,lambda r:('module://'if r.target in g.modules else'asset://')+r.target),'Stale standalone module: '+name
 for name,data in assets.items():assert base64.b64decode(data['data'])==(root/'dist'/name).read_bytes(),'Stale standalone asset: '+name
 assert re.search(r'<style>([\s\S]*?)</style>',text)[1]==(root/'dist/compact/style.css').read_text(),'Stale standalone style'
def save(): (out/('standalone-result.json'if args.smoke else'result.json')).write_text(json.dumps(result,indent=2,ensure_ascii=False))
def ok(name,**details):
 assert not result['errors'],result['errors']
 result['checks'].append({'name':name,'passed':True,**details});save();print('PASS',name,flush=True)
def dataset(page):return page.locator('#world').evaluate('(e)=>({...e.dataset})')
def select_view(page,name):
 page.locator('#menu-button').click();page.locator('summary').filter(has_text='Referenzabschnitt prüfen').click();page.locator(f'[data-view="{name}"]').click();page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision',timeout=45000)
def ready(page):page.goto(url);page.wait_for_selector('#world[data-ready=true]',timeout=120000);page.locator('#start').click()
def shot(page,name):
 page.wait_for_function('window.__qaErrors?.length || document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision',timeout=45000)
 assert not result['errors'],result['errors']
 filename=('standalone-'if args.smoke else'')+name+'.png';path=out/filename;page.screenshot(path=str(path));d=dataset(page);result['captures'].append({'file':filename,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size,'renderFov':d.get('renderFov'),'renderTool':d.get('renderTool'),'renderRevision':d.get('renderRevision'),'observer':d.get('observer'),'simulationTime':d.get('simulationTime'),'runId':d.get('runId')});save()
 assert not result['errors'],result['errors']
def canvas_shot(page,name):
 page.wait_for_function('window.__qaErrors?.length || document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision',timeout=45000)
 assert not result['errors'],result['errors']
 # Read the real WebGL buffer in the same animation frame, before compositing.
 # DOM labels/HUD are never part of this buffer; no image editing or target image.
 encoded=page.evaluate("()=>new Promise(resolve=>requestAnimationFrame(()=>resolve(document.querySelector('#world').toDataURL('image/png'))))")
 data=base64.b64decode(encoded.split(',',1)[1]);filename='unlabelled-'+name+'.png';path=out/filename;path.write_bytes(data)
 from PIL import Image
 with Image.open(path)as image:assert len(image.convert('RGB').getcolors(image.width*image.height)or[])>30,'Empty WebGL capture'
 d=dataset(page);result['captures'].append({'file':filename,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'canvasOnly':True,'renderFov':d.get('renderFov'),'renderTool':d.get('renderTool'),'renderRevision':d.get('renderRevision'),'observer':d.get('observer'),'simulationTime':d.get('simulationTime'),'runId':d.get('runId')});save()
def begin_video(page):
 page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision',timeout=45000)
 page.evaluate('''()=>{const stream=document.querySelector('#world').captureStream(12);window.__referenceVideo={stream,chunks:[]};const rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8',videoBitsPerSecond:500000});window.__referenceVideo.rec=rec;rec.ondataavailable=e=>{if(e.data.size)window.__referenceVideo.chunks.push(e.data);};rec.start(1000);}''')
def end_video(page,name):
 data=page.evaluate('''()=>new Promise(resolve=>{const v=window.__referenceVideo;v.rec.onstop=async()=>{const b=new Uint8Array(await new Blob(v.chunks,{type:'video/webm'}).arrayBuffer());let text='';for(let i=0;i<b.length;i+=32768)text+=String.fromCharCode(...b.subarray(i,i+32768));v.stream.getTracks().forEach(t=>t.stop());window.__referenceVideo=null;resolve(btoa(text));};v.rec.stop();})''')
 video=base64.b64decode(data);assert len(video)>3000 and video.startswith(bytes.fromhex('1a45dfa3'));(out/(name+'.webm')).write_bytes(video);result['videos'].append({'file':name+'.webm','bytes':len(video),'sha256':hashlib.sha256(video).hexdigest()});save()
with sync_playwright()as pw:
 launch={'headless':True}
 if shutil.which('chromium'):launch.update(executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 browser=pw.chromium.launch(**launch);video_options={'record_video_dir':str(out/'video'),'record_video_size':result['viewport']}if list((Path.home()/'.cache/ms-playwright').glob('ffmpeg-*/ffmpeg-linux'))else{};result['videoAvailable']=bool(video_options);context=browser.new_context(viewport=result['viewport'],**video_options);page=context.new_page();requests=[];page.add_init_script("window.__qaErrors=[];addEventListener('error',e=>{if(e.message&&!window.__qaErrors.includes(e.message))window.__qaErrors.push(e.message);});");page.on('pageerror',lambda e:result['errors'].append(str(e))if str(e)not in result['errors']else None);page.on('request',lambda r:requests.append(r.url));page.set_default_timeout(45000)
 try:
  result['browserVersion']=browser.version;ready(page);result['buildStamp']=page.locator('meta[name=compact-build]').get_attribute('content');m=json.loads(dataset(page)['manifest']);assert m['biologicalZones']==['forest','saltmarsh','wadden'];assert len(m['activeTaxa'])==9;assert m['simulationInstances']==['compact-reference-fauna'];assert not any(x in r for r in requests for x in ['wildlife-phoca','wildlife-halichoerus','habitat-world','biodiversity','expedition-state']);shot(page,'01-waldstart');ok('boot: explicit small content/request graph',manifest=m)
  page.locator('#read-sign').click();assert page.locator('#panel').is_visible();assert '1,6 m/s' in page.locator('#panel-body').inner_text();page.locator('#close').click();ok('spawn board and shared guide reachable')
  page.locator('#binocular').click();shot(page,'01a-binocular-runtime');page.locator('#magnifier').click();shot(page,'01b-magnifier-runtime');page.locator('#magnifier').click();ok('both live tool paths render without runtime errors')
  if args.smoke:
   page.locator('#binocular').click();assert page.locator('#binocular').get_attribute('aria-pressed')=='true';page.locator('#magnifier').click();assert page.locator('#magnifier').get_attribute('aria-pressed')=='true';assert not result['errors'];ok('standalone tools and scene; no external dependencies');result['requests']=requests;save()
   for name in ['deer-side','deer-front','deer-back','bird','woodruff','nettle','salt-shrub','salt-segments','salt-grass']:
    select_view(page,name);page.locator('#binocular'if name.startswith('deer')or name=='bird'else'#magnifier').click();canvas_shot(page,name)
   ok('nine unlabelled views read directly from actual standalone WebGL frames')
  else:
   if not args.visual_only:
    select_view(page,'bird-occlusion');page.locator('#binocular').click();page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision');page.wait_for_timeout(3000);assert page.locator('#record').is_disabled();assert dataset(page)['focusTaxon']!='dendrocopos_major';select_view(page,'bird');page.locator('#binocular').click();page.wait_for_function('document.querySelector("#world").dataset.focusTaxon==="dendrocopos_major" && !document.querySelector("#record").disabled',timeout=120000);assert dataset(page)['focusIndividual']=='compact-woodpecker-1';ok('same real bird blocked behind solid bark and observable from its clear side');page.locator('#binocular').click();select_view(page,'start')
   if not args.visual_only:
    before=dataset(page);pos=json.loads(before['observer']);t=float(before['simulationTime']);page.keyboard.down('w');page.wait_for_function('(t)=>Number(document.querySelector("#world").dataset.simulationTime)>t+.5',arg=t,timeout=120000);page.keyboard.up('w');after=dataset(page);end=json.loads(after['observer']);elapsed=float(after['simulationTime'])-t;distance=((end['x']-pos['x'])**2+(end['z']-pos['z'])**2)**.5;assert .8<distance/elapsed<1.9,{'before':before,'after':after,'distance':distance,'elapsed':elapsed};ok('actual keyboard movement',distanceMeters=distance,simulationSeconds=elapsed,wallClockMethod='wait for >0.5 model seconds; physics capped, no speed inference from slow GPU wall time')
    select_view(page,'woodruff');page.locator('#magnifier').click();page.wait_for_function('document.querySelector("#world").dataset.focusTaxon==="galium_odoratum" && !document.querySelector("#record").disabled',timeout=120000);evidence=dataset(page);individual=evidence['focusIndividual'];assert float(evidence['observationSeconds'])>=2.5
    page.locator('#record').click();page.locator('#note').fill('Eigene Sichtung: Blattquirle; keine Blüte. <b>kein HTML</b>');page.once('dialog',lambda d:d.dismiss());page.locator('#close').click();assert page.locator('#note').input_value().startswith('Eigene Sichtung');page.locator('#save-note').click();page.locator('#journal-button').click();assert 'Blattquirle' in page.locator('#panel-body').inner_text();assert page.locator('#panel-body b').count()==0
    with page.expect_download()as d:page.locator('#export').click()
    path=out/'earned-fieldbook.json';d.value.save_as(path);earned=json.loads(path.read_text());assert earned['records'][0]['individualId']==individual;assert earned['records'][0]['observationSeconds']>=2.5;ok('own live plant evidence, explicit note, real JSON download',individualId=individual)
    run=dataset(page)['runId'];page.reload();page.wait_for_selector('#world[data-ready=true]',timeout=120000);page.locator('#start').click();assert dataset(page)['runId']!=run;page.locator('#journal-button').click();assert 'Blattquirle' in page.locator('#panel-body').inner_text();assert page.locator('#count').inner_text()=='1';ok('actual reload retains evidence and creates a fresh run ID')
    bad=json.loads(path.read_text());bad['records'][0]['runId']='';page.locator('#import').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':json.dumps(bad).encode()});page.wait_for_function('document.querySelector("#import-preview").textContent.includes("Ungültiger")');assert page.locator('#count').inner_text()=='1';ok('invalid import rejected without replacing saved evidence')
    old={'schemaVersion':3,'entries':{'phoca_vitulina':{'found':1,'behaviors':[]},'fox':{'found':2,'behaviors':['hunting']}},'interactions':[]};page.locator('#import').set_input_files({'name':'old.json','mimeType':'application/json','buffer':json.dumps(old).encode()});page.locator('#apply-import').click();assert 'Altfeldbuch 1' in page.locator('#panel-body').inner_text();assert page.locator('#count').inner_text()=='1';ok('out-of-core legacy records imported through actual file UI as archive only');page.locator('#close').click()
   # Every image is a real render. No injected organism placement, renderer or evidence.
   for i,name in enumerate(['deer-side','deer-front','deer-back','bird','woodruff','nettle','salt-shrub','salt-segments','salt-grass','ramp','coast'],2):
    select_view(page,name)
    if name.startswith('deer')or name=='bird':page.locator('#binocular').click()
    if name in ['woodruff','nettle','salt-shrub','salt-segments','salt-grass']:page.locator('#magnifier').click()
    shot(page,f'{i:02}-{name}')
   ok('reference images: deer three views, supported bird, five plants, ramp and curve')
   # Inspect the unlabelled animal's actual rendered motion, not an artificial clock jump.
   select_view(page,'bird');page.locator('#binocular').click();page.keyboard.down('w');page.wait_for_function('document.querySelector("#world").dataset.birdActivity==="flying"',timeout=180000);page.keyboard.up('w');select_view(page,'bird-flight');begin_video(page);shot(page,'13-bird-flight');page.wait_for_function('document.querySelector("#world").dataset.birdSupport!=="" && document.querySelector("#world").dataset.birdActivity!=="flying"',timeout=180000);end_video(page,'bird-flight');select_view(page,'bird');page.locator('#binocular').click();shot(page,'14-bird-landed');ok('actual bird departure, flight and supported landing')
   select_view(page,'deer-side');page.locator('#binocular').click();page.locator('#binocular').click();begin_video(page);page.keyboard.down('w');page.wait_for_function('["walking","retreating"].includes(JSON.parse(document.querySelector("#world").dataset.deer).activity)',timeout=120000);motion_t=float(dataset(page)['simulationTime']);page.wait_for_function('(t)=>Number(document.querySelector("#world").dataset.simulationTime)>t+.6',arg=motion_t,timeout=120000);page.keyboard.up('w');shot(page,'15-deer-moving');end_video(page,'deer-motion');d=json.loads(dataset(page)['deer']);assert all(f['swing']or (abs(f['y']-f['surface'])<1e-5 and abs(f['geometryGap'])<.008) for f in d['feet']);ok('actual deer motion with stance feet at local terrain')
   # Tablet viewport/profile check preserves all actual biological instances.
   plants=dataset(page)['plantCount'];page.set_viewport_size({'width':1024,'height':768});page.locator('#menu-button').click();page.locator('#quality').select_option('tablet');page.locator('#resume').click();shot(page,'16-tablet');assert dataset(page)['plantCount']==plants;assert page.locator('#world').evaluate('(e)=>e.width')==1024;ok('tablet viewport/profile preserves plants; emulation only')
   page.set_viewport_size(result['viewport']);page.locator('#menu-button').click();page.locator('#quality').select_option('desktop');page.locator('#resume').click()
   page.evaluate('window.__testContextExtension=document.querySelector("#world").getContext("webgl2").getExtension("WEBGL_lose_context");window.__testContextExtension.loseContext()');page.locator('#graphics-error').wait_for(state='visible');page.evaluate('window.__testContextExtension.restoreContext()');page.locator('#graphics-error').wait_for(state='hidden',timeout=45000);assert page.locator('#count').inner_text()==('0'if args.visual_only else'1');ok('actual WebGL context loss and restoration without fieldbook loss')
   assert not result['errors'],result['errors'];result['requests']=requests;result['lastDataset']=dataset(page);save()
 except Exception as e:
  result['failure']={'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()};save()
  try:shot(page,'FAILED');result['failure']['dataset']=dataset(page);save()
  except Exception:pass
  raise
 finally:
  context.close();browser.close()

 # Independent browsers avoid retaining two live WebGL worlds after context-loss.
 if not args.smoke and not args.visual_only:
  for case in ['asset-failure','corrupt-storage','quota','touch']:
   fault_browser=pw.chromium.launch(**launch)
   options={'viewport':result['viewport']}
   if case=='touch':options.update(has_touch=True,is_mobile=True)
   ctx=fault_browser.new_context(**options);pg=ctx.new_page();pg.set_default_timeout(45000)
   try:
    pg.add_init_script("localStorage.setItem('evolutionswald-fieldjournal-v2','legacy-sentinel');localStorage.setItem('feldbuch-quests-v1','quest-sentinel');")
    if case=='asset-failure':
     pg.route('**/*compact-roe-deer*.glb',lambda route:route.abort())
     pg.goto(url);pg.wait_for_function('document.querySelector("#loading").textContent.includes("konnte nicht gestartet")',timeout=120000)
     assert pg.evaluate("localStorage.getItem('evolutionswald-fieldjournal-v2')")=='legacy-sentinel';ok('asset failure shows recovery message and preserves large-world storage')
    elif case=='quota':
     seed=json.loads((out/'earned-fieldbook.json').read_text());original=json.dumps(seed);pg.add_init_script("localStorage.setItem('ranger-compact-fieldbook-v1',"+json.dumps(original)+");const originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='ranger-compact-fieldbook-v1')throw new DOMException('quota test','QuotaExceededError');return originalSet.call(this,k,v);};")
     ready(pg);select_view(pg,'woodruff');pg.locator('#magnifier').click();pg.wait_for_function('!document.querySelector("#record").disabled',timeout=120000);pg.locator('#record').click();pg.locator('#note').fill('Quota-Prüfung: neuer Beleg.');pg.locator('#save-note').click();assert 'Speichern nicht möglich' in pg.locator('#save-status').inner_text();assert pg.locator('#count').inner_text()=='1';assert pg.evaluate("localStorage.getItem('ranger-compact-fieldbook-v1')")==original;pg.once('dialog',lambda d:d.accept());pg.locator('#close').click();ok('quota error visible inside note dialog; old evidence unchanged')
    elif case=='corrupt-storage':
     pg.add_init_script("localStorage.setItem('ranger-compact-fieldbook-v1','{broken');")
     ready(pg);assert pg.locator('#storage-status').is_visible();assert 'bleibt unverändert' in pg.locator('#storage-status').inner_text()
     assert pg.evaluate("localStorage.getItem('ranger-compact-fieldbook-v1')")=='{broken';ok('corrupt saved data visible and preserved at actual boot')
    else:
     ready(pg);before=dataset(pg);pos=json.loads(before['observer']);t=float(before['simulationTime']);rect=pg.locator('#joystick').bounding_box();assert rect
     cdp=ctx.new_cdp_session(pg);cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':rect['x']+rect['width']/2,'y':rect['y']+8,'id':1}]})
     pg.wait_for_function('(t)=>Number(document.querySelector("#world").dataset.simulationTime)>t+.4',arg=t,timeout=120000)
     speed=float(dataset(pg)['movementSpeed']);assert abs(speed-1.6)<.001;cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});ok('actual emulated touch gesture uses the same 1.6 m/s action',speed=speed,scope='Chromium touch emulation only')
   except Exception as e:
    result['failure']={'case':case,'type':type(e).__name__,'message':str(e)};save();pg.screenshot(path=str(out/('FAILED-'+case+'.png')));raise
   finally:ctx.close();fault_browser.close()
 save()

server.shutdown();server.server_close()
