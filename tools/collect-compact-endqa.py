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
def validate_import_report(report,row,html_hash):
 assert type(report['passed'])is bool and report['passed']==row['passed']==(row['exitCode']==0),'Import process and report outcomes differ'
 assert report['htmlSHA256']==html_hash,'Import report uses a different standalone HTML'
 if row['passed']:assert report['checks']and all(item['passed']is True for item in report['checks'])and not report.get('failure')and not report.get('errors')
def validate_legacy_report(report,row,commit,expected):
 assert report['commit']==commit and report['sourceDirty']is False,'Legacy browser report does not belong to the clean final runtime'
 for key,value in expected.items():assert report[key]==value,'Legacy browser mode differs: '+key
 assert type(report['passed'])is list and type(report['failed'])is list
 success=bool(report['passed'])and not any(report[key]for key in ['failed','errors','consoleErrors','httpErrors'])
 assert success==row['passed']==(row['exitCode']==0),'Legacy process and report outcomes differ'
import_path=work/'qa-correction/final-imports/result.json';import_report=load(import_path)
validate_import_report(import_report,effective['imports'],load(reports['feeding'])['htmlSHA256'])
for item in import_report['checks']:
 for name_key,hash_key in [('fixture','fixtureSHA256'),('export','exportSHA256'if 'exportSHA256'in item else'sha256')]:
  if item.get(name_key):
   filename=item[name_key];assert Path(filename).name==filename
   assert sha(import_path.parent/filename)==item[hash_key],'Changed import fixture/export: '+filename
for name,directory,expected in [
 ('legacy-full','browser-chromium-subpath',{'site':'outputs/GitHub-Pages','entry':'index.html','prefix':'/Ein-Tag-als-Ranger/','liveMissionSelection':'all'}),
 ('legacy-standalone','browser-chromium',{'site':'outputs','entry':'Feldbuch.html','prefix':'/','liveMissionSelection':None})]:
 validate_legacy_report(load(work/directory/'result.json'),effective[name],freeze['runtimeCommit'],expected)
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
# The runner passes an output argument, but coastal currently writes its fixed
# qa-correction directory. Bind that actual fresh output to this Node run.
nodes_path=work/'compact-regressions/result.json';nodes=load(nodes_path)
assert nodes['sourceCommit']==freeze['runtimeCommit']and nodes['sourceDirty']is False,'Node results must belong to the clean final runtime'
assert nodes['passed']is True and all(r['passed']is True for r in nodes['checks'])
node_rows={r['name']:r for r in nodes['checks']}
model_outputs={'coastal-model':('compact-coastal',work/'qa-correction/coastal-tests/result.json'),'habitat-model':('compact-habitat-revision',work/'compact-regressions/compact-habitat-revision/habitat-revision-result.json')}
model_provenance={'runtimeCommit':freeze['runtimeCommit'],'runtimeFreezeFile':'plan/runtime-freeze.json','runtimeFreezeMTimeNS':(work/'final-qa/runtime-freeze.json').stat().st_mtime_ns,'nodeManifest':'compact-node/result.json','nodeManifestSHA256':sha(nodes_path),'scope':'Fresh artifacts written during the clean final Node run. These JSONs do not themselves contain runtime hashes; binding uses the runner commit, suite logs and the recorded output write interval. Coastal currently ignores argv[2] and writes its fixed qa-correction path. Earlier habitat model evidence is separately historical.','aliases':{}}
for alias,(suite,path)in model_outputs.items():
 row=node_rows[suite];log=work/'compact-regressions'/row['log'];tail=json.loads(log.read_text().splitlines()[-1]);artifact=load(path)
 assert row['passed']is True and type(tail['passed'])is int and tail['passed']>0
 assert (work/'final-qa/runtime-freeze.json').stat().st_mtime_ns<=path.stat().st_mtime_ns<=nodes_path.stat().st_mtime_ns,'Model output was not written during the final Node run: '+str(path)
 if suite=='compact-coastal':assert artifact['passed']==tail['passed']and len(artifact['scenarios'])==tail['scenarios']
 else:assert artifact['passed']is True and len(artifact['seeds'])==tail['seeds']
 model_provenance['aliases'][alias]={'suite':suite,'source':str(path.relative_to(root)),'collected':alias+'/'+path.name,'artifactSHA256':sha(path),'suiteLog':'compact-node/'+row['log'],'suiteLogSHA256':sha(log),'suiteSummary':tail,'artifactMTimeNS':path.stat().st_mtime_ns,'nodeManifestMTimeNS':nodes_path.stat().st_mtime_ns}

