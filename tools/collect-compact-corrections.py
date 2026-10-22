"""Seal fresh correction proof. Historical proof directories remain untouched."""
from pathlib import Path
import json,hashlib,shutil,subprocess,re
root=Path(__file__).resolve().parents[1];work=root/'work';target=root/'verification/kompakt-korrektur/final'
load=lambda p:json.loads(p.read_text());freeze=load(work/'final-qa/runtime-freeze.json');run=load(work/'final-qa/result.json');assert run['complete'],'Complete the entire declared browser plan first'
rerun_path=work/'final-qa/reruns.json';reruns=load(rerun_path)if rerun_path.exists()else{'checks':[]};effective={r['name']:r for r in run['checks']}
for r in reruns['checks']:effective[r['name']]=r
reports=[('source',work/'compact-source/result.json'),('reference',work/'compact-browser/result.json'),('standalone',work/'compact-browser/standalone-result.json'),('learning-web',work/'compact-learning/result.json'),('learning-standalone',work/'compact-learning-standalone/result.json'),('stability',work/'compact-stability/result.json'),('feeding',work/'qa-correction/final-feeding/result.json'),('habitats',work/'qa-correction/final-habitats/result.json')]
for name,path in reports:
 r=load(path);assert r['runtimeSourceHashes']==freeze['sourceHashes'],'Different measured runtime: '+name
for name,digest in freeze['sourceHashes'].items():assert hashlib.sha256((root/'dist'/name).read_bytes()).hexdigest()==digest,'Runtime changed: '+name
if target.exists():raise RuntimeError('Preserve the existing final collection before replacing it')
target.mkdir(parents=True)
def copy(p,relative):
 dest=target/relative;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,dest)
def add_folder(source,relative):
 for p in sorted(source.rglob('*')):
  if p.is_file()and p.suffix in ['.json','.txt','.log','.png','.webm','.html']:
   copy(p,Path(relative)/p.relative_to(source))
for name,p in reports:
 r=load(p);copy(p,Path(name)/p.name)
 for item in r.get('captures',[])+r.get('videos',[]):
  name_file=item['file'];assert Path(name_file).name==name_file
  source=p.parent/name_file
  if 'sha256'in item:assert hashlib.sha256(source.read_bytes()).hexdigest()==item['sha256'],'Changed raw image/video: '+name_file
  copy(source,Path(name)/name_file)
 if name in ['learning-web','learning-standalone']:
  for filename in ['earned-all-families.json','downloaded-fieldbook.json','readable-report.txt','quota-recovered-draft.json','layout-result.json']:
   q=p.parent/filename
   if q.exists():copy(q,Path(name)/filename)
 if name=='feeding':
  for sequence in r['sequences']:
   for c in sequence['captures']:assert hashlib.sha256((p.parent/c['file']).read_bytes()).hexdigest()==c['sha256'],c['file']
  add_folder(p.parent,'feeding')
 if name=='habitats':add_folder(p.parent,'habitats')
 if name=='stability':
  q=p.parent/'final.png'
  if q.exists():copy(q,'stability/final.png')
for source,folder in [(work/'qa-correction/final-imports','imports'),(work/'compact-regressions','compact-node')]:add_folder(source,folder)
for filename in ['result.json','progress.log','runtime-freeze.json','environment.json','html-equivalence.json','scheduler-timing.json','flooding-all-taxa.csv','flooding-report.md']:
 copy(work/'final-qa'/filename,filename)
if rerun_path.exists():copy(rerun_path,'reruns.json')
for q in (work/'final-qa').glob('*.log'):copy(q,'logs/'+q.name)
for filename in ['check-run.json','v020-check-summary.json']:
 copy(work/filename,'legacy-node/'+filename)
for filename in ['final-python.log','final-build-compact.log','final-build-legacy.log','final-source-package.log','final-legacy-node.log','final-compact-node.log']:
 copy(work/'qa-correction'/filename,'logs/'+filename)
for source,folder in [(work/'browser-chromium-subpath','legacy'),(work/'browser-chromium','legacy-standalone')]:
 r=load(source/'result.json');copy(source/'result.json',folder+'/result.json')
 for name in ['live-earned-fieldbook.json','failed-earned-fieldbook.json','failure.html']:
  p=source/name
  if p.exists():copy(p,folder+'/'+name)
 for name in r.get('screenshots',[]):
  if isinstance(name,str)and(source/name).exists():copy(source/name,folder+'/'+name)
py=(work/'qa-correction/final-python.log').read_text();nodes=load(work/'compact-regressions/result.json');legacy=load(work/'check-run.json')
summary={'runtimeFreeze':freeze,'collectedAtCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'browserPlan':run,'browserReruns':reruns,'latestBrowserChecks':effective,'allLatestBrowserChecksPassed':all(r['passed']for r in effective.values()),'node':{'legacySuites':len(legacy['results']),'legacyPassed':sum(r['passed']for r in legacy['results']),'compactSuites':nodes['checks']},'pythonMethods':int(re.search(r'Ran (\d+) tests',py)[1]),'pythonPassed':py.rstrip().endswith('OK'),'reportCounts':{name:len(load(p).get('checks',[]))for name,p in reports},'scope':'Only the executed property is proved. No original independent QA archive or physical Apple/iPad/Safari test. No automatic grade of open arguments or classroom learning effect.','notChecked':['F12: no description provided','Physical iPad 9 / Safari / iPadOS 27','Independent biological/visual final review','Classroom pilot and teaching effect']}
(target/'SUMMARY.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n');(target/'SHA256.json').write_text(json.dumps({str(p.relative_to(target)):hashlib.sha256(p.read_bytes()).hexdigest()for p in sorted(target.rglob('*'))if p.is_file()and p.name!='SHA256.json'},indent=2)+'\n');print(json.dumps({'output':str(target),'files':len(list(target.rglob('*')))}))
