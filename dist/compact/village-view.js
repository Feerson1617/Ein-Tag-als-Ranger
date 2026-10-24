import * as THREE from '../vendor/three.module.js?revision=120';
import { GeometryBatch,stick } from './geometry.js';
import { SPEAKERS } from './village.js';
import { BUILDINGS,terrainHeight } from './layout.js';
export function createVillageView(scene){
 const b=new GeometryBatch(),box=new THREE.BoxGeometry(1,1,1),sphere=new THREE.SphereGeometry(1,10,7);
 for(const p of SPEAKERS){const y=terrainHeight(p.x,p.z),skin=p.id==='local'?'#bd8e6e':'#d1a283';
  b.add(box,p.color,[p.x,y+1.05,p.z],[.43,.58,.27]);
  b.add(sphere,skin,[p.x,y+1.52,p.z],[.13,.17,.12]);
  b.add(sphere,'#625847',[p.x,y+1.65,p.z],[.14,.06,.13]);
  for(const side of [-1,1]){stick(b,[p.x+side*.11,y+.79,p.z],[p.x+side*.12,y+.10,p.z+.015],.075,'#4e514a',.06);b.add(box,'#47483e',[p.x+side*.12,y+.065,p.z-.05],[.17,.13,.28]);stick(b,[p.x+side*.25,y+1.27,p.z],[p.x+side*.29,y+.88,p.z-.06],.07,p.color,.055);b.add(sphere,skin,[p.x+side*.29,y+.84,p.z-.06],[.06,.09,.06]);b.add(sphere,'#3c4035',[p.x+side*.045,y+1.54,p.z-.116],[.014,.015,.009]);}
 }
 // Modest settlement detail, all outside the walking corridor.
 for(const house of BUILDINGS){const y=terrainHeight(house.x,house.z);for(const side of [-1,1]){for(let row=0;row<5;row++)b.add(box,'#ae9277',[house.x,y+.3+row*.54,house.z+side*(house.d/2+.013)],[house.w-.15,.018,.024]);for(let k=0;k<3;k++){const x=house.x+(k-1)*house.w*.28;b.add(box,'#68664e',[x,y+.12,house.z+side*(house.d/2+.35)],[.8,.24,.30]);b.add(sphere,'#65784e',[x,y+.34,house.z+side*(house.d/2+.35)],[.48,.28,.3]);}}}
 const mesh=b.mesh();scene.add(mesh);return {mesh,blocks:SPEAKERS.map(p=>({x:p.x,z:p.z,r:.29}))};
}
