"""Real-WebGL V1 UI safety, native desktop zoom, downloads and context recovery.
The positive old fieldbook is imported through UI for persistence ONLY; it is
not claimed as newly earned mission evidence. Normal walking is tested separately.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
from browser_import_wait import choose_import_file
import argparse,hashlib,json,math,shutil,subprocess,time,traceback
p=argparse.ArgumentParser();p.add_argument('--entry',default='outputs/Ranger-Kompakt.html');p.add_argument('--output',required=True);a=p.parse_args();root=Path(__file__).resolve().parents[1];entry=(root/a.entry).resolve();out=root/a.output;out.mkdir(parents=True,exist_ok=False);key='ranger-compact-fieldbook-v2';fixture=root/'verification/kompakt-v2/learning/earned-all-families.json'
r={'passed':False,'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'sourceDirty':bool(subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True).strip()),'htmlSHA256':hashlib.sha256(entry.read_bytes()).hexdigest(),'driverSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'fixtureSHA256':hashlib.sha256(fixture.read_bytes()).hexdigest(),'scope':'Actual Chromium WebGL UI tests; CSS/touch simulation is not physical iPad/Safari acceptance. Imported historical positive book is used for storage preservation only. No new mission earned claim or full walk.','checks':[],'captures':[],'errors':[],'notChecked':[]}
class H(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(H,directory=str(entry.parent)));Thread(target=server.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{server.server_port}/{entry.name}'
def save():(out/'result.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
def data(page):return page.locator('#world').evaluate('(e)=>({...e.dataset})')
def stored(page):return page.evaluate('(k)=>localStorage.getItem(k)',key)
def shot(page,name):
 path=out/(name+'.png');page.screenshot(path=str(path));r['captures'].append({'file':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'data':data(page)});save()
def check(name,**extra):r['checks'].append({'name':name,'passed':True,**extra});save();print('PASS',name,flush=True)
def boot(page):
 page.on('pageerror',lambda e:r['errors'].append(str(e)));page.set_default_timeout(60000);page.goto(url);page.wait_for_selector('#world[data-ready=true]',timeout=120000);page.locator('#start').click()
def outlook(page):
 page.locator('#menu-button').click();page.get_by_text('Referenzabschnitt prüfen',exact=True).click();page.locator('[data-view="outlook"]').click();page.wait_for_function('document.querySelector("#world").dataset.sceneRevision===document.querySelector("#world").dataset.renderRevision')
def observation(page,realtime=False):
 page.locator('#study').click();page.locator('#new-observation-context').click();page.locator('[data-'+('realtime'if realtime else'behavior')+'="compact-oystercatcher"]').click();page.locator('#behavior-detail').click();
 if not realtime:page.locator('#behavior-step-size').select_option('0.025');page.locator('#behavior-step').click()
 page.wait_for_function('JSON.parse(document.querySelector("#world").dataset.feedingDetail||"null")!==null')
def clickable(page,id):
 button=page.locator('#'+id);button.scroll_into_view_if_needed();hit=button.evaluate('b=>{const r=b.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,e=document.elementFromPoint(x,y);return {hit:e===b||b.contains(e),visible:x>=0&&y>=0&&x<innerWidth&&y<innerHeight}}');assert hit['hit']and hit['visible'],(id,hit)
def fit(page):
 viewport=page.evaluate('({width:innerWidth,height:innerHeight})')
 for id in ['feeding-detail','behavior-controls']:
  rect=page.locator('#'+id).evaluate('e=>e.getBoundingClientRect().toJSON()');assert rect['left']>=0 and rect['top']>=0 and rect['right']<=viewport['width']+1 and rect['bottom']<=viewport['height']+1,(id,rect)
 for id in ['feeding-close','behavior-stop','behavior-detail']:clickable(page,id)
 for id in ['feeding-detail','behavior-controls']:
  size=page.locator('#'+id).evaluate('e=>({width:e.clientWidth,scrollWidth:e.scrollWidth})');assert size['scrollWidth']<=size['width']+1,(id,size)
def lose_restore(page,ctx,name):
 before=data(page);book=stored(page)
 page.evaluate('()=>{const gl=document.querySelector("#world").getContext("webgl2");window.__v1Loss=gl.getExtension("WEBGL_lose_context");if(!window.__v1Loss)throw Error("WEBGL_lose_context unavailable");window.__v1Loss.loseContext()}')
 page.locator('#graphics-error').wait_for(state='visible');page.wait_for_timeout(800);page.locator('#retry-graphics').click();page.locator('#graphics-error').wait_for(state='hidden',timeout=120000);page.wait_for_function('document.querySelector("#world").dataset.ready==="true" && !!document.querySelector("#world").dataset.runId && !document.querySelector("#world").getContext("webgl2").isContextLost()');after=data(page);r.setdefault('lossTests',[]).append({'name':name,'before':before,'after':after});assert after['runId']==before['runId'];assert stored(page)==book;shot(page,name);check(name,runId=after['runId'])
with sync_playwright()as pw:
 args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'];b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=args);ctx=b.new_context(viewport={'width':1440,'height':900},has_touch=True,accept_downloads=True);page=ctx.new_page()
 try:
  boot(page);r['browser']=b.version;page.locator('#journal-button').click();choose_import_file(page,str(fixture));page.locator('#apply-import').click();book=stored(page);assert book and len(json.loads(book)['records'])>0;page.locator('#close').click();outlook(page);observation(page)
  page.locator('#behavior-step-size').select_option('1')
  for _ in range(4):page.locator('#behavior-step').click()
  page.locator('#behavior-step-size').select_option('0.25')
  for _ in range(2):page.locator('#behavior-step').click()
  before=data(page);run=before['runId'];observer=json.loads(before['observer'])
  for index,(width,height) in enumerate([(1440,900),(1080,810),(810,1080),(600,375),(1080,810)]):
   page.set_viewport_size({'width':width,'height':height});page.wait_for_function('document.querySelector("#world").dataset.sceneRevision===document.querySelector("#world").dataset.renderRevision');fit(page);page.locator('#feeding-detail').evaluate('e=>e.scrollTop=0');shot(page,f'viewport-{index}-{width}x{height}-top');page.locator('#feeding-detail').evaluate('e=>e.scrollTop=e.scrollHeight');shot(page,f'viewport-{index}-{width}x{height}-bottom');assert stored(page)==book;assert data(page)['runId']==run;after=json.loads(data(page)['observer']);assert all(after[k]==observer[k]for k in ['x','z']);check(f'responsive-{width}x{height}')
   page.locator('#feeding-close').click();assert page.locator('#feeding-detail').is_hidden();assert page.locator('#behavior-detail').evaluate('e=>document.activeElement===e');page.locator('#behavior-detail').click()
  page.locator('#feeding-detail').focus();page.keyboard.press('Escape');assert page.locator('#feeding-detail').is_hidden();page.locator('#behavior-detail').click();lose_restore(page,ctx,'detail-context-restored')
  page.locator('#behavior-stop').click();lose_restore(page,ctx,'world-context-restored');assert stored(page)==book
  outlook(page);observation(page,True);before=data(page);page.locator('#feeding-detail').focus();page.keyboard.down('w');page.wait_for_function('(t)=>Number(document.querySelector("#world").dataset.simulationTime)>t+.18',arg=float(before['simulationTime']));page.keyboard.up('w');after=data(page);a0=json.loads(before['observer']);a1=json.loads(after['observer']);assert a0['x']==a1['x']and a0['z']==a1['z'];page.locator('#feeding-detail').evaluate('e=>e.scrollTop=0');rect=page.locator('#feeding-detail').bounding_box();page.mouse.move(rect['x']+30,rect['y']+90);page.mouse.wheel(0,300);page.wait_for_timeout(300);after=data(page);a1=json.loads(after['observer']);assert a0['x']==a1['x']and a0['z']==a1['z'];assert stored(page)==book;check('live-model-keyboard-and-scroll-shield')
  # Actual browser tab activation; never override document.hidden with a mock.
  other=ctx.new_page();other.goto('about:blank');other.bring_to_front();page.wait_for_timeout(700);hidden=page.evaluate('document.hidden');minimized=None
  if not hidden:
   try:
    window_session=ctx.new_cdp_session(page);window_id=window_session.send('Browser.getWindowForTarget')['windowId'];window_session.send('Browser.setWindowBounds',{'windowId':window_id,'bounds':{'windowState':'minimized'}});minimized=(window_session,window_id);page.wait_for_timeout(700);hidden=page.evaluate('document.hidden')
   except Exception as error:r['backgroundWindowLimit']=str(error)

  if hidden:
   t0=float(data(page)['simulationTime']);page.wait_for_timeout(2500);t1=float(data(page)['simulationTime']);assert abs(t1-t0)<.001;
   if minimized:minimized[0].send('Browser.setWindowBounds',{'windowId':minimized[1],'bounds':{'windowState':'normal'}})
   page.bring_to_front();page.wait_for_function('!document.hidden');assert float(data(page)['observationSeconds'])<.5;check('actual-background-tab-and-return')
  else:r['notChecked'].append({'case':'actual hidden background tab','reason':'Neither actual second-tab activation nor native window minimization exposed document.hidden in this headless Chromium; no mock substituted.'})
  if minimized:minimized[0].send('Browser.setWindowBounds',{'windowId':minimized[1],'bounds':{'windowState':'normal'}})
  other.close();page.bring_to_front();page.locator('#behavior-stop').click();page.locator('#menu-button').click();page.locator('#menu-materials').click();page.set_viewport_size({'width':1440,'height':900});shot(page,'materials-selection');downloads=out/'downloads';downloads.mkdir()
  for kind,name in [('teacher','START-IM-UNTERRICHT'),('path-a','PFAD-A-Artenliste'),('path-b','PFAD-B-Kuestenvoegel')]:
   with page.expect_download()as d:page.locator('[data-starter="'+kind+'"]').click()
   path=downloads/(name+'.html');d.value.save_as(str(path));assert path.read_bytes()==(root/'outputs/Ranger-Kompakt-Lernpaket'/(name+'.html')).read_bytes();check('runtime-download-identical-'+kind,sha256=hashlib.sha256(path.read_bytes()).hexdigest())
  assert not r['errors'];ctx.close();b.close()
  # Native Chromium default page zoom, not a CSS transform or injected hidden flag.
  profile=out/'private-zoom-profile';profile.mkdir()
  zoomctx=pw.chromium.launch_persistent_context(str(profile),headless=True,executable_path=shutil.which('chromium'),args=args+['--window-size=1440,900'],no_viewport=True);page=zoomctx.pages[0];page.goto('chrome://settings/appearance');page.locator('#zoomLevel').select_option('2');r['nativeZoomControl']={'url':page.url,'selected':page.locator('#zoomLevel').input_value()};boot(page);metrics=page.evaluate('({innerWidth,innerHeight,outerWidth,outerHeight,devicePixelRatio})');r['nativeZoom']=metrics
  assert metrics['devicePixelRatio']>=1.9 and metrics['innerWidth']<1000,('Native200% desktop zoom not applied',metrics)
  outlook(page);observation(page);page.wait_for_timeout(600);fit(page);shot(page,'native-desktop-zoom-200');clickable(page,'feeding-close');clickable(page,'behavior-stop');check('native-desktop-zoom-200',metrics=metrics);zoomctx.close();r['passed']=True
 except Exception:
  r['failure']=traceback.format_exc()
  try:page.screenshot(path=str(out/'failure.png'));r['failureSample']=data(page)
  except Exception:pass
  save();raise
 finally:
  try:b.close()
  except Exception:pass
  save();server.shutdown();server.server_close()
