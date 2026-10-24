"""Fresh paired forest cameras and ordinary walking, actual standalone WebGL."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
import argparse,json,hashlib,shutil,time,traceback,subprocess
p=argparse.ArgumentParser();p.add_argument('--entry',default='outputs/Ranger-Kompakt.html');p.add_argument('--output',default='work/round2/forest-current');p.add_argument('--compare');a=p.parse_args();root=Path(__file__).resolve().parents[1];entry=(root/a.entry).resolve();out=root/a.output;out.mkdir(parents=True,exist_ok=True);old=json.loads((root/a.compare).read_text())if a.compare else None
r={'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'sourceDirty':bool(subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True).strip()),'passed':False,'htmlSHA256':hashlib.sha256(entry.read_bytes()).hexdigest(),'scope':'Fresh actual standalone renders at five public fixed comparison cameras; ordinary W walking assessed separately, not falsely paired. Visual judgement separate from model counts and open anatomical/device acceptance.','viewport':{'width':1200,'height':750},'captures':[],'errors':[]}
class H(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
s=ThreadingHTTPServer(('127.0.0.1',0),partial(H,directory=str(entry.parent)));Thread(target=s.serve_forever,daemon=True).start()
def data(page):return page.locator('#world').evaluate('(e)=>({...e.dataset})')
def save():(out/'result.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
def capture(page,name,paired):
 page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision');d=data(page);page.screenshot(path=str(out/(name+'.png')));row={'file':name+'.png','sha256':hashlib.sha256((out/(name+'.png')).read_bytes()).hexdigest(),'observer':json.loads(d['observer']),'modelTime':float(d['simulationTime']),'runId':d['runId'],'triangles':d['triangles'],'drawCalls':d['drawCalls'],'pairedFixedCamera':paired};r['captures'].append(row)
 if old and paired:
  prior=next(c for c in old['captures']if c['file']==row['file']);assert all(abs(row['observer'][k]-prior['observer'][k])<1e-8 for k in ['x','z','yaw','pitch']);assert old['viewport']==r['viewport'];row['pairedOldSHA256']=prior['sha256']
 save()
with sync_playwright()as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);c=b.new_context(viewport=r['viewport']);page=c.new_page();page.set_default_timeout(45000);page.on('pageerror',lambda e:r['errors'].append(str(e)))
 try:
  page.goto(f'http://127.0.0.1:{s.server_port}/{entry.name}');page.wait_for_selector('#world[data-ready=true]',timeout=120000);page.locator('#start').click()
  for name in ['start','woodruff','nettle','wood','village']:
   page.locator('#menu-button').click();page.get_by_text('Referenzabschnitt prüfen',exact=True).click();page.locator('[data-view="comparison-'+name+'"]').click();capture(page,name,True)
  page.locator('#menu-button').click();page.get_by_text('Referenzabschnitt prüfen',exact=True).click();page.locator('[data-view="start"]').click();page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision');before=data(page);page.keyboard.down('w')
  for i in range(3):
   t=float(data(page)['simulationTime']);page.wait_for_function('(t)=>Number(document.querySelector("#world").dataset.simulationTime)>t+.75',arg=t,timeout=120000);capture(page,'ordinary-walk-'+str(i+1),False)
  page.keyboard.up('w');after=data(page);start=json.loads(before['observer']);end=json.loads(after['observer']);distance=((end['x']-start['x'])**2+(end['z']-start['z'])**2)**.5;assert distance>2;r['walk']={'before':start,'after':end,'modelSeconds':float(after['simulationTime'])-float(before['simulationTime']),'distanceMetres':distance};assert not r['errors'];r['passed']=True;save();print(json.dumps({'passed':True,'captures':len(r['captures']),'walk':r['walk']}))
 except Exception:r['failure']=traceback.format_exc();save();raise
 finally:b.close();s.shutdown();s.server_close()
