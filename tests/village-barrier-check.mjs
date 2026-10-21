import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {HabitatWorld,CENTERS,groundHeight} from '../dist/habitat-world.js';
import {createExpeditionSimulations} from '../dist/expedition-state.js';
import {ANIMALS} from '../dist/biodiversity.js';
import {FARM_APPROACH} from '../dist/village.js';
import {VillagePeople} from '../dist/village-people.js';
import {roadBlocks,segmentHitsBarrier} from '../dist/field-ecology.js';
T.TextureLoader.prototype.load=()=>new T.Texture();globalThis.document={createElement:()=>({getContext:()=>({measureText:s=>({width:s.length*20}),fillRect(){},fillText(){}})})};
const scene=new T.Scene(),world=new HabitatWorld(scene),{simulations}=createExpeditionSimulations(world,-.7),city=simulations.get('city'),c=CENTERS.city;
const roofs=[],gables=[];world.root.traverse(m=>{if(m.userData.villagePart==='roofs')roofs.push(m);if(m.userData.villagePart==='gables')gables.push(m);});scene.updateMatrixWorld(true);
const ray=new T.Raycaster(),local=(p,u,v,y)=>new T.Vector3(p.x+Math.cos(p.rotation)*u+Math.sin(p.rotation)*v,p.base+y,p.z-Math.sin(p.rotation)*u+Math.cos(p.rotation)*v);
let closedGableFaces=0,coveredRoofSamples=0;
for(const p of world.village.houses){
 for(const side of [-1,1]){ray.set(local(p,0,side*(p.depth/2+2),p.height+.7),new T.Vector3(-side*Math.sin(p.rotation),0,-side*Math.cos(p.rotation)));assert.ok(ray.intersectObjects(gables).length,'Gable disappears from an approach direction');closedGableFaces++;}
 for(const u of [-p.width/2-.12,-p.width/2+.01,-.1,.1,p.width/2-.01,p.width/2+.12])for(const v of [-p.depth/2-.15,0,p.depth/2+.15]){ray.set(local(p,u,v,p.height+p.rise+2),new T.Vector3(0,-1,0));const hits=ray.intersectObjects(roofs);assert.ok(hits.length,'Uncovered roof or eave');const expected=p.base+p.height+p.rise-p.rise/(p.width/2)*Math.abs(u);assert.ok(hits[0].point.y>=expected-.002&&hits[0].point.y<expected+.2,'Roof pitch disagrees with solid gable');coveredRoofSamples++;}
}
const fences=world.collisions.filter(p=>p.type==='gardenFence');assert.equal(fences.length,20);
let fenceDirections=0;const completeBlockers=city.blockers;
for(const fence of completeBlockers.filter(p=>p.type==='gardenFence')){
 city.blockers=[fence];
 const n=fence.halfX<fence.halfZ?{x:1,z:0}:{x:0,z:1},half=Math.min(fence.halfX,fence.halfZ);
 for(const species of ['capreolus_capreolus','microtus_arvalis'])for(const sign of [-1,1]){
  const s=ANIMALS[species],distance=half+city.bodyRadius(s,null)+.2,a={species,x:fence.x+n.x*distance*sign,z:fence.z+n.z*distance*sign,flight:0,trait:1};
  assert.ok(city.passable(a.x,a.z,s),'Test begins outside fence');assert.equal(city.passable(fence.x-n.x*distance*sign,fence.z-n.z*distance*sign,s,a),false,'A fast step tunnels through a garden fence');fenceDirections++;
 }
 assert.equal(world.canWalk(fence.x+c.x,fence.z+c.z),false);
}
city.blockers=completeBlockers;
for(const p of world.village.houses){const gate=local(p,0,p.depth/2+3.3,0);assert.ok(world.canWalk(gate.x,gate.z),'Central garden gate is blocked');}
const road=world.village.streets[0],barrier=city.blockers.find(p=>p.type==='permanentRoad');assert.equal(world.village.streets.length,1);assert.ok(road.permanent);assert.ok(road.mesh.material.map.isDataTexture);assert.ok(new Set(road.mesh.material.map.image.data).size>20,'Asphalt must show aggregate, not flat colour');
assert.equal(world.plants.filter(p=>Math.abs(p.x-road.a.x)<road.width/2+.14&&p.z>road.a.z&&p.z<road.b.z).length,0,'Pond reeds or other vegetation grow through the asphalt and curbs');
let roadFootprintSamples=0;
for(let z=road.a.z;z<=road.b.z;z+=.2)for(let dx=-road.width/2-.14;dx<=road.width/2+.14;dx+=.1){assert.equal(world.deckHeight(road.a.x+dx,z),null,'Street or curb overlaps boardwalk/bay');roadFootprintSamples++;}
let farmApproachSamples=0;
assert.equal(world.village.roadEnd,'open farm entrance');assert.ok(road.b.z>50);
for(let i=0;i<FARM_APPROACH.length-1;i++){
 const a=FARM_APPROACH[i],b=FARM_APPROACH[i+1],dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz);
 for(let d=0;d<=length;d+=.2)for(const u of [-1.2,0,1.2]){const x=a.x+dx*d/length+dz*u/length,z=a.z+dz*d/length-dx*u/length;assert.equal(world.deckHeight(x,z),null,'Farm continuation crosses a walking bay');farmApproachSamples++;}
}
assert.ok(world.collisions.filter(p=>p.type==='permanentRoad').length===3);
let roadDirections=0;
for(const species of ['capreolus_capreolus','fox','microtus_arvalis','rana_temporaria']){
 const s=ANIMALS[species];assert.ok(roadBlocks(s));
 for(const factors of [{road:false,corridor:false},{road:true,corridor:true,corridorZ:-22.5}]){
  Object.assign(city.factors,factors);
  for(const sign of [-1,1]){const a={species,x:barrier.x+sign*(barrier.halfX+city.bodyRadius(s,null)+.2),z:-22.5,flight:0,trait:1};assert.ok(city.passable(a.x,a.z,s));assert.equal(city.passable(barrier.x,-22.5,s,a),false);assert.equal(city.passable(barrier.x-sign*4,-22.5,s,a),false,'Road crossing bypassed by a long movement step');roadDirections++;}
 }
}
Object.assign(city.factors,{road:false,corridor:false});assert.ok(world.canWalk(road.a.x,-20),'The ranger must be allowed on the flat road');
for(const id of ['turdus_merula','apis_mellifera']){assert.equal(roadBlocks(ANIMALS[id],{flight:3}),false);assert.equal(city.overlapsBlocker(barrier.x,-20,ANIMALS[id],{flight:3},barrier),false,'Flying species blocked by the street');}
assert.equal(city.overlapsBlocker(barrier.x,-20,ANIMALS.turdus_merula,{flight:0},barrier),true,'Grounded birds must fly over the lane rather than walk through it');
// Deliberately running into the real fence must stop the actual movement controller.
const fence=city.blockers.find(p=>p.type==='gardenFence'&&p.house==='cottage-0-1'&&p.halfX<p.halfZ),s=ANIMALS.capreolus_capreolus,initial=fence.x-city.bodyRadius(s,null)-.14;
const deer={id:999991,species:s.id,x:initial,z:fence.z,homeX:initial,homeZ:fence.z,heading:0,speed:1,phase:0,energy:1,activity:'walking',stateTime:100,flight:0,alive:true,age:0,trait:1,target:{x:fence.x+4,z:fence.z},habitat:'city'};
const keep=city.agents;city.agents=[deer];let last={x:deer.x,z:deer.z};for(let i=0;i<400;i++){city.update(.05,null);assert.equal(segmentHitsBarrier(last.x,last.z,deer.x,deer.z,fence,city.bodyRadius(s,deer)),false,'The moving deer crossed the real fence');last={x:deer.x,z:deer.z};}city.agents=keep;
const people=new VillagePeople(scene,world),camera=new T.PerspectiveCamera();camera.position.set(c.x,1.7,0);people.update(camera,{x:c.x,z:0},false,.033);
assert.equal(people.models.length,5);assert.ok(people.material.isMeshStandardMaterial&&people.material.map==null);
let humanTriangles=0;for(const m of people.models){assert.equal(m.group.rotation.y,m.person.heading);assert.ok(m.head.geometry.boundingSphere.radius>.1);for(const part of [m.body,m.head]){assert.ok(!part.geometry.isPlaneGeometry);humanTriangles+=part.geometry.index.count/3;}assert.ok(m.group.visible);}
console.log(JSON.stringify({version:'0.16',closedGableFaces,coveredRoofSamples,continuousFenceSegments:fences.length,fenceDirections,openGardenGates:5,roadDirections,roadFootprintSamples,farmApproachSamples,road:'one textured asphalt lane; no deck overlap; permanent terrestrial barrier; flying species pass',deer:'actual walking controller never crossed the garden fence',residents:'five lit 3D bodies with individual clothing and turning heads; no photographic planes',humanTriangles},null,2));
