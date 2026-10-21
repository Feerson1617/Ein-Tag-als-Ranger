"""Real browser checks; local HTTP only. No test-only unlock/teleport hooks.

Live measurements and observations are distinguished from labelled import fixtures.
Run the Node checks first to generate work/ui-fieldbook-fixture.json.
"""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from urllib.parse import urlsplit
import argparse, json, os, shutil, subprocess, time, traceback
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--site',default='dist')
parser.add_argument('--prefix',default='/')
parser.add_argument('--entry',default='index.html')
parser.add_argument('--browser',choices=['chromium','webkit','firefox'],default='chromium')
parser.add_argument('--width',type=int,default=960)
parser.add_argument('--height',type=int,default=640)
parser.add_argument('--live-mission',choices=['all','m1','m2','m3'],default='all')
parser.add_argument('--live',action='store_true',help='Additionally earn all three missions from the live scene')
parser.add_argument('--resilience',action='store_true',help='Test real WebGL loss, failed model load and quota errors')
parser.add_argument('--smoke',action='store_true',help='Boot, visible scene and tools only')
args=parser.parse_args()
prefix='/'+args.prefix.strip('/')+'/' if args.prefix.strip('/') else '/'
site=(ROOT/args.site).resolve()
out=ROOT/'work'/('browser-'+args.browser+('-subpath' if prefix!='/' else ''))
out.mkdir(parents=True,exist_ok=True)
class Handler(SimpleHTTPRequestHandler):
    def translate_path(self,path):
        path=urlsplit(path).path
        if prefix!='/':
            if not path.startswith(prefix):return str(site/'__not_found__')
            path='/'+path[len(prefix):]
        return super().translate_path(path)
    def log_message(self,*a):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(site)))
thread=Thread(target=server.serve_forever,daemon=True);thread.start()
url=f'http://127.0.0.1:{server.server_port}'+prefix+args.entry
result={'commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),
        'sourceDirty':bool(subprocess.check_output(['git','status','--porcelain','--untracked-files=normal'],cwd=ROOT,text=True).strip()),
        'startedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'site':args.site,'entry':args.entry,'prefix':prefix,'viewport':[args.width,args.height],
        'browser':args.browser,'passed':[],'failed':[],'errors':[],'consoleErrors':[],'httpErrors':[],
        'notTested':['physical iPad/Safari','classroom timing/learning effect','20-minute minimum-device performance']}
def passed(label):
    result['passed'].append(label);print('PASS '+label,flush=True)

