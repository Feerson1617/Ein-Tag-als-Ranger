"""Separate, closed compact graph. Never rewrites the legacy entry or deploys."""
from pathlib import Path
import base64,hashlib,json,mimetypes,re,subprocess,zipfile,shutil
from module_graph import ModuleGraph
root=Path(__file__).resolve().parents[1];dist=root/'dist';graph=ModuleGraph(dist,'compact/main.js')
blocked={'biodiversity.js','habitat-world.js','expedition-state.js','wildlife.js','authored-wildlife.js','interaction-scenarios.js','quest-interface.js'}
if blocked.intersection(graph.modules):raise ValueError('Legacy runtime leaked into compact graph: '+str(blocked.intersection(graph.modules)))
if graph.assets!={'assets/compact-roe-deer.glb','assets/wildlife-fox.glb','assets/terrain-atlas.webp','assets/sky-panorama.webp','assets/boardwalk-wood.webp'}:raise ValueError('Unexpected compact media: '+str(graph.assets))
sha=lambda b:hashlib.sha256(b).hexdigest()
files={};modules={};assets={}
for name in sorted(graph.assets):
 data=(dist/name).read_bytes();p=Path(name);target='assets/'+p.stem+'-'+sha(data)[:12]+p.suffix;files[target]=data;assets[name]='./'+target
for name in graph.modules:
 def replace(ref):
  if ref.target in modules:return './'+Path(modules[ref.target]).name
  return assets[ref.target] if ref.mode=='document' else '../'+assets[ref.target][2:]
 data=graph.rewrite(name,replace).encode();target='web/'+name.replace('/','-').rsplit('.',1)[0]+'-'+sha(data)[:12]+'.js';files[target]=data;modules[name]=target
css=(dist/'compact/style.css').read_bytes();csspath='web/compact-'+sha(css)[:12]+'.css';files[csspath]=css
html=(dist/'kompakt.html').read_text().replace('href="compact/style.css"',f'href="./{csspath}"').replace('src="compact/main.js"',f'src="./{modules["compact/main.js"]}"')
files['MATERIALS.json']=(json.dumps({'source':'dist/assets/attribution.json','assets':[a for a in json.loads((dist/'assets/attribution.json').read_text())['assets'] if 'terrain-atlas.png' in a.get('files',[])],'deer':json.loads((root/'docs/kompakt/REH-ASSET.json').read_text()),'selectedExistingFox':{'file':'assets/wildlife-fox.glb','sha256':sha((dist/'assets/wildlife-fox.glb').read_bytes()),'canonicalMetadata':json.loads((root/'assets/vendor/wildlife-fox/metadata.json').read_text()),'source':'existing first-party Blender export; tools/author-wildlife-v020.py; unchanged file'}},ensure_ascii=False,indent=2)+'\n').encode();files['index.html']=html.encode();files['icon.svg']=(dist/'icon.svg').read_bytes();files['.nojekyll']=b'';files['THREE-LICENSE.txt']=(dist/'vendor/THREE-LICENSE.txt').read_bytes()
for name in ['STATUS.md','MODELLGRENZEN.md','QUELLEN-UND-RECHTE.md','TESTS.md']: 
 if (root/'docs/kompakt'/name).is_file():files[name]=(root/'docs/kompakt'/name).read_bytes()
commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip();dirty=bool(subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True).strip())
manifest={'schemaVersion':1,'edition':'compact','stage':6,'sourceCommit':commit,'sourceDirty':dirty,'entry':'compact/main.js','modules':modules,'assets':assets,'files':{n:{'bytes':len(b),'sha256':sha(b)}for n,b in files.items()},'totalBytes':sum(map(len,files.values())),'initialUpperBoundBytes':sum(map(len,files.values())),'excludedLegacyModules':sorted(blocked),'networkOrigins':['same-origin'],'status':'complete software preview; physical device and classroom validation outstanding'}
stamp=f'<meta name="compact-build" content="{commit}; dirty={str(dirty).lower()}">';files['index.html']=files['index.html'].replace(b'</head>',stamp.encode()+b'</head>');manifest['files']['index.html']={'bytes':len(files['index.html']),'sha256':sha(files['index.html'])};manifest['totalBytes']=manifest['initialUpperBoundBytes']=sum(map(len,files.values()))
files['build-manifest.json']=(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n').encode()
out=root/'outputs/Ranger-Kompakt';out.parent.mkdir(exist_ok=True)
if out.exists():shutil.rmtree(out)
for name,data in files.items():p=out/name;p.parent.mkdir(exist_ok=True,parents=True);p.write_bytes(data)
with zipfile.ZipFile(root/'outputs/Ranger-Kompakt-Vorschau.zip','w',zipfile.ZIP_DEFLATED,compresslevel=7)as z:
 for name,data in sorted(files.items()):z.writestr(zipfile.ZipInfo(name,date_time=(1980,1,1,0,0,0)),data,compress_type=zipfile.ZIP_DEFLATED,compresslevel=7)
# Standalone uses the exact same closure and local GLB, with no remote requests.
sources={n:graph.rewrite(n,lambda ref:('module://'if ref.target in graph.modules else'asset://')+ref.target) for n in graph.modules}
asset_data={n:{'mime':mimetypes.guess_type(n)[0]or'model/gltf-binary','data':base64.b64encode((dist/n).read_bytes()).decode()}for n in sorted(graph.assets)}
bootstrap='const sources='+json.dumps(sources,ensure_ascii=False).replace('<','\\u003c')+',assets='+json.dumps(asset_data)+r''',urls={},assetUrls={};
for(const [name,a]of Object.entries(assets)){const b=Uint8Array.from(atob(a.data),c=>c.charCodeAt(0));assetUrls[name]=URL.createObjectURL(new Blob([b],{type:a.mime}));}
for(const [name,text]of Object.entries(sources)){const code=text.replace(/asset:\/\/([a-zA-Z0-9_./-]+)/g,(_,n)=>assetUrls[n]).replace(/module:\/\/([a-zA-Z0-9_./-]+)/g,(_,n)=>{if(!urls[n])throw Error('Fehlendes Modul: '+n);return urls[n];});urls[name]=URL.createObjectURL(new Blob([code],{type:'text/javascript'}));}
import(urls['compact/main.js']).catch(e=>{console.error(e);document.getElementById('loading').textContent='Die Kompaktvorschau konnte nicht gestartet werden.';});
'''
standalone=(dist/'kompakt.html').read_text().replace('<link rel="stylesheet" href="compact/style.css">','<style>'+css.decode()+'</style>').replace('href="icon.svg"','href="data:image/svg+xml;base64,'+base64.b64encode(files['icon.svg']).decode()+'"').replace('<script type="module" src="compact/main.js"></script>','<script type="module">'+bootstrap+'</script>')
standalone=standalone.replace('</head>',stamp+'</head>');(root/'outputs/Ranger-Kompakt.html').write_text(standalone)
print(json.dumps({'sourceCommit':commit,'sourceDirty':dirty,'modules':len(modules),'assets':list(assets),'initialUpperBoundBytes':manifest['initialUpperBoundBytes'],'zipBytes':(root/'outputs/Ranger-Kompakt-Vorschau.zip').stat().st_size,'standaloneBytes':len(standalone.encode())},indent=2))
