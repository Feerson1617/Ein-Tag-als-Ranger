import * as THREE from '../vendor/three.module.js?revision=120';
export class GeometryBatch{
 constructor(){this.p=[];this.n=[];this.c=[];}
 add(geometry,color,position=[0,0,0],scale=[1,1,1],rotation=[0,0,0]){
  const g=geometry.index?geometry.toNonIndexed():geometry.clone();g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...position),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),new THREE.Vector3(...scale)));
  const p=g.attributes.position,n=g.attributes.normal,col=new THREE.Color(color);for(let i=0;i<p.count;i++){this.p.push(p.getX(i),p.getY(i),p.getZ(i));this.n.push(n.getX(i),n.getY(i),n.getZ(i));const tint=g.attributes.color;this.c.push(col.r*(tint?tint.getX(i):1),col.g*(tint?tint.getY(i):1),col.b*(tint?tint.getZ(i):1));}g.dispose();return this;
 }
 geometry(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(this.n,3));g.setAttribute('color',new THREE.Float32BufferAttribute(this.c,3));g.computeBoundingSphere();return g;}
 mesh(material={}){const m=new THREE.Mesh(this.geometry(),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.94,...material}));m.castShadow=true;m.receiveShadow=true;return m;}
}
export function stick(batch,a,b,r,color,rTop=r*.7){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),diff=end.clone().sub(start);const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),diff.clone().normalize()),e=new THREE.Euler().setFromQuaternion(q);batch.add(new THREE.CylinderGeometry(rTop,r,diff.length(),r<.03?6:9),color,start.add(end).multiplyScalar(.5).toArray(),[1,1,1],e.toArray().slice(0,3));}
export function leafGeometry(length=1,width=.3,serrated=false,lobed=false,steps=18){if(lobed)return oakLeafGeometry(length,width);const p=[],indices=[],colors=[];for(let i=0;i<=steps;i++){const t=i/steps,w=Math.sin(Math.PI*t)**.7*width/2*(serrated?(i%2?.77:1):lobed?.72+.24*Math.cos((t-.07)*10*Math.PI):1),y=Math.sin(t*Math.PI)*length*.085;p.push(-w,y,length*t,0,y+.012*length,length*t,w,y,length*t);const edge=.76+.18*Math.sin(t*Math.PI);colors.push(edge,edge,edge,1.14,1.12,1.02,edge+.04,edge+.04,edge+.04);if(i<steps){const a=i*3;indices.push(a,a+3,a+1,a+1,a+3,a+4,a+1,a+4,a+2,a+2,a+4,a+5);}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(indices);g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;}

// Rounded oak lobes and basal auricles, drawn as curves rather than a sawtooth
// multiplier. The short petiole is authored by the branch, outside this blade.
function oakLeafGeometry(length,width){
 const commands=[[[.05,0],[.32,-.035],[.38,.025]],[[.48,.08],[.27,.13],[.22,.16]],[[.36,.20],[.81,.15],[.88,.25]],[[.96,.35],[.50,.34],[.43,.39]],[[.55,.45],[1.08,.39],[1,.51]],[[.94,.62],[.51,.57],[.44,.63]],[[.53,.69],[.85,.66],[.74,.77]],[[.64,.86],[.34,.80],[.27,.88]],[[.32,.96],[.13,1.01],[0,1]]];
 const shape=new THREE.Shape();shape.moveTo(0,0);const starts=[[0,0]];for(const c of commands){shape.bezierCurveTo(...c.flat());starts.push(c[2]);}for(let i=commands.length-1;i>=0;i--){const c=commands[i],start=starts[i];shape.bezierCurveTo(-c[1][0],c[1][1],-c[0][0],c[0][1],-start[0],start[1]);}shape.closePath();
 const blade=new THREE.ShapeGeometry(shape,12),p=blade.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i)*width*.5,t=p.getY(i);p.setXYZ(i,x,Math.sin(t*Math.PI)*length*.055-Math.abs(x)*.07,t*length);}blade.computeVertexNormals();
 const batch=new GeometryBatch();batch.add(blade,'#ffffff');const mid=t=>Math.sin(t*Math.PI)*length*.055+.001;
 curvedStem(batch,[[0,.001,0],[0,mid(.5),length*.5],[0,.001,length]],.0008,'#b6ba80',.0002,12);
 for(const t of [.19,.36,.53,.70,.83])for(const side of [-1,1])curvedStem(batch,[[0,mid(t-.06),(t-.06)*length],[side*width*.18,mid(t)-width*.012,t*length],[side*width*.37,mid(t+.04)-width*.025,(t+.04)*length]],.00045,'#a5ad76',.0001,5);
 return batch.geometry();
}

