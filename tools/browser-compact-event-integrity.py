"""N05 exact original fixture through native file import; no earned-evidence claim."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from playwright.sync_api import sync_playwright
from browser_import_wait import choose_import_file
import argparse, hashlib, json, shutil, time, traceback
p=argparse.ArgumentParser();p.add_argument('--entry',default='outputs/Ranger-Kompakt.html');p.add_argument('--output',default='work/round2/n05-browser');p.add_argument('--expect-old-bug',action='store_true');a=p.parse_args()
root=Path(__file__).resolve().parents[1];entry=(root/a.entry).resolve();out=root/a.output;out.mkdir(parents=True,exist_ok=True)
fixture=root/'verification/kompakt-runde2/original-fixtures/evidence/conflicting-same-run-events.json';raw=fixture.read_bytes();valid=root/'verification/kompakt-v2/learning/earned-all-families.json';key='ranger-compact-fieldbook-v2'
r={'passed':False,'scope':'Native import of exact independently supplied conflicting-event fixture; old baseline reproduction is expected product failure, not a repaired product PASS. Fixtures are not earned observation evidence.','expectedOldBug':a.expect_old_bug,'htmlSHA256':hashlib.sha256(entry.read_bytes()).hexdigest(),'fixtureSHA256':hashlib.sha256(raw).hexdigest(),'checks':[],'errors':[]}
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(entry.parent)));Thread(target=server.serve_forever,daemon=True).start()
def save():(out/'result.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);ctx=b.new_context(viewport={'width':1200,'height':750},accept_downloads=True);page=ctx.new_page();page.set_default_timeout(45000);page.on('pageerror',lambda e:r['errors'].append(str(e)))
 try:
  page.goto(f'http://127.0.0.1:{server.server_port}/{entry.name}');page.wait_for_selector('#world[data-ready=true]',timeout=120000);page.locator('#start').click();page.locator('#journal-button').click();choose_import_file(page,str(valid));page.locator('#apply-import').click();before=page.evaluate('(k)=>localStorage.getItem(k)',key)
  choose_import_file(page,str(fixture));r['message']=page.locator('#import-preview').inner_text();r['replacementOffered']=bool(page.locator('#apply-import').count())
  if a.expect_old_bug:
   assert r['replacementOffered'];page.locator('#apply-import').click();page.locator('#close').click();page.locator('#objective').click();page.locator('#panel [data-mission="K2"]').click();page.locator('#save-task').click();r['feedback']=page.locator('#task-feedback').inner_text();assert r['feedback'].startswith('Strukturierte Belegprüfung erfüllt.');r['productPass']=False
  else:
   assert not r['replacementOffered'];assert 'Widersprüchliche Kopien' in r['message'];assert page.evaluate('(k)=>localStorage.getItem(k)',key)==before;r['oldStorageByteIdentical']=True
   with page.expect_download() as dl:page.locator('#export').click()
   dl.value.save_as(str(out/'preserved-earned-fieldbook.json'));exported=json.loads((out/'preserved-earned-fieldbook.json').read_text());assert exported['records']==json.loads(before)['records'];assert exported['learning']==json.loads(before)['learning'];r['productPass']=True
  page.screenshot(path=str(out/'same-run-conflicting-events.png'));r['checks'].append({'name':'exact original fixture import outcome matches explicitly selected baseline/current expectation','passed':True});assert not r['errors'];r['passed']=True;r['completedAt']=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime());save();print(json.dumps(r,ensure_ascii=False))
 except Exception:r['failure']=traceback.format_exc();save();raise
 finally:b.close();server.shutdown();server.server_close()
