import * as THREE from './vendor/three.module.js?revision=120';
import { ANIMALS } from './biodiversity.js?revision=120';
import { CENTERS,groundHeight,waterHeight } from './habitat-world.js?revision=120';
import { layoutAxis } from './world-layout.js?revision=120';
import { nearestTrail } from './trail.js?revision=120';
import { SedimentExcavation } from './sediment-excavation.js?revision=120';
export const DIG_SPECIES=[
 ['peringia_ulvae',0],['littorina_littorea',0],['cerastoderma_edule',3],
 ['limecola_balthica',7],['scrobicularia_plana',10],['retusa_obtusa',5],
 ['hediste_diversicolor',15],['nephtys_hombergii',20],['mya_arenaria',25],['arenicola_marina',30]
];
// Fixed living specimens, revealed by depth, not randomly awarded catalogue entries.
export class WattSurvey {
 constructor(sim,world){this.sim=sim;this.world=world;this.spots=[];this.specimens=[];const c=CENTERS.wadden;
  for(const a of sim.agents)if(a.species==='arenicola_marina'){a.surveySpecimen=true;a.revealed=false;a.alive=false;}
  [[-36,-158],[-20,-165],[2,-171],[21,-170]].forEach(([x,z],i)=>{
   const p=nearestTrail(layoutAxis(x),layoutAxis(z));let spot=null;for(const side of [1,-1])for(const offset of [6.8,8.4,10]){const q={x:p.x+p.tz*side*offset,z:p.z-p.tx*side*offset};if(!spot&&!world.onLanding(q.x,q.z)&&!world.collisions.some(b=>Math.hypot(q.x-b.x,q.z-b.z)<b.r+1.5)&&groundHeight(q.x,q.z)>-.83)spot={...q,id:`probe-${i}`,depth:-1,index:i};}
   if(!spot)throw Error('No safe sample site');this.spots.push(spot);
   const marker=new THREE.Group(),ring=new THREE.Mesh(new THREE.TorusGeometry(.74,.018,4,32),world.material({color:'#8b8568',roughness:.92}));ring.rotation.x=Math.PI/2;ring.position.set(spot.x,world.terrainHeight(spot.x,spot.z)+.026,spot.z);marker.add(ring);world.root.add(marker);spot.marker=marker;
   const ids=DIG_SPECIES.filter((row,n)=>n%4===i||row[0]==='arenicola_marina'||i===1&&row[0]==='peringia_ulvae');ids.forEach(([species,depth],n)=>{const a=sim.spawn(species,0,0),angle=species==='retusa_obtusa'?.06:n*2.4;Object.assign(a,{x:spot.x-c.x+Math.cos(angle)*.28,z:spot.z-c.z+Math.sin(angle)*.28,offsetX:c.x,offsetZ:c.z,homeX:spot.x-c.x,homeZ:spot.z-c.z,surveySpecimen:true,revealed:false,alive:false,hiddenUntil:Infinity,sampleSpot:spot,burialDepth:depth,surveyY:groundHeight(spot.x,spot.z)+.02,activity:'resting'});this.specimens.push(a);});
  });this.excavation=new SedimentExcavation(world,this.spots);
 }
 nearest(observer){return this.spots.map(s=>({...s,distance:Math.hypot(s.x-observer.x,s.z-observer.z),original:s})).sort((a,b)=>a.distance-b.distance)[0];}
 canDig(observer,tide){const near=this.nearest(observer);if(near.distance>3.8)return{ok:false,reason:'Gehe vom Bohlenweg zur markierten Bodenprobe.',near};if(groundHeight(near.x,near.z)<=waterHeight(near.x,near.z,'wadden',tide)+.045)return{ok:false,reason:'Die Probe liegt unter Wasser. Stelle Niedrigwasser ein oder warte auf Ebbe.',near};return{ok:true,near};}
 dig(observer,depth,tide){const check=this.canDig(observer,tide);if(!check.ok)return{...check,revealed:[]};const spot=check.near.original;spot.depth=Math.max(spot.depth,Math.min(35,Math.max(0,Number(depth))));this.excavation.dig(spot,spot.depth);const revealed=[];
  for(const a of this.specimens.filter(a=>a.sampleSpot===spot&&!a.revealed&&a.burialDepth<=spot.depth)){a.revealed=true;a.alive=true;a.hiddenUntil=0;a.activity='resting';a.targetResource=null;a.target=null;a.stateTime=0;revealed.push(a);}
  return{ok:true,spot,revealed,depth:spot.depth};
 }
 update(dt){this.excavation.update(dt);for(const a of this.specimens){const x=a.x+a.offsetX,z=a.z+a.offsetZ;a.surveyY=this.world.terrainHeight(x,z)+.006;}}
}
