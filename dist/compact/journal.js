import { MANIFEST, STORAGE_KEY, WORLD_VERSION } from './manifest.js';
import { stationProtocolsIssue,evaluateStationComparison } from '../station-protocol.js';
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
function inspect(v,depth=0){if(depth>18)throw Error('Datei zu stark verschachtelt.');if(typeof v==='string'&&v.length>20000)throw Error('Textfeld zu lang.');if(Array.isArray(v)){if(v.length>10000)throw Error('Zu viele Datensätze.');v.forEach(x=>inspect(x,depth+1));}else if(object(v))for(const [k,x]of Object.entries(v)){if(['__proto__','prototype','constructor'].includes(k))throw Error('Unzulässiger Datenschlüssel.');inspect(x,depth+1);}}
function read(text){if(typeof text!=='string'||text.length>5*1024*1024)throw Error('Datei zu groß (maximal 5 MB).');const data=JSON.parse(text);inspect(data);return data;}
export function parseCompact(text){const d=read(text);
 if(!object(d)||d.schemaVersion!==1||d.worldVersion!==WORLD_VERSION||!Array.isArray(d.records)||!Array.isArray(d.archives))throw Error('Keine passende Kompakt-Feldbuchdatei.');
 const ids=new Set();for(const r of d.records){if(!object(r)||typeof r.id!=='string'||ids.has(r.id)||!MANIFEST.activeTaxa.includes(r.taxon)||typeof r.individualId!=='string'||!r.individualId||r.worldVersion!==WORLD_VERSION||!Number.isSafeInteger(r.initialSeed)||typeof r.runId!=='string'||!r.runId||r.source!=='own-observation'||!Number.isFinite(r.observationSeconds)||r.observationSeconds<2.5||!Number.isFinite(r.simulationTime)||r.simulationTime<0||!Number.isFinite(r.x)||!Number.isFinite(r.z)||typeof r.note!=='string')throw Error('Ungültiger Kompakt-Beleg.');ids.add(r.id);}
 for(const a of d.archives)validateArchive(a);
 return {schemaVersion:1,worldVersion:WORLD_VERSION,records:d.records,archives:d.archives};
}
function validateArchive(a){if(!object(a)||![undefined,3].includes(a.schemaVersion)||!object(a.entries)||!Array.isArray(a.interactions))throw Error('Unbekanntes Altfeldbuch.');for(const e of Object.values(a.entries))if(!object(e)||!Number.isFinite(e.found)||!Array.isArray(e.behaviors)||e.behaviors.some(x=>typeof x!=='string'))throw Error('Ungültiger Archivfund.');if(a.learning!==undefined&&(!object(a.learning)||!Array.isArray(a.learning.observations)||!object(a.learning.missions)))throw Error('Ungültiger historischer Missionsstand.');const issue=stationProtocolsIssue(a.learning?.observations||[]);if(issue)throw Error(issue);return a;}
// Historical material is an opaque archive, never a source of new mission credit.
// Original IDs, out-of-core taxa and answers survive byte-equivalent JSON export.
export function parseArchive(text){return validateArchive(read(text));}
export class CompactJournal{
 constructor(storage){this.storage=storage;this.error='';this.readBlocked=false;this.data={schemaVersion:1,worldVersion:WORLD_VERSION,records:[],archives:[]};try{const text=storage?.getItem(STORAGE_KEY);if(text)this.data=parseCompact(text);if(!storage)this.error='Nur in dieser Sitzung: Bitte exportieren.';}catch{this.readBlocked=true;this.error='Vorhandener Speicher nicht lesbar. Er bleibt unverändert. Exportiere diese Sitzung; prüfe die gespeicherte Datei vor einem Ersatz.';}}
 replace(data){const valid=parseCompact(JSON.stringify(data));if(this.readBlocked)throw Error(this.error);if(this.storage){try{this.storage.setItem(STORAGE_KEY,JSON.stringify(valid));}catch{this.error='Speichern nicht möglich. Der bisherige Stand bleibt erhalten. Bitte exportieren.';throw Error(this.error);}}this.data=valid;this.error=this.storage?'':'Nur in dieser Sitzung: Bitte exportieren.';}
 add(record){this.replace({...this.data,records:[...this.data.records,record]});}
 archive(data){this.replace({...this.data,archives:[...this.data.archives,validateArchive(data)]});}
 export(){return JSON.stringify({...this.data,exportedAt:new Date().toISOString()},null,2);}
}

export function historicalM3Status(archive){const state=archive.learning?.missions?.m3;return state?evaluateStationComparison(state,archive.learning.observations):null;}
