"""Fail closed on changed/missing files and any drift from the compact source graph."""
from pathlib import Path
import argparse,hashlib,json,zipfile
from module_graph import ModuleGraph
root=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--web',type=Path,default=root/'outputs/Ranger-Kompakt');a=p.parse_args()
m=json.loads((a.web/'build-manifest.json').read_text());graph=ModuleGraph(root/'dist','compact/main.js')
assert m['edition']=='compact' and m['stage']==6
assert set(m['modules'])==set(graph.modules) and set(m['assets'])==graph.assets
actual={p.relative_to(a.web).as_posix()for p in a.web.rglob('*')if p.is_file()}
assert actual==set(m['files'])|{'build-manifest.json'},'Unexpected/missing files'
for name,record in m['files'].items():
 data=(a.web/name).read_bytes();assert len(data)==record['bytes'] and hashlib.sha256(data).hexdigest()==record['sha256'],name
css=[n for n in m['files']if n.endswith('.css')];assert len(css)==1;assert (a.web/css[0]).read_bytes()==(root/'dist/compact/style.css').read_bytes(),'CSS source drift'
import re
expected=(root/'dist/kompakt.html').read_text().replace('href="compact/style.css"',f'href="./{css[0]}"').replace('src="compact/main.js"',f'src="./{m["modules"]["compact/main.js"]}"')
assert re.sub(r'<meta name="compact-build"[^>]*>','',(a.web/'index.html').read_text())==expected,'HTML source drift'
for name,target in m['assets'].items():assert (a.web/target[2:]).read_bytes()==(root/'dist'/name).read_bytes(),name
for name,target in m['modules'].items():
 def replace(ref):
  if ref.target in m['modules']:return './'+Path(m['modules'][ref.target]).name
  return m['assets'][ref.target]if ref.mode=='document'else'../'+m['assets'][ref.target][2:]
 assert (a.web/target).read_text()==graph.rewrite(name,replace),name
print(json.dumps({'verified':True,'modules':len(graph.modules),'assets':sorted(graph.assets),'bytes':m['totalBytes'],'sourceCommit':m['sourceCommit'],'sourceDirty':m['sourceDirty']}))
