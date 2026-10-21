"""Package the active graph with immutable names, attribution and an integrity manifest."""
from pathlib import Path
import hashlib,json,re,shutil,subprocess,zipfile
from module_graph import ModuleGraph
root=Path(__file__).resolve().parents[1];dist=root/'dist';graph=ModuleGraph(dist)
(root/'work').mkdir(exist_ok=True);out=root/'outputs/GitHub-Pages'
digest=lambda data:hashlib.sha256(data).hexdigest()
files={};assets={};modules={}
for name in sorted(graph.assets):
    data=(dist/name).read_bytes();p=Path(name);target=f'assets/{p.stem}-{digest(data)[:12]}{p.suffix}'
    if target in files and files[target]!=data:raise ValueError('Asset name collision: '+name)
    files[target]=data;assets[name]='./'+target
for name in graph.modules:
    def replace(ref):
        if ref.target in modules:return './'+modules[ref.target] if ref.mode=='worker' else './'+Path(modules[ref.target]).name
        return '../'+assets[ref.target][2:] if ref.mode=='url' else assets[ref.target]
    data=graph.rewrite(name,replace).encode();path='web/'+name.replace('/','-').rsplit('.',1)[0]+'-'+digest(data)[:12]+'.js'
    modules[name]=path;files[path]=data
css=(dist/'field.css').read_bytes();css_path='web/field-'+digest(css)[:12]+'.css';files[css_path]=css
html=re.sub(r'href="field\.css(?:\?[^\"]*)?"',f'href="./{css_path}"',(dist/'index.html').read_text())
html=re.sub(r'src="expedition\.js(?:\?[^"]*)?"',f'src="./{modules["expedition.js"]}"',html)
files['index.html']=html.encode();files['Feldbuch.html']=html.encode()
files['icon.svg']=(dist/'icon.svg').read_bytes();files['.nojekyll']=b''
for name in ['SPECIES-PHOTOS.txt','BIRD-RECORDINGS.txt','attribution.json','WILDLIFE-MODELS.txt']:files['assets/'+name]=(dist/'assets'/name).read_bytes()
files['web/THREE-LICENSE.txt']=(dist/'vendor/THREE-LICENSE.txt').read_bytes()
for source,target in [('docs/SPIELHINWEISE.md','README.md'),('docs/LEHRKRAEFTE.md','LEHRKRAEFTE.md'),('docs/MODELLGRENZEN.md','MODELLGRENZEN.md')]:files[target]=(root/source).read_bytes()
initial_assets=[n for n in graph.assets if not Path(n).name.startswith('species-photo-') and not n.endswith('.mp3')]
manifest={'schemaVersion':2,'version':json.loads((root/'package.json').read_text())['version'],
 'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),
 'sourceDirty':bool(subprocess.check_output(['git','status','--porcelain','--untracked-files=normal'],cwd=root,text=True).strip()),
 'modules':modules,'assets':assets,'files':{n:{'bytes':len(data),'sha256':digest(data)}for n,data in files.items()},
 'totalBytes':sum(map(len,files.values())),
 'initialUpperBoundBytes':sum(len(files[path])for path in modules.values())+len(css)+len(html.encode())+len(files['icon.svg'])+sum((dist/n).stat().st_size for n in initial_assets),
 'deferredPhotographs':sum(Path(n).name.startswith('species-photo-')for n in graph.assets),
 'deferredBirdRecordings':sum(n.endswith('.mp3')for n in graph.assets),'largestFileBytes':max(map(len,files.values())),
 'networkOrigins':['same-origin; references open only on explicit click']}
manifest_data=(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n').encode();files['build-manifest.json']=manifest_data
# The manifest does not recursively hash itself. Every other release file is declared.
staging=out.with_name('GitHub-Pages.staging')
if staging.exists():shutil.rmtree(staging)
for name,data in files.items():
    path=staging/name;path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(data)
if out.exists():shutil.rmtree(out) # Generated output only; never delete dist/.
staging.rename(out);(root/'work/web-manifest-v020.json').write_bytes(manifest_data)
with zipfile.ZipFile(root/'outputs/Feldbuch-GitHub-Pages.zip','w',zipfile.ZIP_DEFLATED,compresslevel=7)as z:
    for name in sorted(files):z.writestr(zipfile.ZipInfo(name,date_time=(1980,1,1,0,0,0)),files[name],compress_type=zipfile.ZIP_DEFLATED,compresslevel=7)
print(json.dumps({key:manifest[key]for key in ['version','sourceCommit','sourceDirty','totalBytes','initialUpperBoundBytes','deferredPhotographs','largestFileBytes']},indent=2))
