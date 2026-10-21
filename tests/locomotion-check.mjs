import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import { ANIMALS } from '../dist/biodiversity.js';
import { WildlifeRenderer } from '../dist/wildlife.js';
THREE.TextureLoader.prototype.load=function(){return new THREE.Texture();};
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(){},getImageData(x,y,w,h){return {data:new Uint8ClampedArray(w*h*4).fill(160)};}})})};
const agents=Object.values(ANIMALS).map((s,i)=>({id:i+1,species:s.id,habitat:'forest',alive:false,x:0,z:0,heading:0,trait:1,age:0,phase:0,activity:'walking'}));
const render=new WildlifeRenderer(new THREE.Scene(),agents),stats=[];
for(const a of agents){const b=render.batches.get(a.species),rig=b.legRig,s=ANIMALS[a.species];
 const attributes=Object.values(b.mesh.geometry.attributes).length+4+1;
 assert.ok(attributes<=16,'The complete animation must fit the WebGL2 minimum attribute budget, including instance colour');
 if(!rig.length)continue;
 for(const speed of [Math.min(.45,s.size*.9),3.4]){
  a.alive=true;a.age=0;a.x=a.z=0;a.motion=undefined;let contacts=0,drift=0,lift=0,reach=0,prior=[];
  const ground=(x,z)=>x*.06+Math.sin(z*.6)*.012;
  for(let frame=0;frame<180;frame++){
   const priorCycle=a.motion?.cycle;a.age+=1/30;a.heading=Math.sin(a.age*.65)*.35;a.x+=Math.cos(a.heading)*speed/30;a.z+=Math.sin(a.heading)*speed/30;
   render.update(ground,()=>-1,null,ground);
   const m=a.motion;if(priorCycle!=null)assert.ok(Math.abs((m.cycle-priorCycle)*m.stride-speed/30)<1e-9,a.species+' stride must match actual distance, even for millimetre-size animals');const c=Math.cos(m.heading),sn=Math.sin(m.heading);let i=0;
   const packed=[...b.feetA.subarray(0,4),...b.feetB.subarray(0,4),...b.feetC.subarray(0,4)];assert.deepEqual(packed,[...m.footTargets],'Rendered buffers must carry this actual individual');
   for(const leg of rig.legs){if(!leg){i++;continue;}const q=packed.slice(i*3,i*3+3),f=m.contacts[i],p={x:a.x+c*q[0]-sn*q[2],y:a.y+q[1],z:a.z+sn*q[0]+c*q[2]};
    assert.ok(q.every(Number.isFinite),a.species+' finite pose');
    if(f.stance&&!f.paused&&prior[i]?.stance){contacts++;const change=Math.hypot(p.x-prior[i].x,p.y-prior[i].y,p.z-prior[i].z);drift=Math.max(drift,change);assert.ok(change<2e-6,a.species+' stance foot slips');assert.ok(Math.abs(p.y-ground(p.x,p.z)-leg.clearance)<2e-6,a.species+' stance foot must touch the actual slope');}
    lift=Math.max(lift,p.y-ground(p.x,p.z)-leg.clearance);
    const d=Math.hypot(...leg.hip.map((v,k)=>v-q[k]));reach=Math.max(reach,d/leg.length);assert.ok(d<=leg.length*1.00001,a.species+' target overextends a joint');
    prior[i]={...p,stance:f.stance&&!f.paused};i++;
   }
  }
  if(speed<1){assert.ok(contacts>0,a.species+' needs actual ground support at its normal walking speed');assert.ok(lift>rig.length*.02,a.species+' feet must lift, not just drag');}
  stats.push({id:a.species,speed,contacts,drift,lift,reach});
  const phase=a.motion.phase;for(let n=0;n<30;n++){a.age+=1/30;render.update(ground,()=>-1,null,ground);}assert.equal(a.motion.phase,phase,'Blocking or stopping cannot keep feet cycling');
  const specimen=render.preview(a.species);render.updatePreview(specimen,a);assert.equal(specimen.material.userData.pose.gaitData.value[1],Math.fround(s.type==='insect'?a.motion.flap:a.motion.phase),'Magnified specimen uses the watched individual clock');
  const shader={vertexShader:'#include <beginnormal_vertex>\n#include <begin_vertex>',fragmentShader:'#include <map_fragment>',uniforms:{}};specimen.material.onBeforeCompile(shader);assert.ok(shader.vertexShader.includes('uniform vec2 gaitData;'));assert.ok(!shader.vertexShader.includes('attribute vec2 gaitData;'));
 }
 a.alive=false;
}
// Newly visible individuals settle at their own current coordinates, without inheriting stale contacts.
const fox=agents.find(a=>a.species==='fox');fox.alive=true;render.update(()=>0,()=>-1,null);const oldId=fox.id;fox.x+=30;fox.age+=2;render.update(()=>0,()=>-1,null);assert.equal(fox.motion.identity,oldId);assert.ok(fox.motion.footTargets.every(Number.isFinite));
fox.id++;fox.age=0;render.update(()=>0,()=>-1,null);assert.equal(fox.motion.identity,fox.id);assert.equal(fox.motion.amount,0);
// Hunt flight keeps legs tucked even at the bottom of a stoop; the inset has the same wings.
fox.alive=false;const falcon=agents.find(a=>a.species==='falco_tinnunculus');Object.assign(falcon,{alive:true,x:0,z:0,age:0,flight:.2,activity:'stooping',speed:4});for(let n=0;n<30;n++){falcon.age+=1/30;falcon.x+=4/30;render.update(()=>0,()=>-1,null);}assert.ok(falcon.motion.air>.98);const flightView=render.preview(falcon.species);render.updatePreview(flightView,falcon);assert.equal(flightView.userData.previewWings.length,1);assert.ok(flightView.userData.previewWings.every(w=>w.visible));assert.equal(flightView.rotation.z,falcon.motion.pitch);
// Carried acorns are drawn only while this actual visible individual carries one.
falcon.alive=false;const jay=agents.find(a=>a.species==='garrulus_glandarius');Object.assign(jay,{alive:true,x:0,z:0,age:0,activity:'walking',carriedSeed:{species:'quercus_robur'}});render.update(()=>0,()=>-1,null);assert.equal(render.carriedSeeds.count,1);jay.carriedSeed=null;jay.age+=1/30;render.update(()=>0,()=>-1,null);assert.equal(render.carriedSeeds.count,0);jay.alive=false;
const crab=render.batches.get('carcinus_maenas'),beetle=render.batches.get('coccinella_septempunctata');
const parts=b=>new Set([...b.mesh.geometry.attributes.rigData.array].filter((_,i)=>i%4===0));assert.ok(parts(crab).has(13),'Crab must articulate eight legs');assert.ok(parts(beetle).has(11),'Beetle must articulate six legs');
console.log(JSON.stringify({jointedSpecies:stats.length/2,groundSupport:'World-space foot contact on slopes and turns, < 0.002 mm drift per frame',maximumMeasuredDriftM:Math.max(...stats.map(v=>v.drift)),range:'normal walking plus 3.4 m/s robustness stress; targets stay within leg reach',rendering:'same pose in colour, joint normals and depth shader; at most 16 attributes including colour',preview:'actual selected individual drives animated detail view',identity:'stop, re-entry, teleport and new identity verified',selected:stats.filter(v=>v.speed<1&&['fox','hare','capreolus_capreolus','parus_major','carcinus_maenas','rana_temporaria'].includes(v.id))},null,2));
