"""Overlay the modified tool on a disposable checkout of the pinned reference.
Examples remain test-only, outside the Ranger source and student package.
"""
from pathlib import Path
import argparse,json,shutil,subprocess
p=argparse.ArgumentParser();p.add_argument('checkout');a=p.parse_args()
root=Path(__file__).resolve().parents[2];target=Path(a.checkout).resolve();template=root/'tools/scorm-template'
pin=json.loads((template/'provenance.json').read_text())['commit']
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=target,text=True).strip()==pin
for name in ['scripts','runtime','schemas','tests']:
 shutil.copytree(template/name,target/name,dirs_exist_ok=True)
for name in ['package.json','package-lock.json','requirements.txt','playwright.config.js','playwright.smoke.config.js','THIRD-PARTY-NOTICES.txt']:
 shutil.copyfile(template/name,target/name)
print('Reference fixture at pinned upstream commit; original standard tests preserved; modified infrastructure overlaid.')
