import { ANIMALS, PLANTS, HABITATS } from './biodiversity.js';
import { MISSIONS, FOCUS_TAXA, missionById, evaluateDetermination, evaluateMission, freshLearning } from './learning-missions.js';
import { exportFieldbook, parseFieldbook, applyFieldbook, fieldReport } from './fieldbook-transfer.js';
import { speciesPhotoHtml } from './species-photo-view.js';
import { plantIdentity } from './plant-identity.js';
import { TRAIL_ENTRIES } from './trail.js';
const $=id=>document.getElementById(id);
const name=id=>(ANIMALS[id]||PLANTS[id])?.common||id;
const sourceLabel={'own-observation':'Eigene Beobachtung','model-protocol':'Modellprotokoll','provided-knowledge':'Bereitgestelltes Fachwissen','hypothesis':'Hypothese'};
let recordSerial=0;
export class MissionInterface {
 constructor(options){
  Object.assign(this,options);this.watchKey=null;this.watchSeconds=0;this.stationStart=null;this.sceneRunId=crypto.randomUUID?.()||Array.from(crypto.getRandomValues(new Uint32Array(4))).join('-');
  $('missions').addEventListener('click',()=>this.show());
  $('field-note').addEventListener('click',()=>this.recordCurrent());
 }
 state(id){return this.journal.learning.missions[id]||=({version:1,startedAt:Date.now(),hypothesis:'',reflection:'',answers:{},determinations:[],helpLevel:0,complete:false});}
 begin(id){
  const m=missionById(id);if(!m)return;
  this.journal.learning.activeMission=id;this.book.learningMission=id;this.state(id);this.stationStart=null;
  this.book.cancel();this.scenarios.start(id==='m2'?'competition':null,this.book);
  if(id==='m2'){const q=this.book.available().find(q=>q.habitat==='meadow'&&q.kind==='competition');this.book.select(q.id,{repeat:true});}
  this.journal.save();this.onChange();this.show(id);
 }
 show(id=this.journal.learning.activeMission){
  const m=missionById(id),e=this.escape;
  if(!m){
   this.openPanel('FELDBUCH · LERNMISSIONEN',`<h2>Eine Frage an die Landschaft.</h2><p>Drei Untersuchungen für Klasse 12. Die Spielphase ist mit 20–35 Minuten je Mission geplant; tatsächliche Unterrichtszeiten sind noch nicht erprobt. Freie Erkundung und vorhandene Szenarien bleiben erreichbar.</p><div class="quest-list">${MISSIONS.map(m=>`<button class="quest-card" data-mission="${m.id}"><span>${e(m.level)}</span><strong>${e(m.title)}</strong><span>${e(m.goal)}</span></button>`).join('')}</div><p class="mini-note">Spieltempo und Sammelzahlen sind keine Note. Evolution bleibt eine gesonderte Vertiefung vor allem für Jahrgang 13.</p>`);
   $('panel-content').querySelectorAll('[data-mission]').forEach(b=>b.addEventListener('click',()=>this.begin(b.dataset.mission)));return;
  }
  const s=this.state(id),records=this.journal.learning.observations.filter(r=>r.missionId===id);
  const result=evaluateMission(id,s,this.journal.learning.observations);
  this.openPanel('FELDBUCH · '+m.level,`<h2>${e(m.title)}</h2><p>${e(m.question)}</p><p class="mini-note">Vorwissen: ${e(m.prior)}</p><ol>${m.steps.map(t=>`<li>${e(t)}</li>`).join('')}</ol><div class="panel-row"><button class="action" id="mission-travel">${id==='m3'?'Zur virtuellen Probenstelle 3 wechseln':'Zum Untersuchungsgebiet wechseln'}</button><button class="action quiet" id="mission-all">Alle Missionen</button><button class="action quiet" id="mission-free">Freie Erkundung fortsetzen</button></div><p class="concept">${e(m.limit)}</p><details><summary>Gestufte Hilfe und zulässige Belege</summary><p>${e(m.evidence)}</p><button class="action quiet" id="mission-help">Nächste Hilfe anzeigen</button><p id="mission-hint">${e(m.help.slice(0,s.helpLevel).join(' '))}</p></details>${id==='m1'?this.determinationForm(s,records):`<label class="mission-label">Deine Vermutung (keine automatische Benotung)<textarea id="mission-hypothesis" maxlength="2000">${e(s.hypothesis)}</textarea></label>${id==='m2'?this.relationshipForm(s,records):this.tideForm(s,records)}`}<label class="mission-label">Eigene Begründung / Transferfrage: ${e(m.transfer)}<textarea id="mission-reflection" maxlength="4000">${e(s.reflection)}</textarea></label><p id="mission-feedback" role="status">${e(result.message)}</p><button class="action" id="mission-check">Lokalen Lernabschluss prüfen</button><h3>Belege im Feldbuch (${records.length})</h3><div class="mission-records">${records.map(r=>`<p><b>${e(sourceLabel[r.source])}</b> · ${e(name(r.taxon))} · ${e(r.observedFact)}<br><small>${e(r.id)} · ${e(r.partnerIds.join(', '))} · t=${r.simulationTime.toFixed(1)} s · Dauer ${r.duration.toFixed(1)} s</small></p>`).join('')||'<p>Noch kein Beleg. Schließe dieses Fenster, beobachte einen Fund und nutze „Beobachtung sichern“.</p>'}</div>`);
  $('mission-all').addEventListener('click',()=>this.show(null));
  $('mission-free').addEventListener('click',()=>{this.journal.learning.activeMission=null;this.book.learningMission=null;this.book.cancel();this.scenarios.start(null,this.book);this.journal.save();$('panel').close();this.onChange();});
  $('mission-travel').addEventListener('click',()=>{this.onTravel(m.habitat,id==='m3'?this.sampling.spots[2]:null);});
  $('mission-help').addEventListener('click',()=>{s.helpLevel=Math.min(m.help.length,s.helpLevel+1);$('mission-hint').textContent=m.help.slice(0,s.helpLevel).join(' ');this.journal.save();});
  const saveTexts=()=>{if($('mission-hypothesis'))s.hypothesis=$('mission-hypothesis').value;s.reflection=$('mission-reflection').value;this.journal.save();};
  for(const id of ['mission-hypothesis','mission-reflection'])$(id)?.addEventListener('input',saveTexts);
  $('mission-check').addEventListener('click',()=>{saveTexts();this.readAnswers(id,s);const r=evaluateMission(id,s,this.journal.learning.observations);s.complete=r.complete;if(r.complete)s.completedAt=Date.now();this.journal.save();$('mission-feedback').textContent=r.message;this.onChange();});
  if(id==='m1')this.bindDeterminations(s,records);
  if(id==='m2'){$('mission-protocol').addEventListener('click',()=>this.collectProtocol());$('mission-target').onclick=()=>{const a=this.book.target(this.observer);if(a){$('panel').close();this.onTarget(a);}};}
  if(id!=='m1')$('panel-content').querySelectorAll('select,input[type="checkbox"]').forEach(input=>input.addEventListener('change',()=>{this.readAnswers(id,s);this.journal.save();}));
  if(id==='m3'){
   $('station-low').addEventListener('click',()=>{this.setTide(0);this.stationStart=null;this.toast('Definiertes Niedrigwasser; neue Beobachtung beginnen.');});
   $('station-high').addEventListener('click',()=>{this.setTide(.5);this.stationStart=null;this.toast('Definiertes Hochwasser; neue Beobachtung beginnen.');});
   $('station-start').addEventListener('click',()=>this.startStation());
   $('station-record').addEventListener('click',()=>{this.recordStation();});
   $('station-sample').addEventListener('click',()=>this.onSampling());
  }
 }
 select(id,label,choices,value=''){
  const e=this.escape;return `<label class="mission-label" for="${id}">${e(label)}<select id="${id}"><option value="">Bitte wählen</option>${choices.map(([key,text])=>`<option value="${e(key)}" ${String(value)===String(key)?'selected':''}>${e(text)}</option>`).join('')}</select></label>`;
 }
 recordOptions(records){return records.map(r=>[r.id,`${name(r.taxon)} · ${sourceLabel[r.source]} · t=${r.simulationTime.toFixed(1)} s`]);}
 determinationForm(s,records){
  const e=this.escape;
  return `<details><summary>Bestimmungsreferenzen und Merkmalsvergleich (vor dem Fund nutzbar)</summary><p>Vergleiche zwei Merkmale. Bei fehlenden/verdecken Merkmalen darfst du unsicher bleiben. Das Öffnen einer Referenz entdeckt keine Art.</p>${FOCUS_TAXA.map(t=>`<details><summary>${e(name(t.id))} / ${e(t.group)}</summary><p>${t.features.map(f=>e(f.label)).join(' · ')}</p>${t.resolution==='group'?'<p class="mini-note">Diese Merkmale tragen hier nur die Gruppenzuordnung; ähnliche Hummelarten sind nicht sicher abgrenzbar.</p>':''}${speciesPhotoHtml(ANIMALS[t.id]||PLANTS[t.id],true,e)}<a href="${e(t.reference)}" target="_blank" rel="noopener">Bestimmungsreferenz ↗</a></details>`).join('')}</details><details><summary>Fokustaxa im Gebiet aufsuchen (keine automatische Entdeckung)</summary><div class="panel-row">${FOCUS_TAXA.filter(t=>(ANIMALS[t.id]||PLANTS[t.id]).habitats.includes("forest")).map(t=>`<button class="action quiet" data-focus-taxon="${t.id}">${e(name(t.id))} suchen</button>`).join('')}</div></details><h3>Fund merkmalsbezogen einordnen</h3>${this.select('det-record','Eigener Fund',this.recordOptions(records))}${this.select('det-taxon','Taxonzuordnung',FOCUS_TAXA.map(t=>[t.id,name(t.id)]))}<fieldset class="feature-options" id="det-features"><legend>Merkmalsvergleich</legend><p>Wähle eine Taxonzuordnung, um passende und abzugrenzende Merkmale zu vergleichen.</p></fieldset>${this.select('det-certainty','Sicherheit',[['certain','An zwei Merkmalen zugeordnet'],['uncertain','Nicht sicher auf Artebene bestimmbar']])}${this.select('det-group','Bei Unsicherheit: passende Gruppe',[...new Set(FOCUS_TAXA.map(t=>t.group))].map(g=>[g,g]))}${this.select('det-reason','Bei Unsicherheit: konkrete Grenze',[['hidden','Diagnostisches Merkmal verdeckt'],['model-limited','Diagnostisches Detail fehlt im Modell'],['photo-stage','Referenz zeigt anderes Stadium/Geschlecht'],['lookalikes','Ähnliche Taxa teilen die sichtbaren Merkmale']])}<button class="action quiet" id="det-save">Bestimmungsentscheidung sichern</button><p id="det-feedback" role="status">${s.determinations.length} Entscheidungen gespeichert. Eine falsche/unvollständige Entscheidung kann korrigiert werden.</p>`;
 }
 bindDeterminations(s,records){
  $('det-taxon').addEventListener('change',()=>this.renderFeatures($('det-taxon').value));
  $('panel-content').querySelectorAll('[data-focus-taxon]').forEach(b=>b.addEventListener('click',()=>this.onFindTaxon(b.dataset.focusTaxon)));
  $('det-save').addEventListener('click',()=>{
   const record=records.find(r=>r.id===$('det-record').value),answer={taxon:$('det-taxon').value,features:[...document.querySelectorAll('[name="det-feature"]:checked')].map(x=>x.value),certainty:$('det-certainty').value,group:$('det-group').value,reason:$('det-reason').value};
   const result=evaluateDetermination(answer,record);$('det-feedback').textContent=result.message;
   if(!result.ok)return;
   s.determinations=s.determinations.filter(d=>d.recordId!==record.id);s.determinations.push({recordId:record.id,answer,result,time:Date.now()});
   if(this.journal.entries[record.taxon])this.journal.entries[record.taxon].determination={status:result.uncertain?'uncertain-group':'feature-based',recordId:record.id,features:answer.features};
   this.journal.save();
  });
 }
 renderFeatures(id){
  const t=FOCUS_TAXA.find(t=>t.id===id);if(!t)return;
  const other=FOCUS_TAXA.find(x=>x.id!==id&&x.group===t.group)||FOCUS_TAXA.find(x=>x.id!==id);
  $('det-features').innerHTML='<legend>Zwei tatsächlich erkennbare Merkmale</legend>'+[...t.features,...other.features].map(f=>`<label><input type="checkbox" name="det-feature" value="${this.escape(f.id)}"> ${this.escape(f.label)}</label>`).join('')+'<label><input type="checkbox" name="det-feature" value="program-name"> Name am Marker</label>';
 }
 relationshipForm(s,records){const a=s.answers;return `<h3>Beobachtung und Deutung</h3><button id="mission-target" class="action quiet">Futterstelle im Fernglas suchen</button><button id="mission-protocol" class="action quiet">Vorhandenes Modellprotokoll einsehen</button><p class="mini-note">Nur tatsächlich erzeugte Ereignisse der ausgewählten Partner; dies wird als Modellprotokoll dokumentiert.</p>${this.select('m2-record','Beleg',this.recordOptions(records),a.recordId)}${this.select('m2-provenance','Herkunft',[['own-observation','Eigene Beobachtung'],['model-protocol','Später gelesenes Modellprotokoll']],a.provenance)}${this.select('m2-counter','Gegenbeispiel: Zwei Tiere nebeneinander, keine gemeinsame Ressource bekannt',[['competition','Belegt Konkurrenz'],['insufficient','Reicht für diese Erklärung nicht aus']],a.counterexample)}${this.select('m2-relation','Beteiligte Taxa',[['intra','Gleiche Art: intraspezifisch'],['inter','Verschiedene Arten: interspezifisch']],a.relation)}<fieldset><legend>Welche Belegkombination trägt die Erklärung?</legend>${[['same-resource','Gemeinsame Nahrung'],['finite','Begrenzter Vorrat'],['effect','Modellierte Nutzung und Wirkung'],['reduced-access','Verringerter Zugang zur Nahrung'],['same-frame','Nur zusammen im Bild']].map(([key,text])=>`<label><input name="m2-claim" type="checkbox" value="${key}" ${a.claims?.includes(key)?'checked':''}> ${text}</label>`).join('')}</fieldset>`;}
 tideForm(s,records){const a=s.answers;return `<h3>Kontrollierter Vergleich an Probenstelle 3</h3><p class="mini-note">Virtuelle Sondergenehmigung. Die Messung liest Modellzustände. Vergleiche dasselbe Individuum bei gleicher Stelle und Tiefe in einem Rundgang, mit getrennten Beobachtungsfenstern. Keine reale Probennahme ableiten.</p><div class="panel-row"><button id="station-low" class="action quiet">Definiertes Niedrigwasser</button><button id="station-high" class="action quiet">Definiertes Hochwasser</button><button id="station-sample" class="action quiet">Vorhandene Wattprobe untersuchen</button><button id="station-start" class="action">6 Modellsekunden beobachten</button><button id="station-record" class="action quiet">Stationsprotokoll sichern</button></div>${this.select('m3-low','Niedrigwasserprotokoll',this.recordOptions(records),a.lowId)}${this.select('m3-high','Hochwasserprotokoll',this.recordOptions(records),a.highId)}${this.select('m3-filtration','Filtration erfordert …',[['covered','Wasserbedeckung'],['exposed','Trockenliegenden Boden']],a.filtration)}${this.select('m3-access','Für einen watenden Vogel wird Bodennahrung eher zugänglich bei …',[['exposed','Freilegung des Sediments, abhängig von Art und Schnabel'],['covered','Beliebig hohem Wasserstand']],a.access)}${this.select('m3-absence','Nicht gefunden bedeutet …',[['not-detected','Unter diesen Bedingungen nicht nachgewiesen'],['absent','Sicher abwesend']],a.absence)}${this.select('m3-depth','Tiefer graben bedeutet …',[['different-space','Einen anderen Raum untersuchen'],['same-sample','Genau dieselbe Probe unverändert messen']],a.depth)}`;}
 readAnswers(id,s){
  if(id==='m2')s.answers={recordId:$('m2-record').value,provenance:$('m2-provenance').value,counterexample:$('m2-counter').value,relation:$('m2-relation').value,claims:[...document.querySelectorAll('[name="m2-claim"]:checked')].map(x=>x.value)};
  if(id==='m3')s.answers=Object.fromEntries(['low','high','filtration','access','absence','depth'].map(key=>[key==='low'?'lowId':key==='high'?'highId':key,$('m3-'+key).value]));
 }
 addRecord(record){
  const id=this.journal.learning.activeMission;if(!id)return null;
  const r={id:`beleg-${Date.now()}-${++recordSerial}`,missionId:id,missionVersion:1,helpLevel:this.state(id).helpLevel,certainty:null,interpretation:null,...record};
  this.journal.learning.observations.push(r);this.journal.save();return r;
 }
 update(dt){
  const active=this.journal.learning.activeMission,c=this.getContext(),focus=c.focus;
  const key=focus?.type==='plant'?plantIdentity(focus.item):focus?`${focus.item.habitat}:${focus.item.id}`:null;
  if(!c.canObserve||!key){this.watchKey=null;this.watchSeconds=0;}else{if(key!==this.watchKey||!(dt>0)){this.watchKey=key;this.watchSeconds=0;this.watchStartedSimulationTime=this.simulations.get(focus.item.habitat).time;}else this.watchSeconds+=dt;}
  $('field-note').hidden=!active;$('field-note').disabled=!active||this.watchSeconds<2;
  if(active){const m=missionById(active);$('mission').textContent=m.title;const protocol=active==='m2'&&this.book.active?.contexts.some(c=>this.simulations.get(c.habitat).events.some(e=>e.time>=c.started&&e.kind==='competition'&&c.actors.includes(e.actor)&&c.actors.includes(e.otherId)&&e.resourceId&&e.resourceStock<1));$('progress').textContent=protocol?'Modellprotokoll verfügbar · Feldbuch öffnen':active==='m3'&&this.stationStart?((this.simulations.get('wadden').time-this.stationStart.time>=6)?'Beobachtungsfenster vollständig · Feldbuch öffnen':`Beobachtungsfenster: ${(this.simulations.get('wadden').time-this.stationStart.time).toFixed(1)} / 6 Modellsekunden`):`${this.state(active).complete?'Lernabschluss erreicht':'Untersuchung läuft'} · Belege im Feldbuch`;}
 }
 recordCurrent(){
  const c=this.getContext(),f=c.focus,id=this.journal.learning.activeMission;
  if(!id||!c.canObserve||!f||this.watchSeconds<2)return this.toast('Beobachte einen konkreten Fund mindestens zwei Sekunden.');
  const p=f.item,taxon=p.species||p.id,habitat=p.habitat,x=p.renderX??p.x,z=p.renderZ??p.z,entry=TRAIL_ENTRIES.forest;
  if(id==='m1'&&(habitat!=='forest'||Math.hypot(x-entry.x,z-entry.z)>30||!FOCUS_TAXA.some(t=>t.id===taxon)))return this.toast('M1: Sichere ein Fokustaxon im Waldgebiet (30 m um den Einstieg). Referenzen stehen im Feldbuch.');
  this.addRecord({source:'own-observation',taxon,partnerIds:[f.type==='plant'?plantIdentity(p):`${habitat}:${p.id}`],scene:{habitat,seed:this.simulations.get(habitat).seed,scenario:this.scenarios.current?.id||null},simulationTime:this.simulations.get(habitat).time,duration:Math.max(0,this.simulations.get(habitat).time-this.watchStartedSimulationTime),durationClock:'simulation',observationSeconds:this.watchSeconds,observedFact:f.type==='plant'?'Konkrete Pflanze im Blickfeld':`Sichtbares Individuum; Modellzustand: ${p.activity}`,evidence:{kind:'sighting'},siteId:id==='m1'?'forest-entry-30m':habitat});
  this.toast('Eigene Sichtung im bestehenden Feldbuch gesichert. Sie belegt noch keine ökologische Ursache.');
 }
 collectProtocol(){
  const active=this.book.active;if(!active||active.quest.kind!=='competition')return this.toast('Starte M2 erneut, um die zugehörige Futterstelle zu untersuchen.');
  for(const c of active.contexts){const sim=this.simulations.get(c.habitat),g=c.group,ids=g?.actorIds||c.actors;const event=[...sim.events].reverse().find(e=>e.time>=c.started&&e.kind==='competition'&&ids.includes(e.actor)&&ids.includes(e.otherId)&&e.resourceId&&e.resourceStock<1);
   if(event){this.addRecord({source:'model-protocol',taxon:event.species,taxa:[...new Set((g?.actors||[]).map(a=>a.species))],partnerIds:ids.map(id=>`${c.habitat}:${id}`),scene:{habitat:c.habitat,seed:sim.seed,scenario:'competition'},simulationTime:event.time,duration:0,observedFact:'Protokollierte Nutzung/Wirkung an einer endlichen gemeinsamen Ressource',evidence:{...event}});this.show('m2');return;}}
  this.toast('Noch kein passender Vorgang protokolliert. Schließe das Feldbuch und beobachte die Futterstelle.');
 }
 recordInvestigation(result){
  if(this.journal.learning.activeMission!=='m2'||result.stage!=='documented')return;
  const r=Object.values(this.book.completed[result.quest.id]?.investigations||{}).at(-1);if(!r)return;
  this.addRecord({source:'own-observation',taxon:r.evidence.species||result.quest.species[0],taxa:[...result.quest.species],partnerIds:r.actors.map(id=>`${r.habitat}:${id}`),scene:{habitat:r.habitat,seed:this.simulations.get(r.habitat).seed,scenario:'competition'},simulationTime:r.evidence.time??this.simulations.get(r.habitat).time,duration:r.duration??0,durationClock:'simulation',observationSeconds:6,observedFact:(r.replay?'Wiederholung: ':'')+'Passender Modellvorgang während des Fokus dokumentiert',evidence:r.evidence});
 }
 startStation(){
  const site=this.sampling.spots[2],sim=this.simulations.get('wadden');
  if(this.scenarios.current||this.book.active)return this.toast('Beende manipulierende Aufträge vor dem kontrollierten Vergleich.');
  if(Math.hypot(site.x-this.observer.x,site.z-this.observer.z)>12)return this.toast('Gehe zuerst zur Probenstelle 3.');
  this.stationStart={time:sim.time,phase:this.tideClock.phase,depth:site.depth};$('panel').close();this.toast('Beobachtungsfenster läuft. Nach mindestens 6 Modellsekunden Feldbuch öffnen und Stationsprotokoll sichern.',9000);
 }
 recordStation(){
  const site=this.sampling.spots[2],sim=this.simulations.get('wadden'),start=this.stationStart,animal=this.sampling.specimens.find(a=>a.sampleSpot===site&&a.species==='cerastoderma_edule');
  if(this.scenarios.current||this.book.active||!start||Math.hypot(site.x-this.observer.x,site.z-this.observer.z)>12||start.phase!==this.tideClock.phase||start.depth!==site.depth||sim.time-start.time<6)return this.toast('Mindestens 6 Modellsekunden bei konstantem Wasserstand, Ort und Tiefe ohne manipulierenden Auftrag beobachten.');
  this.addRecord({source:'model-protocol',taxon:'cerastoderma_edule',partnerIds:[`wadden:${animal.id}`],scene:{habitat:'wadden',seed:sim.initialSeed,runId:this.sceneRunId,scenario:null},siteId:site.id,simulationTime:sim.time,duration:sim.time-start.time,tidePhase:this.tideClock.phase,waterLevel:this.tideClock.level,sampleDepth:site.depth,present:!!animal.revealed&&animal.alive&&!animal.dead,observedFact:animal.revealed&&animal.alive&&!animal.dead?`Freigelegte Herzmuschel; Wasserstand ${this.tideClock.level.toFixed(2)} Modellmeter; Zustand ${animal.activity}`:'Herzmuschel unter diesen Probenbedingungen nicht nachgewiesen',evidence:{kind:'station',activity:animal.revealed?animal.activity:'not-detected'}});
  this.stationStart=null;this.show('m3');
 }
 download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
 bindFieldbook(){
  $('export-journal').onclick=()=>this.download('mein-feldbuch.json',JSON.stringify(exportFieldbook(this.journal,this.book),null,2),'application/json');
  $('field-report').onclick=()=>this.download('Feldbericht.html',fieldReport(this.journal,this.book),'text/html');
  $('field-import').addEventListener('change',async event=>{
   const file=event.target.files[0];if(!file)return;
   try{if(file.size>5*1024*1024)throw Error('Datei zu groß (maximal 5 MB).');const data=parseFieldbook(await file.text());this.openPanel('FELDBUCH WIEDERAUFNEHMEN',`<h2>Strukturgeprüfte Datei übernehmen?</h2><p>${Object.keys(data.entries).length} Taxoneinträge und ${data.learning.observations.length} Missionsbelege. Die Datei ersetzt den laufenden Feldbuchstand.</p><button id="import-confirm" class="action">Geprüfte Datei übernehmen</button><button id="import-cancel" class="action quiet">Abbrechen</button>`);$('import-cancel').onclick=()=>this.onJournal();$('import-confirm').onclick=()=>{try{const persisted=applyFieldbook(data,this.journal,this.book);this.book.cancel();this.scenarios.start(null,this.book);this.onChange();this.onJournal();this.toast(persisted?'Feldbuch mit Belegen und individuellen IDs wiederaufgenommen.':'Nur im Arbeitsspeicher übernommen. Bitte exportieren.');}catch(error){this.toast(error.message,12000);}};}catch(error){this.toast('Import abgelehnt: '+error.message,12000);}
  });
  $('session-new').onclick=()=>{
   this.openPanel('GEMEINSAM GENUTZTES GERÄT',`<h2>Sitzung bewusst wechseln.</h2><p>Exportiere zuerst das bisherige Feldbuch. Erst die ausdrückliche zweite Entscheidung verwirft den laufenden Stand. Kein Name/Konto nötig.</p><button class="action" id="session-export">Bisheriges Feldbuch herunterladen</button><button class="action quiet" id="session-discard">Ohne Sicherung verwerfen und neue Sitzung beginnen</button><button class="action quiet" id="session-after-export" hidden>Nach Sicherung neue Sitzung beginnen</button><button class="action quiet" id="session-cancel">Abbrechen</button>`);
   $('session-export').onclick=()=>{this.download('mein-feldbuch.json',JSON.stringify(exportFieldbook(this.journal,this.book),null,2),'application/json');$('session-after-export').hidden=false;};
   const reset=()=>{try{applyFieldbook({entries:{},interactions:[],learning:freshLearning(),quests:{completed:{}}},this.journal,this.book);this.book.cancel();this.scenarios.start(null,this.book);this.onChange();this.onJournal();}catch(error){this.toast(error.message,12000);}};
   $('session-discard').onclick=reset;$('session-after-export').onclick=reset;$('session-cancel').onclick=()=>this.onJournal();
  };
 }
}
