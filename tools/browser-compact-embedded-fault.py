"""Actual startup failure of an intentionally corrupt embedded GLB.
The regular web test aborts an external .glb request, which does not exist in
standalone HTML. This supplements that unchanged test; no product monkeypatch.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
from compact_runtime import audit_standalone
import hashlib,json,shutil,traceback
root=Path(__file__).resolve().parents[1];out=root/'work/visual/embedded-fault';out.mkdir(parents=True,exist_ok=True);r={'passed':False,'htmlAudit':audit_standalone(root,root/'outputs/Ranger-Kompakt.html'),'scope':'Test-only replacement of embedded GLB blob bytes before normal boot. Application startup and preservation assertions are unchanged; the shipped application is not patched.'}
class H(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
s=ThreadingHTTPServer(('127.0.0.1',0),partial(H,directory=str(root/'outputs')));Thread(target=s.serve_forever,daemon=True).start()
with sync_playwright()as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);page=b.new_page(viewport={'width':800,'height':600})
 try:
  page.add_init_script("""localStorage.setItem('evolutionswald-fieldjournal-v2','legacy-sentinel');localStorage.setItem('feldbuch-quests-v1','quest-sentinel');window.__faultedGLBs=0;const create=URL.createObjectURL.bind(URL);URL.createObjectURL=function(blob){if(blob.type==='model/gltf-binary'){window.__faultedGLBs++;return create(new Blob([new Uint8Array([0,0,0,0])],{type:blob.type}));}return create(blob);};""")
  page.goto(f'http://127.0.0.1:{s.server_port}/Ranger-Kompakt.html');page.wait_for_function('document.querySelector("#loading").textContent.includes("konnte nicht gestartet")',timeout=120000)
  assert page.evaluate('window.__faultedGLBs')==2
  for key,value in [('evolutionswald-fieldjournal-v2','legacy-sentinel'),('feldbuch-quests-v1','quest-sentinel')]:assert page.evaluate('(k)=>localStorage.getItem(k)',key)==value
  assert page.locator('#world').get_attribute('data-ready')!='true';r.update(passed=True,corruptedGLBs=2,message=page.locator('#loading').inner_text(),oldStorageUnchanged=True);page.screenshot(path=str(out/'expected-startup-failure.png'));r['screenshotSHA256']=hashlib.sha256((out/'expected-startup-failure.png').read_bytes()).hexdigest()
 except Exception:r['failure']=traceback.format_exc();raise
 finally:(out/'result.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');b.close();s.shutdown();s.server_close()
