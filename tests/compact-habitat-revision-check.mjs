import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync,writeFileSync } from 'node:fs';
import { createReferenceState } from '../dist/compact/world-state.js';
import { createEcology } from '../dist/compact/ecology.js';
import { floodingStatistics } from '../dist/compact/habitats.js';
import { nearestPath,terrainHeight } from '../dist/compact/layout.js';
const state=(seed,revision)=>{const s=createReferenceState(seed,revision);createEcology(s);return s;};
import {compareHistorical,unchangedHistoricalState,historicalSource,historicalTolerance} from './portable-historical-state.mjs';
const historicalComparisons=[];
const samples=s=>({plants:s.plants.map(({id,taxon,x,z,y,size,angle})=>({id,taxon,x,z,y,size,angle})),trees:s.trees,supports:s.supports});

assert.doesNotThrow(()=>compareHistorical({x:1},{x:1+Number.EPSILON}));
for(const [actual,expected]of [[{id:'changed'},{id:'old'}],[{ids:['b','a']},{ids:['a','b']}],[{x:1},{x:1+historicalTolerance.absolute*100}]])assert.throws(()=>compareHistorical(actual,expected));
const seeds=[20260825,1,42,20261022],results=[];
for(const seed of seeds){
 for(const revision of[1,2,3]){const actual=samples(state(seed,revision)),historical=samples(unchangedHistoricalState(seed,revision)),comparison=compareHistorical(actual,historical);historicalComparisons.push({seed,revision,...comparison,oldDigest:createHash('sha256').update(JSON.stringify(historical)).digest('hex'),currentDigest:createHash('sha256').update(JSON.stringify(actual)).digest('hex')});}
 assert.deepEqual(samples(state(seed,5)),samples(state(seed,4)),'Revision 5 visual refinement preserves every revision-4 plant, tree and support');
 const before=state(seed,3),after=state(seed,4),f=floodingStatistics(after),old=floodingStatistics(before),byId=new Map(before.plants.map(p=>[p.id,p]));
 assert.deepEqual(after.plants.map(p=>p.id),before.plants.map(p=>p.id),'Arrangement preserves every existing individual, count and iteration order');
 assert.deepEqual(after.trees.slice(0,3),before.trees.slice(0,3));assert.deepEqual(after.supports,before.supports);
 for(const t of after.trees){const prior=before.trees.find(p=>p.id===t.id);assert.equal(t.x,prior.x);assert.equal(t.z,prior.z);assert.equal(t.type,prior.type);assert(nearestPath(t.x,t.z).distance>t.r+1.2);}
 for(const p of after.plants){const previous=byId.get(p.id);assert.equal(p.size,previous.size);assert.equal(p.angle,previous.angle);
  if(p.taxon==='puccinellia_maritima'){assert.equal(p.z,previous.z);assert(p.x<=previous.x-4.5+1e-10);assert(p.y>=-.225);assert(terrainHeight(p.x+.25,p.z,4)<p.y,'Local stand drains down the seaward surface; no stand in a terrain hollow');}
  else if(p.microhabitat){assert(nearestPath(p.x,p.z).distance>=1.5);assert(!after.trees.some(t=>Math.hypot(t.x-p.x,t.z-p.z)<t.r+.45));}
  else assert.deepEqual(p,previous,'Unrelated observable plants remain in their original places');
 }
 assert(old.puccinellia_maritima.submerged.normalHigh.count>=40,'Reproduce the reported revision-3 Andel failure');
 assert.equal(f.puccinellia_maritima.count,55);assert.equal(f.puccinellia_maritima.submerged.normalHigh.count,0);
 assert.equal(f.puccinellia_maritima.submerged.higher.count,55);assert.equal(f.puccinellia_maritima.submerged.rare.count,55);
 for(const taxon of['halimione_portulacoides','festuca_rubra','salicornia_europaea','sporobolus_anglicus'])assert.deepEqual(f[taxon],old[taxon]);
 assert.equal(f.halimione_portulacoides.submerged.normalHigh.count,0);assert.equal(f.festuca_rubra.submerged.normalHigh.count,0);
 assert.equal(f.salicornia_europaea.submerged.normalHigh.percent,100);assert.equal(f.sporobolus_anglicus.submerged.normalHigh.percent,100);
 const median=taxon=>{const a=after.plants.filter(p=>p.taxon===taxon).map(p=>p.y).sort((a,b)=>a-b);return a[Math.floor(a.length/2)];};
 assert(median('salicornia_europaea')<median('puccinellia_maritima'));assert(median('sporobolus_anglicus')<median('puccinellia_maritima'));assert(median('puccinellia_maritima')<median('halimione_portulacoides'));assert(median('halimione_portulacoides')<median('festuca_rubra'));
 for(const level of['low','normalHigh','higher','rare'])for(const taxon of Object.keys(f))if(!after.plants.some(p=>p.taxon===taxon&&p.x>=18))assert.equal(f[taxon].submerged[level].count,0);
 results.push({seed,revision:4,historicalNormalHighAndel:old.puccinellia_maritima.submerged.normalHigh,rows:f});
 console.log('PASS historical reconstruction, same individuals, Andel height contour, complete gradient and path clearance: seed '+seed);
}
const out=process.argv[2];if(out){mkdirSync(out,{recursive:true});writeFileSync(out+'/habitat-revision-result.json',JSON.stringify({passed:true,seeds,environment:{node:process.version,platform:process.platform,architecture:process.arch},historicalSource,historicalComparisons,scope:'Deterministic state/geometry checks; visual acceptance requires actual before/after renders. Absolute model water heights: low −1.05 m; normalHigh −0.25 m; higher +0.05 m; rare +0.30 m. No annual flooding-frequency inference.',baseline:'f92146876f4364a4fb78d30d9e9b190bbb7dc1f4',results},null,2)+'\n');}
console.log(JSON.stringify({passed:seeds.length,seeds:seeds.length,historicalRevisionSeedChecks:seeds.length*3}));
