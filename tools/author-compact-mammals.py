"""CC0 local anatomy revision. Blender only; metre/+X and four-leg rig preserved.
Dimensions remain authored design values. No downloaded media or provider jobs.
"""
from pathlib import Path
import importlib.util, math, json, shutil, bpy
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('author',ROOT/'tools/author-wildlife-v020.py');a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
a.OUT=ROOT/'work/optik-endkorrektur/mammal-source';a.OUT.mkdir(parents=True,exist_ok=True)
a.SIZES['capreolus_capreolus']=1.12

def loft(m,sections,color,coat,head,rows=76,sides=24):
    def sample(t,k):
        u=t*(len(sections)-1);i=min(len(sections)-2,int(u));f=u-i
        q=[sections[max(0,min(len(sections)-1,i+j))][k] for j in [-1,0,1,2]]
        return .5*(2*q[1]+(-q[0]+q[2])*f+(2*q[0]-5*q[1]+4*q[2]-q[3])*f*f+(-q[0]+3*q[1]-3*q[2]+q[3])*f*f*f)
    verts=[];faces=[]
    for j in range(rows+1):
        x,y,z,ry,rz=[sample(j/rows,k) for k in range(5)]
        for k in range(sides):
            angle=k/sides*math.tau;verts.append(a.xyz((x,y+math.cos(angle)*max(.001,ry),z+math.sin(angle)*max(.001,rz))))
            if j<rows:
                n=j*sides+k;nextn=j*sides+(k+1)%sides;faces.append((n,nextn,nextn+sides,n+sides))
    faces.extend([tuple(reversed(range(sides))),tuple(rows*sides+k for k in range(sides))])
    mesh=bpy.data.meshes.new('Continuous anatomical loft');mesh.from_pydata(verts,[],faces);mesh.update();m.add(mesh,color,coat=coat,head=head)

def leg(m,part,hip,knee,foot,width,color,thigh,hoof=False):
    m.feet[str(part)]=foot
    upper=width*(2.4 if hoof else 1.9)
    m.tube([hip,tuple(.65*hip[i]+.35*knee[i] for i in range(3)),knee],[upper,width*1.35,width*.72],thigh,part,hip,knee,0,segments=14)
    m.ellipsoid(knee,(width*.78,width*.88,width*.78),color,part,hip,knee,0)
    m.tube([knee,tuple(.25*knee[i]+.75*foot[i] for i in range(3)),foot],[width*.74,width*.50,width*.57],color,part,hip,knee,1,segments=12)
    if hoof:
        for side in [-1,1]:m.ellipsoid((foot[0]+width*.22,foot[1],foot[2]+side*width*.48),(width*1.35,width*.58,width*.43),'#403b32',part,hip,knee,2)
    else:
        m.ellipsoid((foot[0]+width*.3,foot[1],foot[2]),(width*1.6,width*.62,width*1.1),color,part,hip,knee,2)
        for side in [-1,0,1]:m.ellipsoid((foot[0]+width*1.35,foot[1]-.003,foot[2]+side*width*.58),(width*.55,width*.41,width*.36),color,part,hip,knee,2)

