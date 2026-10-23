import assert from 'node:assert/strict';
import fs from 'node:fs';
import {MANIFEST,WORLD_VERSION}from '../dist/compact/manifest.js';
import {createReferenceState,stepReference}from '../dist/compact/world-state.js';
import {createEcology,stepEcology}from '../dist/compact/ecology.js';
import {localObservationContext}from '../dist/compact/observation-context.js';
import {eventReference,selectedEventRows}from '../dist/compact/evidence.js';
import {observationSite}from '../dist/compact/observation-schema.js';
import {CompactJournal,parseCompact}from '../dist/compact/journal.js';
import {emptyLearning,assessMission}from '../dist/compact/missions.js';
import {createLearningUI}from '../dist/compact/learning-ui.js';

const out=process.argv[2],checks=[],collisions=[];
function save(error){if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/result.json',JSON.stringify({suite:'compact-event-reference',scope:'Real model events, journal import/export, K2 grading and HTML generation; no browser or physical-device claim.',passed:checks.length,checks,collisions,...(error?{failure:String(error.stack||error)}:{})},null,2)+'\n');}}
function check(name,fn){try{fn();checks.push(name);save();console.log('PASS '+name);}catch(error){save(error);throw error;}}
const advance=(s,seconds,observer)=>{const end=s.time+seconds;while(s.time<end-1e-8){const dt=Math.min(.1,end-s.time);stepReference(s,dt,observer);stepEcology(s,dt,observer);}};
const record=(s,event,id,runId,sceneOrigin)=>{const actor=s.ecology.actors.find(a=>a.id===event.actors[0]);assert.ok(actor);return {id,taxon:actor.taxon,individualId:actor.id,worldVersion:WORLD_VERSION,initialSeed:s.initialSeed,modelRevision:s.modelRevision,window:s.ecology.window,runId,...(sceneOrigin?{sceneOrigin}:{}),source:'own-observation',observationSeconds:3,simulationTime:s.time,x:actor.x,z:actor.z,siteId:observationSite(actor.x),method:'magnified-active-model',note:'Gesicherter Modellvorgang; keine Naturmessung.',events:[structuredClone(event)]};};
function twoRuns({seconds=10,oldObserver={x:63,z:-12},oldCase='bee-clover',newCase=oldCase}={}){
 const old=createReferenceState(MANIFEST.initialSeed);createEcology(old);advance(old,seconds,oldObserver);
 const next=localObservationContext(old,{x:63,z:-12},{runId:'prior-run',newRunId:'local-run',siteId:'coast'});advance(next.state,seconds,{x:63,z:-12});
 const oldEvent=old.ecology.events.find(e=>e.interaction===oldCase),newEvent=next.state.ecology.events.find(e=>e.interaction===newCase&&e.id===oldEvent?.id);
 assert.ok(oldEvent&&newEvent,'Real model events must reproduce a repeated local event ID');assert.equal(oldEvent.id,newEvent.id);
 const records=[record(old,oldEvent,'old-record','prior-run'),record(next.state,newEvent,'new-record','local-run',next.sceneOrigin)];
 const data={schemaVersion:2,worldVersion:WORLD_VERSION,records,archives:[],previousEditions:[],learning:emptyLearning()};
 assert.deepEqual(parseCompact(JSON.stringify(data)),data);
 collisions.push({id:oldEvent.id,oldCase,newCase,records:records.map(r=>({id:r.id,runId:r.runId,simulationTime:r.simulationTime,sceneOrigin:r.sceneOrigin}))});
 return {data,state:next.state,oldEvent,newEvent,refs:records.map(r=>eventReference(r,r.events[0]))};
}
const answer=(caseId,eventIds)=>({caseId,eventIds,claim:'event-with-resource',alternative:caseId==='bee-clover'?'no-seed-guarantee':caseId==='worm-litter'?'not-full-mineralization':'no-population-inference',reasoning:'Die konkrete Ressource und das dokumentierte Ereignis begrenzen diese Aussage.'});

check('two real same-named events in different contexts remain independently selectable and roundtrip intact',()=>{
 const {data,refs}=twoRuns(),originalRecords=structuredClone(data.records);assert.notEqual(refs[0],refs[1]);
 for(let i=0;i<2;i++){const rows=selectedEventRows(data.records,[refs[i]]);assert.equal(rows.length,1);assert.equal(rows[0].record.id,data.records[i].id);}
 data.learning.answers.K2=answer('bee-clover',refs);const parsed=parseCompact(JSON.stringify(data));assert.deepEqual(parsed,data);assert.deepEqual(parsed.records,originalRecords);assert.equal(assessMission('K2',parsed).complete,true);
});

check('a same-ID event from a different run cannot silently satisfy the selected K2 case',()=>{
 const {data,refs,oldEvent,newEvent}=twoRuns({seconds:30,oldObserver:{x:-59,z:3},oldCase:'tick-deer',newCase:'worm-litter'});
 assert.notEqual(oldEvent.interaction,newEvent.interaction);
 data.learning.answers.K2=answer('worm-litter',[refs[0]]);assert.equal(assessMission('K2',parseCompact(JSON.stringify(data))).complete,false);
 data.learning.answers.K2=answer('worm-litter',[refs[1]]);assert.equal(assessMission('K2',parseCompact(JSON.stringify(data))).complete,true);
});

check('duplicate references, legacy aliases and missing containing records are rejected in answers and drafts',()=>{
 const {data,refs,oldEvent}=twoRuns();
 const invalid=[[refs[0],refs[0]],[oldEvent.id,oldEvent.id],[oldEvent.id,refs[0]],[eventReference({id:'missing-record'},oldEvent)],[eventReference(data.records[0],{id:'missing-event'})]];
 for(const collection of ['answers','drafts'])for(const eventIds of invalid){const candidate=structuredClone(data);candidate.learning[collection].K2=answer('bee-clover',eventIds);assert.throws(()=>parseCompact(JSON.stringify(candidate)),/Antwortauswahl|Vorgangsbezug|Aufgabenbezug/);}
});

check('legacy event-ID answers retain their original data through journal export and import',()=>{
 const {data,oldEvent}=twoRuns();data.learning.answers.K2=answer('bee-clover',[oldEvent.id]);data.learning.drafts.K2=structuredClone(data.learning.answers.K2);
 const journal=new CompactJournal(null);journal.replace(data);assert.deepEqual(parseCompact(journal.export()),data);assert.equal(assessMission('K2',journal.data).complete,true);
 assert.equal(journal.data.learning.answers.K2.eventIds[0],oldEvent.id);assert.equal(selectedEventRows(journal.data.records,[oldEvent.id]).length,2);
 const legacy=parseCompact(fs.readFileSync(new URL('../verification/kompakt-v2/learning/earned-all-families.json',import.meta.url),'utf8'));
 const before=Object.fromEntries(['K1','K2','K3','K4','K5'].map(id=>[id,assessMission(id,legacy)]));journal.replace(legacy);assert.deepEqual(parseCompact(journal.export()),legacy);for(const id of Object.keys(before))assert.deepEqual(assessMission(id,journal.data),before[id],id);
});

check('opening an old K2 answer preselects distinct qualified checkboxes with concrete provenance without changing storage',()=>{
 const {data,state,oldEvent,refs}=twoRuns();data.learning.answers.K2=answer('bee-clover',[oldEvent.id]);const original=structuredClone(data),nodes=new Map(),priorDocument=globalThis.document;let html='';
 const escape=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
 try{
  globalThis.document={getElementById:id=>{if(!nodes.has(id))nodes.set(id,{dataset:{},querySelectorAll:()=>[]});return nodes.get(id);}};
  createLearningUI({journal:{data},state,observer:{x:63,z:-12},panel:value=>html=value,escape,context:()=>({runId:'local-run'}),close(){},toast(){},download(){}}).task('K2');
  const inputs=[...html.matchAll(/<input type="checkbox" name="event-ids" value="([^"]+)"([^>]*)>/g)];assert.equal(inputs.length,2);
  for(let i=0;i<2;i++){assert.equal(inputs[i][1],escape(refs[i]));assert.match(inputs[i][2],/checked/);const r=data.records[i];assert.ok(html.includes('Rundgang '+r.runId));assert.ok(html.includes('Modellzeit '+r.simulationTime.toFixed(1)+' s'));assert.ok(html.includes('Beleg '+r.id));}
  assert.deepEqual(data,original);
 }finally{if(priorDocument===undefined)delete globalThis.document;else globalThis.document=priorDocument;}
});
save();console.log(JSON.stringify({suite:'compact-event-reference',passed:checks.length}));
