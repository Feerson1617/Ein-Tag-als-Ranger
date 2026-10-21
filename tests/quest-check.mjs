import assert from 'node:assert/strict';
import { ExpeditionEcology, FieldJournal } from '../dist/field-ecology.js';
import { FieldEvolution, EVOLUTION_FACTORS } from '../dist/field-evolution.js';
import { QuestBook, QUESTS } from '../dist/quests.js';
import { TRAIL_LENGTH, TRAIL_ENTRIES, trailPoint, nearestTrail } from '../dist/trail.js';
import { ANIMALS } from '../dist/biodiversity.js';

assert.ok(TRAIL_LENGTH>730&&TRAIL_LENGTH<740);assert.equal(Object.keys(TRAIL_ENTRIES).length,8);
const itinerary=['forest','meadow','farmland','city','saltmarsh','wadden','beach','lake'];
for(let i=1;i<itinerary.length;i++)assert.ok(TRAIL_ENTRIES[itinerary[i]].distance>TRAIL_ENTRIES[itinerary[i-1]].distance);
for(let d=0;d<TRAIL_LENGTH;d+=3){const p=trailPoint(d);assert.ok(Math.abs(p.x)<219&&p.z>-235&&p.z<207);assert.ok(nearestTrail(p.x,p.z).offset<.001);}

const controlled = kind => {
 const sim=new ExpeditionEcology('meadow',719);sim.agents=sim.agents.filter(a=>['bombus_lapidarius','hare','capreolus_capreolus'].includes(a.species));
 sim.patches=[{x:0,z:0,size:.4,low:true,flower:true,species:'trifolium_pratense'},{x:1.3,z:0,size:.4,low:true,flower:true,species:'trifolium_pratense'}];
 sim.agents.forEach((a,i)=>{a.x=.2+(i%2)*.3;a.z=.2;a.homeX=a.x;a.homeZ=a.z;a.stateTime=100;a.speed=0;a.phase=1;});
 const context=sim.relations.arm(kind,kind==='competition'?['hare','capreolus_capreolus']:['bombus_lapidarius','trifolium_pratense']);assert.ok(context);
 for(let i=0;i<2200;i++)sim.update(.05,null);
 return sim;
};
const pollination=controlled('mutualism');assert.ok(pollination.events.some(e=>e.kind==='mutualism'));assert.ok(pollination.patches.some(p=>p.pollenTransfers>0&&p.seedPotential>0));
const competition=controlled('competition');assert.ok(competition.events.some(e=>e.kind==='competition'&&e.otherId));assert.ok(competition.patches.some(p=>p.stock<1));

const report=[];
for(const factor of Object.keys(EVOLUTION_FACTORS)) {
 const sim=new ExpeditionEcology('farmland',902),model=new FieldEvolution(sim);sim.agents=model.pool;model.start(factor);
 const baseline=model.snapshot();
 for(let i=0;i<7600;i++){model.update(.05);sim.update(.05,null);}
 const snapshot=model.snapshot();assert.ok(Number.isFinite(model.clock));
 for(const a of model.pool){assert.ok(Number.isFinite(a.x)&&Number.isFinite(a.z));for(const h of a.dna)assert.ok(h.every(x=>x===0||x===1));}
 assert.ok(model.events.some(e=>e.kind==='birth'),`${factor}: no offspring`);
 assert.ok(model.evidence(factor),`${factor}: no matching evidence`);
 if(factor==='isolation'){assert.equal(model.events.some(e=>e.kind==='geneFlow'),false);assert.ok(model.events.some(e=>e.kind==='isolation'));}
 if(factor==='geneFlow'){assert.ok(model.events.some(e=>e.kind==='migration'));assert.ok(model.events.some(e=>e.kind==='geneFlow'&&e.destination==='east'));}
 report.push({factor,generation:model.generation,initial:baseline.n,final:snapshot.n,kinds:[...new Set(model.events.map(e=>e.kind))]});
 model.stop();assert.equal(sim.factors.road,false);
}
// Crossing over can recombine existing alleles but cannot introduce a third allele.
const genetics=new FieldEvolution(new ExpeditionEcology('farmland',2));genetics.start('recombination');
const parent=genetics.adults()[0];parent.dna=[[0,0],[1,1]];
const gametes=Array.from({length:40},()=>genetics.gamete(parent));assert.ok(gametes.some(g=>g[0]!==g[1]));assert.ok(gametes.every(g=>g.every(v=>v===0||v===1)));

// Selecting a quest never creates a species entry, and a trace cannot finish filtration.
const sims=new Map(['forest','meadow','city','lake','beach','wadden','farmland','saltmarsh'].map(h=>[h,new ExpeditionEcology(h,902)]));
const book=new QuestBook(sims,new FieldEvolution(sims.get('farmland'))),journal=new FieldJournal();
book.select('tidal-filter');assert.equal(Object.keys(journal.entries).length,0);
const shell=sims.get('wadden').agents.find(a=>a.species==='mytilus_edulis');journal.entries.mytilus_edulis={behaviors:[]};
assert.equal(book.observe({type:'animal',item:{...shell,trace:true}},10,journal),null);assert.equal(Object.keys(book.completed).length,0);
assert.equal(QUESTS.length,16);for(const q of QUESTS)for(const id of q.species)assert.ok(ANIMALS[id]||id.includes('_'));
console.log(JSON.stringify({routeMeters:Math.round(TRAIL_LENGTH),questCount:QUESTS.length,pollenTransfer:'verified',competition:'shared finite resource verified',evolution:report,unknownSpecies:'not unlocked by quest selection',traces:'cannot finish living filtration'},null,2));
