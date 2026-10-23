"""Seal the new 2026-10-23 round without replacing historical verification."""
from pathlib import Path
import argparse,hashlib,json,re,shutil,subprocess
p=argparse.ArgumentParser();p.add_argument('--output',default='verification/kompakt-endqa-20261023/final');a=p.parse_args()
root=Path(__file__).resolve().parents[1];work=root/'work';target=root/a.output
load=lambda p:json.loads(p.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
freeze=load(work/'final-qa/runtime-freeze.json');run=load(work/'final-qa/result.json');assert run['complete']
reruns=load(work/'final-qa/reruns.json');effective={r['name']:r for r in run['checks']}
for r in reruns['checks']:effective[r['name']]=r
reports={
 'arrival':work/'qa-correction/final-arrival/result.json','feeding':work/'qa-correction/final-feeding/result.json',
 'habitat-revision':work/'qa-correction/final-habitat-revision/result.json','growth':work/'qa-correction/final-growth/result.json','habitats':work/'qa-correction/final-habitats/result.json',
 'source':work/'compact-source/result.json','reference':work/'compact-browser/result.json',
 'standalone':work/'compact-browser/standalone-result.json','learning-web':work/'compact-learning/result.json',
 'learning-standalone':work/'compact-learning-standalone/result.json','stability':work/'compact-stability/result.json'
}
for name,path in reports.items():assert load(path)['runtimeSourceHashes']==freeze['sourceHashes'],name+' uses different runtime sources'
for name,digest in freeze['sourceHashes'].items():assert sha(root/'dist'/name)==digest,name+' changed after testing'
assert not target.exists(),'Keep the previous collection; choose a new output instead of replacing proof'
target.mkdir(parents=True)
def copy(source,relative):
 dest=target/relative;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,dest)
def folder(source,relative):
 for path in sorted(source.rglob('*')):
  if path.is_file()and path.suffix in ['.json','.log','.txt','.md','.csv','.html','.pdf','.png','.webm','.mjs','.py']and 'raw-video'not in path.parts:copy(path,Path(relative)/path.relative_to(source))
for name,path in reports.items():
 r=load(path);copy(path,Path(name)/'result.json')
 captures=r.get('captures',[])+r.get('videos',[])+[c for s in r.get('sequences',[])for c in s.get('captures',[])]+([r['video']]if r.get('video')else[])
 for item in captures:
  filename=item['file'];assert Path(filename).name==filename
  source=path.parent/filename
  if item.get('sha256'):assert sha(source)==item['sha256'],filename
  copy(source,Path(name)/filename)
 if name in ['arrival','feeding','growth','habitats','habitat-revision','learning-web','learning-standalone']:folder(path.parent,name)
 if name=='stability'and(path.parent/'final.png').exists():copy(path.parent/'final.png','stability/final.png')
for source,name in [
 (work/'final-qa','plan'),(work/'compact-regressions','compact-node'),
 (work/'qa-correction/final-imports','imports'),(work/'qa-correction/coastal-tests','coastal-model'),
 (work/'browser-chromium-subpath','legacy'),(work/'browser-chromium','legacy-standalone'),
 (work/'qa-2026-10-23/context-baseline','baseline-resource-audit'),
 (root/'verification/kompakt-endqa-20261023/baseline/habitats','baseline-habitats'),
 (work/'qa-2026-10-23/habitats/model','habitat-model'),
 (work/'qa-correction/final-print','print-audit'),
 (work/'qa-2026-10-23/failures','failed-attempts'),
 (root/'outputs/Ranger-Kompakt-Lernpaket','materials')]:
 folder(source,name)
for filename in ['QUELLEN-2026-10-23.md','QUELLEN-2026-10-23.json']:copy(root/'docs/kompakt'/filename,'sources/'+filename)
review_root=work/'qa-2026-10-23'
for relative in ['print/FINAL-REVIEW.md','print/final-review.json','habitats/REVIEW.md','habitats/flooding-table.md','habitats/source-access.json','habitats/final-build.json']:
 copy(review_root/relative,Path('reviews')/relative)
# Retain the provenance behind the earlier visual review, without duplicating
# its exploratory PNGs. The final browser rerun is already collected separately.
habitat_review=load(review_root/'habitats/final-browser/result.json')
copy(review_root/'habitats/final-browser/result.json','reviews/habitats/reviewed-browser.json')
print_review=load(review_root/'print/final-review.json')
habitat_build=load(review_root/'habitats/final-build.json')
def review_provenance(metadata,hashes,scope):
 differences={name:{'review':digest,'runtimeFreeze':freeze['sourceHashes'].get(name)}for name,digest in hashes.items()if freeze['sourceHashes'].get(name)!=digest}
 return {'sourceCommit':metadata.get('sourceCommit'),'sourceDirty':metadata.get('sourceDirty'),'runtimeFreezeCommit':freeze['runtimeCommit'],'sameCommitAsRuntimeFreeze':metadata.get('sourceCommit')==freeze['runtimeCommit'],'hashScope':scope,'comparedSourceFiles':len(hashes),'sourceHashesMatchRuntimeFreeze':bool(hashes)and not differences,'sourceDifferences':differences,'role':'Earlier own visual review; does not replace the final browser or PDF rerun.'}
