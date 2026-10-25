"""Ranger privacy/provenance gate, in addition to the independent template validator."""
import argparse,hashlib,json,re,sys,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'tools/scorm-template/scripts'))
from validate import validate_package
p=argparse.ArgumentParser();p.add_argument('zip');p.add_argument('--expected');p.add_argument('--report');a=p.parse_args()
result=validate_package(a.zip)
if a.expected:
 expected=Path(a.expected).read_bytes();actual=Path(a.zip).read_bytes()
 assert actual==expected,'Downloaded artifact bytes differ from the validated candidate'
 result['downloadedBytesEqual']=True
with zipfile.ZipFile(a.zip)as z:
 names=z.namelist();info=json.loads(z.read('__scorm/package-info.json'));html=z.read('index.html').decode()
 assert info['classroomMode']is True and info['trackingMode']=='ranger-session-only'
 assert info['classroomAdapter']=='web/storage-adapter.js'
 assert info['data_policy']=={'scores':False,'answers':False,'completion':False,'new_attempt_status':None}
 assert not any(n.startswith('.')or'/.'in n or n.endswith('.zip')or any(t in n.lower()for t in ['test-results','teacher','lehrkraefte','verification','screenshot','node_modules'])for n in names)
 assert 'index.html'in names and z.testzip()is None
 assert html.index('SCORM-CONTEXT-START')<html.index('type="module"')
 app_path=re.search(r'src="\./(web/ranger-[a-f0-9]+\.js)"',html)[1];app=z.read(app_path).decode()
 assert 'from "./storage-adapter.js"'in app
 adapter=z.read(info['classroomAdapter']).decode()
 assert adapter.index('if (classroomMode)')<adapter.index('host.localStorage')
 assert all(term not in app for term in ['localStorage','sessionStorage','indexedDB','document.cookie','navigator.serviceWorker','caches.open','Storage.prototype'])
 # Former teacher-only answers: these are not the student task/data/feedback contracts.
 for answer in ['5 / 0,27 ≈ 18,52 Individuen/m²','Lass eine fehlende Wasserflussmessung','Erwartung, Alternativen und Rückmeldung','START IM UNTERRICHT · 1 / 2']:
  assert answer not in app,('Teacher-only solution shipped',answer)
 decoded=re.sub(r'\\(?:u([0-9a-fA-F]{4})|x([0-9a-fA-F]{2}))',lambda m:chr(int(m[1]or m[2],16)),app)
 assert 'Sitzungsdaten werden dabei zurückgesetzt'in decoded
 result['rangerMode']='ranger-session-only';result['studentOnly']=True
prov=json.loads((ROOT/'tools/scorm-template/provenance.json').read_text())
for f in prov['files']:
 path=ROOT/'tools/scorm-template/upstream'/f['path'];assert hashlib.sha256(path.read_bytes()).hexdigest()==f['sha256'],str(path)
result['templateCommit']=prov['commit'];result['originalTemplateFilesUnchanged']=True;result['status']='BESTANDEN'
output=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
if a.report:Path(a.report).write_text(output)
print(output)
