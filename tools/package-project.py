"""Source archive from Git's explicit file list; never include .git or ignored outputs."""
from pathlib import Path
import hashlib,json,subprocess,zipfile
root=Path(__file__).resolve().parents[1]
names=subprocess.check_output(['git','ls-files','-c','-o','--exclude-standard','-z'],cwd=root).decode().split('\0')
files={}
for name in sorted(set(filter(None,names))):
 path=root/name
 if not path.is_file()or path.is_symlink()or not path.resolve().is_relative_to(root):raise ValueError('Unsupported archive source: '+name)
 files[name]=path.read_bytes()
manifest={'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'sourceDirty':bool(subprocess.check_output(['git','status','--porcelain','--untracked-files=normal'],cwd=root,text=True).strip()),'files':{name:hashlib.sha256(data).hexdigest()for name,data in files.items()}}
files['PROJECT-MANIFEST.json']=(json.dumps(manifest,indent=2)+'\n').encode()
out=root/'outputs/Feldbuch-Projekt.zip';out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=7)as archive:
 for name,data in files.items():archive.writestr(zipfile.ZipInfo(name,date_time=(1980,1,1,0,0,0)),data,compress_type=zipfile.ZIP_DEFLATED,compresslevel=7)
with zipfile.ZipFile(out)as archive:
 assert archive.testzip()is None
 for name,data in files.items():assert archive.read(name)==data,name
print(json.dumps({'output':str(out),'files':len(files),'bytes':out.stat().st_size,'zipVerified':True}))
