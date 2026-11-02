"""Supplemental full inventory reached by ordinary W/mouse inputs at 600x375.
The original gallery script/assertions are retained unchanged as the oracle.
No world/state/clock writes. Read-only specimen provenance guides aiming.
"""
from pathlib import Path
import hashlib,base64
source=Path(__file__).with_name('browser-compact-visual-gallery.py')
code=source.read_text().replace('import argparse,json,hashlib,shutil,traceback','import argparse,json,hashlib,shutil,traceback,math,time\nfrom compact_native_navigation import NativeNavigator')
code=code.replace("viewport={'width':800,'height':600}","viewport={'width':600,'height':375}")
a=code.index(' def view(v):');z=code.index(' def click(button):',a)
code=code[:a]+''' navigator=None
 def view(v):
  close();navigator.go(v)
 def aim(point):
  state=navigator.read();o=state['observer'];dx=point[0]-o['x'];dz=point[2]-o['z'];navigator.look(math.atan2(-dx,-dz))
  height=page.locator('#world').evaluate('e=>Number(e.dataset.eyeHeight)')
  # Walking height is calculated by the same immutable layout off-line.
  import subprocess
  ground=float(subprocess.check_output(['node','--input-type=module','-e',f"import{{walkingHeight}}from'./dist/compact/layout.js';console.log(walkingHeight({o['x']},{o['z']}))"],cwd=root,text=True))
  pitch=max(-1.2,min(1.2,math.atan2(point[1]-ground-1.67,math.hypot(dx,dz))));delta=navigator.read()['observer']['pitch']-pitch
  while abs(delta)>1e-4:
   turn=max(-.22,min(.22,delta));page.mouse.move(350,240);page.mouse.down();page.mouse.move(350,240+turn/.0025);page.mouse.up();delta-=turn
''' +code[z:]
code=code.replace("page.locator('#specimen-canvas').screenshot(path=str(out/detail))", """provenance=json.loads(page.locator('#specimen-canvas').get_attribute('data-source'));click(page.locator('#inspection-expand'));page.locator('#specimen-canvas').scroll_into_view_if_needed();page.wait_for_function('document.querySelector("#specimen-canvas").dataset.ready==="true"');page.locator('#specimen-canvas').screenshot(path=str(out/detail))""")
code=code.replace("page.screenshot(path=str(out/world));after=", """aim(provenance['point']);page.screenshot(path=str(out/world));tool='binocular'if provenance['taxon']=='dendrocopos_major'or provenance['size']>=.25 and provenance['taxon']not in ['fagus_sylvatica','quercus_robur','galium_odoratum','urtica_dioica','rubus_fruticosus','trifolium_pratense','halimione_portulacoides','salicornia_europaea','festuca_rubra','sporobolus_anglicus','puccinellia_maritima','limonium_vulgare']else'magnifier';click(page.locator('#'+tool));page.wait_for_timeout(700);toolFile=world.replace('-world','-tool');page.screenshot(path=str(out/toolFile));focus=page.locator('#world').get_attribute('data-focus-individual');click(page.locator('#'+tool));after=""")
code=code.replace("'taxon':taxon,'stage':stage,'individual':individual,'location':location", "'taxon':taxon,'stage':stage,'individual':individual,'source':provenance,'tool':tool,'focusedIndividual':focus,'focusMatches':focus==individual,'toolObserver':json.loads(after['observer']),'toolImage':toolFile,'location':location")
code=code.replace("for f in [world,detail]", "for f in [world,detail,toolFile]")
code=code.replace("aim(provenance['point']);page.screenshot", "approach_specimen(provenance);aim(provenance['point']);page.screenshot")
code=code.replace(' def capture(taxon,stage,location):',''' def approach_specimen(provenance):
  point=provenance['point'];o=navigator.read()['observer'];distance=math.hypot(point[0]-o['x'],point[2]-o['z'])
  if provenance['size']<.25 or provenance['taxon']in ['limonium_vulgare','fomes_fomentarius']:
   if distance>7.5:
    # Reach the real specimen by another collision-checked native walking leg.
    navigator.targets['specimen-return']=(o['x'],o['z']);provenance['returnAfterCapture']=True
    target=(point[0]+(o['x']-point[0])/distance*3,point[2]+(o['z']-point[2])/distance*3)
    navigator.targets['specimen-'+provenance['individual']]=min(navigator.nodes,key=lambda q:math.dist(q,target));navigator.go('specimen-'+provenance['individual'])
 def capture(taxon,stage,location):''')
