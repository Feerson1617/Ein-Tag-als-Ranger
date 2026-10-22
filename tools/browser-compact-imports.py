"""Actual shipped HTML import UI and labelled damaged-storage recovery fixtures."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
from browser_import_wait import choose_import_file
import argparse,json,shutil,hashlib,time,traceback
p=argparse.ArgumentParser();p.add_argument('--file-read-delay-ms',type=int,default=250);p.add_argument('--entry',default='Ranger-Kompakt.html');p.add_argument('--site',default='outputs');p.add_argument('--output',default='work/qa-correction/import-browser');a=p.parse_args()
if not 0<=a.file_read_delay_ms<=5000:p.error('file read delay must be 0–5000 ms')
root=Path(__file__).resolve().parents[1];out=root/a.output;out.mkdir(parents=True,exist_ok=True);key='ranger-compact-fieldbook-v2';valid=json.loads((root/'verification/kompakt-v2/learning/earned-all-families.json').read_text());r={'entry':a.entry,'scope':'Rendered DOM plus actual WebGL boot of standalone HTML; imports/storage corruption are explicitly labelled fixtures, not newly earned mission evidence','fileReadLatencyFixtureMs':a.file_read_delay_ms,'responseWait':'Fresh preview DOM mutation, not stale text or an arbitrary sleep','checks':[],'errors':[],'passed':False,'htmlSHA256':hashlib.sha256((root/a.site/a.entry).read_bytes()).hexdigest()}
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(root/a.site)));Thread(target=server.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{server.server_port}/{a.entry}'
def save():(out/'result.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
def boot(page):
 page.set_default_timeout(45000);page.on('pageerror',lambda e:r['errors'].append(str(e)))
 # Explicit file-I/O latency fixture only. Original file bytes/native read remain
 # unchanged; this is neither a world-time nor an observation-evidence injection.
 if a.file_read_delay_ms:page.add_init_script('const originalFileText=File.prototype.text;File.prototype.text=async function(){await new Promise(resolve=>setTimeout(resolve,'+str(a.file_read_delay_ms)+'));return originalFileText.call(this);};')
 page.goto(url);page.wait_for_function('document.querySelector("#world").dataset.ready==="true"',timeout=120000);page.locator('#start').click()
def storage(page):return page.evaluate('(key)=>localStorage.getItem(key)',key)
with sync_playwright()as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);ctx=b.new_context(viewport={'width':800,'height':600},accept_downloads=True);page=ctx.new_page()
 try:
  boot(page);page.locator('#journal-button').click();choose_import_file(page,{'name':'valid-acquired-v2.json','mimeType':'application/json','buffer':json.dumps(valid).encode()});page.locator('#apply-import').click();page.locator('#close').click()
  for mission in ['K1','K2','K3','K4','K5']:
   page.locator('#objective').click();page.locator(f'#panel [data-mission="{mission}"]').click();assert page.locator('#task-form').is_visible();assert not page.locator('#learning-status').inner_text();page.locator('#close').click()
  r['checks'].append({'name':'valid older v2 imports through file input; K1-K5 actually render','passed':True});page.locator('#journal-button').click();before=storage(page);cases=[]
  for name in ['repro-invalid-top-level-features.json','repro-impossible-coordinates.json']:cases.append((name,json.loads((root/'verification/kompakt-korrektur/baseline'/name).read_text())))
  for field,value in [('features',{}),('recordId',3),('choice',[]),('limit',False)]:
   d=json.loads(before);d['learning']['drafts']['K1']={field:value};cases.append(('K1-'+field,d))
  d=json.loads(before);d['learning']['drafts']['K2']={'experimentTide':{}};cases.append(('K2-experimentTide',d))
  # Isolate the observation: unrelated strict K3 protocols must not mask a
  # permissive observation-window fallback. These are labelled import fixtures.
  for value in [0,False,'',None,'toString','constructor']:
   d=json.loads(before);d['records']=[d['records'][0]];d['records'][0]['window']=value;d['learning']={'activeMission':None,'level':'gA','answers':{},'drafts':{},'protocols':[],'measurements':[],'samples':[],'experiments':[]};cases.append(('isolated-window-'+json.dumps(value),d))
  for name,d in cases:
   choose_import_file(page,{'name':name+'.json','mimeType':'application/json','buffer':json.dumps(d).encode()});page.wait_for_function('!document.querySelector("#apply-import")&&document.querySelector("#import-preview").textContent.length>0');assert storage(page)==before;assert not page.locator('#apply-import').count();r['checks'].append({'name':name,'passed':True,'oldStorageByteIdentical':True,'message':page.locator('#import-preview').inner_text()});save()
  page.screenshot(path=str(out/'invalid-import-rejected.png'));ctx.close()
  bad=json.loads(json.dumps(valid));bad['learning']['drafts']['K1']['features']={};raw=json.dumps(bad,ensure_ascii=False);ctx=b.new_context(viewport={'width':800,'height':600},accept_downloads=True);ctx.add_init_script('if(localStorage.getItem('+json.dumps(key)+')===null)localStorage.setItem('+json.dumps(key)+','+json.dumps(raw)+');');page=ctx.new_page();boot(page);assert storage(page)==raw;page.locator('#journal-button').click()
  with page.expect_download()as dl:page.locator('#recovery-original').click()
  dl.value.save_as(str(out/'original-damaged-storage.json'));assert (out/'original-damaged-storage.json').read_text()==raw
  page.locator('#repair-draft').click();assert json.loads(storage(page))['records']==valid['records'];assert page.evaluate('(key)=>localStorage.getItem(key+"-recovery-original")',key)==raw;assert not page.locator('#repair-draft').count();page.locator('#close').click();page.reload();page.wait_for_function('document.querySelector("#world").dataset.ready==="true"');page.locator('#start').click();page.locator('#objective').click();page.locator('#panel [data-mission="K1"]').click();assert page.locator('#task-form').is_visible();assert not page.locator('#learning-status').inner_text();page.screenshot(path=str(out/'repaired-draft-K1.png'));r['checks'].append({'name':'explicit UI recovery and original download preserve all valid observations through reload','passed':True,'originalBytes':len(raw.encode())});assert not r['errors'];r['passed']=True;r['completedAt']=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime());save();print(json.dumps({'passed':True,'checks':len(r['checks'])}))
 except Exception:r['failure']=traceback.format_exc();save();raise
 finally:b.close();server.shutdown();server.server_close()
