import * as THREE from '../vendor/three.module.js?revision=120';
export class GeometryBatch{
 constructor(){this.p=[];this.n=[];this.c=[];}
 add(geometry,color,position=[0,0,0],scale=[1,1,1],rotation=[0,0,0]){
  const g=geometry.index?geometry.toNonIndexed():geometry.clone();g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...position),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),new THREE.Vector3(...scale)));
  const p=g.attributes.position,n=g.attributes.normal,col=new THREE.Color(color);for(let i=0;i<p.count;i++){this.p.push(p.getX(i),p.getY(i),p.getZ(i));this.n.push(n.getX(i),n.getY(i),n.getZ(i));this.c.push(col.r,col.g,col.b);}g.dispose();return this;
 }
 geometry(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(this.n,3));g.setAttribute('color',new THREE.Float32BufferAttribute(this.c,3));g.computeBoundingSphere();return g;}
 mesh(material={}){const m=new THREE.Mesh(this.geometry(),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.94,...material}));m.castShadow=true;m.receiveShadow=true;return m;}
}
export function stick(batch,a,b,r,color,rTop=r*.7){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),diff=end.clone().sub(start);const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),diff.clone().normalize()),e=new THREE.Euler().setFromQuaternion(q);batch.add(new THREE.CylinderGeometry(rTop,r,diff.length(),7),color,start.add(end).multiplyScalar(.5).toArray(),[1,1,1],e.toArray().slice(0,3));}
export function leafGeometry(length=1,width=.3,serrated=false,lobed=false,steps=18){const p=[],indices=[];for(let i=0;i<=steps;i++){const t=i/steps,w=Math.sin(Math.PI*t)**.7*width/2*(serrated?(i%2?.77:1):lobed?.7+.3*Math.cos(t*8*Math.PI):1),y=Math.sin(t*Math.PI)*length*.06;p.push(-w,y,length*t,0,y+.012*length,length*t,w,y,length*t);if(i<steps){const a=i*3;indices.push(a,a+3,a+1,a+1,a+3,a+4,a+1,a+4,a+2,a+2,a+4,a+5);}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(indices);g.computeVertexNormals();return g;}
export function plantGeometry(taxon,remaining=1,window='summer'){const b=new GeometryBatch(),sphere=new THREE.SphereGeometry(1,8,5);
 if(taxon==='galium_odoratum'||taxon==='urtica_dioica'){
  const nettle=taxon==='urtica_dioica';stick(b,[0,0,0],[0,1,0],nettle?.012:.009,nettle?'#657744':'#6b7d45');
  for(let level=0;level<4;level++){const y=.25+level*.21,count=nettle?2:8;for(let i=0;i<count;i++){if(nettle&&level*2+i>=Math.ceil(8*remaining))continue;const a=i/count*Math.PI*2+(nettle?level*Math.PI/2:level*.18);b.add(leafGeometry(nettle?.37:.43,nettle?.23:.10,nettle,false,nettle?18:6),nettle?'#447037':'#5a8143',[0,y,0],[1,1,1],[-.14,a,0]);if(nettle)for(let k=1;k<4;k++)stick(b,[Math.sin(a)*.09,y,Math.cos(a)*.09],[Math.sin(a)*.09,y+.025,Math.cos(a)*.09],.001,'#c1c599',.0003);}}
  if(!nettle&&window==='spring')for(let i=0;i<3;i++){const x=(i-1)*.08;stick(b,[0,.9,0],[x,1.05,0],.005,'#73854e');for(let k=0;k<4;k++){const a=k*Math.PI/2;b.add(sphere,'#e7e6d1',[x+Math.sin(a)*.033,1.05,Math.cos(a)*.033],[.024,.008,.024]);}}
 }else if(taxon==='halimione_portulacoides'){
  for(let i=0;i<7;i++){const a=i*2.399,end=[Math.cos(a)*.35,.65+(i%3)*.13,Math.sin(a)*.35];stick(b,[0,.03,0],end,.018,'#8b8b66');for(let j=1;j<6;j++)for(const side of [-1,1]){const t=j/6;b.add(sphere,j%2?'#9da88a':'#b6baa0',[end[0]*t+Math.cos(a+side*1.3)*.06,end[1]*t,end[2]*t+Math.sin(a+side*1.3)*.06],[.045,.018,.12],[.25,a+side*1.3,0]);}}
 }else if(taxon==='salicornia_europaea'){
  for(let branch=0;branch<5;branch++){const a=branch*2.4,h=branch? .48+.12*(branch%3):1;for(let j=0;j<5;j++){const y=j*h/5,spread=branch?y*.45:0,x=Math.cos(a)*spread,z=Math.sin(a)*spread;b.add(new THREE.CapsuleGeometry(.038,h/5*.72,3,7),'#5d8a49',[x,y+h/10,z],[1,1,1],[0,0,branch?-.24:0]);b.add(sphere,'#7b9859',[x,y,z],[.031,.025,.031]);}}
 }else if(taxon==='sporobolus_anglicus'){
  for(let i=0;i<13;i++){const a=i*2.399,r=(i%4)*.055,h=.6+(i%5)*.09,x=Math.cos(a)*r,z=Math.sin(a)*r;stick(b,[x,0,z],[x,h,z],.007,'#8c9650');for(let j=0;j<3;j++)b.add(leafGeometry(.65,.075),'#7e8a48',[x,.12+j*.18,z],[1,1,1],[-.6+j*.2,a+j*1.8,0]);if(i%3===0)for(let k=0;k<3;k++)stick(b,[x,h*.8,z],[x+.06,h+k*.04,z+.02*k],.006,'#b5a373');}
 }else if(taxon==='rubus_fruticosus'){
  for(let i=0;i<Math.max(1,Math.ceil(5*remaining));i++){const a=i*2.399;let old=[0,.02,0];for(let j=1;j<7;j++){const t=j/6,p=[Math.cos(a)*t*.75,Math.sin(t*Math.PI)*.7+.15,Math.sin(a)*t*.75];stick(b,old,p,.012,'#6d6949');stick(b,p,[p[0]+.035,p[1]-.025,p[2]],.006,'#987c5a',.001);if(j%2)for(let k=-1;k<=1;k++)b.add(leafGeometry(.28,.15,true),'#48643b',p,[1,1,1],[.15,a+k*.7,0]);if(j===5&&window!=='spring')for(let k=0;k<7;k++)b.add(sphere,k%2?'#382e32':'#6c393e',[p[0]+Math.sin(k*2.4)*.025,p[1]-.06+k*.005,p[2]+Math.cos(k*2.4)*.025],[.018,.018,.018]);old=p;}}
 }else if(taxon==='trifolium_pratense'){
  for(let i=0;i<3;i++){const a=i*2.1,p=[Math.sin(a)*.15,.5+i*.15,Math.cos(a)*.15];stick(b,[0,0,0],p,.014,'#6e854b');for(let k=0;k<3;k++)b.add(leafGeometry(.34,.23),'#5c7b43',p,[1,1,1],[-.1,a+k*2.1,0]);}stick(b,[0,.1,0],[0,.93,0],.013,'#6e854b');for(let i=0;i<36;i++){const a=i*2.399,y=.83+i/36*.25,r=Math.sqrt(Math.max(0,1-((y-.95)/.13)**2))*.12;b.add(sphere,i%3?'#a65a80':'#c882a1',[Math.cos(a)*r,y,Math.sin(a)*r],[.027,.055,.027],[Math.cos(a)*.2,0,Math.sin(a)*.2]);}
 }else if(taxon==='festuca_rubra'||taxon==='puccinellia_maritima'){
  const andel=taxon==='puccinellia_maritima';for(let i=0;i<16;i++){const a=i*2.399,r=i%4*.025,x=Math.cos(a)*r,z=Math.sin(a)*r,h=.45+i%5*.12;stick(b,[x,0,z],[x,h,z],.0035,andel?'#849784':'#8b8b55');b.add(leafGeometry(.7,andel?.022:.012),andel?'#82947d':'#71804b',[x,.02,z],[1,1,1],[-.5,a,0]);if(i%4===0)for(let j=0;j<5;j++){const y=h-.12+j*.04,spread=andel?.12:.035;for(const side of [-1,1]){const end=[x+side*spread,y+.05,z+Math.sin(j)*spread];stick(b,[x,y,z],end,.0025,'#a8a27a');b.add(sphere,'#a8a27a',end,[.009,.024,.007]);}}}
 }else if(taxon==='limonium_vulgare'){
  for(let i=0;i<9;i++)b.add(leafGeometry(.46,.17),'#647c4c',[0,.015,0],[1,1,1],[-.05,i*2.399,0]);if(window!=='spring'){stick(b,[0,0,0],[0,.8,0],.012,'#6f8156');for(let i=0;i<9;i++){const a=i*2.399,p=[Math.cos(a)*.33,.55+i*.035,Math.sin(a)*.33];stick(b,[0,.3+i*.04,0],p,.006,'#788561');for(let j=0;j<4;j++)b.add(sphere,window==='summer'?'#a48bb8':'#8d8069',[p[0]+j*.016,p[1]+j*.012,p[2]],[.014,.017,.014]);}}
 }else if(taxon==='fagus_sylvatica'||taxon==='quercus_robur'){
  const oak=taxon==='quercus_robur';stick(b,[0,.15,0],[.8,.3,0],.018,oak?'#76694e':'#8a8979');for(let i=0;i<7;i++)b.add(leafGeometry(.32,.2,false,oak,24),oak?'#6a7a40':'#6d8846',[.1+i*.09,.2+i*.012,0],[1,1,1],[.18,i%2?1:-1,0]);
 }
 return b.geometry();
}
