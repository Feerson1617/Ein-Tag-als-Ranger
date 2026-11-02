"""Explicit reference-only preflight of the full, unchanged feeding assertions.
No normal route or900-second PASS. Native endpoint alignment can be exercised
from a small actual input displacement. Output is required and never reused.
"""
from pathlib import Path
import argparse,sys,hashlib,json
p=argparse.ArgumentParser();p.add_argument('--output',required=True);p.add_argument('--entry',default='Ranger-Kompakt.html');p.add_argument('--site',default='outputs');p.add_argument('--align-check',action='store_true');a=p.parse_args();root=Path(__file__).resolve().parents[1];folder=root/a.output;folder.mkdir(parents=True,exist_ok=False);source=root/'tools/browser-compact-arrival.py';text=source.read_text()
old="  walk(page,layout['route'],'full-main-route');result['routeMetrics']=layout['metrics']"
new="""  pointer(page,page.locator('#menu-button'));pointer(page,page.get_by_text('Referenzabschnitt prüfen',exact=True));pointer(page,page.locator('[data-view="outlook"]'))
  page.locator('[data-view="outlook"]').wait_for(state='hidden');page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision')
  result['scope']='Public-reference feeding diagnostic ONLY. No full ordinary walk,900s or hardware acceptance. All original phase/contact/visibility/identity/consumption assertions retained.'
  result['fullWalkPassed']=False;result['walkBudgetScope']='Not exercised; reference diagnostic, not the original or supplemental full route.'
"""
if a.align_check:new+="""  t=sample(page)['time'];page.keyboard.down('w')
  try:page.wait_for_function('(t)=>Number(document.querySelector("#world").dataset.simulationTime)>t+.3',arg=t)
  finally:page.keyboard.up('w')
  align_outlook(page)
"""
assert text.count(old)==1;text=text.replace(old,new)
old="  walk(page,list(reversed(layout['route'][branch:])),'return-to-study-spur');walk(page,layout['outlook'],'study-spur')";assert text.count(old)==1;text=text.replace(old,'  # No route walking in this separately labelled reference-only diagnostic.')
old=";assert all(arrived['ecology']['resources'][key]==0 for key in resources),'Expected finite prey depleted after actual full route'";assert text.count(old)==1;text=text.replace(old,";result['initialPoolScope']='Reference visit is not a full arrival; no initial empty-pool claim. Finite depletion after1200 explicit model seconds is still asserted.'")
if a.align_check:text=text.replace('has_touch=a.v1_route','has_touch=True')
text=text.replace('Full walk is documented separately by actual input telemetry and screenshots.','This is the explicitly labelled public-reference diagnostic; no full walk took place.')
text=text.replace('Original complete real-time browser recording including visible labels, whole native walk, four first real-time sequences and explicitly labelled later model-step segments; no accelerated playback or synthesized frames','Original browser recording of the reference diagnostic until actual completion or failure. No full route. Completed sequence coverage is stated individually in result.json; no planned unexecuted segments are claimed.')
(folder/'EXECUTED-DRIVER.py.txt').write_text(text);(folder/'WRAPPER.json').write_text(json.dumps({'referenceOnly':True,'alignCheck':a.align_check,'originalDriverSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'executedDriverSHA256':hashlib.sha256(text.encode()).hexdigest(),'scope':'Only route calls and arrival-only initial-empty-pool assertion omitted, because no full walk was requested. All eight feeding sequences, later1200-model-second wait, contacts/identity/visibility, actual saving/export and videos unchanged.'},indent=2)+'\n')
sys.argv=[str(source),'--detail-realtime','--output',a.output,'--site',a.site,'--entry',a.entry]
exec(compile(text,str(source),'exec'),{'__file__':str(source),'__name__':'__main__'})
