"""Repeat only the encoder-blocked process; retain the original failure, immutable."""
from pathlib import Path
import hashlib,json,os,shutil,signal,subprocess,sys,time
root=Path(__file__).resolve().parents[2];base=Path(__file__).resolve().parent;q=base/'final-4eb186a';load=lambda p:json.loads(p.read_text());dump=lambda p,d:p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
r=load(q/'result.json');f=load(q/'runtime-freeze.json');assert r['complete'] and len(r['checks'])==34;failed=[x for x in r['checks']if not x['passed']];assert len(failed)==1 and failed[0]['name']=='v1-full-walk-feeding';assert 'Executable doesn\'t exist' in(q/failed[0]['log']).read_text();assert load(q/'ffmpeg-environment/result.json')['passed']
assert not(q/'main-plan-original-result.json').exists();shutil.copyfile(q/'result.json',q/'main-plan-original-result.json');shutil.copyfile(base/'ffmpeg-install.log',q/'ffmpeg-environment/official-install-failed.log')
name='v1-full-walk-feeding-retry';args=[sys.executable,'tools/browser-compact-arrival.py','--detail-realtime','--v1-route','--walk-wall-budget','3600','--output',str(q/name)]
assert args[:-1]==failed[0]['command'][:-1]
def unchanged():
 assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()==f['sourceCommit'];assert not subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True).strip();assert {n:sha(root/'dist'/n)for n in f['runtimeSourceHashes']}==f['runtimeSourceHashes'];assert sha(root/'outputs/Ranger-Kompakt.html')==f['htmlSHA256']
unchanged();context={'sourceCommit':f['sourceCommit'],'runtimeSourceHashes':f['runtimeSourceHashes'],'actualStandaloneHTMLSHA256':f['htmlSHA256'],'actualCommand':args,'role':'mandatory','startedUTC':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'retryReason':'Missing FFmpeg before game-page creation; exact same driver/options and assertions, fresh output path. System FFmpeg readiness separately verified.','originalFailureLog':failed[0]['log'],'encoderEvidence':'ffmpeg-environment/result.json'};dump(q/'contexts'/(name+'.json'),context);dump(q/'retry-run-status.json',{'status':'running','context':'contexts/'+name+'.json'});print('START',name,context['startedUTC'],flush=True);start=time.monotonic()
with(q/'logs'/(name+'.log')).open('w')as log:
 p=subprocess.Popen(args,cwd=root,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
 try:code=p.wait(timeout=7200)
 except subprocess.TimeoutExpired:
  os.killpg(p.pid,signal.SIGTERM)
  try:p.wait(timeout=10)
  except subprocess.TimeoutExpired:os.killpg(p.pid,signal.SIGKILL);p.wait()
  code=124
unchanged();row={'name':name,'role':'mandatory','passed':code==0,'exitCode':code,'seconds':round(time.monotonic()-start,3),'command':args,'log':'logs/'+name+'.log','context':'contexts/'+name+'.json'};r['checks'].append(row)
r['originalPlan']={'path':'main-plan-original-result.json','sha256':sha(q/'main-plan-original-result.json'),'processes':34,'passed':33,'failed':1,'unchangedFailedRow':failed[0]};r['resolutions']=[{'failedProcess':failed[0]['name'],'repeatProcess':name,'resolved':code==0,'cause':'Verified missing encoder, before opening the game page.','evidence':'ffmpeg-environment/result.json','originalFailurePreserved':True}]
r['softwareGatesPassed']=code==0 and all(x['passed']for x in r['checks']if x['role']=='mandatory' and x['name']!=failed[0]['name']);r['allProcessesPassed']=all(x['passed']for x in r['checks']);r['scope']+=' Actual initial34process plan is preserved unchanged in main-plan-original-result.json. A single missing-dependency startup was repeated after verified environment repair. Its FAIL row remains FAIL; softwareGatesPassed expresses the resolved mandatory contract, not an all-green process history.';dump(q/'result.json',r);dump(q/'retry-run-status.json',{'status':'completed','result':row,'softwareGatesPassed':r['softwareGatesPassed']});print(json.dumps(row),flush=True);sys.exit(code)
