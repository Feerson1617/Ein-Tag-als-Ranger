"""Independent P1 reproduction: native travel, real finite feeding, real UI saves.

No observer, clock, simulation or evidence writes. The one injected failure is
the real WEBGL_lose_context extension. CDP touch dispatches native touch input.
--baseline expects the documented pointer bug in the unchanged 0772ff1 HTML.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
from compact_native_navigation import NativeNavigator
import argparse, hashlib, json, math, shutil, subprocess, tempfile, time, traceback, zipfile

p = argparse.ArgumentParser()
p.add_argument('--entry', default='outputs/Ranger-Kompakt.html')
p.add_argument('--scorm-zip')
p.add_argument('--output', default='work/observation-ui')
p.add_argument('--baseline', action='store_true')
p.add_argument('--headed', action='store_true')
p.add_argument('--cases', default='none,mouse,touch,escape,expand,toggle,look,tool,stop,pause,background,context,step,target,new-run')
a = p.parse_args()
root = Path(__file__).resolve().parents[1]
out = root / a.output
out.mkdir(parents=True, exist_ok=True)
site = out / 'site'
site.mkdir(exist_ok=True)
source = root / (a.scorm_zip or a.entry)
if a.scorm_zip:
 with zipfile.ZipFile(source) as z:
  assert 'imsmanifest.xml' in z.namelist()
  assert all(not Path(n).is_absolute() and '..' not in Path(n).parts for n in z.namelist())
  z.extractall(site / 'sco')
 import xml.etree.ElementTree as ET
 manifest = ET.parse(site / 'sco/imsmanifest.xml')
 resources = manifest.findall('.//{*}resource')
 sco = [r for r in resources if any(k.endswith('scormtype') and v == 'sco' for k,v in r.attrib.items())]
 assert len(sco) == 1
 href = 'sco/' + sco[0].get('href')
else:
 shutil.copy2(source, site / 'game.html')
 href = 'game.html'
(site / 'index.html').write_text('''<!doctype html><meta charset="utf-8"><style>body{margin:0}header{height:60px;background:#183c38;color:white}iframe{width:600px;height:375px;border:0;display:block}</style><header>LMS-Prüfrahmen · 600 × 375</header><script>window.apiCalls=[];window.API=Object.fromEntries(['LMSInitialize','LMSFinish','LMSCommit','LMSSetValue','LMSGetValue','LMSGetLastError','LMSGetErrorString','LMSGetDiagnostic'].map(n=>[n,(...args)=>{apiCalls.push({n,args});return n==='LMSGetLastError'?'0':n==='LMSGetValue'?'':'true'}]));</script><iframe title="Ranger" src="''' + href + '"></iframe>')
result = {'source':str(source.relative_to(root)), 'sha256':hashlib.sha256(source.read_bytes()).hexdigest(), 'commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(), 'baseline':a.baseline, 'scorm':bool(a.scorm_zip), 'viewport':[600,375], 'frameOffset':60, 'cases':[], 'errors':[], 'scope':'Native W/mouse route, public new finite trial, unaccelerated actual event. No state/clock/evidence injection. Software Chromium; no physical iPad or real itslearning.'}
def save():
 (out / 'result.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
server = ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(site)))
Thread(target=server.serve_forever,daemon=True).start()
class Framed:
 def __init__(self,page,frame): self.page,self.frame=page,frame
 def __getattr__(self,name): return getattr(self.page if name in ['mouse','keyboard','screenshot'] else self.frame,name)
with sync_playwright() as pw:
 options={'headless':not a.headed,'args':['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']}
 if shutil.which('chromium'): options['executable_path']=shutil.which('chromium')
 process=None;profile=None;launch_log=None
 if a.headed:
  # Playwright normally enables FocusEmulation in its own CDP session. A
  # second CDP session cannot undo that session's override. Connect to a real
  # browser with no_defaults instead: native tab visibility, no hidden mock.
  profile=tempfile.TemporaryDirectory(prefix='ranger-observation-browser-')
  launch_log=(out/'browser-launch.log').open('w')
  process=subprocess.Popen([shutil.which('chromium') or pw.chromium.executable_path,*options['args'],'--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile.name,'--window-size=800,600','about:blank'],stdout=launch_log,stderr=launch_log)
  port_file=Path(profile.name)/'DevToolsActivePort';began=time.monotonic()
  while not port_file.exists():
   assert process.poll() is None and time.monotonic()-began<30,'Native browser did not expose its local CDP endpoint'
   time.sleep(.1)
  browser=pw.chromium.connect_over_cdp('http://127.0.0.1:'+port_file.read_text().splitlines()[0],no_defaults=True)
  ctx=browser.contexts[0];host=ctx.pages[0];host.set_viewport_size({'width':600,'height':435})
  ctx.new_cdp_session(host).send('Emulation.setTouchEmulationEnabled',{'enabled':True,'maxTouchPoints':1})
  result['focusMode']='Native browser via CDP no_defaults; Playwright focus emulation absent'
 else:
  browser=pw.chromium.launch(**options)
  ctx=browser.new_context(viewport={'width':600,'height':435},has_touch=True,accept_downloads=True)
  host=ctx.new_page()
 result['browserVersion']=browser.version
 host.set_default_timeout(45000)
 host.on('pageerror',lambda e:result['errors'].append(str(e)))
 try:
  host.goto(f'http://127.0.0.1:{server.server_port}/index.html')
  # SCORM has its own wrapper iframe; locate the actual game by its canvas.
  started=time.monotonic();game=None
  while game is None:
   for frame in host.frames:
    if frame.locator('#world').count(): game=frame;break
   assert time.monotonic()-started<120,'No actual game frame'
   host.wait_for_timeout(100)
  page=Framed(host,game)
  page.wait_for_function('document.querySelector("#world").dataset.ready==="true"',timeout=120000)
  if not a.baseline:
   guide=page.locator('#start-guide').text_content()
   assert 'Lupe für Pflanzen, Pilze und kleine Tiere' in guide and 'gültige, noch speicherbare Nachweise' in guide
   result['helpText']=guide
   if a.scorm_zip:assert 'nur während der geöffneten Sitzung' in guide and 'lokal gespeichert' not in guide
  page.locator('#start').click()
  if not a.baseline:
   page.locator('#read-sign').click();assert guide in page.locator('#panel-body').inner_text();page.locator('#close').click()
   page.locator('#menu-button').click();page.locator('#guide').click();assert guide in page.locator('#panel-body').inner_text()
   host.screenshot(path=str(out/'actual-guide.png'));page.locator('#close').click()
   result['helpConsistentOnWelcomeBoardAndMenu']=True
  page.locator('#menu-button').click();page.locator('#quality').select_option('tablet');page.locator('#resume').click()
  navigator=NativeNavigator(page,root,result,save)
  navigator.targets['spoonbill']=min(navigator.nodes,key=lambda q:math.dist(q,(73,2)))
  navigator.go('spoonbill')
  def data():
   return page.locator('#world').evaluate('c=>({time:+c.dataset.simulationTime,runId:c.dataset.runId,observer:JSON.parse(c.dataset.observer),ecology:JSON.parse(c.dataset.ecology),events:JSON.parse(c.dataset.coastalEvents),contacts:JSON.parse(c.dataset.visibleFeedingContacts),witnessed:JSON.parse(c.dataset.witnessedFeedingEvents),actors:JSON.parse(c.dataset.coastal),detail:JSON.parse(c.dataset.feedingDetail||"null"),seconds:+c.dataset.observationSeconds,focus:c.dataset.focusIndividual,record:!document.querySelector("#record").disabled})')
  def shot(name): host.screenshot(path=str(out/(name+'.png')))
  def close_panel():
   if page.locator('#panel').is_visible():page.locator('#close').click()
  def close_lens():
   if page.locator('#feeding-close').is_visible():page.locator('#feeding-close').click()
  def trial():
   close_panel()
   if page.locator('#behavior-stop').is_visible():page.locator('#behavior-stop').click()
   page.locator('#study').click();old=data()['runId'];page.locator('#new-observation-context').click()
   page.wait_for_function('(old)=>document.querySelector("#world").dataset.runId!==old',arg=old)
   page.locator('[data-realtime="compact-spoonbill"]').click();page.locator('#behavior-detail').click()
   began=time.monotonic();samples=[]
   while True:
    d=data()
    if d['witnessed'] and d['seconds']>=2.5 and d['record']:return d,samples
    if not samples or time.monotonic()-began-samples[-1]['wall']>2:
     samples.append({'wall':time.monotonic()-began,**d});result['currentTrial']=samples[-1];save()
    detail=d['detail'];actor=next(v for v in d['actors']if v['id']=='compact-spoonbill')
    if detail and detail['episodeCompleted'] and actor.get('targetId') and actor['targetId']!=detail['preyId']:
     # Baseline fallback changes the lens before a valid witness exists only.
     page.locator('#feeding-close').press('Escape');page.locator('#behavior-detail').press('Enter')
    assert time.monotonic()-began<480,'No genuine saveable spoonbill event within 480 seconds'
    page.wait_for_timeout(100)
  saved=[]
  positives={'none','mouse','touch','escape','expand','toggle'}
  for case in a.cases.split(','):
   before,samples=trial();row={'name':case,'before':before,'samples':samples};result['cases'].append(row);save();shot(case+'-before')
   ids={e['id']for e in before['witnessed']}
   if case=='mouse':page.locator('#feeding-close').click()
   elif case=='touch':
    box=page.locator('#feeding-close').bounding_box();cdp=ctx.new_cdp_session(host)
    cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':box['x']+box['width']/2,'y':box['y']+box['height']/2,'radiusX':5,'radiusY':5,'force':1,'id':1}]})
    cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});row['input']='genuine CDP touchStart/touchEnd'
   elif case=='escape':page.locator('#feeding-close').press('Escape')
   elif case=='expand':page.locator('#feeding-expand').click();page.locator('#feeding-expand').click()
   elif case=='toggle':page.locator('#behavior-detail').click();page.locator('#behavior-detail').click()
   elif case=='look':
    close_lens();host.mouse.move(280,275);host.mouse.down();host.mouse.move(310,275);host.mouse.up()
   elif case=='tool':close_lens();page.locator('#magnifier').click()
   elif case=='stop':close_lens();page.locator('#behavior-stop').click()
   elif case=='pause':close_lens();page.locator('#menu-button').click()
   elif case=='context':
    page.locator('#world').evaluate('c=>c.getContext("webgl2").getExtension("WEBGL_lose_context").loseContext()')
    page.locator('#graphics-error').wait_for(state='visible');page.locator('#retry-graphics').click();page.locator('#graphics-error').wait_for(state='hidden')
   elif case=='background':
    other=ctx.new_page();other.goto('about:blank');other.bring_to_front();host.wait_for_timeout(700)
    session=ctx.new_cdp_session(host);wid=session.send('Browser.getWindowForTarget')['windowId']
    if not game.evaluate('document.hidden'):
     session.send('Browser.setWindowBounds',{'windowId':wid,'bounds':{'windowState':'minimized'}});host.wait_for_timeout(700)
    hidden=game.evaluate('document.hidden');row['actuallyHidden']=hidden
    if hidden:
     t0=data()['time'];host.wait_for_timeout(2600);assert data()['time']==t0
     row['hiddenSimulationFrozenSeconds']=2.6
    session.send('Browser.setWindowBounds',{'windowId':wid,'bounds':{'windowState':'normal'}});other.close();host.bring_to_front()
    if not hidden:
     row['status']='NICHT GEPRÜFT';row['reason']='Real second tab and window minimization did not hide this headless document; no synthetic visibility event.';save();continue
   elif case in ['step','target','new-run']:
    close_lens();page.locator('#behavior-stop').click();page.locator('#study').click()
    if case=='new-run':page.locator('#new-observation-context').click()
    elif case=='target':page.locator('[data-realtime="compact-avocet"]').click()
    else:page.locator('[data-behavior="compact-spoonbill"]').click();page.locator('#behavior-step').click()
   elif case!='none':raise AssertionError('Unknown case '+case)
   page.wait_for_timeout(120);after=data();row['after']=after;shot(case+'-after')
   retained=ids.issubset({e['id']for e in after['witnessed']}) and after['seconds']>=2.5 and after['record']
   if a.baseline and case in ['mouse','touch','expand','toggle']:
    assert not retained,('Documented old pointer bug not reproduced',case)
    row['status']='FEHLER REPRODUZIERT';print('OLD POINTER BUG',case,flush=True)
   elif case in positives:
    assert retained,('Valid witnessed event lost by visual UI',case,before,after)
    assert after['runId']==before['runId'] and all(after['observer'][k]==before['observer'][k] for k in ['x','z'])
    note='P1 unabhängiger UI-Beleg: '+case
    page.locator('#record').click();page.locator('#note').fill(note);page.locator('#save-note').click()
    if not a.scorm_zip:
     record=page.evaluate("JSON.parse(localStorage.getItem('ranger-compact-fieldbook-v2')).records.at(-1)")
     assert record['note']==note and record['individualId']=='compact-spoonbill' and record['runId']==before['runId'] and record['observationSeconds']>=2.5
     assert ids.issubset({e['id']for e in record['events']})
    else:
     page.locator('#journal-button').click();article=page.locator('#panel-body article').filter(has_text=note)
     assert article.count()==1
     events=json.loads(article.locator('details').first.locator('pre').text_content())
     assert ids.issubset({e['id']for e in events})
     assert before['runId'] in article.text_content() and 'compact-spoonbill' in article.text_content()
     record={'note':note,'events':events,'renderedRecord':article.text_content(),'runId':before['runId']}
     shot(case+'-saved-fieldbook');close_panel()
    for event in before['witnessed']:
     actual=next(e for e in record['events']if e['id']==event['id']);assert actual==event
     assert event['actors'][0]=='compact-spoonbill' and event['actors'][1]
     assert event['after']==event['before']-1 and event['actors'][1] not in after['ecology']['alive']
     assert len([e for e in after['events']if e['id']==event['id']])==1
    row['savedRecord']=record;saved.append(record);row['status']='BESTANDEN';print('SAVED',case,sorted(ids),flush=True)
   else:
    assert not ids.intersection(e['id']for e in after['witnessed']),('Invalid old witness survived boundary',case)
    if case=='new-run':assert after['runId']!=before['runId']
    if case=='step':assert after['seconds']==0 and not after['record']
    if case=='target':assert after['focus']!='compact-spoonbill'
    row['status']='BESTANDEN';print('RESET',case,flush=True)
   save()
  if not a.scorm_zip:
   actual=page.evaluate("JSON.parse(localStorage.getItem('ranger-compact-fieldbook-v2')).records")
   for record in saved:assert next(v for v in actual if v['id']==record['id'])==record
   result['savedRecordsSurviveNegativeBoundaries']=True
  if a.scorm_zip:
   close_panel()
   if page.locator('#behavior-stop').is_visible():page.locator('#behavior-stop').click()
   page.locator('#journal-button').click();assert page.locator('#panel-body article').count()==len(saved)
   game.goto(game.url);page.wait_for_function('document.querySelector("#world").dataset.ready==="true"',timeout=120000);page.locator('#start').click();page.locator('#journal-button').click()
   assert page.locator('#panel-body article').count()==0
   result['reloadEmpty']=True;result['apiCalls']=host.evaluate('apiCalls');assert not any(c['n']=='LMSSetValue'for c in result['apiCalls'])
  assert not result['errors'],result['errors'];result['passed']=True
 except Exception:
  result['failure']=traceback.format_exc();result['passed']=False;host.screenshot(path=str(out/'failure.png'));raise
 finally:
  save();browser.close();server.shutdown();server.server_close()
  if process:
   if process.poll() is None:process.terminate();process.wait(timeout=15)
   launch_log.close();profile.cleanup()