try:
 with sync_playwright() as p:
    engine=getattr(p,args.browser)
    launch={}
    if args.browser=='chromium' and shutil.which('chromium'):
        launch={'executable_path':shutil.which('chromium'),'args':['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']}
    browser=engine.launch(headless=True,**launch);result['browserVersion']=browser.version
    context=browser.new_context(viewport={'width':args.width,'height':args.height},accept_downloads=True)
    page=context.new_page();page.set_default_timeout(45000)
    page.on('pageerror',lambda e:result['errors'].append(str(e)))
    page.on('console',lambda msg:result['consoleErrors'].append(msg.text)if msg.type=='error' else None)
    page.on('response',lambda r:result['httpErrors'].append({'url':r.url,'status':r.status}) if r.status>=400 else None)
    try:
        started=time.monotonic();response=page.goto(url+('?pruefung=1' if args.resilience else ''),timeout=120000)
        assert response.status==200
        page.wait_for_function("!document.getElementById('start').disabled",timeout=180000)
        result['readySeconds']=round(time.monotonic()-started,2)
        result['resourceTransferBytes']=page.evaluate("performance.getEntriesByType('resource').reduce((n,r)=>n+r.transferSize,0)")
        result['navigationTransferBytes']=page.evaluate("performance.getEntriesByType('navigation')[0]?.transferSize||0")
        result['initialTransferBytes']=result['resourceTransferBytes']+result['navigationTransferBytes']
        page.screenshot(path=str(out/'start.png'),timeout=90000)
        page.locator('.welcome-controls > summary').click()
        page.locator('#render-mode').select_option('smooth')
        page.locator('#mode-missions').click();page.locator('#start').click()
        assert page.locator('[data-mission]').count()==3
        passed('boot, two main entries, three mission choices, real WebGL startup')

        def click_mission(id):
            if not page.locator('#panel').evaluate('(e)=>e.open'):page.locator('#missions').click()
            if page.locator('#mission-all').count():page.locator('#mission-all').click()
            page.locator(f'[data-mission="{id}"]').click()
        def stored():
            return page.evaluate("JSON.parse(localStorage.getItem('evolutionswald-fieldjournal-v2'))")
        def check_mission(id,complete):
            page.locator('#mission-check').click()
            assert stored()['learning']['missions'][id]['complete']==complete,page.locator('#mission-feedback').inner_text()
        def determination(record_id,taxon,uncertain=False):
            page.locator('#det-record').select_option(record_id)
            page.locator('#det-taxon').select_option(taxon)
            if uncertain:
                page.locator('#det-certainty').select_option('uncertain')
                group={'parus_major':'Meisen','cyanistes_caeruleus':'Meisen','galium_odoratum':'Labkräuter','fagus_sylvatica':'Buchen'}[taxon]
                page.locator('#det-group').select_option(group);page.locator('#det-reason').select_option('model-limited')
            else:
                page.locator('#det-certainty').select_option('certain')
                for i in range(2):page.locator(f'[name="det-feature"][value="{taxon}:{i}"]').check()
            page.locator('#det-save').click()

        def live_m1():
            click_mission('m1');page.locator('#mission-travel').click()
            real_records=[]
            for taxon in ['galium_odoratum','urtica_dioica','fagus_sylvatica']:
                page.locator('#missions').click()
                page.locator('summary').filter(has_text='Fokustaxa im Gebiet aufsuchen').click()
                page.locator(f'[data-focus-taxon="{taxon}"]').click()
                page.wait_for_function("taxon=>document.getElementById('world').dataset.focusTaxon===taxon && !!document.getElementById('world').dataset.focusIndividual && !document.getElementById('field-note').disabled",arg=taxon,timeout=120000)
                page.screenshot(path=str(out/f'live-{taxon}.png'),timeout=90000)
                page.locator('#field-note').click()
                current=stored()['learning']['observations'][-1]
                assert current['source']=='own-observation' and current['taxon']==taxon
                assert current['observationSeconds']>=2 and len(current['partnerIds'])==1
                assert current['partnerIds'][0]==page.locator('#world').get_attribute('data-focus-individual')
                real_records.append(current);print('LIVE RECORD '+taxon,flush=True)
            page.locator('#missions').click()
            for r in real_records:determination(r['id'],r['taxon'],uncertain=r['taxon']=='fagus_sylvatica')
            check_mission('m1',True);passed('LIVE M1: three concrete focal taxa, observation button, feature comparisons and justified uncertainty')

        def live_m2():
            click_mission('m2');page.locator('#mission-hypothesis').fill('Ich vermute, dass beide dieselbe begrenzte Nahrung nutzen.')
            page.locator('#mission-travel').click()
            page.wait_for_function("document.getElementById('progress').textContent.includes('Modellprotokoll verfügbar')",timeout=600000)
            page.locator('#missions').click();page.locator('#mission-protocol').click()
            event=stored()['learning']['observations'][-1];assert event['source']=='model-protocol' and event['evidence']['kind']=='competition'
            page.locator('#m2-record').select_option(event['id']);page.locator('#m2-provenance').select_option('model-protocol')
            page.locator('#m2-counter').select_option('insufficient');page.locator('#m2-relation').select_option('inter')
            for claim in ['same-resource','finite','effect']:page.locator(f'[name="m2-claim"][value="{claim}"]').check()
            check_mission('m2',True);passed('LIVE M2: real simulation event, finite shared resource, explicitly read protocol, interpretation')

        def live_m3():
            click_mission('m3');page.locator('#mission-hypothesis').fill('Wasserbedeckung verändert mögliche Filtration und Erreichbarkeit.')
            page.locator('#station-low').click();page.locator('#mission-travel').click()
            page.locator('#missions').click();page.locator('#station-sample').click()
            page.locator('[data-dig-depth="5"]').click();assert 'freigelegt' in page.locator('#sample-result').inner_text()
            page.locator('#close-panel').click()
            station_records=[]
            for tide in ['low','high']:
                if not page.locator('#panel').evaluate('(e)=>e.open'):page.locator('#missions').click()
                page.locator(f'#station-{tide}').click();page.locator('#station-start').click()
                page.wait_for_function("document.getElementById('progress').textContent.includes('Beobachtungsfenster vollständig')",timeout=180000)
                page.locator('#missions').click();page.locator('#station-record').click()
                r=stored()['learning']['observations'][-1];assert r['present'] and r['duration']>=6
                assert r['evidence']['activity']==('resting' if tide=='low' else 'filtering')
                station_records.append(r)
            assert station_records[0]['partnerIds']==station_records[1]['partnerIds']
            assert station_records[0]['scene']==station_records[1]['scene'] and station_records[0]['scene']['runId']
            result['liveStationRecords']=station_records
            assert station_records[0]['simulationTime']<=station_records[1]['simulationTime']-station_records[1]['duration']+1e-8
            page.locator('#m3-low').select_option(station_records[0]['id']);page.locator('#m3-high').select_option(station_records[1]['id'])
            for field,value in [('filtration','covered'),('access','exposed'),('absence','not-detected'),('depth','different-space')]:page.locator('#m3-'+field).select_option(value)
            check_mission('m3',True);passed('LIVE M3: actual existing probe, two water levels, same individual/depth, timed records and interpretation')

        if args.live and not args.smoke:
            live_start=time.monotonic()
            selected=['m1','m2','m3'] if args.live_mission=='all' else [args.live_mission]
            for mission in selected:
                start=time.monotonic()
                {'m1':live_m1,'m2':live_m2,'m3':live_m3}[mission]()
                result.setdefault('liveMissionSeconds',{})[mission]=round(time.monotonic()-start,2)
            result['automatedLiveMissionSeconds']=round(time.monotonic()-live_start,2)
            page.locator('#mission-free').click()
            snapshot=stored()
            (out/'live-earned-fieldbook.json').write_text(json.dumps(snapshot,ensure_ascii=False,indent=2)+'\n')
            page.reload(timeout=120000)
            page.wait_for_function("!document.getElementById('start').disabled",timeout=180000)
            assert stored()==snapshot
            for mission in selected:assert stored()['learning']['missions'][mission]['complete']
            page.locator('#mode-free').click();page.locator('#start').click()
            if page.locator('#panel').evaluate('(e)=>e.open'):page.locator('#close-panel').click()
            passed('LIVE save/load: earned mission records, answers and completion survive a real page reload; free play resumes')

        if not args.smoke:
            if page.locator('#panel').evaluate('(e)=>e.open'):page.locator('#close-panel').click()
            page.locator('#journal').click();page.locator('summary').filter(has_text='Feldbuch sichern und wiederaufnehmen').click()
            before=stored()
            contradictory=json.loads((ROOT/'work/ui-fieldbook-fixture.json').read_text())
            station=[r for r in contradictory['learning']['observations'] if r.get('evidence',{}).get('kind')=='station']
            station[1]['simulationTime']=station[0]['simulationTime']+1
            page.locator('#field-import').set_input_files({'name':'contradictory.json','mimeType':'application/json','buffer':json.dumps(contradictory).encode()})
            page.wait_for_function("document.getElementById('toast').textContent.includes('Import abgelehnt')")
            assert stored()==before and page.locator('#import-confirm').count()==0
            passed('contradictory station import is rejected before replacement; current fieldbook preserved')
            page.locator('#field-import').set_input_files(str(ROOT/'work/ui-fieldbook-fixture.json'))
            page.locator('#import-confirm').wait_for();assert stored()==before
            page.locator('#import-confirm').click();passed('versioned import requires explicit replacement, individual IDs retained')
            page.locator('#journal-missions').click()
            check_mission('m1',False)
            page.locator('summary').filter(has_text='Bestimmungsreferenzen').click()
            page.locator('summary').filter(has_text='Kohlmeise / Meisen').click()
            assert len(stored()['entries'])==1
            passed('references available before determination; opening does not discover taxa')
            for i,taxon in enumerate(['parus_major','cyanistes_caeruleus','galium_odoratum']):
                if i==0:
                    page.locator('#det-record').select_option('test-m1-0');page.locator('#det-taxon').select_option(taxon)
                    page.locator('[name="det-feature"][value="program-name"]').check();page.locator('#det-certainty').select_option('certain');page.locator('#det-save').click()
                    assert 'Prüfe' in page.locator('#det-feedback').inner_text()
                determination('test-m1-'+str(i),taxon,uncertain=(i==1))
            check_mission('m1',True);page.screenshot(path=str(out/'m1.png'),timeout=90000)
            passed('UI fixture M1: wrong/incomplete/correct/justified uncertain decisions, no complete collection')
            click_mission('m2');page.locator('#mission-hypothesis').fill('')
            check_mission('m2',False);page.locator('#mission-hypothesis').fill('Testvermutung; fachlich nicht automatisch benotet.')
            for field,value in [('record','test-m2'),('provenance','own-observation'),('counter','insufficient'),('relation','inter')]:page.locator('#m2-'+field).select_option(value)
            for claim in ['same-resource','finite','effect']:page.locator(f'[name="m2-claim"][value="{claim}"]').check()
            check_mission('m2',False);page.locator('#m2-provenance').select_option('model-protocol');check_mission('m2',True)
            passed('UI fixture M2: missing hypothesis and false provenance rejected; supported combinations accepted')
            click_mission('m3')
            for field,value in [('low','test-low'),('high','test-high'),('filtration','covered'),('access','exposed'),('absence','absent'),('depth','different-space')]:page.locator('#m3-'+field).select_option(value)
            check_mission('m3',False);page.locator('#m3-absence').select_option('not-detected');check_mission('m3',True)
            passed('UI fixture M3: absence overclaim rejected, controlled comparison accepted')
            page.locator('#mission-free').click();page.locator('#journal').click();page.locator('summary').filter(has_text='Feldbuch sichern und wiederaufnehmen').click()
            with page.expect_download() as download:page.locator('#export-journal').click()
            download.value.save_as(str(out/'roundtrip.json'))
            exported=json.loads((out/'roundtrip.json').read_text());assert exported['schemaVersion']==3
            assert exported['learning']['missions']['m3']['complete']
            with page.expect_download() as download:page.locator('#field-report').click()
            download.value.save_as(str(out/'report.html'));assert 'Modellprotokoll' in (out/'report.html').read_text()
            page.locator('#session-new').click();page.locator('#session-cancel').click()
            assert stored()['learning']['observations']
            passed('JSON/report downloads, session cancellation preserves work, open responses remain text')
            page.locator('#close-panel').click()
        else:
            if args.entry=='Feldbuch.html':
                initial=int(page.locator('#world').get_attribute('data-decoded-assets')or 0)
                click_mission('m1')
                page.locator('summary').filter(has_text='Bestimmungsreferenzen').click()
                page.locator('summary').filter(has_text='Kohlmeise / Meisen').click()
                photo=page.locator('img[alt^="Echte Aufnahme: Kohlmeise"]')
                photo.wait_for(state='visible');page.wait_for_function("document.querySelector('img[alt^=\"Echte Aufnahme: Kohlmeise\"]').naturalWidth>0")
                after=int(page.locator('#world').get_attribute('data-decoded-assets')or 0)
                assert 0<initial<after<100
                result['standaloneDecodedAssets']={'initial':initial,'afterReferences':after}
                page.locator('#mission-free').click()
                passed('standalone deferred photograph decodes and renders; most media remain deferred')
            else:page.locator('#close-panel').click()
        page.locator('#pause').click();assert page.locator('#resume-game').is_visible();page.locator('#resume-game').click()
        page.keyboard.press('b');assert page.locator('#world').get_attribute('data-tool')=='binocular'
        page.keyboard.press('l');assert page.locator('#world').get_attribute('data-tool')=='magnifier'
        page.keyboard.press('Escape');page.locator('#map').click();assert page.locator('[data-travel]').count()==8
        page.locator('[data-travel="forest"]').click()
        page.screenshot(path=str(out/'scene.png'),timeout=90000)
        page.set_viewport_size({'width':1024,'height':768});page.locator('#journal').click()
        assert page.locator('#panel').is_visible();page.screenshot(path=str(out/'tablet-layout.png'),timeout=90000)
        passed('free exploration: real tools, keyboard, map with eight regions, tablet viewport (emulation only)')
        assert not result['errors'],result['errors'];assert not result['httpErrors'],result['httpErrors']
        if args.resilience:
            # The preceding tablet layout probe must not leak into fault cases.
            page.set_viewport_size({'width':args.width,'height':args.height})
            result['faultViewport']=page.viewport_size
            if stored() is None:
                page.locator('summary').filter(has_text='Feldbuch sichern und wiederaufnehmen').click()
                page.locator('#field-import').set_input_files(str(ROOT/'work/ui-fieldbook-fixture.json'))
                page.locator('#import-confirm').click()
            page.locator('#close-panel').click()
            persisted=page.evaluate("localStorage.getItem('evolutionswald-fieldjournal-v2')")
            page.keyboard.down('w');page.locator('#test-graphics-loss').click()
            page.wait_for_function("document.getElementById('world').dataset.graphicsState==='recovering'",timeout=30000)
            page.screenshot(path=str(out/'context-lost.png'),timeout=60000)
            page.locator('#test-graphics-restore').click()
            page.wait_for_function("document.getElementById('world').dataset.graphicsState==='ready'",timeout=60000)
            page.keyboard.up('w')
            assert page.evaluate("localStorage.getItem('evolutionswald-fieldjournal-v2')")==persisted
            page.screenshot(path=str(out/'context-restored.png'),timeout=90000)
            passed('fault injection: real WebGL context loss/restoration preserves fieldbook')
            # Finish the recovered WebGL scene before starting another one.
            # Concurrent renderers after context loss starve software GPUs.
            result['renderDiagnostics']=page.locator('#world').evaluate('(e)=>Object.fromEntries(Object.entries(e.dataset).filter(([k])=>/fps|gpu|cpu|triangles|drawCalls|pixelRatio/i.test(k)))')
            browser.close()
            model_browser=engine.launch(headless=True,**launch)
            model_context=model_browser.new_context(viewport={'width':args.width,'height':args.height})
            broken=model_context.new_page();page=broken;broken.set_default_timeout(45000)
            broken.route('**/wildlife-fox*.glb*',lambda route:route.abort())
            broken.goto(url,timeout=120000)
            broken.wait_for_function("document.getElementById('loading').textContent.includes('Tiermodelle konnten nicht geladen')",timeout=60000)
            assert broken.locator('#start').is_disabled()
            broken.screenshot(path=str(out/'asset-failure.png'),timeout=90000)
            broken.unroute('**/wildlife-fox*.glb*');broken.reload(timeout=120000)
            broken.wait_for_function("!document.getElementById('start').disabled",timeout=180000)
            model_context.close();model_browser.close();passed('fault injection: required model failure blocks startup; reload recovers')
            quota_browser=engine.launch(headless=True,**launch)
            quota=quota_browser.new_context(viewport={'width':800,'height':500})
            quota.add_init_script("Storage.prototype.setItem=function(){throw new DOMException('Synthetic quota failure','QuotaExceededError')}")
            qp=quota.new_page();page=qp
            qp.on('pageerror',lambda e:result['errors'].append(str(e)))
            qp.on('console',lambda msg:result['consoleErrors'].append(msg.text)if msg.type=='error' else None)
            qp.goto(url,timeout=120000)
            qp.wait_for_function("!document.getElementById('start').disabled",timeout=180000)
            qp.locator('#start').click();qp.locator('#storage-status').wait_for(state='visible')
            assert 'nicht' in qp.locator('#storage-status').inner_text()
            qp.screenshot(path=str(out/'storage-failure.png'),timeout=90000)
            quota.close();quota_browser.close();passed('fault injection: quota failure is visible instead of a persistence promise')
            result['expectedFailures']=['Aborted fox model request','Synthetic quota failure']
        assert not result['errors'],result['errors']
        assert not result['consoleErrors'],result['consoleErrors']
        assert not result['httpErrors'],result['httpErrors']
        if 'renderDiagnostics' not in result:result['renderDiagnostics']=page.locator('#world').evaluate('(e)=>Object.fromEntries(Object.entries(e.dataset).filter(([k])=>/fps|gpu|cpu|triangles|drawCalls|pixelRatio/i.test(k)))')
        if browser.is_connected():browser.close()
    except Exception:
        try:
            result['failureUI']={'toast':page.locator('#toast').inner_text(),'focus':page.locator('#focus-name').inner_text(),'progress':page.locator('#progress').inner_text(),'tool':page.locator('#world').get_attribute('data-tool'),'observation':page.locator('#world').evaluate('(e)=>Object.fromEntries(Object.entries(e.dataset).filter(([k])=>/focus|observation|simulationTime|fps|frameP95/i.test(k)))')}
            page.screenshot(path=str(out/'failure.png'),timeout=30000)
        except Exception:pass
        raise

