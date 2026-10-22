"""Own same-camera comparisons and actual world-speaker encounters; no state injection."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
from module_graph import ModuleGraph
from compact_runtime import audit_standalone
import argparse,json,shutil,hashlib,traceback,subprocess,time
p=argparse.ArgumentParser();p.add_argument('--site',default='outputs');p.add_argument('--entry',default='Ranger-Kompakt.html');p.add_argument('--output',default='work/qa-correction/phase3-browser');a=p.parse_args();root=Path(__file__).resolve().parents[1];out=root/a.output;out.mkdir(parents=True,exist_ok=True)
audit_standalone(root,root/a.site/a.entry);g=ModuleGraph(root/'dist','compact/main.js');r={'passed':False,'checks':[],'captures':[],'errors':[],'scope':'Own reconstruction, baseline cameras from own eece965 captures; original review camera data unavailable. Actual standalone WebGL, no physical iPad check.','htmlSHA256':hashlib.sha256((root/a.site/a.entry).read_bytes()).hexdigest(),'runtimeSourceHashes':{n:hashlib.sha256((root/'dist'/n).read_bytes()).hexdigest()for n in sorted(set(g.modules)|g.assets|{'kompakt.html','compact/style.css','icon.svg'})}}
class H(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
s=ThreadingHTTPServer(('127.0.0.1',0),partial(H,directory=str(root/a.site)));Thread(target=s.serve_forever,daemon=True).start()
def save():(out/'result.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
def data(page):return page.locator('#world').evaluate('(e)=>({...e.dataset})')
def view(page,id):
 page.locator('#menu-button').click();page.get_by_text('Referenzabschnitt prüfen',exact=True).click();page.locator('[data-view="'+id+'"]').click();page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision')
def shot(page,id):
 page.screenshot(path=str(out/(id+'.png')));d=data(page);r['captures'].append({'file':id+'.png','observer':json.loads(d['observer']),'simulationTime':d['simulationTime'],'triangles':d.get('triangles'),'frameMs':d.get('frameMs')});save()
with sync_playwright()as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);r['browser']=b.version;c=b.new_context(viewport={'width':800,'height':600},accept_downloads=True);page=c.new_page();page.set_default_timeout(45000);page.on('pageerror',lambda e:r['errors'].append(str(e)))
 try:
  page.goto(f'http://127.0.0.1:{s.server_port}/{a.entry}');page.wait_for_selector('#world[data-ready=true]',timeout=120000);page.locator('#start').click()
  baseline=json.loads((root/'verification/kompakt-korrektur/baseline/browser-baseline.json').read_text())
  for id in ['start','woodruff','nettle','wood','village','ramp','salt-shrub','salt-segments','salt-grass','coast']:
   view(page,'comparison-'+id);old=next(x for x in baseline['captures']if x['file']==id+'.png');current=json.loads(data(page)['observer'])
   # Ground changes alter automatic target pitch. Align the old orientation by
   # ordinary mouse input; eye height continues to follow the actual new ground.
   if abs(current['pitch']-old['observer']['pitch'])>1e-7:
    page.mouse.move(400,300);page.mouse.down();page.mouse.move(400,300+(current['pitch']-old['observer']['pitch'])/.0025);page.mouse.up();page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision')
   shot(page,id);assert all(abs(old['observer'][k]-r['captures'][-1]['observer'][k])<1e-5 for k in ['x','z','yaw','pitch']),id
  r['checks'].append('Ten same-own-XZ/yaw/pitch/viewport before/after pairs; eye height follows changed terrain, including old Keilmelde position');save();print('PASS same cameras',flush=True)
  view(page,'start');before=json.loads(data(page)['observer']);t=float(data(page)['simulationTime']);page.keyboard.down('w');page.wait_for_function('(t)=>Number(document.querySelector("#world").dataset.simulationTime)>t+.7',arg=t,timeout=120000);page.keyboard.up('w');shot(page,'forest-normal-walk');after=json.loads(data(page)['observer']);assert ((after['x']-before['x'])**2+(after['z']-before['z'])**2)**.5>.7;r['checks'].append('Normal keyboard walking in dense forest');save()
  for id in ['ranger','local','coastal']:
   view(page,'npc-'+id);d=json.loads(data(page)['nearestSpeaker']);assert d['id']==id and d['distance']<=2.7;shot(page,'npc-'+id);assert 'sprechen' in page.locator('#study').inner_text();page.locator('#study').click();assert page.locator('#remember-perspective').is_visible();page.locator('#remember-perspective').click();assert 'vermerkt' in page.locator('#learning-status').inner_text();shot(page,'dialogue-'+id);page.locator('#close').click()
  page.locator('#journal-button').click()
  with page.expect_download()as d:page.locator('#export').click()
  d.value.save_as(out/'dialogue-fieldbook.json');book=json.loads((out/'dialogue-fieldbook.json').read_text());assert {x['speakerId']for x in book['learning']['perspectives']}=={'ranger','local','coastal'};assert not book['records'];page.locator('#close').click();view(page,'coast');assert 'sprechen' not in page.locator('#study').inner_text();r['checks'].append('All three real proximal world speakers, persisted model-dialogue context, no observation credit or remote interaction');save()
  # Same concrete stand in both actual tide states, using existing labelled controls.
  view(page,'coast');page.locator('#study').click();page.locator('#next-low').click();page.locator('#close').click();view(page,'keilm');shot(page,'keilm-low');view(page,'coast');page.locator('#study').click();page.locator('#next-high').click();page.locator('#close').click();view(page,'keilm');shot(page,'keilm-high');r['checks'].append('Same new concrete Keilmelde stand rendered at low/high model water; no position changes');assert not r['errors'];r['passed']=True;save();print(json.dumps({'passed':True,'checks':r['checks'],'captures':len(r['captures'])},ensure_ascii=False),flush=True)
 except Exception as e:r['failure']=str(e);r['traceback']=traceback.format_exc();save();page.screenshot(path=str(out/'failure.png'));raise
 finally:b.close();s.shutdown();s.server_close()
