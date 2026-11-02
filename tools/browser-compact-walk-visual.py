"""Supplemental actual full walk using the existing public brisk control.
Separate from the unchanged default900s arrival test; no position/time writes.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
from compact_runtime import audit_standalone
from compact_graphics_audit import observe_graphics_errors
import argparse,hashlib,json,math,shutil,subprocess,time,traceback
p=argparse.ArgumentParser();p.add_argument('--output',default='work/visual/walk-supplement');p.add_argument('--wall-budget',type=int,default=3600);a=p.parse_args();root=Path(__file__).resolve().parents[1];out=root/a.output;out.mkdir(parents=True,exist_ok=True);audit=audit_standalone(root,root/'outputs/Ranger-Kompakt.html')
layout=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import{ROUTE,routeMetrics}from'./dist/compact/layout.js';console.log(JSON.stringify({route:ROUTE,metrics:routeMetrics()}));"],cwd=root,text=True));route=layout['route'];r={'passed':False,'htmlAudit':audit,'viewport':{'width':600,'height':375},'scope':'Separate functional visual walk: ordinary W/mouse, publicly enabled 2.8 m/s brisk walking, 600x375 viewport, explicit 3600s guard. Not a passed original900s test, not evidence of 30FPS. No reference teleportation, hidden clock or position writes.','wallBudget':a.wall_budget,'samples':[],'captures':[],'errors':[]}
class H(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
s=ThreadingHTTPServer(('127.0.0.1',0),partial(H,directory=str(root/'outputs')));Thread(target=s.serve_forever,daemon=True).start()
def save():(out/'result.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
with sync_playwright()as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);page=b.new_page(viewport=r['viewport']);page.set_default_timeout(60000);page.on('pageerror',lambda e:r['errors'].append(str(e)));observe_graphics_errors(page,r['errors'])
 def sample():return page.locator('#world').evaluate('(e)=>({observer:JSON.parse(e.dataset.observer),modelTime:Number(e.dataset.simulationTime),runId:e.dataset.runId,plants:e.dataset.plantCount,ecology:JSON.parse(e.dataset.ecology),movementSpeed:e.dataset.movementSpeed})')
 def look(yaw):
  o=sample()['observer'];delta=(o['yaw']-yaw+math.pi)%(2*math.pi)-math.pi;expected=o['yaw']
  while abs(delta)>1e-5:
   turn=max(-.45,min(.45,delta));page.mouse.move(300,190);page.mouse.down();page.mouse.move(300+turn/.003,190);page.mouse.up();delta-=turn;expected-=turn
   page.wait_for_function('(target)=>{const yaw=JSON.parse(document.querySelector("#world").dataset.observer).yaw;return Math.abs(Math.atan2(Math.sin(yaw-target),Math.cos(yaw-target)))<1e-5}',arg=expected)
 def shot(name):
  page.keyboard.up('w');f=name+'.png';page.screenshot(path=str(out/f));r['captures'].append({'file':f,'sha256':hashlib.sha256((out/f).read_bytes()).hexdigest(),'sample':sample()});save();page.keyboard.down('w')
 try:
  page.goto(f'http://127.0.0.1:{s.server_port}/Ranger-Kompakt.html');page.wait_for_selector('#world[data-ready=true]',timeout=120000);page.locator('#start').click();page.locator('#brisk').click();assert page.locator('#brisk').get_attribute('aria-pressed')=='true';initial=sample();r['initial']=initial;started=time.monotonic();lastMotion=started;anchor=initial['observer'];last=anchor;travel=0;i=0;seen=set();page.keyboard.down('w')
  while True:
   current=sample();o=current['observer'];now=time.monotonic();travel+=math.hypot(o['x']-last['x'],o['z']-last['z']);last=o
   if math.hypot(o['x']-anchor['x'],o['z']-anchor['z'])>.025:lastMotion=now;anchor=o
   assert now-lastMotion<25,('Walking blocked',i,o);assert now-started<a.wall_budget,('Explicit supplemental wall budget exhausted',i,o);assert not r['errors'];assert current['runId']==initial['runId'] and current['plants']==initial['plants']
   i=min(range(i,min(len(route),i+30)),key=lambda j:math.hypot(route[j]['x']-o['x'],route[j]['z']-o['z']))
   if i>=len(route)-4 and math.hypot(route[-1]['x']-o['x'],route[-1]['z']-o['z'])<.5:break
   target=route[min(i+6,len(route)-1)];yaw=math.atan2(-(target['x']-o['x']),-(target['z']-o['z']))
   if abs((o['yaw']-yaw+math.pi)%(2*math.pi)-math.pi)>.025:look(yaw)
   zone='wald'if o['x']<-24 else'dorf'if o['x']<1 else'deich'if o['x']<18 else'salzwiese'if o['x']<52 else'watt'
   if zone not in seen:seen.add(zone);shot(zone)
   if not r['samples']or now-r['samples'][-1]['wall']>5:r['samples'].append({'wall':now,'elapsedSeconds':now-started,'routeIndex':i,**current});save();print('WALK',zone,i,round(travel,1),flush=True)
   page.wait_for_function('(t)=>Number(document.querySelector("#world").dataset.simulationTime)>t',arg=current['modelTime']);page.wait_for_timeout(100)
  page.keyboard.up('w');r.update(final=sample(),actualSeconds=time.monotonic()-started,sampledTravelMeters=travel,metrics=layout['metrics']);assert seen=={'wald','dorf','deich','salzwiese','watt'};assert math.hypot(r['final']['observer']['x']-route[-1]['x'],r['final']['observer']['z']-route[-1]['z'])<.55;assert page.locator('#count').inner_text()=='0';r['passed']=True;shot('angekommen');page.keyboard.up('w')
 except Exception:r['failure']=traceback.format_exc();save();page.screenshot(path=str(out/'failure.png'));raise
 finally:page.keyboard.up('w');save();b.close();s.shutdown();s.server_close()
