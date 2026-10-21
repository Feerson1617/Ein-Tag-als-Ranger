import { ANIMALS, PLANTS } from './biodiversity.js';
import { MISSIONS, FOCUS_TAXA, evaluateMission, freshLearning, stationProtocolsIssue } from './learning-missions.js';
export const FIELD_SCHEMA=3;
const isObject=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
function inspect(value,depth=0){
 if(depth>18)throw Error('Die Datei ist zu stark verschachtelt.');
 if(typeof value==='string'&&value.length>20000)throw Error('Ein Textfeld ist zu lang.');
 if(Array.isArray(value)){if(value.length>10000)throw Error('Zu viele Datensätze.');value.forEach(x=>inspect(x,depth+1));}
 else if(isObject(value))for(const [key,v]of Object.entries(value)){
  if(['__proto__','prototype','constructor'].includes(key))throw Error('Unzulässiger Datenschlüssel.');inspect(v,depth+1);
 }
}
export function parseFieldbook(text){
 if(typeof text!=='string'||text.length>5*1024*1024)throw Error('Feldbuchdatei zu groß (maximal 5 MB).');
 const d=JSON.parse(text);inspect(d);
 if(!isObject(d)||![undefined,FIELD_SCHEMA].includes(d.schemaVersion))throw Error('Unbekannte Feldbuchversion.');
 if(!isObject(d.entries)||!Array.isArray(d.interactions))throw Error('Einträge oder Beobachtungen fehlen.');
 for(const [id,e]of Object.entries(d.entries)){
  if(!(ANIMALS[id]||PLANTS[id])||!isObject(e)||!Number.isFinite(e.found)||!Array.isArray(e.behaviors)||e.behaviors.some(b=>typeof b!=='string'))throw Error('Ungültiger Taxoneintrag: '+id);
 }
 for(const r of d.interactions)if(!isObject(r)||!(ANIMALS[r.species]||PLANTS[r.species])||typeof r.activity!=='string'||!Number.isFinite(r.time))throw Error('Ungültige Verhaltensbeobachtung.');
 const learning=d.learning||freshLearning();
 if(!isObject(learning)||learning.version!==1||!isObject(learning.missions)||!Array.isArray(learning.observations))throw Error('Ungültige Missionsdaten.');
 const validId=id=>MISSIONS.some(m=>m.id===id);
 if(learning.activeMission!==null&&!validId(learning.activeMission))throw Error('Unbekannte aktive Mission.');
 for(const [id,s]of Object.entries(learning.missions)){
  if(!validId(id)||!isObject(s)||s.version!==1||!Array.isArray(s.determinations)||!isObject(s.answers)||typeof s.hypothesis!=='string'||typeof s.reflection!=='string')throw Error('Ungültiger Missionsstand.');
  for(const d of s.determinations)if(!isObject(d)||typeof d.recordId!=='string'||!isObject(d.answer)||!Array.isArray(d.answer.features)||d.answer.features.some(f=>typeof f!=='string'))throw Error('Ungültige Bestimmungsentscheidung.');
 }
 const recordIds=new Set();
 for(const r of learning.observations){
  if(!isObject(r)||typeof r.id!=='string'||recordIds.has(r.id)||!validId(r.missionId)||r.missionVersion!==1||!(ANIMALS[r.taxon]||PLANTS[r.taxon])||!Array.isArray(r.partnerIds)||r.partnerIds.some(p=>typeof p!=='string')||!isObject(r.scene)||typeof r.scene.habitat!=='string'||typeof r.observedFact!=='string'||!['own-observation','model-protocol','provided-knowledge','hypothesis'].includes(r.source)||!Number.isFinite(r.simulationTime)||!Number.isFinite(r.duration)||r.duration<0)throw Error('Ungültiger Missionsbeleg.');recordIds.add(r.id);
 }
 const completed=d.quests?.completed||{};
 const stationIssue=stationProtocolsIssue(learning.observations);if(stationIssue)throw Error(stationIssue);
 if(!isObject(completed))throw Error('Ungültige Auftragsdaten.');
 for(const r of Object.values(completed)){
  if(!isObject(r)||!isObject(r.encounters||{})||!isObject(r.investigations||{}))throw Error('Ungültige Fundortdaten.');
  for(const evidence of Object.values(r.investigations||{}))if(!isObject(evidence)||!isObject(evidence.evidence))throw Error('Ungültiger Untersuchungsbeleg.');
 }
 for(const [id,state]of Object.entries(learning.missions))state.complete=evaluateMission(id,state,learning.observations).complete;
 // Validate the entire file before any mutation. Old exports keep their entries.
 return {schemaVersion:FIELD_SCHEMA,entries:d.entries,interactions:d.interactions,learning,quests:{completed}};
}
export function exportFieldbook(journal,book){return {schemaVersion:FIELD_SCHEMA,title:'Mein ökologisches Feldbuch',exportedAt:new Date().toISOString(),entries:journal.entries,interactions:journal.interactions,learning:journal.learning,quests:book.export()};}
export function applyFieldbook(data,journal,book){
 const storage=journal.storage,keys=['evolutionswald-fieldjournal-v2','feldbuch-quests-v1'];let before=[];
 if(storage){
  before=keys.map(k=>storage.getItem(k));
  try{storage.setItem(keys[0],JSON.stringify({schemaVersion:FIELD_SCHEMA,entries:data.entries,interactions:data.interactions,learning:data.learning}));storage.setItem(keys[1],JSON.stringify({completed:data.quests.completed}));}
  catch(error){let restored=true;for(let i=0;i<keys.length;i++)try{if(before[i]===null)storage.removeItem(keys[i]);else storage.setItem(keys[i],before[i]);}catch{restored=false;}throw Error(`Speichern fehlgeschlagen. Der laufende Stand wurde nicht ersetzt.${restored?'':' Die Gerätesicherung ist möglicherweise unvollständig; exportiere den laufenden Stand.'}`);}
 }
 journal.entries=data.entries;journal.interactions=data.interactions;journal.learning=data.learning;journal.focus=null;journal.seconds=0;book.completed=data.quests.completed;
 journal.storageReadBlocked=false;book.storageReadBlocked=false;book.storageError=null;
 journal.storageError=storage?null:'Nur im Arbeitsspeicher: Bitte exportieren.';
 return !!storage;
}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function fieldReport(journal,book=null){
 const sourceNames={'own-observation':'Eigene Beobachtung','model-protocol':'Modellprotokoll','provided-knowledge':'Bereitgestelltes Fachwissen','hypothesis':'Hypothese'};
 const labels={'recordId':'Verwendeter Beleg','lowId':'Niedrigwasserbeleg','highId':'Hochwasserbeleg','provenance':'Herkunft','counterexample':'Gegenbeispiel','relation':'Beteiligte Taxa','claims':'Belegkombination','filtration':'Filtration','access':'Erreichbarkeit','absence':'Nichtnachweis','depth':'Untersuchungsraum'};
 const values={...sourceNames,'insufficient':'Nähe allein reicht nicht','competition':'Konkurrenz behauptet','inter':'interspezifisch','intra':'intraspezifisch','same-resource':'gemeinsame Nahrung','finite':'begrenzter Vorrat','effect':'modellierte Nutzung/Wirkung','reduced-access':'verringerter Ressourcenzugang','same-frame':'nur gemeinsam im Bild','covered':'Wasserbedeckung','exposed':'Freilegung des Sediments','not-detected':'unter diesen Bedingungen nicht nachgewiesen','absent':'als abwesend bezeichnet','different-space':'anderer Untersuchungsraum','same-sample':'als unveränderte Probe bezeichnet','hidden':'Merkmal verdeckt','model-limited':'diagnostisches Detail fehlt im Modell','photo-stage':'anderes Stadium/Geschlecht in der Referenz','lookalikes':'ähnliche Taxa teilen die sichtbaren Merkmale'};
 const describe=v=>Array.isArray(v)?v.map(x=>values[x]||x).join(', '):values[v]||v;
 const taxa={...ANIMALS,...PLANTS};
 const rows=journal.learning.observations.map(r=>{
  const event=r.evidence||{},resource=event.resourceId?`Gemeinsame Ressource: ${event.resourceId}; relativer Modellvorrat: ${event.resourceStock}.`:'';
  return `<tr><td>${esc(r.missionId)} · ${esc(sourceNames[r.source])}<br>Beleg ${esc(r.id)}</td><td>${esc(taxa[r.taxon].common)}<br>Konkrete Partner: ${esc(r.partnerIds.join(', '))}</td><td>${esc(r.observedFact)}<br>t=${esc(r.simulationTime)} Modellsekunden · Dauer ${esc(r.duration)} s<br>${r.siteId?'Stelle: '+esc(r.siteId):''}${r.sampleDepth!==undefined?' · Tiefe: '+esc(r.sampleDepth)+' cm':''}</td><td>${esc(resource)}<br>Szene: ${esc(r.scene.habitat)} · Seed: ${esc(r.scene.seed)}${r.evidence?.kind==='station'?' · Durchlauf: '+esc(r.scene.runId||'nicht dokumentiert'):''} · Hilfegrad: ${esc(r.helpLevel||0)}<br>Dies ist ein Modellbeleg, keine automatisch verfasste Erklärung.</td></tr>`;
 }).join('');
 const missions=MISSIONS.map(m=>{
  const s=journal.learning.missions[m.id],answers=Object.entries(s?.answers||{}).map(([key,value])=>`<dt>${esc(labels[key]||key)}</dt><dd>${esc(describe(value))}</dd>`).join('');
  const determinations=(s?.determinations||[]).map(d=>{const a=d.answer,t=FOCUS_TAXA.find(t=>t.id===a.taxon),features=(a.features||[]).map(id=>FOCUS_TAXA.flatMap(t=>t.features).find(f=>f.id===id)?.label||id);return `<li>Beleg ${esc(d.recordId)}: ${esc(taxa[a.taxon]?.common||a.group)}. ${a.certainty==='uncertain'?'Unsichere Gruppenbestimmung: '+esc(a.group)+'; '+esc(values[a.reason]):'Merkmale: '+esc(features.join('; '))}</li>`;}).join('');
  return `<section><h2>${esc(m.title)}</h2><p>Vermutung: ${esc(s?.hypothesis||'nicht dokumentiert')}</p><p>Eigene Begründung / Transfer: ${esc(s?.reflection||'nicht dokumentiert')}</p><dl>${answers}</dl>${determinations?'<ul>'+determinations+'</ul>':''}<p>Hilfegrad: ${esc(s?.helpLevel||0)} · Lokaler Aufgabenabschluss: ${s?.complete?'erreicht':'offen'}</p><p>Modellgrenze: ${esc(m.limit)}</p></section>`;
 }).join('');
 const evolution=Object.entries(book?.completed||{}).filter(([,r])=>r.study).map(([id,r])=>`<section><h2>Evolution · ${esc(id)}</h2><p>Vorhersage: ${esc(r.study.prediction||'offen')}</p><p>Datenvergleich: ${esc(r.study.comparison||'offen')}</p><p>Modellkritik: ${esc(r.study.critique||'offen')}</p></section>`).join('');
 const discoveries=Object.keys(journal.entries).map(id=>`<li>${esc(taxa[id].common)} · ${journal.entries[id].determination?'zusätzliche Bestimmungsentscheidung dokumentiert':'entdeckt, Name vom Programm'}</li>`).join('');
 return `<!doctype html><html lang="de"><meta charset="utf-8"><title>Feldbericht</title><style>body{font:16px system-ui;max-width:1100px;margin:2em auto;padding:1em;color:#182e23}table{border-collapse:collapse;width:100%}th,td{border:1px solid #777;padding:.5em;vertical-align:top;overflow-wrap:anywhere}section{break-inside:avoid}p{white-space:pre-wrap}dt{font-weight:bold}dd{margin-bottom:.5em}@media print{button{display:none}body{margin:0}}</style><h1>Ökologischer Feldbericht</h1><p>Feldbuchschema ${FIELD_SCHEMA}. Kein Name erforderlich. Programmtexte und Modellereignisse sind keine eigenen Erklärungen.</p><button onclick="window.print()">Bericht drucken</button>${missions}${evolution}<h2>Belege mit Herkunft</h2><table><thead><tr><th>Mission/Herkunft</th><th>Taxon/Partner</th><th>Beobachtbarer Sachverhalt</th><th>Modellkontext</th></tr></thead><tbody>${rows}</tbody></table><h2>Entdeckte Taxa</h2><ul>${discoveries}</ul><h2>Raster für die gemeinsame Auswertung</h2><p>Belegqualität · Trennung Beobachtung/Deutung · biologische Erklärung · Unsicherheit und Modelltransfer. Je Kriterium: noch offen / teilweise begründet / nachvollziehbar begründet. Offene Texte werden nicht automatisch benotet. Sammelfortschritt und Spieltempo sind keine Note.</p></html>`;
}
