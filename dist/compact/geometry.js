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
export function plantGeometry(taxon){const b=new GeometryBatch(),sphere=new THREE.SphereGeometry(1,8,5);
 if(taxon==='galium_odoratum'||taxon==='urtica_dioica'){
  const nettle=taxon==='urtica_dioica';stick(b,[0,0,0],[0,1,0],nettle?.012:.009,nettle?'#657744':'#6b7d45');
  for(let level=0;level<4;level++){const y=.25+level*.21,count=nettle?2:8;for(let i=0;i<count;i++){const a=i/count*Math.PI*2+(nettle?level*Math.PI/2:level*.18);b.add(leafGeometry(nettle?.37:.43,nettle?.23:.10,nettle,false,nettle?18:6),nettle?'#447037':'#5a8143',[0,y,0],[1,1,1],[-.14,a,0]);}}
 }else if(taxon==='halimione_portulacoides'){
  for(let i=0;i<7;i++){const a=i*2.399,end=[Math.cos(a)*.35,.65+(i%3)*.13,Math.sin(a)*.35];stick(b,[0,.03,0],end,.018,'#8b8b66');for(let j=1;j<6;j++)for(const side of [-1,1]){const t=j/6;b.add(sphere,j%2?'#9da88a':'#b6baa0',[end[0]*t+Math.cos(a+side*1.3)*.06,end[1]*t,end[2]*t+Math.sin(a+side*1.3)*.06],[.045,.018,.12],[.25,a+side*1.3,0]);}}
 }else if(taxon==='salicornia_europaea'){
  for(let branch=0;branch<5;branch++){const a=branch*2.4,h=branch? .48+.12*(branch%3):1;for(let j=0;j<5;j++){const y=j*h/5,spread=branch?y*.45:0,x=Math.cos(a)*spread,z=Math.sin(a)*spread;b.add(new THREE.CapsuleGeometry(.038,h/5*.72,3,7),'#5d8a49',[x,y+h/10,z],[1,1,1],[0,0,branch?-.24:0]);b.add(sphere,'#7b9859',[x,y,z],[.031,.025,.031]);}}
 }else if(taxon==='sporobolus_anglicus'){
  for(let i=0;i<13;i++){const a=i*2.399,r=(i%4)*.055,h=.6+(i%5)*.09,x=Math.cos(a)*r,z=Math.sin(a)*r;stick(b,[x,0,z],[x,h,z],.007,'#8c9650');for(let j=0;j<3;j++)b.add(leafGeometry(.65,.075),'#7e8a48',[x,.12+j*.18,z],[1,1,1],[-.6+j*.2,a+j*1.8,0]);if(i%3===0)for(let k=0;k<3;k++)stick(b,[x,h*.8,z],[x+.06,h+k*.04,z+.02*k],.006,'#b5a373');}
 }
 return b.geometry();
}
