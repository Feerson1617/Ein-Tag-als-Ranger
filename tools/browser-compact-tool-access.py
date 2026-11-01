"""Targeted P2 and five questioned access paths. Native inputs, no state writes.
Read-only active-model provenance guides aiming; magnified-model access and
ordinary world focus are reported separately, never a blanket realism pass.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
from compact_native_navigation import NativeNavigator
import argparse,hashlib,json,math,shutil,subprocess,time,traceback
p=argparse.ArgumentParser();p.add_argument('--entry',default='outputs/Ranger-Kompakt.html');p.add_argument('--output',default='work/tool-access');p.add_argument('--only',nargs='+');a=p.parse_args()
root=Path(__file__).resolve().parents[1];entry=root/a.entry;out=root/a.output;out.mkdir(parents=True,exist_ok=True)
r={'entry':a.entry,'sha256':hashlib.sha256(entry.read_bytes()).hexdigest(),'cases':[],'errors':[],'scope':'Native walk, visible study and tool controls, 600 × 375. Read-only specimen provenance; no state/evidence writes. World focus differs from diagnostic sufficiency. Naturalism remains TEILWEISE.'}
def save():(out/'result.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
class H(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
s=ThreadingHTTPServer(('127.0.0.1',0),partial(H,directory=str(entry.parent)));Thread(target=s.serve_forever,daemon=True).start()
with sync_playwright()as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 r['browserVersion']=b.version
 page=b.new_page(viewport={'width':600,'height':375});page.set_default_timeout(45000);page.on('pageerror',lambda e:r['errors'].append(str(e)))
 def close():
  if page.locator('#panel').is_visible():page.locator('#close').click()
 def shot(name):page.screenshot(path=str(out/(name+'.png')))
 def aim(point):
  o=nav.read()['observer'];dx=point[0]-o['x'];dz=point[2]-o['z'];nav.look(math.atan2(-dx,-dz))
  ground=float(subprocess.check_output(['node','--input-type=module','-e',f"import{{walkingHeight}}from'./dist/compact/layout.js';console.log(walkingHeight({o['x']},{o['z']}))"],cwd=root,text=True))
  pitch=max(-1.2,min(1.2,math.atan2(point[1]-ground-1.67,math.hypot(dx,dz))));delta=nav.read()['observer']['pitch']-pitch
  while abs(delta)>1e-4:
   # Start above transient notices; pointer capture then carries the drag.
   assert page.evaluate('document.elementFromPoint(300,170).id')=='world'
   turn=max(-.22,min(.22,delta));page.mouse.move(300,170);page.mouse.down();page.mouse.move(300,170+turn/.0025);page.mouse.up();delta-=turn
 def probe(taxon):
  close();page.locator('#study').click();button=page.locator('[data-inspect][data-taxon="'+taxon+'"]').first
  assert button.count(),('No normal study access',taxon)
  button.click();page.wait_for_selector('#specimen-canvas[data-ready=true]');source=json.loads(page.locator('#specimen-canvas').get_attribute('data-source'))
  page.locator('#inspection-expand').click();page.wait_for_function('!document.querySelector("#inspection-record").disabled',timeout=45000);shot(taxon+'-detail')
  # Actual saved same-individual detail, independently distinguishable from world sighting.
  page.locator('#inspection-record').click();page.locator('#note').fill('Zugangsprüfung: aktive Nahansicht '+taxon);page.locator('#save-note').click()
  record=page.evaluate("JSON.parse(localStorage.getItem('ranger-compact-fieldbook-v2')).records.at(-1)")
  assert record['taxon']==taxon and record['individualId']==source['individual'] and record['method']=='magnified-active-model' and record['observationSeconds']>=2.5
  return source,record
 try:
  page.goto(f'http://127.0.0.1:{s.server_port}/{entry.name}');page.wait_for_selector('#world[data-ready=true]',timeout=120000)
  guide=page.locator('#start-guide').text_content();assert 'Lupe für Pflanzen, Pilze und kleine Tiere' in guide and 'gültige' in guide
  page.locator('#welcome summary').click();shot('welcome-help');page.locator('#start').click()
  page.locator('#read-sign').click();board=page.locator('#panel-body').inner_text();assert guide in board;shot('start-board');close()
  page.locator('#menu-button').click();page.locator('#guide').click();assert guide in page.locator('#panel-body').inner_text();shot('full-help');close()
  r['help']={'welcome':guide,'boardMatches':True,'fullMatches':True}
  page.locator('#menu-button').click();page.locator('#quality').select_option('tablet');page.locator('#resume').click()
  nav=NativeNavigator(page,root,r,save);nav.targets.update({'upper-marsh':(23,20),'salt-segments':(46,-3)})
  cases=[('wood','summer','fomes_fomentarius',True),('nettle','summer','urtica_dioica',True),('nettle','summer','aphidoidea',True),('nettle','summer','coccinella_septempunctata',False),('flowers','summer','bombus_lapidarius',True),('upper-marsh','summer','limonium_vulgare',False),('salt-segments','summer','salicornia_europaea',False),('coast','summer','cerastoderma_edule',False),('coast','summer','peringia_ulvae',False),('dusk','dusk','apodemus_sylvaticus',True)]
  for location,window,taxon,required in cases:
   if a.only and taxon not in a.only:continue
   close();nav.go(location);page.locator('#menu-button').click();page.locator('#season-window').select_option(window);page.locator('#resume').click()
   source,record=probe(taxon);point=source['point'];o=nav.read()['observer'];origin=(o['x'],o['z'])
   row={'taxon':taxon,'source':source,'detailRecord':record,'detailAccess':'BESTANDEN','worldAttempts':[]};r['cases'].append(row);save()
   # Distinct ordinary reachable approaches; buried fauna may require the
   # explicitly labelled study/sample route, which was actually saved above.
   base=math.atan2(o['z']-point[2],o['x']-point[0])
   candidates=[origin]+[(point[0]+3.5*math.cos(base+d),point[2]+3.5*math.sin(base+d))for d in [0,math.pi/2,-math.pi/2,math.pi]]
   matched=False
   for i,target in enumerate(candidates):
    if i:
     nav.targets['approach']=min(nav.nodes,key=lambda q:math.dist(q,target));nav.go('approach')
    # Refresh positions of moving specimens by opening the same public study
    # if still in range; never make a hidden world actor visible.
    if taxon in ['bombus_lapidarius','apodemus_sylvaticus'] and page.locator('#study').is_visible():
     page.locator('#study').click();button=page.locator('[data-inspect="'+source['individual']+'"]')
     if button.count():button.click();page.wait_for_selector('#specimen-canvas[data-ready=true]');point=json.loads(page.locator('#specimen-canvas').get_attribute('data-source'))['point']
     close()
    aim(point)
    if page.locator('#magnifier').get_attribute('aria-pressed')!='true':page.locator('#magnifier').click()
    began=time.monotonic();sample=None
    while time.monotonic()-began<6:
     if taxon=='bombus_lapidarius':
      # A flying bee has moved since its inspection dialog closed. Follow
      # its actual read-only world telemetry with ordinary mouse drags.
      live=page.locator('#world').evaluate('e=>JSON.parse(e.dataset.coastal).find(a=>a.id==="compact-bee")')
      aim([live['x'],live['y']+source['size']*.55,live['z']])
     sample=page.locator('#world').evaluate('e=>({taxon:e.dataset.focusTaxon,individual:e.dataset.focusIndividual,seconds:+e.dataset.observationSeconds,observer:JSON.parse(e.dataset.observer),ecology:JSON.parse(e.dataset.ecology),message:document.querySelector("#focus").textContent})')
     if sample['taxon']==taxon:
      assert sample['message'].startswith('Fund · ') and 'Pflanzenfund' not in sample['message']
      matched=True;break
     page.wait_for_timeout(100)
    row['worldAttempts'].append(sample);shot(taxon+'-world-'+str(i));save()
    if matched:break
   row['worldFocus']='BESTANDEN: Taxonfokus' if matched else 'KEIN FOKUS DES TAXONS AN DEN GEPRÜFTEN STANDORTEN'
   row['worldIndividualMatches']=bool(matched and sample['individual']==source['individual'])
   row['questAccess']='BESTANDEN: tatsächlicher Nahansichtbeleg desselben Individuums'
   if required:assert matched,('P2 required real tool feedback not reached',taxon,row)
   print('ACCESS',taxon,'world',matched,'detail',True,flush=True);save()
  assert not r['errors'];r['passed']=True
 except Exception:r['passed']=False;r['failure']=traceback.format_exc();shot('failure');raise
 finally:save();b.close();s.shutdown();s.server_close()
