import json,sys,tempfile,unittest,zipfile
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from build import build
from validate import ROOT,inspect_resources
class RangerTests(unittest.TestCase):
 def test_optional_literature_is_not_an_asset_exemption(self):
  html=b'<a href="https://example.org/paper" data-optional-literature="true" target="_blank" rel="noopener noreferrer">Quelle</a>'
  with self.assertRaisesRegex(ValueError,'External'):inspect_resources({'index.html':html},'index.html')
  self.assertEqual(inspect_resources({'index.html':html},'index.html',True),[])
  for unsafe in [b'<script src="https://example.org/app.js"></script>',b'<img src="https://example.org/a.png" data-optional-literature="true">',b'<a href="https://example.org/paper">Quelle</a>',html.replace(b'https:',b'http:')]:
   with self.assertRaisesRegex(ValueError,'External'):inspect_resources({'index.html':unsafe},'index.html',True)
  with self.assertRaisesRegex(ValueError,'External'):inspect_resources({'index.html':b'', 'app.js':b'fetch("https://example.org/data")'},'index.html',True)
 def test_explicit_mode_config_and_policy(self):
  with tempfile.TemporaryDirectory()as td:
   root=Path(td);(root/'app').mkdir();(root/'app/index.html').write_text('<html><head></head><body><script type="module" src="./adapter.js"></script></body></html>');(root/'app/adapter.js').write_text('export const classroom=true;')
   config={'name':'Ranger','description':'test','sourceDir':'app','entry':'index.html','output':'ranger-unit.zip','classroomMode':True,'classroomAdapter':'adapter.js','trackingMode':'ranger-session-only'};path=root/'config.json';path.write_text(json.dumps(config));build(path,'void 0;')
   with zipfile.ZipFile(ROOT/'dist/ranger-unit.zip')as z:
    info=json.loads(z.read('__scorm/package-info.json'));self.assertEqual(info['trackingMode'],'ranger-session-only');self.assertIsNone(info['data_policy']['new_attempt_status']);self.assertIn(b'"trackingMode": "ranger-session-only"',z.read('index.html'))
   for key,value in [('trackingMode','typo'),('allowOptionalLiterature','true'),('classroomAdapter','missing.js')]:
    path.write_text(json.dumps({**config,key:value}))
    with self.assertRaises(ValueError):build(path,'void 0;')
   (ROOT/'dist/ranger-unit.zip').unlink();(ROOT/'dist/ranger-unit.zip.validation.json').unlink()
