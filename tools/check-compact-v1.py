"""Explicit V1 closure plan. Sequential GPU jobs; old900s failures stay failures.
Every process result is retained. Exit1 for ANY failed process (including the
software diagnostic); softwareGatesPassed separately applies the declared D3
scope. No xfail, skip, continue-on-error or retrospective PASS conversion.
"""
from pathlib import Path
import argparse,hashlib,json,platform,subprocess,sys,time,shutil,os,signal
from module_graph import ModuleGraph
p=argparse.ArgumentParser();p.add_argument('--output',required=True);a=p.parse_args();root=Path(__file__).resolve().parents[1];out=root/a.output;out.mkdir(parents=True,exist_ok=False);(out/'logs').mkdir();(out/'contexts').mkdir();python=sys.executable
commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip();assert not subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True).strip(),'Freeze a clean source commit first'
g=ModuleGraph(root/'dist','compact/main.js');sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();names=sorted(set(g.modules)|g.assets|{'kompakt.html','compact/style.css','icon.svg'});hashes={n:sha(root/'dist'/n)for n in names};freeze={'sourceCommit':commit,'sourceDirty':False,'runtimeSourceHashes':hashes,'scope':'Exact shipped runtime closure includingCSS/media. Hardware and historical software diagnostics are distinct; the original900s contract is unchanged.'};(out/'runtime-freeze.json').write_text(json.dumps(freeze,indent=2)+'\n')
r={'sourceCommit':commit,'complete':False,'checks':[],'softwareGatesPassed':False,'allProcessesPassed':False,'scope':'D3 contract fixed before implementation in docs/ABSCHLUSSVERTRAG-V1.md. A diagnosticFAIL never becomesPASS. Software eligibility is distinct from process exit and hardware/device/pilot acceptance.'}
(out/'environment.json').write_text(json.dumps({'startedUTC':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'os':platform.platform(),'python':sys.version,'node':subprocess.check_output(['node','--version'],text=True).strip(),'gpuScheduling':'Strictly sequential test processes. No physicalhardware certification.'},indent=2)+'\n')
def save():(out/'result.json').write_text(json.dumps(r,indent=2)+'\n')
def unchanged():
 assert {n:sha(root/'dist'/n)for n in names}==hashes,'Runtime changed after freeze'
 assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()==commit
 assert not subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True).strip(),'Source changed after freeze'
