"""Local Blender source for the phase-2 adult female roe deer, late summer.
Uses the existing single-mesh metre/+X-forward rig contract; no new loader format.
Lengths are authored design dimensions, pending species-specific measure approval.
"""
from pathlib import Path
import importlib.util, shutil, json, bpy
root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('wildlife_author',root/'tools/author-wildlife-v020.py')
a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
a.OUT=root/'work/compact-deer-source';a.OUT.mkdir(parents=True,exist_ok=True)
a.SIZES['capreolus_capreolus']=1.12
bpy.ops.wm.read_factory_settings(use_empty=True)
m=a.Model('capreolus_capreolus');head=(.36,.82,0)
# Sloping croup, narrow thorax, tapered throat and a small, wedge-shaped head.
body=[((-.13,.67,0),(.36,.17,.14)),((-.36,.69,0),(.17,.18,.148)),((.17,.66,0),(.17,.20,.125)),((.24,.77,0),(.10,.20,.092)),((.33,.93,0),(.085,.16,.074)),((.415,1.02,0),(.115,.080,.075)),((.50,.975,0),(.11,.047,.055))]
def coat(p):
 base=a.linear('#af7040');belly=a.linear('#b49a76');dark=a.linear('#71513b')
 t=1-a.smooth(.48,.62,p[1]);back=a.smooth(.72,.84,p[1])*(1-a.smooth(.20,.42,p[0]))
 return tuple(base[i]*(1-t)*(1-back*.3)+belly[i]*t+dark[i]*back*.3*(1-t) for i in range(3))
body.extend([((-.32,.565,side*.091),(.09,.145,.064))for side in [-1,1]])
m.sculpt(body,'#af7040',coat,(.37,.86,head))
# Large, slim ears with visible dark edge and pale inner plane; no antlers (adult doe).
for side in [-1,1]:
 m.ear((.36,1.065,side*.055),.18,.043,'#895c3d',head,'#c1aa8b')
 m.ellipsoid((.443,1.038,side*.070),(.009,.011,.004),'#1a1713',6,head,head,1,eye=True)
 m.ellipsoid((.447,1.043,side*.074),(.0017,.0017,.001),'#e0d9bf',6,head,head,1,eye=True)
 # Pale lower muzzle, separated from nose; throat stays narrow.
 m.ellipsoid((.52,.953,side*.02),(.057,.016,.037),'#c8b394',6,head,head,1)
m.ellipsoid((.594,.975,0),(.019,.018,.032),'#25231d',6,head,head,1,eye=True)
# Small pale rump mirror; tail does not form a dog-like projecting tail.
m.ellipsoid((-.496,.648,0),(.026,.095,.088),'#d7cbb3',0)
for rear in [False,True]:
 for side in [-1,1]:
  hip=(-.32 if rear else .18,.65 if rear else .61,side*.10)
  joint=(-.24 if rear else .16,.31,side*.105)
  foot=(-.32 if rear else .19,.022,side*.108)
  # Rear haunch merges into a fine lower leg; forelimb remains slender.
  m.leg((3 if rear else 1)+(side>0),hip,joint,foot,.0185,'#9b7351',hoof=True)
m.finish()
shutil.copyfile(a.OUT/'capreolus_capreolus.glb',root/'dist/assets/compact-roe-deer.glb')
stats=json.loads((a.OUT/'capreolus_capreolus.json').read_text());stats.update(source='tools/author-compact-deer.py + tools/author-wildlife-v020.py',stage='visuelle Freigabe offen',sex='adult female',season='late summer',dimensionsStatus='authored, not empirically calibrated')
(root/'docs/kompakt/REH-ASSET.json').write_text(json.dumps(stats,indent=2)+'\n')