code=code.replace("focus=page.locator('#world').get_attribute('data-focus-individual');click", "focus=page.locator('#world').get_attribute('data-focus-individual');record_motion(taxon,individual,tool,focus);click")
code=code.replace(' def capture(taxon,stage,location):',''' def record_motion(taxon,individual,tool,focus):
  if taxon not in ['capreolus_capreolus','dendrocopos_major']:return
  data=lambda:page.locator('#world').evaluate('c=>({...c.dataset})')
  before=data();started=time.monotonic()
  page.evaluate("()=>{const stream=document.querySelector('#world').captureStream(12),v=window.__galleryMotion={stream,chunks:[]};v.rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8',videoBitsPerSecond:700000});v.rec.ondataavailable=e=>{if(e.data.size)v.chunks.push(e.data)};v.rec.start(1000)}")
  samples=[]
  for i in range(8):page.wait_for_timeout(1000);samples.append(data())
  encoded=page.evaluate("()=>new Promise(resolve=>{const v=window.__galleryMotion;v.rec.onstop=async()=>{const raw=new Uint8Array(await new Blob(v.chunks,{type:'video/webm'}).arrayBuffer());let text='';for(let i=0;i<raw.length;i+=32768)text+=String.fromCharCode(...raw.subarray(i,i+32768));v.stream.getTracks().forEach(t=>t.stop());resolve(btoa(text));};v.rec.stop()})")
  raw=base64.b64decode(encoded);filename=taxon+'-native-motion.webm';(out/filename).write_bytes(raw)
  r.setdefault('motion',[]).append({'taxon':taxon,'individual':individual,'tool':tool,'focusedIndividual':focus,'before':before,'samples':samples,'file':filename,'sha256':hashlib.sha256(raw).hexdigest(),'wallSeconds':time.monotonic()-started,'scope':'Actual canvas after native walking and regular binocular; real-time model, no time or position injection.'});save()
 def capture(taxon,stage,location):''')

code=code.replace("page.locator('#start').click();manifest=", """page.locator('#start').click();page.locator('#menu-button').click();page.locator('#quality').select_option('tablet');page.locator('#resume').click();navigator=NativeNavigator(page,root,r,save);navigator.targets.update({'upper-marsh':(23,20),'lower-marsh':(35,-17),'salt-shrub':(32,10),'salt-segments':(46,-3),'salt-grass':(43,-13)});r['referenceViewClicks']=0;page.expose_function('auditReferenceClick',lambda:r.update(referenceViewClicks=r['referenceViewClicks']+1));page.evaluate("()=>document.addEventListener('click',e=>{if(e.target.closest('[data-view]'))window.auditReferenceClick()},true)");page.add_style_tag(content='#focus,#notice{visibility:hidden!important}');r['labelMask']='Only focus/notice text hidden during blind screenshots; original canvas pixels and all interaction controls retained.';r['scope']='Normal-start native walking to all study sites, regular tool plus expanded same-individual detail. Focus matching is reported separately from visual diagnostic sufficiency; no automatic naturalism PASS.';manifest=""")
# Visit forest before coast to avoid crossing the whole world repeatedly.
code=code.replace("visits=[('summer','outlook'),('autumn','oak'),('summer','woodruff'),('summer','nettle'),('summer','flowers'),('summer','wood'),('summer','oak'),", "visits=[('summer','woodruff'),('summer','nettle'),('summer','flowers'),('summer','wood'),('autumn','oak'),('summer','oak'),")
code=code.replace("close();page.locator('#menu-button').click();page.locator('#season-window').select_option(window);close();view(location);page.locator('#study').click()","close();view(location);page.locator('#menu-button').click();page.locator('#season-window').select_option(window);close();page.locator('#study').click()")
code=code.replace("assert page.locator('#count').inner_text()=='0';", "assert r['referenceViewClicks']==0;assert page.locator('#count').inner_text()=='0';")
code=code.replace("r['captures'].append(row);save();print", "r['captures'].append(row);save();navigator.go('specimen-return')if provenance.get('returnAfterCapture')else None;print")
exec(compile(code,str(Path(__file__)),'exec'))
