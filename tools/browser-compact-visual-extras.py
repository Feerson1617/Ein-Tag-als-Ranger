"""Supplementary actual seaward view, paired fixed feeding phase and bee video.
Only public controls; immutable input HTML. No simulation/evidence injection.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
import argparse,base64,hashlib,json,math,shutil,time,traceback
p=argparse.ArgumentParser();p.add_argument('--entry',required=True);p.add_argument('--output',required=True);p.add_argument('--compare');p.add_argument('--bee-video',action='store_true');a=p.parse_args();root=Path(__file__).resolve().parents[1];entry=(root/a.entry).resolve();out=root/a.output;out.mkdir(parents=True,exist_ok=True)
r={'passed':False,'htmlSHA256':hashlib.sha256(entry.read_bytes()).hexdigest(),'scope':'Actual WebGL images and optional unaccelerated live canvas video. Public mouse, menu and labelled model-step controls only. The seaward view has live timestamps; the paired feeding view has identical model time and actor/prey state.','captures':[],'errors':[]};old=json.loads((root/a.compare).read_text())if a.compare else None
class H(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
s=ThreadingHTTPServer(('127.0.0.1',0),partial(H,directory=str(entry.parent)));Thread(target=s.serve_forever,daemon=True).start()
def save():(out/'result.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
with sync_playwright()as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);page=b.new_page(viewport={'width':1200,'height':750});page.set_default_timeout(60000);page.on('pageerror',lambda e:r['errors'].append(str(e)))
 def view(v):
  page.locator('#menu-button').click();page.get_by_text('Referenzabschnitt prüfen',exact=True).click();page.locator('[data-view="'+v+'"]').click();page.wait_for_function('document.querySelector("#world").dataset.sceneRevision===document.querySelector("#world").dataset.renderRevision')
 def data():return page.locator('#world').evaluate('(e)=>({...e.dataset})')
 def shot(name,exact=False):
  d=data();page.screenshot(path=str(out/(name+'.png')));row={'file':name+'.png','sha256':hashlib.sha256((out/(name+'.png')).read_bytes()).hexdigest(),'observer':json.loads(d['observer']),'modelTime':d['simulationTime'],'ecology':json.loads(d['ecology']),'actors':json.loads(d['coastal']),'modelObservation':d['modelObservation']}
  if old:
   prev=next(x for x in old['captures']if x['file']==row['file']);row['sameCamera']=row['observer']==prev['observer'];assert row['sameCamera']
   if exact:assert row['modelTime']==prev['modelTime'] and row['actors']==prev['actors'] and row['ecology']==prev['ecology'];row['sameModelConditions']=True
  r['captures'].append(row);save()
 try:
  page.goto(f'http://127.0.0.1:{s.server_port}/{entry.name}');page.wait_for_selector('#world[data-ready=true]',timeout=120000);page.locator('#start').click();view('upper-marsh')
  # Two ordinary drags turn from the plant plot towards the seaward dike slope.
  for dx,dy in [(520,0),(math.pi/.003-520,-370)]:
   page.mouse.move(300,500);page.mouse.down();page.mouse.move(300+dx,500+dy,steps=8);page.mouse.up()
  shot('deich-seeseite')
  view('feeding-oystercatcher');page.locator('#study').click();page.locator('#new-observation-context').click();page.locator('[data-behavior="compact-oystercatcher"]').click();page.locator('#behavior-step-size').select_option('1');page.locator('#behavior-step').click();page.wait_for_function('Number(document.querySelector("#world").dataset.simulationTime)===1 && document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision');shot('nahrung-modellsekunde-1',True)
  # End the labelled episode through its real control before the live video.
  if a.bee_video:
   page.locator('#behavior-stop').click();view('flowers');page.locator('#magnifier').click();d=data();bee=next(x for x in json.loads(d['coastal'])if x['taxon']=='bombus_lapidarius');r['beeBefore']=bee;r['videoStartModelTime']=d['simulationTime'];started=time.monotonic()
   page.evaluate("()=>{const stream=document.querySelector('#world').captureStream(12);const v=window.__beeVideo={stream,chunks:[]};v.rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8',videoBitsPerSecond:1000000});v.rec.ondataavailable=e=>{if(e.data.size)v.chunks.push(e.data)};v.rec.start(1000);}")
   page.wait_for_function('(t)=>Number(document.querySelector("#world").dataset.simulationTime)>t+3',arg=float(d['simulationTime']),timeout=180000);shot('hummel-bewegt');after=data();r['beeAfter']=next(x for x in json.loads(after['coastal'])if x['taxon']=='bombus_lapidarius');assert any(r['beeAfter'][k]!=bee[k]for k in ['x','y','z']);r['videoEndModelTime']=after['simulationTime']
   encoded=page.evaluate("()=>new Promise(resolve=>{const v=window.__beeVideo;v.rec.onstop=async()=>{const b=new Uint8Array(await new Blob(v.chunks,{type:'video/webm'}).arrayBuffer());let text='';for(let i=0;i<b.length;i+=32768)text+=String.fromCharCode(...b.subarray(i,i+32768));v.stream.getTracks().forEach(t=>t.stop());resolve(btoa(text));};v.rec.stop();})")
   raw=base64.b64decode(encoded);assert len(raw)>3000 and raw.startswith(bytes.fromhex('1a45dfa3'));(out/'hummel-echtzeit.webm').write_bytes(raw);r['video']={'file':'hummel-echtzeit.webm','bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'wallSeconds':time.monotonic()-started,'scope':'Unaccelerated actual canvas recording. Model motion is slower on software graphics; the true model times are recorded separately.'}
  assert not r['errors'];assert page.locator('#count').inner_text()=='0';r['passed']=True
 except Exception:r['failure']=traceback.format_exc();save();page.screenshot(path=str(out/'failure.png'));raise
 finally:save();b.close();s.shutdown();s.server_close()
