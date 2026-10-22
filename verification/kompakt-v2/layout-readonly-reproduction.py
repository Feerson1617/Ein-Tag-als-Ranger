from pathlib import Path
from playwright.sync_api import sync_playwright
import hashlib,json,shutil
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from threading import Thread
root=Path('/workspace/Ein-Tag-als-Ranger');rows=[]
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(root/'outputs/Ranger-Kompakt')));Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright()as pw:
 opts={'headless':True}
 if shutil.which('chromium'):opts.update(executable_path=shutil.which('chromium'),args=['--no-sandbox'])
 browser=pw.chromium.launch(**opts)
 page=browser.new_page()
 # Deliberate DOM-only fixture: actual built HTML/CSS, runtime blocked. No
 # simulated evidence, world, clocks, or game population are instantiated.
 page.route('**/*.js',lambda route:route.abort());page.goto(f'http://127.0.0.1:{server.server_port}/')
 for w,h in [(800,500),(800,600),(1080,810),(810,1080)]:
  page.set_viewport_size({'width':w,'height':h});page.locator('#study').evaluate('(e)=>e.hidden=false')
  layout=page.evaluate("()=>{const c=getComputedStyle(document.querySelector('#performance-status'));return {warningTop:parseFloat(c.top)+parseFloat(c.marginTop),controlBottom:Math.max(...['#objective','#study'].map(s=>document.querySelector(s).getBoundingClientRect().bottom))};}")
  assert layout['warningTop']>=layout['controlBottom'],layout
  page.locator('#performance-status').evaluate("e=>{e.hidden=false;e.textContent='Die Darstellung läuft langsam. Unter P kannst du das Tabletprofil wählen. Die Modellbewegung ist verlangsamt; aktive Sichtungszeit wird getrennt gemessen.';}")
  box=page.locator('#performance-status').bounding_box()
  for selector in ['#objective','#study']:
   other=page.locator(selector).bounding_box();assert box['y']>=other['y']+other['height'],selector
  rows.append({'viewport':[w,h],**layout,'visibleWarningTop':box['y'],'passed':True})
 page.set_viewport_size({'width':800,'height':600});page.add_style_tag(content='#performance-status{top:110px}')
 old=page.evaluate("()=>({warningTop:document.querySelector('#performance-status').getBoundingClientRect().top,controlBottom:document.querySelector('#study').getBoundingClientRect().bottom})");assert old['warningTop']<old['controlBottom'],'Original overlap must reproduce'
 browser.close()
r={'scope':'DOM-only layout fixture using actual built HTML/CSS; runtime deliberately blocked, contextual controls shown as UI fixtures. No actual 3D screenshot or game-state/evidence injection.','cssSHA256':hashlib.sha256((root/'dist/compact/style.css').read_bytes()).hexdigest(),'checks':rows,'negativeOriginalTop110':old,'passed':True};(root/'work/compact-learning/layout-result.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))

server.shutdown();server.server_close()