except Exception as error:
    result['failed'].append(str(error));print(traceback.format_exc(),flush=True)
    try:
        result['failureUI']={'toast':page.locator('#toast').inner_text(),'focus':page.locator('#focus-name').inner_text(),'tool':page.locator('#world').get_attribute('data-tool'),'observation':page.locator('#world').evaluate('(e)=>Object.fromEntries(Object.entries(e.dataset).filter(([k])=>/focus|observation|simulationTime|fps|frameP95/i.test(k)))')}
        page.screenshot(path=str(out/'failure.png'),timeout=30000)
    except Exception:pass
finally:
    server.shutdown();server.server_close()
    (out/'result.json').write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n')
    print(json.dumps(result,ensure_ascii=False),flush=True)
    if os.environ.get('GITHUB_ACTIONS')=='true':
        diagnostic={key:result.get(key)for key in ['commit','sourceDirty','browserVersion','viewport','readySeconds','initialTransferBytes','passed','failed','errors','consoleErrors','httpErrors','failureUI','liveMissionSeconds','liveStationRecords']}
        message=json.dumps(diagnostic,ensure_ascii=False).replace('%','%25').replace('\r','%0D').replace('\n','%0A')
        print(f'::{"error" if result["failed"] else "notice"} title=Ranger browser result::{message}',flush=True)
if result['failed']:raise SystemExit(1)
