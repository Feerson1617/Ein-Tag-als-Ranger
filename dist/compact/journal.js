import { MANIFEST, STORAGE_KEY, WORLD_VERSION } from './manifest.js';
import { stationProtocolsIssue,evaluateStationComparison } from '../station-protocol.js';
import { validateLearning,emptyLearning } from './missions.js';
import { observationIssue } from './observation-schema.js';
import { identityInventory,eventIssue,eventCopiesIssue } from './evidence.js';
import { validateSceneContexts } from './observation-context.js';
const OLD_KEY='ranger-compact-fieldbook-v1',OLD_VERSION='ranger-compact-reference-v1';
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
function inspect(v,depth=0){if(depth>18)throw Error('Datei zu stark verschachtelt.');if(typeof v==='string'&&v.length>20000)throw Error('Textfeld zu lang.');if(Array.isArray(v)){if(v.length>10000)throw Error('Zu viele Datensätze.');v.forEach(x=>inspect(x,depth+1));}else if(object(v))for(const [k,x]of Object.entries(v)){if(['__proto__','prototype','constructor'].includes(k))throw Error('Unzulässiger Datenschlüssel.');inspect(x,depth+1);}}
function read(text){if(typeof text!=='string'||text.length>5*1024*1024)throw Error('Datei zu groß (maximal 5 MB).');const data=JSON.parse(text);inspect(data);return data;}
function recordsValid(records,version){if(!Array.isArray(records))throw Error('Belege fehlen.');const ids=new Set();for(const r of records){if(!object(r)||typeof r.id!=='string'||!r.id||ids.has(r.id)||!MANIFEST.activeTaxa.includes(r.taxon)||typeof r.individualId!=='string'||!r.individualId||r.worldVersion!==version||!Number.isSafeInteger(r.initialSeed)||r.initialSeed<0||r.initialSeed>4294967295||typeof r.runId!=='string'||!r.runId||r.source!=='own-observation'||!Number.isFinite(r.observationSeconds)||r.observationSeconds<2.5||!Number.isFinite(r.simulationTime)||r.simulationTime<0||!Number.isFinite(r.x)||!Number.isFinite(r.z)||typeof r.note!=='string')throw Error('Ungültiger Kompakt-Beleg.');ids.add(r.id);
 if(r.events!==undefined){if(!Array.isArray(r.events))throw Error('Ungültige Ereignisse.');const eventIds=new Set();for(const e of r.events){if(!object(e)||typeof e.id!=='string'||eventIds.has(e.id)||e.source!=='model-event'||e.window!==(r.window||'summer')||!Array.isArray(e.actors)||!e.actors.includes(r.individualId)||typeof e.resourceId!=='string'||typeof e.interaction!=='string'||typeof e.outcome!=='string'||!Number.isFinite(e.startedAt)||!Number.isFinite(e.endedAt)||e.startedAt<0||e.endedAt<e.startedAt||e.endedAt>r.simulationTime+1e-8||e.before!==null&&(!Number.isFinite(e.before)||e.before<0)||e.after!==null&&(!Number.isFinite(e.after)||e.after<0))throw Error('Widersprüchlicher Vorgangsbeleg.');eventIds.add(e.id);}}
 if(version===WORLD_VERSION){const spatialIssue=observationIssue(r);if(spatialIssue)throw Error(spatialIssue);const individual=identityInventory(r.initialSeed,r.modelRevision??1).individuals.get(r.individualId);if(!individual||individual.taxon!==r.taxon)throw Error('Individuen-ID und Taxon passen nicht zur gespeicherten Modellwelt.');for(const event of r.events||[]){const issue=eventIssue(r,event);if(issue)throw Error(issue);}}
 }const issue=eventCopiesIssue(records);if(issue)throw Error(issue);return records;}
