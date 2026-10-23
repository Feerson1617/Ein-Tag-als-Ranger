from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import subprocess, time, json, os, argparse
root=Path(__file__).resolve().parents[1]
(root/'work').mkdir(exist_ok=True)
import shutil
node=shutil.which('node')
if not node: raise SystemExit('Node.js fehlt: node muss im PATH verfügbar sein (getestet: 24.19.0).')
parser=argparse.ArgumentParser(description='Vorhandene Prüfreihen mit Fehlerstatus und Zeitlimit ausführen.')
parser.add_argument('--workers',type=int,default=3)
parser.add_argument('--timeout',type=int,default=300)
args=parser.parse_args()
if args.workers<1 or args.timeout<1: parser.error('workers und timeout müssen positiv sein')
started=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())
names=['factor','sim','regional-evolution','behavior','living-world','ranger','scenario','field','quest','live-experiment','world','observation','coast-performance','locomotion','route-birds','village-barrier','ranger-usability','compact-world','fidelity','web-performance','render-retention','avian-anatomy','ranger-session','authored-wildlife','evidence-regression','catalogue-audit','learning-missions','mission-runtime']
def run(name):
    start=time.monotonic()
    output=root/('work/final-check-output.txt' if name=='field' else f'work/{name}-check-output.txt')
    error=root/f'work/{name}-check-errors.txt'
    with output.open('w') as out, error.open('w') as err:
        try:
            result=subprocess.run([node,str(root/f'tests/{name}-check.mjs')],stdout=out,stderr=err,cwd=root,timeout=args.timeout)
            code=result.returncode
        except subprocess.TimeoutExpired:
            err.write(f'Zeitlimit nach {args.timeout} Sekunden überschritten.\n'); code=124
    return {'check':name,'passed':code==0,'exitCode':code,'seconds':round(time.monotonic()-start,1),'error':error.read_text()[:2400] if code else ''}
with ThreadPoolExecutor(max_workers=args.workers) as pool:
    results=[]
    for f in as_completed([pool.submit(run,name) for name in names]):
        result=f.result();results.append(result);print(json.dumps(result),flush=True)
(root/'work/v020-check-summary.json').write_text(json.dumps(results,indent=2)+'\n')
(root/'work/check-run.json').write_text(json.dumps({'startedAt':started,'commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'node':subprocess.check_output([node,'--version'],text=True).strip(),'python':os.sys.version,'results':results},indent=2)+'\n')
if not all(r['passed'] for r in results):raise SystemExit(1)
