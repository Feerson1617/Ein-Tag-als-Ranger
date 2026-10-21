import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import { HabitatWorld, CENTERS } from '../dist/habitat-world.js';
import { createExpeditionSimulations } from '../dist/expedition-state.js';
import { QuestBook } from '../dist/quests.js';
import { InteractionScenarios, SCENARIOS } from '../dist/interaction-scenarios.js';
import { ANIMALS } from '../dist/biodiversity.js';
THREE.TextureLoader.prototype.load=function(){return new THREE.Texture();};
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({measureText:text=>({width:text.length*20}),fillRect(){},fillText(){}})})};
const world=new HabitatWorld(new THREE.Scene()),{simulations}=createExpeditionSimulations(world,-.7),scenarios=new InteractionScenarios(simulations),evolution={stop(){}},memory=new Map(),storage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)},book=new QuestBook(simulations,evolution,storage),journal={entries:{}};
const identities=new Map([...simulations].map(([h,s])=>[h,s.agents.filter(a=>!a.scenarioReserve)]));
assert.equal(SCENARIOS.length,6);assert.ok(scenarios.pool.every(a=>a.dormant&&!a.alive));
const report=[];
for(const scenario of SCENARIOS){book.cancel();book.scenario=null;scenarios.start(scenario.id,book);const seen=new Set();
 assert.equal(book.available().length,scenario.quests.length);assert.equal(scenarios.markers().length,0,'No markers until a quest is selected');for(const q of scenario.quests){const markers=scenarios.markers(q.id),ids=new Set(scenarios.groups.get(q.id).flatMap(g=>g.actors.map(a=>a.id)));assert.ok(markers.length>0);for(const m of markers)assert.ok(m.habitat===q.habitat&&(m.focusType==='plant'?q.species.includes(m.species):ids.has(m.id)),'Only selected assignment receives beams');}assert.equal(Object.keys(journal.entries).length,0);
 for(const q of scenario.quests){const sim=simulations.get(q.habitat);for(const g of scenarios.groups.get(q.id))for(const a of g.actors){assert.ok(a.alive);assert.ok(a.attachedHost||sim.passable(a.x,a.z,ANIMALS[a.species],a),`${q.id}: inaccessible start ${a.x},${a.z}`);}}
 for(let n=0;n<2400;n++){scenarios.update(.1);for(const sim of simulations.values()){sim.externalTide=-.7;sim.update(.1,null);}
  for(const q of scenario.quests)for(const g of scenarios.groups.get(q.id)){const c={actors:g.actorIds,started:g.started,patch:g.patch};for(const a of g.actors){if(book.validEncounter(a,c,q))seen.add(q.id);assert.ok(Number.isFinite(a.x)&&Number.isFinite(a.z));assert.ok(a.alive&&!a.dead,`Scenario individual disappeared: ${q.id}`);if(a.scenarioAquatic)assert.ok(simulations.get(a.habitat).terrain(a.x,a.z)<-1.04,'Marine hosts must remain submerged even at lowest tide');}}
 }
 const missing=scenario.quests.filter(q=>!seen.has(q.id));report.push({scenario:scenario.id,pairs:scenario.quests.length,evidenced:seen.size,missing:missing.map(q=>q.id),individuals:scenario.quests.flatMap(q=>scenarios.markers(q.id)).filter(p=>!p.focusType).length});
 console.log(JSON.stringify(report.at(-1)));
 assert.equal(missing.length,0,`No actual evidence: ${missing.map(q=>q.id).join(', ')}`);
 const q=scenario.quests[0],g=scenarios.groups.get(q.id)[0];book.select(q.id);assert.equal(book.observe({type:'animal',item:g.actors[0]},10,journal),null,'Selection and light beams cannot auto-identify');
 if(scenario.id==='parasitism')for(const groups of scenarios.groups.values())for(const group of groups)if(group.quest.kind==='parasitism')for(const a of group.actors)if(ANIMALS[a.species].parasite){assert.ok(a.parasiteIntake>0);assert.ok(a.attachedHost.parasiteCost>0);assert.ok(Math.hypot(a.x-a.attachedHost.x,a.z-a.attachedHost.z)<1);}
}
// The user's pair-finding rule: actual focused individuals and a common visible
// frame, without automatic identification, a time requirement, or mixing groups.
scenarios.start('parasitism',book);const q=scenarios.current.quests[0],other=scenarios.current.quests[1],g=scenarios.groups.get(q.id)[0],foreign=scenarios.groups.get(q.id)[1],a=g.actors[0],host=g.actors[1];book.select(other.id);
const both=p=>g.actors.includes(p),one=p=>p===a;
assert.equal(book.observe({type:'animal',item:a},.1,journal,one),null);
assert.equal(book.observe({type:'animal',item:foreign.actors[1]},.1,journal,p=>foreign.actors.includes(p)),null,'Other encounter cannot supply the second individual');
assert.equal(book.observe({type:'animal',item:host},.1,journal,p=>p===host),null,'Two separate views alone do not suffice');
assert.equal(book.observe(null,0,journal,both),null,'Paused time cannot generate a sighting');
assert.equal(book.observe(null,.01,journal,both).quest.id,q.id,'Both focused and in the same frame complete immediately');
assert.equal(book.progress(q),1);assert.equal(new QuestBook(simulations,evolution,storage).progress(q),1);
assert.equal(Object.keys(journal.entries).length,0,'Pair sighting does not auto-identify species in the journal');
const plantScenario=scenarios.start('herbivory',book),pq=plantScenario.quests[0],pg=scenarios.groups.get(pq.id)[0];book.select(pq.id);
assert.equal(book.observe({type:'animal',item:pg.actors[0]},.1,journal,p=>p===pg.actors[0]),null);
assert.equal(book.observe({type:'plant',item:(pg.plan?.patch||pg.patch).instance},.1,journal,p=>p.focusType==='plant'),null);
assert.equal(book.observe(null,.01,journal,p=>p===pg.actors[0]||p.focusType==='plant'&&p.habitat===pq.habitat).quest.id,pq.id,'Plant partner uses the magnifier and a shared frame');
book.cancel();book.scenario=null;scenarios.start(null,book);assert.equal(book.available().length,16);
for(const [h,original]of identities)for(const a of original){assert.ok(simulations.get(h).agents.includes(a));assert.ok(!a.scenarioSuppressed);}
assert.ok(scenarios.pool.every(a=>!a.alive&&a.dormant&&a.scenarioInactive));
console.log(JSON.stringify({scenarios:report,persistentReservedIndividuals:scenarios.pool.length,totalPairAssignments:SCENARIOS.reduce((n,s)=>n+s.quests.length,0),bothPartnersFocusedAndSameFrame:true,unselectedAssignmentCounts:true,storageReload:true,naturalIndividualsRetained:true},null,2));
