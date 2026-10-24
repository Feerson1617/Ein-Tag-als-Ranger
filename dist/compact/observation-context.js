import { createReferenceState } from './world-state.js';
import { createEcology } from './ecology.js';

export const COASTAL_STATIONS=Object.freeze([
 {id:'coast',x:63,z:-12},{id:'mussels',x:61,z:-14},
 {id:'outlook',x:63,z:4},{id:'creek-east',x:73,z:2}
]);
const validRun=id=>typeof id==='string'&&id.length>0&&id.length<=200;
// Live-only witness, never an imported authenticity assertion. A visible bird
// body or a freestanding model lens alone cannot prove its feeding contact.
export function witnessedFeeding(event,{runId,individualId,time,contact,visibleNow}){
 return !!(contact&&visibleNow&&['shore-feeding','shell-competition'].includes(event.interaction)&&
  contact.runId===runId&&contact.eventId===event.id&&
  contact.individualId===individualId&&event.actors[0]===individualId&&
  contact.preyId===event.actors[1]&&Number.isFinite(contact.time)&&
  contact.time>=event.contactAt-1e-8&&contact.time<=event.endedAt+1e-8&&
  Number.isFinite(time)&&time>=event.endedAt-1e-8&&time-event.endedAt<=.1);
}
// An explicitly requested new model run at the visitor's actual location.
// No event, observation time, journal entry or previous resource is transferred.
export function localObservationContext(state,observer,{runId,newRunId,siteId}){
 const site=COASTAL_STATIONS.find(s=>s.id===siteId);
 if(!site||!Number.isFinite(observer.x)||!Number.isFinite(observer.z)||Math.hypot(observer.x-site.x,observer.z-site.z)>8)throw Error('Ein neues Beobachtungsfenster beginnt nur am erreichten Küstenort.');
 if(!validRun(runId)||!validRun(newRunId)||runId===newRunId||!Number.isFinite(state.time)||state.time<0)throw Error('Ein neues Beobachtungsfenster braucht einen eigenen Rundgangkontext.');
 const next=createReferenceState(state.initialSeed,state.modelRevision);createEcology(next,state.ecology.window);
 const sceneOrigin={kind:'local-observation-window',previousRunId:runId,previousSimulationTime:state.time,siteId,x:observer.x,z:observer.z,startSimulationTime:0};
 return {state:next,runId:newRunId,sceneOrigin};
}
export function originIssue(row){
 const o=row.sceneOrigin;if(o===undefined)return null;
 if(!o||typeof o!=='object'||Array.isArray(o)||Object.keys(o).sort().join(',')!=='kind,previousRunId,previousSimulationTime,siteId,startSimulationTime,x,z')return 'Unvollständige Herkunft des neuen Beobachtungsfensters.';
 const site=COASTAL_STATIONS.find(s=>s.id===o.siteId);
 if(o.kind!=='local-observation-window'||!validRun(o.previousRunId)||o.previousRunId===row.runId||!Number.isFinite(o.previousSimulationTime)||o.previousSimulationTime<0||o.previousSimulationTime>1e8||o.startSimulationTime!==0||!site||!Number.isFinite(o.x)||!Number.isFinite(o.z)||Math.hypot(o.x-site.x,o.z-site.z)>8)return 'Widersprüchliche Herkunft des neuen Beobachtungsfensters.';
 return null;
}
export const originKey=row=>row.sceneOrigin?JSON.stringify(['local-observation-window',row.sceneOrigin.previousRunId,row.sceneOrigin.previousSimulationTime,row.sceneOrigin.siteId,row.sceneOrigin.x,row.sceneOrigin.z,row.sceneOrigin.startSimulationTime]):null;
export const sceneContextKey=row=>JSON.stringify([row.initialSeed,row.worldVersion,row.window||'summer',row.modelRevision??1,originKey(row)]);
export function validateSceneContexts(rows){
 const runs=new Map();
 for(const row of rows){const issue=originIssue(row);if(issue)throw Error(issue);const key=sceneContextKey(row),seen=runs.get(row.runId);if(seen&&seen.key!==key)throw Error('Widersprüchlicher Szenenkontext im selben Rundgang.');runs.set(row.runId,{key,row,time:Math.max(seen?.time||0,row.simulationTime||0)});}
 for(const {row}of runs.values()){
  const o=row.sceneOrigin;if(!o)continue;const previous=runs.get(o.previousRunId);
  if(previous&&(previous.time>o.previousSimulationTime+1e-8||['initialSeed','worldVersion','window','modelRevision'].some(k=>(previous.row[k]??(k==='window'?'summer':k==='modelRevision'?1:undefined))!==(row[k]??(k==='window'?'summer':k==='modelRevision'?1:undefined)))))throw Error('Das neue Beobachtungsfenster widerspricht dem vorherigen Rundgang.');
  const visited=new Set([row.runId]);let next=o.previousRunId;while(runs.has(next)){if(visited.has(next))throw Error('Zyklische Rundgangherkunft.');visited.add(next);next=runs.get(next).row.sceneOrigin?.previousRunId;}
 }
}
