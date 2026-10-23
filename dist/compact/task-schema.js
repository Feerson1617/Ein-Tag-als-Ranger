import { DETERMINATION_CHOICES,OBSERVABLE_FEATURES } from './determination.js';
import { KEY_OPTIONS } from './catalog.js';
import { FOOD_EDGES } from './learning-models.js';
import { eventReference,selectedEventRows } from './evidence.js';

const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const features=['spatulate-tip',...OBSERVABLE_FEATURES,...new Set(Object.values(KEY_OPTIONS).flatMap(k=>[...k.correct,...k.wrong]))];
const choices=[...DETERMINATION_CHOICES.map(([id])=>id),...Object.keys(KEY_OPTIONS),...Object.values(KEY_OPTIONS).flatMap(k=>k.groups),'uncertain'];
const limits=[...new Set(Object.values(KEY_OPTIONS).flatMap(k=>k.limits))];
const criteria=['access','disturbance','cost','coastal-safety'];
const enums={
 choice:choices,limit:limits,experimentTide:['exposed','covered'],
 caseId:['fox-mouse','ladybird-aphid','shell-competition','same-species-competition','tick-deer','bee-clover','deer-browse','caterpillar-nettle','worm-litter','jay-acorn','cockle-filtration','snail-grazing'],
 claim:['resource-limits-yield','event-with-resource','presence-proves'],
 filtration:['covered','always'],access:['exposed','covered'],absence:['not-detected','extinct'],depth:['different-space','irrelevant'],
 energy:['heat-not-cycle','energy-cycle'],mineralization:['microbes-not-worm-alone','worm-alone'],
 option:['reroute','seasonal-rest','raised-boardwalk'],uncertainty:['seasonal-transfer','limited-model','cost-uncertain'],factValue:['facts-and-values-separated','facts-decide']
};
const alternatives={K2:['tide-controlled','resource-controlled','no-population-inference','no-seed-guarantee','not-full-mineralization','everything-proven'],K5:enums.option};
function string(value,path,allowed){if(typeof value!=='string'||allowed&&value!==''&&!allowed.includes(value))throw Error('Ungültige Aufgabenauswahl: '+path+'.');}
function list(value,path,allowed){if(!Array.isArray(value)||new Set(value).size!==value.length||value.some(x=>typeof x!=='string'||allowed&&!allowed.includes(x)))throw Error('Ungültige Antwortauswahl: '+path+'.');}
function reference(value,rows,path){string(value,path);if(value&&!rows.some(r=>r.id===value))throw Error('Aufgabenbezug fehlt: '+path+'.');}
// Wrong-but-selectable student answers remain valid data. This is a shape and
// consistency boundary, not a correctness grader or an authenticity guarantee.
export function validateTaskCollection(collection,learning,records){
 for(const [mission,a]of Object.entries(collection)){
  if(!['K1','K2','K3','K4','K5'].includes(mission)||!object(a))throw Error('Ungültige Aufgabenantwort.');
  for(const [key,allowed]of Object.entries(enums))if(a[key]!==undefined)string(a[key],mission+'.'+key,allowed);
  for(const key of ['reasoning','evidenceMeaning','fact','value','norm','consequence','transferReasoning'])if(a[key]!==undefined)string(a[key],mission+'.'+key);
  if(a.alternative!==undefined)string(a.alternative,mission+'.alternative',alternatives[mission]);
  if(a.features!==undefined)list(a.features,mission+'.features',features);
  if(a.criteria!==undefined)list(a.criteria,mission+'.criteria',criteria);
  for(const [key,rows]of [['recordId',records],['controlId',learning.experiments],['competitorId',learning.experiments],['lowId',learning.protocols],['highId',learning.protocols]])if(a[key]!==undefined)reference(a[key],rows,mission+'.'+key);
  if(a.evidenceIds!==undefined){list(a.evidenceIds,mission+'.evidenceIds');for(const id of a.evidenceIds)reference(id,records,mission+'.evidenceIds');}
  if(a.eventIds!==undefined){
   list(a.eventIds,mission+'.eventIds');const selected=new Set();
   for(const id of a.eventIds){const rows=selectedEventRows(records,[id]);if(!rows.length)throw Error('Aufgabenbezug fehlt: '+mission+'.eventIds.');for(const {record,event}of rows){const key=eventReference(record,event);if(selected.has(key))throw Error('Doppelter Vorgangsbezug: '+mission+'.eventIds.');selected.add(key);}}
  }
  if(a.determinations!==undefined){
   if(!Array.isArray(a.determinations))throw Error('Ungültige Bestimmungsantwort.');
   for(const d of a.determinations){if(!object(d))throw Error('Ungültige Bestimmungsantwort.');for(const key of ['recordId','choice','limit'])if(d[key]!==undefined)string(d[key],'Bestimmungsantwort.'+key,key==='choice'?choices:key==='limit'?limits:null);if(d.recordId)reference(d.recordId,records,'Bestimmungsantwort.recordId');if(d.features!==undefined)list(d.features,'Bestimmungsantwort.features',features);}
  }
  if(a.edges!==undefined&&(!Array.isArray(a.edges)||a.edges.some(edge=>!Array.isArray(edge)||edge.length!==2||edge.some(x=>typeof x!=='string')||!FOOD_EDGES.some(([x,y])=>edge[0]===x&&edge[1]===y))))throw Error('Ungültige Stoffverbindung.');
  if(a.weights!==undefined&&(!object(a.weights)||Object.entries(a.weights).some(([k,v])=>!criteria.includes(k)||!Number.isFinite(v)||v<0||v>10)))throw Error('Ungültige Kriteriengewichtung.');
  if(a.evidenceLinks!==undefined){if(!Array.isArray(a.evidenceLinks))throw Error('Ungültiger Belegbezug.');for(const link of a.evidenceLinks){if(!object(link)||typeof link.criterion!=='string'||link.criterion!==''&&!criteria.includes(link.criterion)||typeof link.meaning!=='string')throw Error('Ungültiger Belegbezug.');reference(link.recordId,records,'Belegbezug.recordId');}}
 }
}
