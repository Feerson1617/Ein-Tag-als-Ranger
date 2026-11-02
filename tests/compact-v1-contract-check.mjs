import {witnessedFeeding}from'../dist/compact/observation-context.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash}from'node:crypto';
import {execFileSync,spawnSync}from'node:child_process';
import * as THREE from '../dist/vendor/three.module.js?revision=120';
import {feedingEpisode,lensClip,feedingFraming}from'../dist/compact/feeding-detail.js';
import {terrainHeight}from'../dist/compact/layout.js';
import {coastalRig,billPoint,mouthPoint,COASTAL_PROFILES}from'../dist/compact/coastal-rig.js';
import {spatialRenderGroup,pinTerrainContacts}from'../dist/compact/render-groups.js';
import {createReferenceState,stepReference}from'../dist/compact/world-state.js';
import {createEcology,stepEcology}from'../dist/compact/ecology.js';
import {createReferenceState as oldState,stepReference as oldStep}from'./fixtures/compact-936e69d/dist/compact/world-state.js';
import {createEcology as oldEcology,stepEcology as oldEcoStep}from'./fixtures/compact-936e69d/dist/compact/ecology.js';
import {compareHistorical}from'./portable-historical-state.mjs';
const out=process.argv[2],r={passed:0,checks:[],scope:'Actual pinned historical model sources and Three.js geometry; not WebGL or visual/device acceptance.'};
const save=()=>{if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/result.json',JSON.stringify(r,null,2)+'\n');}};
const pass=(name,details={})=>{r.passed++;r.checks.push({name,...details});save();};
try{
 const a={id:'bird',targetId:'prey-1',feedingPreyId:'prey-1',feedingEventId:'event-1'},first=feedingEpisode(null,a,'run-1');
 assert.equal(first.preyId,'prey-1');
 const next={...a,targetId:'prey-2',feedingPreyId:'prey-2',feedingEventId:'event-2'};
 assert.equal(feedingEpisode(first,next,'run-1'),first,'One acquisition cannot silently become the next resource');
 assert.equal(feedingEpisode(first,next,'run-2').preyId,'prey-2','New run resets episode identity');
 assert.equal(feedingEpisode(first,{...next,id:'different-bird'},'run-1').individualId,'different-bird');
 assert.equal(feedingEpisode(null,{id:'waiting'},'run-1'),null,'No invented target while waiting');
 const pending=feedingEpisode(null,{id:'bird',targetId:'prey-1'},'run-1');assert.equal(pending.eventId,null);assert.equal(feedingEpisode(pending,a,'run-1').eventId,'event-1');assert.equal(feedingEpisode(pending,{id:'bird',targetId:'new-preparation'},'run-1').preyId,'new-preparation','Only a not-yet-started preparation target may change');
 pass('concrete episode identity survives next target; explicit new run/individual resets it');
 assert.deepEqual(lensClip({left:-20,top:80,right:400,bottom:500},{left:8,top:100,right:300,bottom:280},600,375),{x:8,y:95,width:292,height:180});
 assert.equal(lensClip({left:0,top:400,right:200,bottom:500},{left:0,top:0,right:300,bottom:280},600,375).height,0,'Offscreen/scroll-clipped lens must not draw over the playfield');
 pass('lens scissor intersects actual viewport and scroll surface');
 const event={id:'event-1',interaction:'shore-feeding',actors:['bird','prey-1'],contactAt:3,endedAt:4},witness={runId:'run-1',individualId:'bird',time:4.025,visibleNow:true,contact:{runId:'run-1',eventId:'event-1',individualId:'bird',preyId:'prey-1',time:3.9}};
 for(const interaction of ['shore-feeding','shell-competition']){const feeding={...event,interaction};assert.equal(witnessedFeeding(feeding,witness),true);
 for(const change of [{visibleNow:false},{contact:null},{time:5},{runId:'other-run'},{individualId:'other-bird'},{contact:{...witness.contact,preyId:'other-prey'}},{contact:{...witness.contact,time:2.9}},{contact:{...witness.contact,eventId:'next-event'}}])assert.equal(witnessedFeeding(feeding,{...witness,...change}),false,interaction+JSON.stringify(change));}
 assert.equal(witnessedFeeding({...event,interaction:'wood-foraging'},witness),false);
 pass('all four coastal birds including oyster shell competition require same-run actual contact and visible acquisition; body/lens/old-event alone cannot earn it');
 const cameraState=createReferenceState();createEcology(cameraState);const frameObserver={x:63,z:4};let fitted=0;
 for(let step=0;step<650;step++){stepReference(cameraState,.1,frameObserver);stepEcology(cameraState,.1,frameObserver);for(const actor of cameraState.ecology.actors.filter(a=>['compact-avocet','compact-redshank','compact-oystercatcher','compact-spoonbill'].includes(a.id))){const target=cameraState.ecology.actors.find(p=>p.id===actor.targetId);if(!target||!actor.pose)continue;for(const aspect of [.7,1.3,2.2,3]){const f=feedingFraming(actor,target,target.size,aspect),camera=new THREE.PerspectiveCamera(32,aspect,.001,20);camera.position.copy(f.focus).addScaledVector(f.side,f.distance);camera.lookAt(f.focus);camera.updateMatrixWorld();for(const entry of [{point:mouthPoint(actor),radius:coastalRig(actor.taxon).scale*.28},{point:billPoint(actor),radius:coastalRig(actor.taxon).scale*.06},{point:target,radius:Math.max(.002,target.size*.8)}])for(const axis of [new THREE.Vector3(1,0,0),new THREE.Vector3(0,1,0),new THREE.Vector3(0,0,1)])for(const sign of [-1,1]){const p=new THREE.Vector3().copy(entry.point).addScaledVector(axis,entry.radius*sign).project(camera);assert(Math.abs(p.x)<1&&Math.abs(p.y)<1&&p.z<1,'Actual head/bill/resource extent must fit the lens');}fitted++;}}}
 pass('four species approach/contact extents fit wide and narrow lenses without head/resource clipping',{fitted});
 const geometry=new THREE.PlaneGeometry(50,30,5,3);geometry.rotateX(-Math.PI/2);const source=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));source.castShadow=true;
 const grouped=spatialRenderGroup(source,8);source.updateMatrixWorld(true);grouped.updateMatrixWorld(true);
 const attributes=g=>{const p=g.index?g.toNonIndexed():g;const rows=[];for(let i=0;i<p.attributes.position.count;i+=3){const row=[];for(const[name,attr]of Object.entries(p.attributes))for(let j=0;j<3;j++)for(let k=0;k<attr.itemSize;k++)row.push(name,attr.array[(i+j)*attr.itemSize+k]);rows.push(JSON.stringify(row));}return rows.sort();};
 assert.deepEqual(grouped.children.flatMap(m=>attributes(m.geometry)).sort(),attributes(geometry));
 for(const x of [-19,-3,11,23]){const ray=new THREE.Raycaster(new THREE.Vector3(x,5,2),new THREE.Vector3(0,-1,0));assert.deepEqual(ray.intersectObject(source).map(h=>h.point.toArray()),ray.intersectObject(grouped,true).map(h=>h.point.toArray()));}
 for(const child of grouped.children){assert.equal(child.material,source.material);assert.equal(child.castShadow,true);}
 pass('spatial static groups preserve every triangle attribute and actual occlusion ray hit',{groups:grouped.children.length});
 const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(),source.material,4),matrix=new THREE.Matrix4(),color=new THREE.Color();
 for(let i=0;i<4;i++){mesh.setMatrixAt(i,matrix.makeTranslation(i*17,1,-i*7));mesh.setColorAt(i,color.setRGB(i/4,.5,1-i/5));}
 const instanced=spatialRenderGroup(mesh,8),rows=m=>{const a=[];for(let i=0;i<m.count;i++){m.getMatrixAt(i,matrix);m.getColorAt(i,color);a.push(JSON.stringify([...matrix.elements,...color.toArray()]));}return a.sort();};
 assert.deepEqual(instanced.children.flatMap(rows).sort(),rows(mesh));assert.equal(instanced.children.reduce((n,m)=>n+m.count,0),mesh.count);
 pass('instance matrices, colours and total decorative count are unchanged');
 // Reproduce the old coarse-mesh obstruction at the exact small-prey contact.
 const ground=new THREE.PlaneGeometry(220,150,220,150);ground.rotateX(-Math.PI/2);
 const gp=ground.attributes.position;for(let i=0;i<gp.count;i++)gp.setY(i,terrainHeight(gp.getX(i),gp.getZ(i)));
 const oldPositions=Array.from(gp.array),oldUV=Array.from(ground.attributes.uv.array),oldIndex=Array.from(ground.index.array),anchor=(()=>{const s=createReferenceState();createEcology(s);return s.ecology.actors.find(a=>a.id==='compact-shrimp-1');})(),height=terrainHeight(anchor.x,anchor.z);
 const cast=g=>{const mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));mesh.updateMatrixWorld(true);return new THREE.Raycaster(new THREE.Vector3(anchor.x,height+1,anchor.z),new THREE.Vector3(0,-1,0)).intersectObject(mesh)[0].point.y;};
 const previousGround=cast(ground);assert(previousGround-height>.001,'Original mesh must reproduce obstruction above the actual prey');
 pinTerrainContacts(ground,[anchor,{x:62.08,z:-6.97}],terrainHeight);
 assert(Math.abs(cast(ground)-height)<1e-6,'Ground must meet the actual resource instead of hiding it');
 assert.deepEqual(Array.from(ground.attributes.position.array).slice(0,oldPositions.length),oldPositions);assert.deepEqual(Array.from(ground.attributes.uv.array).slice(0,oldUV.length),oldUV);
 let oldArea=0,newArea=0;const area=(p,a,b,c)=>Math.abs((p[b*3]-p[a*3])*(p[c*3+2]-p[a*3+2])-(p[b*3+2]-p[a*3+2])*(p[c*3]-p[a*3]));
 for(let i=0;i<oldIndex.length;i+=3)oldArea+=area(oldPositions,...oldIndex.slice(i,i+3));const ni=ground.index.array,np=ground.attributes.position.array;for(let i=0;i<ni.length;i+=3){const ar=area(np,...ni.slice(i,i+3));assert(ar>1e-12);newArea+=ar;}assert(Math.abs(oldArea-newArea)<1e-5,'Shared-edge insertion must neither leave holes nor duplicate surface area');
 pass('actual tiny resource anchors remove coarse terrain obstruction; original vertices/UVs and total surface remain',{previousGround,contactHeight:height,insertedVertices:ground.attributes.position.count-oldPositions.length/3});
 let clearance=Infinity,oldPenetration=0,samples=0;const positive=new Set();
 for(const revision of [6,7])for(const seed of [20260825,123,77]){
  const state=createReferenceState(seed,revision);createEcology(state);
  for(let step=0;step<4800;step++){stepReference(state,.025,frameObserver);stepEcology(state,.025,frameObserver);for(const actor of state.ecology.actors)if(COASTAL_PROFILES[actor.taxon]&&['approaching','searching'].includes(actor.behaviorPhase)){const tip=billPoint(actor),gap=tip.y-terrainHeight(tip.x,tip.z);if(revision===6)oldPenetration=Math.min(oldPenetration,gap);else{clearance=Math.min(clearance,gap);assert(gap>=-1e-8,'The actual smoothed searching/return pose must stay above sediment');samples++;}}}
  if(revision===7)for(const id of ['compact-avocet','compact-redshank','compact-oystercatcher','compact-spoonbill']){const event=state.ecology.events.find(e=>e.actors[0]===id&&['shore-feeding','shell-competition'].includes(e.interaction));assert(event,'Contact correction must preserve positive feeding');assert(event.contactDistance<.004);positive.add(id);}
 }
 assert(oldPenetration<-.0009,'Pinned previous revision must reproduce the actual penetration');assert.equal(positive.size,4);
 pass('revision7 searching and return poses avoid sediment while all four concrete feeding events remain positive',{samples,minimumClearance:clearance,oldPenetration});
 const folder=new URL('./fixtures/compact-936e69d/',import.meta.url),manifest=JSON.parse(fs.readFileSync(new URL('GIT-SOURCE.json',folder))),commit='936e69dc2bd91ab4ab59bc1c63f7c66696085e1d';assert.equal(manifest.commit,commit);
 const gitAvailable=spawnSync('git',['cat-file','-e',commit+'^{commit}'],{stdio:'ignore'}).status===0;
 for(const[path,expected]of Object.entries(manifest.files)){const raw=fs.readFileSync(new URL(path,folder));assert.equal(createHash('sha256').update(raw).digest('hex'),expected.sha256,path);assert.equal(createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${raw.length}\0`),raw])).digest('hex'),expected.gitBlob,path);if(gitAvailable)assert.deepEqual(raw,execFileSync('git',['show',commit+':'+path]),path+' is immutable actual Git source');}
 const stats={numeric:0,exact:0,maxAbsoluteError:0},cases=[];
 for(const seed of [20260825,1219,77,4294967295])for(const revision of [1,2,3,4,5,6]){
  const previous=oldState(seed,revision),current=createReferenceState(seed,revision);oldEcology(previous);createEcology(current);compareHistorical(current,previous,'initial',stats);
  const observer={x:63,z:4};
  for(let i=0;i<600;i++){oldStep(previous,.1,observer);oldEcoStep(previous,.1,observer);stepReference(current,.1,observer);stepEcology(current,.1,observer);if([99,299,599].includes(i))compareHistorical(current,previous,'revision'+revision+' step'+i,stats);}
  cases.push({seed,revision,modelSeconds:current.time,events:current.ecology.events.length});
 }
 pass('revisions1–6 match unchanged936 Git model sources in the same process',{commit,modules:Object.keys(manifest.files).length,gitAvailable,cases,stats});
 for(const seed of [20260825,1219,77,4294967295]){
  const previous=createReferenceState(seed,6),current=createReferenceState(seed,7);createEcology(previous);createEcology(current);
  for(const key of ['trees','supports','plants'])assert.deepEqual(current[key],previous[key],key+' positions/IDs/anchors');
  assert.deepEqual(current.ecology.actors,previous.ecology.actors);assert.deepEqual(current.ecology.resources,previous.ecology.resources);
 }
 pass('new rendering revision preserves biological inventory, positions, support anchors and initial resources');
}catch(e){r.failure=String(e.stack||e);save();throw e;}
console.log(JSON.stringify(r));
