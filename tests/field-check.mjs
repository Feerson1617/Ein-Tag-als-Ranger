import assert from 'node:assert/strict';
import { ANIMALS, PLANTS, HABITATS } from '../dist/biodiversity.js';
import { ExpeditionEcology, FieldJournal } from '../dist/field-ecology.js';
import { PONDS, groundHeight, habitatAt } from '../dist/habitat-world.js';
assert.equal(HABITATS.length,8);assert.ok(Object.values(ANIMALS).filter(x=>x.type==='bird').length>=20);
for(const h of HABITATS){assert.ok(h.species.length>=10);assert.ok(h.boards.length>=3);for(const id of h.species)assert.ok(ANIMALS[id]?.habitats.includes(h.id),`${h.id}: ${id}`);for(const id of h.plants)assert.ok(PLANTS[id]?.habitats.includes(h.id));}
for(const s of Object.values(ANIMALS)){assert.ok(s.size>0);assert.ok(s.source?.startsWith('https://'));for(const prey of s.prey)assert.ok(ANIMALS[prey]);}
const report=[];for(const h of HABITATS){const sim=new ExpeditionEcology(h.id,902);for(const a of sim.agents){assert.ok(sim.passable(a.x,a.z,ANIMALS[a.species]),`${h.id} initial habitat ${a.species} at ${a.x},${a.z}`);}let hunts=0,behaviors=new Set();for(let i=0;i<9000;i++){sim.update(.05,null);for(const a of sim.agents){assert.ok(Number.isFinite(a.x)&&Number.isFinite(a.z)&&Number.isFinite(a.heading));assert.ok(Math.abs(a.x)<80&&Math.abs(a.z)<80);behaviors.add(a.activity);if(ANIMALS[a.species].type==='fish')assert.ok(sim.passable(a.x,a.z,ANIMALS[a.species]),`${h.id} fish left water`);}hunts+=sim.events.filter(e=>e.time>=sim.time-.05&&e.kind==='predation').length;}report.push({habitat:h.id,agents:sim.agents.length,behaviors:[...behaviors],hunts});}
const memory=new Map(),storage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)},j=new FieldJournal(storage),bird={id:1,habitat:'forest',species:'parus_major',activity:'foraging',alive:true,age:20};
assert.equal(j.observe(bird,2.9,'forest'),null);assert.equal(j.observe(bird,.11,'forest').kind,'species');assert.deepEqual(j.entries.parus_major.behaviors,[]);
j.observe(bird,3,'forest');bird.activity='feeding';assert.equal(j.observe(bird,3,'forest'),null);assert.equal(j.observe(bird,3.01,'forest').kind,'behavior');assert.deepEqual(j.entries.parus_major.behaviors,['feeding']);
assert.equal(j.observe(bird,8,'forest'),null);const plant={id:'fagus_sylvatica',habitat:'forest'};assert.equal(j.observePlant(plant,2.4),null);assert.equal(j.observePlant(plant,.11).kind,'plant');assert.ok(new FieldJournal(storage).entries.fagus_sylvatica);
const w=new ExpeditionEcology('wadden');const shell=w.agents.find(a=>a.species==='mytilus_edulis');w.environment.tide=-.4;w.chooseAction(shell,ANIMALS[shell.species]);assert.equal(shell.activity,'resting');w.environment.tide=.4;w.chooseAction(shell,ANIMALS[shell.species]);assert.equal(shell.activity,'filtering');
const f=new ExpeditionEcology('forest'),mouse=ANIMALS.apodemus_sylvaticus,birdSpecies=ANIMALS.parus_major;f.factors.road=true;assert.equal(f.passable(0,0,mouse),false);assert.equal(f.passable(0,0,birdSpecies),true);f.factors.corridor=true;assert.equal(f.passable(0,0,mouse),true);const owl=f.agents.find(a=>a.species==='strix_aluco');f.chooseAction(owl,ANIMALS.strix_aluco);assert.equal(owl.activity,'resting');f.dusk=true;f.chooseAction(owl,ANIMALS.strix_aluco);assert.notEqual(owl.activity,'resting');
assert.equal(PONDS.filter(p=>p.habitat==='forest').length,2);assert.equal(habitatAt(-150,0),'city');assert.ok(Number.isFinite(groundHeight(27,12)));console.log(JSON.stringify({animals:Object.keys(ANIMALS).length,birds:Object.values(ANIMALS).filter(x=>x.type==='bird').length,plants:Object.keys(PLANTS).length,report,journal:'species → stable behavior → persistence verified'},null,2));
// An empty shell is an identification trace, never a feeding observation.
const traceJournal=new FieldJournal(),trace={id:'empty-shell-1',species:'mytilus_edulis',activity:'trace',alive:true,age:0,trace:true};
assert.equal(traceJournal.observe(trace,3.01,'wadden').kind,'species');
assert.equal(traceJournal.entries.mytilus_edulis.method,'trace');
assert.equal(traceJournal.observe(trace,20,'wadden'),null);assert.equal(traceJournal.interactions.length,0);
// Pollination visits must first reach an actual flower patch.
const meadow=new ExpeditionEcology('meadow',902),bee=meadow.agents.find(a=>a.species==='bombus_lapidarius');
meadow.agents=[bee];bee.x=0;bee.z=0;bee.homeX=0;bee.homeZ=0;bee.phase=0;bee.stateTime=0;
meadow.patches=[{x:1,z:0,size:.4,flower:true,species:'trifolium_pratense'}];
meadow.chooseAction(bee,ANIMALS.bombus_lapidarius);assert.equal(bee.pendingActivity,'pollinating');
for(let n=0;n<180;n++)meadow.update(.05,null);
assert.equal(bee.activity,'pollinating');assert.ok(Math.hypot(bee.x-1,bee.z)<.4);assert.equal(bee.target.species,'trifolium_pratense');
console.log('Trace evidence and arrival at a flower patch verified.');
const huntJournal=new FieldJournal(),hunter={id:4,species:'esox_lucius',activity:'hunting',age:20,alive:true};
huntJournal.observe(hunter,3.01,'lake');assert.equal(huntJournal.observe(hunter,20,'lake'),null);
hunter.target={species:'rutilus_rutilus',alive:true};assert.equal(huntJournal.observe(hunter,6.01,'lake').kind,'behavior');
assert.equal(huntJournal.interactions[0].target,'rutilus_rutilus');
console.log('A hunting record requires an actual eligible prey target.');
