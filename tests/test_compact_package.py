from pathlib import Path
import base64,json,re,subprocess,sys,tempfile,shutil,unittest,zipfile
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
from module_graph import ModuleGraph
class CompactPackageTests(unittest.TestCase):
 def test_closed_graph(self):
  g=ModuleGraph(ROOT/'dist','compact/main.js')
  self.assertFalse({'biodiversity.js','habitat-world.js','expedition-state.js','authored-wildlife.js','wildlife.js','interaction-scenarios.js'}.intersection(g.modules))
  self.assertEqual(g.assets,{'assets/compact-roe-deer.glb','assets/wildlife-fox.glb','assets/terrain-atlas.webp','assets/sky-panorama.webp','assets/boardwalk-wood.webp'})
 def test_integrity_and_tampering(self):
  command=[sys.executable,str(ROOT/'tools/verify-compact.py')]
  self.assertEqual(subprocess.run(command,capture_output=True).returncode,0)
  with tempfile.TemporaryDirectory()as folder:
   web=Path(folder)/'site';shutil.copytree(ROOT/'outputs/Ranger-Kompakt',web);m=json.loads((web/'build-manifest.json').read_text());asset=web/next(iter(m['assets'].values()))[2:];asset.write_bytes(asset.read_bytes()+b'tampered')
   self.assertNotEqual(subprocess.run(command+['--web',str(web)],capture_output=True).returncode,0)
 def test_standalone_closure_and_syntax(self):
  html=(ROOT/'outputs/Ranger-Kompakt.html').read_text();code=re.search(r'<script type="module">([\s\S]*)</script>',html)[1];decoder=json.JSONDecoder();sources,_=decoder.raw_decode(code.split('const sources=',1)[1]);assets,_=decoder.raw_decode(code.split(',assets=',1)[1]);g=ModuleGraph(ROOT/'dist','compact/main.js');self.assertEqual(set(sources),set(g.modules));self.assertEqual(set(assets),g.assets)
  for name in g.modules:self.assertEqual(sources[name],g.rewrite(name,lambda r:('module://'if r.target in g.modules else'asset://')+r.target))
  for name,data in assets.items():self.assertEqual(base64.b64decode(data['data']),(ROOT/'dist'/name).read_bytes())
  check=subprocess.run(['node','--input-type=module','--check'],input=code,text=True,capture_output=True);self.assertEqual(check.returncode,0,check.stderr)
 def test_zip_matches_exact_output(self):
  web=ROOT/'outputs/Ranger-Kompakt'
  with zipfile.ZipFile(ROOT/'outputs/Ranger-Kompakt-Vorschau.zip')as z:
   self.assertIsNone(z.testzip());self.assertEqual(set(z.namelist()),{p.relative_to(web).as_posix()for p in web.rglob('*')if p.is_file()})
   for name in z.namelist():self.assertEqual(z.read(name),(web/name).read_bytes())
if __name__=='__main__':unittest.main()
