"""Targeted actual-UI transport capture, after the main GPU tests finish."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
import base64,hashlib,json,shutil,subprocess
import sys
root=Path('/workspace/Ein-Tag-als-Ranger');sys.path.insert(0,str(root/'tools'))
from module_graph import ModuleGraph
out=root/'work/compact-learning';site=root/'outputs/Ranger-Kompakt'
subprocess.run([sys.executable,str(root/'tools/verify-compact.py')],cwd=root,check=True,stdout=subprocess.PIPE)
g=ModuleGraph(root/'dist','compact/main.js');r={'scope':'Actual normal UI: autumn window, coast protocol advances six model seconds, then view same active jay mesh; no evidence/unlock/clock/state injection','sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'runtimeSourceHashes':{n:hashlib.sha256((root/'dist'/n).read_bytes()).hexdigest()for n in sorted(set(g.modules)|g.assets|{'compact/style.css','kompakt.html','icon.svg'})},'errors':[],'captures':[],'passed':False}
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(site)));Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright()as pw:
 opts={'headless':True}
 if shutil.which('chromium'):opts.update(executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 browser=pw.chromium.launch(**opts);page=browser.new_page(viewport={'width':800,'height':600});page.set_default_timeout(45000);page.on('pageerror',lambda e:r['errors'].append(str(e)))
 def close():
  if page.locator('#panel').evaluate('(e)=>e.open'):page.locator('#close').click()
 def view(id):
  close();page.locator('#menu-button').click();page.get_by_text('Referenzabschnitt prüfen',exact=True).click();page.locator('[data-view="'+id+'"]').click();page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision')
 try:
  page.goto(f'http://127.0.0.1:{server.server_port}/');page.wait_for_function('document.querySelector("#world").dataset.ready==="true"',timeout=120000);page.locator('#start').click();page.locator('#menu-button').click();page.locator('#season-window').select_option('autumn');close();view('coast');page.locator('#study').click();page.locator('#coast-protocol').click();close();view('oak');page.locator('#study').click();page.locator('[data-inspect][data-taxon="garrulus_glandarius"]').first.click();page.wait_for_function('document.querySelector("#specimen-canvas").dataset.ready==="true"');t=float(page.locator('#world').get_attribute('data-simulation-time'));assert 4<=t%20<14,'Photo must be in actual carry phase';encoded=page.evaluate('()=>new Promise(resolve=>requestAnimationFrame(()=>resolve(document.querySelector("#specimen-canvas").toDataURL("image/png"))))');raw=base64.b64decode(encoded.split(',',1)[1]);name='jay-carry-contact.png';(out/name).write_bytes(raw);assert not r['errors'];r['captures'].append({'file':name,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'source':'Actual magnified mesh at the running world carry phase','individualId':'compact-jay','simulationTime':t,'runId':page.locator('#world').get_attribute('data-run-id'),'window':'autumn','canvasOnly':True});r['passed']=True
 finally:
  browser.close();server.shutdown();server.server_close();(out/'jay-contact-result.json').write_text(json.dumps(r,indent=2)+'\n')
print(json.dumps(r))