export function sweptGeometry(points,radii,sides=8){
 const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),steps=points.length-1,frames=curve.computeFrenetFrames(steps,false),p=[],index=[];
 for(let i=0;i<=steps;i++){
  const center=curve.getPointAt(i/steps),radius=Array.isArray(radii)?radii[i]:radii;
  for(let k=0;k<=sides;k++){const a=k/sides*Math.PI*2,v=center.clone().addScaledVector(frames.normals[i],Math.cos(a)*radius).addScaledVector(frames.binormals[i],Math.sin(a)*radius);p.push(v.x,v.y,v.z);if(i<steps&&k<sides){const n=i*(sides+1)+k;index.push(n,n+1,n+sides+1,n+1,n+sides+2,n+sides+1);}}
 }
 // Closed caps; all diameters are genuine geometry, no disconnected beads.
 for(const end of [0,steps]){const c=curve.getPointAt(end/steps),v=p.length/3;p.push(c.x,c.y,c.z);for(let k=0;k<sides;k++){const a=end*(sides+1)+k;index.push(...(end?[v,a,a+1]:[v,a+1,a]));}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(index);g.computeVertexNormals();return g;
}
export function curvedStem(batch,points,r,color,tip=.003,segments=8){
 const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),rows=Array.from({length:segments+1},(_,i)=>curve.getPoint(i/segments).toArray()),radii=rows.map((_,i)=>r+(tip-r)*i/segments);
 batch.add(sweptGeometry(rows,radii,7),color);
}

