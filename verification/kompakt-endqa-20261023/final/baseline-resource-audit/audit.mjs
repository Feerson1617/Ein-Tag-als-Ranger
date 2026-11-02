import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL}from 'node:url';
import {createHash}from 'node:crypto';
const root=path.resolve(process.argv[2]||'/workspace/ranger-baseline-20261023'),out=path.resolve(process.argv[3]||'work/qa-2026-10-23/context-baseline');
const {createReferenceState,stepReference}=await import(pathToFileURL(root+'/dist/compact/world-state.js'));
const {createEcology,stepEcology}=await import(pathToFileURL(root+'/dist/compact/ecology.js'));
const ids=['compact-avocet','compact-spoonbill','compact-redshank','compact-oystercatcher'];
const resources=['small-juveniles','shrimp','small-worms','shared-mussels'];
const targets=[180,240,600,1200],scenarios=[];
const events=s=>s.ecology.events.filter(e=>['shore-feeding','shell-competition'].includes(e.interaction)&&e.after===e.before-1);
for(const seed of [20260825,1,42,20261022])for(const dt of [1/60,.1]){
 const s=createReferenceState(seed);createEcology(s);let steps=0,integratedSeconds=0;const snapshots=[];
 for(const target of targets){while(s.time<target-1e-8){const h=Math.min(dt,target-s.time);stepReference(s,h,{x:0,z:0});stepEcology(s,h,{x:0,z:0});steps++;integratedSeconds+=h;}
  assert.ok(Math.abs(s.time-target)<1e-8);const found=events(s);
  snapshots.push({modelSeconds:s.time,integratedSeconds,steps,resources:Object.fromEntries(resources.map(k=>[k,{...s.ecology.resources[k]}])),birds:Object.fromEntries(ids.map(id=>[id,{successfulAcquisitions:found.filter(e=>e.actors[0]===id).length,lastAcquisition:found.filter(e=>e.actors[0]===id).at(-1)||null,current:s.ecology.actors.find(a=>a.id===id)}]))});
 }
 scenarios.push({seed,dt,snapshots});console.log('AUDIT '+seed+' dt='+dt+' modelSeconds='+s.time);
}
const files=['world-state.js','ecology.js','coastal-behaviour.js','coastal-rig.js','manifest.js'];
fs.writeFileSync(out+'/result.json',JSON.stringify({scope:'Own deterministic reconstruction of checked-out f921 baseline. Actual model stepping to 180/240/600/1200 model seconds; not a wall-clock browser-duration claim and not the inaccessible independent archive.',sourceRoot:root,sourceCommit:fs.readFileSync(out+'/source-commit.txt','utf8').trim(),sourceHashes:Object.fromEntries(files.map(name=>[name,createHash('sha256').update(fs.readFileSync(root+'/dist/compact/'+name)).digest('hex')])),scenarios},null,2)+'\n');
console.log(JSON.stringify({completed:true,scenarios:scenarios.length,targets}));
