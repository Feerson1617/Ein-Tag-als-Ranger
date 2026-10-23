"""Seal the new 2026-10-23 round without replacing historical verification."""
from pathlib import Path
import argparse,hashlib,json,re,shutil,subprocess
p=argparse.ArgumentParser();p.add_argument('--output',default='verification/kompakt-endqa-20261023/final');a=p.parse_args()
root=Path(__file__).resolve().parents[1];work=root/'work';target=root/a.output
load=lambda p:json.loads(p.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
freeze=load(work/'final-qa/runtime-freeze.json');run=load(work/'final-qa/result.json');assert run['complete']
reruns=load(work/'final-qa/reruns.json')
def classify_browser_checks(plan,repetitions):
 latest={r['name']:r for r in plan['checks']}
 assert 'arrival'not in latest and 'supplemental-arrival-3600'in latest,'Final plan must name the supplemental operational budget separately'
 for row in repetitions['checks']:
  name=row['name'];assert name in latest,'Rerun is not part of the final plan: '+name
  previous=latest[name]
  assert row['command']==previous['command'],'Changed arguments/budgets cannot replace a comparable check'
  assert row.get('processTimeoutSeconds')==previous.get('processTimeoutSeconds'),'Changed scheduler budget is a different check'
  latest[name]=row
 return latest
effective=classify_browser_checks(run,reruns)
historical_root=work/'qa-2026-10-23/historical-plan'
historical_run=load(historical_root/'result.json');assert historical_run['complete']
historical_freeze=load(historical_root/'runtime-freeze.json')
assert historical_run['sourceCommit']==historical_freeze['runtimeCommit']
assert run['sourceCommit']==freeze['runtimeCommit']
assert historical_freeze['runtimeCommit']!=freeze['runtimeCommit'],'Retain the historical pre-fix runtime separately'
supplemental_path=work/'qa-correction/supplemental-arrival-3600/result.json'

reports={
 'supplemental-arrival-3600':supplemental_path,'feeding':work/'qa-correction/final-feeding/result.json',
 'habitat-revision':work/'qa-correction/final-habitat-revision/result.json','growth':work/'qa-correction/final-growth/result.json','habitats':work/'qa-correction/final-habitats/result.json',
 'source':work/'compact-source/result.json','reference':work/'compact-browser/result.json',
 'standalone':work/'compact-browser/standalone-result.json','learning-web':work/'compact-learning/result.json',
 'learning-standalone':work/'compact-learning-standalone/result.json','stability':work/'compact-stability/result.json'
}
original_arrival_path=historical_root/'arrival-failure/result.json';original_arrival=load(original_arrival_path)
original_arrival_row=next(r for r in historical_run['checks']if r['name']=='arrival')
assert original_arrival_row['passed']is False and original_arrival['passed']is False,'Preserve the failed original 900-second outcome'
assert 'Full path did not finish'in original_arrival.get('failure','')
assert original_arrival.get('walkWallBudgetSeconds',900)==900
assert original_arrival['runtimeSourceHashes']==historical_freeze['sourceHashes'],'Historical report must bind to its own frozen runtime'
assert sha(historical_root/original_arrival_row['log'])==sha(historical_root/'arrival-failure/driver.log'),'Archive both copies of the original failed driver log'
supplemental=load(supplemental_path);assert supplemental['walkWallBudgetSeconds']==3600
execution=effective['supplemental-arrival-3600'];assert execution['passed']==supplemental['passed']and (execution['exitCode']==0)==supplemental['passed']
command=execution['command'];assert command[command.index('--walk-wall-budget')+1]=='3600'
assert (root/command[command.index('--output')+1]/'result.json').resolve()==supplemental_path.resolve()
assert execution['processTimeoutSeconds']==6000
assert isinstance(supplemental.get('passed'),bool)
arrival_evidence={
 'original':{'status':'FAILED','passed':False,'walkWallBudgetSeconds':900,'report':'historical-plan/arrival-failure/result.json','log':'historical-plan/'+original_arrival_row['log'],'runtimeCommit':historical_freeze['runtimeCommit'],'elapsedWallSeconds':original_arrival_row['seconds'],'reportSHA256':sha(original_arrival_path),'scope':'Historical pre-fix runtime; FAILED under the unchanged original 900-second guard. This is not final-runtime evidence.'},
 'supplemental':{'status':'PASS'if supplemental['passed']else'FAILED','passed':supplemental['passed'],'walkWallBudgetSeconds':3600,'processTimeoutSeconds':execution['processTimeoutSeconds'],'report':'supplemental-arrival-3600/result.json','reportSHA256':sha(supplemental_path),'runtimeCommit':freeze['runtimeCommit'],'execution':execution,'scope':'Separate current-runtime slow-cloud functional route; no FPS, minimum-device or original-budget PASS.'},
 'policy':'Historical 900-second FAILED remains unchanged. The fresh runtime uses a separately named 3600-second functional route; neither its PASS nor allLatestBrowserChecksPassed certifies performance. Walk budgets apply per segment; process budget is separate.'}
for name,path in reports.items():assert load(path)['runtimeSourceHashes']==freeze['sourceHashes'],name+' uses different runtime sources'
for name,digest in freeze['sourceHashes'].items():assert sha(root/'dist'/name)==digest,name+' changed after testing'
assert not target.exists(),'Keep the previous collection; choose a new output instead of replacing proof'
target.mkdir(parents=True)
def copy(source,relative):
 dest=target/relative;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,dest)
