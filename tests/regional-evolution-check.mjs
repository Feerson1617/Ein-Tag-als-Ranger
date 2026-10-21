import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import { HabitatWorld } from '../dist/habitat-world.js';
import { createExpeditionSimulations } from '../dist/expedition-state.js';
import { EvolutionCollection, EVOLUTION_FACTORS } from '../dist/field-evolution.js';
import { ANIMALS } from '../dist/biodiversity.js';
THREE.TextureLoader.prototype.load=function(){return new THREE.Texture();};
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({measureText:text=>({width:text.length*20}),fillRect(){},fillText(){}})})};
const world=new HabitatWorld(new THREE.Scene()),{simulations}=createExpeditionSimulations(world,-.3),collection=new EvolutionCollection(simulations),report=[];
for(const factor of Object.keys(EVOLUTION_FACTORS)){
 collection.start(factor);
 for(const model of collection.activeModels)for(const a of model.adults())assert.ok(model.sim.passable(a.x,a.z,ANIMALS[a.species],a),factor+' starts inside an obstacle: '+model.sim.habitat);
 for(let n=0;n<3800;n++){collection.update(.1);for(const sim of simulations.values())sim.update(.1,null);}
 for(const model of collection.activeModels){
  assert.ok(model.evidence(factor),factor+' has no actual evidence in '+model.sim.habitat+': '+model.events.map(e=>e.kind).join(','));
  const births=model.events.filter(e=>e.kind==='birth');assert.ok(births.length>0);
  assert.equal(new Set(births.map(e=>e.child)).size,births.length,'Offspring must have distinct identities');
  if(factor==='geneFlow')assert.ok(model.events.some(e=>e.kind==='geneFlow'&&e.destination==='east'));
  if(factor==='isolation'){assert.equal(model.events.some(e=>e.kind==='geneFlow'),false);if(model.sim.habitat==='city'){const road=model.sim.blockers.find(p=>p.type==='permanentRoad'),event=model.events.find(e=>e.kind==='isolation');assert.ok(Math.abs(event.blockedAt.x-(road.x-road.halfX))<.5&&Math.abs(event.blockedAt.z-road.z)<road.halfZ,'City isolation must be caused by the visible permanent street');}}
  for(const a of model.pool)if(a.alive){assert.ok(Number.isFinite(a.x)&&Number.isFinite(a.z));assert.ok(model.sim.passable(a.x,a.z,ANIMALS[a.species],a));}
  report.push({factor,habitat:model.sim.habitat,species:model.species,generation:model.generation,births:births.length,evidence:true});
 }
 collection.stop();
}
assert.equal(report.length,21);console.log(JSON.stringify({actualRegionalModels:report},null,2));
