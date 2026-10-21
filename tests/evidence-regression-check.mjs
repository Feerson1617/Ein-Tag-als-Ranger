import assert from 'node:assert/strict';
import {FieldJournal, ExpeditionEcology} from '../dist/field-ecology.js';
import {InteractionScenarios,SCENARIOS} from '../dist/interaction-scenarios.js';
import {QuestBook} from '../dist/quests.js';
import {plantIdentity,registerPlantIdentities} from '../dist/plant-identity.js';
import {plantResources,pollinatorCanFeed} from '../dist/plant-resources.js';
import {ANIMALS,PLANTS} from '../dist/biodiversity.js';
import {questFinished,questCollectionFinished} from '../dist/quest-learning.js';

const memory=new Map(),storage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};
const p={id:'trifolium_pratense',habitat:'meadow',x:1,z:2},other={...p,x:2};
registerPlantIdentities([p,other]);assert.notEqual(plantIdentity(p),plantIdentity(other));
assert.equal(plantIdentity({...p}),plantIdentity(p));
const j=new FieldJournal(storage);
assert.equal(j.observePlant(p,2.4),null);
assert.equal(j.observePlant(other,.2),null,'Changing individuals must reset focus time');
assert.equal(j.observePlant(other,0),null,'Paused focus cannot advance discovery');
assert.equal(j.observePlant(other,2.31).kind,'plant');
assert.equal(new FieldJournal(storage).entries[p.id].individualId,plantIdentity(other));
assert.equal(j.entries[p.id].status,'discovered');assert.deepEqual(j.entries[p.id].behaviors,[]);

function fixture(kind,habitat){
 const q=SCENARIOS.find(s=>s.id===kind).quests.find(q=>q.habitat===habitat);
 const sim=new ExpeditionEcology(habitat,719),actors=q.species.filter(id=>ANIMALS[id]).map(id=>sim.agents.find(a=>a.species===id));
 assert.ok(actors.every(Boolean));actors.forEach(a=>{a.alive=true;a.dead=false;});
 const plant=q.species.find(id=>PLANTS[id]),instance=plant?{id:plant,habitat,x:3,z:3}:null;
 const patch=plant?{species:plant,habitat,x:3,z:3,instance,uid:'plant-1'}:{uid:'shared-food',stock:.6};
 const group={actors,actorIds:actors.map(a=>a.id),patch,quest:q,started:0};
 const scenario=Object.assign(Object.create(InteractionScenarios.prototype),{current:{quests:[q]},groups:new Map([[q.id,[group]]]),simulations:new Map([[habitat,sim]])});
 const book=new QuestBook(scenario.simulations,{stop(){}},storage);book.scenario=scenario;
 book.active={quest:q,contexts:[],seconds:0,done:false};
 return {q,sim,actors,instance,patch,group,scenario,book};
}
const f=fixture('competition','meadow'),visible=p=>f.actors.includes(p);
f.book.observe({type:'animal',item:f.actors[0]},.1,j,visible);
assert.equal(f.book.observe({type:'animal',item:f.actors[1]},.1,j,visible).stage,'discovered');
assert.equal(f.book.progress(f.q),1);assert.equal(f.book.investigationProgress(f.q),0,'Pair sighting must not be an investigation');
const [a,b]=f.actors;f.sim.time=20;a.age=20;
a.lastEvent={kind:'competition',time:2,age:2,otherId:b.id};
assert.equal(f.book.observe({type:'animal',item:a},7,j,visible),null,'A retrospective report is not a witnessed event');
f.sim.time=21;a.age=21;a.lastEvent={kind:'competition',time:21,age:21,otherId:b.id,resourceId:'shared-food',resourceStock:.6};
assert.equal(f.book.observe({type:'animal',item:a},3,j,visible),null);
assert.equal(f.book.observe({type:'animal',item:a},0,j,visible),null);
assert.equal(f.book.observe({type:'animal',item:a},3.1,j,visible).stage,'documented');
assert.equal(f.book.investigationProgress(f.q),1);
const record=Object.values(f.book.completed[f.q.id].investigations)[0];
assert.equal(record.source,'own-observation');assert.equal(record.interpretation,null,'A model event is not the learner’s explanation');
assert.equal(new QuestBook(f.scenario.simulations,{stop(){}},storage).investigationProgress(f.q),1);

