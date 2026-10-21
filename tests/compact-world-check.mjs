import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import * as T from '../dist/vendor/three.module.js';
import {TRAIL_LENGTH,TRAIL_SEGMENTS,trailPoint,nearestTrail,TRAIL_QUERY_STATS} from '../dist/trail.js';
import {AUTHORED_PONDS,OPENLAND_COMPRESSION,FOREST_CORE,layoutAxis,authoredAxis,AUTHORED_CENTERS} from '../dist/world-layout.js';
import {VILLAGE_LOTS,VILLAGE_STREET} from '../dist/village.js';
import {WildlifeRenderer} from '../dist/wildlife.js';
import {ExpeditionEcology} from '../dist/field-ecology.js';
import {ANIMALS} from '../dist/biodiversity.js';
import {wingShader,wingPose} from '../dist/bird-wings.js';
function fullScan(x,z){let best=null;for(const s of TRAIL_SEGMENTS){const t=Math.max(0,Math.min(1,((x-s.x)*s.tx+(z-s.z)*s.tz)/s.length)),px=s.x+(s.bx-s.x)*t,pz=s.z+(s.bz-s.z)*t,d=Math.hypot(x-px,z-pz);if(!best||d<best.offset)best={x:px,z:pz,tx:s.tx,tz:s.tz,distance:s.start+t*s.length,offset:d};}return best;}
let randomState=1791;const random=()=>((randomState=(randomState*1664525+1013904223)>>>0)/4294967296);
const points=[];for(let i=0;i<4000;i++)points.push({x:(random()-.5)*270,z:(random()-.5)*270});
for(const s of TRAIL_SEGMENTS)for(const p of [{x:s.x,z:s.z},{x:s.bx,z:s.bz}])points.push(p);
for(const x of [-10000,-400,0,400,10000])for(const z of [-10000,-400,0,400,10000])points.push({x,z});
for(const p of points)assert.deepEqual(nearestTrail(p.x,p.z),fullScan(p.x,p.z),'Indexed terrain support differs from a full geometric scan');
const near=Array.from({length:10000},(_,i)=>{const p=trailPoint((i*2.391)%TRAIL_LENGTH),u=(i%25-12)*.18;return{x:p.x+p.tz*u,z:p.z-p.tx*u};});
for(const fn of [nearestTrail,fullScan])for(const p of near)fn(p.x,p.z);
const times={};for(const [name,fn]of [['indexed',nearestTrail],['fullScan',fullScan]]){const runs=[];for(let repeat=0;repeat<5;repeat++){const start=performance.now();for(const p of near)fn(p.x,p.z);runs.push(performance.now()-start);}times[name]=runs.sort((a,b)=>a-b)[2];}
TRAIL_QUERY_STATS.queries=0;TRAIL_QUERY_STATS.candidates=0;for(const p of near)nearestTrail(p.x,p.z);
assert.ok(TRAIL_QUERY_STATS.candidates/near.length<TRAIL_SEGMENTS.length*.1,'Walking queries still scan too many path segments');
assert.equal(AUTHORED_PONDS.filter(p=>p.habitat==='forest').length,2);assert.equal(FOREST_CORE,73);assert.equal(OPENLAND_COMPRESSION,.46);assert.ok(TRAIL_LENGTH<750);
for(let x=-300;x<=300;x+=.5)assert.ok(Math.abs(authoredAxis(layoutAxis(x))-x)<1e-10);
for(const lot of VILLAGE_LOTS){assert.ok(Math.abs(Math.abs(lot.x-layoutAxis(AUTHORED_CENTERS.city.x))-33*.62*.56)<1e-10);assert.equal(lot.z,[-29,0,29][lot.row]*.62);}
assert.ok(VILLAGE_STREET.b.z>50,'Residential lane still ends inside the village');
T.TextureLoader.prototype.load=()=>new T.Texture();globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},getImageData(x,y,w,h){return{data:new Uint8ClampedArray(w*h*4).fill(160)};}})})};
const species=Object.values(ANIMALS).filter(s=>s.type==='bird'),birds=species.map((s,i)=>({species:s.id,id:i+1,alive:true,x:i*2,z:0,heading:.3,phase:.4,trait:1,age:0,flight:2,activity:'flying'}));
const renderer=new WildlifeRenderer(new T.Scene(),birds);for(let n=0;n<60;n++){for(const a of birds){a.age+=1/30;a.x+=.01;}renderer.update(()=>0,()=>-1,null);}
let mirroredVertices=0,flightPairs=0,wingTriangles=0;
for(const a of birds){
 const b=renderer.batches.get(a.species),g=b.wings.geometry,source=g.index?g.toNonIndexed():g,attrs=source.attributes,half=attrs.position.count/2;
 for(let t=0;t<half;t+=3)for(let v=0;v<3;v++){
  const left=t+v,right=half+t+[0,2,1][v];assert.equal(attrs.wingSide.getX(left),-1);assert.equal(attrs.wingSide.getX(right),1);
  for(const name of ['position','normal','color','uv'])for(let k=0;k<attrs[name].itemSize;k++)assert.equal(attrs[name].array[left*attrs[name].itemSize+k],attrs[name].array[right*attrs[name].itemSize+k]*(k===2&&['position','normal'].includes(name)?-1:1),'Wing reflection changes plumage, normal or triangle orientation');mirroredVertices++;
 }
 const m=new T.Matrix4();b.wings.getMatrixAt(0,m);assert.ok(m.determinant()>0,'A wing still uses an inverted instance transform');assert.equal(b.wings.count,1);flightPairs++;
 const preview=renderer.preview(a.species);renderer.updatePreview(preview,a);assert.equal(preview.userData.previewWings.length,1);const wing=preview.userData.previewWings[0];assert.ok(wing.visible);assert.equal(wing.scale.z,1);assert.deepEqual([...wing.material.userData.pose.value],[...new Float32Array(wingPose(a.motion,a.age))]);
 const shade={vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader,uniforms:{}};b.wings.material.onBeforeCompile(shade);assert.ok(shade.vertexShader.includes('objectNormal.z/=wingPose.y'));assert.ok(shade.fragmentShader.includes('fract(vMapUv)*0.494'),'Flying feathers do not use the same surface atlas as the bird');
 const depth={vertexShader:T.ShaderLib.depth.vertexShader,fragmentShader:T.ShaderLib.depth.fragmentShader,uniforms:{}};b.wings.customDepthMaterial.onBeforeCompile(depth);assert.ok(depth.vertexShader.includes('transformed=wingRotate(transformed,wingSide*wingPose.x)'),'Shadow does not match wing animation');wingTriangles+=g.index.count/3;if(source!==g)source.dispose();
}
let birdQueries=0;
const sim=new ExpeditionEcology('city',817);sim.agents=birds.map(a=>({...a,x:(a.id%8)*1.1,z:Math.floor(a.id/8)*1.1,activity:'resting',stateTime:100}));
for(let frame=0;frame<30;frame++){
 sim.update(.01,null);
 const speciesIndex=sim.bySpecies,predatorIndex=sim.predatorsByPrey,grid=sim.birdGrid;
 for(const a of sim.agents){const s=ANIMALS[a.species],x=a.x+.03*frame,z=a.z-.05*frame,height=frame%5*.35;
  const oracle=sim.birdNeighbors(x,z).every(b=>b===a||!b.alive||b.scenarioInactive||b.scenarioSuppressed||ANIMALS[b.species].type!=='bird'||Math.abs((b.flight||0)-height)>.4+s.size*.25||Math.hypot(x-b.x,z-b.z)>=sim.birdRadius(s,a)+sim.birdRadius(ANIMALS[b.species],b)||Math.hypot(x-b.x,z-b.z)>Math.hypot(a.x-b.x,a.z-b.z)+.00001&&Math.hypot(a.x-b.x,a.z-b.z)<sim.birdRadius(s,a)+sim.birdRadius(ANIMALS[b.species],b));
  assert.equal(sim.birdClear(x,z,s,a,height),oracle,'Allocation-free bird spacing changed the collision rule');birdQueries++;
 }
 sim.update(.01,null);assert.equal(sim.bySpecies,speciesIndex);assert.equal(sim.predatorsByPrey,predatorIndex);assert.equal(sim.birdGrid,grid);
}
const seal={id:500,species:'phoca_vitulina',alive:true,x:0,z:0,heading:0,phase:0,trait:1,age:0,flight:0,zoneWater:false,activity:'resting'};const seals=new WildlifeRenderer(new T.Scene(),[seal]);seals.update(()=>-.7,()=>.06,null,()=>.4);assert.ok(Math.abs(seal.y-seal.motion.bob-seal.motion.bodyOffset-.4)<1e-9,'Seal uses analytic soil below the actual rendered surface');
console.log(JSON.stringify({version:'0.16',routeLength:TRAIL_LENGTH,forestPonds:2,village:'five original life-size lots; street extends landward',exactTrailQueries:points.length,averageSegmentsPerWalkingQuery:TRAIL_QUERY_STATS.candidates/near.length,median10000QueriesMs:times,speedup:times.fullScan/times.indexed,birdQueries,flightPairs,mirroredVertices,wingTriangles,wingNormals:'reflected normals and reversed winding; identical plumage on both sides; positive instance matrices',wingAnimation:'one paired instance per flying bird; shadow and inset share its pose',seal:'land contact follows rendered terrain, not an older height formula'},null,2));