def deer():
    bpy.ops.wm.read_factory_settings(use_empty=True);m=a.Model('capreolus_capreolus');m.rig_coordinate_offset=2;head=(.36,.82,0)
    sections=[(-.51,.66,0,.035,.045),(-.39,.685,0,.155,.13),(-.16,.665,0,.165,.13),(.08,.65,0,.18,.12),(.21,.69,0,.155,.10),(.27,.81,0,.12,.078),(.34,.96,0,.08,.062),(.42,1.015,0,.063,.061),(.51,.986,0,.038,.044),(.594,.975,0,.015,.027)]
    def coat(p):
        belly=1-a.smooth(.48,.61,p[1]);back=a.smooth(.74,.84,p[1])*(1-a.smooth(.18,.40,p[0]));base=a.linear('#aa7549');light=a.linear('#c0a582');dark=a.linear('#796044')
        return tuple((base[i]*(1-belly)+light[i]*belly)*(1-back*.26)+dark[i]*back*.26 for i in range(3))
    loft(m,sections,'#aa7549',coat,(.37,.86,head))
    for side in [-1,1]:
        m.ear((.36,1.062,side*.052),.145,.036,'#8c6747',head,'#c5b396')
        m.ellipsoid((.444,1.034,side*.055),(.008,.009,.004),'#201f19',6,head,head,1,eye=True)
        m.ellipsoid((.514,.960,side*.018),(.06,.012,.029),'#c5b597',6,head,head,1)
    m.ellipsoid((.594,.975,0),(.016,.014,.027),'#292a23',6,head,head,1,eye=True)
    m.ellipsoid((-.493,.647,0),(.018,.082,.075),'#ddd4bc')
    for rear in [False,True]:
        for side in [-1,1]:
            hip=(-.32 if rear else .18,.65 if rear else .61,side*.10);knee=(-.24 if rear else .16,.31,side*.105);foot=(-.32 if rear else .19,.022,side*.108)
            leg(m,(3 if rear else 1)+(side>0),hip,knee,foot,.0185,'#9a7958','#a87a50',True)
    m.finish();return 'capreolus_capreolus','compact-roe-deer.glb','REH-ASSET.json'

def fox():
    bpy.ops.wm.read_factory_settings(use_empty=True);m=a.Model('fox');m.rig_coordinate_offset=2;head=(.29,.64,0)
    sections=[(-.45,.52,0,.025,.035),(-.31,.55,0,.14,.12),(-.08,.55,0,.145,.12),(.14,.56,0,.15,.11),(.27,.61,0,.13,.095),(.36,.70,0,.095,.08),(.44,.735,0,.073,.071),(.53,.708,0,.044,.046),(.64,.689,0,.017,.022)]
    def coat(p):
        pale=max(1-a.smooth(.43,.52,p[1]),a.smooth(.28,.45,p[0])*(1-a.smooth(.68,.72,p[1])));back=a.smooth(.64,.71,p[1])*(1-a.smooth(.25,.40,p[0]));base=a.linear('#b87842');light=a.linear('#dfd4bb');dark=a.linear('#795338')
        return tuple((base[i]*(1-pale)+light[i]*pale)*(1-back*.32)+dark[i]*back*.32 for i in range(3))
    loft(m,sections,'#b87842',coat,(.32,.60,head))
    for side in [-1,1]:
        m.ear((.345,.777,side*.052),.12,.046,'#8b5a38',head,'#574b3b')
        m.ellipsoid((.465,.757,side*.060),(.009,.008,.004),'#302a1d',6,head,head,1,eye=True)
    m.ellipsoid((.642,.689,0),(.016,.012,.022),'#272a24',6,head,head,1,eye=True)
    for rear in [False,True]:
        for side in [-1,1]:
            x=-.27 if rear else .22;hip=(x,.49,side*.095);knee=(x+(.08 if rear else -.025),.25,side*.10);foot=(x+(.055 if rear else .05),.028,side*.105)
            leg(m,(3 if rear else 1)+(side>0),hip,knee,foot,.024,'#4c4234','#b17b49')
    pivot=(-.40,.54,0);points=[pivot,(-.52,.46,0),(-.66,.36,.015),(-.82,.31,.025),(-.98,.32,.03),(-1.05,.35,.03)]
    m.tube(points,[.045,.075,.092,.092,.055,.004],'#b87842',5,pivot,coat=lambda p:a.linear('#dfd5bd') if p[0]<-.91 else a.linear('#a87043'),segments=24)
    m.finish();return 'fox','wildlife-fox.glb','FUCHS-ASSET.json'

for author in [deer,fox]:
    name,destination,metadata=author();source=a.OUT/(name+'.glb');shutil.copyfile(source,ROOT/'dist/assets'/destination)
    stats=json.loads((a.OUT/(name+'.json')).read_text());stats.update(source='tools/author-compact-mammals.py + tools/author-wildlife-v020.py',stage='visual review pending',dimensionsStatus='authored, not empirically calibrated',license='CC0-1.0')
    (ROOT/'docs/kompakt'/metadata).write_text(json.dumps(stats,indent=2)+'\n')
