"""Actual world and detail pictures of all 36 taxa plus the caterpillar.
Public view/study controls only, no entity/clock injection and no awarded evidence.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
import argparse,json,hashlib,shutil,traceback
p=argparse.ArgumentParser();p.add_argument('--entry',required=True);p.add_argument('--output',required=True);a=p.parse_args();root=Path(__file__).resolve().parents[1];entry=(root/a.entry).resolve();out=root/a.output;out.mkdir(parents=True,exist_ok=True)
r={'passed':False,'htmlSHA256':hashlib.sha256(entry.read_bytes()).hexdigest(),'scope':'Unretouched world context and actual selected individual detail. A small animal may be below pixel size in the world; that is explicitly not a claim that every diagnostic is visible at natural scale.','captures':[],'errors':[]}
class H(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
s=ThreadingHTTPServer(('127.0.0.1',0),partial(H,directory=str(entry.parent)));Thread(target=s.serve_forever,daemon=True).start()
def save():(out/'result.json').write_text(json.dumps(r,ensure_ascii=False,indent=2))
with sync_playwright()as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);page=b.new_page(viewport={'width':800,'height':600});page.set_default_timeout(60000);page.on('pageerror',lambda e:r['errors'].append(str(e)))
 def close():
  if page.locator('#panel').is_visible():page.locator('#close').click()
 def view(v):
  close();page.locator('#menu-button').click();page.get_by_text('Referenzabschnitt prüfen',exact=True).click();page.locator('[data-view="'+v+'"]').click();page.wait_for_function('document.querySelector("#world").dataset.sceneRevision===document.querySelector("#world").dataset.renderRevision')
 def click(button):
  assert button.is_visible()and button.is_enabled();button.evaluate("b=>b.scrollIntoView({block:'center',behavior:'instant'})");hit=button.evaluate('b=>{const r=b.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,e=document.elementFromPoint(x,y);return {x,y,hit:e===b||b.contains(e)}}');assert hit['hit'];page.mouse.click(hit['x'],hit['y'])
 def capture(taxon,stage,location):
  close();world=taxon+('-caterpillar'if stage=='caterpillar'else'')+'-world.png';page.screenshot(path=str(out/world));d=page.locator('#world').evaluate('(e)=>({...e.dataset})');page.locator('#study').click();button=page.locator('[data-inspect][data-taxon="'+taxon+'"]'+('[data-stage="'+stage+'"]'if stage else'')).first;individual=button.get_attribute('data-inspect');click(button);page.wait_for_selector('#specimen-canvas[data-ready=true]');detail=world.replace('-world','-detail');page.locator('#specimen-canvas').screenshot(path=str(out/detail));row={'taxon':taxon,'stage':stage,'individual':individual,'location':location,'observer':json.loads(d['observer']),'modelTime':d['simulationTime'],'window':json.loads(d['ecology'])['window'],'world':world,'detail':detail,'sha256':{f:hashlib.sha256((out/f).read_bytes()).hexdigest()for f in [world,detail]}};r['captures'].append(row);save();close();print('TAXON',taxon,stage,flush=True)
 try:
  page.goto(f'http://127.0.0.1:{s.server_port}/{entry.name}');page.wait_for_selector('#world[data-ready=true]',timeout=120000);page.locator('#start').click();manifest=json.loads(page.locator('#world').get_attribute('data-manifest'));seen=set()
  visits=[('summer','outlook'),('autumn','oak'),('summer','woodruff'),('summer','nettle'),('summer','flowers'),('summer','wood'),('summer','oak'),('summer','upper-marsh'),('summer','lower-marsh'),('summer','salt-shrub'),('summer','salt-segments'),('summer','salt-grass'),('summer','coast'),('summer','outlook'),('dusk','dusk')]
  for window,location in visits:
   close();page.locator('#menu-button').click();page.locator('#season-window').select_option(window);close();view(location);page.locator('#study').click()
   if location in ['coast','outlook']:click(page.locator('#new-observation-context'))
   rows=page.locator('[data-inspect]').evaluate_all('(bs)=>bs.map(b=>({taxon:b.dataset.taxon,stage:b.dataset.stage}))');close()
   # Mobile birds first, before small specimens consume real model time.
   rows.sort(key=lambda x:0 if x['taxon']in ['tringa_totanus','garrulus_glandarius']else 1)
   for row in rows:
    key=(row['taxon'],row['stage']if row['taxon']=='aglais_io'else'')
    if key in seen:continue
    capture(row['taxon'],row['stage'],location);seen.add(key)
  assert {x[0]for x in seen}==set(manifest['activeTaxa']),sorted(set(manifest['activeTaxa'])-{x[0]for x in seen});assert ('aglais_io','caterpillar')in seen;assert page.locator('#count').inner_text()=='0';assert not r['errors'];r['passed']=True
 except Exception:r['failure']=traceback.format_exc();save();page.screenshot(path=str(out/'failure.png'));raise
 finally:save();b.close();s.shutdown();s.server_close()
