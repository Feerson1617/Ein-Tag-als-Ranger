"""Paired public viewpoints of a supplied immutable HTML, no state injection."""
from pathlib import Path
from compact_graphics_audit import observe_graphics_errors
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
import argparse,json,hashlib,shutil,time,traceback
p=argparse.ArgumentParser();p.add_argument('--entry',required=True);p.add_argument('--output',required=True);p.add_argument('--compare');a=p.parse_args();root=Path(__file__).resolve().parents[1];entry=(root/a.entry).resolve();out=root/a.output;out.mkdir(parents=True,exist_ok=True)
r={'htmlSHA256':hashlib.sha256(entry.read_bytes()).hexdigest(),'viewport':{'width':1200,'height':750},'scope':'Public fixed viewpoints, same default seed and summer window; live fauna and tide timestamps recorded, not falsely asserted identical. Actual pixels, no image retouching.','captures':[],'errors':[],'passed':False}
old=json.loads((root/a.compare).read_text())if a.compare else None
class H(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
s=ThreadingHTTPServer(('127.0.0.1',0),partial(H,directory=str(entry.parent)));Thread(target=s.serve_forever,daemon=True).start()
with sync_playwright()as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);c=b.new_context(viewport=r['viewport']);page=c.new_page();page.set_default_timeout(60000);page.on('pageerror',lambda e:r['errors'].append(str(e)));observe_graphics_errors(page,r['errors'])
 try:
  t=time.monotonic();page.goto(f'http://127.0.0.1:{s.server_port}/{entry.name}');page.wait_for_selector('#world[data-ready=true]',timeout=120000);r['loadSeconds']=time.monotonic()-t;page.screenshot(path=str(out/'welcome.png'));page.locator('#start').click()
  views=['comparison-start','comparison-woodruff','comparison-nettle','comparison-wood','comparison-village','npc-ranger','comparison-ramp','upper-marsh','lower-marsh','keilm','comparison-salt-segments','comparison-coast','outlook','comparison-salt-grass']
  for v in views:
   page.locator('#menu-button').click();page.get_by_text('Referenzabschnitt prüfen',exact=True).click();page.locator('[data-view="'+v+'"]').click();page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision');d=page.locator('#world').evaluate('(e)=>({...e.dataset})');f=v+'.png';page.screenshot(path=str(out/f));row={'file':f,'sha256':hashlib.sha256((out/f).read_bytes()).hexdigest(),'observer':json.loads(d['observer']),'simulationTime':d['simulationTime'],'ecology':json.loads(d['ecology']),'triangles':d['triangles'],'drawCalls':d['drawCalls'],'geometries':d['geometries'],'textures':d['textures'],'heapBytes':d['heapBytes']}
   if old:
    prev=next(x for x in old['captures']if x['file']==f);row['sameCamera']=row['observer']==prev['observer'];assert row['sameCamera'],(v,row['observer'],prev['observer'])
   r['captures'].append(row);(out/'result.json').write_text(json.dumps(r,ensure_ascii=False,indent=2));print('CAPTURE',v,flush=True)
  assert not r['errors'];r['passed']=True
 except Exception:r['failure']=traceback.format_exc();raise
 finally:(out/'result.json').write_text(json.dumps(r,ensure_ascii=False,indent=2));b.close();s.shutdown();s.server_close()
