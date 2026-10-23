import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync,writeFileSync } from 'node:fs';
import { createReferenceState } from '../dist/compact/world-state.js';
import { createEcology } from '../dist/compact/ecology.js';
import { floodingStatistics } from '../dist/compact/habitats.js';
import { nearestPath,terrainHeight } from '../dist/compact/layout.js';
const state=(seed,revision)=>{const s=createReferenceState(seed,revision);createEcology(s);return s;};
// Reproduced from immutable f92146876f4364a4fb78d30d9e9b190bbb7dc1f4, before
// changing the runtime. Coordinates/IDs/sizes/angles, complete trees and bird
// supports must remain reconstructible for old imported observation contexts.
const historical={
 '1:20260825':'803b487d9f013ef5a4b6dbcc9f00a474971538755db40b0d04bbd0be3196ee56',
 '1:1':'7a289e242de462de97da3e08e3da9436518f6a19e27b371096677ff9f7dd326a',
 '1:42':'0bd3ee7c48d60a2d14299cc46920fb2747b7a8336a49dbdf6aaf9401c1a8f117',
 '1:20261022':'d7015e1c5e5945523ded93e842d09c35a681559c85534c827ff44b56fdaa3661',
 '3:20260825':'4b46a98b0a91c16a7d97c04a6ed23c6fd33512cc77f03ff2652d1b664eff446b',
 '3:1':'1d1b980830dc6856577bf4a4926e8615490ef395dcfdb8680acf1243ba2f61c9',
 '3:42':'c6bbf889f1e45d257af5363b0cea96c61e033c3b243768542051fa02fcafbf63',
 '3:20261022':'b3b7f1e00c2ce0ec27a514ff499028f1aa8082aa72c6f9aafb835fd92fcc93d1'
};
const samples=s=>({plants:s.plants.map(({id,taxon,x,z,y,size,angle})=>({id,taxon,x,z,y,size,angle})),trees:s.trees,supports:s.supports});
const seeds=[20260825,1,42,20261022],results=[];
for(const seed of seeds){
 for(const revision of[1,2,3]){const digest=createHash('sha256').update(JSON.stringify(samples(state(seed,revision)))).digest('hex');assert.equal(digest,historical[`${revision===2?1:revision}:${seed}`],`Historical revision ${revision}, seed ${seed}`);}
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
const out=process.argv[2];if(out){mkdirSync(out,{recursive:true});writeFileSync(out+'/habitat-revision-result.json',JSON.stringify({passed:true,seeds,scope:'Deterministic state/geometry checks; visual acceptance requires actual before/after renders. Absolute model water heights: low −1.05 m; normalHigh −0.25 m; higher +0.05 m; rare +0.30 m. No annual flooding-frequency inference.',baseline:'f92146876f4364a4fb78d30d9e9b190bbb7dc1f4',results},null,2)+'\n');}
console.log(JSON.stringify({passed:seeds.length,seeds:seeds.length,historicalRevisionSeedChecks:seeds.length*3}));
