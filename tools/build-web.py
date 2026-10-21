"""Static Pages build: exact active dependency closure, immutable hashed local media, no CDN."""
from pathlib import Path
import re, json, hashlib, zipfile, shutil, mimetypes
root=Path(__file__).resolve().parents[1]
dist=root/'evolutionswald/dist'
if not dist.exists():dist=root/'dist'
(root/'work').mkdir(exist_ok=True)
out=root/'outputs/GitHub-Pages'
order=[];visiting=set();visited=set()
def visit(name):
    if name in visited:return
    if name in visiting:raise ValueError('Circular module dependency: '+name)
    visiting.add(name)
    for ref in re.findall(r"from\s*['\"](\./[^'\"]+)['\"]",(dist/name).read_text()):
        visit((Path(name).parent/ref[2:].split('?')[0]).as_posix())
    visiting.remove(name);visited.add(name);order.append(name)
visit('expedition.js')
all_text='\n'.join((dist/name).read_text() for name in order)
asset_names=set(re.findall(r'\./assets/([a-zA-Z0-9_.-]+)',all_text))
assert len([a for a in asset_names if a.startswith('species-photo-')])==168
def digest(data):return hashlib.sha256(data).hexdigest()[:12]
files={};asset_paths={};module_paths={};original_bytes=0
for name in sorted(asset_names):
    data=(dist/'assets'/name).read_bytes();original_bytes+=len(data)
    path=Path(name);hashed=f'assets/{path.stem}-{digest(data)}{path.suffix}'
    files[hashed]=data;asset_paths[name]='./'+hashed
for name in order:
    source=(dist/name).read_text()
    for asset,url in asset_paths.items():source=source.replace('./assets/'+asset,url)
    def replace_import(match):
        dep=(Path(name).parent/match[2][2:].split('?')[0]).as_posix()
        assert dep in module_paths,dep
        return match[1]+'./'+Path(module_paths[dep]).name+match[3]
    source=re.sub(r"(from\s*['\"])(\./[^'\"]+)(['\"])",replace_import,source)
    data=source.encode();path='web/'+name.replace('/','-').replace('.js','')+'-'+digest(data)+'.js'
    module_paths[name]=path;files[path]=data
css=(dist/'field.css').read_bytes();css_path='web/field-'+digest(css)+'.css';files[css_path]=css
html=re.sub(r'href="field\.css(?:\?[^\"]*)?"',f'href="./{css_path}"',(dist/'index.html').read_text())
html=re.sub(r'src="expedition\.js(?:\?[^"]*)?"',f'src="./{module_paths["expedition.js"]}"',html)
files['index.html']=html.encode();files['Feldbuch.html']=html.encode()
files['icon.svg']=(dist/'icon.svg').read_bytes();files['.nojekyll']=b''
for name in ['SPECIES-PHOTOS.txt','BIRD-RECORDINGS.txt','attribution.json','WILDLIFE-MODELS.txt']:
    files['assets/'+name]=(dist/'assets'/name).read_bytes()
files['web/THREE-LICENSE.txt']=(dist/'vendor/THREE-LICENSE.txt').read_bytes()
guide=root/'work/VEROEFFENTLICHUNG.md'
if not guide.exists():guide=root/'VEROEFFENTLICHUNG.md'
files['README.md']=guide.read_bytes()
initial_asset_names=[n for n in asset_names if not n.startswith('species-photo-') and not n.endswith('.mp3')]
manifest={'version':'0.20','modules':module_paths,'assets':asset_paths,'files':{n:{'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}for n,b in files.items()},'totalBytes':sum(len(b)for b in files.values()),'initialUpperBoundBytes':sum(len(files[p])for p in module_paths.values())+len(css)+len(html.encode())+len(files['icon.svg'])+sum(len((dist/'assets'/n).read_bytes())for n in initial_asset_names),'deferredPhotographs':168,'deferredBirdRecordings':3,'largestFileBytes':max(map(len,files.values())),'networkOrigins':['same-origin; references open only on explicit click']}
# This folder is generated exclusively by this script; remove old hashes on rebuild.
if out.exists():shutil.rmtree(out)
for name,data in files.items():
    path=out/name;path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(data)
(root/'work/web-manifest-v020.json').write_text(json.dumps(manifest,indent=2)+'\n')
with zipfile.ZipFile(root/'outputs/Feldbuch-GitHub-Pages.zip','w',zipfile.ZIP_DEFLATED,compresslevel=7)as z:
    for name in sorted(files):z.writestr(name,files[name])
print(json.dumps({key:manifest[key]for key in ['version','totalBytes','initialUpperBoundBytes','deferredPhotographs','largestFileBytes']},indent=2))
