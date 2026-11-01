"""Actual 360-degree native camera sweep; no texture retouching or model writes."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
from compact_graphics_audit import observe_graphics_errors
from PIL import Image,ImageChops,ImageStat
import argparse,hashlib,json,math,shutil,traceback
p=argparse.ArgumentParser();p.add_argument('--entry',default='outputs/Ranger-Kompakt.html');p.add_argument('--output',default='work/rc/sky');a=p.parse_args();root=Path(__file__).resolve().parents[1];entry=root/a.entry;out=root/a.output;out.mkdir(parents=True,exist_ok=True)
r={'passed':False,'htmlSHA256':hashlib.sha256(entry.read_bytes()).hexdigest(),'captures':[],'errors':[],'scope':'Actual sky viewed through native mouse input over a full turn. Pixel difference compares the same view after 2π, not a claim about hardware FPS.'}
class H(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(H,directory=str(entry.parent)));Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright()as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);page=b.new_page(viewport={'width':1000,'height':700});page.on('pageerror',lambda e:r['errors'].append(str(e)));observe_graphics_errors(page,r['errors']);page.set_default_timeout(60000)
 def read():return page.locator('#world').evaluate('c=>JSON.parse(c.dataset.observer)')
 def look(yaw,pitch):
  o=read();delta=o['yaw']-yaw
  while abs(delta)>.00001:
   turn=max(-.45,min(.45,delta));page.mouse.move(500,350);page.mouse.down();page.mouse.move(500+turn/.003,350);page.mouse.up();delta-=turn
  o=read();page.mouse.move(500,350);page.mouse.down();page.mouse.move(500,350+(o['pitch']-pitch)/.0025);page.mouse.up();page.wait_for_function('(a)=>{const o=JSON.parse(document.querySelector("#world").dataset.observer);return Math.abs(o.yaw-a.yaw)<.0001&&Math.abs(o.pitch-a.pitch)<.0001}',arg={'yaw':yaw,'pitch':pitch})
 try:
  page.goto(f'http://127.0.0.1:{server.server_port}/{entry.name}');page.wait_for_selector('#world[data-ready=true]',timeout=120000);page.locator('#start').click();page.locator('#menu-button').click();page.get_by_text('Referenzabschnitt prüfen',exact=True).click();page.locator('[data-view="upper-marsh"]').click();base=read()['yaw']
  for i in range(9):
   look(base+i*math.pi/4,.7);name=f'rotation-{i*45:03d}.png';page.screenshot(path=str(out/name));page.screenshot(path=str(out/f'sky-pixels-{i}.png'),clip={'x':270,'y':180,'width':400,'height':150});r['captures'].append({'file':name,'observer':read(),'sha256':hashlib.sha256((out/name).read_bytes()).hexdigest()})
  diff=ImageChops.difference(Image.open(out/'sky-pixels-0.png').convert('RGB'),Image.open(out/'sky-pixels-8.png').convert('RGB'));r['closureMeanRGBDifference']=ImageStat.Stat(diff).mean;assert max(r['closureMeanRGBDifference'])<2,r['closureMeanRGBDifference'];assert not r['errors'];r['passed']=True
 except Exception:r['failure']=traceback.format_exc();raise
 finally:(out/'result.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');b.close();server.shutdown();server.server_close()
