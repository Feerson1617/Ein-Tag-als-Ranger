"""Seal selected synthetic QA output; no user/school data or environment files."""
from pathlib import Path
import hashlib,json,re,shutil,subprocess
root=Path(__file__).resolve().parents[1];work=root/'work';out=root/'verification/kompakt-v2';out.mkdir(parents=True,exist_ok=True)
load=lambda p:json.loads(p.read_text())
reference=load(work/'compact-browser/result.json');single=load(work/'compact-browser/standalone-result.json');learning=load(work/'compact-learning/result.json');stability=load(work/'compact-stability/result.json');run=load(work/'complete-compact/final-validation.json')
assert all(step['status']=='passed'for step in run['steps'])and len(run['steps'])==18
for r,minimum in [(reference,18),(single,5),(learning,17)]:assert not r.get('failure')and not r['errors']and len(r['checks'])>=minimum
assert learning.get('completedAt')and stability['passed']and stability['actualElapsedSeconds']>=1200
assert reference['runtimeSourceHashes']==single['runtimeSourceHashes']==learning['runtimeSourceHashes']==stability['runtimeSourceHashes']
for name,digest in reference['runtimeSourceHashes'].items():assert hashlib.sha256((root/'dist'/name).read_bytes()).hexdigest()==digest

def copy(source,target):
 target=out/target;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,target)
for source,folder,r in [(work/'compact-browser','reference',reference),(work/'compact-learning','learning',learning)]:
 for item in r['captures']+r.get('videos',[]):
  assert Path(item['file']).name==item['file'];p=source/item['file'];assert hashlib.sha256(p.read_bytes()).hexdigest()==item['sha256'];copy(p,folder+'/'+item['file'])
for item in single['captures']:copy(work/'compact-browser'/item['file'],'reference/'+item['file'])
for folder,names in [('compact-browser',['result.json','standalone-result.json','earned-fieldbook.json']),('compact-learning',['result.json','earned-all-families.json','downloaded-fieldbook.json','readable-report.txt','quota-recovered-draft.json']),('compact-stability',['result.json','final.png'])]:
 target={'compact-browser':'reference','compact-learning':'learning','compact-stability':'stability'}[folder]
 for name in names:copy(work/folder/name,target+'/'+name)
for name in ['check-run.json','complete-compact/final-validation.json','complete-compact/runtime-freeze.json','complete-compact/source-access.json']:copy(work/name,Path(name).name)
for p in (work/'complete-compact').glob('final-*.log'):copy(p,'logs/'+p.name)
for p in (work/'complete-compact/attempts').rglob('*'):
 if p.is_file()and(p.name in ['result.json','run.log','overlap.png']or p.suffix=='.log'):copy(p,'attempts/'+str(p.relative_to(work/'complete-compact/attempts')))
legacy=load(work/'browser-chromium-subpath/result.json');legacySingle=load(work/'browser-chromium/result.json')
for r in [legacy,legacySingle]:assert not any(r.get(k)for k in ['failed','errors','consoleErrors','httpErrors'])
nodeCount=lambda name:json.loads((work/('complete-compact/final-'+name+'.log')).read_text().strip().splitlines()[-1])['passed']
pythonCount=int(re.search(r'Ran (\d+) tests', (work/'complete-compact/final-python-packages.log').read_text())[1])
for source,target in [(work/'browser-chromium-subpath','legacy'),(work/'browser-chromium','legacy-standalone')]:
 for name in ['result.json','live-earned-fieldbook.json']:
  if(source/name).is_file():copy(source/name,target+'/'+name)
summary={'runtimeFreeze':load(work/'complete-compact/runtime-freeze.json'),'node':{'legacySuites':len(load(work/'check-run.json')['results']),'compactGroups':nodeCount('compact-node'),'learningGroups':nodeCount('learning-node')},'pythonMethods':pythonCount,'browserBlocks':{'reference':len(reference['checks']),'single':len(single['checks']),'learning':len(learning['checks']),'legacy':len(legacy['passed']),'legacySingle':len(legacySingle['passed'])},'activeTaxa':36,'curriculumCards':25,'cloudStabilitySeconds':stability['actualElapsedSeconds'],'runtimeSourceHashes':reference['runtimeSourceHashes'],'sourceCommitAtCollection':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'limits':['No real iPad 9/Safari/iPadOS 27 test','No biological final review','No classroom pilot','Original school PDFs and external numeric source tables unavailable'],'remoteStatus':'See final PR checks; this file records local verification only.'}
(out/'SUMMARY.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
(out/'SHA256.json').write_text(json.dumps({str(p.relative_to(out)):hashlib.sha256(p.read_bytes()).hexdigest()for p in sorted(out.rglob('*'))if p.is_file()and p.name!='SHA256.json'},indent=2)+'\n')
print(json.dumps({'output':str(out),'files':len(list(out.rglob('*'))),'summary':summary['browserBlocks']}))
