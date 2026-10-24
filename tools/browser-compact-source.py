import argparse
p=argparse.ArgumentParser();p.add_argument('--output',default='work/compact-source');a=p.parse_args()
"""Actual maintained source-entry smoke, distinct from web/standalone testing."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
from module_graph import ModuleGraph
import json,hashlib,shutil,subprocess,traceback
root=Path(__file__).resolve().parents[1];out=root/a.output;out.mkdir(parents=True,exist_ok=True);g=ModuleGraph(root/'dist','compact/main.js');r={'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'entry':'dist/kompakt.html','runtimeSourceHashes':{n:hashlib.sha256((root/'dist'/n).read_bytes()).hexdigest()for n in sorted(set(g.modules)|g.assets|{'kompakt.html','compact/style.css','icon.svg'})},'checks':[],'errors':[],'passed':False,'scope':'Actual source entry, Chromium software WebGL; no physical device certification'}
class H(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
s=ThreadingHTTPServer(('127.0.0.1',0),partial(H,directory=str(root/'dist')));Thread(target=s.serve_forever,daemon=True).start();origin=f'http://127.0.0.1:{s.server_port}'
def save():(out/'result.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
with sync_playwright()as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);c=b.new_context(viewport={'width':800,'height':600});page=c.new_page();page.set_default_timeout(45000);page.on('pageerror',lambda e:r['errors'].append(str(e)));requests=[];page.on('request',lambda q:requests.append(q.url))
 try:
  response=page.goto(origin+'/kompakt.html');assert response.status==200;page.wait_for_selector('#world[data-ready=true]',timeout=120000);page.locator('#start').click();assert not r['errors'];assert page.locator('#count').inner_text()=='0';r['checks'].append('Maintained source entry boots actual WebGL');save()
  for button,tool,fov in [('binocular','binocular','18'),('magnifier','magnifier','28')]:
   page.locator('#'+button).click();page.wait_for_function('(a)=>{const c=document.querySelector("#world");return c.dataset.renderTool===a.tool&&c.dataset.renderFov===a.fov;}',arg={'tool':tool,'fov':fov})
  page.locator('#magnifier').click();page.locator('#study').click();page.locator('[data-inspect][data-taxon="galium_odoratum"]').first.click();page.wait_for_selector('#specimen-canvas[data-ready=true]');page.wait_for_function('!document.querySelector("#inspection-record").disabled');assert page.locator('#count').inner_text()=='0';page.locator('#close').click();r['checks'].append('Source tools and real timed magnified observation; no automatic evidence');r['requests']=requests;assert all(q.startswith(origin)or q.startswith(('blob:','data:'))for q in requests);assert not r['errors'];page.screenshot(path=str(out/'source.png'));r['passed']=True;save();print(json.dumps({'passed':True,'checks':r['checks']}),flush=True)
 except Exception as e:r['failure']=str(e);r['traceback']=traceback.format_exc();save();raise
 finally:b.close();s.shutdown();s.server_close()
