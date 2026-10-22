import * as THREE from '../vendor/three.module.js?revision=120';
import { readWildlifeGLB } from '../wildlife-glb.js';
import { createOrganism } from './organism-models.js';
import { MANIFEST } from './manifest.js';
import { terrainHeight } from './layout.js';
import { plantGeometry,leafGeometry } from './geometry.js';
import { CATALOG } from './catalog.js';

function quadrupedPose(mesh,a,time){
 const g=mesh.geometry,rig=g.attributes.rigData,joints=g.attributes.rigJoint,p=g.attributes.position,n=g.attributes.normal;
 if(!mesh.poseCache){const legs=new Map();for(let part=1;part<=4;part++){let i=0;while(i<rig.count&&rig.getX(i)!==part)i++;const hip=[rig.getY(i),rig.getZ(i)],knee=[joints.getX(i),joints.getY(i)],foot=g.userData.legFeet[part];legs.set(part,{hip,knee,foot,upper:Math.hypot(knee[0]-hip[0],knee[1]-hip[1]),lower:Math.hypot(foot[0]-knee[0],foot[1]-knee[1])});}mesh.poseCache={legs,rest:p.array.slice(),normals:n.array.slice()};}
 const {legs,rest,normals}=mesh.poseCache,scale=mesh.scale.x,moving=['stalking','attempting'].includes(a.activity),poses=new Map(),base=terrainHeight(a.x,a.z)-.006;
 mesh.position.set(a.x,base,a.z);mesh.rotation.y=-a.heading;a.feet=[];
 for(const [part,l]of legs){const phase=(time*.9+[0,.5,.75,.25][part-1])%1,swing=phase>.65?(phase-.65)/.35:0,lift=moving&&swing?.04*Math.sin(swing*Math.PI):0,offset=moving?(phase<.65?.08-.16*phase/.65:-.08+.16*swing):0,fx=l.foot[0]+offset/scale,wx=a.x+Math.cos(a.heading)*fx*scale-Math.sin(a.heading)*l.foot[2]*scale,wz=a.z+Math.sin(a.heading)*fx*scale+Math.cos(a.heading)*l.foot[2]*scale,fy=(terrainHeight(wx,wz)-base+lift)/scale+l.foot[1],dx=fx-l.hip[0],dy=fy-l.hip[1],dist=Math.min(l.upper+l.lower-.00001,Math.max(.001,Math.hypot(dx,dy))),theta=Math.atan2(dy,dx)+(part<3?-1:1)*Math.acos(Math.max(-1,Math.min(1,(l.upper*l.upper+dist*dist-l.lower*l.lower)/(2*l.upper*dist)))),kx=l.hip[0]+Math.cos(theta)*l.upper,ky=l.hip[1]+Math.sin(theta)*l.upper;
  poses.set(part,{upper:theta-Math.atan2(l.knee[1]-l.hip[1],l.knee[0]-l.hip[0]),lower:Math.atan2(fy-ky,fx-kx)-Math.atan2(l.foot[1]-l.knee[1],l.foot[0]-l.knee[0]),kx,ky,fx,fy});a.feet.push({part,swing:lift>0,geometryGap:Infinity});}
 for(let i=0;i<p.count;i++){const part=rig.getX(i),leg=legs.get(part),pose=poses.get(part);let x=rest[i*3],y=rest[i*3+1],z=rest[i*3+2],nx=normals[i*3],ny=normals[i*3+1],nz=normals[i*3+2];if(leg){const kind=joints.getW(i);if(kind>1.5){x+=pose.fx-leg.foot[0];y+=pose.fy-leg.foot[1];}else{const angle=kind>.5?pose.lower:pose.upper,origin=kind>.5?leg.knee:leg.hip,tx=kind>.5?pose.kx:origin[0],ty=kind>.5?pose.ky:origin[1],c=Math.cos(angle),s=Math.sin(angle),vx=x-origin[0],vy=y-origin[1];x=tx+c*vx-s*vy;y=ty+s*vx+c*vy;const old=nx;nx=c*nx-s*ny;ny=s*old+c*ny;}}
  p.setXYZ(i,x,y,z);n.setXYZ(i,nx,ny,nz);if(leg&&joints.getW(i)>1.5){const wx=a.x+Math.cos(a.heading)*x*scale-Math.sin(a.heading)*z*scale,wz=a.z+Math.sin(a.heading)*x*scale+Math.cos(a.heading)*z*scale;const f=a.feet.find(f=>f.part===part);f.geometryGap=Math.min(f.geometryGap,base+y*scale-terrainHeight(wx,wz));}}
 p.needsUpdate=true;n.needsUpdate=true;g.computeBoundingSphere();
}
// Attach the resource to the actual bill endpoint, including head motion.
export function attachCarriedAcorn(jay){
 if(!jay.beakContact)throw Error('Eicheltransport benötigt den tatsächlichen Schnabelkontakt.');
 const acorn=new THREE.Mesh(new THREE.SphereGeometry(.08,8,5),new THREE.MeshStandardMaterial({color:'#967449',roughness:1}));acorn.name='carried-acorn';acorn.scale.set(1,1.4,1);acorn.position.y=-.08*acorn.scale.y;jay.beakContact.add(acorn);return acorn;
}
export async function createExpandedView(scene,state,world,reference){
 const models=new Map(),roots=[],treeSamples=[];
 const response=await fetch(MANIFEST.assets.fox);if(!response.ok)throw Error('Fuchsmodell konnte nicht geladen werden.');const foxGeometry=readWildlifeGLB(await response.arrayBuffer(),'fox'),fox=new THREE.Mesh(foxGeometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.96}));fox.scale.setScalar(CATALOG.vulpes_vulpes.length/(foxGeometry.boundingBox.max.x-foxGeometry.boundingBox.min.x));fox.userData={taxon:'vulpes_vulpes',stage:'adult'};
 for(const a of state.ecology.actors){const model=a.taxon==='vulpes_vulpes'?fox:createOrganism(a.taxon,a.stage);scene.add(model);models.set(a.id,model);roots.push(model);}
 for(const type of ['beech','oak']){const t=state.trees.find(t=>t.type===type);if(!t)throw Error('Baumstruktur fehlt: '+type);const taxon=type==='beech'?'fagus_sylvatica':'quercus_robur',sample={id:t.id,individualId:t.id,taxon,x:t.x+t.r,z:t.z,y:terrainHeight(t.x,t.z)+1.1,size:.5,treeId:t.id,aimY:terrainHeight(t.x,t.z)+1.25};const model=createOrganism(taxon);model.position.set(sample.x,sample.y,sample.z);scene.add(model);models.set(t.id,model);treeSamples.push(sample);}
 state.treeSamples=treeSamples;
 const acorns=[],litter=[];
 for(let i=0;i<4;i++){const seed=new THREE.Mesh(new THREE.SphereGeometry(.009,8,5),new THREE.MeshStandardMaterial({color:'#9a774a',roughness:1}));seed.scale.set(1,1.5,1);seed.position.set(-38+i*.08,terrainHeight(-38,-9)+.012,-9);scene.add(seed);acorns.push(seed);}
 for(let i=0;i<6;i++){const leaf=new THREE.Mesh(leafGeometry(.12,.07),new THREE.MeshStandardMaterial({color:'#806047',side:THREE.DoubleSide,roughness:1}));leaf.position.set(-61+i*.035,terrainHeight(-61,-2.7)+.012,-2.7);scene.add(leaf);litter.push(leaf);}
 const carriedAcorn=attachCarriedAcorn(models.get('compact-jay'));
 const affected=new Map();for(const resource of ['nettle-leaf','browse-shoot']){const r=state.ecology.resources[resource],p=state.plants.find(p=>p.id===r.id);const geometry=plantGeometry(p.taxon),mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.9}));mesh.position.set(p.x,p.y,p.z);mesh.rotation.y=p.angle;mesh.scale.setScalar(p.size);scene.add(mesh);models.set(p.id,mesh);affected.set(resource,{p,mesh,last:1});const instanced=world.plantMeshes.find(m=>m.userData.taxon===p.taxon),index=instanced.userData.rows.findIndex(row=>row.id===p.id),matrix=new THREE.Matrix4().makeScale(0,0,0);instanced.setMatrixAt(index,matrix);instanced.instanceMatrix.needsUpdate=true;}
 const foxShadow=reference.shadow.clone();foxShadow.geometry=new THREE.PlaneGeometry(.95,.3);foxShadow.geometry.rotateX(-Math.PI/2);scene.add(foxShadow);let lastWindow=state.ecology.window;
 function update(observer={x:0,z:0}){
  const e=state.ecology;reference.deer.visible=e.window!=='dusk';reference.shadow.visible=e.window!=='dusk';foxShadow.visible=e.window==='dusk';const f=e.actors.find(a=>a.id==='compact-fox');foxShadow.position.set(f.x,terrainHeight(f.x,f.z)+.006,f.z);
  if(lastWindow!==e.window){for(const mesh of world.plantMeshes){mesh.geometry.dispose();mesh.geometry=plantGeometry(mesh.userData.taxon,1,e.window);}lastWindow=e.window;}
  for(const a of e.actors){const m=models.get(a.id);m.visible=a.visible&&a.alive; // render culling never edits biological state
   if(a.size<.2&&Math.hypot(a.x-observer.x,a.z-observer.z)>18)m.visible=false;
   if(a.taxon==='vulpes_vulpes'){if(m.visible)quadrupedPose(m,a,state.time);continue;}
   m.position.set(a.x,a.y,a.z);m.rotation.set(0,-a.heading,0);
   if(m.siphons)m.siphons.visible=a.activity==='filtering';
   if(m.headPivot){const technique=a.activity;m.headPivot.rotation.z=technique==='sweeping'?-1.05:technique==='probing'?-.95+Math.sin(state.time*9)*.10:technique==='shell-opening'?-.9+Math.sin(state.time*3)*.12:0;m.headPivot.rotation.y=technique==='sweeping'?Math.sin(state.time*2)*.45:0;}
   if(a.taxon==='garrulus_glandarius'&&a.activity==='flying'){m.rotation.z=-.12;}
   for(const [i,w]of (m.animation?.wings||[]).entries()){if(['garrulus_glandarius','parus_major'].includes(a.taxon))w.visible=a.activity==='flying';w.rotation.x=(i?1:-1)*Math.sin(state.time*(a.taxon==='bombus_lapidarius'?70:6))*(a.activity==='carrying-pollen'||a.activity==='flying'?.8:.18);}
   if(a.taxon==='lumbricidae'){m.position.x=a.homeX-Math.min(.12,(6-e.resources['leaf-litter'].amount)*.02);}
  }
  for(const [id,row]of affected){const r=e.resources[id],fraction=r.amount/r.initial,signature=fraction+'|'+e.window;if(signature!==row.last){row.mesh.geometry.dispose();row.mesh.geometry=plantGeometry(row.p.taxon,fraction,e.window);row.last=signature;}}
  for(let i=0;i<acorns.length;i++)acorns[i].visible=e.window==='autumn'&&i<e.resources.acorns.amount;
  carriedAcorn.visible=e.window==='autumn'&&e.actors.find(a=>a.id==='compact-jay').carryingAcorn;
  for(let i=0;i<litter.length;i++){litter[i].visible=i<e.resources['leaf-litter'].amount;}
  if(world.water)world.water.position.y=e.tide.waterLevel;
 }
 function modelFor(individual){if(individual===state.deer.id)return reference.deer;if(individual===state.bird.id)return reference.bird;if(models.has(individual))return models.get(individual);const p=state.plants.find(p=>p.id===individual);if(!p)return null;const model=new THREE.Mesh(plantGeometry(p.taxon,1,state.ecology.window),new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.9}));model.scale.setScalar(p.size);return model;}
 update();return {models,update,modelFor,fox,roots};
}
