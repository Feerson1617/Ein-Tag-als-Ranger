"""Deterministic image comparison only; not a native journey or elapsed-time test.
Playwright controls the browser clock, while all scene changes use public UI.
No observer, ecology, evidence or model-clock variables are assigned.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
import argparse,json,hashlib,shutil,time,traceback
p=argparse.ArgumentParser();p.add_argument('--entry',required=True);p.add_argument('--output',required=True);p.add_argument('--compare');p.add_argument('--plant-only',action='store_true');a=p.parse_args()
root=Path(__file__).resolve().parents[1];entry=(root/a.entry).resolve();out=root/a.output;out.mkdir(parents=True,exist_ok=True)
r={'scope':'Controlled browser-clock reference pictures, NOT native travel/observation evidence. Same seed, summer, UI operations and exactly compared model timestamps. Unretouched runtime pixels.','htmlSHA256':hashlib.sha256(entry.read_bytes()).hexdigest(),'captures':[],'errors':[],'passed':False}
old=json.loads((root/a.compare).read_text())if a.compare else None
class H(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
s=ThreadingHTTPServer(('127.0.0.1',0),partial(H,directory=str(entry.parent)));Thread(target=s.serve_forever,daemon=True).start()
with sync_playwright()as pw:
 b=pw.chromium.launch(executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);page=b.new_page(viewport={'width':1200,'height':800});page.on('pageerror',lambda e:r['errors'].append(str(e)))
 def tick(ms=96):page.clock.run_for(ms)
 def click(selector):
  button=page.locator(selector).first;button.evaluate("b=>b.scrollIntoView({block:'center',behavior:'instant'})");rect=button.bounding_box();assert rect,selector
  page.mouse.click(rect['x']+rect['width']/2,rect['y']+rect['height']/2);tick()
 def shot(name):
  d=page.locator('#world').evaluate('c=>({...c.dataset})');file=name+'.png';page.screenshot(path=str(out/file));row={'file':file,'time':d['simulationTime'],'observer':json.loads(d['observer']),'window':json.loads(d['ecology'])['window'],'triangles':d['triangles'],'drawCalls':d['drawCalls'],'sha256':hashlib.sha256((out/file).read_bytes()).hexdigest()}
  if old:
   previous=next(x for x in old['captures']if x['file']==file)
   for key in ['time','observer','window']:assert row[key]==previous[key],(file,key,row[key],previous[key])
  r['captures'].append(row);print(file,row['time'],flush=True)
 try:
  page.clock.install(time=1000000);page.clock.pause_at(1000100);page.goto(f'http://127.0.0.1:{s.server_port}/{entry.name}')
  for _ in range(100):
   tick()
   if page.locator('#world').get_attribute('data-ready')=='true':break
   time.sleep(.05)
  assert page.locator('#world').get_attribute('data-ready')=='true';click('#start')
  views=['keilm'] if a.plant_only else ['comparison-start','comparison-woodruff','comparison-village','npc-ranger','comparison-ramp','deich-seaward','upper-marsh','lower-marsh','comparison-coast','keilm']
  for view in views:
   click('#menu-button');click('summary:text-is("Referenzabschnitt prüfen")')
   if not page.locator('[data-view="'+view+'"]').count():
    assert view=='deich-seaward';click('[data-view="comparison-ramp"]');rect=page.locator('#world').bounding_box();page.mouse.move(600,400);page.mouse.down();page.mouse.move(600+3.141592653589793/.003,400);page.mouse.up();tick()
   else:click('[data-view="'+view+'"]')
   shot(view)
  click('#study');button='[data-inspect][data-taxon="halimione_portulacoides"]';r['individualId']=page.locator(button).first.get_attribute('data-inspect');click(button);tick()
  for i in range(4):
   if i:
    rect=page.locator('#specimen-canvas').bounding_box();x=rect['x']+rect['width']/2;y=rect['y']+rect['height']/2;page.mouse.move(x,y);page.mouse.down();page.mouse.move(x+157.07963267948966,y,steps=10);page.mouse.up();tick()
   shot('keilmelde-rotation-'+str(i))
  assert not r['errors'];r['passed']=True
 except Exception:r['failure']=traceback.format_exc();raise
 finally:(out/'result.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');b.close();s.shutdown()
