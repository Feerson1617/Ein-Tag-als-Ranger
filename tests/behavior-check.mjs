import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {HabitatWorld} from '../dist/habitat-world.js';
import {createExpeditionSimulations} from '../dist/expedition-state.js';
import {InteractionScenarios,SCENARIOS} from '../dist/interaction-scenarios.js';
import {ANIMALS} from '../dist/biodiversity.js';
T.TextureLoader.prototype.load=function(){return new T.Texture();};
globalThis.document={createElement:()=>({getContext:()=>({measureText:s=>({width:s.length*20}),fillRect(){},fillText(){}})})};
const world=new HabitatWorld(new T.Scene()),{simulations}=createExpeditionSimulations(world,-.7),scenarios=new InteractionScenarios(simulations),book={scenario:null},report=[];
const before=new Map(scenarios.pool.map(a=>[a,a.id]));
for(const mode of SCENARIOS){scenarios.start(mode.id,book);const metrics=new Map();
 for(const q of mode.quests)for(const g of scenarios.groups.get(q.id))metrics.set(g,{phases:new Set(),events:new Set(),minFlight:Infinity,maxFlight:0,flightFrames:0,frames:0,path:0,retreat:0,attempts:0,minContact:Infinity,flowerIds:new Set(),start:g.actors.map(a=>({x:a.x,z:a.z})),stock:g.plan.patch?.stock});
 for(let n=0;n<4800;n++){for(const sim of simulations.values()){sim.externalTide=-.7;sim.update(.05,null);}for(const [g,m] of metrics){const [a,b]=g.actors,sim=simulations.get(g.quest.habitat);m.frames++;m.phases.add(g.plan.phase);m.path=a.behaviorDistance||0;
  for(const actor of g.actors){assert.equal(actor.id,before.get(actor));assert.ok(actor.alive&&!actor.dead);assert.ok(Number.isFinite(actor.x)&&Number.isFinite(actor.z)&&Number.isFinite(actor.flight));assert.ok(actor.attachedHost||sim.passable(actor.x,actor.z,ANIMALS[actor.species],actor),'Encounter remains in reachable species habitat '+JSON.stringify({mode:mode.id,n,quest:g.quest.id,group:g.number,actor:{species:actor.species,x:actor.x,z:actor.z,flight:actor.flight,activity:actor.activity},blocks:sim.nearbyBlockers(actor.x,actor.z,2,null).filter(p=>sim.overlapsBlocker(actor.x,actor.z,ANIMALS[actor.species],actor,p))}));if(actor.lastEvent&&sim.time-actor.lastEvent.time<.051)m.events.add(actor.lastEvent.kind);}
  if(ANIMALS[a.species].type==='fish')assert.ok(sim.terrain(a.x,a.z)+.12<sim.water(a.x,a.z),'Fish stay below the real water surface');if(g.plan.style==='kestrel'){m.minFlight=Math.min(m.minFlight,a.flight);m.maxFlight=Math.max(m.maxFlight,a.flight);m.flightFrames+=a.flight>1?1:0;if(a.lastEvent?.kind==='huntAttempt'&&sim.time-a.lastEvent.time<.051){if(m.lastAttempt!==a.lastEvent.id){m.attempts++;m.lastAttempt=a.lastEvent.id;}m.minContact=Math.min(m.minContact,Math.hypot(a.x-b.x,a.z-b.z,a.flight));}}
  if(mode.id==='competition'&&g.plan.phase==='retreat')m.retreat=Math.max(m.retreat,Math.hypot(g.actors[1-g.plan.winner].x-g.plan.slots[1-g.plan.winner].x,g.actors[1-g.plan.winner].z-g.plan.slots[1-g.plan.winner].z));
  if(mode.id==='mutualism'&&a.activity==='pollinating'){m.flowerIds.add(a.targetResource.uid);const f=g.plan.destination.blossom;assert.ok(f,'Flower visits use the rendered botanical blossom');assert.ok(Math.hypot(a.x-f.x,a.z-f.z)<.12,`Actual flower contact ${g.quest.id}/${g.number} ${Math.hypot(a.x-f.x,a.z-f.z)} phase ${g.plan.phase}`);assert.ok(Math.abs(sim.terrain(a.x,a.z)+a.flight+ANIMALS[a.species].size*.25-f.y)<.025,'Pollinator is at the real blossom, not floating below it');}
 }}
 for(const [g,m] of metrics){const [a,b]=g.actors,q=g.quest;
  if(q.kind==='predation'){
   if(g.plan.style==='kestrel'){assert.ok(m.minFlight>=.159,'Kestrel never lands in the hunt scenario');for(const phase of ['circle','hover','stoop','climb'])assert.ok(m.phases.has(phase),'All aerial hunt phases must occur');assert.ok(m.attempts>=2,`Kestrel makes repeated near-prey attempts: ${q.id}/${g.number} ${m.attempts}`);assert.ok(m.minContact<1.5);assert.ok(m.flightFrames/m.frames>.8);assert.ok(b.escapes>=2);}
   else{assert.ok(m.events.has('huntAttempt'),`A real physical approach, not a pursuit label: ${q.id}/${g.number}`);assert.ok(m.path>1,`Predator moves: ${q.id}`);if(['crab','wader'].includes(g.plan.style))assert.equal(b.speed,0,'Burrowing prey and mussels do not run away like mice');if(g.plan.style==='pike')assert.ok(m.phases.has('ambush')&&m.phases.has('pursuit'));}
  }else if(q.kind==='competition'){assert.ok(m.events.has('competition'),`Competition consumes the same finite resource: ${q.id}/${g.number} ${JSON.stringify({phase:g.plan.phase,seconds:g.plan.seconds,slots:g.plan.slots,stock:g.plan.patch.stock,actors:g.actors.map(a=>({species:a.species,x:a.x,z:a.z,flight:a.flight,activity:a.activity,blockedTime:a.blockedTime,desiredHeight:a.feedingHeight}))})}`);assert.ok(m.phases.has('retreat'),'The displaced competitor really moves');assert.ok(m.retreat>1,`Competitor physically yields: ${q.id}/${g.number}, distance ${m.retreat}`);}
  else if(q.kind==='mutualism'){assert.ok(m.flowerIds.size>=2,'Pollinator visits different actual plants');assert.ok(m.events.has('mutualism'),'Pollen transfer occurs only between separate plants');}
  else if(q.kind==='herbivory'){assert.ok(m.events.has('herbivory'));assert.ok(m.phases.has('visit')&&m.phases.has('approach'));assert.ok(m.path>1);}
  else if(q.kind==='dispersal'){for(const phase of ['visit','transport','cache'])assert.ok(m.phases.has(phase));assert.ok(m.events.has('seedCollection')&&m.events.has('dispersal'));assert.ok(a.lastCache&&Math.hypot(a.lastCache.x-g.plan.patch.x,a.lastCache.z-g.plan.patch.z)>3.8);}
  else{assert.ok(m.events.has('parasitism'));assert.ok(a.attachedHost===b&&a.parasiteIntake>0&&b.parasiteCost>0);assert.ok(Math.hypot(a.x-b.x,a.z-b.z)<ANIMALS[b.species].size);assert.ok((b.behaviorDistance||0)>1);}
 }
 report.push({scenario:mode.id,pairs:mode.quests.length,groups:metrics.size,kestrels:[...metrics].filter(([g])=>g.plan.style==='kestrel').map(([g,m])=>({habitat:g.quest.habitat,group:g.number,phases:[...m.phases],attempts:m.attempts,minAltitude:m.minFlight,maxAltitude:m.maxFlight,airborneFraction:m.flightFrames/m.frames,closestAttemptM:m.minContact})),phases:[...new Set([...metrics.values()].flatMap(m=>[...m.phases]))]});console.log(JSON.stringify(report.at(-1)));
}
// Tide hides the actual feeding ground: coastal birds use dry roosts, then return at ebb.
scenarios.start('competition',book);
const coastalGroups=[...scenarios.groups.values()].flat().filter(g=>g.quest.kind==='competition'&&['beach','wadden','saltmarsh'].includes(g.quest.habitat));
for(let n=0;n<1200;n++)for(const sim of simulations.values()){sim.externalTide=.4;sim.update(.05,null);}
const roosting=coastalGroups.flatMap(g=>g.actors).filter(a=>a.tideRoost);assert.ok(roosting.length>0,'High tide must actually interrupt flooded feeding grounds');
for(const a of roosting){const sim=simulations.get(a.habitat);assert.ok(sim.terrain(a.roostTarget.x,a.roostTarget.z)>-.1+sim.environment.tide+.05,'Roost must be above high water');assert.ok(a.activity!=='feeding','No feeding event while the feeding patch is flooded');assert.ok(Math.hypot(a.x-a.roostTarget.x,a.z-a.roostTarget.z)<.2,'The bird actually reaches the dry roost '+JSON.stringify({habitat:a.habitat,species:a.species,x:a.x,z:a.z,flight:a.flight,roost:a.roostTarget,d:Math.hypot(a.x-a.roostTarget.x,a.z-a.roostTarget.z),blocked:a.blockedTime,blocks:sim.nearbyBlockers(a.x,a.z,2,null).filter(p=>sim.overlapsBlocker(a.x,a.z,ANIMALS[a.species],a,p))}));}
for(let n=0;n<1600;n++)for(const sim of simulations.values()){sim.externalTide=-.7;sim.update(.05,null);}
assert.ok(roosting.every(a=>!a.tideRoost),'Birds resume their real feeding route at ebb');
// Close approach interrupts herbivory; feeding resumes only at the physical plant site.
scenarios.start('herbivory',book);const deerGroup=[...scenarios.groups.values()].flat().find(g=>g.quest.kind==='herbivory'&&g.quest.habitat==='forest'),deer=deerGroup.actors[0],forest=simulations.get('forest');
for(let n=0;n<2000&&deerGroup.plan.phase!=='visit';n++)forest.update(.05,null);assert.equal(deerGroup.plan.phase,'visit');const start={x:deer.x,z:deer.z};
for(let n=0;n<50;n++)forest.update(.05,start);assert.ok(deer.disturbedUntil>0);assert.ok(Math.hypot(deer.x-start.x,deer.z-start.z)>.8,'The host moves away from a nearby observer');
let returned=false;for(let n=0;n<2000;n++){forest.update(.05,null);if(deer.activity==='grazing'){assert.ok(Math.hypot(deer.x-deerGroup.plan.destination.x,deer.z-deerGroup.plan.destination.z)<.1,'Feeding requires return to the plant, not just an activity label');returned=true;break;}}assert.ok(returned,'Herbivory resumes after the disturbance');
// A kestrel disturbed near its prey climbs immediately, without freezing or landing.
scenarios.start('predation',book);const falconGroup=[...scenarios.groups.values()].flat().find(g=>g.plan?.style==='kestrel'&&g.quest.habitat==='meadow'),meadow=simulations.get('meadow'),falcon=falconGroup.actors[0];
for(let n=0;n<2000&&falconGroup.plan.phase!=='stoop';n++)meadow.update(.05,null);const flyBefore=falcon.behaviorDistance;for(let n=0;n<20;n++)meadow.update(.05,{x:falconGroup.actors[1].x,z:falconGroup.actors[1].z});assert.ok(falcon.flight>2.5);assert.ok(falcon.behaviorDistance>flyBefore+.5);assert.equal(falconGroup.plan.phase,'climb');
console.log(JSON.stringify({highTideRoosts:roosting.length,ebbReturn:true,disturbanceReturn:true,kestrelImmediateClimb:true}));
console.log(JSON.stringify({pairCases:SCENARIOS.reduce((n,s)=>n+s.quests.length,0),encounterGroups:SCENARIOS.reduce((n,s)=>n+s.quests.length*4,0),preservedIndividuals:before.size,secondsPerScenario:240,report},null,2));