function validatePrevious(d){if(!object(d)||d.schemaVersion!==1||d.worldVersion!==OLD_VERSION||!Array.isArray(d.archives))throw Error('Unbekannte frühere Kompaktfassung.');recordsValid(d.records,OLD_VERSION);d.archives.forEach(validateArchive);return d;}
export function parseCompact(text){const d=read(text);
 if(d?.worldVersion===OLD_VERSION){validatePrevious(d);return {schemaVersion:2,worldVersion:WORLD_VERSION,records:[],archives:[],previousEditions:[d],learning:emptyLearning()};}
 if(!object(d)||![1,2].includes(d.schemaVersion)||d.worldVersion!==WORLD_VERSION||!Array.isArray(d.archives))throw Error('Keine passende Kompakt-Feldbuchdatei.');
 recordsValid(d.records,WORLD_VERSION);d.archives.forEach(validateArchive);const previous=d.previousEditions||[];if(!Array.isArray(previous))throw Error('Frühere Fassungen fehlen.');previous.forEach(validatePrevious);const learning=validateLearning(d.learning,d.records);
 const rows=[...d.records,...learning.protocols,...learning.measurements,...learning.samples,...learning.experiments,...(learning.perspectives||[])];for(const r of rows)if(typeof r.runId!=='string'||!r.runId||!Number.isSafeInteger(r.initialSeed)||r.worldVersion!==WORLD_VERSION)throw Error('Unvollständiger Szenenkontext.');validateSceneContexts(rows);
 return {schemaVersion:2,worldVersion:WORLD_VERSION,records:d.records,archives:d.archives,previousEditions:previous,learning};
}
function validateArchive(a){if(!object(a)||![undefined,3].includes(a.schemaVersion)||!object(a.entries)||!Array.isArray(a.interactions))throw Error('Unbekanntes Altfeldbuch.');for(const e of Object.values(a.entries))if(!object(e)||!Number.isFinite(e.found)||!Array.isArray(e.behaviors)||e.behaviors.some(x=>typeof x!=='string'))throw Error('Ungültiger Archivfund.');if(a.learning!==undefined&&(!object(a.learning)||!Array.isArray(a.learning.observations)||!object(a.learning.missions)))throw Error('Ungültiger historischer Missionsstand.');const issue=stationProtocolsIssue(a.learning?.observations||[]);if(issue)throw Error(issue);return a;}
export function parseArchive(text){return validateArchive(read(text));}
// Only form fields are repaired; invalid observations/protocols are never silently
// accepted or discarded. The original stored bytes survive until explicit recovery.
export function repairTaskState(text){
 const original=read(text);if(original?.worldVersion!==WORLD_VERSION||!object(original.learning))return null;
 const candidate={...original,learning:{...original.learning,answers:{},drafts:{}}},removed=[];
 parseCompact(JSON.stringify(candidate));
 for(const store of ['answers','drafts'])for(const [id,a]of Object.entries(original.learning[store]||{})){
  if(!object(a)){removed.push(store+'.'+id);continue;}
  let clean={};
  for(const [field,value]of Object.entries(a)){
   const trial={...clean,[field]:value};candidate.learning[store][id]=trial;
   try{parseCompact(JSON.stringify(candidate));clean=trial;}
   catch{removed.push(store+'.'+id+'.'+field);candidate.learning[store][id]=clean;}
  }
  candidate.learning[store][id]=clean;
 }
 return removed.length?{data:parseCompact(JSON.stringify(candidate)),removed}:null;
}
export class CompactJournal{
 constructor(storage){
  this.storage=storage;this.error='';this.readBlocked=false;this.recovery=null;this.rawStored=null;
  this.data={schemaVersion:2,worldVersion:WORLD_VERSION,records:[],archives:[],previousEditions:[],learning:emptyLearning()};
  try{const text=storage?.getItem(STORAGE_KEY)||storage?.getItem(OLD_KEY);this.rawStored=text;if(text)this.data=parseCompact(text);if(!storage)this.error='Nur in dieser Sitzung: Bitte exportieren.';}
  catch{this.readBlocked=true;try{this.recovery=repairTaskState(this.rawStored);if(this.recovery)this.data=this.recovery.data;}catch{}this.error=this.recovery?'Ein gespeicherter Aufgabenentwurf enthält ungültige Felder. Gültige Beobachtungen bleiben lesbar. Im Feldbuch kannst du Originaldaten sichern und nur die betroffenen Entwurfsfelder bereinigen.':'Vorhandener Speicher nicht lesbar. Er bleibt unverändert. Exportiere diese Sitzung; prüfe die gespeicherte Datei vor einem Ersatz.';}
 }
 recover(){
  if(!this.recovery||!this.storage)throw Error('Keine sichere Entwurfswiederherstellung verfügbar.');
  const valid=parseCompact(JSON.stringify(this.recovery.data));
  try{this.storage.setItem(STORAGE_KEY+'-recovery-original',this.rawStored);this.storage.setItem(STORAGE_KEY,JSON.stringify(valid));}
  catch{this.error='Bereinigung nicht gespeichert. Der bisherige Stand bleibt erhalten. Sichere Original und bereinigtes Feldbuch als Dateien.';throw Error(this.error);}
  this.data=valid;this.recovery=null;this.readBlocked=false;this.error='';
 }
 replace(data){const valid=parseCompact(JSON.stringify(data));if(this.readBlocked)throw Error(this.error);if(this.storage){try{this.storage.setItem(STORAGE_KEY,JSON.stringify(valid));}catch{this.error='Speichern nicht möglich. Der bisherige Stand bleibt erhalten. Bitte exportieren.';throw Error(this.error);}}this.data=valid;this.error=this.storage?'':'Nur in dieser Sitzung: Bitte exportieren.';}
 add(record){this.replace({...this.data,records:[...this.data.records,record]});}
 updateLearning(changes){this.replace({...this.data,learning:{...this.data.learning,...changes}});}
 answer(id,answer){this.updateLearning({answers:{...this.data.learning.answers,[id]:answer}});}
 archive(data){this.replace({...this.data,archives:[...this.data.archives,validateArchive(data)]});}
 export(){return JSON.stringify({...this.data,exportedAt:new Date().toISOString()},null,2);}
}
export function historicalM3Status(archive){const state=archive.learning?.missions?.m3;return state?evaluateStationComparison(state,archive.learning.observations):null;}
