"""Verify source/media closure, hashes, reference substitution, pixels and ZIP."""
from pathlib import Path
from PIL import Image,ImageChops
import argparse,hashlib,json,posixpath,re,zipfile
from module_graph import ModuleGraph
root=Path(__file__).resolve().parents[1];dist=root/'dist'
parser=argparse.ArgumentParser();parser.add_argument('--web',default=str(root/'outputs/GitHub-Pages'));parser.add_argument('--zip',default=str(root/'outputs/Feldbuch-GitHub-Pages.zip'));args=parser.parse_args()
web=Path(args.web);m=json.loads((web/'build-manifest.json').read_text());graph=ModuleGraph(dist)
assert m['schemaVersion']==2 and m['version']==json.loads((root/'package.json').read_text())['version']
assert set(m['modules'])==set(graph.modules),'Module manifest differs from source graph'
assert set(m['assets'])==graph.assets,'Asset manifest differs from source graph'
expected=set(m['files'])|{'build-manifest.json'}
assert {p.relative_to(web).as_posix()for p in web.rglob('*')if p.is_file()}==expected,'Unexpected or missing release file'
for name,meta in m['files'].items():
    path=web/name;assert path.resolve().is_relative_to(web.resolve()) and not path.is_symlink(),name
    data=path.read_bytes();assert len(data)==meta['bytes'] and hashlib.sha256(data).hexdigest()==meta['sha256'],name
    assert len(data)<25*1024*1024,name
for name,path in m['modules'].items():
    text=(web/path).read_text();assert '/Users/' not in text and 'asset://' not in text.replace("'asset://'",''),name
    def replace(ref):
        if ref.target in m['modules']:return './'+m['modules'][ref.target] if ref.mode=='worker' else './'+Path(m['modules'][ref.target]).name
        return '../'+m['assets'][ref.target][2:] if ref.mode=='url' else m['assets'][ref.target]
    assert text==graph.rewrite(name,replace),name
    for ref in graph.references[name]:
        target=replace(ref)
        base=posixpath.dirname(path) if ref.mode in ['url','module'] else ''
        assert (web/posixpath.normpath(posixpath.join(base,target))).is_file(),(name,target)
for name,url in m['assets'].items():assert (web/url[2:]).read_bytes()==(dist/name).read_bytes(),name
assert m['deferredPhotographs']==sum(Path(n).name.startswith('species-photo-')for n in graph.assets)
assert m['deferredBirdRecordings']==sum(n.endswith('.mp3')for n in graph.assets)
html=(web/'index.html').read_text();assert html==(web/'Feldbuch.html').read_text()
assert 'src="./'+m['modules']['expedition.js']+'"' in html
for ref in re.findall(r'(?:src|href)="(\./[^"#?]+)',html):assert (web/ref[2:]).is_file(),ref
assert (web/'.nojekyll').is_file()
for r in json.loads((root/'tests/fixtures/texture-compression-v018.json').read_text()):
    with Image.open(dist/'assets'/(r['name']+'.png'))as a,Image.open(dist/'assets'/(r['name']+'.webp'))as b:
        assert a.size==b.size and all(c.getbbox()is None for c in ImageChops.difference(a.convert('RGBA'),b.convert('RGBA')).split()),r['name']
with zipfile.ZipFile(args.zip)as z:
    assert z.testzip()is None and set(z.namelist())==expected
    for name in z.namelist():assert z.read(name)==(web/name).read_bytes(),name
result={k:m[k]for k in ['version','sourceCommit','sourceDirty','totalBytes','initialUpperBoundBytes','deferredPhotographs','deferredBirdRecordings','largestFileBytes']}
result.update({'modules':len(m['modules']),'assets':len(m['assets']),'exactSourceAndAssets':True,'zipVerified':True,'identicalTexturePixels':True,'referenceClosure':True})
(root/'work/web-verification-v020.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