def folder(source,relative):
 for path in sorted(source.rglob('*')):
  if path.is_file()and path.suffix in ['.json','.log','.txt','.md','.csv','.html','.pdf','.png','.webm','.mjs','.py','.patch']and 'raw-video'not in path.parts:copy(path,Path(relative)/path.relative_to(source))
for name,path in reports.items():
 r=load(path);copy(path,Path(name)/'result.json')
 captures=r.get('captures',[])+r.get('videos',[])+[c for s in r.get('sequences',[])for c in s.get('captures',[])]+([r['video']]if r.get('video')else[])
 for item in captures:
  filename=item['file'];assert Path(filename).name==filename
  source=path.parent/filename
  if item.get('sha256'):assert sha(source)==item['sha256'],filename
  copy(source,Path(name)/filename)
 if name in ['supplemental-arrival-3600','feeding','growth','habitats','habitat-revision','learning-web','learning-standalone']:folder(path.parent,name)
 if name=='stability'and(path.parent/'final.png').exists():copy(path.parent/'final.png','stability/final.png')
for source,name in [
 (work/'final-qa','plan'),(historical_root,'historical-plan'),(work/'compact-regressions','compact-node'),
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
# Fresh final reviews stay separate from earlier own reviews and raw reports.
final_review_files=['final-print-review.md','final-print-review.json','final-habitat-review.md','final-habitat-review.json','final-feeding-review.md']
if(review_root/'final-feeding-review.json').exists():final_review_files.append('final-feeding-review.json')
for filename in final_review_files:copy(review_root/filename,'reviews/'+filename)
# This gallery's original relative links expect its two review files beside it.
for filename in ['final-habitat-review.md','final-habitat-review.json']:copy(review_root/filename,filename)
final_print=load(review_root/'final-print-review.json');assert final_print['runtimeFreeze']['sha256']==sha(work/'final-qa/runtime-freeze.json')
for name,digest in final_print['sourceHashes'].items():assert freeze['sourceHashes']['compact/'+name]==digest
for document in final_print['documents'].values():
 assert sha(root/document['pdf'])==document['pdfSHA256']
 assert sha(root/document['automaticAudit']['file'])==document['automaticAudit']['sha256']
 for contact in document['contacts']:assert sha(root/contact['file'])==contact['sha256']
final_habitat=load(review_root/'final-habitat-review.json');assert final_habitat['sourceReportSHA256']==sha(reports['habitat-revision'])
assert final_habitat['runtimeFreezeSHA256']==sha(work/'final-qa/runtime-freeze.json')
for item in final_habitat['images']:assert sha(root/item['file'])==item['sha256']
copy(review_root/'habitat-final-gallery.html','habitat-final-gallery.html')
for link in re.findall(r'(?:href|src)="([^"#]+)"',(target/'habitat-final-gallery.html').read_text()):
 if not re.match(r'[a-z]+:',link):assert (target/link.split('#')[0]).is_file(),'Broken sealed habitat-gallery link: '+link
folder(review_root/'gallery-list-diagnosis','reviews/gallery-list-diagnosis')
copy(review_root/'supplemental-route-plan.md','plan/supplemental-route-plan.md')
recovery_path=reports['reference'].parent/'context-recovery-result.json';recovery=load(recovery_path)
assert recovery==load(reports['reference'])['contextRecovery'],'Recovery proof must belong to the collected reference run'
assert recovery['before']['savedFieldbookBytes']>0 and int(recovery['before']['count'])>0
reference_report=load(reports['reference'])
if effective['reference']['passed']:
 assert reference_report['checks']and all(row['passed']is True for row in reference_report['checks'])and not reference_report.get('errors')and not reference_report.get('failure')
 assert recovery.get('nativeRestore',{}).get('passed')and recovery.get('uiReload',{}).get('passed')
if recovery.get('nativeRestore',{}).get('passed'):
 assert recovery['nativeRestore']['runId']==recovery['before']['runId']and recovery['nativeRestore']['storedBytesUnchanged']
if recovery.get('uiReload',{}).get('passed'):
 assert recovery['uiReload']['afterRunId']!=recovery['uiReload']['beforeRunId']and recovery['uiReload']['storedBytesUnchanged']
 assert recovery['uiReload']['afterNavigation']['navigationType']=='reload'
 assert recovery['uiReload']['afterNavigation']['timeOrigin']>recovery['uiReload']['beforeTimeOrigin']
copy(recovery_path,'reference/context-recovery-result.json')
recovery_images={}
for stage in ['nativeRestore','uiReload']:
 filename=recovery.get(stage,{}).get('image')
 if filename:
  assert Path(filename).name==filename;source=recovery_path.parent/filename;copy(source,'reference/'+filename);recovery_images[stage]={'file':'reference/'+filename,'sha256':sha(source)}
if recovery.get('uiReload',{}).get('lostContext'):
 source=recovery_path.parent/'18-ui-retry-context-lost.png';copy(source,'reference/'+source.name);recovery_images['lostContext']={'file':'reference/'+source.name,'sha256':sha(source)}
feeding_review=(review_root/'final-feeding-review.md').read_text()
assert freeze['runtimeCommit']in feeding_review or freeze['runtimeCommit'][:7]in feeding_review,'Refresh the feeding review against the final runtime; do not relabel historical images'
# Retain small before/after diagnoses without copying the candidate runtime tree.
diagnosis_files={}
event_review=review_root/'event-reference-review'
event_files=['reproduce.mjs','baseline-repro.json','candidate-repro.json','candidate-node/result.json','candidate-learning.log','review.json','REVIEW.md']
event_files += [p.name for p in sorted(event_review.glob('*.patch'))]
for filename in ['README.md','README.txt']:
 if(event_review/filename).exists():event_files.append(filename)
for filename in event_files:
 source=event_review/filename;relative='reviews/diagnosis/event-reference/'+filename;copy(source,relative);diagnosis_files[relative]=sha(source)
for filename in ['arrival-realtime-model-duration.json','arrival-realtime-fresh-frame.patch','arrival-explicit-budget.patch']:
 source=review_root/filename;relative='reviews/diagnosis/arrival/'+filename;copy(source,relative);diagnosis_files[relative]=sha(source)
(target/'reviews/diagnosis/PROVENANCE.json').write_text(json.dumps({'scope':'Small preserved before/after diagnoses and unapplied-at-diagnosis driver proposals; these historical/candidate checks do not replace the fresh final runtime tests. Full candidate/dist tree intentionally omitted.','files':diagnosis_files},ensure_ascii=False,indent=2)+'\n')
final_review_manifest={'scope':'Own final visual/print reviews and browser retry evidence. Technical PASS is not independent visual, biological, physical-device or classroom acceptance. Review prose retains original source paths; local reports are linked below.','files':{filename:{'file':'reviews/'+filename,'sha256':sha(review_root/filename)}for filename in final_review_files},'localReports':{'print':'print-audit/','habitats':'habitat-revision/result.json','feeding':'feeding/result.json','habitatGallery':'habitat-final-gallery.html','galleryDiagnosis':'reviews/gallery-list-diagnosis/model-reproduction.json','uiRecovery':'reference/context-recovery-result.json','driverAndEventDiagnosis':'reviews/diagnosis/PROVENANCE.json'},'recoveryImages':recovery_images,'printStatus':final_print['status'],'completeF05VisualAcceptance':final_habitat['completeF05VisualAcceptance'],'feedingStatus':'See own documented review scope; technical success does not resolve stated visual limits.'}
(target/'reviews/FINAL-REVIEW-INDEX.json').write_text(json.dumps(final_review_manifest,ensure_ascii=False,indent=2)+'\n')
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
summary={'runtimeFreeze':freeze,'collectedAtCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'originalBrowserPlan':historical_run,'historicalBrowserPlan':historical_run,'finalBrowserPlan':run,'reruns':reruns,'latestBrowserChecks':effective,'allLatestBrowserChecksPassed':all(r['passed']for r in effective.values()),'legacyNodeSuites':len(legacy['results']),'legacyNodePassed':sum(r['passed']for r in legacy['results']),'compactGroups':groups,'compactGroupCount':sum(groups.values()),'pythonMethods':int(re.search(r'Ran (\d+) tests',python)[1]),'pythonPassed':python.rstrip().endswith('OK'),'measuredStabilitySeconds':load(reports['stability'])['samples'][-1]['elapsedSeconds'],'reportCounts':{name:{'checks':len(load(path).get('checks',[])),'sequences':len(load(path).get('sequences',[])),'captures':len(load(path).get('captures',[]))}for name,path in reports.items()},'scope':'Own fresh tests of the new correction round. Supplied HTML/text were read; the independent ZIP exceeded the 32 MiB transfer limit. No unavailable original raw proof is claimed. Model time, actual active time and wall-time video are separately labelled.','notChecked':['Physical iPad 9 / Safari / iPadOS 27','Classroom pilot and acquired learning competence','Independent biological/visual final acceptance','ETS original PDF inaccessible through configured network']}
summary['historicalRuntimeFreeze']=historical_freeze
summary['originalBrowserPlanPassed']=all(r['passed']for r in historical_run['checks'])
summary['originalBrowserPlanFailures']=[r['name']for r in historical_run['checks']if not r['passed']]
summary['finalBrowserPlanPassed']=all(r['passed']for r in run['checks'])
summary['finalBrowserPlanFailures']=[r['name']for r in run['checks']if not r['passed']]
summary['arrivalEvidence']=arrival_evidence
summary['supplementalBrowserChecks']={'supplemental-arrival-3600':arrival_evidence['supplemental']}
summary['latestBrowserChecksScope']='Latest comparable checks of the fresh runtime, with explicitly supplemental 3600-second route budget. Historical 900-second FAILED remains independently archived; functional PASS is not performance or physical-device acceptance.'
summary['originalArrivalBudgetPassed']=False
summary['performanceAcceptance']='NOT ESTABLISHED: no physical iPad/Safari test or FPS acceptance; original historical 900-second route FAILED.'
summary['independentVisualAcceptance']='NOT ESTABLISHED; own visual limits remain in the final review index.'
summary['finalOwnReviews']='reviews/FINAL-REVIEW-INDEX.json'
summary['ownReviewProvenance']='reviews/PROVENANCE.json'
summary['earlierAttemptArchive']='failed-attempts/ARCHIVE-SCOPE.json'
(target/'SUMMARY.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
(target/'SHA256.json').write_text(json.dumps({str(p.relative_to(target)):sha(p)for p in sorted(target.rglob('*'))if p.is_file()and p.name!='SHA256.json'},indent=2)+'\n')
print(json.dumps({'output':str(target),'files':sum(p.is_file()for p in target.rglob('*')),'allLatestBrowserChecksPassed':summary['allLatestBrowserChecksPassed']}))