assert not target.exists(),'Keep the previous collection; choose a new output instead of replacing proof'
target.mkdir(parents=True)
def copy(source,relative):
 dest=target/relative;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,dest)
def evidence_files(source):
 assert source.is_dir(),'Required evidence directory is missing: '+str(source)
 files=[path for path in sorted(source.rglob('*'))if path.is_file()and path.suffix in ['.json','.log','.txt','.md','.csv','.html','.pdf','.png','.webm','.mjs','.py','.patch']and 'raw-video'not in path.parts]
 assert files,'Required evidence directory has no collectable files: '+str(source)
 return files
def folder(source,relative):
 for path in evidence_files(source):copy(path,Path(relative)/path.relative_to(source))
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
 (model_outputs['habitat-model'][1].parent,'habitat-model'),
 (work/'qa-2026-10-23/habitats/model','reviews/habitats/historical-model'),
 (work/'qa-correction/final-print','print-audit'),
 (work/'qa-2026-10-23/failures','failed-attempts'),
 (root/'outputs/Ranger-Kompakt-Lernpaket','materials')]:
 folder(source,name)
(target/'MODEL-EVIDENCE-PROVENANCE.json').write_text(json.dumps(model_provenance,ensure_ascii=False,indent=2)+'\n')
for filename in ['QUELLEN-2026-10-23.md','QUELLEN-2026-10-23.json']:copy(root/'docs/kompakt'/filename,'sources/'+filename)
review_root=work/'qa-2026-10-23'
# Fresh final reviews stay separate from earlier own reviews and raw reports.
final_review_files=['final-print-review.md','final-print-review.json','final-habitat-review.md','final-habitat-review.json','final-feeding-review.md']
# These structured final reviews have explicit, verified source/media bindings.
final_review_files += ['final-feeding-review.json','final-arrival-review.md','final-arrival-review.json']
def validate_final_review_binding(review,report,report_path):
 assert review['sourceCommit']==freeze['runtimeCommit']==report['sourceCommit']
 assert review.get('runtimeCommit',review['sourceCommit'])==freeze['runtimeCommit']
 assert review['runtimeFreezeSHA256']==sha(work/'final-qa/runtime-freeze.json')
 assert (root/review['sourceReport']).resolve()==report_path.resolve()and review['sourceReportSHA256']==sha(report_path)
 assert review['htmlSHA256']==report['htmlSHA256']
 assert report['passed']is True and not report.get('failure')and not report.get('errors')
def validate_review_images(review,expected):
 actual={}
 for item in review['images']:
  path=(root/item['file']).resolve();assert path not in actual,'Duplicate reviewed image'
  assert path in expected and sha(path)==item['sha256']
  if expected[path]is not None:assert item['sha256']==expected[path]
  actual[path]=item
 assert set(actual)==set(expected),'Reviewed images and original capture inventory differ'
 return actual
