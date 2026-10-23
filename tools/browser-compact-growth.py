"""N03 through the actual built standalone HTML; no game-state injection.
Run after a fresh compact build; defaults resolve relative to the repository root.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
import argparse, hashlib, json, math, shutil, subprocess, sys, time, traceback
from playwright.sync_api import sync_playwright

p=argparse.ArgumentParser()
p.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[1])
p.add_argument('--site',default='outputs')
p.add_argument('--entry',default='Ranger-Kompakt.html')
p.add_argument('--output',default='work/qa-correction/growth-browser')
a=p.parse_args();root=a.root.resolve();site=root/a.site;out=root/a.output;out.mkdir(parents=True,exist_ok=True)
sys.path.insert(0,str(root/'tools'))
from compact_runtime import audit_standalone
from module_graph import ModuleGraph
runtime=audit_standalone(root,site/a.entry)
g=ModuleGraph(root/'dist','compact/main.js')
result={'scope':'Actual standalone WebGL boot and rendered growth form, chart, full table and native JSON download. No synthetic game state or earned evidence is injected. Cloud Chromium is not physical iPad/Safari validation.','entry':a.entry,'htmlSHA256':runtime['htmlSHA256'],'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'sourceDirty':bool(subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True).strip()),'runtimeSourceHashes':{name:hashlib.sha256((root/'dist'/name).read_bytes()).hexdigest() for name in sorted(set(g.modules)|g.assets|{'compact/style.css','kompakt.html','icon.svg'})},'startedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'passed':False,'checks':[],'errors':[],'captures':[]}

def save(): (out/'result.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
def ok(name,**details):
    assert not result['errors'],result['errors']
    result['checks'].append({'name':name,'passed':True,**details});save();print('PASS '+name,flush=True)
def capture(page,name):
    path=out/(name+'.png');page.screenshot(path=str(path));result['captures'].append({'file':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'source':'Unedited actual browser screenshot'});save()
class Handler(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(site)))
Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/{a.entry}'
with sync_playwright() as pw:
    options={'headless':True}
    if shutil.which('chromium'):
        options.update(executable_path=shutil.which('chromium'),args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    browser=pw.chromium.launch(**options);result['browserVersion']=browser.version
    ctx=browser.new_context(viewport={'width':1000,'height':760},accept_downloads=True);page=ctx.new_page();page.set_default_timeout(45000)
    page.on('pageerror',lambda error:result['errors'].append(str(error)))
    try:
        response=page.goto(url);assert response.status==200
        page.wait_for_function('document.querySelector("#world").dataset.ready==="true"',timeout=120000)
        page.locator('#start').click();page.locator('#objective').click();page.locator('#materials').click();page.locator('#open-analysis').click()
        assert page.locator('#model-type').input_value()=='growth'
        before_storage=page.evaluate("localStorage.getItem('ranger-compact-fieldbook-v2')")
        def fill(parameters):
            for key,value in parameters.items():page.locator('#parameter-'+key).fill(str(value))
        zero_parameters=[]
        for rate in [0,2]:
            for days in [1,365]:
                parameters={'initial':0,'rate':rate,'capacity':100,'days':days};fill(parameters)
                assert page.locator('#model-form').evaluate('(f)=>f.checkValidity()')
                page.locator('#run-model').click()
                assert page.locator('#learning-status').inner_text()==''
                chart=page.locator('#model-output svg');assert chart.count()==1
                points=chart.locator('polyline').evaluate_all(r'(lines)=>lines.map(line=>line.getAttribute("points").trim().split(/\s+/).map(pair=>pair.split(",").map(Number)))')
                assert len(points)==2 and all(len(series)==days+1 for series in points)
                assert all(math.isfinite(x) and y==245 for series in points for x,y in series),points
                page.locator('#model-output details summary').click()
                assert page.locator('#model-output table tr').count()==days+2
                assert page.locator('#model-output table tr').nth(1).inner_text().split()==['0.0000','0.0000','0.0000']
                assert page.locator('#model-output table tr').last.inner_text().split()==[f'{days:.4f}','0.0000','0.0000']
                with page.expect_download() as download:page.locator('#export-model').click()
                filename=f'zero-rate-{rate}-days-{days}.json';download.value.save_as(str(out/filename));model=json.loads((out/filename).read_text())
                assert model['parameters']==parameters and len(model['rows'])==days+1
                assert model['source']=='theoretical-model'
                assert all(row['exponential']==0 and row['logistic']==0 and all(math.isfinite(value) for value in row.values()) for row in model['rows'])
                chart.scroll_into_view_if_needed();capture(page,f'zero-rate-{rate}-days-{days}')
                zero_parameters.append({'parameters':parameters,'rows':len(model['rows']),'export':filename,'sha256':hashlib.sha256((out/filename).read_bytes()).hexdigest()})
        ok('all four valid zero-population boundary cases produce finite zero curves, full tables and native JSON exports',cases=zero_parameters)
        fill({'initial':1,'rate':2,'capacity':100,'days':365});assert page.locator('#model-form').evaluate('(f)=>f.checkValidity()')
        page.locator('#run-model').click();message=page.locator('#learning-status').inner_text()
        assert 'Exponentielles Wachstum' in message and 'Modellbereich' in message and 'kürzeren Zeitraum' in message
        assert page.locator('#model-output svg').count()==0 and page.locator('#export-model').count()==0,'Overflow must not leave a stale successful chart/export'
        page.locator('#learning-status').scroll_into_view_if_needed();capture(page,'positive-overflow-rejected')
        ok('positive numerical overflow is rejected and removes the preceding zero result',message=message)
        fill({'initial':0});page.locator('#run-model').click()
        assert page.locator('#model-output svg').count()==1 and page.locator('#learning-status').inner_text()==''
        ok('a subsequent valid zero calculation clears the previous overflow message')
        cases=[]
        for key,value in [('initial','-1'),('rate','-0.1'),('capacity','-1'),('days','-1'),('days','1.5'),('days','')]:
            fill({'initial':0,'rate':2,'capacity':100,'days':365});page.locator('#parameter-'+key).fill(value)
            validity=page.locator('#parameter-'+key).evaluate('(input)=>({valid:input.validity.valid,rangeUnderflow:input.validity.rangeUnderflow,stepMismatch:input.validity.stepMismatch,valueMissing:input.validity.valueMissing,message:input.validationMessage})')
            assert not validity['valid'] and validity['message']
            page.locator('#run-model').click()
            assert not page.locator('#model-form').evaluate('(f)=>f.checkValidity()')
            cases.append({'field':key,'value':value,'nativeValidity':validity})
        assert page.evaluate("localStorage.getItem('ranger-compact-fieldbook-v2')")==before_storage
        ok('native form validation rejects negative, fractional and missing input; theoretical calculations do not alter the saved fieldbook',cases=cases)
        result['passed']=True;result['completedAt']=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime());save()
    except Exception:
        result['failure']=traceback.format_exc();save()
        try:capture(page,'failure')
        except Exception:pass
        raise
    finally:
        browser.close();server.shutdown();server.server_close()
print(json.dumps({'passed':result['passed'],'checks':len(result['checks']),'captures':len(result['captures'])}))
