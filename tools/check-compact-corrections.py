"""Complete local correction plan: original suites, builds, shipped HTML and real browsers. No deployment."""
from pathlib import Path
import argparse,subprocess,json,time,sys,hashlib,re,platform,os
p=argparse.ArgumentParser();p.add_argument('--round2',action='store_true',help='Preserve original 900-second plan and append original N05 UI, paired forest and separately labelled real-time detail supplemental traversal.');p.add_argument('--output',default='work/final-qa');p.add_argument('--supplemental-arrival-wall-budget',type=int,help='Explicit supplemental arrival wall budget per walked segment. Omit to retain the original 900-second arrival plan. A supplemental functional result is not an original-budget or performance PASS.');a=p.parse_args()
if a.round2 and a.supplemental_arrival_wall_budget is not None:p.error('--round2 retains the original 900-second primary traversal; the detail supplemental run is already separate')
if a.supplemental_arrival_wall_budget is not None and a.supplemental_arrival_wall_budget<=900:p.error('A supplemental budget must exceed the unchanged original 900-second budget')
def arrival_check(budget):
 if budget is None:return ('arrival',['tools/browser-compact-arrival.py','--output','work/qa-correction/final-arrival'],2400)
 name=f'supplemental-arrival-{budget}'
 return(name,['tools/browser-compact-arrival.py','--output','work/qa-correction/'+name,'--walk-wall-budget',str(budget)],budget+2400)
