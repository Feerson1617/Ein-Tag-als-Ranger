"""Actual standalone file:// and hashed web packet under an HTTP project prefix.
Native import/export/reload validates storage with a labelled historical fixture;
new mission earning is a separate mandatory learning-driver run.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright,Error
from browser_import_wait import choose_import_file
import argparse,hashlib,json,shutil,subprocess,traceback
p=argparse.ArgumentParser();p.add_argument('--output',required=True);a=p.parse_args();root=Path(__file__).resolve().parents[1];out=root/a.output;out.mkdir(parents=True,exist_ok=False);prefix='/ranger-kompakt-v1/';web=root/'outputs/Ranger-Kompakt';entry=root/'outputs/Ranger-Kompakt.html';fixture=root/'verification/kompakt-v2/learning/earned-all-families.json';key='ranger-compact-fieldbook-v2';r={'passed':False,'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'htmlSHA256':hashlib.sha256(entry.read_bytes()).hexdigest(),'scope':'Real WebGL file/proxied-project-prefix distribution. Historical positive fixture imported through UI only for persistence; not newly earned evidence. No permissive file/CORS flags.','cases':[],'errors':[],'notChecked':[]}
class H(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def translate_path(self,path):
  if path.startswith(prefix):path=path[len(prefix)-1:]
  return super().translate_path(path)
server=ThreadingHTTPServer(('127.0.0.1',0),partial(H,directory=str(web)));Thread(target=server.serve_forever,daemon=True).start();origin=f'http://127.0.0.1:{server.server_port}'
with sync_playwright()as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 try:
  for name,url in [('standalone-file',entry.as_uri()),('web-project-prefix',origin+prefix+'index.html')]:
   ctx=b.new_context(viewport={'width':1080,'height':810},accept_downloads=True);page=ctx.new_page();requests=[];page.on('request',lambda request:requests.append(request.url));page.on('pageerror',lambda e:r['errors'].append(str(e)))
   try:page.goto(url)
   except Error as error:
    if name=='standalone-file' and 'ERR_BLOCKED_BY_ADMINISTRATOR' in str(error):
     r['notChecked'].append({'name':name,'status':'NICHT GEPRÜFT','reason':str(error),'scope':'Managed Chromium policy blocks actual file:// navigation. No flags/policy bypass, no HTTP result relabelled as file PASS.'});(out/'result.json').write_text(json.dumps(r,indent=2)+'\n');print('NOT CHECKED',name,'managed browser policy',flush=True);ctx.close();continue
    raise
   page.wait_for_selector('#world[data-ready=true]',timeout=120000);page.locator('#start').click();page.locator('#journal-button').click();choose_import_file(page,str(fixture));page.locator('#apply-import').click();before=page.evaluate('(k)=>localStorage.getItem(k)',key);assert before and len(json.loads(before)['records'])>0
   with page.expect_download()as d:page.locator('#export').click()
   saved=out/(name+'-export.json');d.value.save_as(str(saved));exported=json.loads(saved.read_text());assert exported['records']==json.loads(before)['records'];page.reload();page.wait_for_selector('#world[data-ready=true]',timeout=120000);assert page.evaluate('(k)=>localStorage.getItem(k)',key)==before;page.locator('#start').click();page.locator('#journal-button').click();image=out/(name+'.png');page.screenshot(path=str(image));assert not r['errors'],r['errors']
   external=[u for u in requests if u.startswith(('http://','https://'))and not u.startswith(origin+prefix)];assert not external,(name,external)
   r['cases'].append({'name':name,'urlScope':'file:// local standalone'if name=='standalone-file'else'HTTP nested project prefix','passed':True,'records':len(exported['records']),'requests':requests,'exportSHA256':hashlib.sha256(saved.read_bytes()).hexdigest(),'capture':image.name,'captureSHA256':hashlib.sha256(image.read_bytes()).hexdigest()});(out/'result.json').write_text(json.dumps(r,indent=2)+'\n');print('PASS',name,flush=True);ctx.close()
  assert any(c['name']=='web-project-prefix' and c['passed'] for c in r['cases'])
  r['passed']=True;r['passScope']='All available distribution cases passed; notChecked cases retain NICHT GEPRÜFT, never file:// PASS.'
 except Exception:r['failure']=traceback.format_exc();raise
 finally:(out/'result.json').write_text(json.dumps(r,indent=2)+'\n');b.close();server.shutdown();server.server_close()
