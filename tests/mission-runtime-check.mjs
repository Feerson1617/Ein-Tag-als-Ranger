import {ObservationClock,focusFollowFactor} from '../dist/observation-tools.js';
import {evaluateMission} from '../dist/learning-missions.js';
import {parseFieldbook,exportFieldbook} from '../dist/fieldbook-transfer.js';
import {ANIMALS} from '../dist/biodiversity.js';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {HabitatWorld,groundHeight,waterHeight} from '../dist/habitat-world.js';
import {createExpeditionSimulations} from '../dist/expedition-state.js';
import {WattSurvey} from '../dist/field-sampling.js';
import {InteractionScenarios} from '../dist/interaction-scenarios.js';
import {QuestBook} from '../dist/quests.js';
import {MissionInterface} from '../dist/mission-interface.js';
import {FieldJournal} from '../dist/field-ecology.js';
import {TRAIL_ENTRIES} from '../dist/trail.js';
T.TextureLoader.prototype.load=()=>new T.Texture();
const elements=new Map(),get=id=>{if(!elements.has(id))elements.set(id,{hidden:false,disabled:false,textContent:'',addEventListener(){},close(){}});return elements.get(id);};
globalThis.document={getElementById:get,createElement:()=>({getContext:()=>({measureText:s=>({width:s.length*20}),fillRect(){},fillText(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(){},getImageData(x,y,w,h){return {data:new Uint8ClampedArray(w*h*4).fill(160)};}})})};
const world=new HabitatWorld(new T.Scene()),{simulations}=createExpeditionSimulations(world,-.9),wadden=simulations.get('wadden'),sampling=new WattSurvey(wadden,world);
assert.equal(new Set(world.plants.map(p=>p.individualId)).size,world.plants.length,'Registered plant IDs must be unique');
const forest=TRAIL_ENTRIES.forest;
for(const taxon of ['galium_odoratum','urtica_dioica','fagus_sylvatica'])assert.ok(world.plants.some(p=>p.id===taxon&&p.habitat==='forest'&&Math.hypot(p.x-forest.x,p.z-forest.z)<30),`${taxon}: unavailable in mission area`);
const j=new FieldJournal(),book=new QuestBook(simulations,{stop(){}}),scenarios=new InteractionScenarios(simulations);
const site=sampling.spots[2],observer={x:site.x,z:site.z},messages=[];
const ui=new MissionInterface({journal:j,book,scenarios,simulations,observer,sampling,tideClock:{phase:0,level:-.9},toast:m=>messages.push(m),onChange(){}});
j.learning.activeMission='m3';ui.show=()=>{};
assert.equal(sampling.dig(observer,5,-.9).ok,true);
assert.ok(sampling.specimens.some(a=>a.species==='cerastoderma_edule'&&a.sampleSpot===site&&a.revealed));
const ground=world.terrainHeight(site.x,site.z),lowWater=waterHeight(site.x,site.z,'wadden',-.9),highWater=waterHeight(site.x,site.z,'wadden',.4);
assert.ok(lowWater<ground&&highWater>ground,`Station must actually emerge/submerge: ${JSON.stringify({ground,lowWater,highWater})}`);
const heart=sampling.specimens.find(a=>a.species==='cerastoderma_edule'&&a.sampleSpot===site);
wadden.externalTide=-.9;for(let i=0;i<60;i++)wadden.update(.1,null);assert.equal(heart.activity,'resting');assert.ok(heart.alive&&!heart.dead);
wadden.externalTide=.4;for(let i=0;i<60;i++)wadden.update(.1,null);assert.equal(heart.activity,'filtering');assert.ok(heart.alive&&!heart.dead);
const crab=wadden.agents.find(a=>a.species==='carcinus_maenas');assert.ok(ANIMALS[crab.species].prey.includes(heart.species));wadden.activate(crab);Object.assign(crab,{x:heart.x,z:heart.z,activity:'hunting',stateTime:100,questIntent:null});
const originalRandom=wadden.random;wadden.random=()=>0;for(let i=0;i<100;i++)wadden.update(.1,null);wadden.random=originalRandom;assert.ok(heart.alive&&!heart.dead,'Background predation must not invalidate the controlled sample');
const ids=sampling.specimens.map(a=>a.id),plantIds=world.plants.map(p=>p.individualId);
wadden.externalTide=-.9;wadden.update(.1,null);ui.startStation();ui.recordStation();assert.equal(j.learning.observations.length,0,'No zero-duration station record');
wadden.time+=6.1;ui.recordStation();assert.equal(j.learning.observations.length,1);
ui.tideClock={phase:.5,level:.4};wadden.externalTide=.4;wadden.update(.1,null);ui.startStation();wadden.time+=6.1;ui.recordStation();assert.equal(j.learning.observations.length,2);
assert.deepEqual(j.learning.observations.map(r=>[r.siteId,r.sampleDepth,r.tidePhase,r.present]),[['probe-2',5,0,true],['probe-2',5,.5,true]]);
assert.equal(j.learning.observations[0].partnerIds[0],j.learning.observations[1].partnerIds[0]);
assert.deepEqual(j.learning.observations[0].scene,j.learning.observations[1].scene,'RNG evolution must not change the scene identity');
assert.equal(j.learning.observations[0].scene.seed,1219);
const stationAnswers={hypothesis:'Wasserbedeckung ermöglicht Filtration.',answers:{lowId:j.learning.observations[0].id,highId:j.learning.observations[1].id,filtration:'covered',access:'exposed',absence:'not-detected',depth:'different-space'}};
assert.equal(evaluateMission('m3',stationAnswers,j.learning.observations).complete,true,'Real station records must pass the stricter evaluator');
assert.equal(parseFieldbook(JSON.stringify(exportFieldbook(j,book))).learning.observations.length,2);

ui.startStation();ui.tideClock.phase=.3;wadden.time+=7;ui.recordStation();assert.equal(j.learning.observations.length,2,'Changed conditions invalidate comparison');
book.active={quest:{}};ui.startStation();assert.match(messages.at(-1),/Beende/);book.active=null;
assert.deepEqual(sampling.specimens.map(a=>a.id),ids);assert.deepEqual(world.plants.map(p=>p.individualId),plantIds);
// Durations use the simulation clock, even when observation and animal clocks differ.
j.learning.activeMission='m1';const target=world.plants.find(p=>p.id==='galium_odoratum'&&p.habitat==='forest'&&Math.hypot(p.x-forest.x,p.z-forest.z)<30),forestSim=simulations.get('forest');
ui.getContext=()=>({focus:{type:'plant',item:target},canObserve:true});ui.update(.1);forestSim.time+=2.3;ui.update(2);ui.recordCurrent();
assert.ok(Math.abs(j.learning.observations.at(-1).duration-2.3)<1e-8);assert.equal(j.learning.observations.at(-1).durationClock,'simulation');
// Reproduce slow software rendering: 24 frames in 120 wall seconds advance
// capped physics by only 1.56 s. Observation still requires a stable, visible ID.
assert.ok(24*.065<2,'The old shared physics step cannot enable the note in this trace');
for(const taxon of ['galium_odoratum','urtica_dioica','fagus_sylvatica']){
 const p=world.plants.find(p=>p.id===taxon&&p.habitat==='forest'&&Math.hypot(p.x-forest.x,p.z-forest.z)<30),clock=new ObservationClock();
 const fresh=new FieldJournal();ui.journal=fresh;fresh.learning.activeMission='m1';
 let visible=true,focus={type:'plant',item:p};ui.getContext=()=>({focus,canObserve:visible});
 ui.update(clock.step(p.individualId,0));assert.equal(get('field-note').disabled,true);
 forestSim.time+=.065;const seconds=clock.step(p.individualId,5000);fresh.observePlant(p,seconds);ui.update(seconds);
 assert.equal(get('field-note').disabled,false,`${taxon}: slow frames must count active observation time`);
 ui.recordCurrent();assert.equal(fresh.learning.observations.at(-1).partnerIds[0],p.individualId);assert.equal(fresh.learning.observations.at(-1).observationSeconds,5);
 assert.equal(fresh.entries[taxon].individualId,p.individualId);
 visible=false;clock.reset();ui.update(0);assert.equal(get('field-note').disabled,true);
 visible=true;ui.update(clock.step(p.individualId,120000));assert.equal(get('field-note').disabled,true,'A long pause cannot be credited');
 ui.update(clock.step(p.individualId,121000));assert.equal(get('field-note').disabled,true,'The two-second requirement remains');
 focus={type:'plant',item:{...p,individualId:p.individualId+':other'}};ui.update(clock.step(focus.item.individualId,126000));assert.equal(get('field-note').disabled,true,'A different individual cannot inherit elapsed time');
 clock.step(null,130000);ui.update(clock.step(focus.item.individualId,140000));assert.equal(get('field-note').disabled,true,'Loss of visibility interrupts observation');
}
// The camera must converge by elapsed time, including sparse render frames.
const remaining=schedule=>schedule.reduce((angle,dt)=>angle*(1-focusFollowFactor(dt)),2.8);
assert.ok(Math.abs(remaining(Array(60).fill(1/30))-remaining([1,1]))<1e-12);
assert.ok(remaining([2])<.00001);
console.log(JSON.stringify({missionArea:'three stationary focal plants available',plants:world.plants.length,uniqueStableIds:true,station:'real world/probe/herzmuschel, two conditions, minimum duration, changed-condition rejection',scope:'simulation/DOM double; visible 3D scene requires browser tests'}));
