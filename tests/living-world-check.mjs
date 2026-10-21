import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {HabitatWorld,CENTERS,groundHeight} from '../dist/habitat-world.js';
import {createExpeditionSimulations} from '../dist/expedition-state.js';
import {ANIMALS} from '../dist/biodiversity.js';
import {WildlifeRenderer} from '../dist/wildlife.js';
import {audibleBirds,BIRD_RECORDINGS,FieldSoundscape} from '../dist/field-soundscape.js';
T.TextureLoader.prototype.load=function(){return new T.Texture();};
globalThis.document={createElement:()=>({getContext:()=>({measureText:s=>({width:s.length*20}),fillRect(){},fillText(){},beginPath(){},moveTo(){},lineTo(){},stroke(){}})})};
const world=new HabitatWorld(new T.Scene()),{simulations,agents}=createExpeditionSimulations(world,-.3);
assert.equal(world.residents.length,world.village.houses.length);assert.equal(new Set(world.residents.map(p=>p.house)).size,5);
for(const p of world.residents){assert.ok(Math.abs(p.y-world.terrainHeight(p.x,p.z))<.001,'Residents stand on the visible terrain triangles');assert.ok(world.canWalk(p.x+.8,p.z)||world.canWalk(p.x-.8,p.z));assert.ok(Math.hypot(p.x-CENTERS.city.x,p.z)<25);}
const keeper=world.residents.find(p=>p.role==='Imkerin');assert.equal(keeper.house,world.hives[0].house);assert.ok(Math.hypot(keeper.x-world.hives[0].x,keeper.z-world.hives[0].z)<2.2);
assert.ok(world.refuges.filter(r=>r.kind==='squirrel').length>=5);assert.equal(world.refuges.filter(r=>r.kind==='cormorant').length,4);
const originalIds=new Map(),activities=new Map();for(const habitat of ['forest','city','lake','beach']){const sim=simulations.get(habitat);sim.activateSpecies(['sciurus_vulgaris','phalacrocorax_carbo',...ANIMALS.phalacrocorax_carbo.prey]);for(const a of sim.agents)if(['sciurus_vulgaris','phalacrocorax_carbo'].includes(a.species)){originalIds.set(a,a.id);activities.set(a,new Set());}}
const renderer=new WildlifeRenderer(new T.Scene(),[...originalIds.keys()]);let drying=0,climbing=0;const huntAttempts=new Set();
for(let n=0;n<7200;n++){
 for(const habitat of ['forest','city','lake','beach']){const sim=simulations.get(habitat);sim.update(.05,null);for(const a of sim.agents){a.renderX=a.x+CENTERS[habitat].x;a.renderZ=a.z+CENTERS[habitat].z;if(!activities.has(a))continue;activities.get(a).add(a.activity);assert.equal(a.id,originalIds.get(a));assert.ok(sim.passable(a.x,a.z,ANIMALS[a.species],a),JSON.stringify({species:a.species,habitat,n,x:a.x,z:a.z,phase:a.refugePlan?.phase,slot:a.refugeSlot,blockers:sim.blockers.filter(b=>sim.overlapsBlocker(a.x,a.z,ANIMALS[a.species],a,b))}));if(a.poseY!=null)assert.ok(Number.isFinite(a.poseY));if(a.activity==='wingDrying'){drying++;assert.ok(Math.abs(a.poseY-a.refugeSlot.y)<.01);assert.ok(a.speed<.12);}if(a.climbing){climbing++;assert.ok(Math.hypot(a.x-a.refugeSlot.base.x,a.z-a.refugeSlot.base.z)<.2);}}for(const e of sim.events)if(e.species==='phalacrocorax_carbo'&&e.kind==='huntAttempt')huntAttempts.add(e.id);}
 if(n%4===0){renderer.update(groundHeight,()=>.06,null);for(const [a,states]of activities)if(a.activity==='wingDrying'&&a.refugePlan.clock>1){assert.ok(a.motion.air<.1,'Drying wings are not a flight pose');assert.ok(a.motion.swim<.1,'Resting on a rock is not swimming');}}
}
assert.ok(drying>100);assert.ok(climbing>100);assert.ok(huntAttempts.size>0,'A cormorant must actually reach live fish, not only display a hunting label');assert.ok([...activities].some(([a,s])=>a.species==='sciurus_vulgaris'&&s.has('restingNest')&&s.has('treeClimbing')));
assert.ok([...activities].some(([a,s])=>a.species==='phalacrocorax_carbo'&&s.has('wingDrying')&&s.has('hunting')));
const observer={x:0,z:0},bird={species:'parus_major',alive:true,x:4,z:0,speed:0,activity:'perching'};assert.equal(audibleBirds([bird],observer).length,1);assert.equal(audibleBirds([{...bird,dead:true,alive:false}],observer).length,0);assert.equal(audibleBirds([{...bird,scenarioSuppressed:true}],observer).length,0);assert.equal(audibleBirds([{...bird,activity:'fleeing'}],observer).length,0);assert.equal(audibleBirds([{...bird,x:50}],observer).length,0);assert.equal(Object.keys(BIRD_RECORDINGS).length,3);
// Regression: opening a fieldbook pauses ambient calls, but must not cancel the
// recording that the player deliberately starts inside that fieldbook.
const button={dataset:{},classList:{toggle(){}},setAttribute(){}};
const sound=new FieldSoundscape(button),node={connect(){},disconnect(){}},gainValue={setValueAtTime(){},linearRampToValueAtTime(){}};
sound.audio={currentTime:0,resume:async()=>{},createBufferSource(){return {...node,start(){},stop(){this.onended?.();}};},createGain:()=>({...node,gain:gainValue}),createStereoPanner:()=>({...node,pan:{value:0}})};
for(const key of Object.keys(BIRD_RECORDINGS))sound.buffers.set(key,{duration:25});
sound.enabled=true;await Promise.all(Array.from({length:8},()=>sound.play('turdus_merula')));assert.equal(sound.voices.size,2,'Asynchronous starts must respect the two-voice budget');
sound.update(.05,[],observer,false);assert.equal(sound.voices.size,0,'Ambient calls pause while reading');
sound.enabled=false;assert.equal(await sound.preview('turdus_merula'),true);sound.update(.05,[],observer,false);assert.equal(sound.voices.size,1,'Fieldbook listening continues while its panel is open');sound.stop();assert.equal(sound.voices.size,0);
console.log(JSON.stringify({residents:world.residents.length,keeperAtHive:true,cormorantRestingSlots:4,squirrelNests:world.refuges.filter(r=>r.kind==='squirrel').length,dryingFrames:drying,climbingFrames:climbing,actualCormorantHunts:huntAttempts.size,persistentIndividuals:originalIds.size,activities:[...activities].map(([a,states])=>({species:a.species,habitat:a.habitat,states:[...states]})),recordings:3,audio:'Only actual nearby, active birds; flight calls restricted to flying gulls'},null,2));
