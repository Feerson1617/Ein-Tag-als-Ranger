import assert from 'node:assert/strict';
import { writeFileSync,mkdirSync } from 'node:fs';
import { createReferenceState } from '../dist/compact/world-state.js';
import { createEcology } from '../dist/compact/ecology.js';
import { FOREST_HABITATS,floodingStatistics } from '../dist/compact/habitats.js';
import { PATHS,routeMetrics,terrainHeight,nearestPath,canWalk,START } from '../dist/compact/layout.js';
import { SPEAKERS,speakerApproach,nearestSpeaker } from '../dist/compact/village.js';
import { createVegetationView,vegetationDetail } from '../dist/compact/vegetation-view.js';
import * as THREE from '../dist/vendor/three.module.js';
import { emptyLearning } from '../dist/compact/missions.js';
import { parseCompact } from '../dist/compact/journal.js';
const state=(seed,rev=4)=>{const s=createReferenceState(seed,rev);createEcology(s);return s;},rows=[];
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('PASS '+name);};
test('authored microhabitats and age structure preserve old identities and support trees',()=>{
 for(const seed of [20260825,1,42,20261022]){
  const a=state(seed,1),b=state(seed);assert.equal(new Set(b.plants.map(p=>p.id)).size,b.plants.length);
  for(const p of a.plants)assert(b.plants.some(q=>q.id===p.id&&q.taxon===p.taxon));
  assert.deepEqual(b.trees.slice(0,3),a.trees.slice(0,3));assert.deepEqual(new Set(b.trees.slice(3).map(t=>t.ageClass)),new Set(['young','mature','old']));
  for(const h of FOREST_HABITATS)assert(b.plants.some(p=>p.microhabitat===h.id)||h.id==='deadwood');
  assert(b.plants.filter(p=>p.taxon==='galium_odoratum').length>a.plants.filter(p=>p.taxon==='galium_odoratum').length+100);
  for(const p of b.plants.filter(p=>p.microhabitat))assert(nearestPath(p.x,p.z).distance>=1.5);
  for(const t of b.trees)assert(nearestPath(t.x,t.z).distance>.9+t.r+.3,'Trunk/player clearance to real deck');
  assert(canWalk(START.x,START.z,b.trees));rows.push({seed,plantCount:b.plants.length,flooding:floodingStatistics(b)});
 }
});
test('LOD keeps concrete matrices, nearby diagnostic plants and damaged-instance exclusions',()=>{
 const s=state(123),scene=new THREE.Scene(),v=createVegetationView(scene,s.plants),mesh=v.meshes.find(m=>m.userData.rows.some(p=>p.taxon==='urtica_dioica'));
 const matrices=v.meshes.map(m=>Array.from(m.instanceMatrix.array));
 mesh.setMatrixAt(0,new THREE.Matrix4().makeScale(0,0,0));matrices[v.meshes.indexOf(mesh)]=Array.from(mesh.instanceMatrix.array);
 for(const observer of [{x:-52,z:8},{x:70,z:10},{x:-40,z:12}])for(const window of ['summer','spring','autumn','summer']){
  v.update(observer,window);for(const [i,m]of v.meshes.entries()){assert.deepEqual(Array.from(m.instanceMatrix.array),matrices[i]);if(m.userData.rows.some(p=>Math.hypot(p.x-observer.x,p.z-observer.z)<=9))assert.equal(m.userData.detail,'near');}
 }
 assert.equal(vegetationDetail(40),'far');assert.equal(vegetationDetail(25),'middle');assert.equal(vegetationDetail(5),'near');assert.equal(v.meshes.reduce((n,m)=>n+m.count,0),s.plants.length);v.dispose();
});
test('normal high water leaves Andel and Keilmelde dry while pioneers flood; absolute higher-water scenarios are separate',()=>{
 for(const row of rows){const f=row.flooding;assert.equal(f.halimione_portulacoides.submerged.normalHigh.count,0);assert(f.halimione_portulacoides.submerged.higher.count>0);assert.equal(f.festuca_rubra.submerged.normalHigh.count,0);assert.equal(f.puccinellia_maritima.submerged.normalHigh.count,0);assert.equal(f.puccinellia_maritima.submerged.higher.percent,100);assert(f.salicornia_europaea.submerged.normalHigh.percent>80);assert(f.sporobolus_anglicus.submerged.normalHigh.percent>80);assert(f.halimione_portulacoides.surfaceRange[0]>f.puccinellia_maritima.surfaceRange[0]);}
});
test('historical revision 2 reconstructs its old plant coordinates; new terrain is explicitly revision 3',()=>{
 const a=state(123,2),b=state(123,3),p=a.plants.find(p=>p.taxon==='halimione_portulacoides'),q=b.plants.find(q=>q.id===p.id);assert.equal(p.x-q.x,8);assert(a.plants.length<b.plants.length);assert.equal(terrainHeight(8,0,2),1.7547694655894313);
 const d={schemaVersion:2,worldVersion:a.worldVersion,records:[{id:'old',individualId:p.id,taxon:p.taxon,x:p.x,z:p.z,method:'magnifier',siteId:'compact-saltmarsh',modelRevision:2,worldVersion:a.worldVersion,runId:'older',initialSeed:123,window:'summer',simulationTime:10,observationSeconds:3,source:'own-observation',note:'Originaler Zwischenstand.',events:[]}],archives:[],previousEditions:[],learning:emptyLearning()};assert(parseCompact(JSON.stringify(d)));d.records[0].modelRevision=3;assert.throws(()=>parseCompact(JSON.stringify(d)),/Standort/);
});
test('terrain and deck form continuous banks/crown, every route remains walkable',()=>{
 assert(terrainHeight(8,0)>1.5);assert(Math.abs(terrainHeight(8,0)-terrainHeight(10,0))<.001);assert(terrainHeight(-5,0)<.4);assert(terrainHeight(25,0)<.4);assert(routeMetrics().maxSlope<.16);
 for(const path of PATHS)for(let i=1;i<path.length;i++){const p=path[i],q=path[i-1];assert(canWalk(p.x,p.z));assert(Math.abs(p.y-q.y)<.045);assert(Math.abs(p.y-Math.max(.46,terrainHeight(p.x,p.z)+.09))<1e-9);}
});
test('all three world speakers are reachable from paths, dialogue import rejects remote/contradictory encounters',()=>{
 const s=state(123),base={schemaVersion:2,worldVersion:s.worldVersion,records:[],archives:[],previousEditions:[],learning:emptyLearning()};
 for(const p of SPEAKERS){const a=speakerApproach(p);assert(canWalk(a.x,a.z));assert(nearestSpeaker(a).distance<=2.7);assert.equal(nearestSpeaker(a).id,p.id);assert(nearestPath(p.x,p.z).distance>1);
  const d=structuredClone(base);d.learning.perspectives=[{id:p.id,source:'model-dialogue',speakerId:p.id,x:a.x,z:a.z,runId:'walk',initialSeed:123,worldVersion:s.worldVersion,modelRevision:3,window:'summer',simulationTime:20}];assert(parseCompact(JSON.stringify(d)));d.learning.perspectives[0].x=79;assert.throws(()=>parseCompact(JSON.stringify(d)),/Gespräch/);
 }
});
const out=process.argv[2];if(out){mkdirSync(out,{recursive:true});writeFileSync(out+'/habitat-result.json',JSON.stringify({passed,scope:'Deterministic model/geometry/validation checks, not visual ecology approval',routeMetrics:routeMetrics(),rows},null,2)+'\n');}
console.log(JSON.stringify({passed,seeds:rows.length}));
