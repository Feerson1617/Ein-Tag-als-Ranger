"""Negative packaging checks must fail on missing references and tampered output."""
from pathlib import Path
import base64,contextlib,hashlib,importlib.util,json,os,re,shutil,subprocess,sys,tempfile,unittest
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
from module_graph import ModuleGraph

class PackagingTests(unittest.TestCase):
 def test_dynamic_worker_side_effect_and_url_closure(self):
  with tempfile.TemporaryDirectory()as folder:
   root=Path(folder);(root/'assets').mkdir();(root/'assets/data.json').write_text('{}')
   for name in ['side.js','chunk.js','worker.js']:(root/name).write_text('export const n=1;')
   (root/'expedition.js').write_text("import './side.js'; export * from './chunk.js'; const chunk=import('./chunk.js'); new Worker(new URL('./worker.js',import.meta.url),{type:'module'}); const data=new URL('./assets/data.json',import.meta.url);")
   graph=ModuleGraph(root);self.assertEqual(set(graph.modules),{'expedition.js','side.js','chunk.js','worker.js'});self.assertEqual(graph.assets,{'assets/data.json'})
   (root/'worker.js').unlink()
   with self.assertRaises(FileNotFoundError):ModuleGraph(root)
 def test_nonliteral_and_escape_fail(self):
  with tempfile.TemporaryDirectory()as folder:
   root=Path(folder);entry=root/'expedition.js';entry.write_text('const path="./x.js"; import(path);')
   with self.assertRaisesRegex(ValueError,'Nonliteral'):ModuleGraph(root)
   entry.write_text("import '../outside.js';")
   with self.assertRaisesRegex(ValueError,'escapes'):ModuleGraph(root)
 def test_current_package_and_tampered_output(self):
  manifest=ROOT/'outputs/GitHub-Pages/build-manifest.json'
  self.assertTrue(manifest.is_file(),'Run build-web.py before packaging tests')
  def verify(folder):return subprocess.run([sys.executable,str(ROOT/'tools/verify-web.py'),'--web',str(folder)],cwd=ROOT,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
  self.assertEqual(verify(manifest.parent).returncode,0)
  with tempfile.TemporaryDirectory()as folder:
   root=Path(folder)/'site';shutil.copytree(manifest.parent,root)
   data=json.loads(manifest.read_text());target=root/next(iter(data['modules'].values()))
   original=target.read_bytes();target.write_bytes(original+b'\n// tampered')
   self.assertNotEqual(verify(root).returncode,0)
   target.write_bytes(original);asset=root/next(iter(data['assets'].values()))[2:];asset.unlink()
   self.assertNotEqual(verify(root).returncode,0)
 def test_no_development_or_student_files(self):
  paths=[p.relative_to(ROOT/'outputs/GitHub-Pages').as_posix()for p in (ROOT/'outputs/GitHub-Pages').rglob('*')if p.is_file()]
  self.assertTrue(paths)
  self.assertFalse(any(p.startswith(('.git/','.game-dev/','work/','verification/','tests/'))for p in paths))
  self.assertFalse(any(Path(p).name in {'mein-feldbuch.json','.env','HANDOFF.md'}for p in paths))
 def test_standalone_roundtrip_and_bootstrap_syntax(self):
  html=(ROOT/'outputs/Feldbuch.html').read_text();graph=ModuleGraph(ROOT/'dist')
  code=re.search(r'<script type="module">([\s\S]*)</script>',html)[1]
  decoder=json.JSONDecoder();sources,end=decoder.raw_decode(code.split('const sources=',1)[1])
  self.assertEqual(set(sources),set(graph.modules))
  for name in graph.modules:self.assertEqual(sources[name],graph.rewrite(name,lambda ref:('module://'if ref.target in graph.modules else'asset://')+ref.target))
  assets,_=decoder.raw_decode(code.split(',assets=',1)[1])
  for name,data in assets.items():self.assertEqual(base64.b64decode(data['data']),(ROOT/'dist'/name).read_bytes())
  check=subprocess.run(['node','--input-type=module','--check'],input=code,text=True,capture_output=True)
  self.assertEqual(check.returncode,0,check.stderr)
  digests=[]
  for seed in ['1','2']:
   subprocess.run([sys.executable,str(ROOT/'tools/build-standalone.py')],cwd=ROOT,env={**os.environ,'PYTHONHASHSEED':seed},check=True,stdout=subprocess.PIPE)
   digests.append(hashlib.sha256((ROOT/'outputs/Feldbuch.html').read_bytes()).hexdigest())
  self.assertEqual(digests[0],digests[1],'Standalone bytes must not depend on Python hash randomization')

if __name__=='__main__':unittest.main()
