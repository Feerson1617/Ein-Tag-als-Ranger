// Independent reconstruction from the user's concrete review descriptions.
// Original uploaded >32 MiB QA archive was unavailable; this is our own audit.
import fs from 'node:fs';
import {createReferenceState,stepReference}from '../dist/compact/world-state.js';
import {createEcology,stepEcology,tideAt}from '../dist/compact/ecology.js';
import {parseCompact}from '../dist/compact/journal.js';
import {emptyLearning,assessMission}from '../dist/compact/missions.js';
import {WORLD_VERSION,MANIFEST}from '../dist/compact/manifest.js';
import {terrainHeight,routeMetrics}from '../dist/compact/layout.js';
const out=process.argv[2]||'work/qa-correction/baseline';fs.mkdirSync(out,{recursive:true});
const world=(seed)=>{const s=createReferenceState(seed);createEcology(s);return s;};
const s=world(MANIFEST.initialSeed),p=s.plants.find(p=>p.taxon==='galium_odoratum');
const book={schemaVersion:2,worldVersion:WORLD_VERSION,records:[{id:'baseline-woodruff',taxon:p.taxon,individualId:p.id,initialSeed:s.initialSeed,worldVersion:WORLD_VERSION,runId:'baseline-run',window:'summer',source:'own-observation',observationSeconds:3,simulationTime:0,x:p.x,z:p.z,method:'magnified-active-model',siteId:'compact-forest-core',note:'Synthetic QA baseline.'}],archives:[],previousEditions:[],learning:emptyLearning()};
const malformed=structuredClone(book);malformed.learning.drafts.K1={features:{invalid:true}};
const impossible=structuredClone(book);Object.assign(impossible.records[0],{x:999999,z:-999999,method:'invented-method'});
const accepted=d=>{try{parseCompact(JSON.stringify(d));return true;}catch{return false;}};
fs.writeFileSync(out+'/repro-invalid-top-level-features.json',JSON.stringify(malformed,null,2));fs.writeFileSync(out+'/repro-impossible-coordinates.json',JSON.stringify(impossible,null,2));
book.learning.answers.K5={option:'reroute',alternative:'seasonal-rest',criteria:['access','disturbance'],evidenceIds:['baseline-woodruff'],uncertainty:'limited-model',factValue:'facts-and-values-separated',reasoning:'Ein sachfremder Waldmeisterbeleg soll keine Küstenentscheidung bestätigen.'};
const coastal=[];
for(const seed of[123,20260825,20260826,987654])for(const dt of[1/60,.1,.5,1]){
 const w=world(seed),jumps=Object.fromEntries(['compact-oystercatcher','compact-crab','compact-bee'].map(id=>[id,{distance:0,at:0,dt}]));
 for(let t=0;t<600-1e-7;t+=dt){const step=Math.min(dt,600-t),before=new Map(w.ecology.actors.map(a=>[a.id,[a.x,a.y,a.z]]));stepReference(w,step,{x:0,z:0});stepEcology(w,step);for(const a of w.ecology.actors){if(!jumps[a.id])continue;const b=before.get(a.id),distance=Math.hypot(a.x-b[0],a.y-b[1],a.z-b[2]);if(distance>jumps[a.id].distance)jumps[a.id]={distance,at:w.time,dt:step};}}
 const counts=Object.fromEntries(['compact-avocet','compact-redshank','compact-spoonbill','compact-oystercatcher'].map(id=>[id,w.ecology.events.filter(e=>['shore-feeding','shell-competition'].includes(e.interaction)&&e.actors[0]===id&&e.after<e.before).length]));coastal.push({seed,dt,seconds:600,counts,jumps});
}
const flooding=Object.fromEntries([...new Set(s.plants.map(p=>p.taxon))].map(taxon=>{const rows=s.plants.filter(p=>p.taxon===taxon);return[taxon,{count:rows.length,lowSubmerged:rows.filter(p=>p.y<tideAt(0).waterLevel).length,normalHighSubmerged:rows.filter(p=>p.y<tideAt(60).waterLevel).length,minimumSurface:Math.min(...rows.map(p=>p.y)),maximumSurface:Math.max(...rows.map(p=>p.y))}];}));
const result={sourceCommit:process.argv[3]||'unspecified',scope:'Own reconstruction, not the unavailable independent archive',F01:{malformedTopLevelFeaturesAccepted:accepted(malformed)},F04:{impossibleCoordinatesAndMethodAccepted:accepted(impossible)},F10:{unrelatedWoodruffCompletesManagement:assessMission('K5',book).complete},coastal,flooding,route:routeMetrics()};
fs.writeFileSync(out+'/reconstructed-audit.json',JSON.stringify(result,null,2));console.log(JSON.stringify({F01:result.F01,F04:result.F04,F10:result.F10,firstCoastal:coastal[0],flooding:result.flooding.halimione_portulacoides}));
