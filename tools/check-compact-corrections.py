"""Complete local correction plan: original suites, builds, shipped HTML and real browsers. No deployment."""
from pathlib import Path
import subprocess,json,time,sys,hashlib,re
root=Path(__file__).resolve().parents[1];sys.path.insert(0,str(root));from tools.module_graph import ModuleGraph
out=root/'work/final-qa';out.mkdir(parents=True,exist_ok=True);(root/'work/qa-correction').mkdir(parents=True,exist_ok=True);python=sys.executable;commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip();assert not subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True).strip()
g=ModuleGraph(root/'dist','compact/main.js');hashes={n:hashlib.sha256((root/'dist'/n).read_bytes()).hexdigest()for n in sorted(set(g.modules)|g.assets|{'kompakt.html','compact/style.css','icon.svg'})}
freeze={'runtimeCommit':commit,'sourceHashes':hashes,'scope':'Following documentation/evidence/tool commits must leave these exact application files unchanged.'};(out/'runtime-freeze.json').write_text(json.dumps(freeze,indent=2)+'\n')
# No heavy browser starts before the complete fresh model/build/package checks.
preflight=[('final-legacy-node',[['tools/run-checks.py']]),('final-compact-node',[['tools/check-compact.py']]),('final-build-legacy',[['tools/build-web.py'],['tools/verify-web.py'],['tools/build-standalone.py']]),('final-build-compact',[['tools/build-compact.py'],['tools/verify-compact.py']]),('final-python',[['-m','unittest','discover','-s','tests','-p','test_*.py','-v']]),('final-source-package',[['tools/package-project.py']])]
for name,commands in preflight:
 print('START',name,time.strftime('%H:%M:%S',time.gmtime()),flush=True)
 with(root/'work/qa-correction'/(name+'.log')).open('w')as log:
  for args in commands:subprocess.run([python,*args],cwd=root,stdout=log,stderr=subprocess.STDOUT,check=True,timeout=600)
 print('PASS',name,flush=True)
commands=[('feeding',['tools/browser-compact-feeding.py','--output','work/qa-correction/final-feeding']),('learning-web',['tools/browser-compact-learning.py','--gallery']),('source',['tools/browser-compact-source.py']),('reference',['tools/browser-compact.py']),('standalone-smoke',['tools/browser-compact.py','--site','outputs','--entry','Ranger-Kompakt.html','--smoke']),('learning-standalone',['tools/browser-compact-learning.py','--site','outputs','--entry','Ranger-Kompakt.html','--output','work/compact-learning-standalone']),('imports',['tools/browser-compact-imports.py','--output','work/qa-correction/final-imports']),('habitats',['tools/browser-compact-habitats.py','--output','work/qa-correction/final-habitats']),('materials',['tools/print-compact-materials.py']),('stability',['tools/browser-compact-stability.py']),('legacy-full',['tools/browser-check.py','--live','--resilience','--width','800','--height','500','--site','outputs/GitHub-Pages','--prefix','/Ein-Tag-als-Ranger/']),('legacy-standalone',['tools/browser-check.py','--smoke','--width','800','--height','500','--site','outputs','--entry','Feldbuch.html'])]
rows=[]
for name,args in commands:
 print('START',name,time.strftime('%H:%M:%S',time.gmtime()),flush=True);start=time.monotonic()
 with(out/(name+'.log')).open('w')as log:
  try:r=subprocess.run([python,*args],cwd=root,stdout=log,stderr=subprocess.STDOUT,timeout=2400);code=r.returncode
  except subprocess.TimeoutExpired:code=124
 row={'name':name,'command':[python,*args],'exitCode':code,'passed':code==0,'seconds':round(time.monotonic()-start,2),'log':name+'.log'};rows.append(row);(out/'result.json').write_text(json.dumps({'sourceCommit':commit,'checks':rows,'complete':len(rows)==len(commands)},indent=2)+'\n');print(json.dumps(row),flush=True)
 if name=='feeding'and code==0:
  feeding=json.loads((root/'work/qa-correction/final-feeding/result.json').read_text());assert feeding['runtimeSourceHashes']==hashes;current=(root/'outputs/Ranger-Kompakt.html').read_bytes();assert hashlib.sha256(current).hexdigest()==feeding['htmlSHA256'];(out/'html-equivalence.json').write_text(json.dumps({'currentHTMLSHA256':feeding['htmlSHA256'],'feedingHTMLSHA256':feeding['htmlSHA256'],'feedingTestCommit':feeding['sourceCommit'],'cleanBuildCommit':json.loads((root/'outputs/Ranger-Kompakt/build-manifest.json').read_text())['sourceCommit'],'exactSameHTML':True,'scope':'Fresh complete feeding run on the clean built standalone HTML, byte-identical, no metadata normalization needed.'},indent=2)+'\n')
sys.exit(0 if all(r['passed']for r in rows)else 1)
