"""Package the local game as a self-contained HTML artifact; no external build tools."""
from pathlib import Path
import base64, json, re, mimetypes

root = Path(__file__).resolve().parents[1]
dist = root / 'evolutionswald/dist'
if not dist.exists():
    dist = root / 'dist'
# Discover dependencies in order so new active modules cannot be omitted.
order,visiting,visited=[],set(),set()
def visit(name):
    if name in visited: return
    if name in visiting: raise ValueError('Circular module dependency: '+name)
    visiting.add(name)
    text=(dist/name).read_text()
    for ref in re.findall(r"from\s*['\"](\./[^'\"]+)['\"]",text):
        dependency=(Path(name).parent/ref[2:].split('?')[0]).as_posix()
        visit(dependency)
    visiting.remove(name);visited.add(name);order.append(name)
visit('expedition.js')
sources = {}
assets = {}
active_text='\n'.join((dist/name).read_text() for name in order)
for asset in sorted((dist / 'assets').iterdir()):
    if asset.suffix in ['.png', '.jpg', '.jpeg', '.webp', '.mp3', '.glb'] and './assets/'+asset.name in active_text:
        assets[asset.name] = {'mime': ('model/gltf-binary' if asset.suffix=='.glb' else mimetypes.guess_type(asset.name)[0]),
                            'data': base64.b64encode(asset.read_bytes()).decode()}
for name in order:
    text = (dist / name).read_text()
    for name_asset in assets:
        text = text.replace('./assets/' + name_asset, 'asset://' + name_asset)
    assert not re.search(r'[\"\']\./assets/', text), name
    sources[name] = text
data = json.dumps(sources, ensure_ascii=False).replace('<', '\\u003c')
bootstrap = '''const sources = MODULE_SOURCES;
const assets = ASSET_DATA, assetUrls = {};
globalThis.__feldbuchAssetUrl = name => {
 if(assetUrls[name]) return assetUrls[name];
 const asset=assets[name];if(!asset)throw new Error('Fehlendes Material: '+name);
 const binary = atob(asset.data), bytes = new Uint8Array(binary.length);
 for(let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
 assetUrls[name]=URL.createObjectURL(new Blob([bytes],{type:asset.mime}));
 document.getElementById('world').dataset.decodedAssets=String(Object.keys(assetUrls).length);
 return assetUrls[name];
};
const urls = {};
for (const [name, original] of Object.entries(sources)) {
 let source = original.replace(/asset:\\/\\/([a-zA-Z0-9_.-]+)/g, (all,name)=>name.startsWith('species-photo-')||name.endsWith('.mp3')?all:globalThis.__feldbuchAssetUrl(name));
 const folder = name.includes('/') ? name.slice(0,name.lastIndexOf('/')+1) : '';
 source = source.replace(/(from\\s*['"])(\\.\\/[^'"]+)(['"])/g, (all, before, ref, after) => {
   const dependency = folder + ref.slice(2).split('?')[0];
   if (!urls[dependency]) throw new Error('Fehlendes Modul: '+dependency);
   return before + urls[dependency] + after;
 });
 urls[name] = URL.createObjectURL(new Blob([source], {type:'text/javascript'}));
}
import(urls['expedition.js']).catch(error => {
 console.error(error);
 document.getElementById('loading').textContent = 'Bitte in einem aktuellen Browser mit WebGL öffnen.';
});'''.replace('MODULE_SOURCES', data).replace('ASSET_DATA', json.dumps(assets))
html = (dist / 'index.html').read_text()
html = re.sub(r'<link rel="stylesheet" href="field\.css(?:\?[^\"]*)?">', lambda _: '<style>' + (dist / 'field.css').read_text() + '</style>', html)
icon = base64.b64encode((dist / 'icon.svg').read_bytes()).decode()
html = html.replace('href="icon.svg"', 'href="data:image/svg+xml;base64,' + icon + '"')
html = re.sub(r'<script type="module" src="expedition\.js(?:\?[^"]*)?"></script>', lambda _: '<script type="module">' + bootstrap + '</script>', html)
output = root / 'outputs/Feldbuch.html'
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(html)
(dist / 'Feldbuch.html').write_bytes(output.read_bytes())
print(json.dumps({'output': str(output), 'bytes': output.stat().st_size, 'modules': len(order)}))
