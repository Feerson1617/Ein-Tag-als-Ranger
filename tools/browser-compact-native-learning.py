"""Additional learner-route acceptance, separate from unchanged reference tests.
Reuse the existing K1–K5 answer/assertion sequence; replace every reference
transfer by independently planned native W/mouse walking. No state injection.
Technical route feasibility is not unaided learner search time or a pilot.
"""
from pathlib import Path
import hashlib,sys
from compact_native_navigation import NativeNavigator
from compact_native_feeding import feeding_episodes
source=Path(__file__).with_name('browser-compact-learning.py')
text=source.read_text()
prefix,body=text.split('with sync_playwright()as pw:',1)
# Keep original functions as the comparison oracle; a second input path below
# overrides only travel. The old file and its assertions remain byte unchanged.
body=body.split('  close(page);warning=page.locator',1)[0]
body=body.replace("viewport={'width':800,'height':600}","viewport={'width':600,'height':375}")
body=body.replace("view(page,'coast');page.locator('#study').click();page.locator('#coast-protocol').click()", "view(page,'coast');page.locator('#study').click();page.locator('#next-low').click();page.locator('#coast-protocol').click()")
override='''
original_ready=ready
navigator=None
def ready(page):
 global navigator
 original_ready(page)
 page.locator('#menu-button').click();page.locator('#quality').select_option('tablet');page.locator('#resume').click()
 navigator=NativeNavigator(page,root,result,save)
 result['scope']='Second independent native travel path; shared existing K1–K5 answer assertions. No reference views, teleports, clock/state/evidence writes. Public labelled tide buttons remain intentional K3 actions. Not human search-time measurement.'
 result['referenceOracleSHA256']=hashlib.sha256(Path(__file__).with_name('browser-compact-learning.py').read_bytes()).hexdigest()
 result['referenceViewClicks']=0
 page.expose_function('report_reference_click',lambda:result.update(referenceViewClicks=result['referenceViewClicks']+1))
 page.evaluate("()=>document.addEventListener('click',e=>{if(e.target.closest('[data-view]'))window.report_reference_click()},true)")
def view(page,id):
 close(page);navigator.go(id)
 if id=='coast':feeding_episodes(page,out,result,save,navigator)
'''
ending='''
  close(page);earned=data(page);assert all(m['complete']for m in json.loads(page.locator('#world').get_attribute('data-missions')))
  assert result['referenceViewClicks']==0
  (out/'earned-all-families.json').write_text(json.dumps(earned,ensure_ascii=False,indent=2))
  result['passed']=True;ok('All K1–K5 earned with normal travel, negative answers corrected and no reference transfers')
 except Exception:
  result['failure']=traceback.format_exc();result['passed']=False;save();page.screenshot(path=str(out/'failure.png'));raise
 finally:
  save();browser.close();server.shutdown();server.server_close()
'''
code=prefix+override+'\nwith sync_playwright()as pw:'+body+ending
exec(compile(code,str(Path(__file__)), 'exec'))
