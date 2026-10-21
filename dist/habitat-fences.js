import * as THREE from './vendor/three.module.js?revision=120';
import { AUTHORED_CENTERS,layoutPoint } from './world-layout.js?revision=120';
import { nearestTrail } from './trail.js?revision=120';
import { collisionContains } from './observation-tools.js?revision=120';
import { prepareStaticInstances } from './render-visibility.js?revision=120';

// The same nearest-centre boundaries used by the habitat map, clipped to land.
// A broad opening follows every actual boardwalk crossing and teaching bay.
export function buildHabitatFences(world,ponds,pondContains){
 const centres=Object.entries(AUTHORED_CENTERS),posts=[],twigs=[],panels=[],pose=new THREE.Object3D(),up=new THREE.Vector3(0,1,0);
 const open=p=>nearestTrail(p.x,p.z).offset<2.35||world.onLanding(p.x,p.z,.9)||world.deckHeight(p.x,p.z)!==null||ponds.some(q=>pondContains(q,p.x,p.z,-.2))||world.terrainHeight(p.x,p.z)<-.55||world.collisions.some(q=>['house','board','tree','permanentRoad'].includes(q.type)&&collisionContains(q,p.x,p.z,.22));
 const branch=(a,b,color)=>{const d=new THREE.Vector3(b.x-a.x,b.y-a.y,b.z-a.z),e=new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(up,d.clone().normalize()));twigs.push({x:(a.x+b.x)/2,y:(a.y+b.y)/2,z:(a.z+b.z)/2,sy:d.length(),rx:e.x,ry:e.y,rz:e.z,color});};
 for(let i=0;i<centres.length;i++)for(let j=i+1;j<centres.length;j++){
  const [left,a]=centres[i],[right,b]=centres[j],dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz),mid={x:(a.x+b.x)/2,z:(a.z+b.z)/2},dir={x:-dz/length,z:dx/length};let lo=-1000,hi=1000;
  const clip=(A,B)=>{if(Math.abs(A)<1e-8){if(B<0)hi=lo-1;}else if(A>0)hi=Math.min(hi,B/A);else lo=Math.max(lo,B/A);};
  clip(dir.x,219-mid.x);clip(-dir.x,mid.x+219);clip(dir.z,207-mid.z);clip(-dir.z,mid.z+211);
  for(const [,c]of centres){if(c===a||c===b)continue;clip(2*((c.x-a.x)*dir.x+(c.z-a.z)*dir.z),c.x*c.x+c.z*c.z-a.x*a.x-a.z*a.z-2*((c.x-a.x)*mid.x+(c.z-a.z)*mid.z));}
  if(hi<=lo)continue;const count=Math.ceil((hi-lo)/2.8);
  for(let k=0;k<count;k++){
   const at=t=>layoutPoint({x:mid.x+dir.x*t,z:mid.z+dir.z*t}),p=at(lo+(hi-lo)*k/count),q=at(lo+(hi-lo)*(k+1)/count),c={x:(p.x+q.x)/2,z:(p.z+q.z)/2};
   if([p,c,q].some(open))continue;
   const py=world.terrainHeight(p.x,p.z),qy=world.terrainHeight(q.x,q.z),n=panels.length,span=Math.hypot(q.x-p.x,q.z-p.z),rotation=Math.atan2(-(q.z-p.z),q.x-p.x);
   for(const [point,y]of [[p,py],[q,qy]])posts.push({...point,y:y+.49,sy:.98,sx:.065,sz:.061,rz:.012*Math.sin(n*7),color:n%3?'#aa9371':'#938268'});
   for(let row=0;row<6;row++){
    const h=.17+row*.104,offset=.033*(row%2?1:-1),nx=-(q.z-p.z)/span,nz=(q.x-p.x)/span;
    const m={x:c.x-nx*offset,y:(py+qy)/2+h+.021*Math.sin(n+row),z:c.z-nz*offset};
    branch({x:p.x+nx*offset,y:py+h,z:p.z+nz*offset},m,row%2?'#8c7759':'#a38b69');branch(m,{x:q.x+nx*offset,y:qy+h,z:q.z+nz*offset},row%2?'#8c7759':'#a38b69');
   }
   const panel={...c,halfX:span/2,halfZ:.065,r:span/2+.08,rotation,height:.84,type:'habitatFence',habitats:[left,right],a:p,b:q};panels.push(panel);world.collisions.push(panel);
  }
 }
 const material=world.material({map:world.bark,color:'#c3bca7',roughness:1});
 const instance=(geometry,placements)=>{const mesh=new THREE.InstancedMesh(geometry,material,placements.length);placements.forEach((p,i)=>{pose.position.set(p.x,p.y,p.z);pose.rotation.set(p.rx||0,p.ry||0,p.rz||0);pose.scale.set(p.sx||1,p.sy||1,p.sz||1);pose.updateMatrix();mesh.setMatrixAt(i,pose.matrix);if(p.color)mesh.setColorAt(i,new THREE.Color(p.color));});mesh.castShadow=true;mesh.receiveShadow=true;mesh.computeBoundingSphere();prepareStaticInstances(mesh,placements);mesh.userData.habitatFence=true;world.root.add(mesh);};
 instance(new THREE.CylinderGeometry(1,.92,1,6),posts);instance(new THREE.CylinderGeometry(.022,.026,1,5),twigs);
 world.habitatFences=panels;world.habitatFenceStats={panels:panels.length,posts:posts.length,branches:twigs.length,habitats:[...new Set(panels.flatMap(p=>p.habitats))]};
}