feeding_report=load(reports['feeding']);final_feeding=load(review_root/'final-feeding-review.json')
validate_final_review_binding(final_feeding,feeding_report,reports['feeding'])
assert final_feeding['runtimeSourceHashes']==freeze['sourceHashes']
feeding_expected={(reports['feeding'].parent/c['file']).resolve():c['sha256']for sequence in feeding_report['sequences']for c in sequence['captures']}
feeding_images=validate_review_images(final_feeding,feeding_expected);assert len(feeding_images)==28 and all(item['viewed']is True for item in feeding_images.values())
arrival_report=load(reports['supplemental-arrival-3600']);arrival_base=reports['supplemental-arrival-3600'].parent;final_arrival=load(review_root/'final-arrival-review.json')
validate_final_review_binding(final_arrival,arrival_report,reports['supplemental-arrival-3600'])
assert final_arrival['runtimeHashCount']==len(freeze['sourceHashes'])and final_arrival['allRuntimeHashesMatchFreezeAndDisk']is True
assert final_arrival['technicalEvidenceChecksPassed']is True and final_arrival['planExecution']==effective['supplemental-arrival-3600']
arrival_expected={(arrival_base/c['file']).resolve():c['sha256']for sequence in arrival_report['sequences']for c in sequence['captures']}
assert len(arrival_expected)==48
arrival_expected.update({(arrival_base/('walk-'+segment['name']+'.png')).resolve():None for segment in arrival_report['walkSegments']})
arrival_images=validate_review_images(final_arrival,arrival_expected);assert len(arrival_images)==51
assert final_arrival['originalPhaseImageCount']==48 and final_arrival['originalRouteImageCount']==3
assert final_arrival['visuallyInspectedOriginalScreenshots']==sum(item['actuallyViewed']for item in arrival_images.values())
video=final_arrival['video'];video_path=(root/video['file']).resolve();assert video_path==(arrival_base/arrival_report['video']['file']).resolve()
assert sha(video_path)==video['sha256']==arrival_report['video']['sha256']and video_path.stat().st_size==video['bytes']==arrival_report['video']['bytes']
assert video['recordingOperationWallSeconds']==arrival_report['video']['actualSeconds']
book=final_arrival['fieldbook'];book_path=(root/book['file']).resolve();assert book_path==(arrival_base/'arrival-fieldbook.json').resolve()and sha(book_path)==book['sha256']
probe_path=(root/video['ffprobe']).resolve();assert probe_path==(review_root/'arrival-final-review/video-probe.json').resolve()and sha(probe_path)==video['ffprobeSHA256']
probe=load(probe_path);assert (root/probe['format']['filename']).resolve()==video_path and len(probe['frames'])==video['decodedFrames']
assert probe['streams'][0]['codec_name']==video['codec']and [probe['streams'][0]['width'],probe['streams'][0]['height']]==video['dimensions']
assert float(probe['frames'][-1]['best_effort_timestamp_time'])==video['lastPTSSeconds']
arrival_review_artifacts=[(probe_path,'reviews/arrival-final-review/video-probe.json')];arrival_reviewed_frames=[]
for frame in video['selectedFrames']:
 path=(root/frame['file']).resolve();assert path.parent==(review_root/'arrival-final-review').resolve()and sha(path)==frame['sha256']
 assert frame['actuallyViewed']is True and float(probe['frames'][frame['decodedFrameIndex']]['best_effort_timestamp_time'])==frame['presentationSeconds']
 relative='reviews/arrival-final-review/'+path.name;arrival_review_artifacts.append((path,relative));arrival_reviewed_frames.append({**frame,'file':relative})
assert len(arrival_reviewed_frames)==5 and len({frame['decodedFrameIndex']for frame in arrival_reviewed_frames})==5
for name,path_key,hash_key in [('report','report','reportSHA256'),('log','log','logSHA256'),('plan','plan','planSHA256')]:
 item=final_arrival['historicalArrival'];path=(root/item[path_key]).resolve();assert path.is_relative_to(historical_root.resolve())and sha(path)==item[hash_key]
assert final_arrival['historicalArrival']['status']=='FAILED'and final_arrival['historicalArrival']['walkWallBudgetSeconds']==900

for source,relative in arrival_review_artifacts:copy(source,relative)
for filename in final_review_files:copy(review_root/filename,'reviews/'+filename)
# This gallery's original relative links expect its two review files beside it.
for filename in ['final-habitat-review.md','final-habitat-review.json']:copy(review_root/filename,filename)
final_print=load(review_root/'final-print-review.json');assert final_print['runtimeFreeze']['sha256']==sha(work/'final-qa/runtime-freeze.json')
for name,digest in final_print['sourceHashes'].items():assert freeze['sourceHashes']['compact/'+name]==digest
material_info_path=root/'outputs/Ranger-Kompakt-Lernpaket/build-info.json'
assert (root/final_print['buildInfo']['file']).resolve()==material_info_path.resolve()and sha(material_info_path)==final_print['buildInfo']['sha256'],'Final print review and material manifest differ'
material_info=load(material_info_path);assert material_info['sourceCommit']==freeze['runtimeCommit']and material_info['sourceDirty']is False
assert material_info['sourceHashes']==final_print['sourceHashes']
assert {p.name for p in material_info_path.parent.iterdir()}==set(material_info['files'])|{'build-info.json'},'Unexpected extra or missing material files'
for filename,metadata in material_info['files'].items():
 assert Path(filename).name==filename;path=material_info_path.parent/filename
 assert path.stat().st_size==metadata['bytes']and sha(path)==metadata['sha256'],'Changed material file: '+filename