def run(name,args,timeout=2400,role='mandatory',preflight=False):
 unchanged();start=time.monotonic();command=[python,*args];context={'sourceCommit':commit,'runtimeSourceHashes':hashes,'actualCommand':command,'role':role,'startedUTC':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
 html=root/'outputs/Ranger-Kompakt.html'
 if html.exists():context['actualStandaloneHTMLSHA256']=sha(html)
 (out/'contexts'/(name+'.json')).write_text(json.dumps(context,indent=2)+'\n');print('START',name,context['startedUTC'],flush=True)
 with(out/'logs'/(name+'.log')).open('w')as log:
  process=subprocess.Popen(command,cwd=root,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
  try:code=process.wait(timeout=timeout)
  except subprocess.TimeoutExpired:
   os.killpg(process.pid,signal.SIGTERM)
   try:process.wait(timeout=10)
   except subprocess.TimeoutExpired:os.killpg(process.pid,signal.SIGKILL);process.wait()
   code=124
 row={'name':name,'role':role,'passed':code==0,'exitCode':code,'seconds':round(time.monotonic()-start,3),'command':command,'log':'logs/'+name+'.log','context':'contexts/'+name+'.json'};r['checks'].append(row);unchanged();save();print(json.dumps(row),flush=True)
 if preflight and code:raise RuntimeError('Required preflight failed: '+name)
 return code
try:
 for name,args in [
  ('build-web',['tools/build-web.py']),('verify-web',['tools/verify-web.py']),('build-legacy-html',['tools/build-standalone.py']),('build-compact',['tools/build-compact.py']),('verify-compact',['tools/verify-compact.py']),
  ('build-materials',['tools/print-compact-materials.py','--contact-sheets','--audit-dir',str(out/'print')]),
  ('print-fonts',['tools/check-compact-print-fonts.py','--output',str(out/'print-fonts')]),
  ('legacy-node',['tools/run-checks.py','--output',str(out/'legacy-node')]),('compact-node',['tools/check-compact.py','--output',str(out/'compact-node')]),
  ('python',['-m','unittest','discover','-s','tests','-p','test_*.py','-v']),('source-package',['tools/package-project.py'])]:run(name,args,timeout=900,preflight=True)
 html=root/'outputs/Ranger-Kompakt.html';freeze['htmlSHA256']=sha(html);freeze['webManifestSHA256']=sha(root/'outputs/Ranger-Kompakt/build-manifest.json');freeze['lessonBuildInfoSHA256']=sha(root/'outputs/Ranger-Kompakt-Lernpaket/build-info.json');(out/'runtime-freeze.json').write_text(json.dumps(freeze,indent=2)+'\n')
 commands=[
  ('source',['tools/browser-compact-source.py','--output',str(out/'source')]),
  ('reference',['tools/browser-compact.py','--output',str(out/'reference')]),
  ('learning-source',['tools/browser-compact-learning.py','--site','dist','--entry','kompakt.html','--gallery','--output',str(out/'learning-source')]),
  ('learning-web',['tools/browser-compact-learning.py','--site','outputs/Ranger-Kompakt','--entry','index.html','--output',str(out/'learning-web')]),
  ('learning-standalone',['tools/browser-compact-learning.py','--site','outputs','--entry','Ranger-Kompakt.html','--output',str(out/'learning-standalone')]),
  ('standalone-smoke',['tools/browser-compact.py','--site','outputs','--entry','Ranger-Kompakt.html','--smoke','--output',str(out/'standalone-smoke')]),
  ('feeding',['tools/browser-compact-feeding.py','--output',str(out/'feeding')]),
  ('feeding-detail',['tools/browser-compact-feeding.py','--detail','--output',str(out/'feeding-detail')]),
  ('paused-capture',['tools/browser-compact-paused-capture.py','--output',str(out/'paused-capture')]),
  ('imports',['tools/browser-compact-imports.py','--output',str(out/'imports')]),
  ('growth',['tools/browser-compact-growth.py','--output',str(out/'growth')]),
  ('habitats',['tools/browser-compact-habitats.py','--output',str(out/'habitats')]),
  ('habitat-revision',['tools/browser-compact-habitat-revision.py','--baseline','verification/kompakt-endqa-20261023/baseline/habitats','--baseline-fixed-gap','verification/kompakt-endqa-20261023/baseline/habitats/fixed-gap','--output',str(out/'habitat-revision')]),
  ('ui',['tools/browser-compact-v1-ui.py','--output',str(out/'ui')]),
  ('distribution',['tools/browser-compact-v1-distribution.py','--output',str(out/'distribution')]),
  ('detail-lod',['tools/browser-compact-detail-lod.py','--output',str(out/'detail-lod')]),
  ('event-integrity',['tools/browser-compact-event-integrity.py','--output',str(out/'event-integrity')]),
  ('forest-profile',['tools/browser-compact-v1-baseline.py','--compare','work/v1-abschluss/baseline/webgl/result.json','--output',str(out/'forest-profile')]),
  ('legacy-full',['tools/browser-check.py','--live','--resilience','--width','800','--height','500','--site','outputs/GitHub-Pages','--prefix','/Ein-Tag-als-Ranger/','--output',str(out/'legacy-full')]),
  ('legacy-standalone',['tools/browser-check.py','--smoke','--width','800','--height','500','--site','outputs','--entry','Feldbuch.html','--output',str(out/'legacy-standalone')]),
  ('stability',['tools/browser-compact-stability.py','--output',str(out/'stability')])]
 for name,args in commands:run(name,args)
 run('arrival-original900',['tools/browser-compact-arrival.py','--output',str(out/'arrival-original900')],role='software-diagnostic')
 run('v1-full-walk-feeding',['tools/browser-compact-arrival.py','--detail-realtime','--v1-route','--walk-wall-budget','3600','--output',str(out/'v1-full-walk-feeding')],timeout=7200)
 r['complete']=True;r['allProcessesPassed']=all(x['passed']for x in r['checks']);r['softwareGatesPassed']=all(x['passed']for x in r['checks']if x['role']=='mandatory');r['hardwarePerformanceAcceptance']='NICHT GEPRÜFT';r['physicalDeviceAndPilot']='NICHT GEPRÜFT';save()
except Exception as error:r['failure']=str(error);save();raise
sys.exit(0 if r['allProcessesPassed']else 1)
