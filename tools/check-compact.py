"""Run compact regressions with separate logs and honest process exit statuses."""
from pathlib import Path
import subprocess,json,time,argparse,sys
p=argparse.ArgumentParser();p.add_argument('--output',default='work/compact-regressions');a=p.parse_args();root=Path(__file__).resolve().parents[1];out=root/a.output;out.mkdir(parents=True,exist_ok=True);rows=[]
for name in ['kompakt','compact-learning','compact-growth-boundary','compact-observation-context','compact-event-reference','compact-render-reset','compact-qa','compact-coastal','compact-habitat','compact-habitat-revision','compact-pedagogy','compact-material-depth']:
 start=time.monotonic();command=['node',str(root/'tests'/(name+'-check.mjs'))]
 if name in ['compact-coastal','compact-habitat','compact-habitat-revision','compact-pedagogy','compact-material-depth','compact-observation-context','compact-event-reference','compact-render-reset']:command.append(str(out/name))
 with (out/(name+'.log')).open('w')as log:
  try:r=subprocess.run(command,cwd=root,stdout=log,stderr=subprocess.STDOUT,timeout=300);code=r.returncode
  except subprocess.TimeoutExpired:code=124
 row={'name':name,'exitCode':code,'passed':code==0,'seconds':round(time.monotonic()-start,2),'log':name+'.log'};rows.append(row);print(json.dumps(row),flush=True)
summary={'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'sourceDirty':bool(subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True).strip()),'node':subprocess.check_output(['node','--version'],text=True).strip(),'passed':all(r['passed']for r in rows),'checks':rows};(out/'result.json').write_text(json.dumps(summary,indent=2)+'\n');sys.exit(0 if summary['passed']else 1)
