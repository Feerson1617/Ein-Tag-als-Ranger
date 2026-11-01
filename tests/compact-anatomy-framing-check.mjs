import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js?revision=120';
import {readWildlifeGLB} from '../dist/wildlife-glb.js';
import {quadrupedPose} from '../dist/compact/expanded-view.js';
import {createOrganism,poseCoastalBird} from '../dist/compact/organism-models.js';
import {visibleModelCorners,frameVisiblePoints} from '../dist/compact/feeding-detail.js';
import {createReferenceState,stepReference} from '../dist/compact/world-state.js';
import {createEcology,stepEcology} from '../dist/compact/ecology.js';
import {COASTAL_PROFILES,carriedPreyPoint} from '../dist/compact/coastal-rig.js';
import {CATALOG} from '../dist/compact/catalog.js';
import {profileGeometry} from '../dist/compact/organic-geometry.js';
const output=process.argv[2]||'work/optik-endkorrektur/tests/anatomy';fs.mkdirSync(output,{recursive:true});
const report={scope:'Actual geometry and camera projection regressions. These numeric checks do not certify naturalism or visual identification.',passed:false,checks:[]};
const p=new THREE.Vector3();
const loft=profileGeometry([[-1,0,0,.1,.1],[0,0,0,.3,.3],[1,0,0,.1,.1]]);
const surface=new THREE.Mesh(loft,new THREE.MeshBasicMaterial({side:THREE.FrontSide}));surface.updateMatrixWorld(true);
for(const direction of [new THREE.Vector3(0,1,0),new THREE.Vector3(0,0,1),new THREE.Vector3(0,-1,0),new THREE.Vector3(0,0,-1)])assert(new THREE.Raycaster(direction.clone().multiplyScalar(2),direction.clone().negate()).intersectObject(surface).length,'Closed loft must face outward');
report.checks.push('loft side normals point outward');
const raw=fs.readFileSync(new URL('../dist/assets/wildlife-fox.glb',import.meta.url));const g=readWildlifeGLB(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength),'fox'),fox=new THREE.Mesh(g,new THREE.MeshBasicMaterial()),rest=g.attributes.position.array.slice(),rig=g.attributes.rigData,joints=g.attributes.rigJoint,pairs=[];
for(let part=1;part<=4;part++){
 let i=0;while(rig.getX(i)!==part)i++;const knee=new THREE.Vector3(joints.getX(i),joints.getY(i),joints.getZ(i));const ends=[[],[]];
 for(let j=0;j<rig.count;j++)if(rig.getX(j)===part&&joints.getW(j)<1.5&&p.fromArray(rest,j*3).distanceTo(knee)<.018)ends[joints.getW(j)>.5?1:0].push(j);
 assert(ends.every(a=>a.length>6));pairs.push({part,ends});
}
let maxKneeGap=0,minFootGap=Infinity;
for(let frame=0;frame<180;frame++){
 const actor={x:-62+frame*.015,z:-23+Math.sin(frame*.05)*.3,heading:.2,activity:'stalking'};quadrupedPose(fox,actor,frame*.05);
 for(const {part,ends} of pairs){let gap=Infinity;for(const i of ends[0])for(const j of ends[1])gap=Math.min(gap,p.fromBufferAttribute(g.attributes.position,i).distanceTo(new THREE.Vector3().fromBufferAttribute(g.attributes.position,j)));maxKneeGap=Math.max(maxKneeGap,gap);assert(gap<.004,`Fox knee ${part} is detached: ${gap}`);}
 for(const foot of actor.feet){minFootGap=Math.min(minFootGap,foot.geometryGap);assert(foot.geometryGap>=-.004,'Fox foot penetrates terrain');}
}
report.checks.push({foxContinuousKneesOverSlopeFrames:180,maxKneeGap,minFootGap});
const state=createReferenceState();createEcology(state);const models=new Map(Object.keys(COASTAL_PROFILES).map(t=>[t,createOrganism(t)]));const preyModels=new Map();let projections=0,preyFrames=0;
for(let step=0;step<85;step++){
 stepReference(state,1,{x:63,z:4});stepEcology(state,1,{x:63,z:4});
 for(const a of state.ecology.actors.filter(a=>COASTAL_PROFILES[a.taxon])){
  const model=models.get(a.taxon);model.position.set(a.x,a.y,a.z);model.rotation.y=-a.heading;poseCoastalBird(model,a,state.time);model.updateMatrixWorld(true);
  const prey=state.ecology.actors.find(p=>p.id===(a.carriedPreyId||a.targetId));let preyPoints=[];
  if(prey){let pm=preyModels.get(prey.id);if(!pm){pm=createOrganism(prey.taxon,prey.stage);pm.scale.multiplyScalar(prey.size/CATALOG[prey.taxon].length);preyModels.set(prey.id,pm);}pm.position.set(prey.x,prey.y,prey.z);pm.rotation.y=-prey.heading;if(a.carriedPreyId)pm.position.copy(carriedPreyPoint(a,state.time,state.modelRevision));pm.updateMatrixWorld(true);preyPoints=visibleModelCorners(pm);preyFrames++;}
  for(const target of [model,model.headPivot])for(const aspect of [.35,.65,1.8,3.2]){
   const points=[...visibleModelCorners(target),...preyPoints],side=new THREE.Vector3(-Math.sin(a.heading),.55,Math.cos(a.heading)).normalize(),fit=frameVisiblePoints(points,side,aspect,35),camera=new THREE.PerspectiveCamera(35,aspect,.001,20);camera.position.copy(fit.focus).addScaledVector(side,fit.distance);camera.lookAt(fit.focus);camera.updateMatrixWorld(true);
   for(const point of points){p.copy(point).project(camera);assert(Math.abs(p.x)<.999&&Math.abs(p.y)<.999&&p.z<1,'Visible animated bird is clipped');projections++;}
  }
 }
}
report.checks.push({actualAnimatedVertexEnvelopeProjections:projections,actualPreyFrames:preyFrames,aspectRange:[.35,3.2]});
assert.equal(createOrganism('ixodes_ricinus').userData.parts.legs,8);assert.equal(createOrganism('coccinella_septempunctata').userData.parts.spots,7);assert.equal(createOrganism('carcinus_maenas').userData.parts.walkingLegs,8);assert.equal(createOrganism('crangon_crangon').userData.parts.walkingLegs,10);assert.equal(createOrganism('cerastoderma_edule').userData.parts.radialRibs,22);
report.checks.push('existing tick legs, seven ladybird spots, crab/shrimp appendages and cockle ribs preserved');report.passed=true;fs.writeFileSync(output+'/result.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
