"""Local Blender authoring. No provider, network, paid content or account.
Coordinates in the authoring contract: +X muzzle, +Y up, +Z left.
Blender receives (x,-z,y); glTF export restores the contract.
"""
import bpy, math, json, hashlib, sys
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'work/authored-wildlife-v020'; OUT.mkdir(parents=True,exist_ok=True)
SIZES={'fox':1.10,'hare':.65,'capreolus_capreolus':1.10,'sciurus_vulgaris':.42,'phoca_vitulina':1.60,'halichoerus_grypus':2.20}
def xyz(p):return (p[0],-p[2],p[1])
def unxyz(p):return (p[0],p[2],-p[1])
def linear(hexcode):
    s=[int(hexcode[i:i+2],16)/255 for i in (1,3,5)]
    return tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in s)
def smooth(a,b,x):
    t=max(0,min(1,(x-a)/(b-a)));return t*t*(3-2*t)

class Model:
    def __init__(self,name):self.name=name;self.vertices=[];self.faces=[];self.colors=[];self.rigs=[];self.joints=[];self.uvs=[];self.feet={}
    def add(self,mesh,color,part=0,pivot=(0,0,0),joint=(0,0,0),knee=0,coat=None,head=None,eye=False):
        offset=len(self.vertices)
        for v in mesh.vertices:
            p=unxyz(v.co);self.vertices.append(p)
            c=linear(color)
            if coat:c=coat(p)
            weight=smooth(head[0]-.09,head[0]+.09,p[0])*smooth(head[1]-.10,head[1]+.04,p[1]) if head else 0
            self.colors.append(c)
            self.rigs.append((6,*head[2]) if weight>.001 else (part,*pivot))
            self.joints.append((*joint,weight if weight>.001 else knee))
            self.uvs.append((-1,-1) if eye else (p[0]*1.7+.5,p[1]*1.9+abs(p[2])*.23))
        self.faces.extend(tuple(offset+i for i in f.vertices) for f in mesh.polygons)
    def ellipsoid(self,p,scale,color,part=0,pivot=(0,0,0),joint=(0,0,0),knee=0,coat=None,eye=False):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=10,location=xyz(p));o=bpy.context.object;o.scale=(scale[0],scale[2],scale[1]);bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
        self.add(o.data,color,part,pivot,joint,knee,coat=coat,eye=eye);bpy.data.objects.remove(o,do_unlink=True)
    def tube(self,points,radii,color,part=0,pivot=(0,0,0),joint=(0,0,0),knee=0,segments=12,coat=None,horizontal=False):
        vertices=[];faces=[]
        for i,(p,r) in enumerate(zip(points,radii)):
            tangent=Vector(points[min(i+1,len(points)-1)])-Vector(points[max(0,i-1)])
            tangent.normalize();u=tangent.cross(Vector((0,1,0) if horizontal else (0,0,1)))
            if u.length<.1:u=tangent.cross(Vector((0,1,0)))
            u.normalize();v=tangent.cross(u).normalized()
            for j in range(segments):
                a=j*math.tau/segments;rr=r if isinstance(r,(tuple,list)) else (r,r)
                q=Vector(p)+u*(math.cos(a)*rr[0])+v*(math.sin(a)*rr[1]);vertices.append(xyz(q))
        for i in range(len(points)-1):
            for j in range(segments):
                a=i*segments+j;b=i*segments+(j+1)%segments;c=a+segments;d=b+segments;faces.append((a,c,d,b))
        faces.append(tuple(reversed(range(segments))));faces.append(tuple((len(points)-1)*segments+j for j in range(segments)))
        mesh=bpy.data.meshes.new('tapered');mesh.from_pydata(vertices,[],faces);mesh.update();self.add(mesh,color,part,pivot,joint,knee,coat=coat)
    def sculpt(self,ellipsoids,color,coat,head):
        objects=[]
        for p,sc in ellipsoids:
            bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,location=xyz(p));o=bpy.context.object;o.scale=(sc[0],sc[2],sc[1]);bpy.ops.object.transform_apply(location=False,rotation=True,scale=True);objects.append(o)
        bpy.ops.object.select_all(action='DESELECT')
        for o in objects:o.select_set(True)
        bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();o=objects[0];bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
        mod=o.modifiers.new('Continuous anatomical skin','REMESH');mod.mode='VOXEL';mod.voxel_size=.016;mod.use_smooth_shade=True;bpy.ops.object.modifier_apply(modifier=mod.name)
        mod=o.modifiers.new('Soft tissue','SMOOTH');mod.factor=.8;mod.iterations=4;bpy.ops.object.modifier_apply(modifier=mod.name)
        mod=o.modifiers.new('Tablet surface budget','DECIMATE');mod.ratio=.33;bpy.ops.object.modifier_apply(modifier=mod.name)
        self.add(o.data,color,coat=coat,head=head);bpy.data.objects.remove(o,do_unlink=True)
    def ear(self,p,height,width,color,headPivot,inner):
        points=[p,(p[0]-.015,p[1]+height*.55,p[2]),(p[0]-.025,p[1]+height,p[2])]
        self.tube(points,[(width,.024),(width*.72,.018),(.002,.002)],color,6,headPivot,headPivot,1,segments=10)
        self.tube([(p[0]+.018,p[1]+height*.15,p[2]),(p[0]+.014,p[1]+height*.67,p[2]),(p[0]+.004,p[1]+height*.83,p[2])],[(width*.49,.004),(width*.39,.003),(.003,.003)],inner,6,headPivot,headPivot,1,segments=8)
    def leg(self,part,hip,knee,foot,width,color,hoof=False,thigh=None):
        self.feet[str(part)]=foot
        self.tube([hip,tuple(hip[i]*.7+knee[i]*.3 for i in range(3)),knee],[width*1.35,width,width*.66],color,part,hip,knee,0,coat=(lambda p: tuple(a*(1-smooth(knee[1],hip[1],p[1]))+b*smooth(knee[1],hip[1],p[1]) for a,b in zip(linear(color),linear(thigh)))) if thigh else None)
        self.ellipsoid(knee,(width*.70,width*.70,width*.70),color,part,hip,knee,0)
        self.tube([knee,tuple(knee[i]*.45+foot[i]*.55 for i in range(3)),foot],[width*.68,width*.45,width*.48],color,part,hip,knee,1)
        self.ellipsoid(foot,(width*(1.4 if hoof else 1.7),width*.57,width*1.1),color if not hoof else '#403931',part,hip,knee,2)
        if hoof:
            self.tube([(foot[0]+width*.2,foot[1],foot[2]),(foot[0]+width*1.3,foot[1],foot[2])],[.002,.002],'#171c19',part,hip,knee,2,segments=6)
    def finish(self):
        # Total length includes tail, following catalogue conventions. Feet/rigs use the same transform.
        extent=max(p[0] for p in self.vertices)-min(p[0] for p in self.vertices);k=SIZES[self.name]/extent
        minY=min(p[1] for p in self.vertices);shift=-minY
        def scaled(p):return (p[0]*k,(p[1]+shift)*k,p[2]*k)
        verts=[xyz(scaled(p)) for p in self.vertices]
        mesh=bpy.data.meshes.new(self.name);mesh.from_pydata(verts,[],self.faces);mesh.update()
        for poly in mesh.polygons:poly.use_smooth=True
        obj=bpy.data.objects.new(self.name,mesh);bpy.context.collection.objects.link(obj);bpy.context.view_layer.objects.active=obj;obj.select_set(True)
        # Each segment has a rigid leg role; continuous neck vertices have a blended head weight.
        for name,values in [('_RIGDATA',[(p,*scaled(q[1:])) for q in self.rigs for p in [q[0]]]),('_RIGJOINT',[(*scaled(q[:3]),q[3]) for q in self.joints])]:
            attr=mesh.attributes.new(name=name,type='FLOAT_COLOR',domain='POINT')
            for data,val in zip(attr.data,values):data.color=val
        color=mesh.color_attributes.new(name='Coat',type='FLOAT_COLOR',domain='POINT')
        for data,c in zip(color.data,self.colors):data.color=(*c,1)
        mesh.color_attributes.active_color=color;mesh.color_attributes.render_color_index=mesh.color_attributes.find('Coat')
        uv=mesh.uv_layers.new(name='Surface')
        for loop in mesh.loops:uv.data[loop.index].uv=self.uvs[loop.vertex_index]
        mat=bpy.data.materials.new('Biological surface');mat.diffuse_color=(1,1,1,1);mat.use_nodes=True;bsdf=mat.node_tree.nodes.get('Principled BSDF');bsdf.inputs['Roughness'].default_value=.84
        node=mat.node_tree.nodes.new('ShaderNodeVertexColor');node.layer_name='Coat';mat.node_tree.links.new(node.outputs['Color'],bsdf.inputs['Base Color']);obj.data.materials.append(mat)
        triangulate=obj.modifiers.new('Runtime triangles','TRIANGULATE');bpy.ops.object.modifier_apply(modifier=triangulate.name)
        # Recalculate outside face winding after hand-made tube construction.
        bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT')
        obj['species']=self.name;obj['license']='CC0-1.0';obj['authoring']='Local Blender anatomy; no external generation'
        obj['legFeet']=json.dumps({p:scaled(v) for p,v in self.feet.items()})
        bpy.ops.wm.save_as_mainfile(filepath=str(OUT/(self.name+'.blend')))
        path=OUT/(self.name+'.glb');bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_attributes=True,export_extras=True,export_animations=False,export_apply=False,export_yup=True)
        stats={'species':self.name,'lengthMeters':SIZES[self.name],'triangles':len(obj.data.polygons),'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'legFeet':{p:scaled(v) for p,v in self.feet.items()},'source':'author-wildlife-v020.py','license':'CC0-1.0'}
        (OUT/(self.name+'.json')).write_text(json.dumps(stats,indent=2));print(json.dumps(stats),flush=True)

def mammal(name):
    bpy.ops.wm.read_factory_settings(use_empty=True);m=Model(name)
    fox=name=='fox';hare=name=='hare';deer=name=='capreolus_capreolus';squirrel=name=='sciurus_vulgaris';seal='vitulina' in name or 'grypus' in name;grey='grypus' in name
    if seal:
        headPivot=(.32,.20,0)
        ell=[((-.10,.19,0),(.49,.18,.20)),((.28,.23,0),(.29,.14,.135)),((.47,.28,0),(.16,.11,.107)),((.58,.245,0),(.09 if grey else .065,.06,.07))]
        def coat(p):
            base=linear('#929a96' if not grey else '#747e7a');light=linear('#c0c4b9');t=1-smooth(.06,.18,p[1]);spots=math.sin(p[0]*127+p[2]*53)*math.sin(p[1]*139-p[2]*89)
            return tuple((v*(1-t)+light[i]*t)*(.52 if spots>.73 else 1) for i,v in enumerate(base))
        m.sculpt(ell,'#929a96',coat,(.34,.19,headPivot))
        for side in [-1,1]:
            m.ellipsoid((.49,.299,side*.108),(.012,.016,.008),'#182420',6,headPivot,headPivot,1,eye=True)
            m.ellipsoid((.672 if grey else .648,.262,side*.017),(.014,.009,.008),'#23352f',6,headPivot,headPivot,1,eye=True)
            m.tube([(.18,.078,side*.14),(.035,.022,side*.27),(-.10,.015,side*.31)],[(.065,.016),(.083,.018),(.017,.008)],'#76817c',8,(.18,.075,side*.12),horizontal=True)
            m.tube([(-.52,.09,side*.035),(-.69,.04,side*.12),(-.77,.029,side*.16)],[(.035,.028),(.06,.013),(.014,.007)],'#77827c',5,(-.49,.075,0),horizontal=True)
            for j in range(9):
                m.tube([(.60,.228,side*.045),(.58-j*.007,.215+(j%3)*.012,side*(.13+j*.007))],[.0007,.00025],'#d4d8c9',6,headPivot,headPivot,1,segments=4)
    else:
        if fox:
            headPivot=(.29,.69,0);bodyHeight=.60;legHip=.53
            ell=[((-.03,.59,0),(.39,.16,.13)),((-.28,.59,0),(.19,.175,.143)),((.23,.62,0),(.16,.20,.13)),((.34,.72,0),(.15,.13,.114)),((.43,.76,0),(.125,.105,.100)),((.53,.735,0),(.115,.061,.067)),((.605,.724,0),(.060,.037,.043))]
            back='#a05732';belly='#ded2b5';base='#b76b3b';face='#c5824e';earH=.15;earW=.065;eye=(.49,.790,.086);nose=(.654,.728,0)
        elif deer:
            headPivot=(.31,.84,0);bodyHeight=.63;legHip=.60
            ell=[((-.07,.67,0),(.44,.20,.155)),((-.34,.67,0),(.19,.18,.15)),((.27,.68,0),(.17,.21,.14)),((.34,.87,0),(.11,.24,.099)),((.42,1.025,0),(.15,.095,.099)),((.54,.997,0),(.12,.063,.072))]
            back='#986941';belly='#bb9466';base='#b37a49';face=base;earH=.155;earW=.074;eye=(.47,1.057,.085);nose=(.65,.982,0)
        elif hare:
            headPivot=(.16,.40,0);bodyHeight=.29;legHip=.24
            ell=[((-.10,.31,0),(.31,.20,.14)),((-.25,.31,0),(.18,.21,.151)),((.14,.36,0),(.15,.18,.11)),((.25,.48,0),(.13,.112,.095)),((.32,.46,0),(.10,.074,.08))]
            back='#82735e';belly='#d0c4ae';base='#a79473';face=base;earH=.255;earW=.034;eye=(.30,.521,.080);nose=(.416,.450,0)
        else:
            headPivot=(.10,.24,0);bodyHeight=.20;legHip=.18
            ell=[((-.06,.22,0),(.22,.115,.08)),((-.21,.20,0),(.13,.135,.09)),((.10,.24,0),(.10,.14,.074)),((.21,.30,0),(.095,.070,.066)),((.275,.278,0),(.064,.047,.049))]
            back='#874727';belly='#d6c8b5';base='#a65e33';face=base;earH=.095;earW=.028;eye=(.247,.323,.055);nose=(.340,.284,0)
        def coat(p):
            t=(1-smooth(bodyHeight-.12,bodyHeight+.025,p[1]))*(1-smooth(.24,.4,p[0]));b=smooth(bodyHeight+.04,bodyHeight+.15,p[1])*(1-smooth(.25,.4,p[0]));a=linear(base);l=linear(belly);d=linear(back)
            if fox:t=max(t,(1-smooth(.68,.74,p[1]))*smooth(.25,.40,p[0]));
            if deer:t=max(t,(1-smooth(-.43,-.34,p[0]))*.78)
            grain=.96+.045*math.sin(p[0]*73+p[1]*91)*math.cos(p[2]*137)
            return tuple((a[i]*(1-t)+l[i]*t)*(1-b*.50)*grain+d[i]*(b*.50) for i in range(3))
        m.sculpt(ell,base,coat,(headPivot[0]+.03,headPivot[1]-.08,headPivot))
        for side in [-1,1]:
            ep=(headPivot[0]+(.035 if fox else -.005),headPivot[1]+(.15 if deer else .08),side*(.072 if not squirrel else .050))
            m.ear(ep,earH,earW,back if hare else base,headPivot,'#745848' if fox else '#a5917b')
            m.ellipsoid((eye[0],eye[1],side*eye[2]),(.009 if squirrel else .014,.012 if squirrel else .016,.0055),'#181f19',6,headPivot,headPivot,1,eye=True)
            m.ellipsoid((eye[0]+.002,eye[1]+.004,side*(eye[2]+.005)),(.002,.002,.0012),'#ced4c8',6,headPivot,headPivot,1,eye=True)
        m.ellipsoid(nose,(.020 if deer else .013,.012,.025 if deer else .017),'#242b25',6,headPivot,headPivot,1,eye=True)
        for rear in [False,True]:
            for side in [-1,1]:
                x=-.27 if rear else .22 if fox or deer else .12
                hip=(x,legHip,side*(.111 if deer or fox else .08));joint=(x+(.08 if rear else -.025),legHip*.48,side*(.115 if deer or fox else .085));foot=(x+(.055 if rear else .05),.035,side*(.116 if deer or fox else .09))
                width=.032 if fox else .022 if deer else .026 if rear else .016
                if hare and rear:m.ellipsoid((x,.21,side*.095),(.11,.13,.086),base,3+(side>0),hip,joint,0)
                m.leg((3 if rear else 1)+(side>0),hip,joint,foot,width,'#463b30' if fox else base,hoof=deer,thigh=base if fox else None)
        if fox:
            tailPivot=(-.37,.60,0);points=[tailPivot,(-.54,.51,0),(-.73,.40,.018),(-.92,.40,.025),(-1.03,.43,.028)];m.tube(points,[.076,.092,.105,.086,.012],base,5,tailPivot,coat=lambda p:linear('#d7ccad') if p[0]<-.90 else linear('#a9673d'),segments=18)
        elif squirrel:
            pivot=(-.22,.24,0);m.tube([pivot,(-.34,.34,0),(-.40,.53,0),(-.33,.64,0),(-.20,.63,0),(-.13,.54,0)],[.035,.065,.089,.089,.065,.012],base,5,pivot,segments=18)
        else:m.ellipsoid((-.42 if deer else -.37,bodyHeight-.06,0),(.038,.040,.041),belly,5,(-.36,bodyHeight,0))
        if not deer:
            for side in [-1,1]:
                for j in range(5):m.tube([(nose[0]-.03,nose[1]-.018,side*.035),(nose[0]-.045-j*.006,nose[1]-.02+(j-2)*.009,side*(.10+j*.012))],[.0006,.00018],'#cfcbb8',6,headPivot,headPivot,1,segments=4)
    m.finish()

names=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else list(SIZES)
for name in names:
    if name not in SIZES:raise ValueError('Unknown species: '+name)
    mammal(name)