const originalInvestigations=f.book.investigationProgress(f.q);f.book.select(f.q.id,{repeat:true});
assert.equal(f.book.active.done,false);assert.equal(f.book.active.replay,true);
f.group.observationKey=null;f.sim.time=30;a.age=30;a.lastEvent={kind:'competition',time:30,age:30,otherId:b.id,resourceId:'shared-food',resourceStock:.5};
assert.equal(f.book.observe({type:'animal',item:a},6.1,j,visible).stage,'documented');
assert.equal(f.book.investigationProgress(f.q),originalInvestigations+1);assert.equal(Object.values(f.book.completed[f.q.id].investigations).at(-1).replay,true);

const h=fixture('herbivory','forest'),animal=h.actors[0];
const plantVisible=p=>p===animal||p.focusType==='plant';
h.book.observe({type:'animal',item:animal},.1,j,plantVisible);
assert.equal(h.book.observe({type:'plant',item:{...h.instance,x:4}},.1,j,plantVisible),null,'Correct taxon, wrong plant');
assert.equal(h.book.observe({type:'plant',item:{...h.instance,habitat:'city'}},.1,j,plantVisible),null,'Wrong habitat');
assert.equal(h.book.observe({type:'plant',item:h.instance},.1,j,p=>p===animal),null,'Occluded plant cannot supply a focus step');
assert.equal(h.book.observe(null,0,j,plantVisible),null);
assert.equal(h.book.observe({type:'plant',item:h.instance},.1,j,plantVisible).stage,'discovered');
assert.equal(h.book.investigationProgress(h.q),0);

// A local free assignment ends after one witnessed context; collection remains separate.
const freeActor={id:800,species:'mytilus_edulis',habitat:'wadden',alive:true,age:10,lastEvent:{kind:'filtering',time:10,age:10}},freeContext={id:'local',habitat:'wadden',actors:[800],started:0,seconds:0,done:false},freeQuest={id:'local-filter',kind:'filtering'};
const freeBook=new QuestBook(new Map([['wadden',{time:10}]]),{stop(){}});
freeBook.active={quest:freeQuest,contexts:[freeContext,{...freeContext,id:'optional',actors:[801]}],seconds:0,watched:0};
j.entries.mytilus_edulis={behaviors:[]};const freeResult=freeBook.observe({type:'animal',item:freeActor},6.1,j);
assert.equal(freeResult.allDone,true);assert.equal(freeResult.collectionDone,false);assert.equal(freeBook.active.done,true);assert.equal(freeBook.progress(freeQuest),1);

assert.ok(questFinished({progress:()=>1},{encounters:Array(196)}));
assert.equal(questCollectionFinished({progress:()=>1},{encounters:Array(196)}),false);
for(const id of ['papaver_rhoeas','sambucus_nigra']){
 const resources=plantResources(PLANTS[id]);assert.equal(resources.nectar,false);assert.equal(resources.pollen,true);
 assert.equal(pollinatorCanFeed({...resources,flower:true},ANIMALS.aglais_io),false);
 assert.equal(pollinatorCanFeed(resources,ANIMALS.apis_mellifera),true);
}
assert.equal(plantResources({id:'unreviewed',form:'flower'}).floralStatus,'not-modelled');
console.log(JSON.stringify({focus:'individuals/habitat/occlusion/pause',discovery:'preserved',investigation:'separate, contemporaneous, no automatic interpretation',resources:'pollen differs from nectar',localCompletion:'1 of 196 suffices; collection remains optional'}));
