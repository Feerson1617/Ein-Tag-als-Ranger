import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {HabitatWorld,CENTERS,groundHeight} from '../dist/habitat-world.js';
import {createExpeditionSimulations} from '../dist/expedition-state.js';
import {QuestBook} from '../dist/quests.js';
import {InteractionScenarios,SCENARIOS} from '../dist/interaction-scenarios.js';
import {QuestInterface} from '../dist/quest-interface.js';
import {questFinished,residentDestination} from '../dist/quest-learning.js';
import {RESIDENTS} from '../dist/village-people.js';
import {ANIMALS} from '../dist/biodiversity.js';
import {WildlifeRenderer} from '../dist/wildlife.js';
import {collisionContains} from '../dist/observation-tools.js';
import {segmentHitsBarrier} from '../dist/field-ecology.js';
T.TextureLoader.prototype.load=()=>new T.Texture();const elements=new Map();
const get=id=>{if(!elements.has(id))elements.set(id,{dataset:{},listeners:{},classList:{toggle(){},add(){},remove(){}},setAttribute(){},addEventListener(name,fn){this.listeners[name]=fn;},querySelectorAll:()=>[],close(){}});return elements.get(id);};
globalThis.document={getElementById:get,createElement:()=>({getContext:()=>({measureText:s=>({width:s.length*20}),fillRect(){},fillText(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(){},getImageData(x,y,w,h){return {data:new Uint8ClampedArray(w*h*4).fill(160)};}})})};
const scene=new T.Scene(),world=new HabitatWorld(scene),{simulations}=createExpeditionSimulations(world,-.7);scene.updateMatrixWorld(true);
const base=world.root.children.find(m=>m.isMesh&&m.geometry?.parameters?.width===480),cityMesh=world.regions.get('city').children.find(m=>m.isMesh&&m.geometry?.parameters?.width===152),ray=new T.Raycaster();let terrainSamples=0,maxFormulaMismatch=0;
for(let x=CENTERS.city.x+5;x<CENTERS.city.x+14;x+=.45)for(let z=10;z<26;z+=.45){ray.set(new T.Vector3(x,20,z),new T.Vector3(0,-1,0));const hits=ray.intersectObjects([base,cityMesh]);if(!hits.length)continue;const visible=hits[0].point.y;assert.ok(Math.abs(world.terrainHeight(x,z)-visible)<1e-5,'Contact height disagrees with the actual rendered triangles');maxFormulaMismatch=Math.max(maxFormulaMismatch,visible-groundHeight(x,z));terrainSamples++;}
assert.ok(maxFormulaMismatch>.15,'The regression must exercise the steep bank that buried the fox');
const fox={species:'fox',id:91231,x:0,z:0,renderX:CENTERS.city.x+9.2,renderZ:13.8,heading:0,phase:0,trait:1,age:0,alive:true,activity:'walking'},renderer=new WildlifeRenderer(scene,[fox]);renderer.update(groundHeight,()=>.06,null,(x,z)=>world.walkHeight(x,z));
assert.ok(Math.abs(fox.y-fox.motion.bob-fox.motion.bodyOffset-world.walkHeight(fox.renderX,fox.renderZ))<1e-7);
const rig=renderer.batches.get('fox').legRig;for(let i=0;i<rig.legs.length;i++){const f=fox.motion.footTargets,leg=rig.legs[i],x=fox.renderX+f[i*3],z=fox.renderZ+f[i*3+2],y=fox.y+f[i*3+1]-leg.clearance;assert.ok(y>=world.walkHeight(x,z)-.035,'Fox stance feet penetrate visible ground');}
assert.equal(world.habitatFenceStats.habitats.length,8);assert.ok(world.habitatFences.length>100);let fenceSamples=0;
for(const f of world.habitatFences){for(const t of [0,.25,.5,.75,1]){const x=f.a.x+(f.b.x-f.a.x)*t,z=f.a.z+(f.b.z-f.a.z)*t;assert.equal(world.deckHeight(x,z),null,'Habitat divider crosses the boardwalk or a bay');fenceSamples++;}assert.equal(collisionContains(f,f.x,f.z,.2),true);assert.equal(world.canWalk(f.x,f.z),false);const nx=Math.sin(f.rotation),nz=Math.cos(f.rotation);assert.ok(segmentHitsBarrier(f.x-nx,f.z-nz,f.x+nx,f.z+nz,f,.1),'A diagonal fence fails a swept crossing');}
let collisionQueries=0,localCandidates=0,totalCandidates=0;
let placementChecks=0;
for(const sim of simulations.values()){
 const indexed=sim.nearbyBlockers;
 for(let i=0;i<140;i++){
  const s=ANIMALS[sim.agents[i%sim.agents.length].species],angle=i*2.399,a={alive:true,x:Math.sin(angle)*45,z:Math.cos(angle)*45,flight:i%7===0?1.5:0,heading:angle},x=a.x+Math.cos(angle)*((i%9)+.3),z=a.z+Math.sin(angle)*((i%9)+.3);
  const result=sim.passable(x,z,s,a),candidates=indexed.call(sim,x,z,sim.bodyRadius(s,a)+.035,a);localCandidates+=candidates.length;totalCandidates+=sim.blockers.length;sim.nearbyBlockers=()=>sim.blockers;const oracle=sim.passable(x,z,s,a);sim.nearbyBlockers=indexed;assert.equal(result,oracle,'Local collision lookup differs from full obstacle scan');collisionQueries++;
  if(i%7===0){const first={...a,x,z},second={...first},placed=sim.resolvePlacement(first,s);sim.nearbyBlockers=()=>sim.blockers;const expected=sim.resolvePlacement(second,s);sim.nearbyBlockers=indexed;assert.equal(placed,expected);assert.equal(first.x,second.x);assert.equal(first.z,second.z);placementChecks++;}
 }
 for(const f of world.habitatFences.filter(f=>f.habitats.includes(sim.habitat)).slice(0,12)){
  const s=ANIMALS.fox,nx=Math.sin(f.rotation),nz=Math.cos(f.rotation),a={alive:true,x:f.x-nx*2,z:f.z-nz*2,flight:0};const result=sim.passable(f.x+nx*2,f.z+nz*2,s,a);sim.nearbyBlockers=()=>sim.blockers;const oracle=sim.passable(f.x+nx*2,f.z+nz*2,s,a);sim.nearbyBlockers=indexed;assert.equal(result,oracle,'Indexed lookup misses a swept diagonal fence crossing');collisionQueries++;
 }
}
assert.ok(localCandidates<totalCandidates*.1,'Local obstacle lookup still scans most obstacles');
const evolution={stop(){}},book=new QuestBook(simulations,evolution),scenarios=new InteractionScenarios(simulations);let rendered='',routes=0,reveals=0;
const ui=new QuestInterface({scene:new T.Scene(),book,journal:{entries:{}},observer:{x:0,z:0},openPanel:(title,html)=>rendered=html,escape:s=>String(s),toast(){},onChange(){},onFocus(){},onMode(){}});
for(const scenario of SCENARIOS){
 book.active={quest:{id:'previous'}};scenarios.start(scenario.id,book);assert.equal(book.active,null,'Entering a scenario inherits an active quest');assert.equal(scenarios.markers().length,0);ui.updateSelectionPrompt();assert.equal(get('world').dataset.awaitingQuest,'true');assert.equal(get('world').dataset.activeQuest,'');
 const q=scenario.quests[0];assert.equal(questFinished(book,q),false);assert.ok(ui.details(q.id));assert.ok(!rendered.includes(q.definition),'Undiscovered theory is exposed before finishing');assert.ok(rendered.includes('Quest annehmen'));get('start-quest').listeners.click();assert.equal(book.active.quest.id,q.id);assert.equal(get('world').dataset.awaitingQuest,'false');
 book.completed[q.id]={encounters:{[q.encounters[0].id]:{}}};assert.equal(questFinished(book,q),true);ui.details(q.id);assert.ok(rendered.includes(q.definition)&&rendered.includes('Deine fachliche Auswertung'));reveals++;
 for(const [index,person]of RESIDENTS.entries()){const destination=residentDestination({...person,index},book);if(destination.view==='quest')assert.ok(book.available().some(q=>q.id===destination.id));routes++;}
 assert.equal(ui.details('absent-quest'),false,'An unavailable dialog quest should be handled without an exception');
}
scenarios.start(null,book);for(const [index,person]of RESIDENTS.entries()){const d=residentDestination({...person,index},book);if(d.view==='quest')assert.ok(book.available().some(q=>q.id===d.id));routes++;}
assert.equal(residentDestination({index:1},book).habitat,'city');
assert.equal(questFinished({progress:()=>1},{encounters:[{},{}]}),false,'A partial free-exploration assignment must not unlock its full theory');
console.log(JSON.stringify({version:'0.15',terrainSamples,maxFormulaMismatch,fox:'contact and stance feet use visible terrain triangles',habitatFences:world.habitatFenceStats,fenceSamples,collisionQueries,placementChecks,localCandidates,totalCandidates,scenarioStarts:'six modes start without a quest or markers',learningReveals:reveals,dialogRoutes:routes,learning:'instructions before acceptance; theory only after full completion'},null,2));
