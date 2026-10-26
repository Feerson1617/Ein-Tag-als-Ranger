import {carriedPreyPoint,billPoint} from '../dist/compact/coastal-rig.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js?revision=120';
import {createReferenceState,stepReference}from '../dist/compact/world-state.js';
import {createEcology,stepEcology,tideAt}from '../dist/compact/ecology.js';
import {terrainHeight}from '../dist/compact/layout.js';
import {coastalRig,COASTAL_PROFILES,CRAB_RIG}from '../dist/compact/coastal-rig.js';
import {createOrganism,poseCoastalBird,poseCrab}from '../dist/compact/organism-models.js';
import {CATALOG}from '../dist/compact/catalog.js';
const ids=Object.values(COASTAL_PROFILES).map(p=>'compact-'+p.id),out=process.argv[2]||'work/qa-correction/coastal-tests';fs.mkdirSync(out,{recursive:true});let passed=0;
const check=(title,fn)=>{fn();passed++;console.log('PASS',title);};
const world=seed=>{const s=createReferenceState(seed);createEcology(s);return s;};
const requireFour=events=>{for(const id of ids)assert.ok(events.some(e=>e.actors[0]===id&&e.after===e.before-1),'No successful feeding for '+id);};
const successful=s=>s.ecology.events.filter(e=>['shore-feeding','shell-competition'].includes(e.interaction));
const scenarios=[];
check('F02 an empty event list and the independently reconstructed missing species fail positive coverage',()=>{assert.throws(()=>requireFour([]));const old=JSON.parse(fs.readFileSync(new URL('../verification/kompakt-korrektur/baseline/reconstructed-audit.json',import.meta.url)));assert.ok(old.coastal.every(s=>s.counts['compact-avocet']===0&&s.counts['compact-redshank']===0));});
check('F02 four seeds times four timestep profiles each require all four real successful foragers',()=>{
 for(const seed of[123,20260825,20260826,987654])for(const dt of[1/60,.1,.5,1]){
  const s=world(seed),max={};
  for(let t=0;t<600-1e-7;t+=dt){const h=Math.min(dt,600-t),previous=new Map(s.ecology.actors.map(a=>[a.id,{x:a.x,y:a.y,z:a.z,activity:a.activity}]));stepReference(s,h,{x:0,z:0});stepEcology(s,h);for(const a of s.ecology.actors){if(![...ids,'compact-crab','compact-bee'].includes(a.id))continue;const old=previous.get(a.id),distance=Math.hypot(a.x-old.x,a.y-old.y,a.z-old.z),speed=distance/h,limit=a.id==='compact-bee'?2.8:a.id==='compact-crab'?.038:a.activity==='flying'||old.activity==='flying'?6:.4;assert.ok(speed<=limit+1e-7,a.id+' illegal displacement '+speed+' in '+a.activity);max[a.id]=Math.max(max[a.id]||0,speed);}}
  const events=successful(s);requireFour(events);const first={};for(const id of ids){const e=events.find(e=>e.actors[0]===id);assert.ok(e.endedAt<=120,id+' unavailable in first tidal cycle');first[id]=e.endedAt;}
  const resources=['small-juveniles','small-worms','shrimp','shared-mussels'];for(const key of resources){const r=s.ecology.resources[key],used=events.filter(e=>e.resource===key);assert.equal(r.initial-r.amount,used.length);assert.equal(new Set(used.map(e=>e.actors[1])).size,used.length,'Same prey used twice');}
  for(const e of events){assert.equal(e.after,e.before-1);assert.ok(e.before>0&&e.after>=0);assert.ok(e.startedAt<e.contactAt&&e.contactAt<=e.handlingStartedAt&&e.handlingStartedAt<e.endedAt);assert.ok(e.contactDistance<.004);const a=s.ecology.actors.find(a=>a.id===e.actors[0]),p=COASTAL_PROFILES[a.taxon]||{depth:[-.8,.15],handling:2.2};assert.ok(e.preyWaterDepth>=p.depth[0]&&e.preyWaterDepth<=p.depth[1]);assert.ok(e.endedAt-e.handlingStartedAt>=p.handling-1e-7);assert.ok(e.preyLength>0);}
  scenarios.push({seed,dt,seconds:600,counts:Object.fromEntries(ids.map(id=>[id,events.filter(e=>e.actors[0]===id).length])),firstSuccessModelSeconds:first,maximumMetersPerSecond:max,events});
 }
});
function meshVertices(root){const points=[];root.updateMatrixWorld(true);root.traverse(o=>{if(o.isMesh&&o.visible&&o.geometry.attributes.position){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)points.push(new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});return points;}
check('F02 contact is reproduced on the actual head/claw and prey meshes, with planted articulated feet',()=>{
 const s=scenarios.find(s=>s.seed===123&&s.dt===.1),taxa=new Map([...world(123).ecology.actors].map(a=>[a.id,a.taxon]));
 for(const id of [...ids,'compact-crab']){
  const e=s.events.find(e=>e.actors[0]===id);assert.ok(e,id);const taxon=taxa.get(id),a={...e.bodyPosition,heading:e.bodyHeading,pose:e.bodyPose,activity:'handling',walkDistance:0},model=createOrganism(taxon);model.position.set(a.x,a.y,a.z);model.rotation.y=-a.heading;if(model.birdLegs)poseCoastalBird(model,a,e.endedAt);else poseCrab(model,a);model.updateMatrixWorld(true);const anchor=model.beakContact||model.clawContact,actual=anchor.getWorldPosition(new THREE.Vector3());assert.ok(actual.distanceTo(new THREE.Vector3(e.contactPoint.x,e.contactPoint.y,e.contactPoint.z))<1e-8,'Renderer and simulation contacts differ');
  const bill=anchor.parent.children.find(o=>o.isMesh),near=meshVertices(bill).filter(p=>p.distanceTo(actual)<.0045);assert.ok(near.length,'Anchor must touch actual bill/claw surface');
  const preyTaxon=taxa.get(e.actors[1]),prey=createOrganism(preyTaxon,preyTaxon==='hediste_diversicolor'?'juvenile':'adult');prey.scale.multiplyScalar(e.preyLength/CATALOG[preyTaxon].length);prey.position.set(e.preyPosition.x,e.preyPosition.y,e.preyPosition.z);for(const v of prey.shellValves||[])v.rotation.x=v.userData.side*e.shellOpening;const preyVertices=meshVertices(prey);let gap=Infinity;for(const p of near)for(const q of preyVertices)gap=Math.min(gap,p.distanceTo(q));assert.ok(gap<Math.min(.003,e.preyLength*.12),id+' actual food gap '+gap);
  if(model.birdLegs){const skin=model.headSkinMesh,pos=skin.geometry.attributes.position;let gap=Infinity;for(let i=0;i<skin.userData.skinVertexCount;i++){const p=new THREE.Vector3().fromBufferAttribute(pos,i).applyMatrix4(skin.matrixWorld);gap=Math.min(gap,p.y-terrainHeight(p.x,p.z));}assert.ok(gap>=-.001,id+' head enters sediment: '+gap);}
  if(model.birdLegs)for(const leg of model.birdLegs){leg.foot.updateMatrixWorld(true);const foot=leg.foot.getWorldPosition(new THREE.Vector3());assert.ok(Math.abs(foot.y-a.y)<.002,'Stance foot not on local sediment');}
 }
});
check('F02 revision-5+ encounter identity persists from approach into the actual acquired event and one concrete prey moves towards the mouth',()=>{
 const s=world(123),first=new Map(),completed=new Set();
 for(let i=0;i<4800&&completed.size<ids.length;i++){
  stepReference(s,.025,{x:63,z:-12});stepEcology(s,.025,{x:63,z:-12});
  for(const id of ids){const a=s.ecology.actors.find(a=>a.id===id);if(completed.has(id))continue;
   if(!first.has(id)&&a.behaviorPhase==='approaching')first.set(id,{eventId:a.feedingEventId,preyId:a.targetId});
   const entry=first.get(id);if(!entry)continue;assert.equal(a.feedingEventId,entry.eventId);
   if(a.behaviorPhase==='swallowing'){
    const event=s.ecology.events.find(e=>e.id===entry.eventId);assert(event);assert.equal(event.actors[1],entry.preyId);assert.equal(a.carriedPreyId,entry.preyId);assert.equal(a.feedingPreyId,entry.preyId);assert.equal(a.lastFeeding.eventId,event.id);
    const beginning=carriedPreyPoint(a,a.phaseStartedAt,5),end=carriedPreyPoint(a,a.phaseStartedAt+.85,5);assert.deepEqual(beginning,billPoint(a));assert(Math.hypot(end.x-beginning.x,end.y-beginning.y,end.z-beginning.z)>.02);
    assert.deepEqual(carriedPreyPoint(a,a.phaseStartedAt+.85,4),billPoint(a),'Old revisions keep the original trajectory');completed.add(id);
   }
  }
 }
 assert.deepEqual([...completed].sort(),[...ids].sort());
});
check('F02 opened concrete mussel valves reveal the same tissue mesh instead of overlapping solid shells',()=>{
 const shell=createOrganism('mytilus_edulis'),tissue=shell.tissue,scale=shell.scale.x;
 const firstHit=opening=>{for(const valve of shell.shellValves)valve.rotation.x=valve.userData.side*opening;shell.updateMatrixWorld(true);return new THREE.Raycaster(new THREE.Vector3(.02*scale,scale,.001*scale),new THREE.Vector3(0,-1,0)).intersectObject(shell,true)[0]?.object;};
 assert.notEqual(firstHit(0),tissue,'Closed valves must cover their tissue');assert.equal(firstHit(.4),tissue,'Opening must expose the real tissue through the gape');assert.equal(firstHit(.5),tissue);assert.equal(shell.tissue,tissue);
});
check('F03 the original 60-Hz jumps are present in the baseline and absent under physical speed bounds',()=>{const old=JSON.parse(fs.readFileSync(new URL('../verification/kompakt-korrektur/baseline/reconstructed-audit.json',import.meta.url))).coastal[0];for(const id of ['compact-oystercatcher','compact-crab','compact-bee'])assert.ok(old.jumps[id].distance>.5);const now=scenarios[0].maximumMetersPerSecond;assert.ok(now['compact-crab']<.038);assert.ok(now['compact-bee']<2.8);assert.ok(now['compact-oystercatcher']<6);});
check('F02 zero real prey cannot produce a feeding event or spend a fictional resource',()=>{const s=world(123);for(const key of ['small-juveniles','small-worms','shrimp','shared-mussels'])s.ecology.resources[key].amount=0;for(const a of s.ecology.actors)if(['mytilus_edulis','hediste_diversicolor','crangon_crangon'].includes(a.taxon))a.alive=false;for(let i=0;i<1200;i++){stepReference(s,.1,{x:0,z:0});stepEcology(s,.1);}assert.equal(successful(s).length,0);assert.throws(()=>requireFour(successful(s)));});
fs.writeFileSync(out+'/result.json',JSON.stringify({passed,scope:'Model and actual Three.js geometry contracts; no visual or hardware certification',scenarios},null,2));console.log(JSON.stringify({passed,scenarios:scenarios.length}));
