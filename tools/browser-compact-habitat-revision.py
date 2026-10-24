"""Compare real same-camera habitat renders and active rotated plant diagnostics.

Requires two recorded baseline directories from the unchanged prior runtime:
--baseline contains the ten comparison cameras; --baseline-fixed-gap contains
the fixed public oak-observer image aimed at the light gap. Walking screenshots
remain separate from exact-camera comparisons. No application state injection.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
from module_graph import ModuleGraph
from compact_runtime import audit_standalone
import argparse,json,shutil,hashlib,traceback,subprocess,time
p=argparse.ArgumentParser();p.add_argument('--site',default='outputs');p.add_argument('--entry',default='Ranger-Kompakt.html');p.add_argument('--output',default='work/compact-habitat-revision');p.add_argument('--baseline',required=True);p.add_argument('--baseline-fixed-gap',required=True);a=p.parse_args();root=Path(__file__).resolve().parents[1];out=root/a.output;out.mkdir(parents=True,exist_ok=True)
audit_standalone(root,root/a.site/a.entry);g=ModuleGraph(root/'dist','compact/main.js');r={'passed':False,'checks':[],'captures':[],'errors':[],'scope':'Own reconstruction, fresh f921 baseline in separate unchanged worktree, same own camera positions; original review camera data unavailable. Actual standalone WebGL, no physical iPad check.','htmlSHA256':hashlib.sha256((root/a.site/a.entry).read_bytes()).hexdigest(),'runtimeSourceHashes':{n:hashlib.sha256((root/'dist'/n).read_bytes()).hexdigest()for n in sorted(set(g.modules)|g.assets|{'kompakt.html','compact/style.css','icon.svg'})}}
baseline=json.loads((Path(a.baseline)/'result.json').read_text());fixed_baseline=json.loads((Path(a.baseline_fixed_gap)/'result.json').read_text())
assert baseline.get('passed')and fixed_baseline.get('passed'),'Both baselines must be complete successful real renders'
assert baseline['htmlSHA256']==fixed_baseline['htmlSHA256']and baseline['runtimeSourceHashes']==fixed_baseline['runtimeSourceHashes'],'Fixed-gap baseline must use the same unchanged runtime'
r['viewport']={'width':800,'height':600};r['baselineHTMLSHA256']=baseline['htmlSHA256'];r['baselineSources']={'comparisons':str(Path(a.baseline)/'result.json'),'fixedGap':str(Path(a.baseline_fixed_gap)/'result.json')}
class H(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
s=ThreadingHTTPServer(('127.0.0.1',0),partial(H,directory=str(root/a.site)));Thread(target=s.serve_forever,daemon=True).start()
def save():(out/'result.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
def data(page):return page.locator('#world').evaluate('(e)=>({...e.dataset})')
def view(page,id):
 page.locator('#menu-button').click();page.get_by_text('Referenzabschnitt prüfen',exact=True).click();page.locator('[data-view="'+id+'"]').click();page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision')
def shot(page,id):
 page.screenshot(path=str(out/(id+'.png')));d=data(page);r['captures'].append({'file':id+'.png','observer':json.loads(d['observer']),'simulationTime':d['simulationTime'],'triangles':d.get('triangles'),'frameMs':d.get('frameMs'),'drawCalls':d.get('drawCalls'),'heapBytes':d.get('heapBytes'),'graphicsProfile':d.get('graphicsProfile'),'ecology':json.loads(d['ecology'])});save()
with sync_playwright()as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);r['browser']=b.version;c=b.new_context(viewport={'width':800,'height':600},accept_downloads=True);page=c.new_page();page.set_default_timeout(45000);page.on('pageerror',lambda e:r['errors'].append(str(e)))
 try:
  page.goto(f'http://127.0.0.1:{s.server_port}/{a.entry}');page.wait_for_selector('#world[data-ready=true]',timeout=120000);page.locator('#start').click()
  for id in ['start','woodruff','nettle','wood','village','ramp','salt-shrub','salt-segments','salt-grass','coast']:
   view(page,'comparison-'+id);old=next(x for x in baseline['captures']if x['file']==id+'.png');current=json.loads(data(page)['observer'])
   # Ground changes alter automatic target pitch. Align the old orientation by
   # ordinary mouse input; eye height continues to follow the actual new ground.
   if abs(current['pitch']-old['observer']['pitch'])>1e-7:
    page.mouse.move(400,300);page.mouse.down();page.mouse.move(400,300+(current['pitch']-old['observer']['pitch'])/.0025);page.mouse.up();page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision')
   shot(page,id);assert all(abs(old['observer'][k]-r['captures'][-1]['observer'][k])<1e-5 for k in ['x','z','yaw','pitch']),id
  r['checks'].append('Ten same-own-XZ/yaw/pitch/viewport before/after pairs; eye height follows changed terrain, including old Keilmelde position');save();print('PASS same cameras',flush=True)
  view(page,'start');before=json.loads(data(page)['observer']);t=float(data(page)['simulationTime']);page.keyboard.down('w');page.wait_for_function('(t)=>Number(document.querySelector("#world").dataset.simulationTime)>t+.7',arg=t,timeout=120000);page.keyboard.up('w');shot(page,'forest-normal-walk');after=json.loads(data(page)['observer']);assert ((after['x']-before['x'])**2+(after['z']-before['z'])**2)**.5>.7;r['checks'].append('Normal keyboard walking in dense forest');save()
  # Additional habitat views use only existing visit buttons and real look/walk
  # input. They are not passed off as missing independent-review cameras.
  import math
  for location,name,target,walk_seconds in [('oak','light-gap',(-37,-21),3),('flowers','nutrient-edge',(-29,5),0)]:
   view(page,location);d=data(page);o=json.loads(d['observer']);wanted=math.atan2(-(target[0]-o['x']),-(target[1]-o['z']));delta=(o['yaw']-wanted+math.pi)%(2*math.pi)-math.pi
   while abs(delta)>1e-6:
    part=max(-.6,min(.6,delta));page.mouse.move(400,300);page.mouse.down();page.mouse.move(400+part/.003,300);page.mouse.up();delta-=part
   if location=='oak':
    o=json.loads(data(page)['observer']);page.mouse.move(400,300);page.mouse.down();page.mouse.move(400,300+(o['pitch']+.12)/.0025);page.mouse.up();page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision');shot(page,'habitat-light-gap-fixed');fixed=next(x for x in fixed_baseline['captures']if x['file']=='habitat-light-gap-fixed.png')['observer'];assert all(abs(fixed[k]-r['captures'][-1]['observer'][k])<1e-5 for k in ['x','z','yaw','pitch']);r['checks'].append('Light gap additional exact same fixed observer/orientation as freshly rendered f921, separate from normal walking')
   if walk_seconds:
    t=float(data(page)['simulationTime']);page.keyboard.down('w');page.wait_for_function('(a)=>Number(document.querySelector("#world").dataset.simulationTime)>a.t+a.seconds',arg={'t':t,'seconds':walk_seconds},timeout=120000);page.keyboard.up('w')
   # A modest eye-level look, through ordinary mouse input, shows the stand.
   o=json.loads(data(page)['observer']);page.mouse.move(400,300);page.mouse.down();page.mouse.move(400,300+(o['pitch']+.12)/.0025);page.mouse.up();page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision');shot(page,'habitat-'+name)
  r['checks'].append('Additional light-gap and nutrient-edge habitat images reached with normal look/walk input; not independent original cameras');save()
  # Same concrete stand in both actual tide states, using existing labelled controls.
  view(page,'coast');page.locator('#study').click();page.locator('#next-low').click();page.locator('#close').click();view(page,'keilm');shot(page,'keilm-low');view(page,'coast');page.locator('#study').click();page.locator('#next-high').click();page.locator('#close').click();view(page,'keilm');shot(page,'keilm-high');r['checks'].append('Same new concrete Keilmelde stand rendered at low/high model water; no position changes')
  for tide in ['low','high']:
   view(page,'coast');page.locator('#study').click();page.locator('#next-'+tide).click();page.locator('#close').click();view(page,'lower-marsh');o=json.loads(data(page)['observer']);page.mouse.move(400,300);page.mouse.down();page.mouse.move(400,300+(o['pitch']+.16)/.0025);page.mouse.up();page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision');shot(page,'andel-'+tide)
  r['checks'].append('Andel actual ordinary low/high water, identical fixed observer and angle, no individual or water injection');save()
  # Actual active meshes, including blind K1 labels and both orientations.
  import base64
  for location,taxon in [('woodruff','galium_odoratum'),('woodruff','fagus_sylvatica'),('nettle','urtica_dioica'),('oak','quercus_robur')]:
   view(page,location);page.locator('#study').click();button=page.locator('[data-inspect][data-taxon="'+taxon+'"]').first;assert button.is_visible()and button.is_enabled();individual=button.get_attribute('data-inspect');button.evaluate("b=>b.scrollIntoView({block:'center',behavior:'instant'})");hit=button.evaluate('''b=>{const r=b.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,e=document.elementFromPoint(x,y);return {x,y,hit:b===e||b.contains(e)};}''');assert hit['hit'];page.mouse.click(hit['x'],hit['y']);page.wait_for_selector('#specimen-canvas[data-ready=true]');page.wait_for_function('!document.querySelector("#inspection-record").disabled')
   assert all(name not in page.locator('#panel-body').inner_text()for name in ['Waldmeister','Brennnessel','Rotbuche','Stieleiche'])
   for orientation in ['standard','rotated']:
    if orientation=='rotated':
     box=page.locator('#specimen-canvas').bounding_box();x=box['x']+box['width']/2;y=box['y']+box['height']/2;page.mouse.move(x,y);page.mouse.down();page.mouse.move(x+100,y-24,steps=10);assert page.locator('#inspection-record').is_disabled();page.mouse.up();page.wait_for_function('!document.querySelector("#inspection-record").disabled')
    encoded=page.evaluate('()=>new Promise(resolve=>requestAnimationFrame(()=>resolve(document.querySelector("#specimen-canvas").toDataURL("image/png"))))');raw=base64.b64decode(encoded.split(',',1)[1]);filename='diagnostic-'+taxon+'-'+orientation+'.png';(out/filename).write_bytes(raw);r['captures'].append({'file':filename,'taxon':taxon,'individualId':individual,'orientation':orientation,'source':'actual active individual mesh, rendered in the normal public magnified inspection','sha256':hashlib.sha256(raw).hexdigest()});save()
   page.locator('#close').click()
  r['checks'].append('K1 diagnostics: four actual blind active individuals, standard and pointer-rotated views; rotation cancels the active observation interval, no automatic evidence')
  assert not r['errors'];r['passed']=True;save();print(json.dumps({'passed':True,'checks':r['checks'],'captures':len(r['captures'])},ensure_ascii=False),flush=True)
 except Exception as e:r['failure']=str(e);r['traceback']=traceback.format_exc();save();page.screenshot(path=str(out/'failure.png'));raise
 finally:b.close();s.shutdown();s.server_close()
