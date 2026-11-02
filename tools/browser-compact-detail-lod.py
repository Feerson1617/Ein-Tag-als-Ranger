"""Visible concrete prey at the actual study-spur endpoint beyond normal distance LOD.
Uses a declared public reference-camera visit and labelled model steps only.
This focused regression is not a native-footwalk, real-time or earned-evidence proof.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
from compact_runtime import audit_standalone
import argparse,json,hashlib,subprocess,shutil,traceback,math
p=argparse.ArgumentParser();p.add_argument('--output',default='work/round2/detail-lod');p.add_argument('--expect-hidden',action='store_true',help='Explicit prior-version bug reproduction; productPass remains false.');a=p.parse_args();root=Path(__file__).resolve().parents[1];out=root/a.output;out.mkdir(parents=True,exist_ok=True);entry=root/'outputs/Ranger-Kompakt.html';audit=audit_standalone(root,entry)
r={'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'sourceDirty':bool(subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True).strip()),'htmlSHA256':audit['htmlSHA256'],'scope':__doc__,'expectedOldBug':a.expect_hidden,'passed':False,'productPass':False,'captures':[],'errors':[]}
class H(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(H,directory=str(entry.parent)));Thread(target=server.serve_forever,daemon=True).start()
def save():(out/'result.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
def sample(page):return page.locator('#world').evaluate('c=>({detail:JSON.parse(c.dataset.feedingDetail||"null"),time:Number(c.dataset.simulationTime),ownSeconds:Number(c.dataset.observationSeconds),observer:JSON.parse(c.dataset.observer),runId:c.dataset.runId})')
def tick(page):page.locator('#behavior-step-size').select_option('0.1');page.locator('#behavior-step').click();page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision')
def capture(page,name):
 d=sample(page);page.screenshot(path=str(out/(name+'.png')));r['captures'].append({'file':name+'.png','sha256':hashlib.sha256((out/(name+'.png')).read_bytes()).hexdigest(),'sample':d});save();return d
with sync_playwright()as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);ctx=b.new_context(viewport={'width':1200,'height':750});page=ctx.new_page();page.set_default_timeout(45000);page.on('pageerror',lambda e:r['errors'].append(str(e)))
 try:
  page.goto(f'http://127.0.0.1:{server.server_port}/Ranger-Kompakt.html');page.wait_for_selector('#world[data-ready=true]',timeout=120000);page.locator('#start').click();page.locator('#menu-button').click();page.get_by_text('Referenzabschnitt prüfen',exact=True).click();page.locator('[data-view="outlook"]').click();page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision');page.locator('#study').click();page.locator('#new-observation-context').click();page.locator('[data-behavior="compact-oystercatcher"]').click();page.locator('#binocular').click();page.locator('#behavior-detail').click();tick(page);page.wait_for_function('JSON.parse(document.querySelector("#world").dataset.feedingDetail||"null")!==null')
  for i in range(100):
   d=sample(page)
   if d['detail']['phase']=='handling':break
   tick(page)
  else:raise AssertionError('No actual first handling phase')
  early=capture(page,'contact-early');
  for i in range(20):tick(page)
  late=capture(page,'opening-late');detail=late['detail'];assert detail['phase']=='handling';assert detail['preyId']=='compact-mussel-16';assert detail['individualId']=='compact-oystercatcher';assert not detail['eventRecorded'];assert late['ownSeconds']==0;assert page.locator('#count').inner_text()=='0'
  point=next(view['focus']for view in detail['views']if view['id']=='feeding-contact');distance=math.hypot(point['x']-late['observer']['x'],point['z']-late['observer']['z']);assert distance>18,r
  if a.expect_hidden:assert detail['preyVisible']is False
  else:
   assert detail['preyVisible']is True and detail['worldPreyVisible']is False and detail['distanceLODOverride']is True
   page.locator('#behavior-detail').click();page.wait_for_function('document.querySelector("#world").dataset.feedingDetail==="null"');page.locator('#behavior-detail').click();page.wait_for_function('JSON.parse(document.querySelector("#world").dataset.feedingDetail||"null")?.preyVisible===true');assert sample(page)['detail']['worldPreyVisible']is False,'Detail rendering must restore world LOD without another model step';r['productPass']=True
  assert early['runId']==late['runId']and early['detail']['eventId']==late['detail']['eventId'];assert not r['errors'];r.update(passed=True,distanceMetres=distance,viewport={'width':1200,'height':750});save();print(json.dumps({'passed':True,'productPass':r['productPass'],'distanceMetres':distance,'worldPreyVisible':detail.get('worldPreyVisible'),'detailPreyVisible':detail['preyVisible']}))
 except Exception:r['failure']=traceback.format_exc();save();raise
 finally:b.close();server.shutdown();server.server_close()
