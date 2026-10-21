"""Self-contained HTML from the same checked module/media graph as Pages."""
from pathlib import Path
import base64,json,mimetypes,re
from module_graph import ModuleGraph
root=Path(__file__).resolve().parents[1];dist=root/'dist';graph=ModuleGraph(dist)
sources={};assets={}
for name in sorted(graph.assets):
    mime='model/gltf-binary' if name.endswith('.glb')else mimetypes.guess_type(name)[0]
    assets[name]={'mime':mime or 'application/octet-stream','data':base64.b64encode((dist/name).read_bytes()).decode()}
for name in graph.modules:
    sources[name]=graph.rewrite(name,lambda ref:('module://' if ref.target in graph.modules else 'asset://')+ref.target)
bootstrap=r'''const sources=MODULE_SOURCES,assets=ASSET_DATA,assetUrls={},urls={};
globalThis.__feldbuchAssetUrl=name=>{
 if(assetUrls[name])return assetUrls[name];const asset=assets[name];if(!asset)throw Error('Fehlendes Material: '+name);
 const binary=atob(asset.data),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
 assetUrls[name]=URL.createObjectURL(new Blob([bytes],{type:asset.mime}));
 document.getElementById('world').dataset.decodedAssets=String(Object.keys(assetUrls).length);return assetUrls[name];
};
for(const [name,original]of Object.entries(sources)){
 let source=original.replace(/asset:\/\/([a-zA-Z0-9_./-]+)/g,(all,name)=>name.split('/').at(-1).startsWith('species-photo-')||name.endsWith('.mp3')?all:globalThis.__feldbuchAssetUrl(name));
 source=source.replace(/module:\/\/([a-zA-Z0-9_./-]+)/g,(all,name)=>{if(!urls[name])throw Error('Fehlendes Modul: '+name);return urls[name];});
 urls[name]=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
}
import(urls['expedition.js']).catch(error=>{console.error(error);document.getElementById('loading').textContent='Bitte in einem aktuellen Browser mit WebGL öffnen.';});
'''.replace('MODULE_SOURCES',json.dumps(sources,ensure_ascii=False).replace('<','\\u003c')).replace('ASSET_DATA',json.dumps(assets))
html=(dist/'index.html').read_text()
html=re.sub(r'<link rel="stylesheet" href="field\.css(?:\?[^\"]*)?">',lambda _:'<style>'+(dist/'field.css').read_text()+'</style>',html)
html=html.replace('href="icon.svg"','href="data:image/svg+xml;base64,'+base64.b64encode((dist/'icon.svg').read_bytes()).decode()+'"')
html=re.sub(r'<script type="module" src="expedition\.js(?:\?[^"]*)?"></script>',lambda _:'<script type="module">'+bootstrap+'</script>',html)
output=root/'outputs/Feldbuch.html';output.parent.mkdir(exist_ok=True);output.write_text(html);(dist/'Feldbuch.html').write_bytes(output.read_bytes())
print(json.dumps({'output':str(output),'bytes':output.stat().st_size,'modules':len(graph.modules)}))