arrival_name,arrival_args,arrival_process_budget=arrival_check(a.supplemental_arrival_wall_budget)
arrival_plan={'name':arrival_name,'walkWallBudgetSeconds':a.supplemental_arrival_wall_budget or 900,'processTimeoutSeconds':arrival_process_budget,'scope':'The per-segment wall budget is operational. Supplemental functional traversal does not replace a historical 900-second failure and is not an FPS or physical-device performance result.'}
root=Path(__file__).resolve().parents[1];sys.path.insert(0,str(root));from tools.module_graph import ModuleGraph
out=root/a.output;out.mkdir(parents=True,exist_ok=True);(root/'work/qa-correction').mkdir(parents=True,exist_ok=True);python=sys.executable;commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip();assert not subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True).strip()
(out/'result.json').write_text(json.dumps({'sourceCommit':commit,'arrivalPlan':arrival_plan,'checks':[],'complete':False},indent=2)+'\n')
(out/'reruns.json').write_text('{"checks":[]}\n')
(out/'scheduler-timing.json').write_text(json.dumps({'scope':'Sequential fresh complete plan; scheduler duration is not a browser FPS measure.'},indent=2)+'\n')
(out/'environment.json').write_text(json.dumps({'recordedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'os':platform.platform(),'architecture':platform.machine(),'python':platform.python_version(),'node':subprocess.check_output(['node','--version'],text=True).strip(),'logicalCoresVisible':os.cpu_count(),'cpuAffinity':sorted(os.sched_getaffinity(0))if hasattr(os,'sched_getaffinity')else None,'playwrightBrowsersPath':os.environ.get('PLAYWRIGHT_BROWSERS_PATH'),'ffmpegVersion':subprocess.check_output(['ffmpeg','-version'],text=True).splitlines()[0],'graphicsFlags':['--use-angle=swiftshader','--enable-unsafe-swiftshader'],'graphicsScope':'Forced Chromium software rendering. No physical iPad/Apple GPU/Safari or classroom certification.'},indent=2)+'\n')
g=ModuleGraph(root/'dist','compact/main.js');hashes={n:hashlib.sha256((root/'dist'/n).read_bytes()).hexdigest()for n in sorted(set(g.modules)|g.assets|{'kompakt.html','compact/style.css','icon.svg'})}
freeze={'runtimeCommit':commit,'sourceHashes':hashes,'scope':'Following documentation/evidence/tool commits must leave these exact application files unchanged.'};(out/'runtime-freeze.json').write_text(json.dumps(freeze,indent=2)+'\n')
# No heavy browser starts before the complete fresh model/build/package checks.
preflight=[('final-legacy-node',[['tools/run-checks.py']]),('final-compact-node',[['tools/check-compact.py']]),('final-build-legacy',[['tools/build-web.py'],['tools/verify-web.py'],['tools/build-standalone.py']]),('final-build-compact',[['tools/build-compact.py'],['tools/verify-compact.py']]),('final-python',[['-m','unittest','discover','-s','tests','-p','test_*.py','-v']]),('final-source-package',[['tools/package-project.py']])]
preflight_rows=[]
for name,commands in preflight:
 print('START',name,time.strftime('%H:%M:%S',time.gmtime()),flush=True)
 with(root/'work/qa-correction'/(name+'.log')).open('w')as log:
  for args in commands:subprocess.run([python,*args],cwd=root,stdout=log,stderr=subprocess.STDOUT,check=True,timeout=600)
 preflight_rows.append({'name':name,'commands':commands,'passed':True,'log':str((root/'work/qa-correction'/(name+'.log')).relative_to(root))});(out/'preflight.json').write_text(json.dumps({'sourceCommit':commit,'checks':preflight_rows,'complete':len(preflight_rows)==len(preflight)},indent=2)+'\n')
 print('PASS',name,flush=True)
commands=[(arrival_name,arrival_args),('feeding',['tools/browser-compact-feeding.py','--output','work/qa-correction/final-feeding']),('learning-web',['tools/browser-compact-learning.py','--gallery']),('source',['tools/browser-compact-source.py']),('reference',['tools/browser-compact.py']),('standalone-smoke',['tools/browser-compact.py','--site','outputs','--entry','Ranger-Kompakt.html','--smoke']),('learning-standalone',['tools/browser-compact-learning.py','--site','outputs','--entry','Ranger-Kompakt.html','--output','work/compact-learning-standalone']),('growth',['tools/browser-compact-growth.py','--output','work/qa-correction/final-growth']),('imports',['tools/browser-compact-imports.py','--output','work/qa-correction/final-imports']),('habitats',['tools/browser-compact-habitats.py','--output','work/qa-correction/final-habitats']),('habitat-revision',['tools/browser-compact-habitat-revision.py','--baseline','verification/kompakt-endqa-20261023/baseline/habitats','--baseline-fixed-gap','verification/kompakt-endqa-20261023/baseline/habitats/fixed-gap','--output','work/qa-correction/final-habitat-revision']),('materials',['tools/print-compact-materials.py','--contact-sheets','--audit-dir','work/qa-correction/final-print']),('stability',['tools/browser-compact-stability.py']),('legacy-full',['tools/browser-check.py','--live','--resilience','--width','800','--height','500','--site','outputs/GitHub-Pages','--prefix','/Ein-Tag-als-Ranger/']),('legacy-standalone',['tools/browser-check.py','--smoke','--width','800','--height','500','--site','outputs','--entry','Feldbuch.html'])]
if a.round2:
 commands.extend([
  ('event-integrity',['tools/browser-compact-event-integrity.py','--output','work/round2/final-event-integrity']),
  ('forest-round2',['tools/browser-compact-forest.py','--compare','verification/kompakt-runde2/baseline-forest/result.json','--output','work/round2/final-forest']),
  ('detail-realtime-supplemental-3600',['tools/browser-compact-arrival.py','--detail-realtime','--walk-wall-budget','3600','--output','work/round2/final-detail-realtime'])
 ])
rows=[]
for name,args in commands:
 print('START',name,time.strftime('%H:%M:%S',time.gmtime()),flush=True);start=time.monotonic()
 timeout=6000 if name=='detail-realtime-supplemental-3600' else arrival_process_budget if name==arrival_name else 2400
 with(out/(name+'.log')).open('w')as log:
  try:r=subprocess.run([python,*args],cwd=root,stdout=log,stderr=subprocess.STDOUT,timeout=timeout);code=r.returncode
  except subprocess.TimeoutExpired:code=124
 row={'name':name,'command':[python,*args],'exitCode':code,'processTimeoutSeconds':timeout,'passed':code==0,'seconds':round(time.monotonic()-start,2),'log':name+'.log'};rows.append(row);(out/'result.json').write_text(json.dumps({'sourceCommit':commit,'arrivalPlan':arrival_plan,'checks':rows,'complete':len(rows)==len(commands)},indent=2)+'\n');print(json.dumps(row),flush=True)
 if name=='feeding'and code==0:
  feeding=json.loads((root/'work/qa-correction/final-feeding/result.json').read_text());assert feeding['runtimeSourceHashes']==hashes;current=(root/'outputs/Ranger-Kompakt.html').read_bytes();assert hashlib.sha256(current).hexdigest()==feeding['htmlSHA256'];(out/'html-equivalence.json').write_text(json.dumps({'currentHTMLSHA256':feeding['htmlSHA256'],'feedingHTMLSHA256':feeding['htmlSHA256'],'feedingTestCommit':feeding['sourceCommit'],'cleanBuildCommit':json.loads((root/'outputs/Ranger-Kompakt/build-manifest.json').read_text())['sourceCommit'],'exactSameHTML':True,'scope':'Fresh complete feeding run on the clean built standalone HTML, byte-identical, no metadata normalization needed.'},indent=2)+'\n')
sys.exit(0 if all(r['passed']for r in rows)else 1)
