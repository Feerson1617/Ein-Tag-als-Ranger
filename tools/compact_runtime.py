"""Check that the delivered HTML embeds this exact runtime closure and media."""
from pathlib import Path
import base64,json,re,hashlib
from module_graph import ModuleGraph

def audit_standalone(root:Path,path:Path):
 text=path.read_text();code=re.search(r'<script type="module">([\s\S]*)</script>',text)[1];decoder=json.JSONDecoder();sources,_=decoder.raw_decode(code.split('const sources=',1)[1]);assets,_=decoder.raw_decode(code.split(',assets=',1)[1]);g=ModuleGraph(root/'dist','compact/main.js')
 assert set(sources)==set(g.modules),'Standalone module closure differs'
 assert set(assets)==g.assets,'Standalone asset closure differs'
 for name in g.modules:assert sources[name]==g.rewrite(name,lambda r:('module://'if r.target in g.modules else'asset://')+r.target),'Stale standalone module: '+name
 for name,a in assets.items():assert base64.b64decode(a['data'])==(root/'dist'/name).read_bytes(),'Stale standalone media: '+name
 assert re.search(r'<style>([\s\S]*?)</style>',text)[1]==(root/'dist/compact/style.css').read_text(),'Stale standalone CSS'
 return {'modules':len(sources),'assets':len(assets),'htmlSHA256':hashlib.sha256(path.read_bytes()).hexdigest(),'exactRuntimeClosure':True}
