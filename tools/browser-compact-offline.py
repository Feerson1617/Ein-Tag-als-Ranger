"""Offline operation after serving the one HTML locally; optional direct-file test.
Managed Chromium may prohibit file:// through administrator policy. Never
disable that policy or label the HTTP bootstrap as a successful file test.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
import argparse
from playwright.sync_api import sync_playwright
from compact_runtime import audit_standalone
from compact_graphics_audit import observe_graphics_errors
import hashlib,json,shutil,subprocess,traceback
parser=argparse.ArgumentParser();parser.add_argument('--direct-file',action='store_true');args=parser.parse_args()
root=Path(__file__).resolve().parents[1];entry=root/'outputs/Ranger-Kompakt.html';out=root/'work/visual/offline-final';out.mkdir(parents=True,exist_ok=True);r={'passed':False,'htmlAudit':audit_standalone(root,entry),'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'scope':'Direct file:// test'if args.direct_file else'Single delivered HTML served once from localhost; browser set offline immediately after DOMContentLoaded, before tool/detail use. No asset/network responses mocked. Not a successful file:// test.','errors':[],'requests':[]}
class H(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=None
if args.direct_file:url=entry.as_uri()
else:
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(H,directory=str(entry.parent)));Thread(target=server.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{server.server_port}/{entry.name}'
with sync_playwright()as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);c=b.new_context(viewport={'width':800,'height':600},offline=args.direct_file);page=c.new_page();page.set_default_timeout(60000);page.on('pageerror',lambda e:r['errors'].append(str(e)));page.on('request',lambda q:r['requests'].append(q.url));observe_graphics_errors(page,r['errors'])
 def contrast(selector):
  page.wait_for_function('''selector=>{const s=getComputedStyle(document.querySelector(selector));const luminance=c=>{const a=c.match(/[0-9.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return a[0]*.2126+a[1]*.7152+a[2]*.0722};const a=luminance(s.color),b=luminance(s.backgroundColor);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5}''',arg=selector,timeout=15000)
  colors=page.locator(selector).evaluate('(e)=>{const s=getComputedStyle(e);return{foreground:s.color,background:s.backgroundColor,text:e.textContent}}')
  def luminance(color):
   import re
   values=[float(v)/255 for v in re.findall(r'[0-9.]+',color)[:3]];linear=[v/12.92 if v<=.04045 else((v+.055)/1.055)**2.4 for v in values];return sum(v*w for v,w in zip(linear,[.2126,.7152,.0722]))
  fg,bg=luminance(colors['foreground']),luminance(colors['background']);ratio=(max(fg,bg)+.05)/(min(fg,bg)+.05);assert ratio>=4.5,(selector,colors,ratio);r.setdefault('activeButtonContrast',[]).append({'selector':selector,**colors,'ratio':ratio});return ratio
 try:
  page.goto(url,wait_until='domcontentloaded');r['readyWhenOfflineActivated']=page.locator('#world').get_attribute('data-ready');c.set_offline(True);page.wait_for_selector('#world[data-ready=true]',timeout=120000);page.locator('#start').click();assert page.locator('#count').inner_text()=='0'
  for button,tool,fov in [('binocular','binocular','18'),('magnifier','magnifier','28')]:
   page.locator('#'+button).click();page.locator('#'+button).hover();contrast('#'+button);page.screenshot(path=str(out/('active-'+button+'.png')));page.wait_for_function('(a)=>{const c=document.querySelector("#world");return c.dataset.renderTool===a.tool&&c.dataset.renderFov===a.fov;}',arg={'tool':tool,'fov':fov})
  page.locator('#magnifier').click();page.locator('#study').click();page.locator('[data-inspect][data-taxon="galium_odoratum"]').first.click();page.wait_for_selector('#specimen-canvas[data-ready=true]');page.wait_for_function('!document.querySelector("#inspection-record").disabled');assert page.locator('#count').inner_text()=='0';page.locator('#close').click()
  page.set_viewport_size({'width':600,'height':375});page.wait_for_function('document.querySelector("#world").width===600');page.locator('#brisk').click();page.mouse.move(300,190);assert page.locator('#brisk').get_attribute('aria-pressed')=='true';contrast('#brisk');page.screenshot(path=str(out/'active-brisk.png'));page.locator('#brisk').click()
  page.locator('#menu-button').click();page.get_by_text('Referenzabschnitt prüfen',exact=True).click();page.locator('[data-view="npc-ranger"]').click();page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision');bounds=page.locator('#study').evaluate('(b)=>{const q=document.createRange();q.selectNodeContents(b);const t=q.getBoundingClientRect(),r=b.getBoundingClientRect();return{text:b.textContent,textLeft:t.left,textRight:t.right,buttonLeft:r.left,buttonRight:r.right,scrollWidth:b.scrollWidth,clientWidth:b.clientWidth}}');assert bounds['textLeft']>=bounds['buttonLeft']-.5 and bounds['textRight']<=bounds['buttonRight']+.5,bounds;r['smallViewportNPCButton']=bounds;page.screenshot(path=str(out/'small-npc-button.png'))
  assert not r['errors'];assert all(q==url or q.startswith(('blob:','data:'))for q in r['requests']);r['checks']=['Actual WebGL and observation use with browser offline after single-document bootstrap','Both optical tools render','Actual selected-individual detail and timed observation remain available','No automatic evidence; no HTTP(S) request beyond the single local HTML bootstrap'];page.screenshot(path=str(out/'offline-start.png'));r['passed']=True
 except Exception:r['failure']=traceback.format_exc();raise
 finally:
  (out/'result.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');b.close()
  if server:server.shutdown();server.server_close()
