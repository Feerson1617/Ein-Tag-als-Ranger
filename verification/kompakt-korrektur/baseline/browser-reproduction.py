from pathlib import Path
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright
import json,shutil,hashlib,time
root=Path('/workspace/Ein-Tag-als-Ranger');out=root/'work/qa-correction/baseline';result={'sourceCommit':'eece965c2afdd367ab9a610e0e05d09e9c706388','scope':'Actual unchanged standalone HTML; own reconstructed cases, original archive inaccessible','captures':[],'checks':[],'errors':[]}
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(root/'outputs')));Thread(target=server.serve_forever,daemon=True).start()
def save():(out/'browser-baseline.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
with sync_playwright()as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);ctx=b.new_context(viewport={'width':800,'height':600},accept_downloads=True);p=ctx.new_page();p.set_default_timeout(45000);p.on('pageerror',lambda e:result['errors'].append(str(e)))
 p.goto(f'http://127.0.0.1:{server.server_port}/Ranger-Kompakt.html');p.wait_for_function('document.querySelector("#world").dataset.ready==="true"',timeout=120000);p.locator('#start').click();result['htmlSHA256']=hashlib.sha256((root/'outputs/Ranger-Kompakt.html').read_bytes()).hexdigest();save()
 for view in ['start','woodruff','nettle','wood','village','ramp','salt-shrub','salt-segments','salt-grass','coast']:
  p.locator('#menu-button').click();p.get_by_text('Referenzabschnitt prüfen',exact=True).click();p.locator(f'[data-view="{view}"]').click();p.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision');p.wait_for_timeout(500)
  p.screenshot(path=str(out/(view+'.png')));result['captures'].append({'file':view+'.png','observer':json.loads(p.locator('#world').get_attribute('data-observer')),'simulationTime':p.locator('#world').get_attribute('data-simulation-time')});save();print('CAPTURE',view,flush=True)
 for fixture in ['repro-impossible-coordinates.json','repro-invalid-top-level-features.json']:
  p.locator('#journal-button').click();p.locator('#import').set_input_files(str(out/fixture));p.locator('#apply-import').wait_for();p.locator('#apply-import').click();row={'file':fixture,'acceptedByActualHTML':True,'persisted':json.loads(p.evaluate("localStorage.getItem('ranger-compact-fieldbook-v2')"))};result['checks'].append(row);p.locator('#close').click()
  if 'features' in fixture:
   p.locator('#objective').click();p.locator('#panel [data-mission="K1"]').click();row['renderedError']=p.locator('#learning-status').inner_text();assert 'includes is not a function'in row['renderedError'];p.screenshot(path=str(out/'F01-import-crash.png'))
  save();print('REPRO',fixture,flush=True)
 b.close();server.shutdown();server.server_close();result['completed']=True;save()
