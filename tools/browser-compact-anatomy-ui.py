"""Actual enlarged live lenses and touch inspection at small LMS dimensions.
Reference camera and labelled model steps are UI fixtures, not native travel or
unaccelerated earned-event evidence (tested separately by native acceptance).
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
import argparse,json,hashlib,shutil,traceback
p=argparse.ArgumentParser();p.add_argument('--output',required=True);a=p.parse_args();root=Path(__file__).resolve().parents[1];out=root/a.output;out.mkdir(parents=True,exist_ok=True);entry=root/'outputs/Ranger-Kompakt.html'
r={'passed':False,'htmlSHA256':hashlib.sha256(entry.read_bytes()).hexdigest(),'scope':__doc__,'checks':[],'errors':[],'physicalIPad':'NICHT GEPRÜFT','realItslearning':'NICHT GEPRÜFT'}
class H(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(H,directory=str(entry.parent)));Thread(target=server.serve_forever,daemon=True).start()
def save():(out/'result.json').write_text(json.dumps(r,ensure_ascii=False,indent=2))
with sync_playwright()as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);ctx=b.new_context(viewport={'width':600,'height':375},has_touch=True);page=ctx.new_page();page.set_default_timeout(60000);page.on('pageerror',lambda e:r['errors'].append(str(e)))
 def view(key):
  if page.locator('#panel').is_visible():page.locator('#close').click()
  page.locator('#menu-button').click();page.get_by_text('Referenzabschnitt prüfen',exact=True).click();page.locator('[data-view="'+key+'"]').click();page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision')
 def shot(name):
  f=out/(name+'.png');page.screenshot(path=str(f));return {'file':f.name,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()}
 try:
  page.goto(f'http://127.0.0.1:{server.server_port}/{entry.name}');page.wait_for_selector('#world[data-ready=true]',timeout=120000);page.locator('#start').click();page.locator('#menu-button').click();page.locator('#quality').select_option('tablet');page.locator('#resume').click()
  for width,height in [(600,375),(768,1024),(600,300)]:
   page.set_viewport_size({'width':width,'height':height});view('woodruff');page.locator('#study').click();page.locator('[data-inspect][data-taxon="galium_odoratum"]').first.click();page.locator('#inspection-expand').click();canvas=page.locator('#specimen-canvas');canvas.scroll_into_view_if_needed();page.wait_for_function('document.querySelector("#specimen-canvas").dataset.ready==="true"');rect=canvas.bounding_box();assert rect['height']>=height*.60
   cdp=ctx.new_cdp_session(page);x=rect['x']+rect['width']*.4;y=max(10,min(height-20,rect['y']+rect['height']*.5));cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y,'id':1}]});cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x+70,'y':y-25,'id':1}]});cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});assert page.locator('#inspection-record').is_disabled();r['checks'].append({'case':'expanded same-individual inspection; actual CDP touch drag resets evidence clock','viewport':[width,height],'rect':rect,'capture':shot(f'inspection-{width}x{height}')});page.locator('#close').click()
   view('outlook');page.locator('#study').click();page.locator('#new-observation-context').click();page.locator('[data-behavior="compact-spoonbill"]').click();page.locator('#behavior-detail').click();page.locator('#behavior-step-size').select_option('0.25')
   for _ in range(32):
    page.locator('#behavior-step').click()
    if page.locator('#world').evaluate('c=>JSON.parse(c.dataset.coastal).find(a=>a.id==="compact-spoonbill").phase')=='handling':break
   assert page.locator('#world').evaluate('c=>JSON.parse(c.dataset.coastal).find(a=>a.id==="compact-spoonbill").phase')=='handling'
   page.wait_for_function('JSON.parse(document.querySelector("#world").dataset.feedingDetail||"null")!==null');page.locator('#feeding-expand').click();assert page.locator('#behavior-controls').is_hidden();assert page.locator('nav').is_hidden();page.locator('#feeding-detail').focus();page.keyboard.press('Home');page.wait_for_timeout(200)
   rectangles={key:page.locator('#'+key).bounding_box() for key in ['feeding-overview','feeding-contact']}
   for key,box in rectangles.items():assert box and box['x']>=0 and box['y']>=0 and box['x']+box['width']<=width+1 and box['y']+box['height']<=height+1,(key,box,width,height)
   assert page.locator('#count').text_content()=='0';state=page.locator('#world').evaluate('c=>({runId:c.dataset.runId,time:c.dataset.simulationTime,detail:JSON.parse(c.dataset.feedingDetail),observer:JSON.parse(c.dataset.observer)})');capture=shot(f'spoonbill-overview-contact-{width}x{height}');page.mouse.move(width*.5,height*.6);page.mouse.wheel(0,300);page.wait_for_timeout(150);page.locator('#feeding-detail').focus();page.keyboard.press('Escape');assert page.locator('#feeding-detail').is_hidden();assert page.locator('#behavior-detail').evaluate('e=>e===document.activeElement');assert page.locator('#count').text_content()=='0';r['checks'].append({'case':'both entire live lenses fit; native wheel and Escape restore focus; no credit','viewport':[width,height],'rectangles':rectangles,'state':state,'capture':capture});page.locator('#behavior-stop').click();save()
  assert not r['errors'];r['passed']=True
 except Exception:r['failure']=traceback.format_exc();shot('failure');raise
 finally:save();b.close();server.shutdown();server.server_close()
