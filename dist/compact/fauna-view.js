import * as THREE from '../vendor/three.module.js?revision=120';
import { readWildlifeGLB } from '../wildlife-glb.js';
import { terrainHeight } from './layout.js';
import { GeometryBatch,stick } from './geometry.js';
import { MANIFEST } from './manifest.js';
export async function createFaunaView(scene,state){
 const response=await fetch(MANIFEST.assets.deer);if(!response.ok)throw Error('Rehmodell konnte nicht geladen werden.');const geometry=readWildlifeGLB(await response.arrayBuffer(),'capreolus_capreolus');
 const rest=geometry.attributes.position.array.slice(),restNormals=geometry.attributes.normal.array.slice(),rig=geometry.attributes.rigData,joints=geometry.attributes.rigJoint;
 const deer=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.96}));deer.castShadow=true;deer.receiveShadow=true;scene.add(deer);
 const legs=new Map();for(let part=1;part<=4;part++){let i=0;while(i<rig.count&&rig.getX(i)!==part)i++;const hip=[rig.getY(i),rig.getZ(i)],knee=[joints.getX(i),joints.getY(i)],foot=geometry.userData.legFeet[part];legs.set(part,{hip,knee,foot,upper:Math.hypot(knee[0]-hip[0],knee[1]-hip[1]),lower:Math.hypot(foot[0]-knee[0],foot[1]-knee[1])});}
 const bird=new THREE.Group(),body=new GeometryBatch(),head=new GeometryBatch(),sphere=new THREE.SphereGeometry(1,14,9);const black='#272c2b',white='#e1dfd0',red='#a1342c';
 // Adult female: no red nape. +X points away from trunk, +Y follows trunk.
 body.add(sphere,black,[.055,.12,0],[.059,.105,.047]);body.add(sphere,'#d9d4bd',[.093,.14,0],[.024,.077,.035]);
 for(const side of [-1,1]){body.add(sphere,black,[.045,.125,side*.039],[.038,.085,.017],[0,0,-.1]);body.add(sphere,white,[.047,.17,side*.051],[.028,.042,.007],[0,0,-.1]);for(let k=0;k<5;k++)body.add(sphere,white,[.04,.1-k*.012,side*.054],[.020,.003,.003]);}
 body.add(sphere,red,[.06,.035,0],[.041,.033,.028]);
 // Stiff wedge tail contacts bark below feet, providing the third support.
 const tail=new THREE.ConeGeometry(.025,.15,4);body.add(tail,black,[.012,-.025,0],[1,1,1],[0,0,-.12]);
 head.add(sphere,black,[.065,.255,0],[.046,.042,.039]);for(const side of [-1,1]){head.add(sphere,white,[.091,.244,side*.031],[.032,.024,.008]);head.add(sphere,'#1b1d1c',[.099,.263,side*.035],[.005,.005,.003]);}
 // Straight chisel bill is directed into the bark; head/bill are one moving unit.
 const bill=new THREE.ConeGeometry(.010,.060,7);head.add(bill,'#646967',[.025,.255,0],[1,1,1],[0,0,Math.PI/2]);
 const headMesh=head.mesh();bird.add(body.mesh(),headMesh);
 const feet=new GeometryBatch();for(const side of [-1,1]){stick(feet,[.038,.08,side*.021],[.002,.075,side*.028],.004,'#7b7c72');for(const dir of [-1,1])for(const k of [-1,1])stick(feet,[.002,.075,side*.028],[-.012,.075+dir*.025,side*.028+k*.006],.002,'#8e8e80');}bird.add(feet.mesh());
 const wings=[];for(const side of [-1,1]){const b=new GeometryBatch();b.add(sphere,black,[0,0,side*.08],[.085,.015,.13]);for(let k=0;k<5;k++)b.add(sphere,white,[-.04+k*.021,0,side*.15],[.007,.003,.025]);const mesh=b.mesh();mesh.position.set(.045,.14,side*.04);mesh.visible=false;bird.add(mesh);wings.push(mesh);}scene.add(bird);
 let lastX=state.deer.x,lastZ=state.deer.z,cycle=0;
 function update(){
  const d=state.deer,dy=terrainHeight(d.x,d.z),travel=Math.hypot(d.x-lastX,d.z-lastZ);cycle+=travel/.32;lastX=d.x;lastZ=d.z;
  const walking=['walking','retreating'].includes(d.activity),angles=new Map(),baseY=dy+(walking?-.035:-.008),gaps=new Map();deer.position.set(d.x,baseY,d.z);deer.rotation.y=-d.heading;d.feet=[];
  for(const [part,l]of legs){const t=(cycle+[0,.5,.75,.25][part-1])%1,stance=.65,swing=t>stance?(t-stance)/(1-stance):0,offset=walking?(t<stance?.104-.208*t/stance:-.104+.208*(swing*swing*(3-2*swing))):0,lift=walking&&t>stance?.06*Math.sin(swing*Math.PI):0;
   const fx=l.foot[0]+offset,side=l.foot[2],wx=d.x+Math.cos(d.heading)*fx-Math.sin(d.heading)*side,wz=d.z+Math.sin(d.heading)*fx+Math.cos(d.heading)*side,fy=terrainHeight(wx,wz)-baseY+l.foot[1]+lift;
   const dx=fx-l.hip[0],yy=fy-l.hip[1],distance=Math.min(l.upper+l.lower-.00001,Math.max(.01,Math.hypot(dx,yy))),axis=Math.atan2(yy,dx),bend=Math.acos(Math.min(1,Math.max(-1,(l.upper*l.upper+distance*distance-l.lower*l.lower)/(2*l.upper*distance)))),theta=axis+(part<3?-bend:bend),kx=l.hip[0]+Math.cos(theta)*l.upper,ky=l.hip[1]+Math.sin(theta)*l.upper;
   angles.set(part,{upper:theta-Math.atan2(l.knee[1]-l.hip[1],l.knee[0]-l.hip[0]),lower:Math.atan2(fy-ky,fx-kx)-Math.atan2(l.foot[1]-l.knee[1],l.foot[0]-l.knee[0]),kx,ky,fx,fy});d.feet.push({part,x:wx,z:wz,y:baseY+fy-l.foot[1],surface:terrainHeight(wx,wz),swing:lift>0});
  }
  const a=geometry.attributes.position,n=geometry.attributes.normal;
  for(let i=0;i<a.count;i++){const part=rig.getX(i),l=legs.get(part),pose=angles.get(part);let x=rest[i*3],y=rest[i*3+1],z=rest[i*3+2],nx=restNormals[i*3],ny=restNormals[i*3+1],nz=restNormals[i*3+2],angle=0,ox=0,oy=0,tx=0,ty=0;
   if(l){const k=joints.getW(i);if(k>1.5){x+=pose.fx-l.foot[0];y+=pose.fy-l.foot[1];}else {angle=k>.5?pose.lower:pose.upper;ox=k>.5?l.knee[0]:l.hip[0];oy=k>.5?l.knee[1]:l.hip[1];tx=k>.5?pose.kx:ox;ty=k>.5?pose.ky:oy;}}
   else if(part===6){angle=d.activity==='browsing'?-.38+.025*Math.sin(state.time*1.3):.025*Math.sin(state.time*.45);angle*=joints.getW(i);ox=rig.getY(i);oy=rig.getZ(i);tx=ox;ty=oy;}
   if(angle){const c=Math.cos(angle),s=Math.sin(angle),dx=x-ox,dy=y-oy;x=tx+c*dx-s*dy;y=ty+s*dx+c*dy;const vx=nx;nx=c*vx-s*ny;ny=s*vx+c*ny;}a.setXYZ(i,x,y,z);n.setXYZ(i,nx,ny,nz);if(l&&joints.getW(i)>1.5){const wx=d.x+Math.cos(d.heading)*x-Math.sin(d.heading)*z,wz=d.z+Math.sin(d.heading)*x+Math.cos(d.heading)*z;gaps.set(part,Math.min(gaps.get(part)??Infinity,baseY+y-terrainHeight(wx,wz)));}
  }for(const foot of d.feet)foot.geometryGap=gaps.get(foot.part);a.needsUpdate=true;n.needsUpdate=true;
  const b=state.bird;bird.position.set(b.x,b.y,b.z);const flying=b.activity==='flying';bird.rotation.set(0,flying?Math.atan2(-(state.supports[b.targetIndex].z-b.z),state.supports[b.targetIndex].x-b.x):0,flying?-Math.PI/2:0);wings.forEach((w,i)=>{w.visible=flying;w.rotation.x=(i?1:-1)*Math.sin(b.phase*24)*.8;});headMesh.rotation.z=!flying&&b.activity==='searching'?.06*Math.sin(b.phase*2):0;
 }
 update();return {deer,bird,update};
}
