"""Print local first-party worksheets; no external assets or publication."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import hashlib,json,shutil,subprocess,zipfile
root=Path(__file__).resolve().parents[1]
subprocess.run(['node',str(root/'tools/build-compact-materials.mjs')],cwd=root,check=True)
out=root/'outputs/Ranger-Kompakt-Lernpaket'
with sync_playwright()as pw:
 options={'headless':True}
 if shutil.which('chromium'):options.update(executable_path=shutil.which('chromium'),args=['--no-sandbox'])
 browser=pw.chromium.launch(**options)
 for name in ['Arbeitsblaetter','Lehrkraefte']:
  page=browser.new_page();requests=[];page.on('request',lambda r:requests.append(r.url));page.goto((out/(name+'.html')).as_uri());assert len(page.locator('article').all())==25;assert not any(url.startswith('http')for url in requests);page.pdf(path=str(out/(name+'.pdf')),format='A4',print_background=True,margin={'top':'15mm','bottom':'15mm','left':'15mm','right':'15mm'});page.close()
 browser.close()
info=json.loads((out/'build-info.json').read_text());info['sourceCommit']=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip();info['sourceDirty']=bool(subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True).strip())
for name in ['Arbeitsblaetter.pdf','Lehrkraefte.pdf']:
 data=(out/name).read_bytes();info['files'][name]={'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
(out/'build-info.json').write_text(json.dumps(info,ensure_ascii=False,indent=2)+'\n')
with zipfile.ZipFile(root/'outputs/Ranger-Kompakt-Lernpaket.zip','w',zipfile.ZIP_DEFLATED)as archive:
 for p in sorted(out.iterdir()):archive.write(p,p.name)
print(json.dumps({'htmlDocuments':2,'pdfDocuments':2,'cardsPerDocument':25,'output':str(out)}))
