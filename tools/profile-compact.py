"""Read-only Chromium sampling of the actual game; does not advance model time."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
from compact_graphics_audit import observe_graphics_errors
import argparse,collections,hashlib,json,shutil,statistics,time,traceback
p=argparse.ArgumentParser();p.add_argument('--entry',default='outputs/Ranger-Kompakt.html');p.add_argument('--output',default='work/round2/profile');p.add_argument('--seconds',type=int,default=15);a=p.parse_args();root=Path(__file__).resolve().parents[1];entry=(root/a.entry).resolve();out=root/a.output;out.mkdir(parents=True,exist_ok=True)
r={'scope':'Actual wall-clock rAF, CDP CPU/renderer telemetry; no device certification. Sampling overhead is recorded, not ignored.','htmlSHA256':hashlib.sha256(entry.read_bytes()).hexdigest(),'args':['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'],'errors':[],'samples':[]}
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(entry.parent)));Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=r['args']);ctx=b.new_context(viewport={'width':800,'height':600});page=ctx.new_page();page.on('pageerror',lambda e:r['errors'].append(str(e)));observe_graphics_errors(page,r['errors'])
 try:
  boot=time.monotonic();page.goto(f'http://127.0.0.1:{server.server_port}/{entry.name}');page.wait_for_selector('#world[data-ready=true]',timeout=120000);r['bootWallSeconds']=time.monotonic()-boot;r['navigation']=page.evaluate('()=>performance.getEntriesByType("navigation").map(e=>({duration:e.duration,domContentLoaded:e.domContentLoadedEventEnd,loadEvent:e.loadEventEnd,transferSize:e.transferSize}))');page.locator('#start').click();system=b.new_browser_cdp_session();gpuInfo=system.send('SystemInfo.getInfo');r['gpuDevices']=gpuInfo.get('gpu',{}).get('devices');r['gpuFeatures']=gpuInfo.get('gpu',{}).get('featureStatus');cdp=ctx.new_cdp_session(page);cdp.send('Performance.enable');cdp.send('Profiler.enable');r['browser']=b.version
  r['gpu']=page.evaluate('''()=>{const gl=document.querySelector('#world').getContext('webgl2'),ext=gl.getExtension('WEBGL_debug_renderer_info');return {vendor:gl.getParameter(gl.VENDOR),renderer:gl.getParameter(gl.RENDERER),version:gl.getParameter(gl.VERSION),unmaskedVendor:ext&&gl.getParameter(ext.UNMASKED_VENDOR_WEBGL),unmaskedRenderer:ext&&gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)}}''')
  for profile in ['desktop','tablet']:
   if profile=='tablet':page.locator('#menu-button').click();page.locator('#quality').select_option('tablet');page.locator('#resume').click()
   page.evaluate('''()=>{window.__profileFrames=[];window.__profileRunning=true;window.__profilePrevious=performance.now();function sample(t){if(!window.__profileRunning)return;window.__profileFrames.push(t-window.__profilePrevious);window.__profilePrevious=t;requestAnimationFrame(sample)}requestAnimationFrame(sample)}''')
   processBefore={row['id']:row for row in system.send('SystemInfo.getProcessInfo')['processInfo']};before=cdp.send('Performance.getMetrics');start=page.locator('#world').evaluate('(e)=>({...e.dataset})');wall=time.monotonic();cdp.send('Profiler.start');page.wait_for_timeout(a.seconds*1000);cpu=cdp.send('Profiler.stop')['profile'];elapsed=time.monotonic()-wall;processAfter=system.send('SystemInfo.getProcessInfo')['processInfo'];processCPU=[{'id':row['id'],'type':row['type'],'cpuSeconds':row['cpuTime']-processBefore[row['id']]['cpuTime']}for row in processAfter if row['id']in processBefore];frames=page.evaluate('()=>{window.__profileRunning=false;return window.__profileFrames}');after=cdp.send('Performance.getMetrics');end=page.locator('#world').evaluate('(e)=>({...e.dataset})');(out/(profile+'-cpu.json')).write_text(json.dumps(cpu)+'\n')
   hits=collections.Counter();
   for n in cpu['nodes']:hits[n['callFrame']['functionName'] or '(anonymous)']+=n.get('hitCount',0)
   bm={m['name']:m['value']for m in before['metrics']};am={m['name']:m['value']for m in after['metrics']};deltas={k:am[k]-bm[k] for k in am if k in bm and k.endswith('Duration')};frames=sorted(frames)
   row={'profile':profile,'wallSeconds':elapsed,'measuredFrameCount':len(frames),'fps':1000/statistics.mean(frames),'frameMs':{'median':statistics.median(frames),'p95':frames[int((len(frames)-1)*.95)],'max':max(frames)},'modelSeconds':float(end['simulationTime'])-float(start['simulationTime']),'start':start,'end':end,'CDPdurationDeltas':deltas,'processCPU':processCPU,'topCPUSelfSamples':hits.most_common(25)};r['samples'].append(row);print(json.dumps({k:v for k,v in row.items() if k not in ['start','end']}),flush=True)
  assert not r['errors'],r['errors'];r['completed']=True
 except Exception:r['failure']=traceback.format_exc();raise
 finally:(out/'result.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');b.close();server.shutdown();server.server_close()
