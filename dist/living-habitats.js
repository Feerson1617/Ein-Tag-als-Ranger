import * as THREE from './vendor/three.module.js?revision=120';
import { ANIMALS } from './biodiversity.js?revision=120';
import { layoutPoint,AUTHORED_CENTERS } from './world-layout.js?revision=120';
import { nearestTrail } from './trail.js?revision=120';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

export function buildLivingHabitats(world,ground,ponds){
 world.refuges=[];
 // Purposeful resting rocks, rather than loose stones on the walking route.
 const lake=ponds.find(p=>p.habitat==='lake');
 const rockSites=[{habitat:'lake',x:lake.x-lake.rx*.55,z:lake.z-lake.rz*.17,top:1.02},
  {...layoutPoint({x:AUTHORED_CENTERS.beach.x-18,z:AUTHORED_CENTERS.beach.z-36}),habitat:'beach',top:1.38}];
 const rockMaterial=world.material({map:world.groundTexture,color:'#8a8b82',roughness:.99});
 for(const [i,p]of rockSites.entries()){
  const bottom=ground(p.x,p.z)-.14,height=p.top-bottom,g=new THREE.CylinderGeometry(1.7,2.3,height,13,2),pos=g.attributes.position;
  for(let j=0;j<pos.count;j++){const x=pos.getX(j),z=pos.getZ(j),noise=1+.055*Math.sin(x*7.1+z*9.2);pos.setX(j,x*noise);pos.setZ(j,z*noise);}g.computeVertexNormals();
  const mesh=new THREE.Mesh(g,rockMaterial);mesh.position.set(p.x,bottom+height/2,p.z);mesh.castShadow=mesh.receiveShadow=true;world.root.add(mesh);
  const id=`cormorant-rock-${i}`;world.collisions.push({x:p.x,z:p.z,r:2.25,height,baseY:bottom-ground(p.x,p.z),type:'refugeRock',refuge:id});
  for(const side of [-1,1])world.refuges.push({...p,id:`${id}-${side}`,rock:id,kind:'cormorant',x:p.x+side*1.12,y:p.top,z:p.z+side*.12});
 }
 const nests=[],holes=[];
 for(const habitat of ['forest','city']){
  const trees=world.plants.filter(p=>p.habitat===habitat&&p.perches?.some(q=>q.y-p.y>5.8)&&nearestTrail(p.x,p.z).offset>3).sort((a,b)=>nearestTrail(a.x,a.z).offset-nearestTrail(b.x,b.z).offset).slice(0,habitat==='forest'?5:2);
  for(const [i,t]of trees.entries()){
   const perch=t.perches.filter(q=>q.y-t.y>5.8).sort((a,b)=>distance(a,t)-distance(b,t))[0];
   const blocker=world.collisions.find(c=>c.type==='tree'&&distance(c,t)<.1),trunkRadius=Math.max(.1,((blocker?.r||.45)-.15)*.76);
   const path=nearestTrail(t.x,t.z),angle=Math.atan2(path.z-t.z,path.x-t.x),nx=Math.cos(angle),nz=Math.sin(angle);
   const base={x:t.x+nx*(trunkRadius+.14),z:t.z+nz*(trunkRadius+.14),y:t.y};
   nests.push({x:perch.x,y:perch.y+.27,z:perch.z});
   holes.push({x:t.x+nx*(trunkRadius+.02),z:t.z+nz*(trunkRadius+.02),y:t.y+2.25,angle});
   world.refuges.push({id:`kobel-${habitat}-${i}`,kind:'squirrel',habitat,x:perch.x,z:perch.z,y:perch.y+.06,base,trunk:{x:t.x,z:t.z},tree:t.id});
  }
 }
 const pose=new THREE.Object3D(),nestMesh=new THREE.InstancedMesh(new THREE.SphereGeometry(1,12,8),world.material({map:world.bark,bumpMap:world.barkNormal,bumpScale:.045,color:'#746249',roughness:1}),nests.length);
 nests.forEach((p,i)=>{pose.position.set(p.x,p.y,p.z);pose.rotation.set(0,0,0);pose.scale.set(.34,.29,.32);pose.updateMatrix();nestMesh.setMatrixAt(i,pose.matrix);});nestMesh.castShadow=true;world.root.add(nestMesh);
 const openings=new THREE.InstancedMesh(new THREE.CircleGeometry(1,16),world.material({color:'#181a13',side:THREE.DoubleSide,roughness:1}),holes.length+nests.length);
 holes.forEach((p,i)=>{pose.position.set(p.x,p.y,p.z);pose.rotation.set(0,Math.PI/2-p.angle,0);pose.scale.set(.11,.16,1);pose.updateMatrix();openings.setMatrixAt(i,pose.matrix);});
 nests.forEach((p,i)=>{pose.position.set(p.x+.3,p.y-.02,p.z);pose.rotation.set(0,Math.PI/2,0);pose.scale.set(.09,.085,1);pose.updateMatrix();openings.setMatrixAt(holes.length+i,pose.matrix);});world.root.add(openings);
}