// Closed, fleshy blade: the thin edge remains a volume when seen obliquely.
// Local +Z runs from the short petiole towards the rounded leaf tip.
export function succulentLeafGeometry(length=.26,width=.12,rows=6,sides=6){
 const p=[],index=[];
 for(let j=0;j<=rows;j++){
  const t=j/rows,outline=Math.sin(Math.PI*t)**.65,centre=.022*Math.sin(Math.PI*t);
  for(let k=0;k<=sides;k++){
   const a=k/sides*Math.PI*2;p.push(Math.cos(a)*width*.5*outline,centre+Math.sin(a)*.009*outline,length*t);
   if(j<rows&&k<sides){const n=j*(sides+1)+k;index.push(n,n+1,n+sides+1,n+1,n+sides+2,n+sides+1);}
  }
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(index);g.computeVertexNormals();return g;
}

// Three deterministic shapes per existing forest cell; no new plants, no
// relocation, no new randomness in the biological model. Keilmelde is untouched.
export function plantVariant(p){return ['galium_odoratum','urtica_dioica','rubus_fruticosus','trifolium_pratense'].includes(p.taxon)?((Math.floor(p.x/8)*17+Math.floor(p.z/8)*13)%3+3)%3-1:0;}
export function bendPlantGeometry(g,variant){if(!variant)return g;const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);p.setXYZ(i,x+variant*.065*y*y,y,z+variant*.045*Math.sin(y*3.2)*y);}g.computeVertexNormals();return g;}
export function plantGeometry(taxon,remaining=1,window='summer',detail='near',variant=0){const b=new GeometryBatch(),sphere=new THREE.SphereGeometry(1,8,5),near=detail==='near',middle=detail==='middle';
 if(taxon==='galium_odoratum'||taxon==='urtica_dioica'){
  const nettle=taxon==='urtica_dioica';stick(b,[0,0,0],[0,1,0],nettle?.012:.009,nettle?'#657744':'#6b7d45');
  for(let level=0;level<4;level++){const y=.25+level*.21,count=nettle?2:8;for(let i=0;i<count;i++){if(nettle&&level*2+i>=Math.ceil(8*remaining))continue;const a=i/count*Math.PI*2+(nettle?level*Math.PI/2:level*.18);b.add(leafGeometry(nettle?.37:.43,nettle?.23:.10,nettle,false,nettle?14:8),nettle?'#447037':'#5a8143',[0,y,0],[1,1,1],[-.14,a,0]);if(nettle)for(let k=1;k<4;k++)stick(b,[Math.sin(a)*.09,y,Math.cos(a)*.09],[Math.sin(a)*.09,y+.025,Math.cos(a)*.09],.001,'#c1c599',.0003);}}
  if(!nettle&&window==='spring')for(let i=0;i<3;i++){const x=(i-1)*.08;stick(b,[0,.9,0],[x,1.05,0],.005,'#73854e');for(let k=0;k<4;k++){const a=k*Math.PI/2;b.add(sphere,'#e7e6d1',[x+Math.sin(a)*.033,1.05,Math.cos(a)*.033],[.024,.008,.024]);}}
 }else if(taxon==='halimione_portulacoides'){
  // Woody, decumbent axes with paired opposite fleshy blades, not bead trees.
  const blade=succulentLeafGeometry(.26,.12,near?6:middle?3:2,near?6:4);
  for(let i=0;i<(near?6:middle?4:3);i++){
   const a=i*2.399,h=.52+.19*Math.sin(i*1.7)**2,spread=.36+.14*Math.cos(i*2.1)**2;
   const points=[[0,.02,0],[Math.cos(a)*spread*.55,h*.23,Math.sin(a)*spread*.55],[Math.cos(a)*spread,h,Math.sin(a)*spread]];
   const axis=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));curvedStem(b,points,.015,'#87856a',.003,near?8:4);
   for(let j=1;j<(near?5:4);j++)for(const side of [-1,1]){
    const t=j/(near?5:4),angle=a+side*Math.PI/2+(j%2)*Math.PI/2,point=axis.getPoint(t),size=.76+.24*Math.sin(t*Math.PI);
    b.add(blade,j%2?'#899c83':'#aab29a',point.toArray(),[size,size,size],[-.18-(i%3)*.14,angle,side*.16]);
   }
  }
  blade.dispose();
 }else if(taxon==='salicornia_europaea'){
  // Continuous succulent axis with constrictions and opposite lateral shoots.
  const axis=(a,base,h,lean)=>{
   const points=[],radii=[];for(let j=0;j<=24;j++){const t=j/24,rad=.033*(1-.72*t)*(1-.27*Math.cos(t*6*Math.PI*2));points.push([base[0]+Math.cos(a)*lean*t,base[1]+h*t,base[2]+Math.sin(a)*lean*t]);radii.push(rad);}
   b.add(sweptGeometry(points,radii,6),'#6d9456');
  };
  axis(0,[0,0,0],.92,.025);
  for(let level=0;level<(near?3:2);level++)for(const side of [-1,1]){
   const a=level*1.53+(side<0?Math.PI:0),y=.15+level*.19,h=.51-level*.11;
   axis(a,[0,y,0],h,.17+.04*level);
   if(near&&level===0)axis(a+.55,[Math.cos(a)*.11,y+h*.55,Math.sin(a)*.11],.20,.09);
  }
 }else if(taxon==='sporobolus_anglicus'){
  for(let i=0;i<(near?9:middle?6:3);i++){
   const a=i*2.399,r=(i%4)*.045,h=.67+.19*Math.sin(i*1.81)**2,x=Math.cos(a)*r,z=Math.sin(a)*r;
   curvedStem(b,[[x,0,z],[x+.035*Math.sin(a),h*.5,z],[x+.08*Math.sin(a),h,z+.025]],.007,'#8c9650',.002,5);
   for(let j=0;j<(near?3:2);j++)b.add(leafGeometry(.55+.09*Math.sin(i+j),.065,false,false,near?8:4),'#7e8a48',[x,.12+j*.18,z],[1,1,1],[-.85+j*.18,a+j*Math.PI,0]);
   if(i%3===0)for(let k=0;k<3;k++)stick(b,[x,h*.78+k*.035,z],[x+.055,h+.08+k*.025,z+.025*k],.006,'#b5a373',.003);
  }
 }else if(taxon==='rubus_fruticosus'){
  for(let i=0;i<Math.max(1,Math.ceil(5*remaining));i++){const a=i*2.399;let old=[0,.02,0];for(let j=1;j<7;j++){const t=j/6,p=[Math.cos(a)*t*.75,Math.sin(t*Math.PI)*.7+.15,Math.sin(a)*t*.75];stick(b,old,p,.012,'#6d6949');stick(b,p,[p[0]+.035,p[1]-.025,p[2]],.006,'#987c5a',.001);if(j%2)for(let k=-1;k<=1;k++)b.add(leafGeometry(.28,.15,true,false,10),'#48643b',p,[1,1,1],[.15,a+k*.7,0]);if(j===5&&window!=='spring')for(let k=0;k<7;k++)b.add(sphere,k%2?'#382e32':'#6c393e',[p[0]+Math.sin(k*2.4)*.025,p[1]-.06+k*.005,p[2]+Math.cos(k*2.4)*.025],[.018,.018,.018]);old=p;}}
 }else if(taxon==='trifolium_pratense'){
  for(let i=0;i<3;i++){const a=i*2.1,p=[Math.sin(a)*.15,.5+i*.15,Math.cos(a)*.15];stick(b,[0,0,0],p,.014,'#6e854b');for(let k=0;k<3;k++)b.add(leafGeometry(.34,.23,false,false,8),'#5c7b43',p,[1,1,1],[-.1,a+k*2.1,0]);}stick(b,[0,.1,0],[0,.93,0],.013,'#6e854b');for(let i=0;i<36;i++){const a=i*2.399,y=.83+i/36*.25,r=Math.sqrt(Math.max(0,1-((y-.95)/.13)**2))*.12;b.add(sphere,i%3?'#a65a80':'#c882a1',[Math.cos(a)*r,y,Math.sin(a)*r],[.027,.055,.027],[Math.cos(a)*.2,0,Math.sin(a)*.2]);}
 }else if(taxon==='festuca_rubra'||taxon==='puccinellia_maritima'){
  const andel=taxon==='puccinellia_maritima';
  for(let i=0;i<(near?12:middle?7:4);i++){
   const a=i*2.399,r=i%4*.025,x=Math.cos(a)*r,z=Math.sin(a)*r,h=.46+.30*Math.sin(i*1.81)**2,lean=.10*Math.sin(i*1.17);
   curvedStem(b,[[x,0,z],[x+lean*.3,h*.55,z],[x+lean,h,z+.035]],.0035,andel?'#849784':'#8b8b55',.0015,4);
   b.add(leafGeometry(.62+(i%3)*.06,andel?.024:.013,false,false,near?8:4),andel?'#82947d':'#71804b',[x,.02,z],[1,1,1],[-1.15+(i%3)*.12,a,0]);
   if(i%4===0)for(let j=0;j<4;j++)for(const side of [-1,1]){
    const y=h-.16+j*.05,spread=(andel?.13:.038)*(1-j*.18),end=[x+lean+side*spread,y+.07,z+Math.sin(j)*spread];
    stick(b,[x+lean,y,z],end,.0025,'#a8a27a',.001);b.add(sphere,'#a8a27a',end,[.008,.021,.006]);
   }
  }
 }else if(taxon==='limonium_vulgare'){
  for(let i=0;i<(near?9:5);i++)b.add(leafGeometry(.40+.10*Math.sin(i*1.7)**2,.14,false,false,near?8:4),'#647c4c',[0,.015,0],[1,1,1],[-.07-(i%3)*.07,i*2.399,0]);if(window!=='spring'){stick(b,[0,0,0],[0,.8,0],.012,'#6f8156');for(let i=0;i<9;i++){const a=i*2.399,p=[Math.cos(a)*.33,.55+i*.035,Math.sin(a)*.33];stick(b,[0,.3+i*.04,0],p,.006,'#788561');for(let j=0;j<4;j++)b.add(sphere,window==='summer'?'#a48bb8':'#8d8069',[p[0]+j*.016,p[1]+j*.012,p[2]],[.014,.017,.014]);}}
 }else if(taxon==='fagus_sylvatica'||taxon==='quercus_robur'){
  const oak=taxon==='quercus_robur';curvedStem(b,[[0,.15,0],[.38,.23,.018],[.8,.3,-.015]],.014,oak?'#76694e':'#8a8979',.004,10);for(let i=0;i<7;i++){const a=(i%2?1:-1)*(1.08+.12*Math.sin(i*2)),y=.17+i*.017,x=.10+i*.09,petiole=oak?.009:.025;stick(b,[x,y,0],[x+Math.sin(a)*petiole,y,Math.cos(a)*petiole],.0025,'#8a8857',.0015);const origin=[x+Math.sin(a)*petiole,y,Math.cos(a)*petiole],rotation=[.12+.13*Math.sin(i*1.7),a,.06*Math.cos(i)];b.add(leafGeometry(.31,.18,false,oak,oak?80:28),oak?'#6a7a40':'#6d8846',origin,[1,1,1],rotation);}
 }
 return bendPlantGeometry(b.geometry(),variant);
}
