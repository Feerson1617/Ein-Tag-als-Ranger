import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js?revision=120';
import {createReferenceState,stepReference}from '../dist/compact/world-state.js';
import {createEcology,stepEcology}from '../dist/compact/ecology.js';
import {localObservationContext}from '../dist/compact/observation-context.js';
import {createExpandedView}from '../dist/compact/expanded-view.js';
import {createFaunaView}from '../dist/compact/fauna-view.js';

const out=process.argv[2],result={scope:'Actual Three.js animal geometry and local GLB assets, with a minimal world vegetation callback; no WebGL/browser or visual-acceptance claim.',passed:0,checks:[]};
const save=()=>{if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/result.json',JSON.stringify(result,null,2)+'\n');}};
const originalFetch=globalThis.fetch;
// Browser-relative shipped asset paths are resolved to their same local bytes.
globalThis.fetch=async url=>{const file=new URL('../dist/'+url,import.meta.url),data=fs.readFileSync(file);return {ok:true,arrayBuffer:async()=>data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength)};};
try{
 const state=createReferenceState();createEcology(state);const scene=new THREE.Scene(),observer={x:63,z:-12},positions=[];
 const plants=new THREE.InstancedMesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial(),state.plants.length);plants.userData.rows=state.plants;
 const world={plantMeshes:[plants],updateVegetation:value=>positions.push(structuredClone(value))};
 const reference=await createFaunaView(scene,state),expanded=await createExpandedView(scene,state,world,reference);
 const tissues=new Map([...expanded.models.entries()].filter(([,m])=>m.tissue).map(([id,m])=>[id,{position:m.tissue.position.clone(),quaternion:m.tissue.quaternion.clone(),scale:m.tissue.scale.clone()}]));
 expanded.update(observer);assert.equal(expanded.models.get('compact-mussel-0').visible,true);
 let consumed;
 for(let i=0;i<1200&&!consumed;i++){
  stepReference(state,.1,observer);stepEcology(state,.1,observer);
  consumed=state.ecology.events.find(e=>e.actors[0]==='compact-oystercatcher'&&e.after===e.before-1);
 }
 assert.ok(consumed,'A real positive mussel acquisition must precede the reset');
 expanded.update(observer);const preyModel=expanded.models.get(consumed.actors[1]);
 assert.equal(preyModel.tissue.parent,scene,'Carried tissue must really leave its shell before reset');
 const next=localObservationContext(state,observer,{runId:'prior',newRunId:'new-local',siteId:'coast'});Object.assign(state,next.state);
 reference.resetContext();expanded.resetContext(observer);
 assert.deepEqual(positions.at(-1),observer,'Reset must use the actual visitor position for vegetation and prey visibility');
 for(const a of state.ecology.actors.filter(a=>a.taxon==='mytilus_edulis'))assert.equal(expanded.models.get(a.id).visible,true,'Nearby renewed real mussel must be visible: '+a.id);
 result.passed++;result.checks.push({name:'explicit local reset preserves actual observer-dependent prey visibility and vegetation position',observer,vegetationObserver:positions.at(-1),nearbyMussels:18});save();
 for(const [id,home]of tissues){const model=expanded.models.get(id);assert.equal(model.tissue.parent,model);assert.equal(model.tissue.visible,true);assert.deepEqual(model.tissue.position.toArray(),home.position.toArray());assert.deepEqual(model.tissue.quaternion.toArray(),home.quaternion.toArray());assert.deepEqual(model.tissue.scale.toArray(),home.scale.toArray());}
 assert.equal(state.ecology.events.length,0);assert.equal(state.ecology.resources['shared-mussels'].amount,18);assert.equal(state.time,0);
 assert.ok(reference.deer.geometry.attributes.position.array.every(Number.isFinite));assert.ok(reference.deer.geometry.attributes.normal.array.every(Number.isFinite));
 result.passed++;result.checks.push({name:'actual carried shell tissue returns to its shell and the fresh animal meshes remain finite',consumedPrey:consumed.actors[1],consumedAt:consumed.endedAt,restoredTissues:tissues.size});save();
}catch(error){result.failure=String(error.stack||error);save();throw error;}
finally{globalThis.fetch=originalFetch;}
console.log(JSON.stringify(result));
