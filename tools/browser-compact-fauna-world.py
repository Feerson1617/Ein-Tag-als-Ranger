"""Aim the ordinary player camera at actual fauna using native mouse input.
Aim points come from authored initial positions, not synthetic runtime placement.
No model replacements, movement of actors or evidence grants. Complements the
all-taxon detail gallery; natural scale can still make small taxa hard to see.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
from compact_runtime import audit_standalone
from compact_graphics_audit import observe_graphics_errors
import hashlib,json,math,shutil,subprocess,traceback
root=Path(__file__).resolve().parents[1];out=root/'work/visual/fauna-world';out.mkdir(parents=True,exist_ok=True)
r={'passed':False,'htmlAudit':audit_standalone(root,root/'outputs/Ranger-Kompakt.html'),'scope':'Actual normal-FOV world views; public season/reference controls and native mouse only. Fresh ordinary reload per scenario; no direct individual/clock writes. Not a promise of natural-scale diagnostic visibility.','captures':[],'errors':[]}
class H(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
s=ThreadingHTTPServer(('127.0.0.1',0),partial(H,directory=str(root/'outputs')));Thread(target=s.serve_forever,daemon=True).start()
def save():(out/'result.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
with sync_playwright()as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);page=b.new_page(viewport={'width':1000,'height':700});page.set_default_timeout(60000);page.on('pageerror',lambda e:r['errors'].append(str(e)));observe_graphics_errors(page,r['errors'])
 def data():return page.locator('#world').evaluate('(c)=>({observer:JSON.parse(c.dataset.observer),actors:JSON.parse(c.dataset.coastal),modelTime:Number(c.dataset.simulationTime),fov:Number(c.dataset.renderFov),runId:c.dataset.runId})')
 try:
  page.goto(f'http://127.0.0.1:{s.server_port}/Ranger-Kompakt.html');page.wait_for_selector('#world[data-ready=true]',timeout=120000);page.locator('#start').click()
  for taxon,window,view in [('vulpes_vulpes','dusk','dusk'),('apodemus_sylvaticus','dusk','dusk'),('garrulus_glandarius','autumn','oak'),('parus_major','summer','woodruff')]:
   if r['captures']:
    page.reload();page.wait_for_selector('#world[data-ready=true]',timeout=120000);page.locator('#start').click()
   page.locator('#menu-button').click();page.locator('#season-window').select_option(window);page.locator('#close').click();page.locator('#menu-button').click();page.get_by_text('Referenzabschnitt prüfen',exact=True).click();page.locator('[data-view="'+view+'"]').click();page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision');d=data();o=d['observer'];targets=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import{createReferenceState}from'./dist/compact/world-state.js';import{createEcology}from'./dist/compact/ecology.js';const s=createReferenceState();console.log(JSON.stringify(createEcology(s,"+json.dumps(window)+").actors));"],cwd=root,text=True));actor=min((x for x in targets if x['taxon']==taxon),key=lambda x:math.hypot(x['x']-o['x'],x['z']-o['z']))
   ground=float(subprocess.check_output(['node','--input-type=module','-e',"import{walkingHeight}from'./dist/compact/layout.js';console.log(walkingHeight("+str(o['x'])+','+str(o['z'])+'));'],cwd=root,text=True))
   distance=math.hypot(actor['x']-o['x'],actor['z']-o['z']);yaw=math.atan2(-(actor['x']-o['x']),-(actor['z']-o['z']));pitch=max(-1.2,min(1.1,math.atan2(actor['y']+actor['size']*.3-ground-1.67,distance)));delta=(o['yaw']-yaw+math.pi)%(2*math.pi)-math.pi;expected=o['yaw']
   while abs(delta)>1e-5:
    turn=max(-.5,min(.5,delta));page.mouse.move(400,350);page.mouse.down();page.mouse.move(400+turn/.003,350);page.mouse.up();expected-=turn;delta-=turn;page.wait_for_function('(target)=>{const y=JSON.parse(document.querySelector("#world").dataset.observer).yaw;return Math.abs(Math.atan2(Math.sin(y-target),Math.cos(y-target)))<1e-5}',arg=expected)
   currentPitch=data()['observer']['pitch']
   while abs(currentPitch-pitch)>1e-5:
    target=currentPitch+max(-.3,min(.3,pitch-currentPitch));page.mouse.move(400,350);page.mouse.down();page.mouse.move(400,350+(currentPitch-target)/.0025);page.mouse.up();page.wait_for_function('(p)=>Math.abs(JSON.parse(document.querySelector("#world").dataset.observer).pitch-p)<1e-5',arg=target);currentPitch=target
   f=taxon+'-world.png';page.screenshot(path=str(out/f));r['captures'].append({'taxon':taxon,'individual':actor['id'],'file':f,'sha256':hashlib.sha256((out/f).read_bytes()).hexdigest(),'distanceToAuthoredInitialPositionMeters':distance,'aimTargetSource':'Initial authored position; actor may have moved by capture time. Pixel review required.','sample':data()});save();print('WORLD',taxon,flush=True)
  assert not r['errors'];assert page.locator('#count').inner_text()=='0';r['passed']=True
 except Exception:r['failure']=traceback.format_exc();save();page.screenshot(path=str(out/'failure.png'));raise
 finally:save();b.close();s.shutdown();s.server_close()