review_provenance_records={
 'print':review_provenance(print_review,{'compact/'+name:digest for name,digest in print_review['sourceHashes'].items()},'Four document/material modules only'),
 'habitats':review_provenance(habitat_build,habitat_review['runtimeSourceHashes'],'Entire runtime recorded by the earlier habitat browser run')
}
(target/'reviews/PROVENANCE.json').write_text(json.dumps(review_provenance_records,ensure_ascii=False,indent=2)+'\n')
# Consolidate small failed/aborted-attempt records beside the already copied
# failures/ reports. Raw video and exploratory images remain in their source
# directories; record those omissions rather than silently implying full copies.
attempt_archive={'policy':'Preserve text/JSON evidence of early failed or interrupted attempts; omit exploratory images and raw video. These are not final passing runs.','included':[],'omitted':[]}
def attempt_record(source,relative):
 copy(source,Path('failed-attempts')/relative)
 attempt_archive['included'].append({'source':str(source.relative_to(root)),'collected':'failed-attempts/'+str(relative),'sha256':sha(source)})
for source in sorted(review_root.glob('arrival-attempt*')):
 if not source.is_dir():continue
 for path in sorted(source.rglob('*')):
  if not path.is_file():continue
  if path.suffix in ['.json','.log','.txt','.md','.csv']and 'raw-video'not in path.parts:attempt_record(path,Path(source.name)/path.relative_to(source))
  else:attempt_archive['omitted'].append({'source':str(path.relative_to(root)),'bytes':path.stat().st_size,'reason':'Exploratory image or raw video; original remains in the work directory.'})
for source in sorted((review_root/'growth').glob('browser-attempt*.log')):attempt_record(source,Path('growth')/source.name)
for relative in ['habitats/interrupted-snapshot-browser.log','habitats/interrupted-snapshot-browser/result.json','print/NOTES.md']:
 attempt_record(review_root/relative,Path(relative))
for number in [1,2,3]:
 for relative in [f'print/candidate-{number}-print.log',f'print/candidate-{number}/build-info.json']:
  attempt_record(review_root/relative,Path(relative))
(target/'failed-attempts/ARCHIVE-SCOPE.json').write_text(json.dumps(attempt_archive,ensure_ascii=False,indent=2)+'\n')
for filename in ['check-run.json','v020-check-summary.json']:copy(work/filename,'legacy-node/'+filename)
for filename in ['final-python.log','final-build-compact.log','final-build-legacy.log','final-source-package.log','final-legacy-node.log','final-compact-node.log']:copy(work/'qa-correction'/filename,'logs/'+filename)
nodes=load(work/'compact-regressions/result.json');legacy=load(work/'check-run.json');python=(work/'qa-correction/final-python.log').read_text()
groups={r['name']:json.loads((work/'compact-regressions'/r['log']).read_text().splitlines()[-1])['passed']for r in nodes['checks']};assert all(type(n)is int and n>0 for n in groups.values())
summary={'runtimeFreeze':freeze,'collectedAtCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'originalBrowserPlan':run,'reruns':reruns,'latestBrowserChecks':effective,'allLatestBrowserChecksPassed':all(r['passed']for r in effective.values()),'legacyNodeSuites':len(legacy['results']),'legacyNodePassed':sum(r['passed']for r in legacy['results']),'compactGroups':groups,'compactGroupCount':sum(groups.values()),'pythonMethods':int(re.search(r'Ran (\d+) tests',python)[1]),'pythonPassed':python.rstrip().endswith('OK'),'measuredStabilitySeconds':load(reports['stability'])['samples'][-1]['elapsedSeconds'],'reportCounts':{name:{'checks':len(load(path).get('checks',[])),'sequences':len(load(path).get('sequences',[])),'captures':len(load(path).get('captures',[]))}for name,path in reports.items()},'scope':'Own fresh tests of the new correction round. Supplied HTML/text were read; the independent ZIP exceeded the 32 MiB transfer limit. No unavailable original raw proof is claimed. Model time, actual active time and wall-time video are separately labelled.','notChecked':['Physical iPad 9 / Safari / iPadOS 27','Classroom pilot and acquired learning competence','Independent biological/visual final acceptance','ETS original PDF inaccessible through configured network']}
summary['ownReviewProvenance']='reviews/PROVENANCE.json'
summary['earlierAttemptArchive']='failed-attempts/ARCHIVE-SCOPE.json'
(target/'SUMMARY.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
(target/'SHA256.json').write_text(json.dumps({str(p.relative_to(target)):sha(p)for p in sorted(target.rglob('*'))if p.is_file()and p.name!='SHA256.json'},indent=2)+'\n')
print(json.dumps({'output':str(target),'files':sum(p.is_file()for p in target.rglob('*')),'allLatestBrowserChecksPassed':summary['allLatestBrowserChecksPassed']}))
