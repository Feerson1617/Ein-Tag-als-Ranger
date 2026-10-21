from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import subprocess, time, json
root=Path(__file__).resolve().parents[1]
(root/'work').mkdir(exist_ok=True)
import shutil
node=shutil.which('node') or '/Users/tobi/Documents/Codex/Tools/bin/node'
names=['regional-evolution','behavior','living-world','ranger','scenario','field','quest','live-experiment','world','observation','coast-performance','locomotion','route-birds','village-barrier','ranger-usability','compact-world','fidelity','web-performance','render-retention','avian-anatomy','ranger-session','authored-wildlife']
def run(name):
    start=time.monotonic()
    output=root/('work/final-check-output.txt' if name=='field' else f'work/{name}-check-output.txt')
    error=root/f'work/{name}-check-errors.txt'
    with output.open('w') as out, error.open('w') as err:
        result=subprocess.run([node,str(root/f'tests/{name}-check.mjs')],stdout=out,stderr=err,cwd=root)
    return {'check':name,'passed':result.returncode==0,'seconds':round(time.monotonic()-start,1),'error':error.read_text()[:2400] if result.returncode else ''}
with ThreadPoolExecutor(max_workers=3) as pool:
    results=[]
    for f in as_completed([pool.submit(run,name) for name in names]):
        result=f.result();results.append(result);print(json.dumps(result),flush=True)
(root/'work/v020-check-summary.json').write_text(json.dumps(results,indent=2)+'\n')
if not all(r['passed'] for r in results):raise SystemExit(1)