for document in final_print['documents'].values():
 assert sha(root/document['pdf'])==document['pdfSHA256']
 assert sha(root/document['automaticAudit']['file'])==document['automaticAudit']['sha256']
 for contact in document['contacts']:assert sha(root/contact['file'])==contact['sha256']
final_habitat=load(review_root/'final-habitat-review.json');assert final_habitat['sourceReportSHA256']==sha(reports['habitat-revision'])
assert final_habitat['runtimeFreezeSHA256']==sha(work/'final-qa/runtime-freeze.json')
assert (root/final_habitat['n02ModelResult']).resolve()==model_outputs['habitat-model'][1].resolve(),'Final habitat review must name the fresh Node artifact'
assert final_habitat['n02ModelResultSHA256']==sha(model_outputs['habitat-model'][1])
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
final_review_manifest={'scope':'Own final visual/print reviews and browser retry evidence. Technical PASS is not independent visual, biological, physical-device or classroom acceptance. Review prose retains original source paths; local reports are linked below.','files':{filename:{'file':'reviews/'+filename,'sha256':sha(review_root/filename)}for filename in final_review_files},'localReports':{'print':'print-audit/','habitats':'habitat-revision/result.json','feeding':'feeding/result.json','habitatGallery':'habitat-final-gallery.html','galleryDiagnosis':'reviews/gallery-list-diagnosis/model-reproduction.json','uiRecovery':'reference/context-recovery-result.json','driverAndEventDiagnosis':'reviews/diagnosis/PROVENANCE.json','arrival':'supplemental-arrival-3600/result.json','arrivalVideo':'supplemental-arrival-3600/'+arrival_report['video']['file'],'arrivalFieldbook':'supplemental-arrival-3600/arrival-fieldbook.json','arrivalReview':'reviews/final-arrival-review.json','arrivalProbe':'reviews/arrival-final-review/video-probe.json','feedingReview':'reviews/final-feeding-review.json'},'recoveryImages':recovery_images,'printStatus':final_print['status'],'completeF05VisualAcceptance':final_habitat['completeF05VisualAcceptance'],'feedingStatus':final_feeding['status'],'feedingCompleteVisualAcceptance':final_feeding['completeVisualAcceptance'],'arrivalStatus':final_arrival['status'],'arrivalUnconditionalVisualAcceptance':final_arrival['unconditionalVisualAcceptance'],'arrivalReviewedFrames':arrival_reviewed_frames}
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
legacy=load(work/'check-run.json');assert legacy['commit']==freeze['runtimeCommit'],'Legacy Node results use a different commit'
assert load(work/'v020-check-summary.json')==legacy['results'],'Legacy Node summaries disagree'
python=(work/'qa-correction/final-python.log').read_text()
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
summary['modelEvidenceProvenance']='MODEL-EVIDENCE-PROVENANCE.json'
summary['historicalHabitatModel']={'path':'reviews/habitats/historical-model','role':'Earlier own habitat-review source; not the fresh final Node test.'}
summary['ownReviewProvenance']='reviews/PROVENANCE.json'
summary['earlierAttemptArchive']='failed-attempts/ARCHIVE-SCOPE.json'
summary['folderCopyScope']='Recursive folders can include unreferenced supporting files. Only files named by current validated reports/manifests/reviews are current check evidence; other copied files do not acquire PASS status by inclusion.'
summary['finalReviewBindingScope']='Arrival and feeding structured reviews are bound to the exact final reports, freeze, HTML and original media. Their explicit visual limits remain unchanged.'

(target/'SUMMARY.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
(target/'SHA256.json').write_text(json.dumps({str(p.relative_to(target)):sha(p)for p in sorted(target.rglob('*'))if p.is_file()and p.name!='SHA256.json'},indent=2)+'\n')
print(json.dumps({'output':str(target),'files':sum(p.is_file()for p in target.rglob('*')),'allLatestBrowserChecksPassed':summary['allLatestBrowserChecksPassed']}))
