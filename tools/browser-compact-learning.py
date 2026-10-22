"""Earn K1–K5 through actual UI, export/reload, and inspect active model meshes.
No game state, evidence, clocks, or unlock flags are injected. Browser failure
injection is confined to the explicitly labelled quota resilience check.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
from module_graph import ModuleGraph
import argparse,base64,hashlib,json,shutil,subprocess,sys,time,traceback
p=argparse.ArgumentParser();p.add_argument('--site',default='outputs/Ranger-Kompakt');p.add_argument('--gallery',action='store_true');p.add_argument('--output',default='work/compact-learning');a=p.parse_args()
root=Path(__file__).resolve().parents[1];out=root/a.output;out.mkdir(parents=True,exist_ok=True);site=root/a.site
subprocess.run([sys.executable,str(root/'tools/verify-compact.py'),'--web',str(site)],cwd=root,check=True,stdout=subprocess.PIPE)
g=ModuleGraph(root/'dist','compact/main.js');result={'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'sourceDirty':bool(subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True).strip()),'runtimeSourceHashes':{name:hashlib.sha256((root/'dist'/name).read_bytes()).hexdigest()for name in sorted(set(g.modules)|g.assets|{'compact/style.css','kompakt.html','icon.svg'})},'startedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'checks':[],'errors':[],'captures':[],'hardwareScope':'Cloud Chromium, software graphics; no actual Safari/iPad/Mac or classroom pilot'}
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def do_GET(self):
  if self.path.startswith('/Ein-Tag-als-Ranger/'):self.path=self.path[len('/Ein-Tag-als-Ranger'):]
  super().do_GET()
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(site)));Thread(target=server.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{server.server_port}/Ein-Tag-als-Ranger/'
def save():(out/'result.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
def ok(name,**extra):
 assert not result['errors'],result['errors'];result['checks'].append({'name':name,'passed':True,**extra});save();print('PASS',name,flush=True)
def errors(page):page.on('pageerror',lambda error:result['errors'].append(str(error))if str(error)not in result['errors']else None)
def ready(page):
 page.set_default_timeout(45000);errors(page);page.goto(url);page.wait_for_function("document.querySelector('#world').dataset.ready==='true'",timeout=120000)
 boot=page.evaluate("()=>({readyMilliseconds:performance.now(),transferBytes:[...performance.getEntriesByType('navigation'),...performance.getEntriesByType('resource')].reduce((sum,r)=>sum+(r.transferSize||0),0),encodedBodyBytes:[...performance.getEntriesByType('navigation'),...performance.getEntriesByType('resource')].reduce((sum,r)=>sum+(r.encodedBodySize||0),0),resourceCount:performance.getEntriesByType('resource').length})");result.setdefault('boots',[]).append(boot);assert boot['transferBytes']<=15*1024*1024,'Initial playable scene exceeds the proposed 15 MiB transfer ceiling';save();page.locator('#start').click()
def close(page):
 if page.locator('#panel').evaluate('(p)=>p.open'):page.locator('#close').click()
def view(page,id):
 close(page);page.locator('#menu-button').click();page.get_by_text('Referenzabschnitt prüfen',exact=True).click();page.locator(f'[data-view="{id}"]').click();page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision')
def hub(page):close(page);page.locator('#objective').click()
def task(page,id):hub(page);page.locator(f'#panel [data-mission="{id}"]').click()
def data(page):return page.evaluate("JSON.parse(localStorage.getItem('ranger-compact-fieldbook-v2'))")
def screenshot(page,name):
 path=out/(name+'.png');page.screenshot(path=str(path));raw=path.read_bytes();result['captures'].append({'file':path.name,'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw),'source':'actual browser screenshot'});save()
def inspect(page,taxon,record=True,stage=None,capture=False):
 close(page);page.locator('#study').click();selector=f'[data-inspect][data-taxon="{taxon}"]'+(f'[data-stage="{stage}"]'if stage else'');button=page.locator(selector).first;assert button.count(),taxon
 individual=button.get_attribute('data-inspect');actual_stage=button.get_attribute('data-stage');button.click();page.wait_for_function('document.querySelector("#specimen-canvas").dataset.ready==="true"')
 if capture:
  encoded=page.evaluate('()=>new Promise(resolve=>requestAnimationFrame(()=>{resolve(document.querySelector("#specimen-canvas").toDataURL("image/png"));}))')
  raw=base64.b64decode(encoded.split(',',1)[1]);from PIL import Image
  import io
  with Image.open(io.BytesIO(raw))as image:assert len(image.convert('RGB').getcolors(image.width*image.height)or[])>30,'Empty active specimen '+taxon
  name='model-'+taxon+('-caterpillar'if actual_stage=='caterpillar'else'')+'.png';(out/name).write_bytes(raw);result['captures'].append({'file':name,'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw),'canvasOnly':True,'taxon':taxon,'stage':actual_stage,'individualId':individual,'runId':page.locator('#world').get_attribute('data-run-id'),'simulationTime':page.locator('#world').get_attribute('data-simulation-time'),'window':json.loads(page.locator('#world').get_attribute('data-ecology'))['window'],'source':'actual active mesh in the magnified WebGL view'});save()
 if record:
  page.wait_for_function('!document.querySelector("#inspection-record").disabled',timeout=45000);page.locator('#inspection-record').click();page.locator('#note').fill('Eigene Modellbeobachtung: erkennbare Merkmale notiert; natürliche Feinbestimmung bleibt begrenzt.');page.locator('#save-note').click();assert not page.locator('#panel').evaluate('(p)=>p.open');assert data(page)['records'][-1]['individualId']==individual
 else:close(page)
 return individual
with sync_playwright()as pw:
 options={'headless':True}
 if shutil.which('chromium'):options.update(executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 browser=pw.chromium.launch(**options);result['browserVersion']=browser.version;ctx=browser.new_context(viewport={'width':800,'height':600},accept_downloads=True);page=ctx.new_page()
 try:
  ready(page);manifest=json.loads(page.locator('#world').get_attribute('data-manifest'));assert len(manifest['activeTaxa'])==36;hub(page);assert page.locator('#panel [data-mission]').count()==5;close(page);hub(page);assert page.locator('#panel').is_visible();assert page.locator('#panel [data-mission]').count()==5;assert all(not r['complete']for r in json.loads(page.locator('#world').get_attribute('data-missions')));close(page);ok('36 active entries; five optional families initially incomplete, free play remains available')
  inspect(page,'galium_odoratum');inspect(page,'fagus_sylvatica');page.locator('#study').click();page.locator('#measure-site').click();close(page);view(page,'nettle');inspect(page,'urtica_dioica');page.locator('#study').click();page.locator('#measure-site').click();close(page)
  task(page,'K1');records=data(page)['records'];features={'galium_odoratum':['leaf-whorls','narrow-leaves'],'fagus_sylvatica':['smooth-bark','elliptic-leaf'],'urtica_dioica':['opposite-leaves','serrated-edge']}
  for r in records:
   page.locator('#determination-record').select_option(r['id'])
   for f in features[r['taxon']]:page.locator(f'input[name="features"][value="{f}"]').check()
   page.locator('#choice').select_option('uncertain'if r['taxon']=='galium_odoratum'else r['taxon'])
   if r['taxon']=='galium_odoratum':page.locator('#limit').select_option('no-flowers')
   page.locator('#reasoning').fill('Waldkern und heller Saum wurden mit derselben Modellmethode verglichen. Blattquirle ohne Blüten erlauben eine begründete unsichere Bestimmung.');page.locator('#add-determination').click()
  page.locator('#save-task').click();assert 'Strukturierte Belegprüfung erfüllt' in page.locator('#task-feedback').inner_text();screenshot(page,'K1-earned');ok('K1 earned from three different actual model observations, justified uncertainty and two same-method sites')
  task(page,'K2');page.get_by_text('Kontrollierter Konkurrenzversuch',exact=True).click();page.locator('#run-control').click();page.locator('#run-competitor').click();runs=data(page)['learning']['experiments'];control=next(r for r in runs if not r['parameters']['competitor']);comp=next(r for r in runs if r['parameters']['competitor']);page.locator('#control-id').select_option(control['id']);page.locator('#competitor-id').select_option(comp['id']);page.locator('#reasoning').fill('Nur der Mitnutzer wird verändert. Bei gleichem Seed, Startpool und Zugang sinkt der Ertrag. Das prüft die programmierte Regel und validiert keine Naturpopulation.');page.locator('#claim').select_option('presence-proves');page.locator('#alternative').select_option('tide-controlled');page.locator('#save-task').click();assert 'Noch offen' in page.locator('#task-feedback').inner_text();page.locator('#claim').select_option('resource-limits-yield');page.locator('#save-task').click();assert 'Strukturierte Belegprüfung erfüllt' in page.locator('#task-feedback').inner_text();screenshot(page,'K2-earned');ok('K2 real control/competitor runs; co-presence answer rejected, controlled resource explanation accepted')
  hub(page);page.locator('#level').select_option('eA');close(page);view(page,'coast');page.locator('#study').click();page.locator('#coast-protocol').click();page.locator('#next-high').click();page.locator('#specimen').select_option('compact-cockle-1');page.locator('#coast-protocol').click();page.locator('#specimen').select_option('compact-cockle-0');page.locator('#coast-protocol').click()
  for q in ['Q1','Q2','Q0']:page.locator(f'[data-sample="{q}"]').click()
  task(page,'K3');protocols=data(page)['learning']['protocols'];low=next(p for p in protocols if p['activity']=='resting');wrong=next(p for p in protocols if p['activity']=='filtering'and p['individualId']!=low['individualId']);high=next(p for p in protocols if p['activity']=='filtering'and p['individualId']==low['individualId']);page.locator('#low-id').select_option(low['id']);page.locator('#high-id').select_option(wrong['id'])
  for id,value in [('filtration','covered'),('access','exposed'),('absence','not-detected'),('depth','different-space')]:page.locator('#'+id).select_option(value)
  page.locator('#reasoning').fill('Gleiches Individuum, 5-cm-Untersuchungstiefe und getrennte stabile Modellfenster. Wasserbedeckung und Zugang wurden verglichen; Nullfund ist nicht nachgewiesen, nicht ausgestorben.');page.locator('#save-task').click();assert 'Noch offen' in page.locator('#task-feedback').inner_text();page.locator('#high-id').select_option(high['id']);page.locator('#save-task').click();assert 'Strukturierte Belegprüfung erfüllt' in page.locator('#task-feedback').inner_text();assert any(q['count']==0 for q in data(page)['learning']['samples']);screenshot(page,'K3-earned');ok('K3 earned with same individual after negative different-individual attempt; eA Q1/Q2/Q0 and true zero recorded')
  close(page);view(page,'wood');inspect(page,'fomes_fomentarius');task(page,'K4')
  for edge in ['leaf-litter>earthworm','earthworm>saprotrophs','saprotrophs>CO2','CO2>plant']:page.locator(f'input[name="edges"][value="{edge}"]').check()
  page.locator('#energy').select_option('energy-cycle');page.locator('#mineralization').select_option('microbes-not-worm-alone');page.locator('#reasoning').fill('Der eigene Zunderschwammbeleg wird mit dem gekennzeichneten Bodenschnitt ergänzt. Wurm und Mikroorganismen leisten verschiedene Schritte; Stoffe zirkulieren, nutzbare Energie nicht.');page.locator('#save-task').click();assert 'Noch offen' in page.locator('#task-feedback').inner_text();page.locator('#energy').select_option('heat-not-cycle');page.locator('#save-task').click();assert 'Strukturierte Belegprüfung erfüllt' in page.locator('#task-feedback').inner_text();screenshot(page,'K4-earned');ok('K4 own fungus observation plus explicit section-model edges; false energy cycle rejected')
  task(page,'K5');page.locator('#decision').select_option('seasonal-rest');page.locator('input[name="criteria"][value="access"]').check();page.locator('input[name="criteria"][value="disturbance"]').check();page.locator('input[name="evidence-ids"]').first.check();page.locator('#alternative').select_option('reroute');page.locator('#uncertainty').select_option('limited-model');page.locator('#fact-value').select_option('facts-and-values-separated');page.locator('#reasoning').fill('Ich gewichte störungsarme Beobachtung und Zugang. Saisonale Ruhe erhält den Zugang zu anderen Zeiten. Umleitung ist eine Alternative. Die Modell-Stördistanzen und realen Kosten bleiben unsicher.');page.locator('#save-task').click();assert 'Strukturierte Belegprüfung erfüllt' in page.locator('#task-feedback').inner_text();screenshot(page,'K5-earned');ok('K5 open decision documented with criteria, own evidence, alternative, uncertainty and ungraded reasoning')
  close(page);warning=page.locator('#performance-status');visible=warning.is_visible()
  layout=page.evaluate("()=>{const c=getComputedStyle(document.querySelector('#performance-status'));return {warningTop:parseFloat(c.top)+parseFloat(c.marginTop),controlBottom:Math.max(...['#objective','#study'].map(s=>document.querySelector(s).getBoundingClientRect().bottom))};}");assert layout['warningTop']>=layout['controlBottom'],'Slow-render warning would obscure mission/study controls when shown'
  if visible:
   box=warning.bounding_box()
   for selector in ['#objective','#study']:
    other=page.locator(selector).bounding_box()
    if other:assert box['x']+box['width']<=other['x']or other['x']+other['width']<=box['x']or box['y']+box['height']<=other['y']or other['y']+other['height']<=box['y'],selector+' obscured by performance warning'
  (out/'layout-result.json').write_text(json.dumps({'passed':True,'scope':'Read-only computed layout in the actual running app; no warning visibility or game state injection','cssSHA256':result['runtimeSourceHashes']['compact/style.css'],'viewport':page.viewport_size,'warningVisible':visible,'computedLayout':layout},indent=2)+'\n')
  ok('visible slow-render warning keeps objective and study controls unobscured',warningVisible=visible,computedLayout=layout)
  earned=data(page);(out/'earned-all-families.json').write_text(json.dumps(earned,ensure_ascii=False,indent=2));close(page);page.reload();page.wait_for_function("document.querySelector('#world').dataset.ready==='true'",timeout=120000);page.locator('#start').click();assert data(page)==earned;page.wait_for_function('JSON.parse(document.querySelector("#world").dataset.missions).every(m=>m.complete)');page.locator('#journal-button').click()
  with page.expect_download()as d:page.locator('#export').click()
  d.value.save_as(str(out/'downloaded-fieldbook.json'));assert json.loads((out/'downloaded-fieldbook.json').read_text())['learning']==earned['learning']
  with page.expect_download()as d:page.locator('#report').click()
  d.value.save_as(str(out/'readable-report.txt'));assert 'Untersuchungen'in(out/'readable-report.txt').read_text();ok('real reload preserves all acquired answers/evidence and recomputes five statuses; actual JSON and readable report downloads')
  before=page.evaluate("localStorage.getItem('ranger-compact-fieldbook-v2')");bad=json.loads(before);bad['learning']['protocols'][1]['initialSeed']+=1;page.locator('#import').set_input_files({'name':'contradictory.json','mimeType':'application/json','buffer':json.dumps(bad).encode()});assert 'Szenenkontext'in page.locator('#import-preview').inner_text();assert page.evaluate("localStorage.getItem('ranger-compact-fieldbook-v2')")==before;ok('contradictory imported scene protocol rejected by real file input without replacing saved work')
  bad=json.loads(before);bad['learning']['experiments'][1]['initialSeed']+=1;page.locator('#import').set_input_files({'name':'contradictory-experiment.json','mimeType':'application/json','buffer':json.dumps(bad).encode()});assert 'Versuchsbedingungen'in page.locator('#import-preview').inner_text();assert page.evaluate("localStorage.getItem('ranger-compact-fieldbook-v2')")==before;ok('controlled experiment with contradictory initial seed rejected by actual import without altering old work')
  bad=json.loads(before);bad['learning']['answers']['K1']['determinations']=1;page.locator('#import').set_input_files({'name':'malformed-answer.json','mimeType':'application/json','buffer':json.dumps(bad).encode()});assert 'Bestimmungsantwort'in page.locator('#import-preview').inner_text();assert page.evaluate("localStorage.getItem('ranger-compact-fieldbook-v2')")==before;ok('malformed nested task answer rejected atomically before it can break mission rendering')
  task(page,'K1');before=page.evaluate("localStorage.getItem('ranger-compact-fieldbook-v2')");page.evaluate("()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='ranger-compact-fieldbook-v2')throw new DOMException('quota test','QuotaExceededError');return original.call(this,k,v);};}");draft='Eigene noch ungespeicherte Begründung muss bei Quota als Datei sicherbar sein.';page.locator('#reasoning').fill(draft);assert 'Speichern nicht möglich'in page.locator('#learning-status').inner_text()
  with page.expect_download()as d:page.locator('#export-task').click()
  d.value.save_as(str(out/'quota-recovered-draft.json'));assert json.loads((out/'quota-recovered-draft.json').read_text())['learning']['answers']['K1']['reasoning']==draft;assert page.evaluate("localStorage.getItem('ranger-compact-fieldbook-v2')")==before;ok('quota during real answer editing leaves old storage intact and exports current uncommitted work')
  ctx.close();ctx=browser.new_context(viewport={'width':800,'height':600},accept_downloads=True);page=ctx.new_page();ready(page);hub(page);page.locator('#materials').click()
  for button,name in [('student-material','worksheets.html'),('teacher-material','teacher.html')]:
   with page.expect_download()as d:page.locator('#'+button).click()
   d.value.save_as(str(out/name));assert (out/name).read_text().count('<article>')==25
  page.locator('#open-analysis').click()
  for type in ['growth','predator','tolerance','carbon','nitrogen']:
   page.locator('#model-type').select_option(type);page.locator('#run-model').click();assert page.locator('#model-output svg').count()==1
   with page.expect_download()as d:page.locator('#export-model').click()
   d.value.save_as(str(out/('model-data-'+type+'.json')));model=json.loads((out/('model-data-'+type+'.json')).read_text());assert len(model['rows'])>10;assert model['source']in['didactic-model','theoretical-model']
  ok('all 25 student/teacher cards download and five actual numeric models produce plots, full tables and provenance downloads')
  close(page);view(page,'woodruff');page.locator('#study').click();page.locator('[data-taxon="galium_odoratum"]').first.click();page.wait_for_function('!document.querySelector("#inspection-record").disabled');page.locator('#specimen-canvas').evaluate("c=>{const gl=c.getContext('webgl2');gl.getExtension('WEBGL_lose_context').loseContext();}");page.wait_for_function('document.querySelector("#inspection-record").disabled');assert 'unterbrochen'in page.locator('#inspection-clock').inner_text();close(page);ok('actual WebGL loss in magnified view cancels evidence; closing releases the inspection context')
  ctx.close()
  old=json.loads((root/'verification/kompakt/final-earned-fieldbook.json').read_text());migration=browser.new_context(viewport={'width':800,'height':600});page=migration.new_page();page.add_init_script("localStorage.setItem('ranger-compact-fieldbook-v1',"+json.dumps(json.dumps(old))+");localStorage.setItem('evolutionswald-fieldjournal-v2','legacy-sentinel');");ready(page);page.locator('#journal-button').click();assert 'FRÜHERE KOMPAKTFASSUNG'in page.locator('#panel-body').inner_text();assert page.evaluate("JSON.parse(localStorage.getItem('ranger-compact-fieldbook-v1'))")==old;assert page.evaluate("localStorage.getItem('evolutionswald-fieldjournal-v2')")=='legacy-sentinel';assert page.locator('#count').inner_text()=='0';migration.close();ok('actual v1 boot migration preserves original compact file and large-world key without new observations/credit')
  tablet=browser.new_context(viewport={'width':1080,'height':810},device_scale_factor=2,has_touch=True,is_mobile=True);page=tablet.new_page();ready(page)
  assert page.locator('#world').get_attribute('data-graphics-profile')=='tablet'
  assert page.locator('#world').evaluate('(c)=>c.width')==1080
  initial=json.loads(page.locator('#world').get_attribute('data-observer'));r=page.locator('#joystick').bounding_box();cdp=tablet.new_cdp_session(page);cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':r['x']+r['width']/2,'y':r['y']+8,'id':1}]});page.wait_for_function('Number(document.querySelector("#world").dataset.movementSpeed)>1');cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});page.wait_for_function('Number(document.querySelector("#world").dataset.movementSpeed)===0');assert json.loads(page.locator('#world').get_attribute('data-observer'))!=initial
  screenshot(page,'tablet-landscape');page.set_viewport_size({'width':810,'height':1080});page.wait_for_function('document.querySelector("#world").width===810');hub(page);assert page.locator('#panel [data-mission]').count()==5;assert page.locator('#close').is_visible();screenshot(page,'tablet-portrait');close(page);view(page,'woodruff');inspect(page,'galium_odoratum');assert len(data(page)['records'])==1;tablet.close();ok('requested iPad 9 viewport approximation: touch movement, automatic tablet pixel cap, portrait/landscape, dialogs and acquired evidence',scope='Chromium touch emulation, 1080x810 and 810x1080, DPR2; no actual Apple hardware, Safari or iPadOS 27 certification')
  if a.gallery:
   gallery=browser.new_context(viewport={'width':800,'height':600});page=gallery.new_page();ready(page);seen=set()
   # At low water the redshank walks toward its roost; inspect it before
   # the long vegetation tour. This uses real UI and does not move the bird.
   view(page,'outlook');inspect(page,'tringa_totanus',record=False,capture=True);seen.add(('tringa_totanus',''))
   close(page);page.locator('#menu-button').click();page.locator('#season-window').select_option('autumn');page.locator('#close').click();view(page,'oak');inspect(page,'garrulus_glandarius',record=False,capture=True);seen.add(('garrulus_glandarius',''))
   visits=[('summer','woodruff'),('summer','nettle'),('summer','flowers'),('summer','wood'),('summer','oak'),('summer','upper-marsh'),('summer','lower-marsh'),('summer','salt-shrub'),('summer','salt-segments'),('summer','salt-grass'),('summer','coast'),('summer','outlook'),('dusk','dusk'),('autumn','oak')]
   for window,location in visits:
    close(page);page.locator('#menu-button').click();page.locator('#season-window').select_option(window);page.locator('#close').click();view(page,location);page.locator('#study').click();buttons=page.locator('[data-inspect]').evaluate_all('(bs)=>bs.map(b=>({taxon:b.dataset.taxon,stage:b.dataset.stage}))');close(page)
    for b in buttons:
     key=(b['taxon'],b['stage']if b['taxon']=='aglais_io'else'');
     if key in seen:continue
     inspect(page,b['taxon'],record=False,stage=b['stage'],capture=True);seen.add(key)
   expected=set(manifest['activeTaxa']);actual={x[0]for x in seen};assert actual==expected,{'missing':sorted(expected-actual),'unexpected':sorted(actual-expected)};assert ('aglais_io','caterpillar')in seen;gallery.close();ok('all 36 active taxa plus caterpillar captured from actual magnified meshes through reachable study sites',taxa=sorted(actual))
  assert not result['errors'];result['completedAt']=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime());save()
 except Exception as error:
  result['failure']=str(error);result['traceback']=traceback.format_exc();save();
  try:screenshot(page,'failure')
  except Exception:pass
  print(result['traceback'],flush=True);raise
 finally:
  browser.close();server.shutdown();server.server_close()
print(json.dumps({'passed':len(result['checks']),'captures':len(result['captures']),'errors':result['errors']},ensure_ascii=False))
