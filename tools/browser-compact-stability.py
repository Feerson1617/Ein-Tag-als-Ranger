"""Twenty-minute cloud stability observation; never a real iPad/Safari benchmark."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
from module_graph import ModuleGraph
import argparse,hashlib,json,shutil,statistics,subprocess,time,traceback
p=argparse.ArgumentParser();p.add_argument('--seconds',type=int,default=1200);a=p.parse_args()
if a.seconds<1200:p.error('The documented stability run requires at least 1200 seconds.')
root=Path(__file__).resolve().parents[1];out=root/'work/compact-stability';out.mkdir(parents=True,exist_ok=True);site=root/'outputs/Ranger-Kompakt'
subprocess.run(['python',str(root/'tools/verify-compact.py')],cwd=root,check=True,stdout=subprocess.PIPE)
g=ModuleGraph(root/'dist','compact/main.js');result={'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'runtimeSourceHashes':{name:hashlib.sha256((root/'dist'/name).read_bytes()).hexdigest()for name in sorted(set(g.modules)|g.assets|{'compact/style.css','kompakt.html','icon.svg'})},'scope':'Cloud Chromium software rendering, 800x600, tablet profile; no actual iPad/Safari/iPadOS 27 or classroom test','errors':[],'samples':[],'passed':False}
def save():(out/'result.json').write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n')
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(site)));Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright()as pw:
 opts={'headless':True}
 if shutil.which('chromium'):opts.update(executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 browser=pw.chromium.launch(**opts);result['browserVersion']=browser.version;ctx=browser.new_context(viewport={'width':800,'height':600},has_touch=True,is_mobile=True);page=ctx.new_page();page.set_default_timeout(45000);page.on('pageerror',lambda e:result['errors'].append(str(e)))
 try:
  page.goto(f'http://127.0.0.1:{server.server_port}/');page.wait_for_function('document.querySelector("#world").dataset.ready==="true"',timeout=120000);page.locator('#start').click();places=['woodruff','nettle','wood','coast','outlook','oak'];start=time.monotonic();last_sim=-1;initial=None
  while time.monotonic()-start<a.seconds:
   i=len(result['samples']);page.locator('#menu-button').click();page.get_by_text('Referenzabschnitt prüfen',exact=True).click();page.locator('[data-view="'+places[i%len(places)]+'"]').click();page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision')
   # Ordinary active world time; no direct clock/state writes or renderer hooks.
   page.wait_for_timeout(15000);d=page.locator('#world').evaluate('(c)=>Object.fromEntries(Object.entries(c.dataset).filter(([k])=>["plantCount","simulationTime","frameMs","geometries","textures","heapBytes","drawCalls","triangles","runId"].includes(k)))');sample={**d,'elapsedSeconds':round(time.monotonic()-start,2),'place':places[i%len(places)]};assert float(d['simulationTime'])>last_sim;last_sim=float(d['simulationTime']);assert not result['errors'];assert page.locator('#graphics-error').is_hidden();assert page.locator('#loading').is_hidden();assert page.locator('#count').inner_text()=='0'
   if initial is None:initial=d
   assert d['plantCount']==initial['plantCount'];assert d['runId']==initial['runId'];assert int(d['geometries'])<=int(initial['geometries'])*1.2+10;assert int(d['textures'])<=int(initial['textures'])+2
   result['samples'].append(sample);save();print(json.dumps(sample),flush=True)
  result['actualElapsedSeconds']=round(time.monotonic()-start,2);intervals=[float(s['frameMs'])for s in result['samples']];result['cloudGraphicsBudget']={'targetFPS':30,'sampledIntervals':len(intervals),'medianSampledFrameMs':statistics.median(intervals),'maxSampledFrameMs':max(intervals),'allSampledIntervalsWithinBudget':all(ms<=1000/30 for ms in intervals),'scope':'Sparse main-loop interval samples in cloud software graphics, not an FPS distribution or real iPad performance certification'};result['passed']=True;page.screenshot(path=str(out/'final.png'));result['memoryScope']='Renderer geometry/texture allocations bounded over repeated tours. Heap samples include garbage-collection cycles; no absolute hardware memory certification.';save()
 except Exception:
  result['failure']=traceback.format_exc();save();raise
 finally:browser.close();server.shutdown();server.server_close()
print(json.dumps({'passed':result['passed'],'seconds':result['actualElapsedSeconds'],'samples':len(result['samples'])}))
