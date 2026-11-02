from pathlib import Path
import hashlib,json,re,subprocess,zipfile
root=Path('/workspace/Ein-Tag-als-Ranger');out=root/'outputs/Ranger-Kompakt-Lernpaket';info=json.loads((out/'build-info.json').read_text());rows=[];expected={f'C{i:02}'for i in range(1,26)}
for name,teacher in [('Arbeitsblaetter',False),('Lehrkraefte',True)]:
 p=out/(name+'.pdf');data=p.read_bytes();assert hashlib.sha256(data).hexdigest()==info['files'][p.name]['sha256'];text=subprocess.check_output(['pdftotext','-layout',str(p),'-'],text=True);ids=set(re.findall(r'\bC(?:0[1-9]|1[0-9]|2[0-5])\b',text));assert ids==expected,{'missing':sorted(expected-ids)};count=' '.join(text.split()).count('Erwartung und zulässige Alternativen');assert count==(25 if teacher else 0);meta=subprocess.check_output(['pdfinfo',str(p)],text=True);pages=int(re.search(r'^Pages:\s+(\d+)',meta,re.M)[1]);assert pages>=25;rows.append({'file':p.name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'pages':pages,'curriculumCards':len(ids),'teacherCriteriaBlocks':count,'passed':True})
for name,digest in info['sourceHashes'].items():assert hashlib.sha256((root/'dist/compact'/name).read_bytes()).hexdigest()==digest
with zipfile.ZipFile(root/'outputs/Ranger-Kompakt-Lernpaket.zip')as z:
 assert z.testzip()is None;assert set(z.namelist())=={p.name for p in out.iterdir()if p.is_file()}
 for name in z.namelist():assert z.read(name)==(out/name).read_bytes(),name
r={'sourceCommit':info['sourceCommit'],'documents':rows,'sourceHashesVerified':True,'archiveVerified':True,'passed':True};(root/'work/complete-compact/materials-validation.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))
