from pathlib import Path
import argparse,hashlib,json,re,zipfile
parser=argparse.ArgumentParser();parser.add_argument('--qa',required=True);args=parser.parse_args();root=Path(__file__).resolve().parents[2];qa=root/args.qa;freeze=json.loads((qa/'runtime-freeze.json').read_text());report={'sourceCommit':freeze['sourceCommit'],'scope':'Actual web/learning allowlist, source archive inventory and recognizable credential signatures; not proof against every possible secret or an independent license/legal audit. Existing synthetic QA fixtures are not real pupil records.','checks':[]}
web=root/'outputs/Ranger-Kompakt';m=json.loads((web/'build-manifest.json').read_text());actual={str(p.relative_to(web))for p in web.rglob('*')if p.is_file()};assert actual==set(m['files'])|{'build-manifest.json'}
lesson=root/'outputs/Ranger-Kompakt-Lernpaket';l=json.loads((lesson/'build-info.json').read_text());assert {p.name for p in lesson.iterdir()if p.is_file()}==set(l['files'])|{'build-info.json'};assert set(p.name for p in lesson.glob('*.pdf'))=={'Arbeitsblaetter.pdf','Lehrkraefte.pdf','START-IM-UNTERRICHT.pdf','PFAD-A-Artenliste.pdf','PFAD-B-Kuestenvoegel.pdf'}
assert (web/'THREE-LICENSE.txt').is_file()and (web/'MATERIALS.json').is_file();assert (lesson/'QUELLEN-UND-RECHTE.md').is_file();report['checks'].append('Closed web/learning inventories; exactly five own PDFs; existing Three license and asset/source attribution retained')
patterns=[rb'-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----',rb'gh[pousr]_[A-Za-z0-9]{30,}',rb'AKIA[A-Z0-9]{16}'];badnames=re.compile(r'(^|/)(?:\.env(?:\.[^/]*)?|credentials|id_rsa|Cookies|Login Data|private-zoom-profile)(?:/|$)',re.I);checked=0;hashes={}
for folder in [web,lesson]:
 for p in folder.rglob('*'):
  if not p.is_file():continue
  name=str(p.relative_to(root));raw=p.read_bytes();assert not badnames.search(name),name;assert not any(re.search(pattern,raw)for pattern in patterns),'Credential signature in '+name;checked+=1;hashes[name]=hashlib.sha256(raw).hexdigest()
source=root/'outputs/Feldbuch-Projekt.zip'
with zipfile.ZipFile(source)as z:
 assert z.testzip()is None
 for name in z.namelist():
  assert not badnames.search(name),name
  assert not name.startswith(('.git/','work/','outputs/','.venv/','node_modules/')),name
  assert not any(re.search(pattern,z.read(name))for pattern in patterns),'Credential signature in source path '+name
 report['checks'].append('Actual source ZIP integrity and inventory: no Git internals, work outputs, dependencies, browser profiles or recognizable private keys/tokens')
 report['sourceArchive']={'files':len(z.namelist()),'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'sourceCommit':json.loads(z.read('PROJECT-MANIFEST.json'))['sourceCommit']}
report.update(passed=True,publicFilesChecked=checked,publicHashes=hashes);(qa/'public-content-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'passed':True,'publicFilesChecked':checked,'sourceFiles':report['sourceArchive']['files']}))
