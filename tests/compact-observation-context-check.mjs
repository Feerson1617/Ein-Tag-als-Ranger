import assert from 'node:assert/strict';
import fs from 'node:fs';
import {MANIFEST,WORLD_VERSION,STORAGE_KEY}from '../dist/compact/manifest.js';
import {createReferenceState,stepReference}from '../dist/compact/world-state.js';
import {createEcology,stepEcology,stationSnapshot,tideAt}from '../dist/compact/ecology.js';
import {COASTAL_PROFILES}from '../dist/compact/coastal-rig.js';
import {localObservationContext,COASTAL_STATIONS}from '../dist/compact/observation-context.js';
import {eventIssue}from '../dist/compact/evidence.js';
import {observationSite}from '../dist/compact/observation-schema.js';
import {CompactJournal,parseCompact}from '../dist/compact/journal.js';
import {emptyLearning,evaluateCoast,assessMission}from '../dist/compact/missions.js';

const out=process.argv[2],checks=[],scenarios=[],contextChanges=[],importCases=[];
const save=(failure)=>{if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/result.json',JSON.stringify({scope:'Deterministic model acquisition, explicit local context and import contracts. No browser or physical-device claim.',passed:checks.length,checks,scenarios,contextChanges,importCases,...(failure?{failure:String(failure.stack||failure)}:{})},null,2)+'\n');}};
function check(name,fn){try{fn();checks.push(name);save();console.log('PASS '+name);}catch(error){save(error);throw error;}}
const world=(seed=MANIFEST.initialSeed)=>{const s=createReferenceState(seed);createEcology(s);return s;};
const advance=(s,seconds,dt=.1,observer={x:0,z:0},after=()=>{})=>{const end=s.time+seconds;while(s.time<end-1e-8){const h=Math.min(dt,end-s.time);stepReference(s,h,observer);stepEcology(s,h,observer);after(s);}assert.ok(Math.abs(s.time-end)<1e-8);};
const birdIds=Object.values(COASTAL_PROFILES).map(p=>'compact-'+p.id);
const feeding=s=>s.ecology.events.filter(e=>['shore-feeding','shell-competition'].includes(e.interaction));
function requireFour(events){for(const id of birdIds)assert.ok(events.some(e=>e.actors[0]===id&&e.before>0&&e.after===e.before-1),'No real successful acquisition: '+id);}
const scene=(s,runId,sceneOrigin)=>({runId,worldVersion:WORLD_VERSION,modelRevision:s.modelRevision,initialSeed:s.initialSeed,window:s.ecology.window,...(sceneOrigin?{sceneOrigin}:{} )});
const record=(s,p,id,runId,sceneOrigin)=>({id,taxon:p.taxon,individualId:p.id,...scene(s,runId,sceneOrigin),source:'own-observation',observationSeconds:3,simulationTime:s.time,x:p.x,z:p.z,note:'Eigene Modellbeobachtung; keine Naturmessung.',method:'magnified-active-model',siteId:observationSite(p.x),events:[]});
const book=()=>({schemaVersion:2,worldVersion:WORLD_VERSION,records:[],archives:[],previousEditions:[],learning:emptyLearning()});
function protocol(s,id,runId,sceneOrigin){const start=s.time;advance(s,6);const snapshot=stationSnapshot(s,'compact-cockle-0');return {...snapshot,...scene(s,runId,sceneOrigin),id,source:'model-protocol',duration:6,simulationTime:s.time,stableState:Array.from({length:61},(_,i)=>tideAt(start+i/10).waterLevel>snapshot.sedimentSurface?'filtering':'resting').every(activity=>activity===snapshot.activity)};}

check('N01 all four birds acquire concrete finite prey for four seeds at 60 Hz and 100 ms',()=>{
 assert.throws(()=>requireFour([]));
 for(const seed of [20260825,1,42,20261022])for(const dt of [1/60,.1]){
  const s=world(seed),departures=new Map(),phases=Object.fromEntries(birdIds.map(id=>[id,new Set()]));
  advance(s,600,dt,{x:0,z:0},()=>{
   for(const a of s.ecology.actors)if(birdIds.includes(a.id)){
    phases[a.id].add(a.behaviorPhase);
    if(a.lastFeeding?.departedAt!==undefined)departures.set(a.id+':'+a.lastFeeding.consumedAt,structuredClone(a.lastFeeding));
   }
  });
  const events=feeding(s);requireFour(events);
  const preyIds=new Set();
  for(const e of events){
   const consumer=s.ecology.actors.find(a=>a.id===e.actors[0]),prey=s.ecology.actors.find(a=>a.id===e.actors[1]);
   assert.ok(consumer&&prey&&consumer!==prey);assert.equal(prey.alive,false);assert.ok(!preyIds.has(prey.id),'Same concrete prey acquired twice');preyIds.add(prey.id);
   assert.equal(eventIssue({...record(s,consumer,'event-record','first-run'),events:[e]},e),null);
   assert.equal(e.after,e.before-1);assert.ok(e.before>0&&e.after>=0);assert.equal(e.resourceId,s.ecology.resources[e.resource].id);
   assert.ok(e.startedAt<e.contactAt&&e.contactAt<=e.handlingStartedAt&&e.handlingStartedAt<e.endedAt&&e.endedAt<=600);
   assert.ok(e.contactDistance>=0&&e.contactDistance<.004);
   assert.ok(Math.abs(Math.hypot(e.contactPoint.x-e.preyPoint.x,e.contactPoint.y-e.preyPoint.y,e.contactPoint.z-e.preyPoint.z)-e.contactDistance)<1e-10);
   if(birdIds.includes(consumer.id)){
    const p=COASTAL_PROFILES[consumer.taxon],departure=departures.get(consumer.id+':'+e.endedAt);
    assert.equal(e.resource,p.resource);assert.equal(e.technique,p.technique);
    assert.deepEqual(e.sequence,['approach','bill-contact','handling','prey-acquired']);
    assert.ok(e.preyWaterDepth>=p.depth[0]&&e.preyWaterDepth<=p.depth[1]);
    assert.ok(e.endedAt-e.handlingStartedAt>=p.handling-1e-7);
    assert.ok(departure,consumer.id+' must really depart after each acquisition');
    assert.equal(departure.preyId,prey.id);assert.ok(departure.departedAt>e.endedAt);
    assert.ok(Math.hypot(departure.departurePosition.x-e.bodyPosition.x,departure.departurePosition.z-e.bodyPosition.z)>.4);
   }
  }
  for(const key of ['small-juveniles','small-worms','shrimp','shared-mussels']){
   const r=s.ecology.resources[key];assert.ok(Number.isFinite(r.amount)&&r.amount>=0&&r.amount<=r.initial);
   assert.equal(r.initial-r.amount,events.filter(e=>e.resource===key).length);
  }
  for(const id of birdIds)for(const phase of ['approaching','searching','handling','swallowing','departing'])assert.ok(phases[id].has(phase),id+' missing '+phase);
  scenarios.push({seed,dt,modelSeconds:s.time,counts:Object.fromEntries(birdIds.map(id=>[id,events.filter(e=>e.actors[0]===id).length])),resources:structuredClone(s.ecology.resources),departures:Object.fromEntries(departures),events});
 }
});

check('N01 an explicit reached-site context starts a separate finite run after 240 or 1200 actual model seconds',()=>{
 for(const seconds of [240,1200]){
  const s=world();advance(s,seconds);const original=structuredClone(s),observer={x:63,z:-12,y:2.1,yaw:.7,pitch:-.2},savedObserver=structuredClone(observer);
  const data=book();data.records=[record(s,s.plants[0],'prior-note','prior-run')];data.learning.drafts.K1={reasoning:'Vor dem neuen Fenster gesicherte eigene Begründung.'};
  const stored=new Map([[STORAGE_KEY,JSON.stringify(data)]]);let writes=0;const storage={getItem:k=>stored.get(k)||null,setItem:(k,v)=>{writes++;stored.set(k,v);}},journal=new CompactJournal(storage),bytes=stored.get(STORAGE_KEY),journalBefore=structuredClone(journal.data);
  const next=localObservationContext(s,observer,{runId:'prior-run',newRunId:'local-'+seconds,siteId:'coast'});
  assert.notEqual(next.state,s);assert.equal(next.runId,'local-'+seconds);assert.equal(next.state.time,0);assert.equal(next.state.initialSeed,s.initialSeed);assert.equal(next.state.modelRevision,s.modelRevision);assert.equal(next.state.ecology.window,s.ecology.window);
  assert.deepEqual(next.sceneOrigin,{kind:'local-observation-window',previousRunId:'prior-run',previousSimulationTime:s.time,siteId:'coast',x:63,z:-12,startSimulationTime:0});
  assert.equal(next.state.ecology.events.length,0);assert.equal(next.state.ecology.sequence,0);
  for(const r of Object.values(next.state.ecology.resources))assert.ok(Number.isFinite(r.initial)&&r.initial>0&&r.amount===r.initial);
  assert.deepEqual(observer,savedObserver);assert.deepEqual(s,original);assert.equal(stored.get(STORAGE_KEY),bytes);assert.deepEqual(journal.data,journalBefore);assert.equal(writes,0);
  contextChanges.push({priorModelSeconds:s.time,newRunId:next.runId,newModelSeconds:next.state.time,sceneOrigin:next.sceneOrigin,resources:next.state.ecology.resources,observerUnchanged:true,previousStateUnchanged:true,journalBytesUnchanged:true,storageWrites:writes});
 }
});

check('N01 remote sites, missing sites and reused current run IDs cannot reset a context',()=>{
 const s=world();advance(s,240);
 for(const site of COASTAL_STATIONS){assert.throws(()=>localObservationContext(s,{x:site.x+8.01,z:site.z},{runId:'old',newRunId:'new',siteId:site.id}),/erreichten Küstenort/);assert.equal(localObservationContext(s,{x:site.x,z:site.z},{runId:'old',newRunId:'new',siteId:site.id}).state.time,0);}
 for(const newRunId of ['old','',null])assert.throws(()=>localObservationContext(s,{x:63,z:-12},{runId:'old',newRunId,siteId:'coast'}),/eigenen Rundgangkontext/);
 for(const observer of [{x:NaN,z:-12},{x:63,z:Infinity}])assert.throws(()=>localObservationContext(s,observer,{runId:'old',newRunId:'new',siteId:'coast'}));
 assert.throws(()=>localObservationContext(s,{x:63,z:-12},{runId:'old',newRunId:'new',siteId:'unknown'}));
});

function mixedBook(){
 const prior=world(),oldLow=protocol(prior,'old-low','prior-run');advance(prior,240-prior.time);
 const next=localObservationContext(prior,{x:63,z:-12},{runId:'prior-run',newRunId:'local-run',siteId:'coast'}),low=protocol(next.state,'new-low',next.runId,next.sceneOrigin);advance(next.state,60-next.state.time);const high=protocol(next.state,'new-high',next.runId,next.sceneOrigin),d=book();
 d.records=[record(prior,prior.plants[0],'old-note','prior-run'),record(next.state,next.state.plants[1],'new-note',next.runId,next.sceneOrigin)];
 d.learning.protocols=[oldLow,low,high];d.learning.answers.K3={lowId:low.id,highId:high.id,filtration:'covered',access:'exposed',absence:'not-detected',depth:'different-space',reasoning:'Im kontrollierten Modell betrifft der Vergleich dasselbe Tier und denselben neuen Rundgang.'};
 return {d,oldLow,low,high};
}
check('N01 old provenance-free evidence and explicit new contexts roundtrip without losing notes or K3 validity',()=>{
 const {d,low,high}=mixedBook(),parsed=parseCompact(JSON.stringify(d));assert.deepEqual(parsed,d);assert.equal(evaluateCoast(low,high).complete,true);assert.equal(assessMission('K3',parsed).complete,true);
 assert.equal(Object.hasOwn(parsed.records[0],'sceneOrigin'),false);assert.deepEqual(parsed.records[1].sceneOrigin,d.records[1].sceneOrigin);
 const old=book();old.records=[d.records[0]];old.learning.protocols=[d.learning.protocols[0]];assert.deepEqual(parseCompact(JSON.stringify(old)),old);
});

check('N01 K3 cannot cross a local context reset even when concrete individual IDs are identical',()=>{
 const {d,oldLow,low,high}=mixedBook();assert.equal(oldLow.individualId,high.individualId);assert.equal(oldLow.initialSeed,high.initialSeed);
 assert.equal(evaluateCoast(oldLow,high).complete,false);d.learning.answers.K3.lowId=oldLow.id;assert.equal(assessMission('K3',parseCompact(JSON.stringify(d))).complete,false);
 assert.equal(evaluateCoast(low,{...high,sceneOrigin:undefined}).complete,false);
 assert.equal(evaluateCoast(low,{...high,sceneOrigin:{...high.sceneOrigin,previousSimulationTime:1200}}).complete,false);
});

check('N01 contradictory own-run, site, backwards-time, missing-origin and cyclic imports are rejected',()=>{
 const mutations=[
  ['own-run origin',d=>{for(const r of [...d.records,...d.learning.protocols])if(r.runId==='local-run')r.sceneOrigin.previousRunId='local-run';}],
  ['wrong origin location',d=>{for(const r of [...d.records,...d.learning.protocols])if(r.runId==='local-run')r.sceneOrigin.x=-60;}],
  ['backward previous time',d=>{for(const r of [...d.records,...d.learning.protocols])if(r.runId==='local-run')r.sceneOrigin.previousSimulationTime=239;}],
  ['missing origin in established run',d=>{delete d.records[1].sceneOrigin;}],
  ['cyclic origins',d=>{for(const r of [...d.records,...d.learning.protocols])if(r.runId==='prior-run')r.sceneOrigin={kind:'local-observation-window',previousRunId:'local-run',previousSimulationTime:1200,siteId:'coast',x:63,z:-12,startSimulationTime:0};}],
  ['nonzero local start',d=>{for(const r of [...d.records,...d.learning.protocols])if(r.runId==='local-run')r.sceneOrigin.startSimulationTime=1;}],
  ['different prior seed',d=>{for(const r of [...d.records,...d.learning.protocols])if(r.runId==='local-run')r.initialSeed++;}],
 ];
 for(const [name,mutate]of mutations){const {d}=mixedBook();mutate(d);assert.throws(()=>parseCompact(JSON.stringify(d)));importCases.push({name,rejected:true});}
});
save();console.log(JSON.stringify({suite:'compact-observation-context',passed:checks.length,scenarios:scenarios.length,negativeImports:importCases.length}));
