import { structureTreeAges } from './habitats.js';
import { MANIFEST,MODEL_REVISION } from './manifest.js';
import { nearestPath,terrainHeight } from './layout.js';
export function randomGenerator(seed){let v=seed>>>0;return()=>((v=(Math.imul(v,1664525)+1013904223)>>>0)/4294967296);}
export function createReferenceState(seed=MANIFEST.initialSeed,modelRevision=MODEL_REVISION){
 const ground=(x,z)=>terrainHeight(x,z,modelRevision);
 const random=randomGenerator(seed),trees=[{id:'support-beech-a',x:-58,z:12,r:.24,h:10,type:'beech'},{id:'support-beech-b',x:-64,z:17,r:.27,h:11,type:'beech'},{id:'support-oak-c',x:-37,z:-9,r:.31,h:11,type:'oak'}];
 for(let i=0;i<120;i++){const x=-78+random()*50,z=-46+random()*92;if(nearestPath(x,z).distance<2.6||Math.hypot(x+58,z-3)<4||trees.some(t=>Math.hypot(t.x-x,t.z-z)<3.5))continue;trees.push({id:'tree-'+i,x,z,r:.18+random()*.16,h:8+random()*6,type:x>-37?'oak':'beech'});}
 structureTreeAges({trees,modelRevision},randomGenerator(seed+405));
 const supports=trees.slice(0,2).map(t=>({id:t.id+':trunk',treeId:t.id,x:t.x+.12*(1.6/(t.h*.72))+t.r*(1-.55*(1.6/(t.h*.72)))+.012*MANIFEST.actorScale.woodpecker,z:t.z,y:ground(t.x,t.z)+1.6,normal:[1,0,0],valid:true}));
 const plants=[];
 const patch=(taxon,cx,cz,count,radius,size)=>{for(let i=0;i<count;i++){const angle=random()*Math.PI*2,r=Math.sqrt(random())*radius,x=cx+Math.cos(angle)*r,z=cz+Math.sin(angle)*r;if(nearestPath(x,z).distance<1.25)continue;plants.push({id:`${MANIFEST.worldVersion}:${taxon}:${plants.length}`,taxon,x,z,y:ground(x,z),size:size*(.8+.4*random()),angle:random()*6.28});}};
 patch('galium_odoratum',-57,7,95,3,.23);patch('galium_odoratum',-66,-11,120,5,.25);patch('galium_odoratum',-49,-25,100,4,.22);
 patch('urtica_dioica',-43,12,32,2.2,.85);patch('urtica_dioica',-27,8,42,3,.95);
 patch('halimione_portulacoides',43,10,42,4,.65);patch('salicornia_europaea',49,-3,80,4,.3);patch('sporobolus_anglicus',46,-13,40,4,.95);
 const deer={id:'compact-deer-1',taxon:'capreolus_capreolus',x:-59,z:3,heading:0,activity:'resting',phase:0,feet:[],supportId:null};
 const bird={id:'compact-woodpecker-1',taxon:'dendrocopos_major',x:supports[0].x,y:supports[0].y,z:supports[0].z,supportId:supports[0].id,activity:'searching',phase:0,targetIndex:0};
 return {initialSeed:seed,modelRevision,worldVersion:MANIFEST.worldVersion,time:0,trees,supports,plants,deer,bird};
}
const mix=(a,b,t)=>a+(b-a)*t;
export function stepReference(state,dt,observer){
 state.time+=dt;const d=state.deer;d.phase+=dt;
 const disturbance=Math.hypot(observer.x-d.x,observer.z-d.z)<2.8;
 // Short, bounded browsing visit; no synthetic population dynamics or biological rates.
 const cycle=state.time%32;
 if(disturbance||cycle>19&&cycle<28){d.activity=disturbance?'retreating':'walking';const velocity=disturbance?.85:.38;d.x-=velocity*dt;d.z+=(d.z<2?.18:-.08)*dt;d.heading=Math.PI;d.phase+=dt*3;}
 else d.activity=cycle<9?'browsing':'resting';
 // The visitor remains in cover, not wrapped/re-spawned when it reaches an edge.
 if(d.x<-74)d.activity='resting';d.x=Math.max(-74,d.x);
 const b=state.bird,valid=state.supports.find(s=>s.id===b.supportId&&s.valid&&state.trees.some(t=>t.id===s.treeId));
 b.phase+=dt;
 if(!valid&&b.activity!=='flying'){b.supportId=null;b.activity='flying';b.flightStart={x:b.x,y:b.y,z:b.z};b.flightTime=0;b.targetIndex=(b.targetIndex+1)%state.supports.length;}
 const near=Math.hypot(observer.x-b.x,observer.z-b.z)<1.5;
 if(b.activity!=='flying'&&(b.phase>15||near)){b.flightStart={x:b.x,y:b.y,z:b.z};b.flightTime=0;b.supportId=null;b.activity='flying';b.targetIndex=(b.targetIndex+1)%state.supports.length;}
 if(b.activity==='flying'){
  const target=state.supports[b.targetIndex];b.flightTime+=dt;
  if(!target?.valid||!state.trees.some(t=>t.id===target.treeId)){b.y=Math.max(b.y,3);return;}
  const t=Math.min(1,b.flightTime/3.5),e=t*t*(3-2*t);b.x=mix(b.flightStart.x,target.x,e);b.z=mix(b.flightStart.z,target.z,e);b.y=mix(b.flightStart.y,target.y,e)+Math.sin(Math.PI*t)*1.8;
  if(t===1){b.x=target.x;b.y=target.y;b.z=target.z;b.supportId=target.id;b.activity='searching';b.phase=0;}
 }else {b.x=valid.x;b.z=valid.z;b.y=valid.y;b.activity=b.phase<10?'searching':'resting';}
}
