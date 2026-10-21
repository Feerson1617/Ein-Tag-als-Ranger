from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,time
root=Path.cwd();server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root/'dist')));Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 page=b.new_page(viewport={'width':800,'height':500});page.set_default_timeout(90000)
 def route(r):
  source=(root/'dist/expedition.js').read_text()
  source+='\nwindow.focusDebug=()=>({focus:focused&&{id:focused.item.id,individualId:focused.item.individualId,aimY:focused.aimY},tracked:trackedPlant&&{id:trackedPlant.item.id,individualId:trackedPlant.item.individualId,aimY:trackedPlant.aimY},watch:missionUI.watchSeconds,watchKey:missionUI.watchKey,journal:journal.seconds,time:simulations.get("forest").time,lockMode,observer:{...observer},camera:camera.position.toArray(),hidden:document.hidden,panel:$("panel").open});\n'
  r.fulfill(status=200,content_type='application/javascript',body=source)
 page.route('**/expedition.js*',route)
 page.goto(f'http://127.0.0.1:{server.server_port}/index.html',timeout=120000);page.wait_for_function('!document.getElementById("start").disabled',timeout=180000)
 page.locator('.welcome-controls > summary').click();page.locator('#render-mode').select_option('smooth');page.locator('#mode-missions').click();page.locator('#start').click();page.locator('[data-mission="m1"]').click();page.locator('#mission-travel').click()
 rows=[]
 for taxon in ['galium_odoratum','urtica_dioica','fagus_sylvatica']:
  page.locator('#missions').click();page.locator('summary').filter(has_text='Fokustaxa im Gebiet aufsuchen').click();page.locator(f'[data-focus-taxon="{taxon}"]').click()
  start=time.monotonic()
  while time.monotonic()-start<120:
   data=page.evaluate('focusDebug()');data.update(taxon=taxon,wall=round(time.monotonic()-start,2));rows.append(data);print(json.dumps(data),flush=True)
   if page.locator('#field-note').is_enabled():break
   page.wait_for_timeout(1000)
  if page.locator('#field-note').is_disabled():page.screenshot(path=str(root/'work/diagnostic-m1-failure.png'),timeout=90000);break
  page.locator('#field-note').click()
 (root/'work/diagnostic-m1.json').write_text(json.dumps(rows,indent=2));b.close()
server.shutdown()
