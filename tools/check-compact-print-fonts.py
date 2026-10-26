"""Real A4 regression for generic OS font variation, with original overflow witness.
Only CSS's generic system-ui fallback is substituted; content, sizes, line
heights, margins and assertions remain unchanged. The unmodified documents are
also printed by print-compact-materials.py. This is not a claimed macOS run.
"""
from pathlib import Path
import argparse,hashlib,importlib.util,json,re,shutil,subprocess,unicodedata
from html.parser import HTMLParser
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--input-dir',type=Path,default=root/'outputs/Ranger-Kompakt-Lernpaket');p.add_argument('--output',type=Path,required=True);a=p.parse_args();a.output.mkdir(parents=True,exist_ok=False)
spec=importlib.util.spec_from_file_location('material_audit',root/'tools/audit-compact-materials.py');audit=importlib.util.module_from_spec(spec);spec.loader.exec_module(audit)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
class BodyText(HTMLParser):
 def __init__(self):super().__init__();self.body=False;self.parts=[]
 def handle_starttag(self,tag,attrs):
  if tag=='body':self.body=True
 def handle_endtag(self,tag):
  if tag=='body':self.body=False
 def handle_data(self,value):
  if self.body and value.strip():self.parts.append(value.strip())
normalize=lambda s:re.sub(r'\s+','',unicodedata.normalize('NFKC',s)).replace('\u00ad','')
r={'passed':False,'scope':__doc__,'profiles':[],'sourceHTMLHashes':{},'baseline':{}}
def save():(a.output/'result.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
with sync_playwright()as pw:
 opts={'headless':True}
 if shutil.which('chromium'):opts.update(executable_path=shutil.which('chromium'),args=['--no-sandbox'])
 browser=pw.chromium.launch(**opts);r['browserVersion']=browser.version
 try:
  def render(source,target,family):
   raw=source.read_text();page=browser.new_page(viewport={'width':680,'height':1009});page.set_content(raw.replace('system-ui','"'+family+'"'));page.emulate_media(media='print');page.evaluate('document.fonts.ready')
   cdp=page.context.new_cdp_session(page);cdp.send('DOM.enable');cdp.send('CSS.enable');doc=cdp.send('DOM.getDocument');node=cdp.send('DOM.querySelector',{'nodeId':doc['root']['nodeId'],'selector':'p'});fonts=cdp.send('CSS.getPlatformFontsForNode',{'nodeId':node['nodeId']})['fonts']
   page.pdf(path=str(target),format='A4',print_background=True,prefer_css_page_size=True,margin={k:'15mm'for k in('top','bottom','left','right')});page.close();info=subprocess.check_output(['pdfinfo',str(target)],text=True);return int(re.search(r'^Pages:\s+(\d+)',info,re.M).group(1)),fonts
  baseline=root/'tests/fixtures/compact-starter-system-ui-before.html'
  assert sha(baseline)=='4e9b8920543bf1ce61846727b3d1d75de7a5cdef0a2e9bf75d479e567b10d5ff','Original failing fixture changed'
  pages,fonts=render(baseline,a.output/'baseline-three-pages.pdf','DejaVu Sans');r['baseline']={'sha256':sha(baseline),'sourceCommit':'c5baa84f5bc5df099d9773bc7037b5a5f570a759','pages':pages,'fonts':fonts,'scope':'Known original3-page overflow, not a successful2-page document'};save();assert pages==3,r['baseline'];assert any(f['familyName']=='DejaVu Sans'for f in fonts),'Install fonts-dejavu-core to reproduce the actual font profile'
  for family in('DejaVu Sans','Arial'):
   out=a.output/family.replace(' ','-');out.mkdir();row={'genericSystemUIFont':family,'documents':[]};r['profiles'].append(row)
   for name in('Arbeitsblaetter','Lehrkraefte','START-IM-UNTERRICHT','PFAD-A-Artenliste','PFAD-B-Kuestenvoegel'):
    source=a.input_dir/(name+'.html');r['sourceHTMLHashes'][name]=sha(source);pdf=out/(name+'.pdf');pages,fonts=render(source,pdf,family);item={'name':name,'pages':pages,'fonts':fonts,'sha256':sha(pdf)};row['documents'].append(item);save()
    if name in('Arbeitsblaetter','Lehrkraefte'):
     result=audit.audit_document(pdf,source,out/'audit');assert result['passed'],result['findings']
    else:
     assert pages==2,(family,name,pages,'Short guide/path must remain two A4 pages')
     parser=BodyText();parser.feed(source.read_text());text=subprocess.check_output(['pdftotext','-layout',str(pdf),'-'],text=True);missing=[part for part in parser.parts if normalize(part)not in normalize(text)];assert not missing,(name,missing)
    item['passed']=True;save()
   print(json.dumps({'fontProfile':family,'pages':{x['name']:x['pages']for x in row['documents']},'passed':True}),flush=True)
  r['passed']=True;save()
 finally:save();browser.close()
