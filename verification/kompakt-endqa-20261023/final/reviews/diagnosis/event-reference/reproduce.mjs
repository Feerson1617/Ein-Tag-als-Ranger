// In-memory reproduction only: real generated events, explicitly synthetic
// observation records. This is not acquired browser observation evidence.
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const root=path.resolve(process.argv[2]||new URL('../../../',import.meta.url).pathname),base=pathToFileURL(root+'/');
const load=name=>import(new URL('dist/compact/'+name+'.js',base));
const {MANIFEST,WORLD_VERSION}=await load('manifest');
const {createReferenceState,stepReference}=await load('world-state');
const {createEcology,stepEcology}=await load('ecology');
const {localObservationContext}=await load('observation-context');
const {observationSite}=await load('observation-schema');
const {parseCompact,CompactJournal}=await load('journal');
const {emptyLearning,assessMission}=await load('missions');
const {selectedEventRows}=await load('evidence');
const advance=(s,seconds,o)=>{for(let t=0;t<seconds-.0001;t+=.1){stepReference(s,.1,o);stepEcology(s,.1,o);}};
const record=(s,e,id,runId,sceneOrigin)=>{const a=s.ecology.actors.find(x=>x.id===e.actors[0]);return {id,taxon:a.taxon,individualId:a.id,worldVersion:WORLD_VERSION,initialSeed:s.initialSeed,modelRevision:s.modelRevision,window:s.ecology.window,runId,...(sceneOrigin?{sceneOrigin}:{}),source:'own-observation',observationSeconds:3,simulationTime:s.time,x:a.x,z:a.z,siteId:observationSite(a.x),method:'magnified-active-model',note:'QA synthetic import record; not an earned browser observation.',events:[structuredClone(e)]};};
const old=createReferenceState(MANIFEST.initialSeed);createEcology(old);advance(old,30,{x:-59,z:3});const oldEvent=old.ecology.events.find(e=>e.interaction==='tick-deer');
const data={schemaVersion:2,worldVersion:WORLD_VERSION,records:[record(old,oldEvent,'old-record','prior-run')],archives:[],previousEditions:[],learning:emptyLearning()};
data.learning.answers.K2={caseId:'worm-litter',eventIds:[oldEvent.id],claim:'event-with-resource',alternative:'not-full-mineralization',reasoning:'Gegebene Versuchserklärung'};
const journal=new CompactJournal(null);journal.replace(parseCompact(JSON.stringify(data)));const before=assessMission('K2',journal.data);const answerBefore=JSON.stringify(journal.data.learning.answers.K2);
const next=localObservationContext(old,{x:63,z:-12},{runId:'prior-run',newRunId:'local-run',siteId:'coast'});advance(next.state,30,{x:63,z:-12});const newEvent=next.state.ecology.events.find(e=>e.interaction==='worm-litter'&&e.id===oldEvent.id);journal.add(record(next.state,newEvent,'new-record',next.runId,next.sceneOrigin));
const result={scope:'In-memory model/import fixture, not real browser sighting evidence',root,before,after:assessMission('K2',journal.data),answerUnchanged:answerBefore===JSON.stringify(journal.data.learning.answers.K2),oldEvent:{id:oldEvent.id,interaction:oldEvent.interaction},newEvent:{id:newEvent.id,interaction:newEvent.interaction},selected:selectedEventRows(journal.data.records,[oldEvent.id]).map(({record,event})=>({record:record.id,runId:record.runId,interaction:event.interaction}))};
if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
