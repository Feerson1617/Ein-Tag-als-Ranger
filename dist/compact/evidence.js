import { createReferenceState } from './world-state.js';
import { createEcology } from './ecology.js';
import { sceneContextKey } from './observation-context.js';
const inventories=new Map();
// Event counters restart with each model run. New task answers identify the
// containing journal record as well; legacy event IDs still resolve on import.
export const eventReference=(record,event)=>JSON.stringify(['record-event-v1',record.id,event.id]);
function qualifiedEventReference(value){
 if(typeof value!=='string'||!value.startsWith('["record-event-v1",'))return false;
 try{const parts=JSON.parse(value);return Array.isArray(parts)&&parts.length===3&&parts[0]==='record-event-v1'&&parts.slice(1).every(x=>typeof x==='string'&&x.length>0)&&JSON.stringify(parts)===value;}catch{return false;}
}
export function eventReferenceCandidates(records,references=[]){
 const qualified=new Set(),legacy=new Set();
 for(const reference of references)(qualifiedEventReference(reference)?qualified:legacy).add(reference);
 return records.flatMap(record=>(record.events||[]).filter(event=>qualified.has(eventReference(record,event))||legacy.has(event.id)).map(event=>({record,event})));
}
// Copies in different notes may refer to one actual event. Its local counter
// is scoped by the run and complete scene, and its immutable payload must agree.
// JSON object key order is immaterial; array order and all values are not.
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
export function conflictingEventReferences(records){
 const seen=new Map(),conflicts=new Set();
 for(const record of records)for(const event of record.events||[]){
  const key=JSON.stringify([record.runId,event.id]),signature=JSON.stringify([sceneContextKey(record),canonical(event)]);
  if(seen.has(key)&&seen.get(key)!==signature)conflicts.add(key);
  else seen.set(key,signature);
 }
 return conflicts;
}
export function eventCopiesIssue(records){
 return conflictingEventReferences(records).size?'Widersprüchliche Kopien desselben Modellereignisses im selben Rundgang. Originaldatei bewahren und die Ereignisbelege prüfen.':null;
}
// Old answers identify an event, not its containing record. Multiple saved
// copies of that event within one run remain equivalent; another run is a
// different event even when its local counter and interaction happen to match.
export function ambiguousEventReferences(records,references=[]){
 const legacy=new Set(references.filter(reference=>!qualifiedEventReference(reference))),runs=new Map();
 for(const record of records)for(const event of record.events||[])if(legacy.has(event.id)){const scopes=runs.get(event.id)||new Set();scopes.add(record.runId);runs.set(event.id,scopes);}
 return [...legacy].filter(reference=>(runs.get(reference)?.size||0)>1);
}
export function selectedEventRows(records,references=[]){
 const ambiguous=new Set(ambiguousEventReferences(records,references));
 const conflicts=conflictingEventReferences(records);
 return eventReferenceCandidates(records,references.filter(reference=>!ambiguous.has(reference))).filter(({record,event})=>!conflicts.has(JSON.stringify([record.runId,event.id])));
}
export function identityInventory(seed,modelRevision=1){const cacheKey=seed+':'+modelRevision;if(inventories.has(cacheKey))return inventories.get(cacheKey);const state=createReferenceState(seed,modelRevision);createEcology(state);const rows=[...state.plants,...state.trees.map(t=>({...t,taxon:t.type==='beech'?'fagus_sylvatica':'quercus_robur'})),state.deer,state.bird,...state.ecology.actors],result={individuals:new Map(rows.map(r=>[r.id,r])),resources:state.ecology.resources,cloverIds:state.ecology.cloverIds,nettleId:state.ecology.nettleId};if(inventories.size>=16)inventories.delete(inventories.keys().next().value);inventories.set(cacheKey,result);return result;}
export function eventIssue(record,event){
 if(!event||event.source!=='model-event'||event.window!==(record.window||'summer')||!Array.isArray(event.actors)||!event.actors.includes(record.individualId)||new Set(event.actors).size!==event.actors.length)return 'Ereignis und Beobachtungsindividuum passen nicht zusammen.';
 const inv=identityInventory(record.initialSeed,record.modelRevision??1),a=event.actors,r=inv.resources[event.resource];
 if(event.interaction==='communication')return a.join('|')==='compact-tit-0|compact-tit-1'&&event.resourceId==='signal'&&event.window==='spring'?null:'Widersprüchlicher Kommunikationsfall.';
 if(!r||event.resourceId!==r.id||a.some(id=>!inv.individuals.has(id))||!Number.isFinite(event.before)||!Number.isFinite(event.after)||event.before>r.initial||event.before<0||event.after<0||event.after>event.before)return 'Ressource, Partner oder Mengenangabe widersprüchlich.';
 const taxon=id=>inv.individuals.get(id)?.taxon,same=(x,y)=>a.length===2&&taxon(a[0])===x&&taxon(a[1])===y,consumed=event.after===event.before-1;
 const rules={
  'bee-clover':()=>a.length===3&&a[0]==='compact-bee'&&a[1]===inv.cloverIds[0]&&a[2]===inv.cloverIds[1]&&event.resource==='clover-pollen'&&event.outcome==='pollen-transferred'&&JSON.stringify(event.sequence)===JSON.stringify(['anther-contact','pollen-carried','stigma-contact'])&&event.seedSet===false&&event.nectarRobbery===false&&consumed,
  'ladybird-aphid':()=>same('coccinella_septempunctata','aphidoidea')&&event.resource==='aphid-colony'&&event.outcome==='consumed'&&consumed,
  'caterpillar-nettle':()=>a[0]==='compact-caterpillar'&&a[1]===inv.nettleId&&event.resource==='nettle-leaf'&&event.outcome==='leaf-reduced'&&consumed,
  'deer-browse':()=>same('capreolus_capreolus','rubus_fruticosus')&&a[1]===r.id&&event.resource==='browse-shoot'&&event.outcome==='shoot-reduced'&&consumed,
  'fox-mouse':()=>same('vulpes_vulpes','apodemus_sylvaticus')&&event.resource==='wood-mice'&&event.window==='dusk'&&(event.outcome==='caught'&&consumed||event.outcome==='escaped'&&event.after===event.before),
  'tick-deer':()=>same('ixodes_ricinus','capreolus_capreolus')&&a[1]===r.id&&event.resource==='deer-host'&&event.outcome==='attached-feeding'&&event.after===event.before,
  'worm-litter':()=>a.length===1&&a[0]==='compact-earthworm'&&event.resource==='leaf-litter'&&event.outcome==='pulled-into-soil'&&event.mineralized===false&&consumed,
  'jay-acorn':()=>same('garrulus_glandarius','quercus_robur')&&event.resource==='acorns'&&event.window==='autumn'&&event.outcome==='cached'&&event.germinated===false&&consumed,
  'shell-competition':()=>a.length===2&&['haematopus_ostralegus','carcinus_maenas'].includes(taxon(a[0]))&&taxon(a[1])==='mytilus_edulis'&&event.resource==='shared-mussels'&&event.preyLength>=.02&&event.preyLength<=.04&&event.accessible===true&&consumed,
  'shore-feeding':()=>a.length===2&&consumed&&(taxon(a[0])==='platalea_leucorodia'&&taxon(a[1])==='crangon_crangon'&&event.preyLength>=.02&&event.preyLength<=.042||taxon(a[0])==='recurvirostra_avosetta'&&taxon(a[1])==='hediste_diversicolor'&&event.preyLength<=.008||taxon(a[0])==='tringa_totanus'&&taxon(a[1])==='hediste_diversicolor'&&event.preyLength<=.02),
  'cockle-filtration':()=>a.length===1&&taxon(a[0])==='cerastoderma_edule'&&event.resource==='phytoplankton'&&consumed,
  'snail-grazing':()=>a.length===1&&taxon(a[0])==='peringia_ulvae'&&event.resource==='benthic-diatoms'&&consumed
 };
 return rules[event.interaction]?.()?null:'Akteur, Ressource, Stadium oder Ereignisfolge passt nicht zum Fall.';
}
