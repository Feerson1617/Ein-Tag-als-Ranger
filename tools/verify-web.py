from pathlib import Path
from PIL import Image, ImageChops
import json,re,hashlib,zipfile
root=Path(__file__).resolve().parents[1];web=root/'outputs/GitHub-Pages';dist=root/'evolutionswald/dist'
if not dist.exists():dist=root/'dist'
m=json.loads((root/'work/web-manifest-v020.json').read_text())
for name,meta in m['files'].items():
    data=(web/name).read_bytes();assert len(data)==meta['bytes'] and hashlib.sha256(data).hexdigest()==meta['sha256'],name
    assert len(data)<25*1024*1024,name
for name,path in m['modules'].items():
    text=(web/path).read_text();assert '/Users/' not in text and 'asset://' not in text.replace("'asset://'",''),name
    for dep in re.findall(r"from\s*['\"](\./[^'\"]+)['\"]",text):assert (web/path).parent.joinpath(dep[2:]).is_file(),(name,dep)
    for asset in re.findall(r'\./assets/([a-zA-Z0-9_.-]+)',text):assert (web/'assets'/asset).is_file(),(name,asset)
for name,url in m['assets'].items():assert (web/url[2:]).read_bytes()==(dist/'assets'/name).read_bytes(),name
assert len(m['modules'])==52 and len(m['assets'])==189,(len(m['modules']),len(m['assets']))
assert m['deferredPhotographs']==168 and m['deferredBirdRecordings']==3
html=(web/'index.html').read_text();assert html==(web/'Feldbuch.html').read_text();assert 'allowfullscreen' not in html
assert 'src="./'+m['modules']['expedition.js']+'"' in html
assert (web/'.nojekyll').is_file()
for r in json.loads((root/'tests/fixtures/texture-compression-v018.json').read_text()):
    with Image.open(dist/'assets'/(r['name']+'.png'))as before,Image.open(dist/'assets'/(r['name']+'.webp'))as after:
        assert before.size==after.size and all(c.getbbox()is None for c in ImageChops.difference(before.convert('RGBA'),after.convert('RGBA')).split()),r['name']
with zipfile.ZipFile(root/'outputs/Feldbuch-GitHub-Pages.zip')as z:
    assert z.testzip()is None
    assert set(z.namelist())==set(m['files'])
    for name in z.namelist():assert z.read(name)==(web/name).read_bytes(),name
result={k:m[k]for k in ['version','totalBytes','initialUpperBoundBytes','deferredPhotographs','deferredBirdRecordings','largestFileBytes']};result.update({'modules':len(m['modules']),'assets':len(m['assets']),'exactSourceAndAssets':True,'subdirectorySafe':True,'sameOriginAssets':True,'identicalTexturePixels':True,'zipVerified':True})
(root/'work/web-verification-v020.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
