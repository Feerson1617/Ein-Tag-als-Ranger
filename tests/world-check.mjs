import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import { HabitatWorld } from '../dist/habitat-world.js';
import { TRAIL_LENGTH, TRAIL_ENTRIES, trailPoint } from '../dist/trail.js';
import { CENTERS } from '../dist/habitat-world.js';
import { ANIMALS } from '../dist/biodiversity.js';
import { spaced, WORLD_BOUNDS } from '../dist/world-layout.js';
import { ExpeditionEcology } from '../dist/field-ecology.js';
THREE.TextureLoader.prototype.load=function(){return new THREE.Texture();};
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({measureText:text=>({width:text.length*20}),fillRect(){},fillText(){}})})};
const world=new HabitatWorld(new THREE.Scene());
assert.ok(world.boards.length===36);assert.equal(world.landings.length,world.boards.length);assert.ok(world.boards.filter(b=>b.habitat==='farmland').every(b=>b.station));
const guide=world.boards.find(b=>b.intro),spawn=TRAIL_ENTRIES.forest;
assert.ok(guide&&Math.hypot(guide.x-spawn.x,guide.z-spawn.z)<10);
for(let d=0;d<TRAIL_LENGTH;d+=.5){const p=trailPoint(d);assert.ok(world.canWalk(p.x,p.z),`Blocked boardwalk at ${Math.round(d)} m`);assert.ok(world.deckHeight(p.x,p.z)!=null);}
for(const p of world.plants)assert.equal(world.onLanding(p.x,p.z,0),false,`Plant inside platform: ${p.id}`);
for(const b of world.boards){
 const l=world.landingById.get(b.id);assert.ok(l);assert.ok(world.onLanding(b.x,b.z,0));
 const reachable=[0,1.4,-1.4].some(u=>{
  const p={x:l.x-l.tz*l.side*2.95+l.tx*u,z:l.z+l.tx*l.side*2.95+l.tz*u};
  return Array.from({length:16},(_,i)=>i/15).every(t=>world.canWalk(p.x+l.tz*l.side*2*t,p.z-l.tx*l.side*2*t));
 });
 assert.ok(reachable,`Inaccessible platform: ${b.id}`);
}
for(const id of ['city','farmland']){const c=CENTERS[id],entry=TRAIL_ENTRIES[id];assert.ok(world.canWalk(entry.x,entry.z));assert.ok(Array.from({length:30},(_,i)=>({x:c.x+spaced(-55+i%6*20),z:c.z+spaced(-55+Math.floor(i/6)*20)})).some(p=>world.canWalk(p.x,p.z)));if(id==='city')assert.ok(world.collisions.filter(p=>p.type==='house').every(p=>!world.canWalk(p.x,p.z)));if(id==='farmland')assert.equal(world.canWalk(c.x,WORLD_BOUNDS.north+1),false);else assert.equal(world.canWalk(WORLD_BOUNDS.west-1,c.z),false);}
for(const [id,c] of Object.entries(CENTERS)){
 const sim=new ExpeditionEcology(id,719);sim.setBlockers(world.collisions.filter(p=>Math.hypot(p.x-c.x,p.z-c.z)<105).map(p=>({...p,x:p.x-c.x,z:p.z-c.z})));
 for(let t=0;t<300;t++){sim.update(.1,null);for(const a of sim.agents)if(a.alive)assert.ok(!sim.blockers.some(b=>b.type==='board'&&sim.overlapsBlocker(a.x,a.z,ANIMALS[a.species],a,b)),`${id}: animal intersects sign`);}
}
console.log(JSON.stringify({boards:world.boards.length,platforms:world.landings.length,startGuide:'within reading distance at spawn',route:'entire centerline walkable at half-meter intervals',vegetation:'platform centers kept clear',boundaries:'city and farmland walkable; houses and outer edge blocked',animals:'no sign intersections during 30 seconds in each actual habitat',plants:world.plants.length,routeLength:TRAIL_LENGTH,regionalPlants:Object.fromEntries(Object.keys(CENTERS).map(id=>[id,world.plants.filter(p=>p.habitat===id).length])),wheat:world.plants.filter(p=>p.id==='triticum_aestivum').length},null,2));