export class RefugeBehavior {
 constructor(sim,refuges){this.sim=sim;this.refuges=refuges;}
 handle(a,s,dt,observer){
  if(a.encounterPlan||a.geneticAgent||a.questIntent&&s.id==='sciurus_vulgaris'){
   if(a.refugePlan){a.refugePlan=null;a.poseY=null;a.climbing=false;a.bodyPitch=0;a.flight=0;}return false;
  }
  if(s.id==='phalacrocorax_carbo')return this.cormorant(a,s,dt,observer);
  if(s.id!=='sciurus_vulgaris')return false;
  a.refugeClock=(a.refugeClock||0)+dt;
  if(!a.refugePlan&&a.refugeClock<45+a.id%23)return false;
  return this.squirrel(a,s,dt,observer);
 }
 move(a,s,target,speed,y,dt){
  const d=distance(a,target),angle=Math.atan2(target.z-a.z,target.x-a.x),error=Math.atan2(Math.sin(angle-a.heading),Math.cos(angle-a.heading));
  a.heading+=clamp(error,-dt*4,dt*4);a.speed+=clamp(Math.min(speed,d*2)-a.speed,-dt*3,dt*3);
  const step=Math.min(d,a.speed*dt),oldY=a.poseY??this.sim.water(a.x,a.z)-.03,nextY=oldY+clamp(y-oldY,-dt*1.8,dt*1.8);
  const flightAt=(x,z)=>a.refugePlan?.phase==='dive'?0:Math.max(0,nextY-this.sim.terrain(x,z));
  const clear=(x,z)=>this.sim.passable(x,z,s,a)&&(s.type!=='bird'||this.sim.birdClear(x,z,s,a,flightAt(x,z)));
  for(const turn of [0,.35,-.35,.7,-.7,1.2,-1.2,1.9,-1.9]){const heading=a.heading+turn,x=a.x+Math.cos(heading)*step,z=a.z+Math.sin(heading)*step;if(clear(x,z)){a.x=x;a.z=z;a.heading=heading;break;}}
  if(s.type!=='bird'||this.sim.birdClear(a.x,a.z,s,a,flightAt(a.x,a.z)))a.poseY=nextY;
  a.flight=Math.max(0,a.poseY-this.sim.terrain(a.x,a.z));
  return distance(a,target)<.16&&Math.abs(a.poseY-y)<.09;
 }
 cormorant(a,s,dt,observer){
  const options=this.refuges.filter(r=>r.kind==='cormorant');if(!options.length)return false;
  if(!a.refugePlan){const taken=new Set(this.sim.agents.filter(b=>b!==a&&b.alive).map(b=>b.refugeSlot?.id));const slot=options.find(r=>!taken.has(r.id));if(!slot)return false;a.refugeSlot=slot;a.refugePlan={phase:'toRock',clock:0};a.poseY=this.sim.water(a.x,a.z)-.03;}
  const p=a.refugePlan,slot=a.refugeSlot;p.clock+=dt;a.target=null;a.pendingActivity=null;a.refugeOnRock=p.phase==='dry';
  const near=observer&&distance(a,observer)<3.5;
  if(near&&p.phase==='dry'){p.phase='leave';p.clock=0;}
  if(p.phase==='toRock'){
   a.activity='flying';const d=distance(a,slot),y=slot.y+(d>2?Math.min(2.3,d*.25):0);
   if(this.move(a,s,slot,2.5,y,dt)){p.phase='dry';p.clock=0;a.speed=0;a.poseY=slot.y;a.perchHeight=a.flight;}
  }else if(p.phase==='dry'){
   a.activity='wingDrying';a.speed=Math.max(0,a.speed-dt*3);a.poseY=slot.y;a.flight=a.perchHeight=slot.y-this.sim.terrain(a.x,a.z);
   if(p.clock>28+a.id%9){p.phase='leave';p.clock=0;}
  }else if(p.phase==='leave'){
   if(!p.waterTarget){for(let k=0;k<24;k++){const angle=(a.id+k)*2.399,q={x:slot.x+Math.cos(angle)*5,z:slot.z+Math.sin(angle)*5};if(this.sim.water(q.x,q.z)-this.sim.terrain(q.x,q.z)>.75&&this.sim.passable(q.x,q.z,s,a)){p.waterTarget=q;break;}}}
   if(!p.waterTarget){p.phase='dry';p.clock=0;return true;}a.activity='flying';
   const d=distance(a,p.waterTarget),y=this.sim.water(a.x,a.z)-.03+(d>1?Math.min(1.5,d*.3):0);
   if(this.move(a,s,p.waterTarget,2.1,y,dt)){p.phase='dive';p.clock=0;p.prey=null;p.attempt=false;}
  }else{
   if(!p.prey?.alive)p.prey=s.prey.flatMap(id=>this.sim.bySpecies.get(id)||[]).filter(q=>q.alive&&!q.geneticAgent&&!q.scenarioGroup&&distance(a,q)<18).sort((b,c)=>distance(a,b)-distance(a,c))[0];
   a.activity=p.prey?'hunting':'diving';a.target=p.prey||p.waterTarget;
   const y=Math.max(this.sim.terrain(a.x,a.z)+.18,this.sim.water(a.x,a.z)-.5);this.move(a,s,a.target,.8,y,dt);a.flight=0;
   if(p.prey&&!p.attempt&&distance(a,p.prey)<.35){p.attempt=true;this.sim.emit(a,'huntAttempt',p.prey);if(this.sim.random()<.28){this.sim.emit(a,'predation',p.prey);p.prey.alive=false;p.prey.dead=true;p.prey.hiddenUntil=Infinity;a.energy=Math.min(1,a.energy+.15);}}
   if(p.clock>17){p.phase='toRock';p.clock=0;p.waterTarget=null;}
  }a.refugeOnRock=p.phase==='dry';return true;
 }
 squirrel(a,s,dt,observer){
  if(!a.refugePlan){const used=new Set(this.sim.agents.filter(b=>b!==a&&b.alive).map(b=>b.refugeSlot?.id));const slot=this.refuges.filter(r=>r.kind==='squirrel'&&!used.has(r.id)).sort((b,c)=>distance(a,b.base)-distance(a,c.base))[0];if(!slot){a.refugeClock=0;return false;}a.refugeSlot=slot;a.refugePlan={phase:'approach',clock:0};a.poseY=this.sim.terrain(a.x,a.z);}
  const p=a.refugePlan,slot=a.refugeSlot;p.clock+=dt;a.target=null;a.pendingActivity=null;
  if(p.phase==='approach'){
   a.activity='walking';if(this.move(a,s,slot.base,.65,slot.base.y,dt)){p.phase='climb';p.clock=0;}
  }else if(p.phase==='climb'){
   a.activity='treeClimbing';a.climbing=true;a.bodyPitch=Math.PI/2;a.speed=.5;
   a.poseY=Math.min(slot.y,a.poseY+dt*.5);a.flight=0;
   if(a.poseY>=slot.y){p.phase='branch';p.clock=0;a.climbing=false;a.bodyPitch=0;}
  }else if(p.phase==='branch'){
   a.activity='walking';if(this.move(a,s,slot,.35,slot.y,dt)){p.phase='rest';p.clock=0;}
  }else if(p.phase==='rest'){
   a.activity='restingNest';a.speed=0;a.poseY=slot.y;
   if(p.clock>16||observer&&distance(a,observer)<2.5){p.phase='back';p.clock=0;}
  }else if(p.phase==='back'){
   a.activity='walking';if(this.move(a,s,slot.base,.35,slot.y,dt)){p.phase='descend';p.clock=0;}
  }else if(p.phase==='descend'){
   a.activity='treeClimbing';a.climbing=true;a.bodyPitch=-Math.PI/2;a.speed=.5;a.poseY=Math.max(slot.base.y,a.poseY-dt*.5);
   if(a.poseY<=slot.base.y){p.phase='depart';p.clock=0;a.climbing=false;a.bodyPitch=0;a.flight=0;}
  }else{
   const angle=Math.atan2(slot.base.z-slot.trunk.z,slot.base.x-slot.trunk.x),exit={x:slot.base.x+Math.cos(angle)*.85,z:slot.base.z+Math.sin(angle)*.85};
   a.activity='walking';if(this.move(a,s,exit,.65,this.sim.terrain(a.x,a.z),dt)){a.refugePlan=null;a.refugeSlot=null;a.poseY=null;a.flight=0;a.refugeClock=0;a.stateTime=0;this.sim.resolvePlacement(a,s);}
  }return true;
 }
}

export function attachRefuges(sim,world,center){
 const refuges=(world.refuges||[]).filter(r=>r.habitat===sim.habitat).map(r=>({...r,x:r.x-center.x,z:r.z-center.z,trunk:r.trunk&&{x:r.trunk.x-center.x,z:r.trunk.z-center.z},base:r.base&&{...r.base,x:r.base.x-center.x,z:r.base.z-center.z}}));
 if(refuges.length)sim.refugeBehavior=new RefugeBehavior(sim,refuges);
}
