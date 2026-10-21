"""Fail closed on changed/missing files and any drift from the compact source graph."""
from pathlib import Path
import argparse,hashlib,json,zipfile
from module_graph import ModuleGraph
root=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--web',type=Path,default=root/'outputs/Ranger-Kompakt');a=p.parse_args()
m=json.loads((a.web/'build-manifest.json').read_text());graph=ModuleGraph(root/'dist','compact/main.js')
assert m['edition']=='compact' and m['stage']==2
assert set(m['modules'])==set(graph.modules) and set(m['assets'])==graph.assets
actual={p.relative_to(a.web).as_posix()for p in a.web.rglob('*')if p.is_file()}
assert actual==set(m['files'])|{'build-manifest.json'},'Unexpected/missing files'
for name,record in m['files'].items():
 data=(a.web/name).read_bytes();assert len(data)==record['bytes'] and hashlib.sha256(data).hexdigest()==record['sha256'],name
for name,target in m['assets'].items():assert (a.web/target[2:]).read_bytes()==(root/'dist'/name).read_bytes(),name
for name,target in m['modules'].items():
 def replace(ref):
  if ref.target in m['modules']:return './'+Path(m['modules'][ref.target]).name
  return m['assets'][ref.target]if ref.mode=='document'else'../'+m['assets'][ref.target][2:]
 assert (a.web/target).read_text()==graph.rewrite(name,replace),name
print(json.dumps({'verified':True,'modules':len(graph.modules),'assets':sorted(graph.assets),'bytes':m['totalBytes'],'sourceCommit':m['sourceCommit'],'sourceDirty':m['sourceDirty']}))
